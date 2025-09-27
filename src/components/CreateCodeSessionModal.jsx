import React, { useState } from 'react';
import { useCodeCollaboration } from '../contexts/CodeCollaborationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  X, 
  Code, 
  Users, 
  Globe, 
  Lock, 
  Clock,
  Monitor,
  Palette,
  Settings,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateCodeSessionModal = ({ isOpen, onClose }) => {
  const { createSession } = useCodeCollaboration();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    isPublic: true,
    maxParticipants: 10,
    theme: 'dark',
    allowAnonymous: false,
    autoSave: true,
    collaborativeEditing: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'xml', label: 'XML', icon: '📋' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'go', label: 'Go', icon: '🐹' }
  ];

  const themes = [
    { value: 'dark', label: 'Dark', preview: 'bg-gray-900' },
    { value: 'light', label: 'Light', preview: 'bg-white' },
    { value: 'monokai', label: 'Monokai', preview: 'bg-purple-900' },
    { value: 'solarized', label: 'Solarized', preview: 'bg-yellow-100' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required';
    }
    
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (formData.maxParticipants < 2 || formData.maxParticipants > 50) {
      newErrors.maxParticipants = 'Max participants must be between 2 and 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createSession(formData);
      onClose();
      setFormData({
        title: '',
        description: '',
        language: 'javascript',
        isPublic: true,
        maxParticipants: 10,
        theme: 'dark',
        allowAnonymous: false,
        autoSave: true,
        collaborativeEditing: true
      });
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLanguage = languages.find(lang => lang.value === formData.language);
  const selectedTheme = themes.find(theme => theme.value === formData.theme);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(8px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                   
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Create Code Session
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Start a collaborative coding session
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter session title..."
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                       
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleInputChange('language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <div className="flex items-center space-x-2">
                                <span>{selectedLanguage?.icon}</span>
                                <span>{selectedLanguage?.label}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                <div className="flex items-center space-x-2">
                                  <span>{lang.icon}</span>
                                  <span>{lang.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                    
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what you'll be working on..."
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Session Settings */}
                  <div className="space-y-4">
                  
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                       
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="2"
                          max="50"
                          value={formData.maxParticipants}
                          onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                          className={errors.maxParticipants ? 'border-red-500' : ''}
                        />
                        {errors.maxParticipants && (
                          <p className="text-sm text-red-500">{errors.maxParticipants}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                       
                        <Select
                          value={formData.theme}
                          onValueChange={(value) => handleInputChange('theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded ${selectedTheme?.preview}`}></div>
                                <span>{selectedTheme?.label}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {themes.map((theme) => (
                              <SelectItem key={theme.value} value={theme.value}>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-4 h-4 rounded ${theme.preview}`}></div>
                                  <span>{theme.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Public Session</span>
                          <Badge variant={formData.isPublic ? 'default' : 'secondary'}>
                            {formData.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('isPublic', !formData.isPublic)}
                        >
                          {formData.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Allow Anonymous Users</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('allowAnonymous', !formData.allowAnonymous)}
                        >
                          {formData.allowAnonymous ? 'Yes' : 'No'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Auto-save Changes</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('autoSave', !formData.autoSave)}
                        >
                          {formData.autoSave ? 'Yes' : 'No'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Collaborative Editing</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('collaborativeEditing', !formData.collaborativeEditing)}
                        >
                          {formData.collaborativeEditing ? 'Yes' : 'No'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className=""
                    >
                      {isLoading ? (
                        <span className="loader w-5 h-5"></span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Create Session</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCodeSessionModal;
