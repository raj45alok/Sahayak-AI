import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentDashboardHome } from './StudentDashboardHome';
import { StudentProfile } from './StudentProfile';
import { SubmissionPortal } from './SubmissionPortal';
import { StudentAnalytics } from './StudentAnalytics';
import { StudentDoubts } from './StudentDoubts';
import { StudentSchedule } from './StudentSchedule';
import { SidebarProvider } from '../ui/sidebar';

export function StudentDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/dashboard" element={<div className="p-6"><StudentDashboardHome /></div>} />
            <Route path="/profile" element={<div className="p-6"><StudentProfile /></div>} />
            <Route path="/assignments" element={<SubmissionPortal />} />
            <Route path="/analytics" element={<div className="p-6"><StudentAnalytics /></div>} />
            <Route path="/doubts" element={<div className="p-6"><StudentDoubts /></div>} />
            <Route path="/schedule" element={<div className="p-6"><StudentSchedule /></div>} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}