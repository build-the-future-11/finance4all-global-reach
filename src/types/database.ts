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
  | "lab_application_received";

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
          category: NewsCategory;
          source_url: string | null;
          published_at: string;
          is_published: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news_articles"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_articles"]["Insert"]>;
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
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["studio_submissions"]["Row"], "id" | "submitted_at"> & {
          id?: string;
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
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["essay_submissions"]["Row"], "id" | "submitted_at"> & {
          id?: string;
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
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
