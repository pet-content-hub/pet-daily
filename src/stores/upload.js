import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUploadStore = defineStore("upload", () => {
  // 状态
  const uploads = ref(new Map()); // 使用Map来跟踪多个上传任务
  const isUploading = ref(false);
  const error = ref(null);

  // 计算属性
  const uploadCount = computed(() => uploads.value.size);
  const hasActiveUploads = computed(() => {
    return Array.from(uploads.value.values()).some(
      (upload) => upload.status === "uploading"
    );
  });

  // 方法
  function generateUploadId() {
    return Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  function createUploadTask(file, path) {
    const uploadId = generateUploadId();
    const task = {
      id: uploadId,
      file,
      path,
      status: "pending", // pending, uploading, success, error
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date(),
    };

    uploads.value.set(uploadId, task);
    return uploadId;
  }

  async function uploadImage(file, customPath = null) {
    // CloudBase功能已移除，此功能暂时不可用
    throw new Error("图片上传功能暂时不可用，CloudBase集成已移除");
  }

  async function getImageDownloadURL(fileId) {
    // CloudBase功能已移除，此功能暂时不可用
    throw new Error("获取图片下载链接功能暂时不可用，CloudBase集成已移除");
  }

  async function deleteImage(fileId) {
    // CloudBase功能已移除，此功能暂时不可用
    throw new Error("删除图片功能暂时不可用，CloudBase集成已移除");
  }

  function getUploadTask(uploadId) {
    return uploads.value.get(uploadId);
  }

  function removeUploadTask(uploadId) {
    return uploads.value.delete(uploadId);
  }

  function clearCompletedTasks() {
    const completed = ["success", "error"];
    for (const [id, task] of uploads.value) {
      if (completed.includes(task.status)) {
        uploads.value.delete(id);
      }
    }
  }

  function clearError() {
    error.value = null;
  }

  // 批量上传
  async function uploadMultipleImages(files, customPathPrefix = null) {
    const uploadPromises = [];

    for (const file of files) {
      const customPath = customPathPrefix
        ? `${customPathPrefix}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split(".").pop()}`
        : null;

      uploadPromises.push(uploadImage(file, customPath));
    }

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
      const failed = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason);

      return {
        successful,
        failed,
        total: files.length,
      };
    } catch (err) {
      console.error("批量上传失败:", err);
      throw err;
    }
  }

  return {
    // 状态
    uploads,
    isUploading,
    error,

    // 计算属性
    uploadCount,
    hasActiveUploads,

    // 方法
    uploadImage,
    uploadMultipleImages,
    getImageDownloadURL,
    deleteImage,
    getUploadTask,
    removeUploadTask,
    clearCompletedTasks,
    clearError,
  };
});
