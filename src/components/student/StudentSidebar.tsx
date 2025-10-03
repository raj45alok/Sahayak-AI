import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '../ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Hop as Home, User, BookOpen, MessageCircle, Trophy, Calendar, LogOut, TrendingUp } from 'lucide-react';
import { Logo } from '../ui/Logo';
// Add this import at the top of StudentSidebar.tsx
import sahayakLogo from '../../assets/logo.png';


export function StudentSidebar() {
  const { user, logout } = React.useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/student/dashboard',
      icon: Home,
    },
    {
      title: 'My Profile',
      url: '/student/profile',
      icon: User,
    },
    {
      title: 'My Assignments',
      url: '/student/assignments',
      icon: BookOpen,
    },
    {
      title: 'My Analytics',
      url: '/student/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Ask Doubt',
      url: '/student/doubts',
      icon: MessageCircle,
    },
    {
      title: 'My Progress',
      url: '/student/progress',
      icon: Trophy,
    },
    {
      title: 'Schedule',
      url: '/student/schedule',
      icon: Calendar,
    },
  ];

  return (
    <Sidebar className="sidebar-gradient">
      <SidebarHeader className="border-b gradient-bg-subtle">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="h-10 w-10 rounded-lg overflow-hidden shadow-sm">
            <img
              src={sahayakLogo}
              alt="Sahayak AI"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-base text-foreground">Sahayak AI</span>
            <span className="truncate text-xs text-muted-foreground">Student Portal</span>
          </div>
          <SidebarTrigger className="-mr-1" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className="w-full"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.grade || 'Student'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}