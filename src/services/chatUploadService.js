import axiosInstance from "../lib/axios";


const chatUploadService = {
  // Upload single file
  uploadSingleFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/chat/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Upload multiple files
  uploadMultipleFiles: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await axiosInstance.post('/chat/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get file info
  getFileInfo: async (filename) => {
    const response = await axiosInstance.get(`/chat/files/${filename}/info`);
    return response.data;
  },

  // Download file
  downloadFile: async (filename) => {
    const response = await axiosInstance.get(`/chat/files/${filename}`, {
      responseType: 'blob',
    });
    
    // Create blob URL for download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Delete file
  deleteFile: async (filename) => {
    const response = await axiosInstance.delete(`/chat/files/${filename}`);
    return response.data;
  },

  // Get file URL for display
  getFileUrl: (filename) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${baseUrl}/chat/files/${filename}`;
  },

  // Check if file is an image
  isImage: (mimetype) => {
    return mimetype.startsWith('image/');
  },

  // Check if file is a video
  isVideo: (mimetype) => {
    return mimetype.startsWith('video/');
  },

  // Check if file is an audio
  isAudio: (mimetype) => {
    return mimetype.startsWith('audio/');
  },

  // Get file icon based on type
  getFileIcon: (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    if (mimetype.includes('text/')) return '📄';
    return '📎';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default chatUploadService;
