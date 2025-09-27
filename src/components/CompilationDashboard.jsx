import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Play, 
  Settings, 
  History, 
  Download, 
  Upload,
  Trash2,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Terminal,
  FileText,
  Database,
  Globe,
  Monitor
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import CodeCompiler from './CodeCompiler';
import compilationService from '../services/compilationService';

const CompilationDashboard = () => {
  const [activeTab, setActiveTab] = useState('compiler');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [compilationResults, setCompilationResults] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [pythonInitialized, setPythonInitialized] = useState(false);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0
  });

  // Load data on mount
  useEffect(() => {
    loadRecentExecutions();
    calculateStats();
    initializePython();
  }, []);

  // Initialize Python interpreter
  const initializePython = async () => {
    if (compilationService.isPythonReady()) {
      setPythonInitialized(true);
      return;
    }

    // Wait for Pyodide to load
    const checkPyodide = () => {
      if (typeof window.loadPyodide !== 'undefined') {
        compilationService.initializePython().then((success) => {
          setPythonInitialized(success);
        });
      } else {
        setTimeout(checkPyodide, 100);
      }
    };
    
    checkPyodide();
  };

  // Load recent executions from localStorage
  const loadRecentExecutions = () => {
    try {
      const stored = localStorage.getItem('compilationHistory');
      if (stored) {
        const history = JSON.parse(stored);
        setRecentExecutions(history.slice(0, 20)); // Keep last 20
      }
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  };

  // Save execution to history
  const saveExecution = (result) => {
    const newHistory = [result, ...recentExecutions.slice(0, 19)]; // Keep last 20
    setRecentExecutions(newHistory);
    
    try {
      localStorage.setItem('compilationHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save execution history:', error);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const total = recentExecutions.length;
    const successful = recentExecutions.filter(r => r.success).length;
    const failed = total - successful;
    const avgTime = recentExecutions.length > 0 
      ? recentExecutions.reduce((sum, r) => sum + (r.executionTime || 0), 0) / recentExecutions.length
      : 0;

    setStats({
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      averageExecutionTime: Math.round(avgTime)
    });
  };

  // Handle compilation result
  const handleCompilationResult = (result) => {
    setCompilationResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
    saveExecution(result);
    calculateStats();
  };

  // Clear all history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all execution history?')) {
      setRecentExecutions([]);
      setCompilationResults([]);
      localStorage.removeItem('compilationHistory');
      calculateStats();
    }
  };

  // Load sample code
  const loadSampleCode = (lang) => {
    const samples = {
      javascript: `// JavaScript Sample
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`,
      python: `# Python Sample - Working in Browser!
print("Hello, World from Python!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("\\nFibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# Python list comprehension
squares = [x**2 for x in range(1, 6)]
print(f"\\nSquares: {squares}")

# Working with strings
text = "Python is running in your browser!"
print(f"\\nUppercase: {text.upper()}")
print(f"Word count: {len(text.split())}")`,
      java: `// Java Sample - Simulated Execution
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        for (int i = 0; i < 10; i++) {
            System.out.println("Fibonacci " + i + ": " + fibonacci(i));
        }
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
      cpp: `// C++ Sample - Simulated Execution
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    
    for (int i = 0; i < 10; i++) {
        cout << "Fibonacci " << i << ": " << fibonacci(i) << endl;
    }
    
    return 0;
}`,
      csharp: `// C# Sample - Simulated Execution
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        for (int i = 0; i < 10; i++) {
            Console.WriteLine("Fibonacci " + i + ": " + Fibonacci(i));
        }
    }
    
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}`,
      c: `// C Sample - Simulated Execution
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, World!\\n");
    
    for (int i = 0; i < 10; i++) {
        printf("Fibonacci %d: %d\\n", i, fibonacci(i));
    }
    
    return 0;
}`
    };

    setCode(samples[lang] || '');
  };

  const supportedLanguages = compilationService.getSupportedLanguages();

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black dark:bg-white rounded-lg">
                <Code2 className="h-8 w-8 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                  Code Compilation Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Compile and execute code in multiple programming languages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Executions</CardTitle>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Play className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalExecutions}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All time executions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Successful</CardTitle>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.successfulExecutions}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Successful runs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Failed</CardTitle>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <XCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.failedExecutions}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Failed executions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Avg. Time</CardTitle>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageExecutionTime}ms</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Average execution</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6">
            <TabsList className="relative grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <TabsTrigger 
                value="compiler" 
                className="relative cursor-pointer flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-black transition-all duration-300"
              >
                <Code2 className="h-4 w-4" />
                <span>Compiler</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="relative cursor-pointer flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-black transition-all duration-300"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="snippets"
                className="relative cursor-pointer flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-black transition-all duration-300"
              >
                <FileText className="h-4 w-4" />
                <span>Snippets</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="relative cursor-pointer flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-black transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Compiler Tab */}
          <TabsContent value="compiler" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Editor */}
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-black dark:bg-white rounded-lg">
                        <Monitor className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Code Editor</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {supportedLanguages.map(lang => {
                                const info = compilationService.getLanguageInfo(lang);
                                return (
                                  <SelectItem key={lang} value={lang}>
                                    {info?.icon} {info?.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSampleCode(language)}
                          >
                            Load Sample
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code here..."
                    className="min-h-96 font-mono text-sm resize-none"
                  />
                </CardContent>
              </Card>

              {/* Compiler */}
              <div>
                <CodeCompiler
                  code={code}
                  language={language}
                  onResult={handleCompilationResult}
                  showLanguageSelector={false}
                  className="h-full"
                />
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black dark:bg-white rounded-lg">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Execution History</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400">Recent code executions and results</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentExecutions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No execution history</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start compiling code to see your execution history here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentExecutions.map((execution, index) => {
                      const langInfo = compilationService.getLanguageInfo(execution.language?.toLowerCase());
                      return (
                        <motion.div
                          key={execution.timestamp}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {execution.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(execution.timestamp).toLocaleString()}
                              </span>
                              <Badge className={`${langInfo?.color || 'bg-gray-500'} text-white text-xs`}>
                                {langInfo?.icon} {langInfo?.name}
                              </Badge>
                            </div>
                            {execution.executionTimeFormatted && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {execution.executionTimeFormatted}
                              </Badge>
                            )}
                          </div>
                          <div className="bg-gray-900 dark:bg-gray-950 rounded p-3 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap">
                              {execution.success ? execution.formattedOutput : execution.formattedError}
                            </pre>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Snippets Tab */}
          <TabsContent value="snippets" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Code Snippets</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">Quick start templates for different languages</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportedLanguages.map(lang => {
                    const info = compilationService.getLanguageInfo(lang);
                    return (
                      <motion.div
                        key={lang}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          setLanguage(lang);
                          loadSampleCode(lang);
                          setActiveTab('compiler');
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{info?.icon}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{info?.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to load a {info?.name} sample
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Compilation Settings</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">Configure compilation options and preferences</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supported Languages</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {supportedLanguages.map(lang => {
                        const info = compilationService.getLanguageInfo(lang);
                        return (
                          <div key={lang} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xl">{info?.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{info?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Status</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-800 dark:text-green-200">Compilation Service Active</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          All supported languages are available for compilation.
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        pythonInitialized 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {pythonInitialized ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className={`font-medium ${
                            pythonInitialized 
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-yellow-800 dark:text-yellow-200'
                          }`}>
                            Python Interpreter {!pythonInitialized && <span className="animate-pulse">●</span>}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          pythonInitialized 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {pythonInitialized 
                            ? 'Python is ready for execution using Pyodide.'
                            : 'Python is initializing... This may take a moment on first load.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompilationDashboard;
