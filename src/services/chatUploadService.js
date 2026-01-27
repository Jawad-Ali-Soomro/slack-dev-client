import axiosInstance from "../lib/axios";


const chatUploadService = {

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

  getFileInfo: async (filename) => {
    const response = await axiosInstance.get(`/chat/files/${filename}/info`);
    return response.data;
  },

  downloadFile: async (filename) => {
    const response = await axiosInstance.get(`/chat/files/${filename}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  deleteFile: async (filename) => {
    const response = await axiosInstance.delete(`/chat/files/${filename}`);
    return response.data;
  },

  getFileUrl: (filename) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${baseUrl}/chat/files/${filename}`;
  },

  isImage: (mimetype) => {
    return mimetype.startsWith('image/');
  },

  isVideo: (mimetype) => {
    return mimetype.startsWith('video/');
  },

  isAudio: (mimetype) => {
    return mimetype.startsWith('audio/');
  },

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

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default chatUploadService;
