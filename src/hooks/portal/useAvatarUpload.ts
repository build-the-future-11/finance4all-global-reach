import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { validateImageFile } from "@/lib/fileValidation";

export function useAvatarUpload() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not signed in");

      const validation = await validateImageFile(file);
      if (!validation.ok) throw new Error(validation.error);

      const path = `${user.id}/avatar.${validation.ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: validation.mime });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase.rpc("set_my_avatar", {
        p_object_name: path,
        p_avatar_url: avatarUrl,
      });

      if (profileError) throw profileError;

      return avatarUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member-profiles"] });
    },
  });
}
