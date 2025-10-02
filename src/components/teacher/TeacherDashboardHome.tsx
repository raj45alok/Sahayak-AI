import React, { useState, useEffect } from 'react';
import { AuthContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus, Users, FileText, TrendingUp, Clock, Settings, UserPlus, Calendar, MoveVertical as MoreVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import { toast } from 'sonner';

export function TeacherDashboardHome() {
  const { user } = React.useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [isScheduleSettingsOpen, setIsScheduleSettingsOpen] = useState(false);
  const [visibleClasses, setVisibleClasses] = useState(3);

  useEffect(() => {
    setAnimationClass('fade-in');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await teacherAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.log('API not available, using demo data');
      // Use existing demo data
    } finally {
      setIsLoading(false);
    }
  };

  const classes = [
    {
      id: 1,
      name: 'Grade 5 Mathematics',
      students: 28,
      subject: 'Mathematics',
      schedule: 'Mon, Wed, Fri - 10:00 AM',
      room: 'Room 101'
    },
    {
      id: 2,
      name: 'Grade 6 Mathematics',
      students: 25,
      subject: 'Mathematics',
      schedule: 'Tue, Thu - 11:30 AM',
      room: 'Room 102'
    },
    {
      id: 3,
      name: 'Grade 7 Science',
      students: 30,
      subject: 'Science',
      schedule: 'Mon, Wed - 2:00 PM',
      room: 'Lab 1'
    },
    {
      id: 4,
      name: 'Grade 8 Mathematics',
      students: 22,
      subject: 'Mathematics',
      schedule: 'Tue, Thu - 9:00 AM',
      room: 'Room 103'
    },
    {
      id: 5,
      name: 'Grade 9 Algebra',
      students: 27,
      subject: 'Mathematics',
      schedule: 'Mon, Fri - 11:00 AM',
      room: 'Room 104'
    },
    {
      id: 6,
      name: 'Grade 10 Physics',
      students: 24,
      subject: 'Physics',
      schedule: 'Wed, Fri - 1:00 PM',
      room: 'Lab 2'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Generated worksheet for Algebra basics',
      time: '2 hours ago',
      type: 'worksheet'
    },
    {
      id: 2,
      action: 'Alex Johnson submitted doubt about fractions',
      time: '4 hours ago',
      type: 'doubt'
    },
    {
      id: 3,
      action: 'Performance report generated for Grade 5',
      time: '1 day ago',
      type: 'report'
    },
    {
      id: 4,
      action: 'Enhanced content for geometry lesson',
      time: '2 days ago',
      type: 'content'
    }
  ];

  const stats = [
    {
      title: 'Total Students',
      value: '53',
      icon: Users,
      color: 'gradient-bg-blue shadow-lg',
      glowClass: 'hover-glow'
    },
    {
      title: 'Worksheets Created',
      value: '127',
      icon: FileText,
      color: 'gradient-bg-green shadow-lg',
      glowClass: 'success-glow'
    },
    {
      title: 'Avg Performance',
      value: '85%',
      icon: TrendingUp,
      color: 'gradient-bg-purple shadow-lg',
      glowClass: 'hover-glow'
    },
    {
      title: 'Pending Doubts',
      value: '3',
      icon: Clock,
      color: 'gradient-bg-orange shadow-lg',
      glowClass: 'warning-glow'
    }
  ];

  return (
    <div className={`space-y-6 ${animationClass}`}>
      {/* Teacher Profile Section */}
      <div className="flex items-center justify-between">
        <Link 
          to="/teacher/profile" 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-300 cursor-pointer glass-effect hover-lift magnetic-hover"
        >
          <Avatar className="h-12 w-12 animate-breathe">
            <AvatarImage src={user?.profilePhoto} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium animate-gradient-text">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">Mathematics Teacher</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards - Smaller */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 scale-in">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`p-4 glass-effect hover-lift card-tilt transition-all duration-500 border-2 border-primary/20 ${stat.glowClass} magnetic-hover`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="flex items-center justify-between p-0">
                <div>
                  <p className="text-sm font-bold animate-gradient-text">{stat.title}</p>
                  <p className="text-2xl font-black animate-gradient-text animate-breathe">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-xl btn-3d animate-bounce-gentle`}>
                  <Icon className="h-6 w-6 text-white drop-shadow-lg animate-breathe" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 slide-in-left">
        {/* My Classes - Bigger */}
        <Card className="lg:col-span-2 glass-effect border-2 border-primary/20 shadow-xl card-tilt hover-lift">
          <CardHeader className="flex flex-row items-center justify-between gradient-bg-subtle rounded-t-lg border-b-2 border-primary/10">
            <div>
              <CardTitle className="animate-gradient-text flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Classes
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Manage your current classes and students
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-2 border-primary/30 hover:bg-primary/10 btn-3d glass-effect hover-glow shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {classes.slice(0, visibleClasses).map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-5 border-2 border-primary/10 rounded-xl glass-effect hover-lift transition-all duration-300 magnetic-hover shadow-md hover:shadow-xl hover:border-primary/30 bg-gradient-to-r from-background to-primary/5">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-md">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{classItem.name}</h3>
                      <p className="text-xs text-muted-foreground">{classItem.room}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {classItem.schedule}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="animate-pulse-color shadow-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {classItem.students} students
                    </Badge>
                    <Badge variant="outline" className="animate-pulse-color border-primary/30 shadow-sm">
                      {classItem.subject}
                    </Badge>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="btn-3d hover-glow">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 glass-effect shadow-xl border-2 border-primary/20" align="end">
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setIsEditDialogOpen(true);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Class Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setIsManageStudentsOpen(true);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        Manage Students
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setIsScheduleSettingsOpen(true);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        <Calendar className="h-4 w-4" />
                        Schedule Settings
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
            {classes.length > 3 && (
              <Button
                variant="outline"
                className="w-full mt-4 btn-3d glass-effect hover-glow border-2 border-primary/20 shadow-md"
                onClick={() => setVisibleClasses(visibleClasses === 3 ? classes.length : 3)}
              >
                {visibleClasses === 3 ? 'View All Classes' : 'Show Less'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="glass-effect card-tilt hover-lift border-2 border-primary/20 shadow-xl">
          <CardHeader className="border-b-2 border-primary/10">
            <CardTitle className="animate-gradient-text flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 border border-primary/10 hover:border-primary/20 hover-scale transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse-color shadow-md"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-2 border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="animate-gradient-text">Edit Class Details</DialogTitle>
            <DialogDescription>Update the details for {selectedClass?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class Name</Label>
              <Input defaultValue={selectedClass?.name} className="glass-effect border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input defaultValue={selectedClass?.subject} className="glass-effect border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Input defaultValue={selectedClass?.room} className="glass-effect border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Add a description..." className="glass-effect border-primary/20" />
            </div>
            <Button className="w-full btn-3d gradient-bg hover-glow">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageStudentsOpen} onOpenChange={setIsManageStudentsOpen}>
        <DialogContent className="glass-effect border-2 border-primary/20 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="animate-gradient-text">Manage Students</DialogTitle>
            <DialogDescription>Add or remove students from {selectedClass?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Search students..." className="glass-effect border-primary/20" />
              <Button className="btn-3d gradient-bg hover-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-primary/10 rounded-lg glass-effect hover-lift">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>S{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Student {i}</p>
                      <p className="text-xs text-muted-foreground">student{i}@school.com</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="btn-3d hover-glow">Remove</Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleSettingsOpen} onOpenChange={setIsScheduleSettingsOpen}>
        <DialogContent className="glass-effect border-2 border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="animate-gradient-text">Schedule Settings</DialogTitle>
            <DialogDescription>Configure the schedule for {selectedClass?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Days</Label>
              <Input defaultValue={selectedClass?.schedule?.split(' - ')[0]} className="glass-effect border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input defaultValue={selectedClass?.schedule?.split(' - ')[1]} className="glass-effect border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input placeholder="60" type="number" className="glass-effect border-primary/20" />
            </div>
            <Button className="w-full btn-3d gradient-bg hover-glow">Update Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="glass-effect card-tilt hover-lift slide-in-right border-2 border-primary/20 shadow-xl">
        <CardHeader className="border-b-2 border-primary/10">
          <CardTitle className="animate-gradient-text flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Common tasks you can perform right now
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/teacher/worksheet-generator">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover border-2 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-primary animate-breathe" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Generate Worksheet</h3>
                    <p className="text-xs text-muted-foreground">Create custom worksheets</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/teacher/performance-tracker">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover border-2 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-7 w-7 text-primary animate-breathe" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">View Performance</h3>
                    <p className="text-xs text-muted-foreground">Track student progress</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/teacher/doubt-solver">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover border-2 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                    <Clock className="h-7 w-7 text-primary animate-breathe" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pending Doubts</h3>
                    <p className="text-xs text-muted-foreground">Answer student questions</p>
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