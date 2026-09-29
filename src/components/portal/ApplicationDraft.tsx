import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
export type DraftAnswers={motivation:string;preparation:string;availability:string;work_url:string};
export default function ApplicationDraft({callId,answers,onRestore,disabled=false}:{callId:string;answers:DraftAnswers;onRestore:(answers:DraftAnswers)=>void;disabled?:boolean}){
 const {user}=useAuth();const [revision,setRevision]=useState<number|null>(null),[ready,setReady]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false),[retry,setRetry]=useState(0);
 const busy=useRef(false),alive=useRef(true),lastSaved=useRef('');const serialized=JSON.stringify(answers);
 const draft=useQuery({queryKey:['application-draft',user?.id,callId],enabled:Boolean(user&&callId),retry:false,queryFn:async()=>{const {data,error}=await supabase.from('application_drafts').select('*').eq('user_id',user!.id).eq('call_id',callId).maybeSingle();if(error)throw error;return data;}});
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{if(draft.isSuccess&&!draft.data)setReady(true);},[draft.isSuccess,draft.data]);
 useEffect(()=>{
  if(!user||!ready||disabled||error||busy.current||lastSaved.current===serialized||!Object.values(answers).some(Boolean))return;
  const timer=setTimeout(()=>{busy.current=true;setSaving(true);setMessage('Saving private draft…');
   const payload=JSON.parse(serialized) as DraftAnswers;
   const query=revision===null?supabase.from('application_drafts').insert({call_id:callId,...payload}).select('*').single():supabase.from('application_drafts').update(payload).eq('user_id',user.id).eq('call_id',callId).eq('revision',revision).select('*').maybeSingle();
   void Promise.resolve(query).then(result=>{
    if(!alive.current)return;
    if(result.error||!result.data){setError(result.error?.code==='23505'||!result.error?'Draft changed in another session. Download your answers, then reload this page to choose the saved version.':'Draft save failed. Your answers remain on this page. Retry saving when connected.');setMessage('');}
    else{lastSaved.current=serialized;setRevision(result.data.revision);setMessage('Private draft saved to your account. Consent must be confirmed when submitting.');}
   },()=>{if(alive.current){setError('Draft save failed. Your answers remain on this page.');setMessage('');}}).finally(()=>{busy.current=false;if(alive.current){setSaving(false);setRetry(n=>n+1);}});
  },1000);return()=>clearTimeout(timer);
 },[serialized,answers,ready,disabled,error,revision,user,callId,retry]);
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify({call_id:callId,...answers},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='application-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(!callId)return null;
 return <div className="space-y-2 border rounded-md p-4"><h2 className="font-semibold">Private application draft</h2><p className="text-sm">Draft answers are saved to your account, visible only to you, and retained until you delete the draft or your account. A draft is not a submitted application.</p>{draft.isLoading&&<p role="status">Checking for a saved draft…</p>}{draft.error&&<p role="alert">Draft storage is unavailable. Submission remains separate; keep a download of your answers.</p>}{draft.data&&!ready&&<Button type="button" variant="outline" disabled={disabled} onClick={()=>{const {motivation,preparation,availability,work_url}=draft.data!;const saved={motivation,preparation,availability,work_url};lastSaved.current=JSON.stringify(saved);setRevision(draft.data!.revision);onRestore(saved);setReady(true);}}>Resume saved draft</Button>}<div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={download}>Download current answers</Button>{(revision!==null||draft.data)&&<Button type="button" variant="outline" disabled={saving} onClick={async()=>{if(!user||!window.confirm('Delete the saved draft? Your current answers remain on this page. Automatic saving will stop until you reload.'))return;const {data,error}=await supabase.from('application_drafts').delete().eq('user_id',user.id).eq('call_id',callId).eq('revision',revision??draft.data!.revision).select('call_id').maybeSingle();if(!error&&data){setReady(false);setRevision(null);setMessage('Draft deleted. Automatic saving is paused until you reload.');}else setError('Deletion could not be confirmed. Reload before retrying.');}}>Delete saved draft</Button>}{error&&<Button type="button" variant="outline" onClick={()=>{setError('');setRetry(n=>n+1);}}>Retry draft save</Button>}</div><p role="status">{message}</p>{error&&<p role="alert">{error}</p>}</div>;
}
