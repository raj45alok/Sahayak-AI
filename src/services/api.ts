import axios from 'axios';

// API Base URLs
const ASSIGNMENT_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const CONTENT_API_BASE = process.env.REACT_APP_CONTENT_API_URL || 'https://4x4vw766tf.execute-api.us-east-1.amazonaws.com/prod';
const DOUBT_API_BASE = process.env.REACT_APP_DOUBT_API_URL || 'https://wfwgkepe4c.execute-api.us-east-1.amazonaws.com/prod';
const PROFILE_API_BASE = 'https://z6agqqn0p5.execute-api.us-east-1.amazonaws.com/prod';

// Create axios instance with base configuration for assignments
const api = axios.create({
  baseURL: ASSIGNMENT_API_BASE,
  timeout: 120000, // 120 seconds (2 minutes) for AWS Lambda + Textract + Bedrock
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahayak_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sahayak_token');
      localStorage.removeItem('sahayak_user');
      window.location.href = '/login';
    }
    
    // Handle AWS API Gateway specific errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Lambda may need warmup');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper function to get student emails by class
// TODO: Replace with actual API call to your students database
function getStudentEmailsByClass(className: string): string[] {
  console.warn(`⚠️ Using mock student emails for ${className}. Implement actual student lookup.`);
  
  const mockStudents: Record<string, string[]> = {
    'Class 6': ['YOUR_EMAIL@gmail.com'],
    'Class 7': ['YOUR_EMAIL@gmail.com'],
    'Grade 8A': ['samarthtiwarij16@gmail.com'],
    'Class 8': ['YOUR_EMAIL@gmail.com'],
    'Class 9': ['YOUR_EMAIL@gmail.com'],
    'Class 10': ['YOUR_EMAIL@gmail.com'],
    'Class 11': ['YOUR_EMAIL@gmail.com'],
    'Class 12': ['YOUR_EMAIL@gmail.com'],
  };
  
  return mockStudents[className] || ['YOUR_EMAIL@gmail.com'];
}

// ===== SAHAYAK API CLASS (Content & Doubts) =====
class SahayakAPI {
  private async request(baseUrl: string, endpoint: string, options: RequestInit = {}) {
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'API request failed');
    }

    return response.json();
  }

  // ===== CONTENT DELIVERY API =====
  
  async getUploadUrl(data: {
    teacherId: string;
    fileName: string;
    fileSize: number;
  }) {
    return this.request(CONTENT_API_BASE, '/content/get-upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadToS3(presignedUrl: string, file: File) {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return response;
  }

  async processContent(data: {
    teacherId: string;
    classId: string;
    subject: string;
    numParts: number;
    pdfBase64?: string;
    s3Key?: string;
    textContent?: string;
    instructions?: string;
    language?: string;
  }) {
    return this.request(CONTENT_API_BASE, '/content/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPreview(contentId: string) {
    return this.request(CONTENT_API_BASE, '/content/preview', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    });
  }

  async updateContent(data: {
    contentId: string;
    action: 'update';
    partNumber: string;
    updates: {
      enhancedContent?: string;
      videoLinks?: any[];
      practiceQuestions?: any[];
      summary?: string;
    };
  }) {
    return this.request(CONTENT_API_BASE, '/content/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleContent(data: {
    contentId: string;
    startDate: string;
    classId: string;
    deliveryTime?: string;
    intervalDays?: number;
  }) {
    return this.request(CONTENT_API_BASE, '/content/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getScheduledContent(data: {
    teacherId: string;
    classId?: string;
  }) {
    return this.request(CONTENT_API_BASE, '/content/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentContent(classId: string) {
    return this.request(CONTENT_API_BASE, '/content/student', {
      method: 'POST',
      body: JSON.stringify({ classId }),
    });
  }

  async sendNow(data: {
    contentId: string;
    partNumber: string;
    teacherId: string;
  }) {
    return this.request(CONTENT_API_BASE, '/content/send-now', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== DOUBT SOLVER API =====
  
  async askDoubt(data: {
    studentId: string;
    subject: string;
    language: string;
    question: string;
  }) {
    return this.request(DOUBT_API_BASE, '/doubts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async flagDoubt(data: {
    doubtId: string;
    studentId: string;
    reason: string;
  }) {
    return this.request(DOUBT_API_BASE, '/doubts/flag', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentDoubts(studentId: string) {
    return this.request(DOUBT_API_BASE, `/doubts/student?studentId=${studentId}`, {
      method: 'GET',
    });
  }

  async getFlaggedDoubts(teacherId: string) {
    return this.request(DOUBT_API_BASE, `/doubts/flagged?teacherId=${teacherId}`, {
      method: 'GET',
    });
  }

  async resolveDoubt(data: {
    doubtId: string;
    studentId: string; 
    teacherId: string;
    teacherResponse: string;
  }) {
    return this.request(DOUBT_API_BASE, '/doubts/resolve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create instance
export const sahayakAPI = new SahayakAPI();

// ===== AUTH API =====
export const authAPI = {
  login: (credentials: { email: string; password: string; userType: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// ===== TEACHER API =====
export const teacherAPI = {
  getDashboardData: async () => {
    // Demo data until you implement real dashboard API
    return {
      data: {
        totalStudents: 45,
        activeClasses: 3,
        scheduledContent: 5,
        pendingDoubts: 8,
      }
    };
  },
  
  // Worksheet generation
  generateWorksheet: async (data: any) => {
    return {
      data: {
        id: 'WS-' + Date.now(),
        content: 'Generated worksheet content',
        questions: [],
      }
    };
  },
  
  // Content enhancement
  enhanceContent: (data: any) => api.post('/teacher/content/enhance', data),
  
  // Performance analytics
  getPerformanceData: (classId?: string) => 
    api.get(`/teacher/performance${classId ? `?classId=${classId}` : ''}`),
  
  // Doubts management
  getDoubts: () => api.get('/teacher/doubts'),
  respondToDoubt: (doubtId: string, response: string) => 
    api.post(`/teacher/doubts/${doubtId}/respond`, { response }),
  
  // Content scheduling (legacy compatibility)
  scheduleContent: (data: any) => api.post('/teacher/schedule-content', data),
  
  // Assignment endpoints - FIXED for AWS Lambda
  uploadAssignment: async (data: { 
    title: string; 
    description: string; 
    deadline: string; 
    file: File 
  }) => {
    // Convert file to base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(data.file);
    });

    // Send as JSON (not FormData)
    const payload = {
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      file: fileBase64
    };

    return api.post('/assignments', payload);
  },
  
  // Get assignment by ID (for polling)
  getAssignment: (assignmentId: string) => 
    api.get(`/assignments/${assignmentId}`),
  
  // Schedule assignment - FIXED to match Lambda expectations and include teacher_id
  scheduleAssignment: async (assignmentData: {
    assignmentId: string;
    teacherId: string;
    title: string;
    subject: string;
    className: string;
    dueDate: string;
    instructions: string;
    notifyStudents: boolean;
    reminderSettings: any;
    answerKey: any[];
  }) => {
    // Get student emails for the class
    const studentEmails = getStudentEmailsByClass(assignmentData.className);
    
    console.log('Student emails for notification:', studentEmails);
    
    // Transform to match ScheduleAssignment-dev Lambda expectations (snake_case)
    const payload = {
      assignment_id: assignmentData.assignmentId,
      teacher_id: assignmentData.teacherId,
      due_date: assignmentData.dueDate,
      subject: assignmentData.subject,
      class_info: assignmentData.className,
      student_emails: studentEmails
    };
    
    console.log('Scheduling assignment with payload:', payload);
    
    return api.post('/assignments/schedule', payload);
  },
  
  evaluateAssignment: (assignmentId: string) => 
    api.post(`/evaluate/${assignmentId}`),
  
  getAssignmentResults: (assignmentId: string) => 
    api.get(`/evaluations/${assignmentId}/results`),
  
  generateStudentReport: (data: any) => 
    api.post('/reports/student', data),
  
  generateClassReport: (data: any) => 
    api.post('/reports/class', data),
};

// ===== STUDENT API =====
export const studentAPI = {
  getDashboardData: async () => {
    // Demo data until you implement real dashboard API
    return {
      data: {
        todayContent: null,
        recentContent: [],
        completedLessons: 12,
        questionsSolved: 45,
        avgScore: 78,
      }
    };
  },
  
  getAssignments: () => api.get('/student/assignments'),
  
  submitAssignment: (assignmentId: string, data: any) => 
    api.post(`/student/assignments/${assignmentId}/submit`, data),
  
  // Submit assignment via file upload - FIXED for AWS Lambda
  submitAssignmentFile: async (data: {
    assignmentId: string;
    file: File;
  }) => {
    // Convert file to base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(data.file);
    });

    // Send as JSON
    const payload = {
      assignmentId: data.assignmentId,
      file: fileBase64
    };

    return api.post('/submissions/upload', payload);
  },
  
  // Get submission results
  getSubmissionResult: (submissionId: string) => 
    api.get(`/submissions/${submissionId}`),
  
  // Doubts (using SahayakAPI)
  askDoubt: (data: any) => sahayakAPI.askDoubt(data),
  flagDoubt: (data: any) => sahayakAPI.flagDoubt(data),
  getStudentDoubts: (studentId: string) => sahayakAPI.getStudentDoubts(studentId),
  
  // Content (using SahayakAPI)
  getContent: (classId: string) => sahayakAPI.getStudentContent(classId),
  
  getProgress: () => api.get('/student/progress'),
  
  getSchedule: () => api.get('/student/schedule'),
  
  joinClass: async (classId: string) => {
    return Promise.resolve({ success: true, classId });
  },
};

// ===== PROFILE API =====
export const profileAPI = {
  // Profile endpoints
  getStudentProfile: async (userId: string) => {
    const response = await fetch(`${PROFILE_API_BASE}/profile/student?userId=${userId}`);
    const data = await response.json();
    return data;
  },
  
  getTeacherProfile: async (userId: string) => {
    const response = await fetch(`${PROFILE_API_BASE}/profile/teacher?userId=${userId}`);
    const data = await response.json();
    return data;
  },
  
  // Dashboard endpoints
  getStudentDashboard: async (userId: string) => {
    const response = await fetch(`${PROFILE_API_BASE}/profile/dashboard/student?userId=${userId}`);
    const data = await response.json();
    return data;
  },
  
  getTeacherDashboard: async (userId: string) => {
    const response = await fetch(`${PROFILE_API_BASE}/profile/dashboard/teacher?userId=${userId}`);
    const data = await response.json();
    return data;
  },
};

// Export the SahayakAPI instance for direct access if needed
export { sahayakAPI as api };