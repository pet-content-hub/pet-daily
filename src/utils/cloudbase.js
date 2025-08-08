import cloudbase from '@cloudbase/js-sdk'

class CloudBaseService {
  constructor() {
    this.app = null
    this.auth = null
    this.database = null
    this.storage = null
    this.initialized = false
  }

  /**
   * 初始化CloudBase
   * @param {Object} config - 配置对象
   * @param {string} config.env - 环境ID
   */
  init(config) {
    if (this.initialized) {
      console.warn('CloudBase already initialized')
      return
    }

    try {
      this.app = cloudbase.init({
        env: config.env
      })

      this.auth = this.app.auth({ persistence: 'local' })
      this.database = this.app.database()
      this.storage = this.app.uploadFile()

      this.initialized = true
      console.log('🔥 CloudBase initialized successfully')
    } catch (error) {
      console.error('CloudBase initialization failed:', error)
      throw error
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    if (!this.auth) return false
    return this.auth.hasLoginState()
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    if (!this.auth) return null
    return this.auth.currentUser
  }

  /**
   * 匿名登录
   */
  async signInAnonymously() {
    try {
      const result = await this.auth.anonymousAuthProvider().signIn()
      console.log('Anonymous login successful:', result)
      return result
    } catch (error) {
      console.error('Anonymous login failed:', error)
      throw error
    }
  }

  /**
   * 微信登录
   */
  async signInWithWechat() {
    try {
      const result = await this.auth.weixinAuthProvider().signIn()
      console.log('Wechat login successful:', result)
      return result
    } catch (error) {
      console.error('Wechat login failed:', error)
      throw error
    }
  }

  /**
   * 退出登录
   */
  async signOut() {
    try {
      await this.auth.signOut()
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  /**
   * 上传图片
   * @param {File} file - 文件对象
   * @param {string} path - 存储路径
   */
  async uploadImage(file, path) {
    if (!this.storage) {
      throw new Error('CloudBase not initialized')
    }

    try {
      const result = await this.app.uploadFile({
        cloudPath: path,
        filePath: file
      })
      
      console.log('Image uploaded successfully:', result)
      return result
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  /**
   * 获取文件下载链接
   * @param {string} fileId - 文件ID
   */
  async getDownloadURL(fileId) {
    try {
      const result = await this.app.getTempFileURL({
        fileList: [fileId]
      })
      
      if (result.fileList && result.fileList.length > 0) {
        return result.fileList[0].tempFileURL
      }
      
      throw new Error('Failed to get download URL')
    } catch (error) {
      console.error('Get download URL failed:', error)
      throw error
    }
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   */
  async deleteFile(fileId) {
    try {
      const result = await this.app.deleteFile({
        fileList: [fileId]
      })
      
      console.log('File deleted successfully:', result)
      return result
    } catch (error) {
      console.error('Delete file failed:', error)
      throw error
    }
  }

  /**
   * 创建数据库记录
   * @param {string} collection - 集合名称
   * @param {Object} data - 数据对象
   */
  async createRecord(collection, data) {
    try {
      const result = await this.database.collection(collection).add(data)
      console.log('Record created successfully:', result)
      return result
    } catch (error) {
      console.error('Create record failed:', error)
      throw error
    }
  }

  /**
   * 查询数据库记录
   * @param {string} collection - 集合名称
   * @param {Object} where - 查询条件
   */
  async queryRecords(collection, where = {}) {
    try {
      let query = this.database.collection(collection)
      
      if (Object.keys(where).length > 0) {
        query = query.where(where)
      }
      
      const result = await query.get()
      return result.data
    } catch (error) {
      console.error('Query records failed:', error)
      throw error
    }
  }

  /**
   * 更新数据库记录
   * @param {string} collection - 集合名称
   * @param {string} docId - 文档ID
   * @param {Object} data - 更新数据
   */
  async updateRecord(collection, docId, data) {
    try {
      const result = await this.database.collection(collection).doc(docId).update(data)
      console.log('Record updated successfully:', result)
      return result
    } catch (error) {
      console.error('Update record failed:', error)
      throw error
    }
  }

  /**
   * 删除数据库记录
   * @param {string} collection - 集合名称
   * @param {string} docId - 文档ID
   */
  async deleteRecord(collection, docId) {
    try {
      const result = await this.database.collection(collection).doc(docId).remove()
      console.log('Record deleted successfully:', result)
      return result
    } catch (error) {
      console.error('Delete record failed:', error)
      throw error
    }
  }

  /**
   * 监听登录状态变化
   * @param {Function} callback - 回调函数
   */
  onAuthStateChanged(callback) {
    if (!this.auth) return

    this.auth.onLoginStateChanged((loginState) => {
      callback(loginState)
    })
  }
}

// 创建单例实例
const cloudbaseService = new CloudBaseService()

export default cloudbaseService