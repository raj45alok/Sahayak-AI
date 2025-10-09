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
import { 
  Home,
  FileText, 
  Sparkles, 
  BarChart3, 
  HelpCircle, 
  Calendar,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import sahayakLogo from '../../assets/sahayak-logo.png';


export function TeacherSidebar() {
  const { user, logout } = React.useContext(AuthContext);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: t('teacher.sidebar.dashboard'),
      url: '/teacher/dashboard',
      icon: Home,
    },
    {
      title: t('teacher.sidebar.worksheets'),
      url: '/teacher/worksheet-generator',
      icon: FileText,
    },
    {
      title: t('teacher.sidebar.contentEnhancer'),
      url: '/teacher/content-enhancer',
      icon: Sparkles,
    },
    {
      title: t('teacher.sidebar.schedule'),
      url: '/teacher/scheduled-content',
      icon: Calendar,
    },
    {
      title: t('teacher.sidebar.performance'),
      url: '/teacher/performance-tracker',
      icon: BarChart3,
    },
    {
      title: t('teacher.sidebar.doubts'),
      url: '/teacher/doubt-solver',
      icon: HelpCircle,
    },
  ];

  return (
    <Sidebar className="sidebar-gradient">
      <SidebarHeader className="border-b-2 border-gradient-to-r from-purple-200 to-blue-200 gradient-bg-subtle">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="h-14 w-14 rounded-xl overflow-hidden shadow-xl ring-3 ring-purple-300 animate-pulse-color">
            <img 
              src={sahayakLogo} 
              alt="Sahayak AI" 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{t('app.title')} ✨</span>
            <span className="truncate text-sm text-sidebar-foreground/80 font-semibold">🎓 {t('teacher.dashboard.title')}</span>
          </div>
          <SidebarTrigger className="-mr-1 hover-scale" />
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
              {user?.classInfo || 'Teacher'}
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
          {t('nav.logout')}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}