// src/components/student/StudentDoubts.tsx - CENTERED LAYOUT WITH INFO
import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageCircle, Send, Bot, Flag, CheckCircle, Loader2, User, RefreshCw, Info, Zap, Languages, Database } from 'lucide-react';
import { studentAPI } from '../../services/api';
import { toast } from 'sonner';
import { AuthContext } from '../../App';

interface DoubtHistory {
  doubtId: string;
  question: string;
  aiAnswer: string;
  teacherResponse?: string;
  status: string;
  subject: string;
  language: string;
  timestamp: string;
  resolvedAt?: string;
  flaggedAt?: string;
}

export function StudentDoubts() {
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [doubtHistory, setDoubtHistory] = useState<DoubtHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('ask');
  const [showInfo, setShowInfo] = useState(true);

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  ];

  const loadDoubtHistory = async () => {
    if (!user?.id) return;
    
    setLoadingHistory(true);
    try {
      const response = await studentAPI.getStudentDoubts(user.id);
      setDoubtHistory(response.doubts || []);
      
      const flaggedIds = new Set<string>(
        (response.doubts || [])
          .filter((d: DoubtHistory) => d.status === 'flagged' || d.status === 'resolved')
          .map((d: DoubtHistory) => d.doubtId)
      );
      setMarkedForReview(flaggedIds);
      
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadDoubtHistory();
    }
  }, [activeTab, user?.id]);

  const formatAnswer = (text: string): React.ReactNode => {
    if (!text) return null;

    let cleaned = text
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/[_~`]/g, '')
      .replace(/#{1,6}\s/g, '')
      .trim();

    const sections = cleaned.split(/\n\n+/);

    return sections.map((section, idx) => {
      section = section.trim();
      if (!section) return null;

      if (/^\d+[\.\)]\s/.test(section)) {
        const lines = section.split('\n').filter(l => l.trim());
        return (
          <div key={idx} className="my-4 space-y-3">
            {lines.map((line, i) => {
              const match = line.match(/^(\d+[\.\)])\s*(.+)$/);
              if (match) {
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="font-bold text-primary flex-shrink-0 min-w-[28px] text-base">
                      {match[1]}
                    </span>
                    <span className="flex-1 text-base leading-relaxed">{match[2]}</span>
                  </div>
                );
              }
              return <div key={i} className="ml-10 text-sm leading-relaxed">{line}</div>;
            })}
          </div>
        );
      }

      if (/^[-•]\s/.test(section)) {
        const lines = section.split('\n').filter(l => l.trim());
        return (
          <ul key={idx} className="my-4 space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-primary text-lg mt-1">•</span>
                <span className="flex-1 text-base leading-relaxed">
                  {line.replace(/^[-•]\s*/, '')}
                </span>
              </li>
            ))}
          </ul>
        );
      }

      const isHeading = 
        section.length < 100 && 
        !section.endsWith('.') && 
        !section.endsWith('?') &&
        !section.endsWith('!') &&
        (
          /^[A-Z][^.?!]*$/.test(section) ||
          section.match(/^(Solution|Answer|Step|Example|Note|Important|Formula|Method|Explanation|Definition)/i) ||
          section.includes('उत्तर') || section.includes('हल') || section.includes('सूत्र') ||
          section.includes('என்றால் என்ன') || section.includes('குறிப்பு')
        );

      if (isHeading) {
        return (
          <h3 key={idx} className="font-bold text-lg mt-6 mb-3 text-primary border-b pb-2">
            {section}
          </h3>
        );
      }

      if (/[=+\-×÷]/.test(section) && section.length < 200) {
        return (
          <div key={idx} className="my-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <code className="text-base font-mono">{section}</code>
          </div>
        );
      }

      return (
        <p key={idx} className="my-4 text-base leading-relaxed text-gray-800">
          {section}
        </p>
      );
    }).filter(Boolean);
  };

  const translateQuestion = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') return text;
    
    const translationInstructions = {
      hi: 'कृपया हिंदी में उत्तर दें: ',
      ta: 'தயவுசெய்து தமிழில் பதிலளிக்கவும்: ',
      mr: 'कृपया मराठीत उत्तर द्या: '
    };
    
    return (translationInstructions[targetLang as keyof typeof translationInstructions] || '') + text;
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !user?.id) return;
    
    setIsSubmitting(true);
    setAiResponse(null);
    try {
      const questionToSend = await translateQuestion(question, responseLanguage);
      
      const payload = {
        studentId: user.id,
        subject: subject || 'general',
        question: questionToSend,
        language: responseLanguage,
      };
      
      const response = await studentAPI.askDoubt(payload);
      
      setAiResponse({
        doubtId: response.doubtId,
        answer: response.answer,
        language: response.language || responseLanguage,
        subject: response.subject,
      });
      
      const successMessages = {
        en: 'Answer received!',
        hi: 'उत्तर प्राप्त हुआ!',
        ta: 'பதில் கிடைத்தது!',
        mr: 'उत्तर मिळाले!'
      };
      
      toast.success(successMessages[responseLanguage as keyof typeof successMessages] || successMessages.en);
    } catch (error: any) {
      console.error('Doubt submission error:', error);
      
      const errorMessages = {
        en: 'Failed to get answer. Please try again.',
        hi: 'उत्तर प्राप्त करने में विफल। कृपया पुनः प्रयास करें।',
        ta: 'பதில் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
        mr: 'उत्तर मिळवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'
      };
      
      toast.error(errorMessages[responseLanguage as keyof typeof errorMessages] || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkForReview = async (doubtId: string) => {
    if (!user?.id) return;
    try {
      await studentAPI.flagDoubt({
        doubtId,
        studentId: user.id,
        reason: 'Unclear answer - requesting teacher review',
      });
      setMarkedForReview(prev => new Set([...prev, doubtId]));
      
      toast.success('Marked for teacher review!');
    } catch (error: any) {
      toast.error('Failed to flag. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const placeholders = {
    subject: {
      en: 'e.g., Mathematics, Science, Social Studies',
      hi: 'जैसे, गणित, विज्ञान, सामाजिक विज्ञान',
      ta: 'உதா., கணிதம், அறிவியல், சமூக அறிவியல்',
      mr: 'उदा., गणित, विज्ञान, सामाजिक शास्त्र'
    },
    question: {
      en: 'Type your question here... (Ctrl+Enter to submit)',
      hi: 'अपना प्रश्न यहाँ लिखें... (Ctrl+Enter भेजने के लिए)',
      ta: 'உங்கள் கேள்வியை இங்கே எழுதுங்கள்... (Ctrl+Enter அனுப்ப)',
      mr: 'तुमचा प्रश्न येथे लिहा... (Ctrl+Enter पाठवण्यासाठी)'
    },
    button: {
      en: 'Ask Question',
      hi: 'प्रश्न पूछें',
      ta: 'கேள்வி கேளுங்கள்',
      mr: 'प्रश्न विचारा'
    },
    thinking: {
      en: 'Thinking...',
      hi: 'सोच रहा हूँ...',
      ta: 'யோசித்து கொண்டிருக்கிறேன்...',
      mr: 'विचार करत आहे...'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Ask a Question</h1>
          <p className="text-muted-foreground mt-1">
            Get instant help from our AI tutor in your preferred language
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-4 w-4 mr-1" />
          {showInfo ? 'Hide' : 'Show'} Info
        </Button>
      </div>

      {showInfo && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-black shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Zap className="h-5 w-5" />
              AI-Powered Doubt Solver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Database className="h-4 w-4" />
                  Knowledge Base
                </div>
                <p className="text-sm text-gray-700">
                  Powered by <strong>AWS Bedrock KB</strong> with NCERT Class 7 content (Science, Social Science, English) stored in S3 + OpenSearch vector DB
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Bot className="h-4 w-4" />
                  AI Model
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Amazon Nova Pro</strong> for Math queries and answer enhancement. Hybrid approach ensures accurate, curriculum-aligned responses
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Languages className="h-4 w-4" />
                  Multilingual
                </div>
                <p className="text-sm text-gray-700">
                  KB supports <strong>Hindi & English</strong>. Tamil & Marathi use <strong>langdetect + Amazon Translate</strong> (KB expansion in progress)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>How it works:</strong> Questions go to KB first → If answer needs enhancement, Nova Pro adds details → Not satisfied? Flag for teacher review (filtered by subject specialization)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ask">Ask Question</TabsTrigger>
            <TabsTrigger value="history">My Doubts History</TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Ask Your Doubt
                </CardTitle>
                <CardDescription>
                  Type your question and get an AI-powered explanation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder={placeholders.subject[responseLanguage as keyof typeof placeholders.subject]}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Response Language</label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map(lang => (
                      <Button
                        key={lang.code}
                        variant={responseLanguage === lang.code ? "default" : "outline"}
                        size="sm"
                        onClick={() => setResponseLanguage(lang.code)}
                      >
                        {lang.flag} {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">
                    Your Question
                  </label>
                  <Textarea
                    id="question"
                    placeholder={placeholders.question[responseLanguage as keyof typeof placeholders.question]}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleAskQuestion} 
                  disabled={isSubmitting || !question.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {placeholders.thinking[responseLanguage as keyof typeof placeholders.thinking]}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {placeholders.button[responseLanguage as keyof typeof placeholders.button]}
                    </>
                  )}
                </Button>

                {aiResponse && (
                  <Card className="mt-6 border-2 border-primary/20 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <Bot className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-4">
                            <h4 className="font-semibold text-lg">AI Tutor Response</h4>
                            {aiResponse.subject && (
                              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                {aiResponse.subject}
                              </span>
                            )}
                          </div>
                          
                          <div className="prose prose-base max-w-none bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-xl border border-blue-100">
                            {formatAnswer(aiResponse.answer)}
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            {!markedForReview.has(aiResponse.doubtId) ? (
                              <Button
                                variant="outline"
                                size="default"
                                onClick={() => handleMarkForReview(aiResponse.doubtId)}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                Didn't understand? Ask teacher
                              </Button>
                            ) : (
                              <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                <span className="font-medium">Sent to teacher - You'll get a response soon</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Doubts History</CardTitle>
                    <CardDescription>View all your past questions and teacher responses</CardDescription>
                  </div>
                  <Button 
                    onClick={loadDoubtHistory} 
                    variant="outline" 
                    size="sm"
                    disabled={loadingHistory}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loadingHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : doubtHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No doubts yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ask your first question to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doubtHistory.map((doubt) => (
                      <Card key={doubt.doubtId} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Your Question</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(doubt.timestamp).toLocaleDateString()}
                                </span>
                                {doubt.subject && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-auto">
                                    {doubt.subject}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm pl-6">{doubt.question}</p>
                            </div>

                            {doubt.aiAnswer && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bot className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">AI Assistant</span>
                                </div>
                                <div className="prose prose-sm max-w-none pl-6">
                                  {formatAnswer(doubt.aiAnswer)}
                                </div>
                              </div>
                            )}

                            {doubt.teacherResponse && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-600">Teacher Response</span>
                                  {doubt.resolvedAt && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {new Date(doubt.resolvedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="pl-6">
                                  <p className="text-sm whitespace-pre-wrap">{doubt.teacherResponse}</p>
                                </div>
                              </div>
                            )}

                            {doubt.status === 'flagged' && !doubt.teacherResponse && (
                              <div className="flex items-center gap-2 text-amber-600 text-sm">
                                <Flag className="h-4 w-4" />
                                <span>Waiting for teacher review...</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}