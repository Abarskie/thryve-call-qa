/**
 * Callsy QA (CallCoach AI) - TypeScript Database & Entity Definitions
 * 
 * Defines strict TypeScript interfaces for:
 * 1. JSONB document structures (Framework stages, requirements, diarized segments, AI analysis results).
 * 2. Table domain entities (Agents, CallFrameworks, Calls, Transcripts, CallAnalyses).
 * 3. Supabase Database type mapping compatible with @supabase/supabase-js client queries.
 */

// ==========================================
// 1. GENERIC JSON TYPES
// ==========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==========================================
// 2. JSONB DOCUMENT STRUCTURES
// ==========================================

/**
 * Individual requirement / rubric item within a framework stage.
 */
export interface Requirement {
  id: string
  text: string
  order: number
}

/**
 * Evaluation stage in a call framework containing a group of requirements.
 */
export interface Stage {
  id: string
  name: string
  weight: number
  order: number
  requirements: Requirement[]
}

/**
 * Diarized transcript turn / speech segment.
 */
export interface TranscriptSegment {
  speaker: string
  start_time: number
  end_time: number
  text: string
}

/**
 * Evaluation compliance status for a single requirement.
 */
export type RequirementStatus = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_APPLICABLE'

/**
 * Detailed AI evaluation result for a single requirement.
 */
export interface RequirementResult {
  requirement_id: string
  stage_id: string
  requirement_text: string
  status: RequirementStatus
  score: number
  evidence: string
  timestamp: string
  explanation: string
}

/**
 * Aggregated score breakdown for an entire framework stage.
 */
export interface StageScore {
  stage_id: string
  stage_name: string
  score: number
  weight: number
  max_score?: number
}

// ==========================================
// 3. TABLE ENUMS & DOMAIN ENTITIES
// ==========================================

/**
 * Call processing workflow status.
 */
export type CallStatus =
  | 'pending'
  | 'transcribing'
  | 'analyzing'
  | 'completed'
  | 'failed'

/**
 * Sales / customer support agent.
 */
export interface Agent {
  id: string
  name: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * QA evaluation framework with configured stages and criteria.
 */
export interface CallFramework {
  id: string
  name: string
  description: string | null
  stages: Stage[]
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * Recorded call uploaded for transcription and evaluation.
 */
export interface Call {
  id: string
  agent_id: string
  framework_id: string
  audio_url: string
  file_name: string
  file_size: number | null
  duration_seconds: number
  status: CallStatus
  error_message: string | null
  created_at: string
  updated_at: string
}

/**
 * Audio transcript containing full raw text and diarized turns.
 */
export interface Transcript {
  id: string
  call_id: string
  raw_text: string
  segments: TranscriptSegment[]
  created_at: string
}

/**
 * AI analysis output containing scores, feedback, and requirement checks.
 */
export interface CallAnalysis {
  id: string
  call_id: string
  overall_score: number
  stage_scores: StageScore[]
  requirements_results: RequirementResult[]
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  summary: string | null
  created_at: string
}

// ==========================================
// 4. EXTENDED & JOINED TYPES
// ==========================================

/**
 * Call record with hydrated relational entities.
 */
export interface CallWithDetails extends Call {
  agent: Agent
  framework: CallFramework
  transcript?: Transcript | null
  analysis?: CallAnalysis | null
}

/**
 * Call analysis record with parent call and agent context.
 */
export interface CallAnalysisWithCall extends CallAnalysis {
  call: Call & {
    agent: Agent
    framework: CallFramework
  }
}

// ==========================================
// 5. SUPABASE DATABASE SCHEMA MAPPING
// ==========================================

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          email: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      call_frameworks: {
        Row: {
          id: string
          name: string
          description: string | null
          stages: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          stages?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          stages?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          id: string
          agent_id: string
          framework_id: string
          audio_url: string
          file_name: string
          file_size: number | null
          duration_seconds: number
          status: CallStatus
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          framework_id: string
          audio_url: string
          file_name: string
          file_size?: number | null
          duration_seconds?: number
          status?: CallStatus
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          framework_id?: string
          audio_url?: string
          file_name?: string
          file_size?: number | null
          duration_seconds?: number
          status?: CallStatus
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'calls_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'agents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'calls_framework_id_fkey'
            columns: ['framework_id']
            isOneToOne: false
            referencedRelation: 'call_frameworks'
            referencedColumns: ['id']
          }
        ]
      }
      transcripts: {
        Row: {
          id: string
          call_id: string
          raw_text: string
          segments: Json
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          raw_text: string
          segments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          raw_text?: string
          segments?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transcripts_call_id_fkey'
            columns: ['call_id']
            isOneToOne: true
            referencedRelation: 'calls'
            referencedColumns: ['id']
          }
        ]
      }
      call_analyses: {
        Row: {
          id: string
          call_id: string
          overall_score: number
          stage_scores: Json
          requirements_results: Json
          strengths: Json
          improvements: Json
          recommendations: Json
          summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          overall_score: number
          stage_scores?: Json
          requirements_results?: Json
          strengths?: Json
          improvements?: Json
          recommendations?: Json
          summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          overall_score?: number
          stage_scores?: Json
          requirements_results?: Json
          strengths?: Json
          improvements?: Json
          recommendations?: Json
          summary?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'call_analyses_call_id_fkey'
            columns: ['call_id']
            isOneToOne: true
            referencedRelation: 'calls'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ==========================================
// 6. HELPER TYPES FOR SUPABASE CLIENT
// ==========================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never
