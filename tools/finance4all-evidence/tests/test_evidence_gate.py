"""Synthetic fixtures only. No findings about Finance4All's existing studies."""
import copy
import csv
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'research'))
from evidence_gate import audit, digest, timestamp


def fixture():
    rows = []
    for i, split in enumerate(('train','validation','test'),1):
        month = f'{i:02d}'
        rows.append(dict(row_id=f'synthetic-{i}',entity_id='SYNTHETIC-ASSET',split=split,
          feature_observed_at=f'2026-{month}-01T09:00:00Z',feature_available_at=f'2026-{month}-01T09:30:00Z',
          prediction_at=f'2026-{month}-01T10:00:00Z',label_end_at=f'2026-{month}-02T10:00:00Z',label_available_at=f'2026-{month}-02T11:00:00Z'))
    protocol = b'# Synthetic infrastructure fixture\nNot a scientific study or market dataset.\n'
    s=io.StringIO(newline='');w=csv.DictWriter(s,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows);raw=s.getvalue().encode()
    manifest=dict(version=1,evaluation_mode='fixed_holdout',study_id='SYNTHETIC-TEST-ONLY',
      data_source='Synthetic rows generated for infrastructure testing',license_note='Synthetic fixture created for this package',
      universe_policy='One fictional asset; no market-universe claim',turnover_definition='One-way traded notional / portfolio value',
      dataset_sha256=digest(raw),protocol_sha256=digest(protocol),
      fit_cutoff_at='2026-01-03T00:00:00Z',selection_cutoff_at='2026-02-03T00:00:00Z',
      costs={'one_way_bps':5,'stress_one_way_bps':20})
    return rows,manifest,raw,protocol


