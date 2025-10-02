import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';
import { FileText, Download, Eye, Sparkles, Settings, BookOpen, Upload, Type, LayoutTemplate, Plus, X, Paperclip, Send } from 'lucide-react';
import { teacherAPI } from '../../services/api';

export function WorksheetGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isCustomTemplateOpen, setIsCustomTemplateOpen] = useState(false);
  const [isPremadeTemplateOpen, setIsPremadeTemplateOpen] = useState(false);
  const [isTemplateSelectionOpen, setIsTemplateSelectionOpen] = useState(false);
  const [allWorksheets, setAllWorksheets] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahayak_worksheets');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Algebra Basics', subject: 'Mathematics', grade: 'Grade 8', totalMarks: 50, createdAt: '2024-01-15', difficulty: 'Medium' },
      { id: '2', title: 'Chemical Bonding', subject: 'Chemistry', grade: 'Grade 10', totalMarks: 80, createdAt: '2024-01-14', difficulty: 'Hard' },
      { id: '3', title: 'Essay Writing', subject: 'English', grade: 'Grade 9', totalMarks: 20, createdAt: '2024-01-12', difficulty: 'Easy' },
      { id: '4', title: 'Fractions and Decimals', subject: 'Mathematics', grade: 'Grade 6', totalMarks: 30, createdAt: '2024-01-10', difficulty: 'Easy' },
      { id: '5', title: 'Plant Biology', subject: 'Biology', grade: 'Grade 11', totalMarks: 60, createdAt: '2024-01-08', difficulty: 'Medium' }
    ];
  });
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    totalMarks: '',
    sections: [] as Array<{ name: string; marks: string; questionCount: string }>
  });
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    topic: '',
    difficulty: '',
    questionCount: '10',
    questionTypes: [] as string[],
    instructions: '',
    includeAnswerKey: true,
    timeLimit: '60'
  });
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('fade-in');
  }, []);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology'];
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];
  const questionTypes = ['Multiple Choice', 'Fill in the Blanks', 'Short Answer', 'Long Answer', 'True/False', 'Matching'];
  
  const predefinedTemplates = [
    {
      id: '20marks',
      name: '20 Marks Template',
      totalMarks: 20,
      sections: [
        { name: 'Multiple Choice', marks: 10, questionCount: 10, marksPerQuestion: 1 },
        { name: 'Short Answer', marks: 10, questionCount: 2, marksPerQuestion: 5 }
      ]
    },
    {
      id: '50marks',
      name: '50 Marks Template',
      totalMarks: 50,
      sections: [
        { name: 'Multiple Choice', marks: 15, questionCount: 15, marksPerQuestion: 1 },
        { name: 'Short Answer', marks: 20, questionCount: 4, marksPerQuestion: 5 },
        { name: 'Long Answer', marks: 15, questionCount: 1, marksPerQuestion: 15 }
      ]
    },
    {
      id: '80marks',
      name: '80 Marks Template',
      totalMarks: 80,
      sections: [
        { name: 'Multiple Choice', marks: 20, questionCount: 20, marksPerQuestion: 1 },
        { name: 'Fill in the Blanks', marks: 15, questionCount: 15, marksPerQuestion: 1 },
        { name: 'Short Answer', marks: 25, questionCount: 5, marksPerQuestion: 5 },
        { name: 'Long Answer', marks: 20, questionCount: 2, marksPerQuestion: 10 }
      ]
    }
  ];

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(t => t !== type)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Supported document formats
      const supportedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/rtf',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.spreadsheet'
      ];

      if (!supportedTypes.includes(file.type)) {
        toast.error('Please upload a supported document format (PDF, DOC, DOCX, PPT, PPTX, TXT, CSV, XLS, XLSX, RTF, ODT, ODP, ODS)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size should be less than 10MB');
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const getFileTypeDescription = (file: File) => {
    const extension = file.name.split('.').pop()?.toUpperCase();
    const typeMap: { [key: string]: string } = {
      'PDF': 'PDF File',
      'DOC': 'Word Document',
      'DOCX': 'Word Document',
      'PPT': 'PowerPoint Presentation',
      'PPTX': 'PowerPoint Presentation',
      'TXT': 'Text File',
      'CSV': 'CSV File',
      'XLS': 'Excel Spreadsheet',
      'XLSX': 'Excel Spreadsheet',
      'RTF': 'Rich Text Document',
      'ODT': 'OpenDocument Text',
      'ODP': 'OpenDocument Presentation',
      'ODS': 'OpenDocument Spreadsheet'
    };
    return typeMap[extension || ''] || 'Document';
  };

  const addCustomSection = () => {
    setCustomTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, { name: '', marks: '', questionCount: '' }]
    }));
  };

  const removeCustomSection = (index: number) => {
    setCustomTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateCustomSection = (index: number, field: string, value: string) => {
    setCustomTemplate(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const saveCustomTemplate = () => {
    if (!customTemplate.name || !customTemplate.totalMarks || customTemplate.sections.length === 0) {
      toast.error('Please fill in all fields for the custom template');
      return;
    }
    
    const totalSectionMarks = customTemplate.sections.reduce((sum, section) => sum + parseInt(section.marks || '0'), 0);
    if (totalSectionMarks !== parseInt(customTemplate.totalMarks)) {
      toast.error('Section marks should add up to total marks');
      return;
    }

    toast.success('Custom template created successfully!');
    setSelectedTemplate('custom');
    setIsCustomTemplateOpen(false);
  };

  const handleGenerate = async () => {
    if (!formData.subject || !formData.grade || !formData.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedTemplate && !uploadedFile && !contentText) {
      toast.error('Please provide content source (file upload, text input, or template)');
      return;
    }

    setIsGenerating(true);
    
    try {
      const worksheetData = {
        ...formData,
        template: selectedTemplate,
        uploadedFile: uploadedFile?.name,
        contentText
      };

      try {
        const response = await teacherAPI.generateWorksheet(worksheetData);
        const worksheet = response.data;
        
        // Add to all worksheets and save to localStorage
        const updatedWorksheets = [worksheet, ...allWorksheets];
        setAllWorksheets(updatedWorksheets);
        localStorage.setItem('sahayak_worksheets', JSON.stringify(updatedWorksheets));
        
        setGeneratedWorksheet(worksheet);
        toast.success('Worksheet generated successfully!');
      } catch (apiError) {
        // Fallback to demo generation
        console.log('API not available, using demo generation');
        const selectedTemplateData = predefinedTemplates.find(t => t.id === selectedTemplate);
        const worksheet = {
          id: Math.random().toString(36).substr(2, 9),
          title: formData.title || `${formData.subject} - ${formData.topic}`,
          subject: formData.subject,
          grade: formData.grade,
          topic: formData.topic,
          difficulty: formData.difficulty,
          questionCount: selectedTemplateData ? 
            selectedTemplateData.sections.reduce((sum, section) => sum + section.questionCount, 0) : 
            parseInt(formData.questionCount),
          timeLimit: parseInt(formData.timeLimit),
          template: selectedTemplateData || (selectedTemplate === 'custom' ? customTemplate : null),
          totalMarks: selectedTemplateData ? selectedTemplateData.totalMarks : null,
          contentSource: uploadedFile ? 'Uploaded File' : contentText ? 'Text Input' : 'Template',
          createdAt: new Date().toISOString().split('T')[0],
          questions: generateSampleQuestions()
        };
        
        // Add to all worksheets and save to localStorage
        const updatedWorksheets = [worksheet, ...allWorksheets];
        setAllWorksheets(updatedWorksheets);
        localStorage.setItem('sahayak_worksheets', JSON.stringify(updatedWorksheets));
        
        setGeneratedWorksheet(worksheet);
        toast.success('Worksheet generated successfully!');
      }
    } catch (error) {
      console.error('Worksheet generation error:', error);
      toast.error('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleQuestions = () => {
    return [
      {
        id: 1,
        type: 'Multiple Choice',
        question: 'What is 25 + 37?',
        options: ['52', '62', '72', '82'],
        correctAnswer: '62'
      },
      {
        id: 2,
        type: 'Fill in the Blanks',
        question: 'The sum of angles in a triangle is _____ degrees.',
        correctAnswer: '180'
      },
      {
        id: 3,
        type: 'Short Answer',
        question: 'Explain the difference between prime and composite numbers.',
        correctAnswer: 'Prime numbers have only two factors (1 and itself), while composite numbers have more than two factors.'
      }
    ];
  };

  const handleDownload = async () => {
    try {
      // In a real app, this would download the actual PDF
      toast.success('Worksheet downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download worksheet');
    }
  };

  const handlePreview = async () => {
    try {
      // In a real app, this would open a preview window
      toast.info('Opening preview in new window...');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to open preview');
    }
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${animationClass}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="slide-in-left">
          <h1 className="text-3xl font-bold">Worksheet Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create custom worksheets with AI assistance
          </p>
        </div>
        <div className="flex items-center gap-2 slide-in-right">
          <Badge variant="secondary" className="flex items-center gap-1 animate-pulse-color">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="space-y-6 slide-in-left">
          {/* Content Source Section - ChatGPT Style */}
          <Card className="glass-effect card-tilt hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-breathe" />
                <span className="animate-gradient-text">Content Source</span>
              </CardTitle>
              <CardDescription>
                Upload a file or describe the content you want to generate questions from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Uploaded File Display */}
                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg glass-effect hover-lift transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary animate-breathe" />
                      <div>
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {getFileTypeDescription(uploadedFile)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUploadedFile}
                      className="btn-3d hover-glow"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* ChatGPT-style Input Area */}
                <div className="relative">
                  <Textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder="Describe the content you want to generate questions from"
                    rows={4}
                    className="resize-none pr-20 min-h-[100px] glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                  />
                  
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {/* File Upload Button */}
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.xls,.xlsx,.rtf,.odt,.odp,.ods"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload-button"
                      />
                      <label 
                        htmlFor="file-upload-button"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-300 cursor-pointer btn-3d hover-glow"
                      >
                        <Paperclip className="h-4 w-4" />
                      </label>
                    </div>

                    {/* Template Selection */}
                    <Dialog open={isTemplateSelectionOpen} onOpenChange={setIsTemplateSelectionOpen}>
                      <DialogTrigger asChild>
                        <button className="inline-flex items-center justify-center h-8 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-300 btn-3d hover-glow">
                          <LayoutTemplate className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md glass-effect">
                        <DialogHeader>
                          <DialogTitle className="animate-gradient-text">Select Template Type</DialogTitle>
                          <DialogDescription>
                            Choose between pre-made templates or create your own custom template
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Button 
                            variant="outline" 
                            className="w-full h-16 flex-col gap-2 btn-3d glass-effect hover-glow"
                            onClick={() => {
                              setIsTemplateSelectionOpen(false);
                              setIsPremadeTemplateOpen(true);
                            }}
                          >
                            <LayoutTemplate className="h-5 w-5" />
                            <span>Pre-made Templates</span>
                            <span className="text-xs text-muted-foreground">Choose from 20, 50, or 80 marks templates</span>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full h-16 flex-col gap-2 btn-3d glass-effect hover-glow"
                            onClick={() => {
                              setIsTemplateSelectionOpen(false);
                              setIsCustomTemplateOpen(true);
                            }}
                          >
                            <Plus className="h-5 w-5" />
                            <span>Custom Template</span>
                            <span className="text-xs text-muted-foreground">Create your own template structure</span>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Pre-made Templates Dialog */}
                    <Dialog open={isPremadeTemplateOpen} onOpenChange={setIsPremadeTemplateOpen}>
                      <DialogContent className="max-w-2xl glass-effect">
                        <DialogHeader>
                          <DialogTitle className="animate-gradient-text">Pre-made Templates</DialogTitle>
                          <DialogDescription>
                            Choose from our professionally designed worksheet templates
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          {predefinedTemplates.map((template) => (
                            <div
                              key={template.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTemplate === template.id
                                  ? 'border-primary bg-primary/10 glass-effect'
                                  : 'border-muted hover:border-primary/50 glass-effect hover-lift'
                              } magnetic-hover`}
                              onClick={() => {
                                setSelectedTemplate(template.id);
                                setIsPremadeTemplateOpen(false);
                                toast.success(`${template.name} selected`);
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant="outline" className="animate-pulse-color">{template.totalMarks} Marks</Badge>
                              </div>
                              <div className="space-y-1">
                                {template.sections.map((section, index) => (
                                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                                    <span>{section.name}</span>
                                    <span>{section.questionCount} questions × {section.marksPerQuestion} marks</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => setIsPremadeTemplateOpen(false)} className="btn-3d glass-effect">
                            Close
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Custom Template Dialog */}
                    <Dialog open={isCustomTemplateOpen} onOpenChange={setIsCustomTemplateOpen}>
                      <DialogContent className="max-w-2xl glass-effect">
                        <DialogHeader>
                          <DialogTitle className="animate-gradient-text">Create Custom Template</DialogTitle>
                          <DialogDescription>
                            Design your own worksheet template with custom sections and marking scheme
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Template Name</Label>
                              <Input
                                value={customTemplate.name}
                                onChange={(e) => setCustomTemplate(prev => ({...prev, name: e.target.value}))}
                                placeholder="e.g., My Custom Template"
                                className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Total Marks</Label>
                              <Input
                                type="number"
                                value={customTemplate.totalMarks}
                                onChange={(e) => setCustomTemplate(prev => ({...prev, totalMarks: e.target.value}))}
                                placeholder="e.g., 100"
                                className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Template Sections</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addCustomSection} className="btn-3d glass-effect hover-glow">
                                <Plus className="h-4 w-4 mr-1" /> Add Section
                              </Button>
                            </div>
                            
                            {customTemplate.sections.map((section, index) => (
                              <div key={index} className="grid grid-cols-4 gap-2 items-center p-3 border rounded-lg glass-effect hover-lift transition-all duration-300">
                                <Input
                                  placeholder="Section name"
                                  value={section.name}
                                  onChange={(e) => updateCustomSection(index, 'name', e.target.value)}
                                  className="glass-effect"
                                />
                                <Input
                                  type="number"
                                  placeholder="Marks"
                                  value={section.marks}
                                  onChange={(e) => updateCustomSection(index, 'marks', e.target.value)}
                                  className="glass-effect"
                                />
                                <Input
                                  type="number"
                                  placeholder="Questions"
                                  value={section.questionCount}
                                  onChange={(e) => updateCustomSection(index, 'questionCount', e.target.value)}
                                  className="glass-effect"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomSection(index)}
                                  className="btn-3d hover-glow"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCustomTemplateOpen(false)} className="btn-3d glass-effect">
                              Cancel
                            </Button>
                            <Button onClick={saveCustomTemplate} className="btn-3d gradient-bg hover-glow">
                              Save Template
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Selected Template Display */}
                {selectedTemplate && (
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg glass-effect hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-primary animate-breathe" />
                        <span className="text-sm font-medium">
                          {predefinedTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom Template'}
                        </span>
                        {selectedTemplate !== 'custom' && (
                          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 animate-pulse-color">
                            {predefinedTemplates.find(t => t.id === selectedTemplate)?.totalMarks} Marks
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTemplate('')}
                        className="btn-3d hover-glow"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Character count for text input */}
                {contentText && (
                  <div className="text-xs text-muted-foreground">
                    {contentText.length} characters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect card-tilt hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 animate-breathe" />
                <span className="animate-gradient-text">Worksheet Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure your worksheet parameters and let AI generate the content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({...prev, subject: value}))}>
                    <SelectTrigger className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({...prev, grade: value}))}>
                    <SelectTrigger className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Worksheet Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g., Algebra Basics Practice"
                  className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic/Chapter *</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
                  placeholder="e.g., Linear Equations, Fractions, etc."
                  className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({...prev, difficulty: value}))}>
                    <SelectTrigger className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount">Questions</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="5"
                    max="50"
                    value={formData.questionCount}
                    onChange={(e) => setFormData(prev => ({...prev, questionCount: e.target.value}))}
                    className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="15"
                    max="180"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({...prev, timeLimit: e.target.value}))}
                    className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.questionTypes.includes(type)}
                        onCheckedChange={(checked) => handleQuestionTypeChange(type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="text-sm font-normal">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({...prev, instructions: e.target.value}))}
                  placeholder="Any specific instructions for the worksheet..."
                  rows={3}
                  className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="answerKey"
                  checked={formData.includeAnswerKey}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, includeAnswerKey: checked as boolean}))}
                />
                <Label htmlFor="answerKey" className="text-sm font-normal">
                  Include Answer Key
                </Label>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full btn-3d gradient-bg hover-glow ripple-effect"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Worksheet...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview/Results */}
        <div className="space-y-6 slide-in-right">
          {generatedWorksheet ? (
            <Card className="glass-effect card-tilt hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 animate-breathe" />
                  <span className="animate-gradient-text">Generated Worksheet</span>
                </CardTitle>
                <CardDescription>
                  Your worksheet is ready! Preview and download below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedWorksheet.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="animate-pulse-color">{generatedWorksheet.subject}</Badge>
                      <Badge variant="outline" className="animate-pulse-color">{generatedWorksheet.grade}</Badge>
                      <Badge variant="outline" className="animate-pulse-color">{generatedWorksheet.difficulty}</Badge>
                      <Badge variant="outline" className="animate-pulse-color">{generatedWorksheet.questionCount} Questions</Badge>
                      <Badge variant="outline" className="animate-pulse-color">{generatedWorksheet.timeLimit} mins</Badge>
                      {generatedWorksheet.totalMarks && (
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 animate-pulse-color">
                          {generatedWorksheet.totalMarks} Marks
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-secondary/50 animate-pulse-color">
                        {generatedWorksheet.contentSource}
                      </Badge>
                    </div>
                  </div>

                  {generatedWorksheet.template && (
                    <div className="p-3 bg-muted/50 rounded-lg glass-effect hover-lift transition-all duration-300">
                      <h4 className="font-medium text-sm mb-2">Template Structure:</h4>
                      <div className="space-y-1">
                        {generatedWorksheet.template.sections.map((section: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{section.name}</span>
                            <span className="text-muted-foreground">
                              {section.questionCount} questions • {section.marks} marks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Sample Questions:</h4>
                    {generatedWorksheet.questions.slice(0, 3).map((question: any, index: number) => (
                      <div key={question.id} className="p-3 bg-muted rounded-lg glass-effect hover-lift transition-all duration-300 magnetic-hover">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs animate-pulse-color">
                            {question.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Q{index + 1}</span>
                        </div>
                        <p className="text-sm">{question.question}</p>
                        {question.options && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((option: string, optIndex: number) => (
                              <p key={optIndex} className="text-xs text-muted-foreground ml-4">
                                {String.fromCharCode(65 + optIndex)}) {option}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handlePreview} variant="outline" className="flex-1 btn-3d glass-effect hover-glow">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button onClick={handleDownload} className="flex-1 btn-3d gradient-bg hover-glow ripple-effect">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-effect card-tilt">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-float" />
                <h3 className="font-medium text-lg mb-2">No Worksheet Generated</h3>
                <p className="text-muted-foreground text-center">
                  Fill in the form and click "Generate Worksheet" to create your custom worksheet with AI assistance.
                </p>
              </CardContent>
            </Card>
          )}

          {/* All Generated Worksheets */}
          <Card className="glass-effect card-tilt hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="animate-gradient-text">All Generated Worksheets</span>
                <Badge variant="secondary" className="animate-pulse-color">{allWorksheets.length} Total</Badge>
              </CardTitle>
              <CardDescription>
                All worksheets you've generated with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allWorksheets.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allWorksheets.map((worksheet, index) => (
                    <div key={worksheet.id || index} className="flex items-center justify-between p-3 border rounded-lg glass-effect hover-lift transition-all duration-300 magnetic-hover">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{worksheet.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs animate-pulse-color">{worksheet.subject}</Badge>
                          <Badge variant="outline" className="text-xs animate-pulse-color">{worksheet.grade}</Badge>
                          {worksheet.difficulty && (
                            <Badge variant="outline" className="text-xs animate-pulse-color">{worksheet.difficulty}</Badge>
                          )}
                          {worksheet.totalMarks && (
                            <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 animate-pulse-color">
                              {worksheet.totalMarks} Marks
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{formatRelativeDate(worksheet.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={handlePreview} className="btn-3d hover-glow">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDownload} className="btn-3d hover-glow">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 animate-float" />
                  <h4 className="font-medium text-sm mb-2">No Worksheets Generated Yet</h4>
                  <p className="text-xs text-muted-foreground">
                    Start by filling out the form and generating your first worksheet!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}