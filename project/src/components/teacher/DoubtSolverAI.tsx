import React, { useState } from 'react';
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
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export function DoubtSolverAI() {
  const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
  const [newResponse, setNewResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const doubts = [
    {
      id: 1,
      student: 'Sarah Johnson',
      avatar: '',
      subject: 'Mathematics',
      topic: 'Algebra',
      question: 'I don\'t understand how to solve linear equations with two variables. Can you explain step by step?',
      submittedAt: '2 hours ago',
      status: 'pending',
      priority: 'medium',
      responses: []
    },
    {
      id: 2,
      student: 'Michael Chen',
      avatar: '',
      subject: 'Mathematics',
      topic: 'Geometry',
      question: 'What is the difference between area and perimeter? I always get confused.',
      submittedAt: '5 hours ago',
      status: 'answered',
      priority: 'low',
      responses: [
        {
          id: 1,
          type: 'ai',
          content: 'Great question! Here\'s a simple way to remember:\n\n**Perimeter**: Distance AROUND a shape (like walking around a fence)\n**Area**: Space INSIDE a shape (like the grass inside the fence)\n\nExample with a rectangle:\n- Perimeter = Add all sides: 2 + 4 + 2 + 4 = 12 units\n- Area = Length × Width: 2 × 4 = 8 square units',
          timestamp: '4 hours ago',
          helpful: true
        },
        {
          id: 2,
          type: 'teacher',
          content: 'That\'s an excellent explanation from our AI! To add to that, try this memory trick: "Perimeter = going around the Parameter (boundary)", and "Area = the space you can Air out inside!"',
          timestamp: '3 hours ago'
        }
      ]
    },
    {
      id: 3,
      student: 'Emma Davis',
      avatar: '',
      subject: 'Mathematics',
      topic: 'Fractions',
      question: 'Why do we flip the second fraction when dividing fractions? It doesn\'t make sense to me.',
      submittedAt: '1 day ago',
      status: 'answered',
      priority: 'high',
      responses: [
        {
          id: 1,
          type: 'ai',
          content: 'Excellent question! Here\'s why we "flip and multiply":\n\n**Think of it as "How many groups?"**\n\nWhen you divide 6 ÷ 2, you\'re asking "How many groups of 2 fit into 6?" Answer: 3 groups.\n\nWith fractions: 1/2 ÷ 1/4 means "How many 1/4s fit into 1/2?"\n\n**Visual way**: Imagine a pizza cut in half (1/2). How many quarter-pieces (1/4) fit in that half? Answer: 2 pieces!\n\n**Math way**: 1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2\n\nWe flip because division by a fraction is the same as multiplication by its reciprocal!',
          timestamp: '23 hours ago',
          helpful: true
        }
      ]
    },
    {
      id: 4,
      student: 'Alex Rodriguez',
      avatar: '',
      subject: 'Mathematics',
      topic: 'Word Problems',
      question: 'I understand the math operations, but I can\'t figure out which operation to use in word problems. Help!',
      submittedAt: '2 days ago',
      status: 'in_progress',
      priority: 'medium',
      responses: [
        {
          id: 1,
          type: 'ai',
          content: 'Word problems can be tricky! Here are key words that signal different operations:\n\n**Addition**: add, plus, total, sum, altogether, increase\n**Subtraction**: minus, take away, difference, decrease, less than\n**Multiplication**: times, multiply, of, each, per, product\n**Division**: divide, share, split, per, how many groups\n\nExample: "Sarah has 24 stickers. She wants to share them equally among 6 friends. How many stickers will each friend get?"\n\nKey words: "share equally" = division\nSolution: 24 ÷ 6 = 4 stickers each',
          timestamp: '1 day ago',
          helpful: null
        }
      ]
    }
  ];

  const generateAIResponse = (question: string) => {
    // Simulate AI response generation
    const responses = [
      'Let me break this down step by step for you...',
      'Great question! Here\'s a simple way to understand this concept...',
      'I understand why this might be confusing. Let me explain it differently...',
      'This is a common question! Here\'s what you need to know...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + '\n\n[AI would provide detailed explanation here]';
  };

  const handleSendResponse = () => {
    if (!newResponse.trim() || !selectedDoubt) return;

    // Add teacher response
    const updatedDoubt = {
      ...selectedDoubt,
      responses: [
        ...selectedDoubt.responses,
        {
          id: selectedDoubt.responses.length + 1,
          type: 'teacher',
          content: newResponse,
          timestamp: 'Just now'
        }
      ],
      status: 'answered'
    };

    setSelectedDoubt(updatedDoubt);
    setNewResponse('');
    toast.success('Response sent successfully!');
  };

  const handleAIAssist = () => {
    if (!selectedDoubt) return;

    const aiResponse = generateAIResponse(selectedDoubt.question);
    setNewResponse(aiResponse);
    toast.success('AI suggestion added to your response!');
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesSearch = searchQuery === '' || 
      doubt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Doubt Solver AI</h1>
          <p className="text-muted-foreground mt-1">
            Help students resolve their questions with AI assistance
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        {/* Doubts List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Student Doubts</CardTitle>
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
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

              {/* Doubts List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredDoubts.map((doubt) => (
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
                              <AvatarImage src={doubt.avatar} alt={doubt.student} />
                              <AvatarFallback className="text-xs">
                                {doubt.student.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{doubt.student}</span>
                          </div>
                          {getStatusIcon(doubt.status)}
                        </div>
                        
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">{doubt.subject}</Badge>
                          <Badge variant="outline" className="text-xs">{doubt.topic}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {doubt.question}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{doubt.submittedAt}</span>
                          <Badge variant={getStatusBadge(doubt.status)} className="text-xs">
                            {doubt.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doubt Details and Chat */}
        <div className="lg:col-span-2">
          {selectedDoubt ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedDoubt.avatar} alt={selectedDoubt.student} />
                      <AvatarFallback>
                        {selectedDoubt.student.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedDoubt.student}</CardTitle>
                      <CardDescription>
                        {selectedDoubt.subject} • {selectedDoubt.topic} • {selectedDoubt.submittedAt}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(selectedDoubt.status)}>
                      {selectedDoubt.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{selectedDoubt.priority} priority</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Original Question */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">Student Question</span>
                  </div>
                  <p className="text-sm">{selectedDoubt.question}</p>
                </div>

                {/* Responses */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedDoubt.responses.map((response: any) => (
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
                            <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                            {response.type === 'ai' && response.helpful !== null && (
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsUp className={`h-3 w-3 ${response.helpful ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsDown className={`h-3 w-3 ${response.helpful === false ? 'text-red-500' : 'text-muted-foreground'}`} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Response Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Your Response:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAIAssist}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      AI Assist
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
                      disabled={!newResponse.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Response
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Doubt Selected</h3>
                <p className="text-muted-foreground text-center">
                  Select a student doubt from the list to start helping them with their question.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}