import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Download, 
  Copy, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Terminal,
  Eye,
  Code2,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import compilationService from '../services/compilationService';

const CodeCompiler = ({ 
  code = '', 
  language = 'javascript', 
  onResult = null,
  className = '',
  showLanguageSelector = true,
  showExecutionTime = true,
  showCopyButton = true,
  showDownloadButton = true,
  autoExecute = false
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Execute code
  const executeCode = useCallback(async () => {
    if (!code || !compilationService.isLanguageSupported(language)) return;
    
    setIsExecuting(true);
    setResult(null);

    try {
      const compilationResult = await compilationService.compileAndExecute(code, language);
      const formattedResult = compilationService.formatResult(compilationResult);
      
      setResult(formattedResult);
      
      // Add to execution history
      setExecutionHistory(prev => [formattedResult, ...prev.slice(0, 9)]); // Keep last 10 results
      
      // Call callback if provided
      if (onResult) {
        onResult(formattedResult);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        output: null,
        error: error.message,
        executionTime: null,
        language: compilationService.getLanguageInfo(language)?.name || language,
        timestamp: new Date().toISOString(),
        formattedOutput: '',
        formattedError: error.message,
        executionTimeFormatted: null
      };
      
      setResult(errorResult);
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)]);
      
      if (onResult) {
        onResult(errorResult);
      }
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, onResult]);

  // Copy result to clipboard
  const copyResult = useCallback(() => {
    if (!result) return;
    
    const textToCopy = result.success ? result.formattedOutput : result.formattedError;
    navigator.clipboard.writeText(textToCopy);
  }, [result]);

  // Download result
  const downloadResult = useCallback(() => {
    if (!result) return;
    
    const languageInfo = compilationService.getLanguageInfo(language);
    const extension = languageInfo?.extension || 'txt';
    const filename = `output_${Date.now()}.${extension}`;
    
    const content = result.success ? result.formattedOutput : result.formattedError;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, language]);

  // Open preview in new tab
  const openPreview = useCallback(() => {
    if (result?.previewUrl) {
      window.open(result.previewUrl, '_blank');
    }
  }, [result]);

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  // Get status icon and color
  const getStatusInfo = () => {
    if (isExecuting) {
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'Executing...',
        animate: 'animate-spin'
      };
    }
    
    if (!result) {
      return {
        icon: Code2,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-black',
        text: 'Ready to execute',
        animate: ''
      };
    }
    
    if (result.success) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        text: 'Execution successful',
        animate: ''
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: 'Execution failed',
        animate: ''
      };
    }
  };

  const statusInfo = getStatusInfo();
  const languageInfo = compilationService.getLanguageInfo(language);
  const canExecute = code && languageInfo && !isExecuting;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compiler Header */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                <statusInfo.icon className={`h-5 w-5 ${statusInfo.color} ${statusInfo.animate}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Code Compiler
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${languageInfo?.color || 'bg-gray-500'} text-white text-xs`}>
                    {languageInfo?.icon} {languageInfo?.name || language}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Execution Time */}
              {showExecutionTime && result?.executionTimeFormatted && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {result.executionTimeFormatted}
                </Badge>
              )}
              
              {/* History Button */}
              {executionHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs"
                >
                  <Terminal className="h-3 w-3 mr-1" />
                  History ({executionHistory.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={executeCode}
              disabled={!canExecute}
              className="bg-black hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black shadow-lg transition-all duration-300"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isExecuting ? 'Executing...' : 'Execute Code'}
            </Button>
            
            {result && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearResult}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                
                {showCopyButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyResult}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
                
                {showDownloadButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResult}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                
                {result.previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPreview}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <AnimatePresence>
        {showHistory && executionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Execution History</h4>
            {executionHistory.map((historyItem, index) => (
              <motion.div
                key={historyItem.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gray-50 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setResult(historyItem)}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {historyItem.success ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(historyItem.timestamp).toLocaleTimeString()}
                    </span>
                    {historyItem.executionTimeFormatted && (
                      <Badge variant="outline" className="text-xs">
                        {historyItem.executionTimeFormatted}
                      </Badge>
                    )}
                  </div>
                  <Badge className={`${languageInfo?.color || 'bg-gray-500'} text-white text-xs`}>
                    {languageInfo?.icon}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <CardTitle className="text-lg font-bold">
                      {result.success ? 'Execution Output' : 'Execution Error'}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {result.executionTimeFormatted && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.executionTimeFormatted}
                      </Badge>
                    )}
                    <Badge className={`${languageInfo?.color || 'bg-gray-500'} text-white text-xs`}>
                      {languageInfo?.icon} {languageInfo?.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-black dark:bg-gray-950 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                    {result.success ? result.formattedOutput : result.formattedError}
                  </pre>
                </div>
                
                {result.warnings && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</span>
                    </div>
                    <pre className="text-sm text-yellow-700 dark:text-yellow-300 font-mono whitespace-pre-wrap">
                      {result.warnings}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodeCompiler;
