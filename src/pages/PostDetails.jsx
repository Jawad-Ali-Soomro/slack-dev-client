import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Bookmark, 
  MoreVertical,
  User,
  Calendar,
  Tag,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Edit,
  Trash2,
  Reply,
  Smile,
  ThumbsDown,
  X,
  Save
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'
import ShareModal from '../components/ShareModal'
import SkeletonLoader from '../components/SkeletonLoader'
import UserDetailsModal from '../components/UserDetailsModal'
import postService from '../services/postService'
import { toast } from 'sonner'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { AvatarFallback } from '../components/ui/avatar'
import { Input } from '../components/ui/input'

const PostDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [suggestedPosts, setSuggestedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingPost, setSharingPost] = useState(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLikes, setCommentLikes] = useState({})
  const [loadingComments, setLoadingComments] = useState(false)
  const [showComments, setShowComments] = useState({})
  const [commentsPage, setCommentsPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [userPosts, setUserPosts] = useState([])
  const [loadingUserPosts, setLoadingUserPosts] = useState(false)

  useEffect(() => {
    loadPost()
    loadSuggestedPosts()
    loadComments()
  }, [id])

  useEffect(() => {
    if (post?.author?._id) {
      loadUserPosts()
    }
  }, [post?.author?._id])

  const formatTime = (date) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return postDate.toLocaleDateString()
  }

  const loadPost = async () => {
    try {
      setLoading(true)
      const response = await postService.getPost(id)
      setPost(response.post)
      setLiked(response.liked || false)
      setBookmarked(response.bookmarked || false)
      setLikesCount(response.likesCount || 0)
      setComments(response.post?.comments || [])
      
      // Initialize commentLikes with actual like status from server
      const likesState = {}
      response.post?.comments?.forEach(comment => {
        const isLiked = comment.likes?.some(like => 
          like.user === user?._id || like.user === user?.id
        )
        likesState[comment._id] = isLiked || false
      })
      setCommentLikes(likesState)
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoadingComments(true)
      } else {
        setLoadingMoreComments(true)
      }
      
      const response = await postService.getPostComments(id, { page, limit: 10 })
      
      if (reset || page === 1) {
        setComments(response.comments || [])
        // Initialize commentLikes with actual like status from server
        const likesState = {}
        response.comments?.forEach(comment => {
          const isLiked = comment.likes?.some(like => 
            like.user === user?._id || like.user === user?.id
          )
          likesState[comment._id] = isLiked || false
        })
        setCommentLikes(likesState)
      } else {
        setComments(prev => [...prev, ...(response.comments || [])])
        // Update commentLikes for new comments
        const newLikesState = {}
        response.comments?.forEach(comment => {
          const isLiked = comment.likes?.some(like => 
            like.user === user?._id || like.user === user?.id
          )
          newLikesState[comment._id] = isLiked || false
        })
        setCommentLikes(prev => ({ ...prev, ...newLikesState }))
      }
      
      setHasMoreComments(response.hasMore || false)
      setCommentsPage(page)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(false)
      setLoadingMoreComments(false)
    }
  }

  const loadSuggestedPosts = async () => {
    try {
      const response = await postService.getPosts({ limit: 6, random: true })
      // Filter out the current post and take first 3
      const filteredPosts = (response.posts || []).filter(post => post._id !== id).slice(0, 3)
      setSuggestedPosts(filteredPosts)
    } catch (error) {
      console.error('Error loading suggested posts:', error)
    }
  }

  const loadUserPosts = async () => {
    if (!post?.author?._id) return
    
    try {
      setLoadingUserPosts(true)
      const response = await postService.getPosts({ 
        author: post.author._id, 
        limit: 6 
      })
      // Filter out the current post
      const filteredPosts = (response.posts || []).filter(userPost => userPost._id !== id).slice(0, 4)
      setUserPosts(filteredPosts)
    } catch (error) {
      console.error('Error loading user posts:', error)
    } finally {
      setLoadingUserPosts(false)
    }
  }

  const handleLike = async () => {
    try {
      const response = await postService.toggleLike(id)
      setLiked(response.liked)
      setLikesCount(response.likesCount)
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await postService.toggleBookmark(id)
      setBookmarked(response.bookmarked)
      toast.success(response.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks')
    } catch (error) {
      console.error('Error bookmarking post:', error)
      toast.error('Failed to bookmark post')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      const response = await postService.addComment(id, newComment)
      setComments(prev => [...prev, response.comment])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleCommentLike = async (commentId) => {
    try {
      const response = await postService.toggleCommentLike(id, commentId)
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: response.isLiked
      }))
      // Update the comment in the comments array
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: response.likesCount }
          : comment
      ))
    } catch (error) {
      console.error('Error liking comment:', error)
      toast.error('Failed to like comment')
    }
  }

  const handleCommentShare = (comment) => {
    setSharingPost({
      _id: comment._id,
      title: `Comment by ${comment.user.username}`,
      content: comment.content
    })
    setShowShareModal(true)
  }

  const handleLoadMoreComments = () => {
    if (hasMoreComments && !loadingMoreComments) {
      loadComments(commentsPage + 1)
    }
  }

  const handleEditComment = (comment) => {
    setEditingComment(comment._id)
    setEditCommentText(comment.content)
  }

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return
    
    try {
      const response = await postService.updateComment(id, commentId, editCommentText)
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: editCommentText, updatedAt: new Date() }
          : comment
      ))
      setEditingComment(null)
      setEditCommentText('')
      toast.success('Comment updated successfully')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await postService.deleteComment(id, commentId)
      setComments(prev => prev.filter(comment => comment._id !== commentId))
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleReplyToComment = (commentId) => {
    setReplyingTo(commentId)
    setReplyText('')
  }

  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim()) return
    
    try {
      const response = await postService.addReply(id, parentCommentId, replyText)
      setComments(prev => prev.map(comment => 
        comment._id === parentCommentId 
          ? { ...comment, replies: [...(comment.replies || []), response.reply] }
          : comment
      ))
      setReplyingTo(null)
      setReplyText('')
      toast.success('Reply added successfully')
    } catch (error) {
      console.error('Error adding reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const handleCommentReaction = async (commentId, reactionType) => {
    try {
      const response = await postService.addCommentReaction(id, commentId, reactionType)
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, reactions: response.reactions }
          : comment
      ))
    } catch (error) {
      console.error('Error adding reaction:', error)
      toast.error('Failed to add reaction')
    }
  }



  const formatDate = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const isLiked = (post) => {
    return post.likedBy && post.likedBy.includes(user?.id || user?._id)
  }

  // console.log('Post:', post)

  const handleToggleLike = async (postId) => {
    try {
      console.log('User object:', user)
      console.log('User ID:', user?.id || user?._id)
      console.log('Post ID:', postId)
      const response = await postService.toggleLike(postId)
      console.log('Like response:', response) // Debug log
      
      // Update the post in the state
      setPost(prev => ({
        ...prev,
        likedBy: response.liked 
          ? [...(prev.likedBy || []), user?.id || user?._id]
          : (prev.likedBy || []).filter(id => id !== (user?.id || user?._id))
      }))
      
      // Also update the local liked state
      setLiked(response.liked)
      setLikesCount(response.likesCount)
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to toggle like')
    }
  }


  const handleUserClick = (userData) => {
    setSelectedUser(userData);
    setShowUserModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Post not found
            </h1>
            <Button onClick={() => navigate('/dashboard/posts')}>
              Back to Posts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='pb-10 w-full justify-center items-center pt-10'>
      <div className=" flex items-center justify-center w-full">
        {/* Back Button */}
    

        <div className="flex items-start justify-center gap-8 w-full max-w-7xl">
          {/* Main Post */}
          <div className='w-full max-w-4xl flex-shrink-0'>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="dark:bg-black rounded-lg shadow-xl border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-6 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer" onClick={() => handleUserClick(post.author)}>
                      <img
                        {...getAvatarProps(post.author?.avatar, post.author?.username)}
                        alt={post.author?.username}
                        className="w-16 h-16 rounded-lg object-cover border-4 border-white dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow"
                      />
                      {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border border-white dark:border-gray-800 rounded-lg"></div> */}
                    </div>
                    <div>
                      <h3 
                        className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleUserClick(post.author)}
                      >
                        {post.author?.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={'w-12 bg-white dark:bg-black hover:bg-white dark:hover:bg-gray-900' }>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className={'px-5 h-10'} onClick={() => setShowShareModal(true)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className={'px-5 h-10'} onClick={handleBookmark}>
                        <Bookmark className="w-4 h-4 mr-2" />
                        {bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 uppercase bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        <span className='text-xs'>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {post.images && post.images.length > 0 && (
                  <div className="mt-8 p-5 rounded-lg">
                    <div className={`grid gap-4 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      post.images.length === 3 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {post.images.map((image, index) => (
                        <div key={index} className="relative flex dark:border-gray-700 justify-center items-center bg-gray-100 dark:bg-[rgba(255,255,255,.1)] p-4  group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow" style={{
                            border: post?.images?.length <= 1 ? "none" : "" ,
                            padding: post?.images?.length <= 1 ? "0" : "" 
                        }}>
                          <img
                            src={image.startsWith('http') ? image : `http://localhost:4000${image}`}
                            alt={`${post.title} - Image ${index + 1}`}
                            className="w-full max-h-[400px] h-auto object-cover transition-transform rounded-lg "
                          />
                          <div className="absolute  bg-gray-100  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Post Content */}
              <div className="p-8">
                <div className="prose dark:prose-invert max-w-none">

                  <div className="text-gray-700 text-justify dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {post.content.length > 250 && !isExpanded ? (
                      <>
                        <span style={{
                          lineHeight: '5px'
                        }}>{post.content.substring(0, 160)}...</span>
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="capitalize cursor-pointer font-semibold ml-2 px-3 py-1 rounded-lg transition-colors"
                        >
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{
                          lineHeight: '5px'
                        }}>{post.content}</span>
                        {post.content.length > 250 && (
                          <button
                            onClick={() => setIsExpanded(false)}
                            className="capitalize cursor-pointer font-semibold ml-2 px-3 py-1 rounded-lg transition-colors"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] mt-auto" style={{
                borderBottomLeftRadius: "20px",
                borderBottomRightRadius: "20px"
              }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(post._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg w-[150px] border transition-all duration-200 ${
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
                        onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                        className="flex w-[150px] border  items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {/* <span className="font-medium">{post.comments.length}</span> */}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSharingPost(post)
                          setShowShareModal(true)
                        }}
                        className="flex w-[150px] border  items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 hover:shadow-sm transition-all duration-200"
                      >
                        <Share2 className="w-4 h-4" />
                        {/* <span className="font-medium">Share</span> */}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {formatTime(post.createdAt)}
                    </div>
                  </div>
                </div>

              {/* Comments Section */}
              <div className="border-gray-200 dark:border-gray-700 mt-5">
                {/* Add Comment Form */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex gap-4">
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      {...getAvatarProps(user?.avatar, user?.username)}
                      alt={user?.username}
                      className="w-12 p-1 border border-gray-200 dark:border-gray-700 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 flex items-center gap-3">
                      <motion.input
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                      />
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="w-12 h-12 rounded-lg bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Comments List */}
                <div className="px-6 pb-6">
                  {loadingComments ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 ">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {comments.map((comment, index) => (
                          <motion.div
                            key={comment._id}
                            initial={{ opacity: 0, y: 20, scale:1 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 1 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: index * 0.1,
                              ease: "easeOut"
                            }}
                            className="flex gap-3 relative overflow-hidden"
                          >
                            <div className="absolute h-[30%]  border border-gray-200 dark:border-gray-600 w-[50px] top-[40px] left-[20px]" style={{
                              borderWidth: '0px 0 1px 1px',
                              borderBottomLeftRadius: "10px"
                            }}></div>
                            <Avatar className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700">
                              <AvatarImage className={'p-1 rounded-lg border border-gray-100 dark:border-gray-700'} {...getAvatarProps(comment.user.avatar, comment.user.username)} />
                              <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="rounded-lg p-3 px-5 mt-8 hover:shadow-md transition-all duration-300 "
                              >
                                <div className="bg-gray-100 dark:bg-[rgba(255,255,255,.1)] px-6 py-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                                      {comment.user.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(comment.createdAt)}
                                    </span>
                                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                      <span className="text-xs text-gray-400">(edited)</span>
                                    )}
                                  </div>
                                  
                                  {/* Comment Actions for Author */}
                                  {user && (user.id === comment.user._id || user._id === comment.user._id) && (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditComment(comment)}
                                        className="h-6 w-10 p-5 border hover:text-blue-500 text-blue-500"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="h-6 w-10 p-5 border hover:text-red-500 text-red-500"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Comment Content */}
                                {editingComment === comment._id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="min-h-[60px] text-sm"
                                      placeholder="Edit your comment..."
                                    />
                                    <div className="flex gap-2 mb-5">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateComment(comment._id)}
                                        disabled={!editCommentText.trim()}
                                        className={'w-[50px]'}
                                      >
                                        <Save />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingComment(null)
                                          setEditCommentText('')
                                        }}
                                        className={'w-[120px]'}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    {comment.content}
                                  </p>
                                )}

                                {/* Comment Actions */}
                                <div className="flex items-center gap-1 text-xs">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCommentLike(comment._id)}
                                    className={`h-10 w-10 text-xs border ${
                                      commentLikes[comment._id] 
                                        ? 'bg-white border-none' 
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <ThumbsUp
                                      className={`w-3 h-3 ${
                                        commentLikes[comment._id]
                                          ? 'fill-gray-600 text-gray-600'
                                          : 'text-gray-500'
                                      }`}
                                    />
                                    {/* {comment.likes?.length || 0} */}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReplyToComment(comment._id)}
                                    className="h-10 w-30 border px-2 text-xs text-gray-500"
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Reply
                                  </Button>

                             

                                  {/* Reaction Buttons */}
                                  {/* <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCommentReaction(comment._id, 'like')}
                                      className="h-6 w-6 p-0 text-xs text-gray-500 hover:text-blue-500"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCommentReaction(comment._id, 'love')}
                                      className="h-6 w-6 p-10 text-xs text-gray-500 hover:text-red-500 bg-black"
                                    >
                                      <Heart className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCommentReaction(comment._id, 'laugh')}
                                      className="h-6 w-6 p-0 text-xs text-gray-500 hover:text-yellow-500"
                                    >
                                      <Smile className="w-3 h-3" />
                                    </Button>
                                  </div> */}
                                </div>
                                </div>

                                {/* Reply Form */}
                                {replyingTo === comment._id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 py-3 rounded-lg"
                                  >
                                    <div className="flex gap-2">
                                      <Input
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="min-h-[40px] text-sm bg-gray-100 dark:bg-[rgba(255,255,255,.01)]"
                                      />
                                      <div className="flex flex-col gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddReply(comment._id)}
                                          disabled={!replyText.trim()}
                                          className="h-12 w-12 px-3"
                                        >
                                          <Send className="w-3 h-3" />
                                        </Button>
                                        {/* <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setReplyingTo(null)}
                                          className="h-8 px-3"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button> */}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-3 ml-4 space-y-2">
                                    {comment.replies.map((reply) => (
                                      <motion.div
                                        key={reply._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-2 p-3 flex items-center justify-center bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-lg"
                                      >
                                        <Avatar className="w-8 h-8 p-1 rounded-full border">
                                          <AvatarImage {...getAvatarProps(reply.user.avatar, reply.user.username)} className='rounded-full' />
                                          <AvatarFallback className="text-xs">{reply.user.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-xs text-gray-900 dark:text-white">
                                              {reply.user.username}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {formatTime(reply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-700 dark:text-gray-300">
                                            {reply.content}
                                          </p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Load More Comments Button */}
                      {hasMoreComments && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={handleLoadMoreComments}
                            disabled={loadingMoreComments}
                            className="px-6"
                          >
                            {loadingMoreComments ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                Loading...
                              </div>
                            ) : (
                              'Show More Comments'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                     
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        No comments yet. Be the first to comment!
                      </motion.p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.article>

          </div>

          {/* Fixed Right Sidebar - User's Other Posts */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="fixed top-24 right-8 w-[500px] max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="bg-white dark:bg-black rounded-lg ">
                
                {loadingUserPosts ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.slice(0, 4).map((userPost) => (
                      <motion.div
                        key={userPost._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/post/${userPost._id}`)}
                      >
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {userPost.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                            {userPost.content}
                          </p>
                          
                          {/* Post Images Preview */}
                          {userPost.images && userPost.images.length > 0 && (
                            <div className="mb-3">
                              <div className="grid gap-2">
                                {userPost.images.slice(0, 2).map((image, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={image.startsWith('http') ? image : `http://localhost:4000${image}`}
                                      alt={`${userPost.title} - Image ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg"
                                    />
                                    {userPost.images.length > 2 && index === 1 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                          +{userPost.images.length - 2}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Post Stats */}
                          {/* <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
                        
                            <span>{formatTime(userPost.createdAt)}</span>
                          </div> */}

                          {/* Tags */}
                          {/* {userPost.tags && userPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {userPost.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {userPost.tags.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{userPost.tags.length - 2} more
                                </span>
                              )}
                            </div>
                          )} */}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No other posts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Suggested Posts */}
          <div className="lg:hidden w-full mt-8">
            <div className="bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <img
                  {...getAvatarProps(post?.author?.avatar, post?.author?.username)}
                  alt={post?.author?.username}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    More from {post?.author?.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userPosts.length} other posts
                  </p>
                </div>
              </div>

              {loadingUserPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : userPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userPosts.slice(0, 4).map((userPost) => (
                    <motion.div
                      key={userPost._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/post/${userPost._id}`)}
                    >
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {userPost.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {userPost.content}
                        </p>
                        
                        {/* Post Images Preview */}
                        {userPost.images && userPost.images.length > 0 && (
                          <div className="mb-3">
                            <img
                              src={userPost.images[0].startsWith('http') ? userPost.images[0] : `http://localhost:4000${userPost.images[0]}`}
                              alt={`${userPost.title} - Image`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Post Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {userPost.likedBy?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {userPost.comments?.length || 0}
                            </span>
                          </div>
                          <span>{formatTime(userPost.createdAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No other posts yet</p>
                </div>
              )}
            </div>
          </div>
        
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={sharingPost?._id || post?._id}
        postTitle={sharingPost?.title || post?.title}
        postDescription={sharingPost?.content || post?.content}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        userId={selectedUser?._id}
      />
    
    </div>
  )
}

export default PostDetails
