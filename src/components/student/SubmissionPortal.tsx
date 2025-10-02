import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Upload, FileText, CircleCheck as CheckCircle, Clock, Send, X, Download, Eye } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  description: string;
  feedback?: string;
  teacherName: string;
}

export function SubmissionPortal() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'Algebra Practice Worksheet',
      subject: 'Mathematics',
      dueDate: 'Tomorrow, 5:00 PM',
      status: 'pending',
      description: 'Complete exercises 1-20 on linear equations. Show all work.',
      teacherName: 'Dr. Sarah Wilson'
    },
    {
      id: 2,
      title: 'Geometry Quiz',
      subject: 'Mathematics',
      dueDate: '2 days ago',
      status: 'graded',
      score: 85,
      description: 'Quiz on triangles and quadrilaterals',
      teacherName: 'Dr. Sarah Wilson',
      feedback: 'Great work! Minor mistakes in question 3 and 7. Review the properties of isosceles triangles.'
    },
    {
      id: 3,
      title: 'Fractions Assessment',
      subject: 'Mathematics',
      dueDate: '1 week ago',
      status: 'graded',
      score: 92,
      description: 'Assessment on adding and subtracting fractions',
      teacherName: 'Dr. Sarah Wilson',
      feedback: 'Excellent understanding of the concepts! Keep up the good work.'
    },
    {
      id: 4,
      title: 'Chemical Reactions Lab Report',
      subject: 'Science',
      dueDate: '3 days',
      status: 'submitted',
      description: 'Write a detailed lab report on the chemical reactions experiment',
      teacherName: 'Mr. John Davis'
    }
  ];

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    setUploadedFile(file);
    toast.success('File attached successfully');
  };

  const handleSubmit = () => {
    if (!uploadedFile && !submissionText.trim()) {
      toast.error('Please upload a file or enter your submission');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Assignment submitted successfully!');
      setIsSubmitting(false);
      setShowDialog(false);
      setUploadedFile(null);
      setSubmissionText('');
      setSelectedAssignment(null);
    }, 1500);
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.status === 'graded');

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl glass-effect border-2 border-primary/20 shadow-xl">
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground mt-1">
          View, submit, and track your assignments
        </p>
      </div>

      {pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Assignments ({pendingAssignments.length})</h2>
          <div className="grid gap-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="glass-effect border-2 border-orange-500/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.subject} • {assignment.teacherName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                      Due: {assignment.dueDate}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{assignment.description}</p>
                  <Dialog open={showDialog && selectedAssignment?.id === assignment.id} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedAssignment(assignment)}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Submit: {assignment.title}</DialogTitle>
                        <DialogDescription>
                          Upload your completed assignment or paste your work below
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                          {uploadedFile ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="font-medium">{uploadedFile.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center space-y-3">
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                              <div>
                                <p className="font-medium mb-1">Upload your assignment</p>
                                <p className="text-sm text-muted-foreground mb-3">
                                  PDF, Word, or text files
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choose File
                                </Button>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Or write your answer here</label>
                          <Textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={6}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDialog(false);
                              setUploadedFile(null);
                              setSubmissionText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {submittedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Submitted - Awaiting Grading ({submittedAssignments.length})</h2>
          <div className="grid gap-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="glass-effect border-2 border-blue-500/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.subject} • {assignment.teacherName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                      Submitted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{assignment.description}</p>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Submission
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {gradedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Graded Assignments ({gradedAssignments.length})</h2>
          <div className="grid gap-4">
            {gradedAssignments.map((assignment) => (
              <Card key={assignment.id} className="glass-effect border-2 border-green-500/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.subject} • {assignment.teacherName}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-500">
                        Score: {assignment.score}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{assignment.description}</p>
                  {assignment.feedback && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Teacher's Feedback:</p>
                      <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