class EvidenceGateTests(unittest.TestCase):
    def setUp(self): self.rows,self.manifest,self.raw,self.protocol=fixture()
    def report(self): return audit(self.rows,self.manifest,digest(self.raw),digest(self.protocol))
    def rejected(self,code):
        r=self.report();self.assertEqual(r['status'],'FAIL');self.assertIn(code,[e['code'] for e in r['errors']])
    def test_clean_fixture(self): self.assertEqual(self.report()['status'],'PASS')
    def test_no_naive_timestamps(self):
        self.rows[0]['prediction_at']='2026-01-01T10:00:00';self.rejected('TIME')
    def test_missing_row_field(self):
        del self.rows[0]['label_available_at'];self.rejected('ROW_SCHEMA')
    def test_blank_entity(self): self.rows[0]['entity_id']=' ';self.rejected('ROW_SCHEMA')
    def test_duplicate_id(self): self.rows[1]['row_id']=self.rows[0]['row_id'];self.rejected('DUPLICATE_ID')
    def test_duplicate_event_normalizes_timezone(self):
        r=copy.deepcopy(self.rows[0]);r['row_id']='another';r['prediction_at']='2026-01-01T15:30:00+05:30';self.rows.append(r);self.rejected('DUPLICATE_EVENT')
    def test_future_feature(self): self.rows[0]['feature_available_at']='2026-01-01T10:01:00Z';self.rejected('LOOKAHEAD')
    def test_availability_before_observation(self): self.rows[0]['feature_available_at']='2026-01-01T08:00:00Z';self.rejected('OBSERVED_AFTER_AVAILABLE')
    def test_label_horizon(self): self.rows[0]['label_end_at']=self.rows[0]['prediction_at'];self.rejected('LABEL_HORIZON')
    def test_early_label(self): self.rows[0]['label_available_at']='2026-01-01T12:00:00Z';self.rejected('LABEL_AVAILABILITY')
    def test_unknown_split(self): self.rows[0]['split']='holdout';self.rejected('SPLIT')
    def test_empty_split(self): self.rows.pop();self.rejected('EMPTY_SPLIT')
    def test_overlapping_split_times(self): self.rows[1]['prediction_at']='2026-01-01T09:00:00Z';self.rejected('SPLIT_ORDER')
    def test_training_labels_cross_validation_start(self): self.rows[0]['label_available_at']='2026-02-01T10:00:00Z';self.rejected('LABEL_PURGE')
    def test_validation_labels_cross_test_start(self): self.rows[1]['label_available_at']='2026-03-01T10:00:00Z';self.rejected('LABEL_PURGE')
    def test_fit_before_training_labels_available(self): self.manifest['fit_cutoff_at']='2026-01-01T12:00:00Z';self.rejected('FIT_BEFORE_LABELS')
    def test_fit_at_evaluation_start(self): self.manifest['fit_cutoff_at']='2026-02-01T10:00:00Z';self.rejected('FIT_AFTER_EVAL')
    def test_selection_at_test_start(self): self.manifest['selection_cutoff_at']='2026-03-01T10:00:00Z';self.rejected('FIT_AFTER_EVAL')
    def test_hash_mismatch(self): self.manifest['dataset_sha256']='a'*64;self.rejected('HASH')
    def test_protocol_hash_mismatch(self): self.manifest['protocol_sha256']='b'*64;self.rejected('HASH')
    def test_unsupported_rolling_mode(self): self.manifest['evaluation_mode']='walk_forward';self.rejected('MODE')
    def test_empty_universe_policy(self): self.manifest['universe_policy']='TBD';self.rejected('METADATA')
    def test_missing_cost_assumptions(self): del self.manifest['costs'];self.rejected('COSTS')
    def test_negative_cost(self): self.manifest['costs']['one_way_bps']=-1;self.rejected('COST_VALUE')
    def test_bool_cost(self): self.manifest['costs']['one_way_bps']=True;self.rejected('COST_VALUE')
    def test_nonfinite_cost(self): self.manifest['costs']['one_way_bps']=float('nan');self.rejected('COST_VALUE')
    def test_no_stress(self): self.manifest['costs']['stress_one_way_bps']=5;self.rejected('COST_STRESS')
    def test_zero_cost_requires_reason(self): self.manifest['costs']['one_way_bps']=0;self.rejected('ZERO_COST')
    def test_zero_with_reason_and_stress(self):
        self.manifest['costs'].update(one_way_bps=0,zero_cost_reason='Synthetic frictionless comparator, not real execution.')
        self.assertEqual(self.report()['status'],'PASS')
    def test_timezone_equivalence(self): self.assertEqual(timestamp('2026-01-01T10:00:00Z'),timestamp('2026-01-01T15:30:00+05:30'))
    def test_empty_dataset(self): self.rows=[];self.rejected('ROW_COUNT')
    def test_bad_manifest_type(self): self.manifest=[];self.rejected('MANIFEST_TYPE')
    def test_cli_pass_fail_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);(root/'data.csv').write_bytes(self.raw);(root/'protocol.md').write_bytes(self.protocol)
            (root/'manifest.json').write_text(json.dumps(self.manifest))
            cmd=[sys.executable,str(ROOT/'research/evidence_gate.py'),'--data',str(root/'data.csv'),'--manifest',str(root/'manifest.json'),'--protocol',str(root/'protocol.md'),'--receipt',str(root/'receipt.json')]
            a=subprocess.run(cmd,capture_output=True,text=True);self.assertEqual(a.returncode,0,a.stderr);self.assertEqual(json.loads(a.stdout)['status'],'PASS')
            b=subprocess.run(cmd,capture_output=True,text=True);self.assertEqual(b.returncode,2)
            original=(root/'receipt.json').read_bytes();self.assertIn(b'PASS',original)
            self.manifest['dataset_sha256']='a'*64;(root/'manifest.json').write_text(json.dumps(self.manifest))
            c=subprocess.run(cmd[:-2],capture_output=True,text=True);self.assertEqual(c.returncode,1);self.assertEqual(json.loads(c.stdout)['status'],'FAIL')
    def test_cli_rejects_duplicate_csv_headers(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);(p/'d.csv').write_text('row_id,row_id\na,a\n');(p/'p.md').write_bytes(self.protocol);(p/'m.json').write_text(json.dumps(self.manifest))
            x=subprocess.run([sys.executable,str(ROOT/'research/evidence_gate.py'),'--data',str(p/'d.csv'),'--manifest',str(p/'m.json'),'--protocol',str(p/'p.md')],capture_output=True,text=True)
            self.assertEqual(x.returncode,2)

if __name__=='__main__': unittest.main(verbosity=2)
