import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Download, TrendingUp, Award, BookOpen, Target, CircleCheck as CheckCircle } from 'lucide-react';

export function StudentAnalytics() {
  const [timeFilter, setTimeFilter] = useState('month');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const overallStats = {
    averageScore: 85,
    totalAssignments: 24,
    completed: 22,
    pending: 2,
    classRank: 5,
    totalStudents: 45
  };

  const recentScores = [
    { assignment: 'Algebra Quiz', score: 95, date: '2 days ago', subject: 'Mathematics' },
    { assignment: 'Geometry Test', score: 88, date: '5 days ago', subject: 'Mathematics' },
    { assignment: 'Chemical Reactions', score: 92, date: '1 week ago', subject: 'Science' },
    { assignment: 'Fractions Assessment', score: 78, date: '2 weeks ago', subject: 'Mathematics' },
    { assignment: 'Photosynthesis Lab', score: 85, date: '3 weeks ago', subject: 'Science' }
  ];

  const performanceTrend = [
    { week: 'Week 1', score: 75 },
    { week: 'Week 2', score: 78 },
    { week: 'Week 3', score: 82 },
    { week: 'Week 4', score: 85 },
    { week: 'Week 5', score: 88 },
    { week: 'Week 6', score: 85 }
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', myScore: 85, classAvg: 78 },
    { subject: 'Science', myScore: 88, classAvg: 80 },
    { subject: 'English', myScore: 82, classAvg: 85 },
    { subject: 'History', myScore: 90, classAvg: 82 }
  ];

  const skillsRadar = [
    { skill: 'Problem Solving', score: 90 },
    { skill: 'Understanding', score: 85 },
    { skill: 'Application', score: 88 },
    { skill: 'Analysis', score: 82 },
    { skill: 'Speed', score: 78 }
  ];

  const questionBreakdown = [
    { question: 'Q1', myAnswer: 'Correct', feedback: 'Excellent work!' },
    { question: 'Q2', myAnswer: 'Correct', feedback: 'Well done!' },
    { question: 'Q3', myAnswer: 'Partial', feedback: 'Good attempt, review the formula' },
    { question: 'Q4', myAnswer: 'Correct', feedback: 'Perfect!' }
  ];

  const achievements = [
    { title: 'Perfect Score', description: 'Scored 100% in 3 assignments', icon: Award, color: 'text-yellow-500' },
    { title: 'Consistent Performer', description: 'Above 80% for 10 consecutive assignments', icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Early Bird', description: 'Submitted 15 assignments before deadline', icon: CheckCircle, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-xl glass-effect border-2 border-primary/20 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">My Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and achievements
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect border-2 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.completed}/{overallStats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Completed this month</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{overallStats.classRank}</div>
            <p className="text-xs text-muted-foreground">out of {overallStats.totalStudents} students</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((overallStats.completed / overallStats.totalAssignments) * 100)}%</div>
            <p className="text-xs text-muted-foreground">On-time submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
            <CardDescription>Your strengths across different areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Your Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Subject-wise Comparison</CardTitle>
          <CardDescription>Your performance vs class average</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="myScore" fill="#8b5cf6" name="Your Score" />
              <Bar dataKey="classAvg" fill="#e5e7eb" name="Class Average" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Your latest performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScores.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.assignment}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{item.subject}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={item.score} className="w-24" />
                    <span className="text-lg font-bold w-12 text-right">{item.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your milestones and badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${achievement.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Latest Assignment Breakdown</CardTitle>
          <CardDescription>Detailed feedback on your most recent submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionBreakdown.map((q, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">{q.question}</span>
                  </div>
                  <div className="flex-1">
                    <Badge variant={q.myAnswer === 'Correct' ? 'default' : 'secondary'}>
                      {q.myAnswer}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{q.feedback}</p>
                  </div>
                </div>
                {q.myAnswer === 'Correct' && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
