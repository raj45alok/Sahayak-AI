import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/home/HomePage';
import { AboutPage } from './components/about/AboutPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LanguageProvider } from './components/i18n/LanguageContext';
import { Toaster } from './components/ui/sonner';

// Simple auth context for demo purposes
export const AuthContext = React.createContext<{
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('sahayak_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('sahayak_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sahayak_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected route component
function ProtectedRoute({ children, userType }: { children: React.ReactNode; userType?: string }) {
  const { isAuthenticated, user } = React.useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userType && user?.type !== userType) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/teacher/*" 
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/*" 
                element={
                  <ProtectedRoute userType="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}