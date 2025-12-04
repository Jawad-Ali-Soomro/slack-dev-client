import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HorizontalLoader from '../components/HorizontalLoader'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Book,
  FileText,
  Upload,
  X,
  Filter,
  Download,
  Eye,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import noteService from '../services/noteService'
import { getButtonClasses } from '../utils/uiConstants'
import { useAuth } from '../contexts/AuthContext'
import { PiUserDuotone } from 'react-icons/pi'
import { getAvatarProps } from '../utils/avatarUtils'

// Predefined departments
const PREDEFINED_DEPARTMENTS = [
  'Computer Science',
  'BBA (Business Administration)',
  'Commerce',
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Psychology',
  'History',
  'Political Science',
  'Sociology',
  'Accounting',
  'Finance',
  'Marketing',
  'Management',
  'Information Technology',
  'Software Engineering',
  'Data Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Architecture',
  'Medicine',
  'Law',
  'Education',
  'Journalism',
  'Art & Design',
  'Music',
]

// Predefined subjects by department
const PREDEFINED_SUBJECTS = {
  'Computer Science': [
    'Programming Fundamentals',
    'Data Structures',
    'Algorithms',
    'Database Management',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
    'Web Development',
    'Mobile App Development',
    'Machine Learning',
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'Computer Graphics',
    'Distributed Systems',
  ],
  'BBA (Business Administration)': [
    'Business Management',
    'Marketing Management',
    'Financial Management',
    'Human Resource Management',
    'Operations Management',
    'Strategic Management',
    'Business Ethics',
    'Entrepreneurship',
    'Organizational Behavior',
    'Business Communication',
    'Business Law',
    'International Business',
    'Project Management',
    'Business Analytics',
    'Supply Chain Management',
  ],
  'Commerce': [
    'Accounting',
    'Financial Accounting',
    'Cost Accounting',
    'Management Accounting',
    'Business Mathematics',
    'Business Statistics',
    'Economics',
    'Business Law',
    'Company Law',
    'Taxation',
    'Auditing',
    'Banking',
    'Insurance',
    'Business Communication',
    'E-Commerce',
  ],
  'English': [
    'English Literature',
    'Creative Writing',
    'Linguistics',
    'Grammar & Composition',
    'Poetry',
    'Drama',
    'Novel',
    'Short Story',
    'Literary Criticism',
    'World Literature',
    'American Literature',
    'British Literature',
    'Communication Skills',
    'Technical Writing',
    'Public Speaking',
  ],
  'Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Differential Equations',
    'Statistics',
    'Probability',
    'Discrete Mathematics',
    'Number Theory',
    'Geometry',
    'Trigonometry',
    'Mathematical Analysis',
    'Abstract Algebra',
    'Numerical Methods',
    'Mathematical Modeling',
    'Topology',
    'Complex Analysis',
  ],
  'Physics': [
    'Mechanics',
    'Thermodynamics',
    'Electromagnetism',
    'Optics',
    'Quantum Mechanics',
    'Nuclear Physics',
    'Solid State Physics',
    'Astrophysics',
    'Particle Physics',
    'Wave Physics',
    'Statistical Physics',
    'Relativity',
    'Experimental Physics',
    'Mathematical Physics',
    'Applied Physics',
  ],
  'Chemistry': [
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Physical Chemistry',
    'Analytical Chemistry',
    'Biochemistry',
    'Environmental Chemistry',
    'Industrial Chemistry',
    'Polymer Chemistry',
    'Medicinal Chemistry',
    'Computational Chemistry',
    'Materials Chemistry',
    'Electrochemistry',
    'Thermodynamics',
    'Chemical Kinetics',
    'Spectroscopy',
  ],
  'Biology': [
    'Cell Biology',
    'Molecular Biology',
    'Genetics',
    'Ecology',
    'Botany',
    'Zoology',
    'Microbiology',
    'Biochemistry',
    'Human Anatomy',
    'Physiology',
    'Evolution',
    'Biotechnology',
    'Immunology',
    'Neuroscience',
    'Marine Biology',
  ],
  'Economics': [
    'Microeconomics',
    'Macroeconomics',
    'Econometrics',
    'International Economics',
    'Development Economics',
    'Public Economics',
    'Labor Economics',
    'Financial Economics',
    'Behavioral Economics',
    'Environmental Economics',
    'Industrial Organization',
    'Game Theory',
    'Economic History',
    'Monetary Economics',
    'Agricultural Economics',
  ],
  'Psychology': [
    'General Psychology',
    'Cognitive Psychology',
    'Social Psychology',
    'Developmental Psychology',
    'Abnormal Psychology',
    'Clinical Psychology',
    'Experimental Psychology',
    'Personality Psychology',
    'Industrial Psychology',
    'Educational Psychology',
    'Neuropsychology',
    'Forensic Psychology',
    'Health Psychology',
    'Counseling Psychology',
    'Research Methods',
  ],
  'History': [
    'World History',
    'Ancient History',
    'Medieval History',
    'Modern History',
    'American History',
    'European History',
    'Asian History',
    'African History',
    'Military History',
    'Cultural History',
    'Economic History',
    'Political History',
    'Social History',
    'Historiography',
    'Archaeology',
  ],
  'Political Science': [
    'Political Theory',
    'Comparative Politics',
    'International Relations',
    'Public Administration',
    'Political Economy',
    'Constitutional Law',
    'Public Policy',
    'Political Philosophy',
    'Diplomacy',
    'Security Studies',
    'Political Parties',
    'Elections & Voting',
    'Human Rights',
    'Global Governance',
    'Regional Studies',
  ],
  'Sociology': [
    'Introduction to Sociology',
    'Social Theory',
    'Social Research Methods',
    'Social Stratification',
    'Gender Studies',
    'Race & Ethnicity',
    'Urban Sociology',
    'Rural Sociology',
    'Criminology',
    'Medical Sociology',
    'Family Sociology',
    'Education & Society',
    'Religion & Society',
    'Social Change',
    'Cultural Sociology',
  ],
  'Accounting': [
    'Financial Accounting',
    'Managerial Accounting',
    'Cost Accounting',
    'Auditing',
    'Taxation',
    'Accounting Information Systems',
    'Financial Statement Analysis',
    'Forensic Accounting',
    'International Accounting',
    'Government Accounting',
    'Accounting Ethics',
    'Advanced Accounting',
    'Accounting Theory',
    'Budgeting',
    'Internal Controls',
  ],
  'Finance': [
    'Corporate Finance',
    'Investment Analysis',
    'Financial Markets',
    'Risk Management',
    'Portfolio Management',
    'Derivatives',
    'Banking',
    'Insurance',
    'Real Estate Finance',
    'International Finance',
    'Financial Planning',
    'Behavioral Finance',
    'Financial Modeling',
    'Mergers & Acquisitions',
    'Financial Regulation',
  ],
  'Marketing': [
    'Principles of Marketing',
    'Consumer Behavior',
    'Digital Marketing',
    'Brand Management',
    'Advertising',
    'Public Relations',
    'Sales Management',
    'Marketing Research',
    'International Marketing',
    'Services Marketing',
    'Retail Marketing',
    'Social Media Marketing',
    'Marketing Strategy',
    'Product Management',
    'Marketing Analytics',
  ],
  'Management': [
    'Principles of Management',
    'Organizational Behavior',
    'Strategic Management',
    'Human Resource Management',
    'Operations Management',
    'Project Management',
    'Leadership',
    'Change Management',
    'Quality Management',
    'Supply Chain Management',
    'Innovation Management',
    'Crisis Management',
    'Management Information Systems',
    'Business Ethics',
    'Decision Making',
  ],
  'Information Technology': [
    'IT Fundamentals',
    'System Analysis & Design',
    'Database Systems',
    'Network Administration',
    'IT Project Management',
    'Information Security',
    'Cloud Computing',
    'IT Service Management',
    'Enterprise Architecture',
    'IT Governance',
    'Business Intelligence',
    'Data Management',
    'IT Strategy',
    'Virtualization',
    'IT Infrastructure',
  ],
  'Software Engineering': [
    'Software Development Life Cycle',
    'Object-Oriented Programming',
    'Software Design Patterns',
    'Software Testing',
    'Software Quality Assurance',
    'Software Architecture',
    'Agile Development',
    'DevOps',
    'Version Control',
    'Code Review',
    'Software Documentation',
    'Requirements Engineering',
    'Software Maintenance',
    'Software Metrics',
    'Project Management',
  ],
  'Data Science': [
    'Data Analysis',
    'Machine Learning',
    'Data Mining',
    'Statistical Analysis',
    'Big Data',
    'Data Visualization',
    'Python for Data Science',
    'R Programming',
    'SQL',
    'Deep Learning',
    'Natural Language Processing',
    'Predictive Analytics',
    'Data Engineering',
    'Business Intelligence',
    'Data Ethics',
  ],
  'Electrical Engineering': [
    'Circuit Analysis',
    'Digital Electronics',
    'Analog Electronics',
    'Power Systems',
    'Control Systems',
    'Signal Processing',
    'Electromagnetic Fields',
    'Microprocessors',
    'Communication Systems',
    'Renewable Energy',
    'Electrical Machines',
    'Power Electronics',
    'Embedded Systems',
    'VLSI Design',
    'Robotics',
  ],
  'Mechanical Engineering': [
    'Engineering Mechanics',
    'Thermodynamics',
    'Fluid Mechanics',
    'Heat Transfer',
    'Machine Design',
    'Manufacturing Processes',
    'Materials Science',
    'CAD/CAM',
    'Automotive Engineering',
    'Aerospace Engineering',
    'Robotics',
    'Mechatronics',
    'Vibration Analysis',
    'Quality Control',
    'Project Management',
  ],
  'Civil Engineering': [
    'Structural Engineering',
    'Geotechnical Engineering',
    'Transportation Engineering',
    'Environmental Engineering',
    'Water Resources',
    'Construction Management',
    'Surveying',
    'Concrete Technology',
    'Steel Structures',
    'Highway Engineering',
    'Bridge Engineering',
    'Urban Planning',
    'Building Materials',
    'Soil Mechanics',
    'Project Planning',
  ],
  'Architecture': [
    'Architectural Design',
    'Building Construction',
    'Architectural History',
    'Urban Design',
    'Sustainable Architecture',
    'Building Materials',
    'Structural Systems',
    'Environmental Systems',
    'Architectural Drawing',
    'CAD & BIM',
    'Landscape Architecture',
    'Interior Design',
    'Building Codes',
    'Project Management',
    'Architectural Theory',
  ],
  'Medicine': [
    'Anatomy',
    'Physiology',
    'Biochemistry',
    'Pathology',
    'Pharmacology',
    'Microbiology',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Psychiatry',
    'Radiology',
    'Public Health',
    'Medical Ethics',
    'Clinical Skills',
  ],
  'Law': [
    'Constitutional Law',
    'Criminal Law',
    'Civil Law',
    'Contract Law',
    'Property Law',
    'Corporate Law',
    'International Law',
    'Family Law',
    'Labor Law',
    'Tax Law',
    'Environmental Law',
    'Intellectual Property',
    'Legal Research',
    'Legal Writing',
    'Jurisprudence',
  ],
  'Education': [
    'Educational Psychology',
    'Curriculum Development',
    'Teaching Methods',
    'Classroom Management',
    'Educational Technology',
    'Assessment & Evaluation',
    'Special Education',
    'Educational Leadership',
    'Adult Education',
    'Early Childhood Education',
    'Educational Research',
    'Learning Theories',
    'Educational Policy',
    'Inclusive Education',
    'Teacher Training',
  ],
  'Journalism': [
    'News Writing',
    'Feature Writing',
    'Investigative Journalism',
    'Broadcast Journalism',
    'Digital Journalism',
    'Photojournalism',
    'Media Ethics',
    'Media Law',
    'Editing',
    'Reporting',
    'Interviewing',
    'Multimedia Storytelling',
    'Data Journalism',
    'Social Media',
    'Media Management',
  ],
  'Art & Design': [
    'Drawing',
    'Painting',
    'Sculpture',
    'Graphic Design',
    'Digital Art',
    'Illustration',
    'Typography',
    'Color Theory',
    'Design Principles',
    'Web Design',
    'UI/UX Design',
    'Fashion Design',
    'Interior Design',
    'Product Design',
    'Art History',
  ],
  'Music': [
    'Music Theory',
    'Music History',
    'Composition',
    'Music Performance',
    'Music Production',
    'Audio Engineering',
    'Music Technology',
    'Jazz Studies',
    'Classical Music',
    'World Music',
    'Music Education',
    'Music Business',
    'Songwriting',
    'Music Analysis',
    'Conducting',
  ],
}

