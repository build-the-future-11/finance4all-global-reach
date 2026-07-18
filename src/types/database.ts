export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "member" | "lead_researcher" | "admin";
export type NewsCategory = "macro" | "markets" | "ipo" | "company";
export type ResearchProjectStatus = "draft" | "open" | "reviewing" | "closed";
export type LabApplicationStatus = "pending" | "under_review" | "accepted" | "rejected";
export type OpportunityType = "internship" | "program" | "challenge" | "project_role";
export type EventStatus = "upcoming" | "live" | "completed";
export type ConnectionStatus = "pending" | "accepted" | "declined";
export type ExplainerDifficulty = "beginner" | "intermediate";
export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "lab_application_status"
  | "lab_application_received"
  | "studio_submission_status"
  | "essay_submission_status";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          role: UserRole;
          bio: string | null;
          avatar_url: string | null;
          interests: string[];
          open_to_collaborate: boolean;
          chapter_id: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          email: string;
          role?: UserRole;
          bio?: string | null;
          avatar_url?: string | null;
          interests?: string[];
          open_to_collaborate?: boolean;
          chapter_id?: string | null;
          onboarding_completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      chapters: {
        Row: {
          id: string;
          name: string;
          city: string;
          country: string;
          latitude: number;
          longitude: number;
          member_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chapters"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          summary: string;
          body: string;
          category: NewsCategory;
          source_url: string | null;
          source_id: string | null;
          source_published_at: string | null;
          topics: string[];
          regions: string[];
          importance: number;
          status: "draft" | "in_review" | "scheduled" | "published" | "corrected" | "archived";
          published_at: string;
          is_published: boolean;
          newsletter_include: boolean;
          ai_assisted: boolean;
          disclaimer_version: string;
          tags: string[];
          author_id: string | null;
          editor_id: string | null;
          scheduled_for: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news_articles"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          body?: string;
          status?: Database["public"]["Tables"]["news_articles"]["Row"]["status"];
          topics?: string[];
          regions?: string[];
          importance?: number;
          newsletter_include?: boolean;
          ai_assisted?: boolean;
          disclaimer_version?: string;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["news_articles"]["Insert"]>;
      };
      approved_sources: {
        Row: {
          id: string;
          name: string;
          homepage_url: string;
          allowed_domains: string[];
          notes: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["approved_sources"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          allowed_domains?: string[];
          notes?: string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["approved_sources"]["Insert"]>;
      };
      news_article_versions: {
        Row: {
          id: string;
          article_id: string;
          version: number;
          snapshot: Json;
          changed_by: string | null;
          change_note: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news_article_versions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
      debrief_ai_generation_logs: {
        Row: {
          id: string;
          article_id: string | null;
          model: string;
          prompt_hash: string;
          source_ids: string[];
          output_excerpt: string;
          structured_output: Json;
          status: "queued" | "completed" | "failed" | "rejected" | "applied";
          error_message: string | null;
          created_by: string | null;
          created_at: string;
          used_in_publish: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["debrief_ai_generation_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          used_in_publish?: boolean;
          structured_output?: Json;
          output_excerpt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["debrief_ai_generation_logs"]["Insert"]>;
      };
      member_certificates: {
        Row: {
          id: string;
          user_id: string;
          curriculum_key: string;
          title: string;
          verification_code: string;
          lesson_ids: string[];
          issued_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["member_certificates"]["Row"], "id" | "issued_at"> & {
          id?: string;
          issued_at?: string;
          lesson_ids?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["member_certificates"]["Insert"]>;
      };
      chapter_leaders: {
        Row: {
          chapter_id: string;
          user_id: string;
          role: "lead" | "co_lead" | "coordinator";
          appointed_at: string;
          appointed_by: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["chapter_leaders"]["Row"], "appointed_at"> & {
          appointed_at?: string;
          appointed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_leaders"]["Insert"]>;
      };
      competitions: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: "draft" | "open" | "closed" | "archived";
          chapter_id: string | null;
          opportunity_id: string | null;
          starts_at: string | null;
          ends_at: string | null;
          registration_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["competitions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          status?: "draft" | "open" | "closed" | "archived";
        };
        Update: Partial<Database["public"]["Tables"]["competitions"]["Insert"]>;
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: "studio" | "essay" | "introduction" | "news" | "profile" | "other";
          target_id: string | null;
          reason: string;
          details: string | null;
          status: "open" | "reviewing" | "resolved" | "dismissed";
          created_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["content_reports"]["Row"], "id" | "created_at" | "status" | "resolved_at" | "resolved_by" | "resolution_note"> & {
          id?: string;
          created_at?: string;
          status?: "open" | "reviewing" | "resolved" | "dismissed";
        };
        Update: Partial<Database["public"]["Tables"]["content_reports"]["Insert"]> & {
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
        };
      };
      explainer_cards: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          difficulty: ExplainerDifficulty;
          related_terms: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["explainer_cards"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["explainer_cards"]["Insert"]>;
      };
      digest_preferences: {
        Row: {
          user_id: string;
          weekly_digest_enabled: boolean;
          substack_subscribed: boolean;
          preferred_categories: NewsCategory[];
          last_digest_sent_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          weekly_digest_enabled?: boolean;
          substack_subscribed?: boolean;
          preferred_categories?: NewsCategory[];
          last_digest_sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["digest_preferences"]["Insert"]>;
      };
      research_projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: ResearchProjectStatus;
          lead_researcher_id: string;
          tags: string[];
          application_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["research_projects"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["research_projects"]["Insert"]>;
      };
      lab_applications: {
        Row: {
          id: string;
          project_id: string;
          applicant_id: string;
          status: LabApplicationStatus;
          motivation: string;
          submitted_at: string;
          reviewed_at: string | null;
          reviewer_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["lab_applications"]["Row"], "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lab_applications"]["Insert"]>;
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          organization: string;
          type: OpportunityType;
          description: string;
          application_url: string | null;
          deadline: string | null;
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["opportunities"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Insert"]>;
      };
      opportunity_interests: {
        Row: { opportunity_id: string; user_id: string; created_at: string };
        Insert: { opportunity_id: string; user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["opportunity_interests"]["Insert"]>;
      };
      studio_submissions: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          repo_url: string | null;
          demo_url: string | null;
          writeup: string;
          status: "pending" | "approved" | "rejected" | "archived";
          moderated_at: string | null;
          moderated_by: string | null;
          moderation_note: string | null;
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["studio_submissions"]["Row"], "id" | "submitted_at" | "status" | "moderated_at" | "moderated_by" | "moderation_note"> & {
          id?: string;
          status?: "pending" | "approved" | "rejected" | "archived";
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["studio_submissions"]["Insert"]>;
      };
      essay_submissions: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          body: string;
          is_editorial_pick: boolean;
          status: "pending" | "approved" | "rejected" | "archived";
          moderated_at: string | null;
          moderated_by: string | null;
          moderation_note: string | null;
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["essay_submissions"]["Row"], "id" | "submitted_at" | "status" | "moderated_at" | "moderated_by" | "moderation_note"> & {
          id?: string;
          status?: "pending" | "approved" | "rejected" | "archived";
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["essay_submissions"]["Insert"]>;
      };
      essay_upvotes: {
        Row: { essay_id: string; user_id: string; created_at: string };
        Insert: { essay_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["essay_upvotes"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          chapter_id: string;
          title: string;
          description: string;
          status: EventStatus;
          starts_at: string;
          ends_at: string | null;
          registration_url: string | null;
          registration_opens_at: string | null;
          registration_closes_at: string | null;
          registration_capacity: number | null;
          program_links: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      event_registrations: {
        Row: { event_id: string; user_id: string; created_at: string };
        Insert: { event_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Insert"]>;
      };
      connection_requests: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          status: ConnectionStatus;
          message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["connection_requests"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["connection_requests"]["Insert"]>;
      };
      introduction_posts: {
        Row: {
          id: string;
          author_id: string;
          headline: string;
          looking_for: string;
          interests: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["introduction_posts"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["introduction_posts"]["Insert"]>;
      };
      news_bookmarks: {
        Row: { user_id: string; article_id: string; created_at: string };
        Insert: { user_id: string; article_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["news_bookmarks"]["Insert"]>;
      };
      project_bookmarks: {
        Row: { user_id: string; project_id: string; created_at: string };
        Insert: { user_id: string; project_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["project_bookmarks"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at" | "read"> & {
          id?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      education_lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["education_lesson_progress"]["Insert"]>;
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: "new" | "read" | "archived";
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: "new" | "read" | "archived";
        };
        Update: Partial<Pick<Database["public"]["Tables"]["contact_submissions"]["Row"], "status">>;
      };
      digest_send_log: {
        Row: {
          id: string;
          user_id: string;
          sent_at: string;
          period_start: string;
          status: "sent" | "failed" | "skipped";
          article_count: number;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          sent_at?: string;
          period_start?: string;
          status: "sent" | "failed" | "skipped";
          article_count?: number;
          error_message?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["digest_send_log"]["Insert"]>;
      };
      product_analytics_events: {
        Row: {
          id: string;
          user_id: string;
          event_name: string;
          properties: Json;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_name: string;
          properties?: Json;
          occurred_at?: string;
        };
        Update: never;
      };
      client_error_events: {
        Row: {
          id: string;
          user_id: string;
          error_name: string;
          message: string;
          tags: Json;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          error_name: string;
          message: string;
          tags?: Json;
          occurred_at?: string;
        };
        Update: never;
      };
      education_modules: {
        Row: {
          id: string;
          title: string;
          eyebrow: string;
          description: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          inclusive_note: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["education_modules"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["education_modules"]["Insert"]>;
      };
      education_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          duration_min: number;
          summary: string;
          objectives: string[];
          body: string;
          exercise: string;
          key_terms: string[];
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["education_lessons"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["education_lessons"]["Insert"]>;
      };
      resource_items: {
        Row: {
          id: string;
          type: "curriculum" | "journal" | "podcast" | "toolkit" | "partner" | "webinar";
          title: string;
          description: string;
          href: string;
          tags: string[];
          free: boolean;
          external: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resource_items"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resource_items"]["Insert"]>;
      };
      resource_guides: {
        Row: {
          id: string;
          title: string;
          summary: string;
          body: string;
          checklist: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resource_guides"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resource_guides"]["Insert"]>;
      };
      webinars: {
        Row: {
          id: string;
          title: string;
          host: string;
          recurrence_label: string;
          description: string;
          href: string;
          starts_at: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["webinars"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["webinars"]["Insert"]>;
      };
      testimonials: {
        Row: {
          id: string;
          quote: string;
          attribution: string;
          role_label: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };
      weekly_goal_baselines: {
        Row: {
          user_id: string;
          week_start: string;
          saved_articles: number;
          connections: number;
          completed_lessons: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weekly_goal_baselines"]["Row"], "updated_at"> & {
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weekly_goal_baselines"]["Insert"]>;
      };
      rate_limit_events: {
        Row: {
          id: string;
          action: string;
          identifier: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rate_limit_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      essay_submissions_with_counts: {
        Row: Database["public"]["Tables"]["essay_submissions"]["Row"] & { upvote_count: number };
      };
      member_directory: {
        Row: Omit<Database["public"]["Tables"]["profiles"]["Row"], "email" | "onboarding_completed_at">;
      };
    };
    Functions: {
      check_rate_limit: {
        Args: { p_action: string; p_identifier: string; p_max_attempts: number; p_window_seconds: number };
        Returns: boolean;
      };
      complete_profile_onboarding: {
        Args: { p_display_name: string; p_bio?: string | null; p_interests?: string[]; p_open_to_collaborate?: boolean; p_chapter_id?: string | null };
        Returns: undefined;
      };
      ensure_my_profile: { Args: Record<PropertyKey, never>; Returns: undefined };
      portal_search: { Args: { p_query: string; p_limit?: number }; Returns: unknown[] };
      record_rate_limit: { Args: { p_action: string; p_identifier: string }; Returns: undefined };
      submit_contact_submission: {
        Args: { p_name: string; p_email: string; p_subject: string; p_message: string };
        Returns: string;
      };
      update_my_profile: {
        Args: {
          p_display_name: string;
          p_bio?: string | null;
          p_interests?: string[];
          p_open_to_collaborate?: boolean;
          p_chapter_id?: string | null;
        };
        Returns: undefined;
      };
      set_my_avatar: {
        Args: { p_object_name: string; p_avatar_url: string };
        Returns: string;
      };
      track_product_event: {
        Args: { p_event_name: string; p_properties?: Json };
        Returns: string;
      };
      report_client_error: {
        Args: { p_error_name: string; p_message: string; p_tags?: Json };
        Returns: string;
      };
      publish_news_article: {
        Args: { p_article_id: string; p_change_note?: string; p_ai_log_id?: string };
        Returns: Database["public"]["Tables"]["news_articles"]["Row"];
      };
      transition_news_article_status: {
        Args: {
          p_article_id: string;
          p_new_status: Database["public"]["Tables"]["news_articles"]["Row"]["status"];
          p_change_note?: string;
          p_ai_log_id?: string;
        };
        Returns: Database["public"]["Tables"]["news_articles"]["Row"];
      };
      queue_debrief_ai_generation: {
        Args: {
          p_prompt_hash: string;
          p_source_ids?: string[];
          p_article_id?: string;
          p_model?: string;
        };
        Returns: string;
      };
      record_news_article_version: {
        Args: { p_article_id: string; p_change_note?: string };
        Returns: number;
      };
      moderate_studio_submission: {
        Args: {
          p_id: string;
          p_status: Database["public"]["Tables"]["studio_submissions"]["Row"]["status"];
          p_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["studio_submissions"]["Row"];
      };
      moderate_essay_submission: {
        Args: {
          p_id: string;
          p_status: Database["public"]["Tables"]["essay_submissions"]["Row"]["status"];
          p_note?: string | null;
          p_editorial_pick?: boolean | null;
        };
        Returns: Database["public"]["Tables"]["essay_submissions"]["Row"];
      };
      issue_my_curriculum_certificate: {
        Args: { p_curriculum_key: string; p_title: string; p_lesson_ids: string[] };
        Returns: Database["public"]["Tables"]["member_certificates"]["Row"];
      };
      appoint_chapter_leader: {
        Args: {
          p_chapter_id: string;
          p_user_id: string;
          p_role?: Database["public"]["Tables"]["chapter_leaders"]["Row"]["role"];
        };
        Returns: Database["public"]["Tables"]["chapter_leaders"]["Row"];
      };
      remove_chapter_leader: {
        Args: { p_chapter_id: string; p_user_id: string };
        Returns: undefined;
      };
      submit_content_report: {
        Args: {
          p_target_type: Database["public"]["Tables"]["content_reports"]["Row"]["target_type"];
          p_reason: string;
          p_target_id?: string | null;
          p_details?: string | null;
        };
        Returns: string;
      };
      resolve_content_report: {
        Args: {
          p_id: string;
          p_status: Database["public"]["Tables"]["content_reports"]["Row"]["status"];
          p_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["content_reports"]["Row"];
      };
      my_chapter_leader_snapshot: {
        Args: Record<PropertyKey, never>;
        Returns: {
          chapter_id: string;
          chapter_name: string;
          city: string;
          country: string;
          member_count: number;
          leader_role: Database["public"]["Tables"]["chapter_leaders"]["Row"]["role"];
          upcoming_events: number;
          open_competitions: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      news_category: NewsCategory;
      research_project_status: ResearchProjectStatus;
      lab_application_status: LabApplicationStatus;
      opportunity_type: OpportunityType;
      event_status: EventStatus;
      connection_status: ConnectionStatus;
      explainer_difficulty: ExplainerDifficulty;
      notification_type: NotificationType;
      submission_moderation_status: "pending" | "approved" | "rejected" | "archived";
      chapter_leader_role: "lead" | "co_lead" | "coordinator";
      competition_status: "draft" | "open" | "closed" | "archived";
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
