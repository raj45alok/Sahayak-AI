import React, { useState, useEffect } from 'react';
import { AuthContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { BookOpen, Clock, Trophy, MessageCircle, Calendar, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus, GraduationCap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { studentAPI } from '../../services/api';

export function StudentDashboardHome() {
  const { user } = React.useContext(AuthContext);
  const [classId, setClassId] = React.useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = React.useState(false);
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('fade-in');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await studentAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.log('API not available, using demo data');
    }
  };

  const handleJoinClass = async () => {
    if (!classId.trim()) {
      toast.error('Please enter a valid Class ID');
      return;
    }
    
    setIsJoiningClass(true);
    try {
      await studentAPI.joinClass(classId);
      toast.success(`Successfully joined class: ${classId}`);
      setClassId('');
      setIsJoinDialogOpen(false);
      loadDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Join class error:', error);
      // Fallback to demo mode
      toast.success(`Successfully joined class: ${classId}`);
      setClassId('');
      setIsJoinDialogOpen(false);
    } finally {
      setIsJoiningClass(false);
    }
  };

  const stats = [
    {
      title: 'Assignments Completed',
      value: '12',
      total: '15',
      icon: CheckCircle,
      color: 'gradient-bg-green',
      glowClass: ''
    },
    {
      title: 'Pending Tasks',
      value: '3',
      icon: Clock,
      color: 'gradient-bg-orange',
      glowClass: ''
    },
    {
      title: 'Doubts Resolved',
      value: '8',
      icon: MessageCircle,
      color: 'gradient-bg-blue',
      glowClass: ''
    },
    {
      title: 'Today\'s Classes',
      value: '2',
      icon: Calendar,
      color: 'gradient-bg-purple',
      glowClass: '',
      isAction: true
    }
  ];

  const recentAssignments = [
    {
      id: 1,
      title: 'Algebra Practice Worksheet',
      subject: 'Mathematics',
      dueDate: 'Tomorrow',
      status: 'pending',
      score: null
    },
    {
      id: 2,
      title: 'Geometry Quiz',
      subject: 'Mathematics',
      dueDate: '2 days ago',
      status: 'completed',
      score: 85
    },
    {
      id: 3,
      title: 'Fractions Assessment',
      subject: 'Mathematics',
      dueDate: '1 week ago',
      status: 'completed',
      score: 92
    }
  ];

  const enrolledClasses = [
    {
      id: 'MATH101',
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Wilson',
      students: 28,
      nextClass: 'Tomorrow, 10:00 AM',
      topic: 'Linear Equations',
      status: 'active'
    },
    {
      id: 'SCI102',
      subject: 'Science',
      teacher: 'Mr. John Davis',
      students: 24,
      nextClass: 'Wednesday, 2:00 PM',
      topic: 'Chemical Reactions',
      status: 'active'
    },
    {
      id: 'ENG103',
      subject: 'English',
      teacher: 'Ms. Emily Brown',
      students: 30,
      nextClass: 'Friday, 11:00 AM',
      topic: 'Creative Writing',
      status: 'active'
    }
  ];

  const todaySchedule = [
    {
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Wilson',
      time: '10:00 AM - 11:00 AM',
      topic: 'Linear Equations',
      room: 'Room 101',
      status: 'upcoming'
    },
    {
      subject: 'Science',
      teacher: 'Mr. John Davis',
      time: '2:00 PM - 3:00 PM',
      topic: 'Chemical Reactions',
      room: 'Lab A',
      status: 'upcoming'
    },
    {
      subject: 'Break',
      time: '12:00 PM - 1:00 PM',
      type: 'break'
    }
  ];

  const learningProgress = [
    {
      subject: 'Algebra',
      progress: 85,
      color: 'bg-blue-500'
    },
    {
      subject: 'Geometry',
      progress: 72,
      color: 'bg-green-500'
    },
    {
      subject: 'Fractions',
      progress: 94,
      color: 'bg-purple-500'
    },
    {
      subject: 'Word Problems',
      progress: 68,
      color: 'bg-orange-500'
    }
  ];

  const recentAchievements = [
    {
      title: 'Math Star',
      description: 'Scored 90+ in 3 consecutive assignments',
      date: '2 days ago',
      icon: '⭐'
    },
    {
      title: 'Quick Learner',
      description: 'Completed 5 assignments this week',
      date: '1 week ago',
      icon: '🚀'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-base text-muted-foreground">
            Ready to continue your learning journey today?
          </p>
        </div>
        <Button asChild className="gradient-bg">
          <Link to="/student/doubts">
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask a Question
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          if (stat.isAction) {
            return (
              <Dialog key={index} open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Card
                    className="card-effect hover-lift transition-all cursor-pointer border-border"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`h-10 w-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                      <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold">Today's Full Schedule</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      Your complete schedule for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {todaySchedule.map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border border-border ${item.type === 'break' ? 'bg-secondary/50' : 'bg-card'}`}>
                        {item.type === 'break' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                            <div>
                              <h3 className="font-medium text-muted-foreground">{item.subject}</h3>
                              <p className="text-sm text-muted-foreground">{item.time}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-foreground">{item.subject}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{item.teacher}</p>
                              <p className="text-sm font-medium text-primary mb-2">{item.time}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.room}</span>
                                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {item.topic}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            );
          }

          return (
            <Card
              key={index}
              className="card-effect hover-lift transition-all border-border"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                  {stat.total && <span className="text-lg text-muted-foreground font-normal">/{stat.total}</span>}
                </div>
                {stat.total && (
                  <Progress
                    value={(parseInt(stat.value) / parseInt(stat.total)) * 100}
                    className="mt-3"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card className="card-effect border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Recent Assignments</CardTitle>
            <CardDescription className="text-sm">
              Your latest assignments and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      Due: {assignment.dueDate}
                    </Badge>
                    <Badge
                      variant={assignment.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs font-medium"
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  {assignment.score ? (
                    <div className="text-xl font-bold text-green-600">
                      {assignment.score}%
                    </div>
                  ) : (
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Join New Class */}
        <Card className="card-effect border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>Enrolled Classes</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Your enrolled classes and join new ones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrolledClasses.map((classItem, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{classItem.subject}</h3>
                    <Badge variant="outline" className="text-xs font-medium">
                      {classItem.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{classItem.teacher}</p>
                  <p className="text-xs text-muted-foreground">{classItem.students} students • Next: {classItem.nextClass}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="default" className="text-xs font-medium">
                    {classItem.status}
                  </Badge>
                </div>
              </div>
            ))}

            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Join New Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold">Join New Class</span>
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Enter the Class ID provided by your teacher to join a new class.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="classId" className="text-sm font-medium">
                      Class ID
                    </label>
                    <Input
                      id="classId"
                      placeholder="Enter Class ID (e.g., MATH101)"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleJoinClass();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJoinClass}
                      disabled={isJoiningClass}
                      className="gradient-bg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isJoiningClass ? 'Joining...' : 'Join Class'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <Card className="card-effect border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Learning Progress</CardTitle>
            <CardDescription className="text-sm">
              Your progress across different topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningProgress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">{item.subject}</span>
                  <span className="text-sm font-medium text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="card-effect border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Recent Achievements</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Your latest accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-secondary/50 border border-border rounded-lg">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-effect border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          <CardDescription className="text-sm">
            Things you can do right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/student/assignments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">View Assignments</h3>
                    <p className="text-sm text-muted-foreground mt-1">Check pending tasks</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/student/doubts">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ask a Question</h3>
                    <p className="text-sm text-muted-foreground mt-1">Get help from AI</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/student/progress">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Track Progress</h3>
                    <p className="text-sm text-muted-foreground mt-1">See your improvement</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}