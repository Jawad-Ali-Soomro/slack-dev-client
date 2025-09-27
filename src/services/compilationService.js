/**
 * Code Compilation Service
 * Handles compilation and execution of code in multiple programming languages
 */

class CompilationService {
  constructor() {
    this.supportedLanguages = {
      javascript: {
        name: 'JavaScript',
        extension: 'js',
        executor: this.executeJavaScript.bind(this),
        icon: '🟨',
        color: 'text-yellow-600 dark:text-yellow-400'
      },
      python: {
        name: 'Python',
        extension: 'py',
        executor: this.executePython.bind(this),
        icon: '🐍',
        color: 'text-green-600 dark:text-green-400'
      },
      java: {
        name: 'Java',
        extension: 'java',
        executor: this.executeJava.bind(this),
        icon: '☕',
        color: 'text-red-600 dark:text-red-400'
      },
      cpp: {
        name: 'C++',
        extension: 'cpp',
        executor: this.executeCpp.bind(this),
        icon: '⚙️',
        color: 'text-purple-600 dark:text-purple-400'
      },
      csharp: {
        name: 'C#',
        extension: 'cs',
        executor: this.executeCSharp.bind(this),
        icon: '🔷',
        color: 'text-indigo-600 dark:text-indigo-400'
      },
      c: {
        name: 'C',
        extension: 'c',
        executor: this.executeC.bind(this),
        icon: '🔧',
        color: 'text-gray-600 dark:text-gray-400'
      }
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages);
  }

  /**
   * Get language info
   */
  getLanguageInfo(language) {
    return this.supportedLanguages[language] || null;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(language) {
    return language in this.supportedLanguages;
  }

  /**
   * Compile and execute code
   */
  async compileAndExecute(code, language, options = {}) {
    try {
      const languageInfo = this.getLanguageInfo(language);
      if (!languageInfo) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const startTime = Date.now();
      const result = await languageInfo.executor(code, options);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: result.output,
        error: null,
        executionTime,
        language: languageInfo.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error.message,
        executionTime: null,
        language: this.getLanguageInfo(language)?.name || language,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute JavaScript code
   */
  async executeJavaScript(code, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Create a safe execution environment
        const consoleLogs = [];
        const consoleErrors = [];
        const consoleWarns = [];
        
        // Store original console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        // Override console methods to capture output
        console.log = (...args) => {
          consoleLogs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalLog(...args);
        };
        
        console.error = (...args) => {
          consoleErrors.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalError(...args);
        };
        
        console.warn = (...args) => {
          consoleWarns.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalWarn(...args);
        };

        // Execute the code
        const result = new Function(code)();
        
        // Restore original console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        // Capture the result
        let resultOutput = '';
        if (result !== undefined) {
          resultOutput = typeof result === 'object' ? 
            JSON.stringify(result, null, 2) : 
            String(result);
        }

        // Combine all outputs
        const allOutput = [
          ...consoleLogs,
          ...consoleWarns,
          ...consoleErrors,
          resultOutput
        ].filter(Boolean);

        resolve({
          output: allOutput.join('\n'),
          warnings: consoleWarns.length > 0 ? consoleWarns.join('\n') : null
        });
        
      } catch (error) {
        // Restore original console methods in case of error
        console.log = console.log;
        console.error = console.error;
        console.warn = console.warn;
        reject(error);
      }
    });
  }

  /**
   * Execute Python code using Pyodide (Python in the browser)
   */
  async executePython(code, options = {}) { 
    return new Promise(async (resolve, reject) => {
      try {
        // Check if Pyodide is available
        if (typeof window.pyodide === 'undefined') {
          // Load Pyodide if not already loaded
          if (typeof window.loadPyodide === 'undefined') {
            // Load the Pyodide script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            script.onload = () => this.initializePythonExecution(code, resolve, reject);
            script.onerror = () => resolve({
              output: `Python execution requires Pyodide to be loaded.\n\nTo enable Python execution, add this to your HTML:\n<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>\n\nThen reload the page.`,
              warnings: null
            });
            document.head.appendChild(script);
          } else {
            this.initializePythonExecution(code, resolve, reject);
          }
        } else {
          this.runPythonCode(code, resolve, reject);
        }
      } catch (error) {
        resolve({
          output: `Python execution error: ${error.message}\n\nNote: Python execution requires Pyodide. Add this script to your HTML:\n<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>`,
          warnings: null
        });
      }
    });
  }

