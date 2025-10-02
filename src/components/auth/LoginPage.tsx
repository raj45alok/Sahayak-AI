import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AuthContext } from '../../App';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../i18n/LanguageContext';
import { authAPI } from '../../services/api';

export function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('teacher');
  const [animationClass, setAnimationClass] = useState('');
  
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimationClass('fade-in');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('auth.login.fillAllFields') || 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Try API call first, fallback to demo mode
      try {
        const response = await authAPI.login({ email, password, userType });
        const userData = response.data.user;
        login(userData);
        toast.success(`${t('auth.login.welcomeBack')}, ${userData.name}!`);
        
        if (userData.type === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } catch (apiError) {
        // Fallback to demo mode
        console.log('API not available, using demo mode');
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          name: userType === 'teacher' ? 'Dr. Sarah Wilson' : 'Alex Student',
          email: email,
          type: userType,
          ...(userType === 'teacher' && {
            classInfo: 'Grade 5 Mathematics',
            subjects: ['Mathematics', 'Science']
          }),
          ...(userType === 'student' && {
            grade: 'Grade 8',
            parentEmail: 'parent@example.com',
            parentPhone: '+91 9876543210'
          })
        };
        
        login(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        
        // Redirect based on user type
        if (userType === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('auth.login.error') || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      toast.info(t('auth.login.googleComingSoon') || 'Google Sign-In integration coming soon!');
      // Here you would integrate with Google OAuth
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed');
    }
  };

  return (
    <div className={`min-h-screen morphing-bg pattern-dots flex items-center justify-center p-4 ${animationClass}`}>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Image */}
        <div className="hidden lg:block slide-in-left">
          <div className="relative card-tilt">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
              alt="Students and teachers using technology"
              className="rounded-3xl shadow-2xl w-full h-auto hover-lift"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-3xl"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-20 animate-bounce-gentle"></div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto slide-in-right">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 mb-6 hover-scale magnetic-hover">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')}</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-gradient-text">{t('auth.login.title')}</h1>
            <p className="text-gray-600">{t('auth.login.subtitle')}</p>
          </div>

          <Card className="shadow-xl glass-effect card-tilt hover-lift">
            <CardHeader>
              <CardTitle className="animate-gradient-text">{t('nav.login')}</CardTitle>
              <CardDescription>
                Choose your account type and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={setUserType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 glass-effect">
                  <TabsTrigger value="teacher" className="flex items-center space-x-2 btn-3d">
                    <span>{t('auth.register.teacher')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="student" className="flex items-center space-x-2 btn-3d">
                    <span>{t('auth.register.student')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="teacher">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.login.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-breathe" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                          placeholder="teacher@school.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.login.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-breathe" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-3d gradient-bg hover-glow ripple-effect" 
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : `${t('nav.login')} ${t('auth.login.asTeacher')}`}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="student">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">{t('auth.login.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-breathe" />
                        <Input
                          id="student-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                          placeholder="student@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password">{t('auth.login.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-breathe" />
                        <Input
                          id="student-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 glass-effect transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-3d gradient-bg hover-glow ripple-effect" 
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : `${t('nav.login')} ${t('auth.login.asStudent')}`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.login.signInWith')}
                    </span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-4 btn-3d glass-effect hover-glow"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.login.google')}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline hover-scale magnetic-hover">
                  Register here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}