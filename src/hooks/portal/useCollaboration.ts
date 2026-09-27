import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { requireConfirmedRow } from '@/lib/confirmed-mutation';
import type { Database,Tables } from '@/types/database';
type TaskInput=Database['public']['Tables']['project_tasks']['Insert'];
export function useCollaboration(projectId:string){
 const {user}=useAuth();const client=useQueryClient();
 const memberships=useQuery({queryKey:['project-memberships',user?.id,projectId],enabled:Boolean(user),queryFn:async()=>{let query=supabase.from('project_memberships').select('*');query=projectId?query.eq('project_id',projectId):query.eq('user_id',user!.id);const {data,error}=await query.order('updated_at',{ascending:false});if(error)throw error;return data;}});
 const tasks=useQuery({queryKey:['project-tasks',user?.id,projectId],enabled:Boolean(user&&projectId),queryFn:async()=>{const {data,error}=await supabase.from('project_tasks').select('*').eq('project_id',projectId).order('due_date',{nullsFirst:false}).order('id');if(error)throw error;return data;}});
 const refresh=async()=>{await Promise.all([client.invalidateQueries({queryKey:['project-memberships']}),client.invalidateQueries({queryKey:['project-tasks']}),client.invalidateQueries({queryKey:['notifications']})]);};
 const invite=useMutation({mutationFn:async(memberId:string)=>{const result=await supabase.from('project_memberships').insert({project_id:projectId,user_id:memberId}).select('*').single();return requireConfirmedRow(result,'Sending invitation');},onSuccess:refresh});
 const respond=useMutation({mutationFn:async({project_id,user_id,status,previous}:{project_id:string;user_id:string;status:Tables<'project_memberships'>['status'];previous:Tables<'project_memberships'>['status']})=>{const result=await supabase.from('project_memberships').update({status}).eq('project_id',project_id).eq('user_id',user_id).eq('status',previous).select('*').maybeSingle();return requireConfirmedRow(result,'Updating membership');},onSuccess:refresh});
 const createTask=useMutation({mutationFn:async(input:TaskInput)=>{const result=await supabase.from('project_tasks').insert(input).select('*').single();return requireConfirmedRow(result,'Creating task');},onSuccess:refresh});
 const updateTask=useMutation({mutationFn:async({id,revision,status,evidence_url}:{id:string;revision:number;status:Tables<'project_tasks'>['status'];evidence_url:string})=>{if(evidence_url){const u=new URL(evidence_url);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Use an HTTPS evidence link without credentials.');}const result=await supabase.from('project_tasks').update({status,evidence_url}).eq('id',id).eq('revision',revision).select('*').maybeSingle();if(!result.error&&!result.data)throw new Error('This task changed or access was removed. Reload before retrying.');return requireConfirmedRow(result,'Updating task');},onSuccess:refresh});
 return {memberships,tasks,invite,respond,createTask,updateTask};
}
