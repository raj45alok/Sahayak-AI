import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, ListFilter as Filter, Users, CircleCheck as CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { SidebarProvider } from '../ui/sidebar';

export function AssignmentAnalytics() {
  const [selectedAssignment, setSelectedAssignment] = useState('1');
  const [selectedClass, setSelectedClass] = useState('all');
  const [dateFilter, setDateFilter] = useState('week');

  const assignments = [
    { id: '1', name: 'Algebra Practice Worksheet', class: 'Class 10' },
    { id: '2', name: 'Geometry Quiz', class: 'Class 10' },
    { id: '3', name: 'Chemical Reactions Lab', class: 'Class 9' }
  ];

  const overviewStats = {
    totalStudents: 45,
    submitted: 38,
    pending: 7,
    averageScore: 78.5,
    submissionRate: 84
  };

  const studentPerformance = [
    { name: 'Alex Kumar', score: 95, submitted: 'On Time', class: 'Class 10' },
    { name: 'Priya Sharma', score: 88, submitted: 'On Time', class: 'Class 10' },
    { name: 'Raj Patel', score: 92, submitted: 'On Time', class: 'Class 10' },
    { name: 'Sneha Reddy', score: 75, submitted: 'Late', class: 'Class 10' },
    { name: 'Arjun Singh', score: 82, submitted: 'On Time', class: 'Class 10' },
    { name: 'Meera Iyer', score: 90, submitted: 'On Time', class: 'Class 10' },
    { name: 'Karan Mehta', score: 68, submitted: 'On Time', class: 'Class 10' },
    { name: 'Ananya Das', score: 85, submitted: 'Late', class: 'Class 10' }
  ];

  const questionAnalysis = [
    { question: 'Q1', avgScore: 4.2, maxScore: 5, difficulty: 'Easy' },
    { question: 'Q2', avgScore: 2.1, maxScore: 3, difficulty: 'Medium' },
    { question: 'Q3', avgScore: 1.5, maxScore: 2, difficulty: 'Hard' },
    { question: 'Q4', avgScore: 3.8, maxScore: 5, difficulty: 'Medium' }
  ];

  const scoreDistribution = [
    { range: '90-100', count: 12 },
    { range: '80-89', count: 15 },
    { range: '70-79', count: 8 },
    { range: '60-69', count: 3 },
    { range: '<60', count: 0 }
  ];

  const submissionTimeline = [
    { day: 'Mon', submissions: 5 },
    { day: 'Tue', submissions: 12 },
    { day: 'Wed', submissions: 8 },
    { day: 'Thu', submissions: 7 },
    { day: 'Fri', submissions: 6 }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportData = (format: string) => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`);
  };

  return (
    <div className="w-full space-y-6 px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-xl glass-effect border-2 border-primary/20 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">Assignment Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into assignment performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect border-2 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled in class</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              {overviewStats.submissionRate}% submission rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.pending}</div>
            <p className="text-xs text-muted-foreground">Yet to submit</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Class performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Full Width */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Number of students in each score range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Submission Timeline</CardTitle>
            <CardDescription>Daily submission count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={submissionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Question Analysis - Full Width */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Question-wise Analysis</CardTitle>
          <CardDescription>Performance breakdown by question</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgScore" fill="#10b981" name="Average Score" />
              <Bar dataKey="maxScore" fill="#e5e7eb" name="Max Score" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {questionAnalysis.map((q, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{q.question}</span>
                  <Badge variant="outline">{q.difficulty}</Badge>
                </div>
                <Progress value={(q.avgScore / q.maxScore) * 100} />
                <p className="text-xs text-muted-foreground">
                  {q.avgScore} / {q.maxScore} avg
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance - Full Width */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Student-wise Performance</CardTitle>
          <CardDescription>Detailed breakdown of individual student results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentPerformance.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-medium text-sm">{student.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.class}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <Badge variant={student.submitted === 'On Time' ? 'default' : 'secondary'}>
                      {student.submitted}
                    </Badge>
                    <div className="w-32 hidden sm:block">
                      <Progress value={student.score} />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-lg font-bold">{student.score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}