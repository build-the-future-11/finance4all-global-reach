"""Adversarial local files; no live finance data, accounts, or study outcomes."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from test_evidence_gate import fixture

ROOT = Path(__file__).resolve().parents[1]

class InputHardeningTests(unittest.TestCase):
    def run_cli(self, mutate=None, manifest_text=None, protocol=None, csv_text=None):
        rows, manifest, raw, original_protocol = fixture()
        if mutate:
            mutate(manifest)
        if protocol is not None:
            from evidence_gate import digest
            original_protocol = protocol
            manifest['protocol_sha256'] = digest(protocol)
        with tempfile.TemporaryDirectory() as directory:
            d=Path(directory)
            (d/'d.csv').write_bytes(raw if csv_text is None else csv_text.encode())
            (d/'p.md').write_bytes(original_protocol)
            (d/'m.json').write_text(json.dumps(manifest) if manifest_text is None else manifest_text)
            proc=subprocess.run([sys.executable, str(ROOT/'research/evidence_gate.py'), '--data',str(d/'d.csv'), '--manifest',str(d/'m.json'), '--protocol',str(d/'p.md')],capture_output=True,text=True)
        return proc
    def malformed(self, proc):
        self.assertEqual(proc.returncode, 2, proc.stdout + proc.stderr)
        self.assertNotIn('Traceback',proc.stderr)
        self.assertEqual(json.loads(proc.stderr)['status'],'ERROR')
    def duplicate(self, key, value):
        _,m,_,_=fixture(); return json.dumps(m)[:-1]+','+json.dumps(key)+':'+json.dumps(value)+'}'
    def test_duplicate_top_level_key(self): self.malformed(self.run_cli(manifest_text=self.duplicate('study_id','SYNTHETIC-TEST-ONLY')))
    def test_duplicate_nested_cost_key(self):
        _,m,_,_=fixture();text=json.dumps(m).replace('"one_way_bps": 5','"one_way_bps": 999, "one_way_bps": 5');self.malformed(self.run_cli(manifest_text=text))
    def test_nan_in_metadata(self): self.malformed(self.run_cli(manifest_text=self.duplicate('extra',float('nan'))))
    def test_infinity_in_metadata(self): self.malformed(self.run_cli(manifest_text=self.duplicate('extra',float('inf'))))
    def test_negative_infinity(self): self.malformed(self.run_cli(manifest_text=self.duplicate('extra',float('-inf'))))
    def test_float_overflow(self):
        _,m,_,_=fixture();self.malformed(self.run_cli(manifest_text=json.dumps(m)[:-1]+',"extra":1e9999}'))
    def test_huge_integer_cost_no_traceback(self):
        p=self.run_cli(mutate=lambda m: m['costs'].update(one_way_bps=10**400))
        self.assertEqual(p.returncode,1,p.stderr);self.assertEqual(json.loads(p.stdout)['status'],'FAIL');self.assertNotIn('Traceback',p.stderr)
    def test_version_float_rejected(self):
        p=self.run_cli(mutate=lambda m:m.update(version=1.0));self.assertEqual(p.returncode,1);self.assertIn('VERSION',[e['code'] for e in json.loads(p.stdout)['errors']])
    def test_empty_protocol(self): self.malformed(self.run_cli(protocol=b''))
    def test_whitespace_protocol(self): self.malformed(self.run_cli(protocol=b' \r\n\t'))
    def test_non_utf8_protocol(self): self.malformed(self.run_cli(protocol=b'\xff\xfeprotocol'))
    def test_nul_protocol(self): self.malformed(self.run_cli(protocol=b'abc\x00def'))
    def test_empty_csv_header(self):
        _,m,raw,p=fixture();text=raw.decode().replace('row_id,','row_id,,',1)
        self.malformed(self.run_cli(csv_text=text))
    def test_whitespace_csv_header(self):
        _,m,raw,p=fixture();text=raw.decode().replace('row_id,','row_id, ,',1)
        self.malformed(self.run_cli(csv_text=text))
    def test_missing_csv_header_contract(self): self.malformed(self.run_cli(csv_text='some_column\nhello\n'))
    def test_unterminated_csv_quote(self):
        _,_,raw,_=fixture();text=raw.decode().splitlines()[0]+'\n"unterminated';self.malformed(self.run_cli(csv_text=text))
    def test_deeply_nested_json_no_traceback(self): self.malformed(self.run_cli(manifest_text='['*1500+'0'+']'*1500))
    def test_object_metadata_nesting_limit(self):
        _,m,_,_=fixture(); text=json.dumps(m)[:-1]+',"extra":'+'['*66+'0'+']'*66+'}'
        self.malformed(self.run_cli(manifest_text=text))
    def test_valid_unknown_metadata_preserved(self):
        p=self.run_cli(mutate=lambda m:m.update(extra={'review_note':'not approval','tags':['synthetic']}));self.assertEqual(p.returncode,0,p.stderr)
    def test_all_existing_baseline_inputs_still_pass(self): self.assertEqual(self.run_cli().returncode,0)

if __name__=='__main__': unittest.main(verbosity=2)
