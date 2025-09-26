import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCodeCollaboration } from '../contexts/CodeCollaborationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Users, 
  Maximize2, 
  Minimize2,
  Copy,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';

const CodeEditor = () => {
  const { user } = useAuth();
  const {
    currentSession,
    participants,
    code,
    cursorPosition,
    isConnected,
    updateCode,
    updateCursor,
    handleTyping,
    joinSession,
    leaveSession,
  } = useCodeCollaboration();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [isOwner, setIsOwner] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);

  const editorRef = useRef(null);
  const editorViewRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Language configurations
  const languageConfigs = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
    html: html(),
    css: css(),
    json: json(),
    xml: xml()
  };

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: code || '',
      extensions: [
        basicSetup,
        languageConfigs[language] || languageConfigs.javascript,
        isDarkMode ? oneDark : [],
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            updateCode(newCode);
            
            // Handle typing indicators
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            handleTyping(true);
            typingTimeoutRef.current = setTimeout(() => {
              handleTyping(false);
            }, 1000);
          }
          
          if (update.selectionSet) {
            const selection = update.state.selection.main;
            const pos = update.state.doc.lineAt(selection.from);
            updateCursor({
              line: pos.number,
              column: selection.from - pos.from
            });
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '100%'
          },
          '.cm-focused': {
            outline: 'none'
          },
          '.cm-editor': {
            height: '100%'
          },
          '.cm-scroller': {
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, isDarkMode]);

  // Update editor content when code changes
  useEffect(() => {
    if (editorViewRef.current && code !== undefined) {
      const currentContent = editorViewRef.current.state.doc.toString();
      if (currentContent !== code) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: code || ''
          }
        });
      }
    }
  }, [code]);

  // Check if current user is owner
  useEffect(() => {
    if (currentSession && user) {
      const ownerId = currentSession.owner._id || currentSession.owner.id;
      const userId = user.id || user._id;
      setIsOwner(ownerId === userId);
    }
  }, [currentSession, user]);

  // Update language when session changes
  useEffect(() => {
    if (currentSession?.language) {
      setLanguage(currentSession.language);
    }
  }, [currentSession]);

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            updateCode(newCode);
          }
        })
      });
    }
  }, [updateCode]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const handleSave = useCallback(() => {
    if (code) {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-${Date.now()}.${language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [code, language]);

  const handleCopy = useCallback(() => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  }, [code]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            handleCopy();
          }
          break;
        case 'Enter':
          e.preventDefault();
          // Handle run code
          break;
        default:
          break;
      }
    }
  }, [handleSave, handleCopy]);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:4000${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No active session</h3>
          <p className="text-muted-foreground">Join a code collaboration session to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[91vh] ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge variant="outline">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleThemeToggle}
            title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button> */}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            {showParticipants ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            title="Copy code (Ctrl+Shift+C)"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            title="Save code (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          
            <Button
              variant="destructive"
              size="sm"
              onClick={() => leaveSession(currentSession._id)}
            >
              End Session
            </Button>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <div
              ref={editorRef}
              className="h-full w-full"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Participants sidebar */}
        {showParticipants && (
          <div className="w-64 border-l p-4">
            <h3 className="font-semibold mb-4">Participants</h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant._id || participant.id}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(participant.avatar)} />
                    <AvatarFallback>
                      {(participant.name || participant.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.name || participant.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant.email}
                    </p>
                  </div>
                  {participant._id === user?.id || participant._id === user?._id ? (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  ) : (
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;