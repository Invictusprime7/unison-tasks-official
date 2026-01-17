export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_code_patterns: {
        Row: {
          code_snippet: string
          created_at: string | null
          description: string | null
          id: string
          pattern_type: string
          success_rate: number | null
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          code_snippet: string
          created_at?: string | null
          description?: string | null
          id?: string
          pattern_type: string
          success_rate?: number | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          code_snippet?: string
          created_at?: string | null
          description?: string | null
          id?: string
          pattern_type?: string
          success_rate?: number | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      ai_learning_sessions: {
        Row: {
          ai_response: string
          code_generated: string | null
          created_at: string | null
          feedback_score: number | null
          id: string
          session_type: string
          technologies_used: string[] | null
          user_id: string | null
          user_prompt: string
          was_successful: boolean | null
        }
        Insert: {
          ai_response: string
          code_generated?: string | null
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          session_type: string
          technologies_used?: string[] | null
          user_id?: string | null
          user_prompt: string
          was_successful?: boolean | null
        }
        Update: {
          ai_response?: string
          code_generated?: string | null
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          session_type?: string
          technologies_used?: string[] | null
          user_id?: string | null
          user_prompt?: string
          was_successful?: boolean | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          duration_minutes: number | null
          ghl_calendar_id: string | null
          ghl_contact_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          service_name: string
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number | null
          ghl_calendar_id?: string | null
          ghl_contact_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          service_name: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number | null
          ghl_calendar_id?: string | null
          ghl_contact_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          service_name?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_kits: {
        Row: {
          colors: Json | null
          created_at: string | null
          document_id: string
          fonts: string[] | null
          id: string
          logo_url: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string | null
          document_id: string
          fonts?: string[] | null
          id?: string
          logo_url?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string | null
          document_id?: string
          fonts?: string[] | null
          id?: string
          logo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          mode: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          component_data: Json | null
          content: string
          conversation_id: string
          created_at: string
          has_code: boolean | null
          id: string
          role: string
        }
        Insert: {
          component_data?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          has_code?: boolean | null
          id?: string
          role: string
        }
        Update: {
          component_data?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          has_code?: boolean | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clips: {
        Row: {
          clip_in: number
          clip_out: number
          created_at: string | null
          effects: Json | null
          id: string
          src: string
          timeline_start: number
          track_id: string
          transforms: Json | null
        }
        Insert: {
          clip_in?: number
          clip_out?: number
          created_at?: string | null
          effects?: Json | null
          id?: string
          src: string
          timeline_start?: number
          track_id: string
          transforms?: Json | null
        }
        Update: {
          clip_in?: number
          clip_out?: number
          created_at?: string | null
          effects?: Json | null
          id?: string
          src?: string
          timeline_start?: number
          track_id?: string
          transforms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clips_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          lead_id: string | null
          scheduled_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automations: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          company: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_deals: {
        Row: {
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          stage: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          stage?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      crm_form_submissions: {
        Row: {
          created_at: string | null
          data: Json
          form_id: string
          form_name: string | null
          id: string
          ip_address: string | null
          source_url: string | null
          user_agent: string | null
          workflow_triggered: boolean | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          form_id: string
          form_name?: string | null
          id?: string
          ip_address?: string | null
          source_url?: string | null
          user_agent?: string | null
          workflow_triggered?: boolean | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          form_id?: string
          form_name?: string | null
          id?: string
          ip_address?: string | null
          source_url?: string | null
          user_agent?: string | null
          workflow_triggered?: boolean | null
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          source: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_workflow_jobs: {
        Row: {
          action_config: Json | null
          action_type: string
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          result: Json | null
          retry_count: number | null
          scheduled_at: string | null
          status: string | null
          step_index: number
          workflow_run_id: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string | null
          step_index?: number
          workflow_run_id?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string | null
          step_index?: number
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_workflow_jobs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "crm_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_workflow_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          result: Json | null
          started_at: string | null
          status: string | null
          trigger_data: Json | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "crm_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      design_templates: {
        Row: {
          canvas_data: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_history: {
        Row: {
          created_at: string | null
          created_by: string
          document_id: string
          id: string
          snapshot: Json
        }
        Insert: {
          created_at?: string | null
          created_by: string
          document_id: string
          id?: string
          snapshot: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string
          document_id?: string
          id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "document_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_access_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_id: string | null
          id: string
          session_id: string
          token: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_id?: string | null
          id?: string
          session_id: string
          token?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_id?: string | null
          id?: string
          session_id?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_access_tokens_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          created_at: string | null
          created_by: string
          file_id: string
          id: string
          size: number
          storage_path: string
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          file_id: string
          id?: string
          size: number
          storage_path: string
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          file_id?: string
          id?: string
          size?: number
          storage_path?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string | null
          folder_path: string | null
          id: string
          is_favorite: boolean | null
          mime_type: string
          name: string
          size: number
          storage_path: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          folder_path?: string | null
          id?: string
          is_favorite?: boolean | null
          mime_type: string
          name: string
          size: number
          storage_path: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          folder_path?: string | null
          id?: string
          is_favorite?: boolean | null
          mime_type?: string
          name?: string
          size?: number
          storage_path?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_pages: {
        Row: {
          created_at: string | null
          html_content: string | null
          id: string
          prompt: string
          schema: Json
          theme_tokens: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          prompt: string
          schema: Json
          theme_tokens?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          prompt?: string
          schema?: Json
          theme_tokens?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      layers: {
        Row: {
          adjustments: Json | null
          blend: Database["public"]["Enums"]["blend_mode"]
          created_at: string | null
          id: string
          kind: Database["public"]["Enums"]["layer_kind"]
          locked: boolean
          masks: Json | null
          opacity: number
          page_id: string
          payload: Json
          sort_order: number
          transform: Json
          visible: boolean
        }
        Insert: {
          adjustments?: Json | null
          blend?: Database["public"]["Enums"]["blend_mode"]
          created_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["layer_kind"]
          locked?: boolean
          masks?: Json | null
          opacity?: number
          page_id: string
          payload?: Json
          sort_order?: number
          transform?: Json
          visible?: boolean
        }
        Update: {
          adjustments?: Json | null
          blend?: Database["public"]["Enums"]["blend_mode"]
          created_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["layer_kind"]
          locked?: boolean
          masks?: Json | null
          opacity?: number
          page_id?: string
          payload?: Json
          sort_order?: number
          transform?: Json
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "layers_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          id: string
          items: Json
          metadata: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          session_id: string | null
          shipping_address: Json | null
          status: string | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          items: Json
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          session_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          session_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          created_at: string | null
          id: string
          page_id: string | null
          schema: Json
          section_type: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          schema: Json
          section_type: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          schema?: Json
          section_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "generated_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          background: Json | null
          created_at: string | null
          document_id: string
          height: number
          id: string
          sort_order: number
          width: number
        }
        Insert: {
          background?: Json | null
          created_at?: string | null
          document_id: string
          height?: number
          id?: string
          sort_order?: number
          width?: number
        }
        Update: {
          background?: Json | null
          created_at?: string | null
          document_id?: string
          height?: number
          id?: string
          sort_order?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          inventory_count: number | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_files: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_id: string
          id: string
          is_public: boolean | null
          permission: string
          public_token: string | null
          shared_by: string
          shared_with: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_id: string
          id?: string
          is_public?: boolean | null
          permission?: string
          public_token?: string | null
          shared_by: string
          shared_with?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_id?: string
          id?: string
          is_public?: boolean | null
          permission?: string
          public_token?: string | null
          shared_by?: string
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          canvas_data: Json
          created_at: string
          created_by: string
          id: string
          template_id: string
          version_number: number
        }
        Insert: {
          canvas_data: Json
          created_at?: string
          created_by: string
          id?: string
          template_id: string
          version_number: number
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          created_by?: string
          id?: string
          template_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "design_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      timelines: {
        Row: {
          created_at: string | null
          document_id: string
          duration: number
          fps: number
          id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          duration?: number
          fps?: number
          id?: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          duration?: number
          fps?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timelines_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          created_at: string | null
          id: string
          sort_order: number
          timeline_id: string
          type: Database["public"]["Enums"]["track_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          sort_order?: number
          timeline_id: string
          type: Database["public"]["Enums"]["track_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          sort_order?: number
          timeline_id?: string
          type?: Database["public"]["Enums"]["track_type"]
        }
        Relationships: [
          {
            foreignKeyName: "tracks_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          ai_generations_reset_at: string | null
          ai_generations_used: number | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          projects_count: number | null
          status: string
          storage_used_mb: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          team_members_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generations_reset_at?: string | null
          ai_generations_used?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          projects_count?: number | null
          status?: string
          storage_used_mb?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          team_members_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generations_reset_at?: string | null
          ai_generations_used?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          projects_count?: number | null
          status?: string
          storage_used_mb?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          team_members_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_pattern_usage: {
        Args: { pattern_id: string }
        Returns: undefined
      }
      validate_file_share_token: {
        Args: { _file_id: string; _token: string }
        Returns: boolean
      }
    }
    Enums: {
      blend_mode:
        | "normal"
        | "multiply"
        | "screen"
        | "overlay"
        | "darken"
        | "lighten"
        | "color-dodge"
        | "color-burn"
        | "hard-light"
        | "soft-light"
        | "difference"
        | "exclusion"
      document_type: "design" | "video"
      layer_kind: "image" | "text" | "shape" | "group" | "video" | "audio"
      track_type: "video" | "audio" | "overlay"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blend_mode: [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
      ],
      document_type: ["design", "video"],
      layer_kind: ["image", "text", "shape", "group", "video", "audio"],
      track_type: ["video", "audio", "overlay"],
    },
  },
} as const
