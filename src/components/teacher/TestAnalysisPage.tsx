import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowLeft, Download, FileText, Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface TestAnalysisPageProps {
  test: any;
  onBack: () => void;
}

export function TestAnalysisPage({ test, onBack }: TestAnalysisPageProps) {
  const scoreDistribution = [
    { range: '90-100', count: 8, color: '#10b981' },
    { range: '80-89', count: 12, color: '#3b82f6' },
    { range: '70-79', count: 6, color: '#f59e0b' },
    { range: '60-69', count: 2, color: '#ef4444' },
    { range: 'Below 60', count: 0, color: '#dc2626' }
  ];

  const questionAnalysis = [
    { question: 'Q1', correct: 24, incorrect: 4, difficulty: 'Easy' },
    { question: 'Q2', correct: 22, incorrect: 6, difficulty: 'Easy' },
    { question: 'Q3', correct: 18, incorrect: 10, difficulty: 'Medium' },
    { question: 'Q4', correct: 15, incorrect: 13, difficulty: 'Hard' },
    { question: 'Q5', correct: 12, incorrect: 16, difficulty: 'Hard' }
  ];

  const studentPerformance = [
    { name: 'Sarah Johnson', score: 98, time: '45 min', status: 'Excellent' },
    { name: 'Michael Chen', score: 94, time: '52 min', status: 'Excellent' },
    { name: 'Emma Davis', score: 91, time: '48 min', status: 'Good' },
    { name: 'Alex Rodriguez', score: 89, time: '55 min', status: 'Good' },
    { name: 'Olivia Wilson', score: 87, time: '58 min', status: 'Good' },
    { name: 'Jake Thompson', score: 62, time: '60 min', status: 'Needs Help' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performance Tracker
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">
              {test.subject} • {new Date(test.date).toLocaleDateString()} • Detailed Analysis
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{test.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last test
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((test.completed / test.totalStudents) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              {test.completed}/{test.totalStudents} students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{test.highestScore}%</div>
            <p className="text-xs text-muted-foreground">
              Sarah Johnson
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas of Concern</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Students below 65%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Distribution of student scores across different ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
            <CardDescription>
              Performance breakdown by question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionAnalysis.map((q, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{q.question}</span>
                    <Badge variant={q.difficulty === 'Easy' ? 'default' : q.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Correct: {q.correct}</span>
                    <span>Incorrect: {q.incorrect}</span>
                  </div>
                  <Progress value={(q.correct / (q.correct + q.incorrect)) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Performance</CardTitle>
          <CardDescription>
            Detailed breakdown of each student's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentPerformance.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Time: {student.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.score}%</p>
                    <Badge variant={student.status === 'Excellent' ? 'default' : student.status === 'Good' ? 'secondary' : 'destructive'}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights & Recommendations</CardTitle>
          <CardDescription>
            Based on the test analysis, here are some suggestions for improvement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Strong Performance Areas</h4>
                <p className="text-sm text-muted-foreground">
                  Questions 1 and 2 show excellent understanding. 85% of students scored above 80% on these topics.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Areas Needing Attention</h4>
                <p className="text-sm text-muted-foreground">
                  Questions 4 and 5 proved challenging. Consider reviewing these concepts with additional examples and practice problems.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Provide additional support for Jake Thompson and students scoring below 70%</li>
                  <li>• Consider breaking down complex problems in questions 4-5 into smaller steps</li>
                  <li>• Implement peer tutoring with top performers helping struggling students</li>
                  <li>• Schedule a review session focusing on the most challenging concepts</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}