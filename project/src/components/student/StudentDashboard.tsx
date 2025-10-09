import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentDashboardHome } from './StudentDashboardHome';
import { StudentProfile } from './StudentProfile';
import { StudentAssignments } from './StudentAssignments';
import { StudentDoubts } from './StudentDoubts';
import { StudentProgress } from './StudentProgress';
import { StudentSchedule } from './StudentSchedule';
import { SidebarProvider } from '../ui/sidebar';

export function StudentDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/dashboard" element={<StudentDashboardHome />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/assignments" element={<StudentAssignments />} />
              <Route path="/doubts" element={<StudentDoubts />} />
              <Route path="/progress" element={<StudentProgress />} />
              <Route path="/schedule" element={<StudentSchedule />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}