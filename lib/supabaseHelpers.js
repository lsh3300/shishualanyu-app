// Supabase客户端类型定义
import { Database } from '../types/database'

// 导入客户端
import { supabase } from './supabaseClient'

// 世说蓝语应用数据库操作辅助函数
export const supabaseHelpers = {
  // 用户相关操作
  users: {
    // 获取当前用户
    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser()
      return { data, error }
    },
    
    // 注册用户
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    },
    
    // 登录用户
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    },
    
    // 登出用户
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      return { error }
    },
  },
  
  // 产品相关操作
  products: {
    // 获取所有产品
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      return { data, error }
    },
    
    // 根据ID获取产品
    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },
    
    // 根据分类获取产品
    getByCategory: async (category) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
      return { data, error }
    },
  },
  
  // 订单相关操作
  orders: {
    // 创建订单
    create: async (orderData) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
      return { data, error }
    },
    
    // 获取用户订单
    getUserOrders: async (userId) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
      return { data, error }
    },
  },
}

export default supabase