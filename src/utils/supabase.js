import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseService {
  constructor() {
    this.client = supabase
    this.initialized = true
  }

  // ============ 认证相关 ============
  
  /**
   * Magic Link 登录
   * @param {string} email - 邮箱地址
   */
  async signInWithMagicLink(email) {
    try {
      const { error } = await this.client.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/#/auth/callback`,
          data: {
            welcome: true
          }
        }
      })
      
      if (error) throw error
      
      return { 
        success: true,
        message: '登录链接已发送到您的邮箱，请查收' 
      }
    } catch (error) {
      console.error('Magic Link 发送失败:', error)
      throw error
    }
  }

  /**
   * 处理认证回调
   */
  async handleAuthCallback() {
    try {
      // 打印完整URL用于调试
      console.log('完整URL:', window.location.href)
      console.log('URL片段(hash):', window.location.hash)
      
      // 处理包含两个#的URL，取最后一个#后面的部分
      let hashString = window.location.hash
      if (hashString.includes('#access_token=')) {
        // 找到access_token的位置，从那里开始提取
        const tokenStart = hashString.indexOf('access_token=')
        hashString = hashString.substring(tokenStart)
      } else {
        // 常规处理，去掉第一个#
        hashString = hashString.substring(1)
      }
      
      console.log('提取的令牌字符串:', hashString)
      
      const hashParams = new URLSearchParams(hashString)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      console.log('access_token存在:', !!accessToken)
      console.log('refresh_token存在:', !!refreshToken)
      
      if (accessToken && refreshToken) {
        console.log('从URL片段中找到认证令牌，设置session...')
        
        // 设置session
        const { data: { session }, error } = await this.client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (error) {
          console.error('设置session失败:', error)
          throw error
        }
        
        if (session?.user) {
          console.log('用户认证成功:', session.user.email)
          
          // 确保用户资料存在
          try {
            await this.createOrUpdateUserProfile(session.user)
            console.log('用户资料创建/更新成功')
          } catch (profileError) {
            console.error('用户资料创建失败:', profileError)
            // 即使用户资料创建失败，认证仍然有效
          }
          
          return session.user
        }
      }
      
      // 如果没有URL令牌，检查现有session
      const { data: { session }, error } = await this.client.auth.getSession()
      
      if (error) {
        console.error('获取session失败:', error)
        throw error
      }
      
      if (session?.user) {
        console.log('找到现有session:', session.user.email)
        return session.user
      }
      
      console.log('未找到有效的用户session')
      return null
      
    } catch (error) {
      console.error('认证回调处理失败:', error)
      throw error
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  /**
   * 检查登录状态
   */
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser()
      return !!user
    } catch (error) {
      return false
    }
  }

  /**
   * 登出
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut()
      if (error) throw error
      console.log('用户已成功登出')
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }

  /**
   * 监听认证状态变化
   * @param {Function} callback - 回调函数
   */
  onAuthStateChanged(callback) {
    return this.client.auth.onAuthStateChange((event, session) => {
      callback({ event, session, user: session?.user || null })
    })
  }

  // ============ 用户资料管理 ============

  /**
   * 创建或更新用户资料
   * @param {Object} user - 用户信息
   */
  async createOrUpdateUserProfile(user) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('创建/更新用户资料失败:', error)
      throw error
    }
  }

  /**
   * 获取用户资料
   * @param {string} userId - 用户ID
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取用户资料失败:', error)
      throw error
    }
  }

  /**
   * 更新用户资料
   * @param {string} userId - 用户ID
   * @param {Object} updates - 更新数据
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  }

  // ============ 猫咪管理 ============

  /**
   * 获取用户的猫咪列表
   * @param {string} userId - 用户ID
   */
  async getUserCats(userId) {
    try {
      const { data, error } = await this.client
        .from('cats')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取猫咪列表失败:', error)
      throw error
    }
  }

  /**
   * 创建猫咪档案
   * @param {Object} catData - 猫咪数据
   */
  async createCat(catData) {
    try {
      // 验证用户是否已登录
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('用户未登录，无法创建猫咪档案')
      }

      console.log('Supabase: 当前用户:', user.id)
      console.log('Supabase: 创建猫咪，数据:', catData)
      
      const { data, error } = await this.client
        .from('cats')
        .insert(catData)
        .select()

      console.log('Supabase: 创建猫咪结果:', { data, error })
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('创建猫咪档案失败:', error)
      throw error
    }
  }

  /**
   * 更新猫咪信息
   * @param {string} catId - 猫咪ID
   * @param {Object} updates - 更新数据
   */
  async updateCat(catId, updates) {
    try {
      const { data, error } = await this.client
        .from('cats')
        .update(updates)
        .eq('id', catId)
        .select()

      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('更新猫咪信息失败:', error)
      throw error
    }
  }

  /**
   * 获取单个猫咪信息
   * @param {string} catId - 猫咪ID
   */
  async getCat(catId) {
    try {
      console.log('Supabase: 获取猫咪信息，ID:', catId)
      
      const { data, error } = await this.client
        .from('cats')
        .select('*')
        .eq('id', catId)
        .single()

      console.log('Supabase: 猫咪信息查询结果:', { data, error })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取猫咪信息失败:', error)
      throw error
    }
  }

  // ============ 日记管理 ============

  /**
   * 获取公开日记列表（首页展示）
   * @param {Object} options - 查询选项
   */
  async getPublicDiaries(options = {}) {
    const { page = 1, limit = 20, catId } = options
    const offset = (page - 1) * limit

    try {
      // 首先获取日记和猫咪数据
      let query = this.client
        .from('cat_diaries')
        .select(`
          *,
          cats(*)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (catId) {
        query = query.eq('cat_id', catId)
      }

      const { data: diariesData, error: diariesError } = await query

      if (diariesError) throw diariesError

      if (!diariesData || diariesData.length === 0) {
        return []
      }

      // 获取用户ID列表
      const userIds = [...new Set(diariesData.map(diary => diary.user_id))]
      
      // 批量获取用户资料
      const { data: userProfiles, error: userError } = await this.client
        .from('user_profiles')
        .select('id, username, full_name')
        .in('id', userIds)

      if (userError) {
        console.warn('获取用户资料失败，将使用默认值:', userError)
      }

      // 批量获取日记图片
      const diaryIds = diariesData.map(diary => diary.id)
      const { data: imagesData, error: imagesError } = await this.client
        .from('diary_images')
        .select('*')
        .in('diary_id', diaryIds)

      if (imagesError) {
        console.warn('获取日记图片失败，将使用默认值:', imagesError)
      }

      // 组合数据
      const result = diariesData.map(diary => {
        // 找到对应的用户资料
        const userProfile = userProfiles?.find(up => up.id === diary.user_id)
        
        // 找到对应的图片
        const images = imagesData?.filter(img => img.diary_id === diary.id) || []

        return {
          ...diary,
          user_profiles: userProfile || { username: '未知用户', full_name: '' },
          diary_images: images
        }
      })

      return result
    } catch (error) {
      console.error('获取公开日记失败:', error)
      throw error
    }
  }

  /**
   * 获取用户的日记列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   */
  async getUserDiaries(userId, options = {}) {
    const { page = 1, limit = 20, catId } = options
    const offset = (page - 1) * limit

    try {
      console.log('Supabase: 获取用户日记，用户ID:', userId, '选项:', options)
      
      // 获取日记和猫咪数据
      let query = this.client
        .from('cat_diaries')
        .select(`
          *,
          cats(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (catId) {
        query = query.eq('cat_id', catId)
      }

      const { data: diariesData, error: diariesError } = await query
      console.log('Supabase: 用户日记和猫咪数据:', { data: diariesData, error: diariesError })

      if (diariesError) throw diariesError

      if (!diariesData || diariesData.length === 0) {
        return []
      }

      // 批量获取日记图片
      const diaryIds = diariesData.map(diary => diary.id)
      const { data: imagesData, error: imagesError } = await this.client
        .from('diary_images')
        .select('*')
        .in('diary_id', diaryIds)

      console.log('Supabase: 用户日记图片数据:', { data: imagesData, error: imagesError })

      if (imagesError) {
        console.warn('获取日记图片失败，将使用默认值:', imagesError)
      }

      // 组合数据
      const result = diariesData.map(diary => {
        const images = imagesData?.filter(img => img.diary_id === diary.id) || []
        return {
          ...diary,
          diary_images: images
        }
      })

      console.log('Supabase: 用户日记最终结果:', result)
      return result
    } catch (error) {
      console.error('获取用户日记失败:', error)
      throw error
    }
  }

  /**
   * 创建日记
   * @param {Object} diaryData - 日记数据
   */
  async createDiary(diaryData) {
    try {
      // 验证用户是否已登录
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('用户未登录，无法创建日记')
      }

      console.log('Supabase: 当前用户:', user.id)
      console.log('Supabase: 创建日记，数据:', diaryData)

      const { data, error } = await this.client
        .from('cat_diaries')
        .insert(diaryData)
        .select()

      console.log('Supabase: 创建日记结果:', { data, error })
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('创建日记失败:', error)
      throw error
    }
  }

  /**
   * 获取单个日记详情
   * @param {string} diaryId - 日记ID
   */
  async getDiary(diaryId) {
    try {
      // 首先获取日记和猫咪数据
      const { data: diaryData, error: diaryError } = await this.client
        .from('cat_diaries')
        .select(`
          *,
          cats(*)
        `)
        .eq('id', diaryId)
        .single()

      if (diaryError) throw diaryError
      if (!diaryData) throw new Error('日记不存在')

      // 获取用户资料
      const { data: userProfile, error: userError } = await this.client
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', diaryData.user_id)
        .single()

      if (userError) {
        console.warn('获取用户资料失败，将使用默认值:', userError)
      }

      // 获取日记图片
      const { data: imagesData, error: imagesError } = await this.client
        .from('diary_images')
        .select('*')
        .eq('diary_id', diaryId)
        .order('display_order', { ascending: true })

      if (imagesError) {
        console.warn('获取日记图片失败，将使用默认值:', imagesError)
      }

      // 组合数据
      const result = {
        ...diaryData,
        user_profiles: userProfile || { username: '未知用户', full_name: '', avatar_url: null },
        diary_images: imagesData || []
      }

      return result
    } catch (error) {
      console.error('获取日记详情失败:', error)
      throw error
    }
  }

  /**
   * 更新日记
   * @param {string} diaryId - 日记ID
   * @param {Object} updates - 更新数据
   */
  async updateDiary(diaryId, updates) {
    try {
      const { data, error } = await this.client
        .from('cat_diaries')
        .update(updates)
        .eq('id', diaryId)
        .select()

      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('更新日记失败:', error)
      throw error
    }
  }

  /**
   * 删除日记
   * @param {string} diaryId - 日记ID
   */
  async deleteDiary(diaryId) {
    try {
      const { error } = await this.client
        .from('cat_diaries')
        .delete()
        .eq('id', diaryId)

      if (error) throw error
      console.log('日记删除成功')
    } catch (error) {
      console.error('删除日记失败:', error)
      throw error
    }
  }

  // ============ 文件上传 ============

  /**
   * 上传图片到指定存储桶
   * @param {File} file - 文件对象
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 文件路径
   */
  async uploadImage(file, bucket, path) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 获取公共URL
      const { data: { publicUrl } } = this.client.storage
        .from(bucket)
        .getPublicUrl(path)

      return {
        path: data.path,
        publicUrl: publicUrl,
        fullPath: data.fullPath
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      throw error
    }
  }

  /**
   * 批量上传日记图片
   * @param {Array} files - 文件数组
   * @param {string} diaryId - 日记ID
   */
  async uploadDiaryImages(files, diaryId) {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('用户未登录')

      const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now()
        const extension = file.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}_${index}.${extension}`
        const path = `${user.id}/${diaryId}/${fileName}`

        // 上传文件
        const uploadResult = await this.uploadImage(file, 'diary-images', path)
        
        // 保存到数据库
        const { data, error } = await this.client
          .from('diary_images')
          .insert({
            diary_id: diaryId,
            image_url: uploadResult.publicUrl,
            display_order: index
          })
          .select()

        if (error) throw error
        return data?.[0]
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      console.error('批量上传日记图片失败:', error)
      throw error
    }
  }

  /**
   * 删除图片
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 文件路径
   */
  async deleteImage(bucket, path) {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path])

      if (error) throw error
      console.log('图片删除成功')
    } catch (error) {
      console.error('删除图片失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const supabaseService = new SupabaseService()

export default supabaseService