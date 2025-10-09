import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { AuthContext } from '../../App';
import { LogOut, User } from 'lucide-react';
import { LanguageSelector } from '../i18n/LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import sahayakLogo from '../../assets/sahayak-logo.png';

export function Navbar() {
  const { isAuthenticated, user, logout } = React.useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
      logout();
      toast.success(t('auth.logout.success') || 'Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Force logout even if API call fails
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className={`glass-effect shadow-xl border-b border-border sticky top-0 z-50 backdrop-blur-xl transition-all duration-500 ${scrolled ? 'bg-white/95 shadow-2xl' : 'bg-white/80'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group hover-scale magnetic-hover">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500 animate-pulse-color btn-3d">
                <img 
                  src={sahayakLogo} 
                  alt="Sahayak AI" 
                  className="h-full w-full object-contain animate-breathe"
                />
              </div>
              <span className="text-xl font-bold animate-gradient-text group-hover:scale-105 transition-all duration-300">
                {t('app.title')} ✨
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary px-3 py-2 rounded-md transition-all duration-300 hover-scale magnetic-hover"
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary px-3 py-2 rounded-md transition-all duration-300 hover-scale magnetic-hover"
              >
                {t('nav.about')}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 glass-effect px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2 animate-breathe">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.name}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse-color">
                    {user?.type}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-1 btn-3d hover-glow"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? t('common.loading') : t('nav.logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="btn-3d glass-effect hover-glow">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="btn-3d gradient-bg hover-glow">{t('nav.register')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}