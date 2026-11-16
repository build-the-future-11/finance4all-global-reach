import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
export default function ApplicationHistory({submissionId}:{submissionId:string}){
 const {user}=useAuth();const history=useQuery({queryKey:['intake-history',user?.id,submissionId],enabled:Boolean(user),queryFn:async()=>{const {data,error}=await supabase.from('intake_history').select('*').eq('submission_id',submissionId).order('recorded_at').order('id');if(error)throw error;return data;}});
 return <details><summary>Application timeline</summary>{history.isLoading&&<p role="status">Loading history…</p>}{history.error&&<p role="alert">History is unavailable. The current application status remains above.</p>}{history.isSuccess&&!history.data.length&&<p>No historical events were recorded for this submission. Earlier decisions are not reconstructed.</p>}<ol>{history.data?.map(item=><li key={item.id}><time dateTime={item.recorded_at}>{new Date(item.recorded_at).toLocaleString()}</time> — {item.status.replaceAll('_',' ')}{item.note&&<p>{item.note}</p>}</li>)}</ol></details>;
}
