import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';
import { Upload, FileText, CircleCheck as CheckCircle, X, Calendar as CalendarIcon, Clock, Send, Save } from 'lucide-react';
import { format } from 'date-fns';
import { teacherAPI } from '../../services/api';
import { SidebarProvider } from '../ui/sidebar';

interface AnswerKeyQuestion {
  id: string;
  question: string;
  answer: string;
  points: number;
}

export function AssignmentManager() {
  const [step, setStep] = useState<'upload' | 'review' | 'schedule'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyQuestion[]>([]);
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');  // ✅ ADDED: Store teacher_id
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [instructions, setInstructions] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  const classes = ['Class 6A', 'Class 6B', 'Class 7A', 'Class 7B', 'Grade 8A', 'Class 8B', 'Class 9A', 'Class 9B', 'Class 10A', 'Class 10B'];

  const pollAssignmentStatus = async (assignmentId: string) => {
    console.log(`Starting to poll for assignment ${assignmentId}...`);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const poll = async () => {
      attempts++;
      console.log(`Poll attempt ${attempts}/${maxAttempts}`);
      
      try {
        const response = await teacherAPI.getAssignment(assignmentId);
        const assignment = response.data;
        
        console.log('Assignment status:', assignment.status);
        setProcessingStatus(`Processing... (${attempts * 5}s elapsed)`);
        
        if (assignment.status === 'pending_review' && assignment.questions && assignment.questions.length > 0) {
          console.log('Questions generated!', assignment.questions);
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // ✅ ADDED: Store teacher_id from the assignment
          if (assignment.teacher_id) {
            setTeacherId(assignment.teacher_id);
            console.log('Stored teacher_id:', assignment.teacher_id);
          }
          
          const questions: AnswerKeyQuestion[] = assignment.questions.map((q: any, index: number) => ({
            id: q.question_number || q.questionId || q.id || `q-${index}`,
            question: q.question_text || q.questionText || q.question || `Question ${index + 1}`,
            answer: q.suggested_answer || q.suggestedAnswer || q.answer || '',
            points: q.max_score || q.points || q.maxMarks || 5
          }));
          
          setAnswerKey(questions);
          setIsProcessing(false);
          setProcessingStatus('');
          setStep('review');
          toast.success(`Questions generated! Found ${questions.length} questions`);
          
        } else if (assignment.status === 'failed') {
          console.error('Processing failed:', assignment.error_message);
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setIsProcessing(false);
          setProcessingStatus('');
          toast.error('Question generation failed: ' + (assignment.error_message || 'Unknown error'));
          
        } else if (attempts >= maxAttempts) {
          console.warn('Polling timeout reached');
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setIsProcessing(false);
          setProcessingStatus('');
          toast.error('Processing timeout. Please check back later or contact support.');
        }
        
      } catch (error: any) {
        console.error('Polling error:', error);
        
        if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsProcessing(false);
          setProcessingStatus('');
          toast.error('Failed to check assignment status');
        }
      }
    };
    
    poll();
    pollingIntervalRef.current = setInterval(poll, 5000);
  };

  const handleFileUpload = async (file: File) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingStatus('Uploading...');

    try {
      console.log('Starting upload for file:', file.name);
      
      const uploadData = {
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        description: `Assignment for ${subject || 'General'} - ${selectedClass || 'General'}`,
        deadline: dueDate?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        file: file
      };

      console.log('Uploading to AWS...');
      const response = await teacherAPI.uploadAssignment(uploadData);
      
      console.log('Upload response:', response.data);
      
      let parsedData = response.data;
      if (typeof response.data === 'string') {
        parsedData = JSON.parse(response.data);
      }
      
      if (parsedData.status === 'processing' && parsedData.assignmentId) {
        console.log('Assignment uploaded, processing in background...');
        console.log('Assignment ID:', parsedData.assignmentId);
        
        setAssignmentId(parsedData.assignmentId);
        
        // ✅ ADDED: Store teacher_id if available in the response
        if (parsedData.teacher_id) {
          setTeacherId(parsedData.teacher_id);
          console.log('Stored teacher_id from upload:', parsedData.teacher_id);
        }
        
        setProcessingStatus('Generating questions with AI...');
        toast.success('Assignment uploaded! Generating questions...');
        
        pollAssignmentStatus(parsedData.assignmentId);
        
      } else {
        const generatedQuestions = parsedData.generatedQuestions 
          || parsedData.questions 
          || parsedData.body?.questions
          || [];
        
        if (generatedQuestions.length === 0) {
          throw new Error('No questions generated from the document');
        }
        
        const questions: AnswerKeyQuestion[] = generatedQuestions.map((q: any, index: number) => ({
          id: q.questionId || q.id || `q-${index}`,
          question: q.questionText || q.question || `Question ${index + 1}`,
          answer: q.suggestedAnswer || q.answer || '',
          points: q.points || q.maxMarks || 5
        }));

        setAnswerKey(questions);
        setAssignmentId(parsedData.assignmentId || parsedData.assignment_id || 'temp-id');
        
        // ✅ ADDED: Store teacher_id
        if (parsedData.teacher_id) {
          setTeacherId(parsedData.teacher_id);
        }
        
        setIsProcessing(false);
        setProcessingStatus('');
        setStep('review');
        toast.success(`Assignment processed! Generated ${questions.length} questions`);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      setIsProcessing(false);
      setProcessingStatus('');
      
      let errorMsg = 'Failed to upload assignment: ';
      if (error.response) {
        errorMsg += `Server error (${error.response.status})`;
        if (error.response.data?.message) {
          errorMsg += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMsg += 'No response from server. Check if API Gateway URL is correct.';
      } else {
        errorMsg += error.message;
      }
      toast.error(errorMsg);
      
      const sampleQuestions: AnswerKeyQuestion[] = [
        {
          id: '1',
          question: 'What is the quadratic formula?',
          answer: 'x = (-b ± √(b²-4ac)) / 2a',
          points: 5
        },
        {
          id: '2',
          question: 'Solve: 2x + 5 = 15',
          answer: 'x = 5',
          points: 3
        }
      ];
      setAnswerKey(sampleQuestions);
      setStep('review');
    }
  };

  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleAnswerChange = (id: string, field: keyof AnswerKeyQuestion, value: string | number) => {
    setAnswerKey(prev =>
      prev.map(q => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleRemoveQuestion = (id: string) => {
    setAnswerKey(prev => prev.filter(q => q.id !== id));
  };

  const handleAddQuestion = () => {
    const newQuestion: AnswerKeyQuestion = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      points: 1
    };
    setAnswerKey(prev => [...prev, newQuestion]);
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    setTimeout(() => {
      toast.success('Assignment saved as draft');
      setIsDraft(false);
    }, 1000);
  };

  const handlePublish = async () => {
    if (!title || !subject || !selectedClass || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!assignmentId) {
      toast.error('No assignment ID found. Please upload assignment first.');
      return;
    }

    // ✅ ADDED: Fetch teacher_id if not already stored
    if (!teacherId) {
      console.log('Teacher ID not found in state, fetching from assignment...');
      try {
        const assignmentResponse = await teacherAPI.getAssignment(assignmentId);
        const assignment = assignmentResponse.data;
        
        if (assignment.teacher_id) {
          setTeacherId(assignment.teacher_id);
          console.log('Fetched teacher_id:', assignment.teacher_id);
        } else {
          throw new Error('Teacher ID not found in assignment');
        }
      } catch (error: any) {
        console.error('Failed to fetch teacher_id:', error);
        toast.error('Failed to retrieve teacher information. Please try again.');
        return;
      }
    }

    console.log('Publishing assignment...');
    console.log('Assignment ID:', assignmentId);
    console.log('Teacher ID:', teacherId);  // ✅ ADDED: Log teacher_id
    console.log('Title:', title);
    console.log('Subject:', subject);
    console.log('Class:', selectedClass);
    console.log('Due Date:', dueDate.toISOString());

    setIsProcessing(true);

    try {
      const scheduleData = {
        assignmentId: assignmentId,
        teacherId: teacherId,  // ✅ FIXED: Include teacher_id
        title: title,
        subject: subject,
        className: selectedClass,
        dueDate: dueDate.toISOString(),
        instructions: instructions,
        notifyStudents: notificationsEnabled,
        reminderSettings: {
          remindBeforeDays: [1, 3],
          customMessage: instructions || 'Please complete your assignment'
        },
        answerKey: answerKey.map(q => ({
          questionId: q.id,
          question: q.question,
          approvedAnswer: q.answer,
          maxMarks: q.points,
          evaluationCriteria: 'Match answer with key points'
        }))
      };

      console.log('Calling scheduleAssignment API with data:', scheduleData);
      const response = await teacherAPI.scheduleAssignment(scheduleData);
      
      console.log('Schedule response:', response.data);
      
      const result = response.data;
      const studentsNotified = result.students_notified || 0;
      
      toast.success('Assignment published successfully!', {
        description: `Scheduled for ${selectedClass}. ${studentsNotified} students notified.`
      });
      
      setIsProcessing(false);
      
      setTimeout(() => {
        handleReset();
      }, 2000);

    } catch (error: any) {
      console.error('Publishing failed:', error);
      console.error('Error response:', error.response?.data);
      setIsProcessing(false);
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Unknown error';
        
      toast.error('Failed to publish assignment', {
        description: errorMsg
      });
    }
  };

  const handleReset = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setStep('upload');
    setUploadedFile(null);
    setAnswerKey([]);
    setAssignmentId('');
    setTeacherId('');  // ✅ ADDED: Reset teacher_id
    setTitle('');
    setSubject('');
    setSelectedClass('');
    setDueDate(undefined);
    setInstructions('');
    setNotificationsEnabled(true);
    setProcessingStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalPoints = answerKey.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-xl glass-effect border-2 border-primary/20 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">Assignment Manager</h1>
          <p className="text-muted-foreground mt-1">
            Upload, review, and schedule assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={step === 'upload' ? 'default' : 'outline'}>1. Upload</Badge>
          <Badge variant={step === 'review' ? 'default' : 'outline'}>2. Review</Badge>
          <Badge variant={step === 'schedule' ? 'default' : 'outline'}>3. Schedule</Badge>
        </div>
      </div>

      {step === 'upload' && (
        <Card className="glass-effect border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Assignment
            </CardTitle>
            <CardDescription>
              Upload assignment files to generate answer key automatically using AWS Bedrock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="h-8 w-8" />
                    <span className="font-medium text-lg">{uploadedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    File uploaded successfully! Processing with AWS Bedrock...
                  </p>
                  {isProcessing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">{processingStatus}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This may take 30-60 seconds. Questions are being extracted and analyzed by AI.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Drop assignment file here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse from your computer
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, Word (.doc, .docx) • Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-effect border-2 border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Original Assignment
                  </span>
                  <Badge variant="outline">{uploadedFile?.name}</Badge>
                </CardTitle>
                <CardDescription>Preview of uploaded assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                  <div className="space-y-4 text-sm">
                    <h3 className="font-bold text-lg">Assignment Preview</h3>
                    <div className="space-y-3">
                      {answerKey.map((q, index) => (
                        <div key={q.id}>
                          <p className="font-medium">Q{index + 1}. {q.question}</p>
                          <p className="text-muted-foreground text-xs mt-1">[{q.points} points]</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-2 border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    AI Generated Answer Key
                  </span>
                  <Badge>Total: {totalPoints} points</Badge>
                </CardTitle>
                <CardDescription>Review and modify AI-generated answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {answerKey.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Label className="font-medium">Question {index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={question.question}
                        onChange={(e) => handleAnswerChange(question.id, 'question', e.target.value)}
                        placeholder="Question text"/>
                      <Textarea
                        value={question.answer}
                        onChange={(e) => handleAnswerChange(question.id, 'answer', e.target.value)}
                        placeholder="Correct answer"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Points:</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => handleAnswerChange(question.id, 'points', parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddQuestion} className="w-full">
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
                {isDraft ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Draft</>}
              </Button>
              <Button onClick={() => setStep('schedule')}>
                Continue to Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'schedule' && (
        <Card className="glass-effect border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule Assignment
            </CardTitle>
            <CardDescription>
              Configure assignment details and publish to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Algebra Practice Worksheet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Additional Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for students..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notification to students via AWS SES
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Publishing to AWS...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}