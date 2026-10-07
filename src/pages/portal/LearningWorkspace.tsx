import { useState } from 'react';
import { Link } from 'react-router-dom';
import { editorialExplainers } from '@/content/editorial';
import { useMemberLearning } from '@/hooks/portal/useMemberLearning';
import { PortalPageHeader, PortalCard, QueryStatus } from '@/components/portal/PortalUI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Tables } from '@/types/database';
import { useAuth } from '@/contexts/useAuth';

function LessonRecord({lesson,saved,onReload,onSave,pending}:{lesson:typeof editorialExplainers[number];saved?:Tables<'member_learning'>;onReload:()=>void;onSave:(v:{lessonId:string;completed:boolean;notes:string;revision:number|null})=>Promise<unknown>;pending:boolean}){
 const [notes,setNotes]=useState(saved?.notes??''),[completed,setCompleted]=useState(saved?.completed??false),[revision,setRevision]=useState(saved?.revision??null),[message,setMessage]=useState(''),[error,setError]=useState('');
 return <PortalCard className="space-y-3 p-5"><h2 className="text-xl font-semibold"><Link to={'/portal/debriefed/explainers/'+lesson.slug}>{lesson.title}</Link></h2><p>{lesson.dek}</p><p>{lesson.readMinutes} minutes · Self-reported reading progress</p><label className="flex items-center gap-3"><input type="checkbox" checked={completed} onChange={e=>setCompleted(e.target.checked)}/>I have read this lesson</label><label className="block">Private notes<Textarea value={notes} maxLength={12000} onChange={e=>setNotes(e.target.value)} rows={5}/></label><div className="flex flex-wrap gap-3"><Button disabled={pending} onClick={async()=>{setError('');setMessage('');try{const row=await onSave({lessonId:lesson.slug,completed,notes,revision}) as Tables<'member_learning'>;setRevision(row.revision);setMessage('Saved to your account.');}catch(e){setError(e instanceof Error?e.message:'Saving failed. Your notes remain here.');}}}>Save progress & notes</Button><Button variant="outline" disabled={pending} onClick={()=>{if(window.confirm('Discard unsaved edits and reload this lesson from your account?'))onReload();}}>Reload saved version</Button></div><p role="status">{message}</p>{error&&<p role="alert">{error}</p>}</PortalCard>;
}
export default function LearningWorkspace(){
 const {user}=useAuth();const {records,save}=useMemberLearning();const [selected,setSelected]=useState(''),[generation,setGeneration]=useState(0);
 const completed=records.data?.filter(r=>r.completed&&editorialExplainers.some(l=>l.slug===r.lesson_id))??[];
 const next=editorialExplainers.find(l=>!completed.some(r=>r.lesson_id===l.slug));
 function exportNotes(){const url=URL.createObjectURL(new Blob([JSON.stringify(records.data??[],null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='my-learning-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div className="space-y-6"><PortalPageHeader title="Your learning" description="Continue reading and keep private notes. Saved progress follows your account across devices; it is not a qualification or assessment."/>
 <QueryStatus isLoading={records.isLoading} error={records.error} onRetry={()=>void records.refetch()}><p>{completed.length} of {editorialExplainers.length} lessons marked read.</p>{next&&<Link className="underline" to={'/portal/debriefed/explainers/'+next.slug}>Continue learning: {next.title}</Link>}<p className="text-sm text-muted-foreground">Notes and reading records are private to your account and deleted with it. Changes are saved only when you choose Save.</p><Button variant="outline" onClick={exportNotes}>Export learning records</Button><label className="block">Lesson<select className="block w-full border rounded-md bg-background p-3" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a lesson</option>{editorialExplainers.map(l=><option key={l.slug} value={l.slug}>{l.title}</option>)}</select></label>{editorialExplainers.filter(l=>l.slug===selected).map(l=><LessonRecord key={`${user?.id}-${l.slug}-${generation}`} lesson={l} saved={records.data?.find(r=>r.lesson_id===l.slug)} pending={save.isPending} onSave={save.mutateAsync} onReload={()=>{void records.refetch().then(r=>{if(!r.error)setGeneration(g=>g+1);});}}/>)}</QueryStatus></div>;
}
