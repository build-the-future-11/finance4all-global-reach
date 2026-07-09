export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "member" | "lead_researcher" | "admin";
export type NewsCategory = "macro" | "markets" | "ipo" | "company";
export type ResearchProjectStatus = "draft" | "open" | "reviewing" | "closed";
export type LabApplicationStatus = "pending" | "under_review" | "accepted" | "rejected";
export type OpportunityType = "internship" | "program" | "challenge" | "project_role";
export type EventStatus = "upcoming" | "live" | "completed";
export type ConnectionStatus = "pending" | "accepted" | "declined";
export type ExplainerDifficulty = "beginner" | "intermediate";

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
          updated_at: string;
        };
        Insert: {
          user_id: string;
          weekly_digest_enabled?: boolean;
          substack_subscribed?: boolean;
          preferred_categories?: NewsCategory[];
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
    };
    Views: {
      essay_submissions_with_counts: {
        Row: Database["public"]["Tables"]["essay_submissions"]["Row"] & { upvote_count: number };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
