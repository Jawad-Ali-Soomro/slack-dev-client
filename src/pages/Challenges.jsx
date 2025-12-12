import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HorizontalLoader from '../components/HorizontalLoader'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Trophy,
  Code,
  CheckCircle,
  X,
  Filter,
  Star,
  Clock,
  Target,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import challengeService from '../services/challengeService'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const DIFFICULTY_ICONS = {
  beginner: '🟢',
  intermediate: '🟡',
  advanced: '🔴',
}

const CHALLENGE_CATEGORIES = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'Data Structures',
  'Algorithms',
  'Web Development',
  'Database',
  'API Development',
  'System Design',
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile Development',
  'DevOps',
  'Security',
  'Testing',
  'Other',
]

const Challenges = () => {
  document.title = 'Challenges - Practice & Learn'

  const { user } = useAuth()
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'completed'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState(null)
  const [completedChallenges, setCompletedChallenges] = useState(new Set())
  const [totalPoints, setTotalPoints] = useState(0)

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: '',
    instructions: '',
    starterCode: '',
    solution: '',
    testCases: '',
    points: 10,
    tags: '',
  })

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await challengeService.getCategories()
      const apiCategories = response.categories || []
      const allCategories = [...new Set([...CHALLENGE_CATEGORIES, ...apiCategories])]
      setCategories(allCategories.sort())
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories(CHALLENGE_CATEGORIES.sort())
    }
  }, [])

  // Load challenges
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true)
      
      // If "My Completed" tab is active, load completed challenges
      if (activeTab === 'completed') {
        const response = await challengeService.getMyChallenges()
        let completedChallenges = response.challenges || []
        
        // Apply filters to completed challenges
        if (selectedDifficulty && selectedDifficulty !== 'all') {
          completedChallenges = completedChallenges.filter(c => c.difficulty === selectedDifficulty)
        }
        if (selectedCategory && selectedCategory !== 'all') {
          completedChallenges = completedChallenges.filter(c => c.category === selectedCategory)
        }
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          completedChallenges = completedChallenges.filter(c => 
            c.title.toLowerCase().includes(searchLower) || 
            c.description.toLowerCase().includes(searchLower)
          )
        }
        
        setChallenges(completedChallenges)
        setTotalPoints(response.totalPoints || 0)
      } else {
        // Load all challenges with filters
        const filters = {
          difficulty: selectedDifficulty && selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
        }
        const response = await challengeService.getChallenges(filters)
        setChallenges(response.challenges || [])
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
      toast.error(error.message || 'Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }, [selectedDifficulty, selectedCategory, searchTerm, activeTab])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadChallenges()
  }, [loadChallenges])

  const handleCreateChallenge = async () => {
    // Check if user has enough points (50+) to create a challenge
    if (!editingChallenge && totalPoints < 50) {
      toast.error(`You need at least 50 challenge points to create a challenge. You currently have ${totalPoints} points.`)
      return
    }

    if (!newChallenge.title || !newChallenge.description || !newChallenge.category || !newChallenge.instructions) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const challengeData = {
        ...newChallenge,
        tags: newChallenge.tags ? newChallenge.tags.split(',').map((t) => t.trim()) : [],
        testCases: newChallenge.testCases
          ? newChallenge.testCases.split('\n').map((tc) => {
              const parts = tc.split('|')
              return {
                input: parts[0]?.trim() || '',
                expectedOutput: parts[1]?.trim() || '',
                description: parts[2]?.trim() || '',
              }
            })
          : [],
      }

      if (editingChallenge) {
        await challengeService.updateChallenge(editingChallenge._id, challengeData)
        toast.success('Challenge updated successfully!')
      } else {
        await challengeService.createChallenge(challengeData)
        toast.success('Challenge created successfully!')
      }

      setShowCreateModal(false)
      setNewChallenge({
        title: '',
        description: '',
        difficulty: 'beginner',
        category: '',
        instructions: '',
        starterCode: '',
        solution: '',
        testCases: '',
        points: 10,
        tags: '',
      })
      setEditingChallenge(null)
      await loadChallenges()
      await loadCategories()
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast.error(error.message || 'Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return
    }

    try {
      setLoading(true)
      await challengeService.deleteChallenge(challengeId)
      toast.success('Challenge deleted successfully!')
      await loadChallenges()
    } catch (error) {
      console.error('Error deleting challenge:', error)
      toast.error(error.message || 'Failed to delete challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge)
    setNewChallenge({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      category: challenge.category,
      instructions: challenge.instructions,
      starterCode: challenge.starterCode || '',
      solution: challenge.solution || '',
      testCases: challenge.testCases
        ? challenge.testCases.map((tc) => `${tc.input}|${tc.expectedOutput}|${tc.description || ''}`).join('\n')
        : '',
      points: challenge.points,
      tags: challenge.tags ? challenge.tags.join(', ') : '',
    })
    setShowCreateModal(true)
  }

  const handleViewChallenge = (challengeId) => {
    navigate(`/dashboard/challenges/${challengeId}`)
  }


  // Load completed challenges and total points
  useEffect(() => {
    const loadCompletedChallenges = async () => {
      try {
        const response = await challengeService.getMyChallenges()
        console.log('My challenges response:', response)
        console.log('Total points:', response.totalPoints)
        const completedIds = response.challenges.map(c => c._id)
        console.log('Completed challenge IDs:', completedIds)
        setCompletedChallenges(new Set(completedIds))
        setTotalPoints(response.totalPoints || 0)
      } catch (error) {
        console.error('Error loading completed challenges:', error)
      }
    }
    if (user) {
      loadCompletedChallenges()
    }
  }, [user])

  if (loading && challenges.length === 0) {
    return (
      <HorizontalLoader
        message="Loading challenges..."
        subMessage="Preparing your practice challenges"
        progress={75}
        className="min-h-screen"
      />
    )
  }

  return (
    <div className="ambient-light">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
              <Trophy size={15} />
            </div>
            <h1 className="text-2xl font-bold">Challenges</h1>
          </div>
            <div className="ml-auto flex items-center gap-4">
             <div className="flex items-center gap-2 p-2 border-2 pr-10 rounded-[50px] border-gray-300 dark:border-gray-700">
               <div className="flex items-center justify-center bg-white dark:bg-gray-800 w-[40px] h-[40px] rounded-full">
                 <Award className="w-5 h-5 text-yellow-500" />
               </div>
               <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                 Challenge Points: <span className="text-black dark:text-white font-bold">{totalPoints}</span>
               </span>
             </div>
           </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pt-10"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              My Completed
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-12 max-w-[600px] border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-black dark:text-white"
              />
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 h-13 bg-white dark:bg-transparent cursor-pointer dark:text-white">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#111827]">
                <SelectItem className={'h-10 cursor-pointer px-5'} value="all">All Difficulties</SelectItem>
                <SelectItem className={'h-10 cursor-pointer px-5'} value="beginner">Beginner</SelectItem>
                <SelectItem className={'h-10 cursor-pointer px-5'} value="intermediate">Intermediate</SelectItem>
                <SelectItem className={'h-10 cursor-pointer px-5'} value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 bg-white dark:bg-transparent cursor-pointer dark:text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#111827]">
                <SelectItem className={'h-10 cursor-pointer px-5'} value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} className={'h-10 cursor-pointer px-5'} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (totalPoints < 50) {
                  toast.error(`You need at least 50 challenge points to create a challenge. You currently have ${totalPoints} points. Keep solving challenges to unlock this feature!`)
                  return
                }
                setShowCreateModal(true)
              }}
              disabled={totalPoints < 50}
              className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              title={totalPoints < 50 ? `Requires 50+ points (You have ${totalPoints})` : 'Create Challenge'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
              {totalPoints < 50 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  50+
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[650px] overflow-y-auto p-2">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-[30px] p-6 border-gray-300 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleViewChallenge(challenge._id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Code className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <Badge className={DIFFICULTY_COLORS[challenge.difficulty]}>
                    {DIFFICULTY_ICONS[challenge.difficulty]} {challenge.difficulty}
                  </Badge>
                  {completedChallenges.has(challenge._id) && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-semibold">{challenge.points}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {challenge.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-gray-300 dark:border-gray-700">
                  {challenge.category}
                </Badge>
                {user && challenge.createdBy?._id === user.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditChallenge(challenge)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChallenge(challenge._id)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {challenges.length === 0 && !loading && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No challenges found. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-[30px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingChallenge ? 'Edit Challenge' : 'Create Challenge'}
                </h2>
                {!editingChallenge && totalPoints < 50 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    ⚠️ Requires 50+ points (You have {totalPoints})
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Challenge Title *"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              />
              <Textarea
                placeholder="Description *"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={newChallenge.difficulty}
                  onValueChange={(value) => setNewChallenge({ ...newChallenge, difficulty: value })}
                >
                  <SelectTrigger className="w-full px-5 h-13 bg-white dark:bg-transparent cursor-pointer dark:text-white">
                    <SelectValue placeholder="Difficulty *" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#111827]">
                    <SelectItem className={'h-10 cursor-pointer px-5'} value="beginner">Beginner</SelectItem>
                    <SelectItem className={'h-10 cursor-pointer px-5'} value="intermediate">Intermediate</SelectItem>
                    <SelectItem className={'h-10 cursor-pointer px-5'} value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newChallenge.category}
                  onValueChange={(value) => setNewChallenge({ ...newChallenge, category: value })}
                >
                  <SelectTrigger className="w-full px-5 h-13 bg-white dark:bg-transparent cursor-pointer dark:text-white">
                    <SelectValue placeholder="Category *" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#111827]">
                    {categories.map((cat) => (
                      <SelectItem key={cat} className={'h-10 cursor-pointer px-5'} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Instructions * (Markdown supported)"
                value={newChallenge.instructions}
                onChange={(e) => setNewChallenge({ ...newChallenge, instructions: e.target.value })}
                rows={5}
              />
              <Textarea
                placeholder="Starter Code (optional)"
                value={newChallenge.starterCode}
                onChange={(e) => setNewChallenge({ ...newChallenge, starterCode: e.target.value })}
                rows={5}
                className="font-mono text-sm"
              />
              <Textarea
                placeholder="Solution (optional)"
                value={newChallenge.solution}
                onChange={(e) => setNewChallenge({ ...newChallenge, solution: e.target.value })}
                rows={5}
                className="font-mono text-sm"
              />
              <Textarea
                placeholder="Test Cases (one per line, format: input|expectedOutput|description)"
                value={newChallenge.testCases}
                onChange={(e) => setNewChallenge({ ...newChallenge, testCases: e.target.value })}
                rows={3}
                className="font-mono text-sm"
              />
            
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Points"
                  value={newChallenge.points}
                  onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) || 10 })}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newChallenge.tags}
                  onChange={(e) => setNewChallenge({ ...newChallenge, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateChallenge} 
                disabled={!editingChallenge && totalPoints < 50}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingChallenge ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}

export default Challenges

