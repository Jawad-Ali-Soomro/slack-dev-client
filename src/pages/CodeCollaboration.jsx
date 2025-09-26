import React, { useState, useEffect } from 'react';
import { useCodeCollaboration } from '../contexts/CodeCollaborationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Plus, 
  Code, 
  Users, 
  Clock, 
  Search,
  Filter,
  Globe,
  Lock,
  Play,
  Square,
  Trash2
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import CreateCodeSessionModal from '../components/CreateCodeSessionModal';
import { toast } from 'sonner';

const CodeCollaboration = () => {
  const { user } = useAuth();
  const {
    sessions,
    currentSession,
    loadUserSessions,
    loadPublicSessions,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    deleteSession,
    generateInviteCode,
    joinByInviteCode
  } = useCodeCollaboration();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [publicSessions, setPublicSessions] = useState([]);
  const [showPublicSessions, setShowPublicSessions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  // Form state for creating session
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    isPublic: false,
    maxParticipants: 10,
    tags: []
  });

  // Form state for joining session
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    loadUserSessions();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await createSession(newSession);
      setShowCreateModal(false);
      setNewSession({
        title: '',
        description: '',
        language: 'javascript',
        code: '',
        isPublic: false,
        maxParticipants: 10,
        tags: []
      });
      toast.success('Session created successfully');
    } catch (error) {
      toast.error('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    
    setIsLoading(true);
    try {
      await joinSession(sessionId.trim());
      setShowJoinModal(false);
      setSessionId('');
      toast.success('Joined session successfully');
    } catch (error) {
      toast.error('Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPublicSession = async (session) => {
    setIsLoading(true);
    try {
      await joinSession(session._id);
      toast.success('Joined session successfully');
    } catch (error) {
      toast.error('Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublicSessionsData = async () => {
    setIsLoading(true);
    try {
      const sessions = await loadPublicSessions(languageFilter);
      setPublicSessions(sessions);
      setShowPublicSessions(true);
    } catch (error) {
      toast.error('Failed to load public sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invite code generation
  const handleGenerateInvite = async (session) => {
    try {
      const result = await generateInviteCode(session._id);
      setSelectedSession(session);
      setInviteCode(result.inviteCode);
      setInviteLink(result.inviteLink);
      setShowInviteModal(true);
    } catch (error) {
      toast.error('Failed to generate invite code');
    }
  };

  // Handle joining by invite code
  const handleJoinByInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    try {
      await joinByInviteCode(inviteCode.trim());
      setInviteCode('');
      setShowJoinModal(false);
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !languageFilter || languageFilter === 'all' || session.language === languageFilter;
    
    // Filter based on visibility
    const isOwner = session.owner._id === user?.id || session.owner._id === user?._id;
    const isParticipant = session.participants.some(p => p.user._id === user?.id || p.user._id === user?._id);
    const isInvited = session.invitedUsers?.includes(user?.id || user?._id);
    const isPublic = session.isPublic;
    
    const canSee = isOwner || isParticipant || isInvited || isPublic;
    
    return matchesSearch && matchesLanguage && canSee;
  });

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-red-500',
      cpp: 'bg-purple-500',
      csharp: 'bg-indigo-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500',
      php: 'bg-pink-500',
      ruby: 'bg-red-600',
      swift: 'bg-orange-400',
      kotlin: 'bg-purple-600',
      html: 'bg-orange-600',
      css: 'bg-blue-600',
      sql: 'bg-gray-600',
      json: 'bg-gray-500',
      xml: 'bg-green-600',
      yaml: 'bg-gray-700',
      markdown: 'bg-gray-800'
    };
    return colors[lang] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (currentSession) {
    return (
      <CodeEditor 
        sessionId={currentSession._id} 
        onClose={() => leaveSession()} 
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Code Collaboration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Collaborate on code in real-time with other developers
            </p>
          </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadPublicSessionsData}
            disabled={isLoading}
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Globe className="h-4 w-4 mr-2" />
            Browse Public
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowJoinModal(true)}
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Join by Invite Code
          </Button>
          
          <Button 
            onClick={() => setShowCreateSessionModal(true)}
            className="transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-8">
        <div className='w-[400px]'>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
        </div>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-48 bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="php">PHP</SelectItem>
            <SelectItem value="ruby">Ruby</SelectItem>
            <SelectItem value="swift">Swift</SelectItem>
            <SelectItem value="kotlin">Kotlin</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <Card key={session._id} className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getLanguageColor(session.language)}>
                      {session.language.toUpperCase()}
                    </Badge>
                    {session.isPublic ? (
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {session.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {session.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{session.participantCount}/{session.maxParticipants}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  by {session.owner.username}
                </div>
                <div className="flex items-center space-x-2">
                  {session.isActive ? (
                    <Button
                      size="sm"
                      onClick={() => handleJoinPublicSession(session)}
                      disabled={isLoading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Ended
                    </Badge>
                  )}
                  
                  {/* Owner actions */}
                  {session.owner._id === user?.id || session.owner._id === user?._id ? (
                    <div className="flex items-center space-x-1">
                      {session.isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateInvite(session)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to end this session? Users will no longer be able to join.')) {
                                endSession();
                              }
                            }}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Square className="h-4 w-4 mr-1" />
                            End
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this session? This action cannot be undone.')) {
                            deleteSession(session._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No sessions found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || languageFilter 
              ? 'Try adjusting your search or filters'
              : 'Create your first code collaboration session'
            }
          </p>
          <Button onClick={() => setShowCreateSessionModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      )}
      
      {/* Create Code Session Modal */}
      <CreateCodeSessionModal
        isOpen={showCreateSessionModal}
        onClose={() => setShowCreateSessionModal(false)}
      />

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Invite Code</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="invite-code"
                  value={inviteCode}
                  readOnly
                  className="font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="invite-link">Invite Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="invite-link"
                  value={inviteLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyInviteLink}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Share this code or link with others to invite them to join the session.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join by Invite Code Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="join-code">Enter Invite Code</Label>
              <Input
                id="join-code"
                placeholder="Enter invite code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinByInviteCode}
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default CodeCollaboration;
