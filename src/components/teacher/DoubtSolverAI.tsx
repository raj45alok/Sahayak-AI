// src/components/teacher/DoubtSolverAI.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { AuthContext } from '../../App';

interface DoubtResponse {
  id: string | number;
  type: 'ai' | 'teacher';
  content: string;
  timestamp: string;
  helpful?: boolean | null;
}

interface Doubt {
  id: string;
  studentId: string;
  studentName?: string;
  avatar?: string;
  subject: string;
  topic: string;
  question: string;
  submittedAt: string;
  status: 'pending' | 'answered' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  responses: DoubtResponse[];
  language?: string;
}

export function DoubtSolverAI() {
  const { user } = useContext(AuthContext);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);

  const loadDoubts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await api.getFlaggedDoubts(user.id);
      
      const mappedDoubts: Doubt[] = (response.doubts || []).map((d: any) => ({
        id: d.doubtId,
        studentId: d.studentId,
        studentName: d.studentName || `Student ${d.studentId.slice(0, 6)}`,
        subject: d.subject || 'General',
        topic: d.topic || 'Question',
        question: d.question,
        language: d.language || 'en',
        submittedAt: d.flaggedAt 
          ? new Date(d.flaggedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Unknown',
        status: 'pending' as const,
        priority: (d.priority || 'medium') as 'low' | 'medium' | 'high',
        responses: d.aiAnswer 
          ? [{
              id: 'ai-1',
              type: 'ai' as const,
              content: d.aiAnswer,
              timestamp: 'AI responded',
              helpful: null
            }]
          : [],
      }));

      setDoubts(mappedDoubts);
      
      if (selectedDoubt) {
        const updatedSelected = mappedDoubts.find(d => d.id === selectedDoubt.id);
        if (updatedSelected) {
          setSelectedDoubt(updatedSelected);
        } else {
          setSelectedDoubt(mappedDoubts.length > 0 ? mappedDoubts[0] : null);
        }
      } else if (mappedDoubts.length > 0) {
        setSelectedDoubt(mappedDoubts[0]);
      }
      
      toast.success(`Loaded ${mappedDoubts.length} doubts`);
    } catch (error: any) {
      console.error('Failed to load doubts:', error);
      toast.error(error.message || 'Failed to load flagged doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoubts();
  }, [user?.id]);

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedDoubt || !user?.id) return;

    setSending(true);
    try {
      await api.resolveDoubt({
        doubtId: selectedDoubt.id,
        studentId: selectedDoubt.studentId,
        teacherId: user.id,
        teacherResponse: newResponse,
      });

      setDoubts(prev => prev.filter(d => d.id !== selectedDoubt.id));
      setSelectedDoubt(null);
      setNewResponse('');
      
      toast.success('Response sent! Doubt resolved and removed from queue.');
    } catch (error: any) {
      console.error('Resolve error:', error);
      toast.error(error.message || 'Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const handleAIAssist = async () => {
    if (!selectedDoubt) return;
    
    setAiAssisting(true);
    try {
      const suggestion = `I understand this concept can be tricky! Let me explain it in a simple way:\n\n[Your explanation here]\n\nRemember: ${selectedDoubt.question.split('?')[0]}? The key is to...`;
      setNewResponse(suggestion);
      toast.success('AI suggestion added to your response!');
    } catch (error) {
      toast.error('AI assist failed');
    } finally {
      setAiAssisting(false);
    }
  };

  const formatAnswer = (text: string): React.ReactNode => {
    if (!text) return null;

    let cleaned = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/[_~`]/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = cleaned.split(/\n\n+/);

    return paragraphs.map((paragraph, idx) => {
      paragraph = paragraph.trim();
      if (!paragraph) return null;

      if (/^\d+[\.\)]\s/.test(paragraph)) {
        const lines = paragraph.split('\n').filter(l => l.trim());
        return (
          <div key={idx} className="space-y-2 my-3">
            {lines.map((line, i) => {
              const match = line.match(/^(\d+[\.\)])\s*(.+)$/);
              if (match) {
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="font-semibold text-primary flex-shrink-0">
                      {match[1]}
                    </span>
                    <span className="flex-1">{match[2]}</span>
                  </div>
                );
              }
              return <div key={i} className="ml-6">{line}</div>;
            })}
          </div>
        );
      }

      if (/^[-•]\s/.test(paragraph)) {
        const lines = paragraph.split('\n').filter(l => l.trim());
        return (
          <ul key={idx} className="space-y-1 my-3 ml-4">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-primary">•</span>
                <span className="flex-1">{line.replace(/^[-•]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }

      const isHeading = 
        paragraph.length < 80 && 
        !paragraph.endsWith('.') && 
        !paragraph.endsWith('?');

      if (isHeading) {
        return (
          <h3 key={idx} className="font-semibold text-base mt-4 mb-2">
            {paragraph}
          </h3>
        );
      }

      return (
        <p key={idx} className="my-2 leading-relaxed text-sm">
          {paragraph}
        </p>
      );
    }).filter(Boolean);
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesSearch = searchQuery === '' || 
      doubt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doubt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'answered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'destructive',
      answered: 'default',
      in_progress: 'secondary'
    };
    return variants[status] || 'outline';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Doubt Solver AI</h1>
          <p className="text-muted-foreground mt-1">
            Help students resolve their questions with AI assistance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={loadDoubts} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
          <Badge variant="outline">
            {doubts.filter(d => d.status === 'pending').length} Pending
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Student Doubts</CardTitle>
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doubts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredDoubts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No doubts found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only doubts matching your subjects will appear
                    </p>
                  </div>
                ) : (
                  filteredDoubts.map((doubt) => (
                    <Card 
                      key={doubt.id} 
                      className={`cursor-pointer transition-all border-l-4 ${getPriorityColor(doubt.priority)} ${
                        selectedDoubt?.id === doubt.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedDoubt(doubt)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doubt.avatar} alt={doubt.studentName} />
                                <AvatarFallback className="text-xs">
                                  {doubt.studentName?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{doubt.studentName}</span>
                            </div>
                            {getStatusIcon(doubt.status)}
                          </div>
                          
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{doubt.subject}</Badge>
                            {doubt.language && doubt.language !== 'en' && (
                              <Badge variant="secondary" className="text-xs">
                                {doubt.language === 'hi' ? 'हिंदी' : 
                                 doubt.language === 'ta' ? 'தமிழ்' : 
                                 doubt.language === 'mr' ? 'मराठी' : doubt.language}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doubt.question}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{doubt.submittedAt}</span>
                            <Badge variant={getStatusBadge(doubt.status)} className="text-xs">
                              {doubt.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedDoubt ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedDoubt.avatar} alt={selectedDoubt.studentName} />
                      <AvatarFallback>
                        {selectedDoubt.studentName?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedDoubt.studentName}</CardTitle>
                      <CardDescription>
                        {selectedDoubt.subject} • {selectedDoubt.submittedAt}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(selectedDoubt.status)}>
                      {selectedDoubt.status}
                    </Badge>
                    <Badge variant="outline">{selectedDoubt.priority} priority</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">Student Question</span>
                  </div>
                  <p className="text-sm">{selectedDoubt.question}</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedDoubt.responses.map((response) => (
                    <div key={response.id} className={`flex gap-3 ${response.type === 'teacher' ? 'justify-end' : ''}`}>
                      <div className={`flex gap-3 max-w-[80%] ${response.type === 'teacher' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0">
                          {response.type === 'ai' ? (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>T</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className={`space-y-1 ${response.type === 'teacher' ? 'items-end' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            response.type === 'ai' 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-primary text-primary-foreground'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {response.type === 'ai' ? 'AI Assistant' : 'You'}
                              </span>
                              {response.type === 'ai' && (
                                <Sparkles className="h-3 w-3" />
                              )}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {response.type === 'ai' ? formatAnswer(response.content) : response.content}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Your Response:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAIAssist}
                      disabled={aiAssisting}
                      className="flex items-center gap-1"
                    >
                      {aiAssisting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Type your response to help the student..."
                    rows={4}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendResponse}
                      disabled={!newResponse.trim() || sending}
                      className="flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading doubts...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Doubt Selected</h3>
                <p className="text-muted-foreground text-center">
                  Select a student doubt from the list to start helping them.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}