  /**
   * Initialize Pyodide for Python execution
   */
  async initializePythonExecution(code, resolve, reject) {
    try {
      window.pyodide = await window.loadPyodide();
      
      // Set up console capture for Python
      window.pyodide.runPython(`
import sys
from io import StringIO
import contextlib

class PythonOutputCapture:
    def __init__(self):
        self.output = StringIO()
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
    
    def __enter__(self):
        sys.stdout = self.output
        sys.stderr = self.output
        return self
    
    def __exit__(self, *args):
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr
    
    def get_output(self):
        return self.output.getvalue()

capture = PythonOutputCapture()
`);

      this.runPythonCode(code, resolve, reject);
    } catch (error) {
      resolve({
        output: `Failed to initialize Python interpreter: ${error.message}\n\nPython execution requires Pyodide to be loaded properly.`,
        warnings: null
      });
    }
  }

  /**
   * Run Python code using Pyodide
   */
  async runPythonCode(code, resolve, reject) {
    try {
      const startTime = Date.now();
      
      // Capture Python output
      const result = window.pyodide.runPython(`
with capture:
    try:
        exec('''${code.replace(/'/g, "\\'")}''')
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
`);

      const output = window.pyodide.runPython('capture.get_output()');
      const executionTime = Date.now() - startTime;

      resolve({
        output: output || 'Python code executed successfully (no output)',
        warnings: null,
        executionTime
      });
    } catch (error) {
      resolve({
        output: `Python execution error: ${error.message}\n\nCode:\n${code}`,
        warnings: null
      });
    }
  }

  /**
   * Execute Java code using browser-based simulation
   */
  async executeJava(code, options = {}) {
    return new Promise(async (resolve) => {
      try {
        const startTime = Date.now();
        
        // Simulate Java execution with basic parsing
        const output = this.simulateJavaExecution(code);
        const executionTime = Date.now() - startTime;

        resolve({
          output: output,
          warnings: ['Note: This is a simulated Java execution. For full Java support, a backend service is required.'],
          executionTime
        });
      } catch (error) {
        resolve({
          output: `Java execution error: ${error.message}\n\nCode:\n${code}`,
          warnings: null
        });
      }
    });
  }

  /**
   * Simulate Java execution for demonstration purposes
   */
  simulateJavaExecution(code) {
    const lines = code.split('\n');
    let output = '';
    let inMainMethod = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect main method
      if (trimmed.includes('public static void main')) {
        inMainMethod = true;
        continue;
      }

      // Track braces to know when main method ends
      if (inMainMethod) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && trimmed !== '') {
          inMainMethod = false;
          continue;
        }

        // Simulate System.out.println
        if (trimmed.startsWith('System.out.println')) {
          const match = trimmed.match(/System\.out\.println\((.+)\)/);
          if (match) {
            let content = match[1];
            // Remove quotes and handle basic string concatenation
            content = content.replace(/"/g, '').replace(/\s*\+\s*/g, ' ');
            output += content + '\n';
          }
        }

        // Simulate System.out.print
        if (trimmed.startsWith('System.out.print')) {
          const match = trimmed.match(/System\.out\.print\((.+)\)/);
          if (match) {
            let content = match[1];
            content = content.replace(/"/g, '').replace(/\s*\+\s*/g, ' ');
            output += content;
          }
        }
      }
    }

