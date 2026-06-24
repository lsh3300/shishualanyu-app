// 世说蓝语应用数据库类型定义
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 用户角色枚举
export type UserRole = 'user' | 'admin'

// 用户状态枚举
export type UserStatus = 'active' | 'disabled'

// 内容类型枚举
export type ContentType = 'comment' | 'work' | 'report'

// 审核状态枚举
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          role: UserRole
          status: UserStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          images: string[] | null
          videos: Json | null  // 视频数组，包含id、url、thumbnail、title、duration等字段
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          images?: string[] | null
          videos?: Json | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          images?: string[] | null
          videos?: Json | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor: string
          duration: number // 分钟
          price: number
          image_url: string | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor: string
          duration: number
          price: number
          image_url?: string | null
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor?: string
          duration?: number
          price?: number
          image_url?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          progress: number // 0-100
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      content_reviews: {
        Row: {
          id: string
          content_type: ContentType
          content_id: string
          content_preview: string | null
          submitter_id: string | null
          status: ReviewStatus
          reviewer_id: string | null
          reject_reason: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          content_type: ContentType
          content_id: string
          content_preview?: string | null
          submitter_id?: string | null
          status?: ReviewStatus
          reviewer_id?: string | null
          reject_reason?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          content_type?: ContentType
          content_id?: string
          content_preview?: string | null
          submitter_id?: string | null
          status?: ReviewStatus
          reviewer_id?: string | null
          reject_reason?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
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