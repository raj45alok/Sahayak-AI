import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherDashboardHome } from './TeacherDashboardHome';
import { TeacherProfile } from './TeacherProfile';
import { WorksheetGenerator } from './WorksheetGenerator';
import { ContentEnhancer } from './ContentEnhancer';
import { ScheduledContentDelivery } from './ScheduledContentDelivery';
import { PerformanceTracker } from './PerformanceTracker';
import { DoubtSolverAI } from './DoubtSolverAI';
import { AssignmentManager } from './AssignmentManager';
import { AssignmentAnalytics } from './AssignmentAnalytics';
import { SidebarProvider } from '../ui/sidebar';

export function TeacherDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <TeacherSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="/dashboard" element={<TeacherDashboardHome />} />
              <Route path="/profile" element={<TeacherProfile />} />
              <Route path="/worksheet-generator" element={<WorksheetGenerator />} />
              <Route path="/content-enhancer" element={<ContentEnhancer />} />
              <Route path="/assignment-manager" element={<AssignmentManager />} />
              <Route path="/assignment-analytics" element={<AssignmentAnalytics />} />
              <Route path="/scheduled-content" element={<ScheduledContentDelivery />} />
              <Route path="/performance-tracker" element={<PerformanceTracker />} />
              <Route path="/doubt-solver" element={<DoubtSolverAI />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}