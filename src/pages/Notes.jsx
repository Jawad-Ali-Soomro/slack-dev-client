import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Home,
  Save,
  X,
  Plus,
  Book,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import noteService from "../services/noteService";
import { useAuth } from "../contexts/AuthContext";

// Import edit-pdf components
import { PdfEditor } from "edit-pdf";

const Notes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get note data from navigation state (if coming from LearnPoint)
  const noteFromState = location.state?.note || null;

  const [isLoading, setIsLoading] = useState(false);
  const [shouldExport, setShouldExport] = useState(false);
  const [savedFile, setSavedFile] = useState(null);
  const pdfEditorRef = useRef(null);

  // Note details form - exactly like LearnPoint component
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    department: "",
    subject: "",
    tags: "",
  });

  // Predefined departments - same as LearnPoint
  const PREDEFINED_DEPARTMENTS = [
    "Computer Science",
    "BBA (Business Administration)",
    "Commerce",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Psychology",
    "History",
    "Political Science",
    "Sociology",
    "Accounting",
    "Finance",
    "Marketing",
    "Management",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Architecture",
    "Medicine",
    "Law",
    "Education",
    "Journalism",
    "Art & Design",
    "Music",
  ];

  // Initialize form if note data is passed from LearnPoint
  useEffect(() => {
    if (noteFromState) {
      setNewNote({
        title: noteFromState.title || "",
        description: noteFromState.description || "",
        department: noteFromState.department || "",
        subject: noteFromState.subject || "",
        tags: noteFromState.tags ? noteFromState.tags.join(", ") : "",
      });
    }
  }, [noteFromState]);

  // Automatically set default values
  useEffect(() => {
    if (!newNote.title) {
      setNewNote((prev) => ({
        ...prev,
        title: "Sample Study Notes",
        department: "Computer Science",
        subject: "Data Structures",
      }));
    }

    toast.success("Sample PDF loaded. Start editing!");
  }, []);

  // This function will be called by PdfEditor when export is complete
  const handleSave = (editedFile) => {
    // Store the file for later use
    setSavedFile(editedFile);
    toast.success("PDF editing complete! Fill in details and click Save Note.");
  };

  // Handle export trigger
  const handleExport = () => {
    setShouldExport(true);
  };

  // Called when PdfEditor finishes exporting
  const handleExportComplete = () => {
    setShouldExport(false);
  };

  // Create note with the saved file - exactly like LearnPoint's handleCreateNote
  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.department || !newNote.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!savedFile) {
      toast.error("Please edit and save the PDF first");
      return;
    }

    try {
      setIsLoading(true);

      // Create noteData exactly like LearnPoint
      const noteData = {
        ...newNote,
        tags: newNote.tags ? newNote.tags.split(",").map((t) => t.trim()) : [],
        pdf: savedFile, // Use the saved file from PdfEditor
      };

      // Create note - same as LearnPoint
      await noteService.createNote(noteData);

      toast.success("Note created successfully!");

      // Navigate back to LearnPoint
      setTimeout(() => {
        navigate("/learn-point");
      }, 1500);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error(error.message || "Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes - same as LearnPoint
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle department change using Select component
  const handleDepartmentChange = (value) => {
    setNewNote((prev) => ({
      ...prev,
      department: value,
      // Reset subject if department changes
      subject: value === "Other" ? "" : prev.subject,
    }));
  };

  return (
    <div className="h-[90vh] p-4 md:p-6">
      <div className="">

        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Book className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create & Edit Notes
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Edit sample PDF and create new note
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-[20px] shadow-xl p-6 sticky top-6">
              <div className="space-y-6">
                {/* File Info Section */}
                <div>
                  {!savedFile && (
                    <Button
                      onClick={handleExport}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Export Edited PDF
                    </Button>
                  )}
                </div>

                {/* Note Details Form - Same structure as LearnPoint */}
                <div className="space-y-4">
    
                  <div>
                 
                    <Input
                      type="text"
                      value={newNote.title}
                      onChange={(e) =>
                        setNewNote({ ...newNote, title: e.target.value })
                      }
                      placeholder="Note Title *"
                      className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    
                    <Textarea
                      value={newNote.description}
                      onChange={(e) =>
                        setNewNote({ ...newNote, description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      rows="3"
                      className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    />
                  </div>

                  <div>
                   
                    <Select
                      value={newNote.department}
                      onValueChange={handleDepartmentChange}
                    >
                      <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white">
                        <SelectValue placeholder="Department *" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700 max-h-[300px]">
                        {PREDEFINED_DEPARTMENTS.map((dept) => (
                          <SelectItem
                            key={dept}
                            className="cursor-pointer h-10 px-5"
                            value={dept}
                          >
                            {dept}
                          </SelectItem>
                        ))}
                        <SelectItem
                          className="cursor-pointer h-10 px-5"
                          value="Other"
                        >
                          Other (Please specify)
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {newNote.department === "Other" && (
                      <Input
                        type="text"
                        value={newNote.department}
                        onChange={(e) =>
                          setNewNote((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        placeholder="Enter department name"
                        className="w-full mt-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                      />
                    )}
                    
                    {newNote.department &&
                      !PREDEFINED_DEPARTMENTS.includes(newNote.department) &&
                      newNote.department !== "Other" && (
                        <p className="text-xs text-blue-500 mt-1">
                          New department will be created
                        </p>
                      )}
                  </div>

                  <div>
                    
                    <Input
                      type="text"
                      name="subject"
                      value={newNote.subject}
                      onChange={handleInputChange}
                      placeholder="Subject *"
                      className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    
                    <Input
                      type="text"
                      name="tags"
                      value={newNote.tags}
                      onChange={handleInputChange}
                      placeholder="Tags (comma separated)"
                      className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
                    />
                    
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - PDF Editor/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 bg-white rounded-[20px]"
          >
            <div className="rounded-[20px] shadow-xl h-full min-h-[600px] overflow-hidden">
              {/* PDF Editor */}
              <div className="h-full flex flex-col">
                {/* Editor Header */}
                <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-700">
                

                  <div className="flex items-center gap-2">
                  
                      <Button
              onClick={handleCreateNote}
              disabled={isLoading || !savedFile}
              className="bg-green-600 hover:bg-green-700 w-[200px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Create Note"}
            </Button>
                  </div>
                </div>

                {/* PDF Editor */}
                <div className="flex-1 overflow-hidden">
                  <PdfEditor
                    ref={pdfEditorRef}
                    fileUrl="/sample.pdf"
                    onSave={handleSave}
                    shouldExport={shouldExport}
                    onExportComplete={handleExportComplete}
                    className="h-full"
                    config={{
                      enableAnnotations: true,
                      enableDrawing: true,
                      enableTextHighlight: true,
                      enableFormFields: true,
                      enableWatermark: false,
                      toolbarPosition: "top",
                      defaultTool: "select",
                    }}
                  />
                </div>

                {/* Editor Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Features:</span>
                      <span className="ml-2">
                        Draw • Highlight • Add Text • Sign
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {savedFile ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <span className="text-sm font-medium">✓ PDF Ready</span>
                        </div>
                      ) : (
                        <Button
                          onClick={handleExport}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Export Edited PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Notes;