import React, { useState, useEffect } from 'react';
import { AuthContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus, Users, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import { toast } from 'sonner';

export function TeacherDashboardHome() {
  const { user } = React.useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState('');

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
      schedule: 'Mon, Wed, Fri - 10:00 AM'
    },
    {
      id: 2,
      name: 'Grade 6 Mathematics',
      students: 25,
      subject: 'Mathematics', 
      schedule: 'Tue, Thu - 11:30 AM'
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
        <Card className="lg:col-span-2 glass-effect border-primary/20 card-tilt hover-lift">
          <CardHeader className="flex flex-row items-center justify-between gradient-bg-subtle rounded-t-lg">
            <div>
              <CardTitle className="animate-gradient-text">My Classes</CardTitle>
              <CardDescription>
                Manage your current classes and students
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10 btn-3d glass-effect hover-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {classes.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg glass-effect hover-lift transition-all duration-300 magnetic-hover">
                <div className="space-y-1">
                  <h3 className="font-medium">{classItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{classItem.schedule}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="animate-pulse-color">
                      {classItem.students} students
                    </Badge>
                    <Badge variant="outline" className="animate-pulse-color">
                      {classItem.subject}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="btn-3d hover-glow">
                  View Details
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="glass-effect card-tilt hover-lift">
          <CardHeader>
            <CardTitle className="animate-gradient-text">Recent Activities</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 hover-scale transition-all duration-300">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse-color"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect card-tilt hover-lift slide-in-right">
        <CardHeader>
          <CardTitle className="animate-gradient-text">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/teacher/worksheet-generator">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover">
                <CardContent className="flex items-center gap-3 p-6">
                  <FileText className="h-8 w-8 text-primary animate-breathe" />
                  <div>
                    <h3 className="font-medium">Generate Worksheet</h3>
                    <p className="text-sm text-muted-foreground">Create custom worksheets</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/teacher/performance-tracker">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover">
                <CardContent className="flex items-center gap-3 p-6">
                  <TrendingUp className="h-8 w-8 text-primary animate-breathe" />
                  <div>
                    <h3 className="font-medium">View Performance</h3>
                    <p className="text-sm text-muted-foreground">Track student progress</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/teacher/doubt-solver">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer glass-effect hover-lift card-tilt magnetic-hover">
                <CardContent className="flex items-center gap-3 p-6">
                  <Clock className="h-8 w-8 text-primary animate-breathe" />
                  <div>
                    <h3 className="font-medium">Pending Doubts</h3>
                    <p className="text-sm text-muted-foreground">Answer student questions</p>
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