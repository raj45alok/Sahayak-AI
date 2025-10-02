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
import { Upload, FileText, CircleCheck as CheckCircle, X, Calendar as CalendarIcon, Clock, Send, Save, Eye } from 'lucide-react';
import { format } from 'date-fns';

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
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [instructions, setInstructions] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    setTimeout(() => {
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
        },
        {
          id: '3',
          question: 'What is the value of π (pi) to 2 decimal places?',
          answer: '3.14',
          points: 2
        },
        {
          id: '4',
          question: 'Calculate the area of a circle with radius 7cm',
          answer: '153.94 cm² or 49π cm²',
          points: 5
        }
      ];

      setAnswerKey(sampleQuestions);
      setIsProcessing(false);
      setStep('review');
      toast.success('Assignment processed! Review the generated answer key');
    }, 2000);
  };

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

  const handlePublish = () => {
    if (!title || !subject || !selectedClass || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      toast.success('Assignment published successfully!');
      setIsProcessing(false);
      handleReset();
    }, 1500);
  };

  const handleReset = () => {
    setStep('upload');
    setUploadedFile(null);
    setAnswerKey([]);
    setTitle('');
    setSubject('');
    setSelectedClass('');
    setDueDate(undefined);
    setInstructions('');
    setNotificationsEnabled(true);
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
              Upload assignment files to generate answer key automatically
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
                    File uploaded successfully! Processing assignment...
                  </p>
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Generating answer key...</span>
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
                    Supported formats: PDF, Word (.doc, .docx)
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
                    <h3 className="font-bold text-lg">Algebra Practice Worksheet</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Q1. What is the quadratic formula?</p>
                        <p className="text-muted-foreground text-xs mt-1">[5 points]</p>
                      </div>
                      <div>
                        <p className="font-medium">Q2. Solve: 2x + 5 = 15</p>
                        <p className="text-muted-foreground text-xs mt-1">[3 points]</p>
                      </div>
                      <div>
                        <p className="font-medium">Q3. What is the value of π (pi) to 2 decimal places?</p>
                        <p className="text-muted-foreground text-xs mt-1">[2 points]</p>
                      </div>
                      <div>
                        <p className="font-medium">Q4. Calculate the area of a circle with radius 7cm</p>
                        <p className="text-muted-foreground text-xs mt-1">[5 points]</p>
                      </div>
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
                    Generated Answer Key
                  </span>
                  <Badge>Total: {totalPoints} points</Badge>
                </CardTitle>
                <CardDescription>Review and modify answers as needed</CardDescription>
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
                        placeholder="Question text"
                      />
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
                  Send notification to students when assignment is published
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
                      Publishing...
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
