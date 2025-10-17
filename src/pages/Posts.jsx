import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useSearch } from '../contexts/SearchContext'
import { useLocation, useNavigate } from 'react-router-dom'
import postService from '../services/postService'
import teamService from '../services/teamService'
import uploadService from '../services/uploadService'
import ShareModal from '../components/ShareModal'
import SkeletonLoader from '../components/SkeletonLoader'
// toast
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Pin, 

  Edit, 
  Trash2, 
  X,
  Image as ImageIcon,
  Tag,
  Users,
  Globe,
  Lock,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  Send
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Textarea } from '../components/ui/textarea'
// getAvatarProps
import { toast } from 'sonner'
import { getAvatarProps } from '../utils/avatarUtils'
import friendService from '../services/friendService'

const Posts = () => {

  document.title = "Posts"

  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()
  const { searchTerm, setSearchTerm, handleSearch } = useSearch()
  const navigate = useNavigate()
  
  // State management
  const [posts, setPosts] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showComments, setShowComments] = useState({})
  const [visibleComments, setVisibleComments] = useState({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Create post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    images: [],
    tags: [],
    visibility: 'public',
    teamId: ''
  })
  const [newTag, setNewTag] = useState('')
  const [commentText, setCommentText] = useState({})
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingPost, setSharingPost] = useState(null)
  const [expandedPosts, setExpandedPosts] = useState(new Set())

  // Load initial data
  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('posts')
    }
  }, [user, markAsReadByType])

  useEffect(() => {
    loadPosts()
    loadTeams()
  }, [activeFilter, searchTerm])

  // Create post modal is now handled directly in the Posts page

  // Load posts
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await postService.getPosts({
        page: pagination.page,
        limit: pagination.limit,
        visibility: activeFilter === 'all' ? undefined : activeFilter,
        search: searchTerm || undefined
      })
      
      setPosts(response.posts || [])
      setPagination(response.pagination || pagination)
    } catch (error) {
      console.error('Failed to load posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, activeFilter, searchTerm])

  // Load teams
  const loadTeams = useCallback(async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 })
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }, [])

  // Create post
  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!newPost.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    try {
      setLoading(true)
      console.log('Creating post with data:', newPost)
      const response = await postService.createPost(newPost)
      console.log('Post creation response:', response)
      setPosts(prev => [response.post, ...prev])
      setShowCreateModal(false)
      setNewPost({
        title: '',
        content: '',
        images: [],
        tags: [],
        visibility: 'public',
        teamId: ''
      })
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  // Toggle like
  const handleToggleLike = async (postId) => {
    try {
      const response = await postService.toggleLike(postId)
      console.log('Like response:', response) // Debug log
      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likedBy: response.liked 
                ? [...(post.likedBy || []), user?.id || user?._id]
                : (post.likedBy || []).filter(id => id !== (user?.id || user?._id))
            }
          : post
      ))
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(error.message || 'Failed to toggle like')
    }
  }

  // Add comment
  const handleAddComment = async (postId) => {
    const content = commentText[postId]
    if (!content?.trim()) return

    try {
      const response = await postService.addComment(postId, content)
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, comments: [...post.comments, response.comment] }
          : post
      ))
      setCommentText(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error(error.message || 'Failed to add comment')
    }
  }

  // Toggle comment like
  const handleToggleCommentLike = async (postId, commentId) => {
    try {
      const response = await postService.toggleCommentLike(postId, commentId)
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment._id === commentId
                  ? {
                      ...comment,
                      likes: response.isLiked
                        ? [...comment.likes, { user: user.id || user._id, likedAt: new Date() }]
                        : comment.likes.filter(like => like.user !== (user.id || user._id))
                    }
                  : comment
              )
            }
          : post
      ))
    } catch (error) {
      console.error('Error toggling comment like:', error)
      toast.error(error.message || 'Failed to toggle comment like')
    }
  }

  // Share post
  const handleSharePost = (postId) => {
    const post = posts.find(p => p._id === postId)
    setSharingPost(post)
    setShowShareModal(true)
  }

  // Toggle post description expansion
  const togglePostExpansion = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendService.sendFriendRequest(userId)
      toast.success('Friend request sent!')
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error(error.message || 'Failed to send friend request')
    }
  }

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await postService.deletePost(postId)
      setPosts(prev => prev.filter(post => post._id !== postId))
      toast.success('Post deleted successfully!')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(error.message || 'Failed to delete post')
    }
  }

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.toLowerCase())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.toLowerCase()]
      }))
      setNewTag('')
    }
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
    }
  }

  // Upload images
  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploadingImages(true)
      const response = await uploadService.uploadMultipleImages(selectedFiles)
      
      console.log('Upload response:', response)
      console.log('Image URLs:', response.images.map(img => img.url))
      
      setNewPost(prev => ({
        ...prev,
        images: [...prev.images, ...response.images.map(img => img.url)]
      }))
      
      setSelectedFiles([])
      toast.success('Images uploaded successfully!')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  // Remove image
  const handleRemoveImage = (index) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Remove selected file
  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Format time
  const formatTime = (date) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return postDate.toLocaleDateString()
  }

  // Check if user liked post
  const isLiked = (post) => {
    return post.likedBy && post.likedBy.includes(user?.id || user?._id)
  }

  // Check if user liked comment
  const isCommentLiked = (comment) => {
    return comment.likes.some(like => like.user === user.id || like.user === user._id)
  }

  // Show more comments
  const showMoreComments = (postId) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || 3) + 3
    }))
  }

  return (
    <div>
      {/* Debug User Info */}
 
      
        <div className=" mx-auto px-5 flex items-centerjustify-between w-full flex-col relative">
          {/* Fixed Search and Create Post Header */}
          <div className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-black mt-4 border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
            <div className=" mx-auto">
              <div className="flex items-center  justify-end gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                    className="pl-10"
                  />
                </div>
                
                {/* Create Post Button */}
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 rounded-[25px] flex items-center gap-2 w-12"
                >
                  <Plus className="w-4 h-4" />
                  {/* Create Post */}
                </Button>
              </div>
            </div>
          </div>

        {/* Posts Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-24 pb-20">
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center col-span-full bg-white dark:bg-black">
              <div className="text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-sm">Be the first to share something with your team!</p>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-xl shadow-sm border overflow-hidden flex flex-col bg-white dark:bg-black hover:shadow-md transition-shadow duration-200"
              >
                {/* Post Header */}
                <div className="p-4 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border p-1 rounded-[25px] border dark:border-[rgba(255,255,255,.2)]">
                        <AvatarImage className={'rounded-[25px]'} {...getAvatarProps(post.author.avatar, post.author.username)} />
                        <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className='flex gap-5'>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold flex flex-col text-gray-900 dark:text-white" style={{
                            lineHeight:'17px'
                          }}>
                            {post.author.username}
                            <span className='text-[12px] font-normal'>
                              {
                                post?.author?.email
                              }
                            </span>
                          </h3>
                          {post.isPinned && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {post.isEdited && (
                            <span className="text-xs text-gray-500">(edited)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {/* <span >{formatTime(post.createdAt)}</span> */}
                          {/* <span>•</span> */}
                          {/* <div className="flex items-center gap-1">
                            <span className="capitalize px-4 py-2 bg-white text-[10px] font-bold text-black rounded-[25px]">{post.visibility}</span>
                          </div> */}
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      const isAuthor = post.author._id === user.id || post.author._id === user._id
                      return isAuthor
                    })() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="sm" className={'w-12 bg-white dark:bg-black'}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                          
                            handleDeletePost(post._id)
                          }} className={'px-5 h-10 w-[150px] flex items-center justify-center cursor-pointer'}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}


