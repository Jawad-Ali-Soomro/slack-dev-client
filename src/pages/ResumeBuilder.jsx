import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Download, Edit, Eye, FileText, User, Briefcase, GraduationCap, Code, Award, Mail, Phone, MapPin, Globe, Linkedin, Github, Save, X, Plus, FolderOpen, Dock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { toast } from 'sonner'
import profileService from '../services/profileService'
import { userService } from '../services/userService'
import projectService from '../services/projectService'
import taskService from '../services/taskService'
import meetingService from '../services/meetingService'
// @ts-ignore
import jsPDF from 'jspdf'

const ResumeBuilder = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(true)
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: []
  })

  useEffect(() => {
    if (user && user.id) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load user profile
      const profileResponse = await profileService.getProfile()
      const profile = profileResponse.user
      
      // Load user details (projects, tasks, meetings)
      let details = null
      try {
        const detailsResponse = await userService.getUserDetails(user.id)
        details = detailsResponse.user
      } catch (error) {
        console.log('Could not load user details:', error)
      }
      
      // Load projects
      const projectsResponse = await projectService.getProjects({ limit: 100 })
      const projects = projectsResponse.projects || []
      
      // Load tasks
      const tasksResponse = await taskService.getTasks({ limit: 100 })
      const tasks = tasksResponse.tasks || []
      
      // Load meetings
      const meetingsResponse = await meetingService.getMeetings({ limit: 100 })
      const meetings = meetingsResponse.meetings || []
      
      // Extract skills from projects (languages, technologies)
      const skillsSet = new Set()
      projects.forEach(project => {
        if (project.tags) {
          project.tags.forEach(tag => skillsSet.add(tag))
        }
        if (project.language) {
          skillsSet.add(project.language)
        }
      })
      
      // Build resume data
      setResumeData({
        personalInfo: {
          fullName: profile.username || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.userLocation || '',
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
          website: profile.website || '',
          summary: profile.bio || ''
        },
        experience: buildExperienceFromProjects(projects, tasks),
        education: [], // User can add manually
        skills: Array.from(skillsSet),
        projects: formatProjectsForResume(projects),
        achievements: buildAchievements(tasks, meetings, projects)
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const buildExperienceFromProjects = (projects, tasks) => {
    // Group projects by team/company and create experience entries
    const experienceMap = new Map()
    
    projects.forEach(project => {
      if (project.status === 'completed' || project.status === 'active') {
        const key = project.teamId?.name || 'Freelance Projects'
        if (!experienceMap.has(key)) {
          experienceMap.set(key, {
            company: key,
            position: 'Developer',
            startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
            endDate: project.status === 'completed' && project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present',
            description: project.description || '',
            achievements: []
          })
        }
        
        const exp = experienceMap.get(key)
        if (project.description) {
          exp.achievements.push(`Developed ${project.name}: ${project.description.substring(0, 100)}`)
        }
      }
    })
    
    return Array.from(experienceMap.values())
  }

  const formatProjectsForResume = (projects) => {
    return projects
      .filter(p => p.status === 'completed' || p.status === 'active')
      .slice(0, 5)
      .map(project => ({
        name: project.name,
        description: project.description || '',
        technologies: project.tags || [],
        url: project.links?.find(l => l.type === 'github')?.url || '',
        date: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
      }))
  }

  const buildAchievements = (tasks, meetings, projects) => {
    const achievements = []
    
    // Completed tasks
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    if (completedTasks > 0) {
      achievements.push(`Completed ${completedTasks} tasks across multiple projects`)
    }
    
    // Completed projects
    const completedProjects = projects.filter(p => p.status === 'completed').length
    if (completedProjects > 0) {
      achievements.push(`Successfully delivered ${completedProjects} projects`)
    }
    
    // Active projects
    const activeProjects = projects.filter(p => p.status === 'active').length
    if (activeProjects > 0) {
      achievements.push(`Currently managing ${activeProjects} active projects`)
    }
    
    return achievements
  }

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        achievements: []
      }]
    }))
  }

  const updateExperience = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }))
  }

  const updateSkill = (index, value) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }))
  }

  const removeSkill = (index) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: [],
        url: '',
        date: ''
      }]
    }))
  }

  const updateProject = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }))
  }

  const removeProject = (index) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const addProjectTechnology = (projectIndex, tech) => {
    if (!tech.trim()) return
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex 
          ? { ...project, technologies: [...(project.technologies || []), tech.trim()] }
          : project
      )
    }))
  }

  const removeProjectTechnology = (projectIndex, techIndex) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex 
          ? { ...project, technologies: project.technologies.filter((_, ti) => ti !== techIndex) }
          : project
      )
    }))
  }

  const addExperienceBullet = (expIndex) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: [...(exp.achievements || []), ''] }
          : exp
      )
    }))
  }

  const updateExperienceBullet = (expIndex, bulletIndex, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { 
              ...exp, 
              achievements: exp.achievements.map((bullet, bi) => 
                bi === bulletIndex ? value : bullet
              )
            }
          : exp
      )
    }))
  }

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: exp.achievements.filter((_, bi) => bi !== bulletIndex) }
          : exp
      )
    }))
  }

  const generatePDF = () => {
    try {
      const doc = new jsPDF()
      let yPosition = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Header
      doc.setFontSize(24)
      doc.setFont('halvetica neue', 'bold')
      doc.text(resumeData.personalInfo.fullName || 'Your Name', margin, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('halvetica neue', 'normal')
      const contactInfo = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.location
      ].filter(Boolean).join(' | ')
      doc.text(contactInfo, margin, yPosition)
      yPosition += 5
      
      const links = [
        resumeData.personalInfo.linkedin ? `LinkedIn · ${resumeData.personalInfo.linkedin}` : '',
        resumeData.personalInfo.github ? `GitHub · ${resumeData.personalInfo.github}` : '',
        resumeData.personalInfo.website ? `Website · ${resumeData.personalInfo.website}` : ''
      ].filter(Boolean).join(' | ')
      if (links) {
        doc.text(links, margin, yPosition)
        yPosition += 10
      }
      
      // Summary
      if (resumeData.personalInfo.summary) {
        yPosition += 5
        doc.setFontSize(14)
        doc.setFont('halvetica neue', 'bold')
        doc.text('PROFESSIONAL SUMMARY', margin, yPosition)
        yPosition += 7
        
        doc.setFontSize(10)
        doc.setFont('halvetica neue', 'normal')
        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, contentWidth)
        doc.text(summaryLines, margin, yPosition)
        yPosition += summaryLines.length * 5 + 5
      }
      
      // Skills
      if (resumeData.skills.length > 0) {
        yPosition += 5
        doc.setFontSize(14)
        doc.setFont('halvetica neue', 'bold')
        doc.text('TECHNICAL SKILLS', margin, yPosition)
        yPosition += 7
        
        doc.setFontSize(10)
        doc.setFont('halvetica neue', 'normal')
        const skillsText = resumeData.skills.filter(Boolean).join(' • ')
        const skillsLines = doc.splitTextToSize(skillsText, contentWidth)
        doc.text(skillsLines, margin, yPosition)
        yPosition += skillsLines.length * 5 + 5
      }
      
      // Experience
      if (resumeData.experience.length > 0) {
        yPosition += 5
        doc.setFontSize(14)
        doc.setFont('halvetica neue', 'bold')
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition)
        yPosition += 7
        
        resumeData.experience.forEach(exp => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.setFontSize(11)
          doc.setFont('halvetica neue', 'bold')
          doc.text(exp.position || 'Position', margin, yPosition)
          yPosition += 5
          
          doc.setFontSize(10)
          doc.setFont('halvetica neue', 'normal')
          doc.text(`${exp.company || 'Company'} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`, margin, yPosition)
          yPosition += 5
          
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.filter(a => a && a.trim()).forEach(achievement => {
              const bulletLines = doc.splitTextToSize(achievement, contentWidth - 5)
              bulletLines.forEach((line, lineIndex) => {
                doc.text(lineIndex === 0 ? `• ${line}` : `  ${line}`, margin + (lineIndex === 0 ? 0 : 5), yPosition)
                yPosition += 5
              })
            })
          } else if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, contentWidth)
            doc.text(descLines, margin, yPosition)
            yPosition += descLines.length * 5
          }
          
          yPosition += 3
        })
      }
      
      // Projects
      if (resumeData.projects.length > 0) {
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        yPosition += 5
        doc.setFontSize(14)
        doc.setFont('halvetica neue', 'bold')
        doc.text('PROJECTS', margin, yPosition)
        yPosition += 7
        
        resumeData.projects.forEach(project => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.setFontSize(11)
          doc.setFont('halvetica neue', 'bold')
          doc.text(project.name || 'Project Name', margin, yPosition)
          yPosition += 5
          
          doc.setFontSize(10)
          doc.setFont('halvetica neue', 'normal')
          if (project.date) {
            doc.text(project.date, margin, yPosition)
            yPosition += 5
          }
          
          if (project.description) {
            const descLines = doc.splitTextToSize(project.description, contentWidth)
            doc.text(descLines, margin, yPosition)
            yPosition += descLines.length * 5
          }
          
          if (project.technologies && project.technologies.length > 0) {
            doc.text(`Technologies: ${project.technologies.join(', ')}`, margin, yPosition)
            yPosition += 5
          }
          
          if (project.url) {
            const url = project.url.startsWith('http') ? project.url : `https://${project.url}`
            doc.setTextColor(0, 0, 255)
            doc.textWithLink('View Project', margin, yPosition, { url: url })
            doc.setTextColor(0, 0, 0)
            yPosition += 5
          }
          
          yPosition += 3
        })
      }
      
      // Save PDF
      const fileName = `${resumeData.personalInfo.fullName || 'resume'}_resume.pdf`
      doc.save(fileName)
      toast.success('Resume downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )   
  }

  return (
    <div className="dark:bg-black py-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.1)] rounded-full">
                <Dock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Resume Builder</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center w-12 h-12"
            >
              {previewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black w-12 h-12"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2 max-h-[750px] overflow-scroll">
            {/* Personal Information */}
            <div className="bg-white dark:bg-black">
             
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Professional Summary"
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-black py-5">
              <div>
               {
                resumeData.skills.length > 0 &&  <h1 className="flex items-center gap-2">
                <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.1)] rounded-full">

              <Code className="w-5 h-5" />
                </div>
              <span className='text-lg font-bold'>Skills</span>
            </h1>
               }
              </div>
              <div className="space-y-3 mt-5">
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-[10px]">
                      <Input
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="border-0 bg-transparent text-sm w-[100px]"
                      />
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-700  bg-white text-black h-5 w-5 flex items-center justify-center rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button onClick={addSkill} className={'w-[200px] flex justify-between items-center px-4 flex justify-between items-center px-4'}>
                  <span className='text-sm font-medium'>New Skill</span>
                  <div className="flex items-center justify-center p-1 bg-white text-black rounded-full">
                    <Plus className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-black py-5">
              <div>
                <h1 className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.1)] rounded-full">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className='text-lg font-bold'>Professional Experience</span>
                </h1>
              </div>
              <div className="space-y-4 mt-5">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className=" icon border-gray-200 py-3 border-t dark:border-gray-700 rounded-lg space-y-3">
                    <Input
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Start Date (e.g., Jan 2020)"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                      <Input
                        placeholder="End Date (e.g., Present)"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                    {/* Bullet Points */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievements / Bullet Points</label>
                      {exp.achievements && exp.achievements.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex items-start gap-2 mt-2">
                          <span className="text-gray-500 dark:text-gray-400 mt-2">•</span>
                          <Input
                            placeholder="Enter achievement or bullet point"
                            value={bullet}
                            onChange={(e) => updateExperienceBullet(index, bulletIndex, e.target.value)}
                            className="flex-1"
                          />
                          <button
                            onClick={() => removeExperienceBullet(index, bulletIndex)}
                            className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 text-black h-8 w-8 flex items-center justify-center rounded-full mt-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        onClick={() => addExperienceBullet(index)}
                        className="flex items-center gap-2 w-[200px] flex justify-between items-center px-4 flex justify-between items-center px-4 mt-2"
                      >
                        <span className='text-sm font-medium'>New Bullet Point</span>
                        <div className="flex items-center justify-center p-1 bg-white text-black rounded-full">
                          <Plus className="w-4 h-4" />
                        </div>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button onClick={addExperience} className={'w-full flex justify-between items-center px-4 flex justify-between items-center px-4 flex justify-between items-center px-4'}>
                 <span className='text-sm font-medium'>New Experience</span>
                 <div className="flex items-center justify-center p-1 bg-white text-black rounded-full">
                  <Plus className="w-4 h-4" />
                 </div>
                </Button>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-black py-5">
              <div>
                <h1 className="flex items-center gap-2">
                  <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.1)] rounded-full">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <span className='text-lg font-bold'>Projects</span>
                </h1>
              </div>
              <div className="space-y-4 mt-5">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="icon border-gray-200 dark:border-gray-700 space-y-3 py-3 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Project {index + 1}</h3>
                      <button
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 text-black h-6 w-6 flex items-center justify-center rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Project Name"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Date (e.g., Jan 2020)"
                        value={project.date}
                        onChange={(e) => updateProject(index, 'date', e.target.value)}
                      />
                      <Input
                        placeholder="Project URL"
                        value={project.url}
                        onChange={(e) => updateProject(index, 'url', e.target.value)}
                      />
                    </div>
                    {/* Technologies */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Technologies</label>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies && project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-[10px]">
                            <span className="text-xs">{tech}</span>
                            <button
                              onClick={() => removeProjectTechnology(index, techIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id={`tech-input-${index}`}
                          placeholder="Add technology"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addProjectTechnology(index, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <Button
                        className={'h-12 w-12'}
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`tech-input-${index}`)
                            if (input && input.value) {
                              addProjectTechnology(index, input.value)
                              input.value = ''
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={addProject} className={'w-[200px] flex justify-between items-center px-4 flex justify-between items-center px-4'}>
                  <span className='text-sm font-medium'>New Project</span>
                  <div className="flex items-center justify-center p-1 bg-white text-black rounded-full">
                    <Plus className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1 max-h-[750px] overflow-scroll">
            <div className="bg-white dark:bg-black sticky top-6">
             
              <div>
                <div className="space-y-6 text-sm">
                  {/* Header */}
                  <div className="text-start border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {resumeData.personalInfo.fullName || 'Your Name'}
                    </h2>
                    <div className="flex flex-wrap justify-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {resumeData.personalInfo.linkedin && <span>LinkedIn</span>}
                      {resumeData.personalInfo.github && <span>• GitHub</span>}
                      {resumeData.personalInfo.website && <span>• Website</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs">Professional Summary</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs">Technical Skills</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs">
                        {resumeData.skills.filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs">Professional Experience</h3>
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">{exp.position || 'Position'}</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">
                            {exp.company || 'Company'} | {exp.startDate || ''} - {exp.endDate || 'Present'}
                          </div>
                          {exp.achievements && exp.achievements.filter(a => a && a.trim()).length > 0 ? (
                            <ul className="list-none mt-2 space-y-1">
                              {exp.achievements.filter(a => a && a.trim()).map((achievement, ai) => (
                                <li key={ai} className="text-gray-700 dark:text-gray-300 text-xs flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          ) : exp.description ? (
                            <p className="text-gray-700 dark:text-gray-300 text-xs mt-1">{exp.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs">Projects</h3>
                      {resumeData.projects.map((project, index) => (
                        <div key={index} className="mb-3">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">{project.name || 'Project Name'}</div>
                          {project.date && <div className="text-gray-600 dark:text-gray-400 text-xs">{project.date}</div>}
                          {project.description && (
                            <p className="text-gray-700 dark:text-gray-300 text-xs mt-1">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Tech:</span> {project.technologies.join(', ')}
                            </div>
                          )}
                          {project.url && (
                            <div className="mt-1 text-xs">
                              <a href={project.url.startsWith('http') ? project.url : `https://${project.url}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-blue-600 dark:text-blue-400 hover:underline">
                                View Project →
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder

