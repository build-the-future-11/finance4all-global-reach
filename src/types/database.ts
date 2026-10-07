import type { IntakeCall, IntakeSubmission } from "@/lib/intake";
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "member" | "lead_researcher" | "admin";
export type NewsCategory = "macro" | "markets" | "ipo" | "company";
export type ResearchProjectStatus = "draft" | "open" | "reviewing" | "closed";
export type LabApplicationStatus = "pending" | "under_review" | "accepted" | "rejected";
export type OpportunityType = "internship" | "program" | "challenge" | "project_role";
export type EventStatus = "upcoming" | "live" | "completed";
export type ConnectionStatus = "pending" | "accepted" | "declined";
export type ExplainerDifficulty = "beginner" | "intermediate";
export type AccountDeletionStatus = "pending" | "in_progress" | "cancelled" | "rejected";
export type NotificationType =
  | "project_task"
  | "intake_status"
  | "connection_request"
  | "connection_accepted"
  | "lab_application_status"
  | "lab_application_received";

interface DatabaseDefinition {
  public: {
    Tables: {
      project_memberships: {
        Row: {project_id:string;user_id:string;invited_by:string;status:'invited'|'active'|'declined'|'left'|'removed';updated_at:string};
        Insert: {project_id:string;user_id:string};
        Update: {status:'invited'|'active'|'declined'|'left'|'removed'};
      };
      project_tasks: {
        Row: {id:string;project_id:string;title:string;description:string;assignee_id:string|null;due_date:string|null;kind:'task'|'milestone';status:'todo'|'in_progress'|'submitted'|'done';evidence_url:string;revision:number;updated_at:string};
        Insert: {project_id:string;title:string;description?:string;assignee_id?:string|null;due_date?:string|null;kind?:'task'|'milestone'};
        Update: {title?:string;description?:string;assignee_id?:string|null;due_date?:string|null;status?:'todo'|'in_progress'|'submitted'|'done';evidence_url?:string};
      };
      member_learning: {
        Row: {user_id:string;lesson_id:string;completed:boolean;notes:string;revision:number;updated_at:string};
        Insert: {lesson_id:string;completed?:boolean;notes?:string};
        Update: {completed?:boolean;notes?:string};
      };
      application_drafts: {
        Row: {user_id:string;call_id:string;motivation:string;preparation:string;availability:string;work_url:string;revision:number;updated_at:string};
        Insert: {call_id:string;motivation:string;preparation:string;availability:string;work_url:string};
        Update: {motivation?:string;preparation?:string;availability?:string;work_url?:string};
      };
      intake_history: {
        Row: {id:number;submission_id:string;status:string;note:string;recorded_at:string};
        Insert: never;
        Update: never;
      };
      intake_calls: {
        Row: IntakeCall;
        Insert: Omit<IntakeCall, "created_at">;
        Update: Partial<Omit<IntakeCall, "id" | "created_at">>;
      };
      intake_submissions: {
        Row: IntakeSubmission;
        Insert: Pick<IntakeSubmission, "id" | "call_id" | "motivation" | "preparation" | "availability" | "work_url" | "privacy_version" | "consent">;
        Update: Partial<Pick<IntakeSubmission, "status" | "review_note">>;
      };
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
        Insert: Omit<Database["public"]["Tables"]["news_articles"]["Row"], "id" | "created_at" | "published_at"> & Partial<Pick<Database["public"]["Tables"]["news_articles"]["Row"], "published_at">> & {
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
        Insert: Omit<Database["public"]["Tables"]["explainer_cards"]["Row"], "id" | "created_at" | "related_terms"> & Partial<Pick<Database["public"]["Tables"]["explainer_cards"]["Row"], "related_terms">> & {
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
          updated_at?: string;
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
        Insert: Omit<Database["public"]["Tables"]["lab_applications"]["Row"], "id" | "submitted_at" | "status" | "reviewed_at" | "reviewer_id"> & Partial<Pick<Database["public"]["Tables"]["lab_applications"]["Row"], "status" | "reviewed_at" | "reviewer_id">> & {
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
        Insert: Omit<Database["public"]["Tables"]["opportunities"]["Row"], "id" | "created_at" | "deadline" | "is_active"> & Partial<Pick<Database["public"]["Tables"]["opportunities"]["Row"], "deadline" | "is_active">> & {
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
        Insert: Omit<Database["public"]["Tables"]["essay_submissions"]["Row"], "id" | "submitted_at" | "is_editorial_pick"> & Partial<Pick<Database["public"]["Tables"]["essay_submissions"]["Row"], "is_editorial_pick">> & {
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
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "ends_at" | "program_links"> & Partial<Pick<Database["public"]["Tables"]["events"]["Row"], "ends_at" | "program_links">> & {
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
        Insert: Omit<Database["public"]["Tables"]["connection_requests"]["Row"], "id" | "created_at" | "status"> & Partial<Pick<Database["public"]["Tables"]["connection_requests"]["Row"], "status">> & {
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
      account_deletion_requests: {
        Row: {
          id: string;
          user_id: string;
          contact_email: string;
          status: AccountDeletionStatus;
          reason: string | null;
          review_note: string | null;
          requested_at: string;
          updated_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: never;
        Update: {
          status?: AccountDeletionStatus;
          review_note?: string | null;
        };
      };
    };
    Views: {
      essay_submissions_with_counts: {
        Row: Database["public"]["Tables"]["essay_submissions"]["Row"] & { upvote_count: number };
      };
    };
    Functions: {
      request_account_deletion: {
        Args: { request_reason?: string | null };
        Returns: Database["public"]["Tables"]["account_deletion_requests"]["Row"];
      };
      cancel_account_deletion: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["account_deletion_requests"]["Row"];
      };
      export_my_data: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

// Supabase requires relationship metadata in every table/view contract.
type Relations = {
 lab_applications: [{ foreignKeyName: 'lab_applications_project_id_fkey'; columns: ['project_id']; isOneToOne: false; referencedRelation: 'research_projects'; referencedColumns: ['id'] }];
 news_bookmarks: [{ foreignKeyName: 'news_bookmarks_article_id_fkey'; columns: ['article_id']; isOneToOne: false; referencedRelation: 'news_articles'; referencedColumns: ['id'] }];
 project_bookmarks: [{ foreignKeyName: 'project_bookmarks_project_id_fkey'; columns: ['project_id']; isOneToOne: false; referencedRelation: 'research_projects'; referencedColumns: ['id'] }];
};
export type Database = { public: Omit<DatabaseDefinition['public'], 'Tables' | 'Views'> & {
 Tables: { [K in keyof DatabaseDefinition['public']['Tables']]: DatabaseDefinition['public']['Tables'][K] & { Relationships: K extends keyof Relations ? Relations[K] : [] } };
 Views: { [K in keyof DatabaseDefinition['public']['Views']]: DatabaseDefinition['public']['Views'][K] & { Relationships: [] } };
} };
