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
  Trash2,
  User,
  Calendar,
  Activity,
  ArrowRight,
  Copy,
  Share2,
  Eye,
  EyeOff
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
      javascript: 'bg-yellow-500 text-white',
      typescript: 'bg-blue-600 text-white',
      python: 'bg-green-600 text-white',
      java: 'bg-red-600 text-white',
      cpp: 'bg-purple-600 text-white',
      csharp: 'bg-indigo-600 text-white',
      go: 'bg-cyan-600 text-white',
      rust: 'bg-orange-600 text-white',
      php: 'bg-pink-600 text-white',
      ruby: 'bg-red-700 text-white',
      swift: 'bg-orange-500 text-white',
      kotlin: 'bg-purple-700 text-white',
      html: 'bg-orange-700 text-white',
      css: 'bg-blue-700 text-white',
      sql: 'bg-gray-700 text-white',
      json: 'bg-gray-600 text-white',
      xml: 'bg-green-700 text-white',
      yaml: 'bg-gray-800 text-white',
      markdown: 'bg-gray-900 text-white'
    };
    return colors[lang] || 'bg-gray-600 text-white';
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔵',
      python: '🐍',
      java: '☕',
      cpp: '⚙️',
      csharp: '🔷',
      go: '🐹',
      rust: '🦀',
      php: '🐘',
      ruby: '💎',
      swift: '🍎',
      kotlin: '📱',
      html: '🌐',
      css: '🎨',
      sql: '🗄️',
      json: '📄',
      xml: '📋'
    };
    return icons[lang] || '💻';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:4000${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
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
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-blue-300 shadow-sm  transition-all duration-200"
          >
            <Globe className="h-4 w-4 mr-2" />
            Browse Public
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowJoinModal(true)}
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-purple-300 shadow-sm  transition-all duration-200"
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
              className="pl-10 bg-white/80"
            />
          </div>
        </div>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-48 bg-white/80 ">
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
          <Card key={session._id} className="group hover:shadow-blue-500/10 transition-all duration-300 border overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getLanguageColor(session.language) + " rounded-full px-4 py-2 border-none"}>
                      {session.language.toUpperCase()}
                    </Badge>
                    {session.isPublic ? (
                      <Badge variant="outline" className="bg-green-500 text-white rounded-full px-4 py-2  border-none">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500 text-white  rounded-full px-4 py-2  border-none">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* {session.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {session.description}
                </p>
              )} */}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  {/* <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{session.participantCount}/{session.maxParticipants}</span>
                  </div> */}
                  <div className="flex items-center space-x-1 px-4 py-2 bg-gray-100 rounded-full dark:bg-gray-800">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 px-4 py-2 bg-gray-100 rounded-full dark:bg-gray-800 truncate">
                  {session.owner.username}
                </div>
                <div className="flex items-center space-x-2">
                  {session.isActive ? (
                    <Button
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
                            onClick={() => handleGenerateInvite(session)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Users className="h-4 w-4 mr-1 text-white" />
                            Invite
                          </Button>
                          {/* <Button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to end this session? Users will no longer be able to join.')) {
                                endSession();
                              }
                            }}
                            className="bg-orange-600 text-white hover:bg-orange-700"
                          >
                            <Square className="h-4 w-4 mr-1" />
                            End
                          </Button> */}
                        </>
                      )}
                      <Button 
                      zize="lg"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this session? This action cannot be undone.')) {
                            deleteSession(session._id);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
