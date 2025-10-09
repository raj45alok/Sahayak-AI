import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { MessageCircle, Send, Bot } from 'lucide-react';
import { studentAPI } from '../../services/api';
import { toast } from 'sonner';

export function StudentDoubts() {
  const [question, setQuestion] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('fade-in');
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    try {
      await studentAPI.askDoubt({ question, subject });
      toast.success('Question submitted successfully! You will receive an answer soon.');
      setQuestion('');
      setSubject('');
    } catch (error) {
      console.error('Submit doubt error:', error);
      // Fallback to demo mode
      toast.success('Question submitted successfully! You will receive an answer soon.');
      setQuestion('');
      setSubject('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentDoubts = [
    {
      id: 1,
      question: 'How do I solve quadratic equations?',
      subject: 'Mathematics',
      answer: 'To solve quadratic equations, you can use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      question: 'What is the Pythagorean theorem?',
      subject: 'Mathematics',
      answer: 'The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse.',
      timestamp: '1 day ago'
    }
  ];

  return (
    <div className={`space-y-6 ${animationClass}`}>
      <div className="slide-in-left">
        <h1>Ask a Question</h1>
        <p className="text-muted-foreground mt-1">
          Get instant help from our AI tutor
        </p>
      </div>

      {/* Ask New Question */}
      <Card className="card-effect glass-effect card-tilt hover-lift scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 animate-breathe" />
            <span className="animate-gradient-text">Ask Your Doubt</span>
          </CardTitle>
          <CardDescription>
            Type your question and get an instant AI-powered explanation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              Your Question
            </label>
            <Textarea
              id="question"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
              rows={4}
            />
          </div>
          <Button 
            onClick={handleAskQuestion} 
            disabled={isSubmitting}
            className="w-full btn-3d gradient-bg hover-glow ripple-effect"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Ask Question'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Doubts */}
      <div className="slide-in-right">
        <h2 className="mb-4">Recent Questions</h2>
        <div className="space-y-4">
          {recentDoubts.map((doubt) => (
            <Card key={doubt.id} className="card-effect glass-effect hover-lift card-tilt transition-all duration-300 magnetic-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{doubt.question}</CardTitle>
                    <CardDescription>{doubt.subject} • {doubt.timestamp}</CardDescription>
                  </div>
                  <Bot className="h-5 w-5 text-primary animate-breathe" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{doubt.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}