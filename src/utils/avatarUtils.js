/**
 * Get the proper avatar URL for display
 * @param {string} avatar - Avatar path from backend
 * @param {string} username - Username for fallback avatar
 * @returns {string} - Complete avatar URL
 */
export const getAvatarUrl = (avatar, username = 'User') => {
  if (!avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128`
  }
  
  // If it's already a full URL, return as is
  if (avatar.startsWith('http')) {
    return avatar
  }
  
  // If it's a relative path, prepend the API URL
  const apiUrl = 'http://localhost:4000'
  return `${apiUrl}${avatar}`
}

/**
 * Get avatar URL with error fallback
 * @param {string} avatar - Avatar path from backend
 * @param {string} username - Username for fallback avatar
 * @returns {object} - Object with src and onError handler
 */
export const getAvatarProps = (avatar, username = 'User') => {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128`
  
  return {
    src: getAvatarUrl(avatar, username),
    onError: (e) => {
      e.target.src = fallbackUrl
    }
  }
}