const LearnPoint = () => {
  document.title = 'Learn Point - Notes & Study Materials'

  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [departments, setDepartments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [modalSubjects, setModalSubjects] = useState([]) // Subjects for the create/edit modal
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [activeTab, setActiveTab] = useState('public') // 'public' or 'mine'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [previewPdf, setPreviewPdf] = useState(null)

  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    department: '',
    subject: '',
    tags: '',
  })

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      const response = await noteService.getDepartments()
      const userDepartments = response.departments || []
      // Combine predefined and user-created departments, removing duplicates
      const allDepartments = [...new Set([...PREDEFINED_DEPARTMENTS, ...userDepartments])]
      setDepartments(allDepartments.sort())
    } catch (error) {
      console.error('Error loading departments:', error)
      // Fallback to predefined departments if API fails
      setDepartments(PREDEFINED_DEPARTMENTS.sort())
    }
  }, [])

  // Load subjects by department
  const loadSubjects = useCallback(async (department) => {
    if (!department) {
      setSubjects([])
      return
    }
    try {
      const response = await noteService.getSubjectsByDepartment(department)
      setSubjects(response.subjects || [])
    } catch (error) {
      console.error('Error loading subjects:', error)
      setSubjects([])
    }
  }, [])

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        department: selectedDepartment || undefined,
        subject: selectedSubject || undefined,
        search: searchTerm || undefined,
      }
      const response = await noteService.getNotes(filters)
      setNotes(response.notes || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      toast.error(error.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [selectedDepartment, selectedSubject, searchTerm])

  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  useEffect(() => {
    if (selectedDepartment) {
      loadSubjects(selectedDepartment)
    } else {
      setSubjects([])
      setSelectedSubject('')
    }
  }, [selectedDepartment, loadSubjects])

  // Load subjects for modal when department changes in create/edit modal
  useEffect(() => {
    if (showCreateModal && newNote.department) {
      loadSubjectsForModal(newNote.department)
    } else {
      setModalSubjects([])
    }
  }, [newNote.department, showCreateModal])

  // Load subjects for modal - combines predefined and user-created subjects
  const loadSubjectsForModal = useCallback(async (department) => {
    if (!department) {
      setModalSubjects([])
      return
    }
    try {
      // Get predefined subjects for the department
      const predefinedSubjects = PREDEFINED_SUBJECTS[department] || []
      
      // Get user-created subjects from API
      const response = await noteService.getSubjectsByDepartment(department)
      const userSubjects = response.subjects || []
      
      // Combine and remove duplicates
      const allSubjects = [...new Set([...predefinedSubjects, ...userSubjects])]
      setModalSubjects(allSubjects.sort())
    } catch (error) {
      console.error('Error loading subjects for modal:', error)
      // Fallback to predefined subjects if API fails
      const predefinedSubjects = PREDEFINED_SUBJECTS[department] || []
      setModalSubjects(predefinedSubjects.sort())
    }
  }, [])

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value)
    setSelectedSubject('')
  }

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.department || !newNote.subject) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const noteData = {
        ...newNote,
        tags: newNote.tags ? newNote.tags.split(',').map((t) => t.trim()) : [],
        pdf: pdfFile,
      }

      if (editingNote) {
        await noteService.updateNote(editingNote._id, noteData)
        toast.success('Note updated successfully!')
      } else {
        await noteService.createNote(noteData)
        toast.success('Note created successfully!')
      }

      setShowCreateModal(false)
      setNewNote({ title: '', description: '', department: '', subject: '', tags: '' })
      setPdfFile(null)
      setEditingNote(null)
      await loadNotes()
      await loadDepartments()
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error(error.message || 'Failed to create note')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return

    try {
      setLoading(true)
      await noteService.deleteNote(noteId)
      toast.success('Note deleted successfully!')
      await loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error(error.message || 'Failed to delete note')
    } finally {
      setLoading(false)
    }
  }

  const handleEditNote = async (note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      description: note.description || '',
      department: note.department,
      subject: note.subject,
      tags: note.tags ? note.tags.join(', ') : '',
    })
    setPdfFile(null)
    setShowCreateModal(true)
    // Load subjects for the note's department
    if (note.department) {
      await loadSubjectsForModal(note.department)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }
      setPdfFile(file)
    }
  }

  const handleViewPdf = (fileUrl) => {
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${import.meta.env.VITE_API_URL || ''}${fileUrl}`
      window.open(fullUrl, '_blank')
    }
  }

  const filteredNotes = notes.filter((note) => {
    // Filter by tab
    if (activeTab === 'mine' && user) {
      const noteCreatorId = note.createdBy?._id?.toString() || note.createdBy?.id?.toString() || (typeof note.createdBy === 'string' ? note.createdBy : null)
      const currentUserId = user.id?.toString() || user._id?.toString()
      if (noteCreatorId !== currentUserId) {
        return false
      }
    }
    
    // Filter by search
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="overflow-hidden pt-10">
      <motion.div
        className="mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
              <Book size={15} />
            </div>
            <h1 className="text-2xl font-bold">Learn Point</h1>
          </div>
        </div>

        <motion.div className="mb-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-6 py-3 font-semibold text-sm uppercase transition-colors border-2 ${
                activeTab === 'public'
                  ? 'bg-white text-black'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All Notes
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-6 py-3 font-semibold text-sm uppercase transition-colors border-2 ${
                  activeTab === 'mine'
                    ? 'bg-white text-black'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My notes
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex gap-2">
                  
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:w-[500px] w-full pl-10 pr-4 py-3 border border-gray-200 h-13 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                />
              </div>
              <Select value={selectedDepartment || "all"} onValueChange={(value) => handleDepartmentChange(value === "all" ? "" : value)}>
                <SelectTrigger className="md:w-[200px] w-full px-5 h-13 bg-white cursor-pointer dark:bg-[#111827] dark:text-white">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700">
                  <SelectItem className="cursor-pointer h-10 px-5" value="all">
                    All Departments
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} className="cursor-pointer h-10 px-5" value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </div>
              
              {selectedDepartment && (
                <Select value={selectedSubject || "all"} onValueChange={(value) => setSelectedSubject(value === "all" ? "" : value)}>
                  <SelectTrigger className="md:w-[200px] w-full px-5 h-13 bg-white cursor-pointer dark:bg-[#111827] dark:text-white">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700">
                    <SelectItem className="cursor-pointer h-10 px-5" value="all">
                      All Subjects
                    </SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} className="cursor-pointer h-10 px-5" value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              onClick={() => {
                setEditingNote(null)
                setNewNote({ title: '', description: '', department: '', subject: '', tags: '' })
                setPdfFile(null)
                setShowCreateModal(true)
              }}
              className="md:w-[200px] w-full rounded-[10px] h-12 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          </div>
        </motion.div>

        {/* Notes Grid */}
        <motion.div
          className="rounded-[10px] shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <HorizontalLoader message="Loading notes..." subMessage="Fetching your study materials" progress={70} />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No notes found</p>
              <p className="text-sm mt-2">Create your first note to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note._id || note.id}
                  className="bg-white  dark:bg-[rgba(255,255,255,.1)] border-gray-200 dark:border-gray-700 rounded-[20px] p-6 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{note.title}</h3>
                      
                      {/* Username with Avatar */}
                      {note.createdBy && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              {...getAvatarProps(note.createdBy?.avatar, note.createdBy?.username || 'User')}
                              alt={note.createdBy?.username || 'User'}
                              className="w-full h-full object-cover p-1"
                            />
                          </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {note.createdBy?.username || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {note.createdBy?.email || 'Unknown'}
                          </span>
                         </div>
                        </div>
                      )}
                      
                      {/* Department and Subject */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] dark:bg-blue-900 dark:text-blue-200">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {note.department}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-[10px] dark:bg-green-900 dark:text-green-200">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {note.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {note.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{note.description}</p>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      {note.fileUrl && (
                        <Button
                          variant="ghost"
                          onClick={() => handleViewPdf(note.fileUrl)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-100 dark:bg-white dark:text-black dark:hover:bg-white w-[150px] dark:hover:text-black"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user && note.createdBy && (
                        (note.createdBy._id?.toString() === user.id?.toString() || 
                         note.createdBy.id?.toString() === user.id?.toString() ||
                         (typeof note.createdBy === 'string' && note.createdBy === user.id)) && (
                          <>
                            <Button variant="ghost" className={'w-[50px]'} size="sm" onClick={() => handleEditNote(note)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className={'w-[50px]'} size="sm" onClick={() => handleDeleteNote(note._id || note.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create/Edit Note Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111827] rounded-[20px] shadow-2xl border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
           

              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    placeholder="Note Title *"
                  />
                </div>

                <div>
                  <Textarea
                    value={newNote.description}
                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                    className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    placeholder="Description (optional)"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex gap-2">
                      <Select value={newNote.department} onValueChange={(value) => setNewNote({ ...newNote, department: value })}>
                        <SelectTrigger className="flex-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white">
                          <SelectValue placeholder="Department *" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700 max-h-[300px]">
                          {departments.map((dept) => (
                            <SelectItem key={dept} className="cursor-pointer h-10 px-5" value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     
                    </div>
                    {newNote.department && !departments.includes(newNote.department) && (
                      <p className="text-xs text-blue-500 mt-1">New department will be created</p>
                    )}
                  </div>

                  <div>
                    {newNote.department ? (
                      <Select value={newNote.subject} onValueChange={(value) => setNewNote({ ...newNote, subject: value })}>
                        <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white">
                          <SelectValue placeholder="Select Subject *" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700 max-h-[300px]">
                          {modalSubjects.length > 0 ? (
                            modalSubjects.map((subject) => (
                              <SelectItem key={subject} className="cursor-pointer h-10 px-5" value={subject}>
                                {subject}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading subjects...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        value={newNote.subject}
                        onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                        className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                        placeholder="Subject * (Select department first)"
                        disabled
                      />
                    )}
                    {newNote.department && modalSubjects.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No subjects available for this department</p>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    placeholder="Tags (comma separated)"
                  />
                </div>

                <div>
                 
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    />
                    {pdfFile && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pdfFile.name}</span>
                    )}
                  </div>
                  {editingNote?.fileUrl && !pdfFile && (
                    <div className="flex p-3 border-2 border-dashed rounded-[20px] mt-5 flex items-center justify-between">

                    <p className="text-xs text-gray-500">{editingNote.fileName || 'PDF file'}</p>
                    <div className="flex p-2 border rounded-full cursor-pointer" onClick={() => handleViewPdf(editingNote.fileUrl)}>

                    <Eye className='w-4 h-4 icon' />
                    </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={loading} className="flex-1">
                  {loading ? (
                    <span className="loader w-5 h-5"></span>
                  ) : editingNote ? (
                    'Update Note'
                  ) : (
                    'Create Note'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default LearnPoint

