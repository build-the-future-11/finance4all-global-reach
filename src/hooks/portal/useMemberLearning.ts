import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { requireConfirmedRow } from '@/lib/confirmed-mutation';
export function useMemberLearning(){
 const {user}=useAuth();const client=useQueryClient();
 const records=useQuery({queryKey:['member-learning',user?.id],enabled:Boolean(user),queryFn:async()=>{const {data,error}=await supabase.from('member_learning').select('*').eq('user_id',user!.id).order('updated_at',{ascending:false});if(error)throw error;return data;}});
 const save=useMutation({mutationFn:async({lessonId,completed,notes,revision}:{lessonId:string;completed:boolean;notes:string;revision:number|null})=>{
  if(!user)throw new Error('Sign in to save learning.');if(notes.length>12000)throw new Error('Notes must be at most 12,000 characters.');
  const result=revision===null?await supabase.from('member_learning').insert({lesson_id:lessonId,completed,notes}).select('*').single():await supabase.from('member_learning').update({completed,notes}).eq('user_id',user.id).eq('lesson_id',lessonId).eq('revision',revision).select('*').maybeSingle();
  if(result.error?.code==='23505'||(!result.error&&!result.data))throw new Error('This lesson changed in another session. Reload the saved version before retrying. Your current notes are still here.');
  requireConfirmedRow(result,'Saving learning');return result.data!;
 },onSuccess:()=>client.invalidateQueries({queryKey:['member-learning',user?.id]})});
 return {records,save};
}