{(() => {
                      const isAuthor = post.author._id === user.id || post.author._id === user._id
                      return !isAuthor
                    })() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="sm" className={'w-12 bg-white dark:bg-black'}>
                            <MoreHorizontal className="w-4 h-4 " />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                          
                            handleSendFriendRequest(post.author._id)
                          }} className={'px-5 w-[150px] flex items-center justify-center h-10 cursor-pointer'}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Friend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 flex-1">
                  <h3 className="text-lg text-gray-900 dark:text-white mb-2 truncate">
                    {post.title}
                  </h3>
                  {/* <div className="text-gray-900 dark:text-white whitespace-pre-wrap text-justify">
                    {post.content.length > 100 && !expandedPosts.has(post._id) ? (
                      <>
                        <span className='text-justify text-sm w-full'>{post.content.substring(0, 100)}...</span>
                        <button
                          onClick={() => navigate(`/post/${post._id}`)}
                          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium ml-1"
                        >
                          View Details
                        </button>
                      </>
                    ) : (
                      <>
                        <span className='text-justify text-sm w-full'>{post.content}</span>
                        {post.content.length > 100 && (
                          <button
                            onClick={() => togglePostExpansion(post._id)}
                            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium ml-1"
                          >
                            Show Less
                          </button>
                        )}
                      </>
                    )}
                  </div> */}
                  
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4">
                      <div className={`grid gap-2 ${
                        post.images.length === 1 ? 'grid-cols-1' :
                        post.images.length === 2 ? 'grid-cols-2' :
                        post.images.length === 3 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`} >
                        {post.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-[25px] border-2 cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                console.error('Image failed to load:', image, e)
                                e.target.style.display = 'none'
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', image)
                              }}
                              onClick={() => navigate(`/post/${post._id}`)}
                            />
                            {post.images.length > 4 && index === 3 && (
                              <div 
                                className="absolute inset-0 bg-[rgba(0,0,0,.7)] dark:bg-[rgba(0,0,0,.2)] bg-opacity-50 rounded-[25px] flex items-center justify-center cursor-pointer"
                                onClick={() => navigate(`/post/${post._id}`)}
                              >
                                <span className="text-white font-semibold">
                                  +{post.images.length - 4} more
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-[25px]  px-4 py-2">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] mt-auto" style={{
                  borderBottomLeftRadius: "20px",
                  borderBottomRightRadius: "20px"
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(post._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[25px] w-[50px] border transition-all duration-200 ${
                          isLiked(post) 
                            ? 'text-red-500 bg-red-50 hover:bg-red-100 shadow-sm' 
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50 hover:shadow-sm'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked(post) ? 'fill-current' : ''}`} />
                        {/* <span className="font-medium">{post.likedBy?.length || 0}</span> */}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/post/${post._id}`)}
                        className="flex w-[50px] border  items-center gap-2 px-4 py-2 rounded-[25px] text-gray-500 hover:text-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {/* <span className="font-medium">{post.comments.length}</span> */}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSharePost(post._id)}
                        className="flex w-[50px] border  items-center gap-2 px-4 py-2 rounded-[25px] text-gray-500 hover:text-green-500 hover:bg-green-50 hover:shadow-sm transition-all duration-200"
                      >
                        <Share2 className="w-4 h-4" />
                       {/* <span className="font-medium">{post.shares.length}</span> */}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {formatTime(post.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {showComments[post._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t mt-5 border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6 space-y-4">
                        {/* Add Comment */}
                        <div className="flex gap-3 items-center mb-10">
                          <Avatar className="w-12 h-12 border border-gray-200 dark:border-gray-700 p-1">
                            <AvatarImage className={'rounded-[25px]'} {...getAvatarProps(user.avatar, user.username)} />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Write a comment..."
                              value={commentText[post._id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                            />
                            <Button
                              onClick={() => handleAddComment(post._id)}
                              disabled={!commentText[post._id]?.trim()}
                              size="sm"
                              className={'w-12'}
                            > <Send className="w-4 h-4" />
                              
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        {post.comments.slice(0, visibleComments[post._id] || 3).map((comment) => (
                          <div key={comment._id} className="flex gap-3 relative overflow-hidden rounded-[25px]">
                            <div className="absolute h-[30%]  border border-gray-200 dark:border-gray-600 w-[30px] top-[40px] left-[20px]" style={{
                              borderWidth: '0px 0 1px 1px',
                              borderBottomLeftRadius: "10px"
                            }}></div>
                            <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700">
                              <AvatarImage className={'p-1 rounded-[25px] border border-gray-100 dark:border-gray-700'} {...getAvatarProps(comment.user.avatar, comment.user.username)} />
                              <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-3 px-5 mt-8">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {comment.user.username}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {comment.content}
                                </p>
                              </div>
                            
                            
                            </div>
                          </div>
                        ))}
                        
                        {/* Show More Comments Button */}
                        {post.comments && post.comments.length > (visibleComments[post._id] || 3) && (
                          <div className="flex justify-center pt-2">
                            <Button
                              onClick={() => showMoreComments(post._id)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Show more comments ({post.comments.length - (visibleComments[post._id] || 3)} more)
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black border rounded-xl shadow-xl w-full  max-w-xl border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Post</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Post Title */}
                <div>
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    
                  />
                </div>

                {/* Post Content */}
                <div>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                
                  
                  {/* File Selection */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex-1 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[25px] cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to select image
                        </p>
                      </div>
                    </label>
                  
                  </div>
                 <div className="flex w-full justify-end">
                 {selectedFiles.length > 0 && (
                      <Button
                        onClick={handleUploadImages}
                        disabled={uploadingImages}
                        className=""
                      >
                        {uploadingImages ? 'Uploading...' : 'Upload Images'}
                      </Button>
                    )}
                 </div>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4">
                    
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-[25px]">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {file.name}
                            </span>
                            <button
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Images Preview */}
                  {newPost.images.length > 0 && (
                    <div className="mb-4">
                    
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newPost.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-[25px]"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-[25px] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} disabled={!newTag.trim()} className="w-12">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibility */}
                <div>
                 
                  <Select
                    value={newPost.visibility}
                    onValueChange={(value) => setNewPost(prev => ({ ...prev, visibility: value, teamId: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Team
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Selection */}
                {newPost.visibility === 'team' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Team
                    </label>
                    <Select
                      value={newPost.teamId}
                      onValueChange={(value) => setNewPost(prev => ({ ...prev, teamId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() || loading}
                    className={'w-[200px]'}
                  >
                    {loading ? 'Creating...' : 'Create Post'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={sharingPost?._id}
        postTitle={sharingPost?.title}
        postDescription={sharingPost?.content}
      />
    </div>
  )
}

export default Posts
