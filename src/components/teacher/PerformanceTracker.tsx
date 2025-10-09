import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Clock, Download, Filter, FileText, AlertTriangle, CheckCircle, BarChart3, Eye, Calendar } from 'lucide-react';
import { TestAnalysisPage } from './TestAnalysisPage';

export function PerformanceTracker() {
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [selectedView, setSelectedView] = useState('dashboard');
  const [selectedTest, setSelectedTest] = useState(null);

  const classes = ['All Classes', 'Grade 5 Mathematics', 'Grade 6 Mathematics', 'Grade 7 Science', 'Grade 8 English'];
  const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry'];

  // Enhanced sample data
  const classOverview = {
    totalStudents: selectedClass === 'All Classes' ? 156 : 28,
    averageScore: 85,
    completionRate: 92,
    improvementRate: 12,
    totalClasses: selectedClass === 'All Classes' ? 6 : 1,
    totalSubjects: selectedClass === 'All Classes' ? 6 : 2
  };

  const subjectPerformanceData = [
    { 
      subject: 'Mathematics', 
      average: 88, 
      students: selectedClass === 'All Classes' ? 156 : 28,
      tests: 12,
      assignments: 8,
      trend: '+5%',
      lastTest: '2024-01-15',
      topScore: 98,
      lowScore: 62
    },
    { 
      subject: 'Science', 
      average: 82, 
      students: selectedClass === 'All Classes' ? 142 : 26,
      tests: 10,
      assignments: 6,
      trend: '+2%',
      lastTest: '2024-01-14',
      topScore: 96,
      lowScore: 58
    },
    { 
      subject: 'English', 
      average: 91, 
      students: selectedClass === 'All Classes' ? 156 : 28,
      tests: 8,
      assignments: 12,
      trend: '+8%',
      lastTest: '2024-01-13',
      topScore: 100,
      lowScore: 72
    },
    { 
      subject: 'Social Studies', 
      average: 78, 
      students: selectedClass === 'All Classes' ? 134 : 25,
      tests: 6,
      assignments: 10,
      trend: '-2%',
      lastTest: '2024-01-12',
      topScore: 92,
      lowScore: 45
    },
    { 
      subject: 'Physics', 
      average: 85, 
      students: selectedClass === 'All Classes' ? 89 : 22,
      tests: 9,
      assignments: 7,
      trend: '+3%',
      lastTest: '2024-01-11',
      topScore: 97,
      lowScore: 68
    },
    { 
      subject: 'Chemistry', 
      average: 79, 
      students: selectedClass === 'All Classes' ? 76 : 18,
      tests: 11,
      assignments: 5,
      trend: '+1%',
      lastTest: '2024-01-10',
      topScore: 94,
      lowScore: 52
    }
  ];

  const trendData = [
    { month: 'Sep', score: 75, participation: 88, assignments: 82 },
    { month: 'Oct', score: 78, participation: 90, assignments: 85 },
    { month: 'Nov', score: 82, participation: 87, assignments: 88 },
    { month: 'Dec', score: 85, participation: 92, assignments: 90 },
    { month: 'Jan', score: 88, participation: 94, assignments: 92 }
  ];

  const overallClassData = [
    { period: 'Week 1', average: 82, attendance: 95, submissions: 88 },
    { period: 'Week 2', average: 84, attendance: 93, submissions: 90 },
    { period: 'Week 3', average: 86, attendance: 97, submissions: 92 },
    { period: 'Week 4', average: 85, attendance: 94, submissions: 89 }
  ];

  const radarData = [
    { subject: 'Math', A: 85, B: 88, fullMark: 100 },
    { subject: 'Science', A: 82, B: 79, fullMark: 100 },
    { subject: 'English', A: 91, B: 85, fullMark: 100 },
    { subject: 'Social', A: 78, B: 82, fullMark: 100 },
    { subject: 'Physics', A: 85, B: 87, fullMark: 100 },
    { subject: 'Chemistry', A: 79, B: 81, fullMark: 100 }
  ];

  const gradeDistribution = [
    { grade: 'A (90-100)', count: selectedClass === 'All Classes' ? 48 : 8, color: '#10b981' },
    { grade: 'B (80-89)', count: selectedClass === 'All Classes' ? 67 : 12, color: '#3b82f6' },
    { grade: 'C (70-79)', count: selectedClass === 'All Classes' ? 28 : 6, color: '#f59e0b' },
    { grade: 'D (60-69)', count: selectedClass === 'All Classes' ? 13 : 2, color: '#ef4444' }
  ];

  const testsAndAssignments = [
    {
      id: 1,
      title: 'Algebra Fundamentals Test',
      subject: 'Mathematics',
      type: 'Test',
      date: '2024-01-15',
      totalStudents: 28,
      completed: 26,
      averageScore: 85,
      highestScore: 98,
      lowestScore: 62,
      duration: '60 mins',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Chemical Reactions Lab Report',
      subject: 'Chemistry',
      type: 'Assignment',
      date: '2024-01-14',
      totalStudents: 18,
      completed: 17,
      averageScore: 82,
      highestScore: 94,
      lowestScore: 65,
      duration: 'N/A',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Photosynthesis Quiz',
      subject: 'Science',
      type: 'Test',
      date: '2024-01-13',
      totalStudents: 26,
      completed: 24,
      averageScore: 78,
      highestScore: 92,
      lowestScore: 54,
      duration: '30 mins',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Essay Writing Assignment',
      subject: 'English',
      type: 'Assignment',
      date: '2024-01-12',
      totalStudents: 28,
      completed: 25,
      averageScore: 88,
      highestScore: 100,
      lowestScore: 71,
      duration: 'N/A',
      status: 'grading'
    },
    {
      id: 5,
      title: 'World War II Test',
      subject: 'Social Studies',
      type: 'Test',
      date: '2024-01-11',
      totalStudents: 25,
      completed: 23,
      averageScore: 76,
      highestScore: 89,
      lowestScore: 45,
      duration: '45 mins',
      status: 'completed'
    }
  ];

  const topStudents = [
    { name: 'Sarah Johnson', score: 96, improvement: 8, avatar: '' },
    { name: 'Michael Chen', score: 94, improvement: 5, avatar: '' },
    { name: 'Emma Davis', score: 91, improvement: 12, avatar: '' },
    { name: 'Alex Rodriguez', score: 89, improvement: 15, avatar: '' },
    { name: 'Olivia Wilson', score: 87, improvement: 6, avatar: '' }
  ];

  const strugglingStudents = [
    { name: 'Jake Thompson', score: 62, decline: -8, avatar: '', weakAreas: ['Algebra', 'Word Problems'] },
    { name: 'Mia Brown', score: 68, decline: -3, avatar: '', weakAreas: ['Geometry'] },
    { name: 'Ryan Miller', score: 71, decline: -5, avatar: '', weakAreas: ['Fractions', 'Decimals'] }
  ];

  const stats = [
    {
      title: selectedClass === 'All Classes' ? 'Overall Average' : 'Class Average',
      value: `${classOverview.averageScore}%`,
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${classOverview.completionRate}%`,
      change: '+3%',
      trend: 'up',
      icon: Award,
      color: 'text-blue-600'
    },
    {
      title: selectedClass === 'All Classes' ? 'Total Students' : 'Active Students',
      value: classOverview.totalStudents.toString(),
      change: selectedClass === 'All Classes' ? '+12' : '+2',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: selectedClass === 'All Classes' ? 'Active Subjects' : 'Improvement Rate',
      value: selectedClass === 'All Classes' ? `${classOverview.totalSubjects}` : `${classOverview.improvementRate}%`,
      change: selectedClass === 'All Classes' ? '+1' : '+7%',
      trend: 'up',
      icon: selectedClass === 'All Classes' ? BookOpen : TrendingUp,
      color: 'text-orange-600'
    }
  ];

  const suggestions = [
    {
      type: 'positive',
      title: 'Mathematics Performance Excellence',
      description: 'Mathematics shows consistently high performance with 88% average. Students are excelling in algebraic concepts.',
      action: 'Consider introducing advanced problem-solving challenges for top performers.'
    },
    {
      type: 'attention',
      title: 'Social Studies Needs Focus',
      description: 'Social Studies shows a slight decline (-2%) and lowest average (78%). Students struggle with historical analysis.',
      action: 'Implement interactive history sessions and visual learning aids to improve engagement.'
    },
    {
      type: 'improvement',
      title: 'Overall Trend Positive',
      description: 'Most subjects show positive trends. English leads with +8% improvement this period.',
      action: 'Apply successful English teaching methods to other subjects showing slower growth.'
    }
  ];

  // Handle test analysis view
  if (selectedView === 'test-analysis' && selectedTest) {
    return (
      <TestAnalysisPage
        test={selectedTest}
        onBack={() => setSelectedView('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze student performance across all classes and subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="tests">Tests & Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Class Performance Chart */}
          {selectedClass === 'All Classes' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Overall Class Performance - {selectedPeriod}
                </CardTitle>
                <CardDescription>
                  Performance trends across all classes and time periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={overallClassData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="average" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="attendance" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="submissions" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Average Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Submission Rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Subject Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Comparison</CardTitle>
                <CardDescription>
                  Compare performance across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Current Period" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Previous Period" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of grades in the selected class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                      label={({ grade, count }) => `${grade}: ${count}`}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Students with highest scores this period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {student.score}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        +{student.improvement}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Students Needing Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  Students Needing Attention
                </CardTitle>
                <CardDescription>
                  Students who may need additional support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {strugglingStudents.map((student, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {student.score}%
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {student.decline}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Weak areas:</p>
                      <div className="flex gap-1">
                        {student.weakAreas.map((area, areaIndex) => (
                          <Badge key={areaIndex} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-6">
            {subjectPerformanceData.map((subject, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {subject.subject}
                      </CardTitle>
                      <CardDescription>
                        {subject.students} students • {subject.tests} tests • {subject.assignments} assignments
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={subject.average >= 85 ? "default" : subject.average >= 75 ? "secondary" : "destructive"}>
                        {subject.average >= 85 ? "Excellent" : subject.average >= 75 ? "Good" : "Needs Improvement"}
                      </Badge>
                      <Badge variant="outline" className={subject.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {subject.trend}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Class Performance</span>
                      <span>{subject.average}%</span>
                    </div>
                    <Progress value={subject.average} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Class average performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}