    return output || 'Java code simulated (no output detected)\n\nNote: This is a basic simulation. Full Java execution requires a backend service.';
  }

  /**
   * Execute C++ code (placeholder - would need backend service)
   */
  async executeCpp(code, options = {}) {
    return new Promise(async (resolve) => {
      try {
        const startTime = Date.now();
        
        // Simulate C++ execution with basic parsing
        const output = this.simulateCppExecution(code);
        const executionTime = Date.now() - startTime;

        resolve({
          output: output,
          warnings: ['Note: This is a simulated C++ execution. For full C++ support, a backend service is required.'],
          executionTime
        });
      } catch (error) {
        resolve({
          output: `C++ execution error: ${error.message}\n\nCode:\n${code}`,
          warnings: null
        });
      }
    });
  }

  /**
   * Simulate C++ execution for demonstration purposes
   */
  simulateCppExecution(code) {
    const lines = code.split('\n');
    let output = '';
    let inMainFunction = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect main function
      if (trimmed.includes('int main(') || trimmed.includes('void main(')) {
        inMainFunction = true;
        continue;
      }

      // Track braces to know when main function ends
      if (inMainFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && trimmed !== '') {
          inMainFunction = false;
          continue;
        }

        // Simulate cout statements
        if (trimmed.includes('cout') && trimmed.includes('<<')) {
          const match = trimmed.match(/cout\s*<<\s*(.+)/);
          if (match) {
            let content = match[1];
            // Handle endl and basic string parsing
            content = content.replace(/endl/g, '\n');
            content = content.replace(/"([^"]*)"/g, '$1');
            content = content.replace(/\s*<<\s*/g, '');
            output += content;
          }
        }

        // Simulate printf statements
        if (trimmed.startsWith('printf(')) {
          const match = trimmed.match(/printf\("([^"]*)"(?:,\s*(.+))?\)/);
          if (match) {
            let format = match[1];
            let args = match[2] ? match[2].split(',').map(arg => arg.trim()) : [];
            
            // Basic format string replacement
            let result = format;
            args.forEach(arg => {
              result = result.replace(/%[sdif]/, arg.replace(/"/g, ''));
            });
            
            output += result;
          }
        }
      }
    }

    return output || 'C++ code simulated (no output detected)\n\nNote: This is a basic simulation. Full C++ execution requires a backend service.';
  }

  /**
   * Execute C# code (placeholder - would need backend service)
   */
  async executeCSharp(code, options = {}) {
    return new Promise(async (resolve) => {
      try {
        const startTime = Date.now();
        
        // Simulate C# execution with basic parsing
        const output = this.simulateCSharpExecution(code);
        const executionTime = Date.now() - startTime;

        resolve({
          output: output,
          warnings: ['Note: This is a simulated C# execution. For full C# support, a backend service is required.'],
          executionTime
        });
      } catch (error) {
        resolve({
          output: `C# execution error: ${error.message}\n\nCode:\n${code}`,
          warnings: null
        });
      }
    });
  }

  /**
   * Simulate C# execution for demonstration purposes
   */
  simulateCSharpExecution(code) {
    const lines = code.split('\n');
    let output = '';
    let inMainMethod = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect Main method
      if (trimmed.includes('static void Main(') || trimmed.includes('static int Main(')) {
        inMainMethod = true;
        continue;
      }

      // Track braces to know when Main method ends
      if (inMainMethod) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && trimmed !== '') {
          inMainMethod = false;
          continue;
        }

        // Simulate Console.WriteLine
        if (trimmed.startsWith('Console.WriteLine')) {
          const match = trimmed.match(/Console\.WriteLine\((.+)\)/);
          if (match) {
            let content = match[1];
            // Remove quotes and handle string concatenation
            content = content.replace(/"/g, '').replace(/\s*\+\s*/g, ' ');
            output += content + '\n';
          }
        }

        // Simulate Console.Write
        if (trimmed.startsWith('Console.Write')) {
          const match = trimmed.match(/Console\.Write\((.+)\)/);
          if (match) {
            let content = match[1];
            content = content.replace(/"/g, '').replace(/\s*\+\s*/g, ' ');
            output += content;
          }
        }
      }
    }

    return output || 'C# code simulated (no output detected)\n\nNote: This is a basic simulation. Full C# execution requires a backend service.';
  }

  /**
   * Execute C code using browser-based simulation
   */
  async executeC(code, options = {}) {
    return new Promise(async (resolve) => {
      try {
        const startTime = Date.now();
        
        // Simulate C execution with basic parsing
        const output = this.simulateCExecution(code);
        const executionTime = Date.now() - startTime;

        resolve({
          output: output,
          warnings: ['Note: This is a simulated C execution. For full C support, a backend service is required.'],
          executionTime
        });
      } catch (error) {
        resolve({
          output: `C execution error: ${error.message}\n\nCode:\n${code}`,
          warnings: null
        });
      }
    });
  }

  /**
   * Simulate C execution for demonstration purposes
   */
  simulateCExecution(code) {
    const lines = code.split('\n');
    let output = '';
    let inMainFunction = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect main function
      if (trimmed.includes('int main(') || trimmed.includes('void main(')) {
        inMainFunction = true;
        continue;
      }

      // Track braces to know when main function ends
      if (inMainFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && trimmed !== '') {
          inMainFunction = false;
          continue;
        }

        // Simulate printf statements
        if (trimmed.startsWith('printf(')) {
          const match = trimmed.match(/printf\("([^"]*)"(?:,\s*(.+))?\)/);
          if (match) {
            let format = match[1];
            let args = match[2] ? match[2].split(',').map(arg => arg.trim()) : [];
            
            // Basic format string replacement
            let result = format;
            args.forEach(arg => {
              result = result.replace(/%[sdif]/, arg.replace(/"/g, ''));
            });
            
            output += result;
          }
        }

        // Simulate puts statements
        if (trimmed.startsWith('puts(')) {
          const match = trimmed.match(/puts\("([^"]*)"\)/);
          if (match) {
            output += match[1] + '\n';
          }
        }
      }
    }

    return output || 'C code simulated (no output detected)\n\nNote: This is a basic simulation. Full C execution requires a backend service.';
  }


  /**
   * Format execution result for display
   */
  formatResult(result) {
    return {
      ...result,
      formattedOutput: result.output ? result.output.split('\n').join('\n') : '',
      formattedError: result.error ? result.error.split('\n').join('\n') : '',
      executionTimeFormatted: result.executionTime ? `${result.executionTime}ms` : null
    };
  }

  /**
   * Get compilation status
   */
  getCompilationStatus() {
    return {
      service: 'Code Compilation Service',
      version: '1.0.0',
      supportedLanguages: this.getSupportedLanguages().length,
      status: 'active',
      pythonReady: typeof window.pyodide !== 'undefined',
      pyodideLoaded: typeof window.loadPyodide !== 'undefined'
    };
  }

  /**
   * Check if Python is ready for execution
   */
  isPythonReady() {
    return typeof window.pyodide !== 'undefined';
  }

  /**
   * Initialize Python if needed
   */
  async initializePython() {
    if (this.isPythonReady()) {
      return true;
    }

    if (typeof window.loadPyodide === 'undefined') {
      return false;
    }

    try {
      window.pyodide = await window.loadPyodide();
      
      // Set up console capture for Python
      window.pyodide.runPython(`
import sys
from io import StringIO

class PythonOutputCapture:
    def __init__(self):
        self.output = StringIO()
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
    
    def __enter__(self):
        sys.stdout = self.output
        sys.stderr = self.output
        return self
    
    def __exit__(self, *args):
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr
    
    def get_output(self):
        return self.output.getvalue()

capture = PythonOutputCapture()
`);

      return true;
    } catch (error) {
      console.error('Failed to initialize Python:', error);
      return false;
    }
  }
}

// Create singleton instance
const compilationService = new CompilationService();

export default compilationService;
