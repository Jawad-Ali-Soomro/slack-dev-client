import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  ArrowLeft,
  CheckCircle,
  X,
  Star,
  Code,
  Trophy,
  Award,
  Clock,
  Play,
  FileText,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import challengeService from '../services/challengeService'
import { useAuth } from '../contexts/AuthContext'
import HorizontalLoader from '../components/HorizontalLoader'

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

const ChallengeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userSolution, setUserSolution] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [codeOutput, setCodeOutput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [userSolutionData, setUserSolutionData] = useState(null)
  const [activeTab, setActiveTab] = useState('instructions') // 'instructions'

  useEffect(() => {
    document.title = challenge ? `${challenge.title} - Challenge` : 'Challenge Detail'
  }, [challenge])

  useEffect(() => {
    loadChallenge()
  }, [id])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      const response = await challengeService.getChallengeById(id)
      console.log('Challenge response:', response)
      
      setChallenge(response.challenge)
      setIsCompleted(response.isCompleted || false)
      
      if (response.userSolution) {
        setUserSolutionData(response.userSolution)
        setUserSolution(response.userSolution.solution)
        setUserAnswer(response.userSolution.answer || '')
      } else {
        setUserSolutionData(null)
        setUserSolution(response.challenge.starterCode || '')
        setUserAnswer('')
      }
      setCodeOutput('')
      setCodeError('')
    } catch (error) {
      console.error('Error loading challenge:', error)
      toast.error(error.message || 'Failed to load challenge')
      navigate('/dashboard/challenges')
    } finally {
      setLoading(false)
    }
  }

  const handleRunCode = () => {
    if (!userSolution.trim()) {
      toast.error('Please write some code first')
      return
    }

    try {
      setCodeError('')
      setCodeOutput('')
      
      // Capture console.log
      const logs = []
      const originalLog = console.log
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '))
        originalLog(...args)
      }

      // Execute code
      let result
      try {
        // Wrap code in function to capture return value
        const wrappedCode = `
          (function() {
            ${userSolution}
          })()
        `
        result = eval(wrappedCode)
      } catch (error) {
        setCodeError(error.message || 'Syntax error or execution error')
        console.log = originalLog
        return
      }

      // Restore console.log
      console.log = originalLog

      // Capture output
      let output = logs.join('\n')
      if (result !== undefined) {
        if (output) output += '\n'
        output += typeof result === 'object' ? JSON.stringify(result) : String(result)
      }

      setCodeOutput(output.trim() || 'No output')
      
      // Always auto-fill answer with code output
      if (output.trim()) {
        setUserAnswer(output.trim())
      } else {
        setUserAnswer('')
      }
    } catch (error) {
      setCodeError(error.message || 'Failed to execute code')
      setCodeOutput('')
    }
  }

  const handleSubmitSolution = async () => {
    if (!challenge || !userSolution.trim()) {
      toast.error('Please write your solution code')
      return
    }

    if (!userAnswer.trim()) {
      toast.error('Please run your code first to generate the answer/output')
      return
    }

    try {
      setSubmitting(true)
      const response = await challengeService.submitSolution(challenge._id, userSolution, userAnswer)
      
      if (response.isCorrect) {
        let message = `Solution submitted! You earned ${response.pointsEarned} points! 🎉`
        
        // Show award notification if any were earned
        if (response.newlyEarnedAwards && response.newlyEarnedAwards.length > 0) {
          const awardsText = response.newlyEarnedAwards.map(a => `${a.icon} ${a.name}`).join(', ')
          message += `\n\n🏆 New Award Unlocked: ${awardsText}`
          
          // Show special toast for awards
          toast.success(
            <div>
              <div className="font-bold mb-2">🎉 Award Unlocked!</div>
              {response.newlyEarnedAwards.map((award, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{award.icon}</span>
                  <div>
                    <div className="font-semibold">{award.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{award.description}</div>
                  </div>
                </div>
              ))}
            </div>,
            { duration: 5000 }
          )
        } else {
          toast.success(message)
        }
      } else {
        if (response.hasError) {
          toast.error('No answer provided. Challenge marked as completed with 0 points.')
        } else {
          toast.error('Wrong answer! You earned 0 points.')
        }
      }
      
      // Reload challenge to get updated data
      await loadChallenge()
    } catch (error) {
      console.error('Error submitting solution:', error)
      toast.error(error.message || 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <HorizontalLoader
        message="Loading challenge..."
        subMessage="Preparing the challenge details"
        progress={75}
        className="min-h-screen"
      />
    )
  }

  if (!challenge) {
    return null
  }

  return (
    <div className="ambient-light overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col mx-auto px-4 pt-5 pb-4 min-w-0">
        {/* Header with Back Button */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/challenges')}
              className="rounded-full p-2 border-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-[30px] p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {challenge.title}
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <Badge className={`${DIFFICULTY_COLORS[challenge.difficulty]} font-semibold px-3 py-1.5 rounded-full shadow-sm`}>
                    {DIFFICULTY_ICONS[challenge.difficulty]} {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="border-2 border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full font-medium">
                    <Code className="w-3 h-3 mr-1.5" />
                    {challenge.category}
                  </Badge>
                  {isCompleted && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-md">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{challenge.points} points</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Left Column - Instructions */}
          <div className="lg:col-span-1 flex flex-col min-h-0 min-w-0">
            {/* Instructions Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-[30px] border-2 border-gray-200 dark:border-gray-700 shadow-lg flex flex-col min-h-0">
              <div className="p-5 border-b-2 border-gray-200 rounded-t-[20px] dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Instructions</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-5 rounded-[20px] border border-gray-200 dark:border-gray-700 leading-relaxed">
                    {challenge.instructions}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Code Editor */}
          <div className="lg:col-span-2 flex flex-col min-h-0 h-[550px] relative">
            <div className="bg-white dark:bg-gray-800 rounded-[30px] border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-md">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {isCompleted ? 'Your Submitted Solution' : 'Your Solution'}
                  </h3>
                  {isCompleted && userSolutionData && (
                    <div className="flex items-center gap-2 ml-4">
                      {userSolutionData.isCorrect ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-md">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-md">
                          <X className="w-3 h-3 mr-1" />
                          Wrong
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-2 border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full font-medium">
                        <Award className="w-3 h-3 mr-1.5" />
                        Points: {userSolutionData.pointsEarned || 0}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex min-h-0 relative">
                {/* Code Editor - Left Side */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 min-h-0 relative">
                    {isCompleted ? (
                      <div className="absolute inset-0 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {userSolution || 'No solution provided'}
                        </pre>
                      </div>
                    ) : (
                      <div className="absolute inset-0">
                        <CodeMirror
                          value={userSolution}
                          height="100%"
                          extensions={[javascript({ jsx: true })]}
                          theme={document.documentElement.classList.contains('dark') ? oneDark : undefined}
                          onChange={(value) => setUserSolution(value)}
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            dropCursor: false,
                            allowMultipleSelections: false,
                            indentOnInput: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                            highlightSelectionMatches: false,
                            lineWrapping: true,
                          }}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {!isCompleted && (
                    <>
                      {/* Answer Display Section (Auto-filled from code execution) */}
                      <div className="p-4 border-t-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Your Answer (Auto-filled from code output):
                        </label>
                        {/* <textarea
                          value={userAnswer}
                          readOnly
                          placeholder="Run your code to see the output here..."
                          className="w-full p-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm cursor-not-allowed opacity-90"
                          rows={3}
                        /> */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          💡 This answer is automatically set when you run your code. Click "Run Code" to execute your solution.
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="p-4 border-t-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
                        <Button
                          onClick={handleSubmitSolution}
                          disabled={!userSolution.trim() || !userAnswer.trim() || submitting}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black hover:opacity-90 shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Clock className="w-5 h-5 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Output Panel - Bottom Right */}
                {!isCompleted && (
                  <div className="w-96 border-l-2 border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 bg-gray-50 dark:bg-gray-900/30">
                    {/* Fixed Run Button */}
                    <div className="p-4 border-b-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                      <Button
                        onClick={handleRunCode}
                        disabled={!userSolution.trim()}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Run Code
                      </Button>
                    </div>

                    {/* Output Display */}
                    <div className="flex-1 overflow-y-auto p-4">
                      
                      {codeError ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Error</span>
                          </div>
                          <pre className="text-xs text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap break-words">
                            {codeError}
                          </pre>
                        </div>
                      ) : codeOutput ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Success</span>
                          </div>
                          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
                            {codeOutput}
                          </pre>
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                          <Play className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            No output yet
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Click "Run Code" to execute your solution
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeDetail

