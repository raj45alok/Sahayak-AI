import axios from 'axios';

// API Base URLs - UPDATED WITH YOUR REAL API GATEWAY
const ASSIGNMENT_API_BASE = process.env.REACT_APP_API_URL || 'https://xvade97o7f.execute-api.us-east-1.amazonaws.com/prod';
const CONTENT_API_BASE = process.env.REACT_APP_CONTENT_API_URL || 'https://4x4vw766tf.execute-api.us-east-1.amazonaws.com/prod';
const DOUBT_API_BASE = process.env.REACT_APP_DOUBT_API_URL || 'https://wfwgkepe4c.execute-api.us-east-1.amazonaws.com/prod';
const PROFILE_API_BASE = 'https://z6agqqn0p5.execute-api.us-east-1.amazonaws.com/prod';
const STUDENTS_API_BASE = 'https://z6agqqn0p5.execute-api.us-east-1.amazonaws.com/prod';

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
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    
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

// ===== FETCH STUDENT EMAILS FROM DYNAMODB =====
async function getStudentEmailsByClass(className: string): Promise<string[]> {
  try {
    console.log(`📧 Fetching students for class: ${className}`);
    
    const url = `${STUDENTS_API_BASE}/students/by-class?classId=${encodeURIComponent(className)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.students) {
      const emails = data.students
        .map((s: any) => s.email)
        .filter((e: string) => e && e.includes('@'));
      
      console.log(`✅ Found ${emails.length} students with valid emails in ${className}`);
      return emails;
    }
    
    console.warn(`⚠️ No students found for class: ${className}`);
    return [];
    
  } catch (error) {
    console.error(`❌ Error fetching students for ${className}:`, error);
    return [];
  }
}

// ===== SAHAYAK API CLASS (Content & Doubts) =====
class SahayakAPI {
  private async request(baseUrl: string, endpoint: string, options: RequestInit = {}) {
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`🌐 Sahayak API: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error('❌ Sahayak API Error:', error);
      throw new Error(error.error || error.message || 'API request failed');
    }

    const data = await response.json();
    console.log('✅ Sahayak API Success:', data);
    return data;
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
    console.log('📤 Uploading to S3...');
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

    console.log('✅ S3 Upload complete');
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
    return {
      data: {
        totalStudents: 45,
        activeClasses: 3,
        scheduledContent: 5,
        pendingDoubts: 8,
      }
    };
  },
  
  generateWorksheet: async (data: any) => {
    return {
      data: {
        id: 'WS-' + Date.now(),
        content: 'Generated worksheet content',
        questions: [],
      }
    };
  },
  
  enhanceContent: (data: any) => api.post('/teacher/content/enhance', data),
  
  getPerformanceData: (classId?: string) => 
    api.get(`/teacher/performance${classId ? `?classId=${classId}` : ''}`),
  
  getDoubts: () => api.get('/teacher/doubts'),
  respondToDoubt: (doubtId: string, response: string) => 
    api.post(`/teacher/doubts/${doubtId}/respond`, { response }),
  
  scheduleContent: (data: any) => api.post('/teacher/schedule-content', data),
  
  uploadAssignment: async (data: { 
    title: string; 
    description: string; 
    deadline: string; 
    file: File 
  }) => {
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(data.file);
    });

    const payload = {
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      file: fileBase64
    };

    return api.post('/assignments', payload);
  },
  
  getAssignment: (assignmentId: string) => 
    api.get(`/assignments/${assignmentId}`),
  
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
    try {
      console.log('📝 Scheduling assignment for class:', assignmentData.className);
      
      const studentEmails = await getStudentEmailsByClass(assignmentData.className);
      
      if (studentEmails.length === 0) {
        const errorMsg = `No students with valid email addresses found in class: ${assignmentData.className}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`✅ Found ${studentEmails.length} students to notify`);
      
      const payload = {
        assignment_id: assignmentData.assignmentId,
        teacher_id: assignmentData.teacherId,
        due_date: assignmentData.dueDate,
        subject: assignmentData.subject,
        class_info: assignmentData.className,
        student_emails: studentEmails
      };
      
      console.log('📤 Sending to Lambda:', {
        ...payload,
        student_emails: `[${studentEmails.length} emails]`
      });
      
      const response = await api.post('/assignments/schedule', payload);
      
      console.log('✅ Assignment scheduled successfully');
      return response;
      
    } catch (error: any) {
      console.error('❌ Error scheduling assignment:', error);
      
      if (error.message?.includes('No students')) {
        throw new Error(`Cannot schedule assignment: ${error.message}. Please ensure students are enrolled in this class.`);
      }
      
      throw error;
    }
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
  
  // ===== NEW: Submit assignment via ProcessSubmission Lambda =====
  submitAssignment: async (data: {
    assignmentId: string;
    studentId: string;
    studentName: string;
    submissionType: 'google_forms' | 'file_upload';
    answers?: Array<{ question_number: number; answer_text: string }>;
    fileKey?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }) => {
    try {
      console.log('📝 Submitting assignment:', data.assignmentId);
      console.log('👤 Student:', data.studentName, `(${data.studentId})`);
      console.log('📋 Type:', data.submissionType);
      
      const response = await api.post('/submissions', {
        submission_type: data.submissionType,
        assignment_id: data.assignmentId,
        student_id: data.studentId,
        student_name: data.studentName,
        ...(data.submissionType === 'google_forms' && {
          answers: data.answers,
          form_id: 'direct_submission',
          response_id: `resp_${Date.now()}`
        }),
        ...(data.submissionType === 'file_upload' && {
          file_key: data.fileKey,
          file_name: data.fileName,
          file_type: data.fileType,
          file_size: data.fileSize
        })
      });
      
      console.log('✅ Submission successful:', response.data);
      return response;
      
    } catch (error: any) {
      console.error('❌ Submission failed:', error);
      throw error;
    }
  },
  
  // Legacy method for backward compatibility
  submitAssignmentFile: async (data: {
    assignmentId: string;
    file: File;
  }) => {
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(data.file);
    });

    const payload = {
      assignmentId: data.assignmentId,
      file: fileBase64
    };

    return api.post('/submissions/upload', payload);
  },
  
  getSubmissionResult: (submissionId: string) => 
    api.get(`/submissions/${submissionId}`),
  
  askDoubt: (data: any) => sahayakAPI.askDoubt(data),
  flagDoubt: (data: any) => sahayakAPI.flagDoubt(data),
  getStudentDoubts: (studentId: string) => sahayakAPI.getStudentDoubts(studentId),
  
  getContent: (classId: string) => sahayakAPI.getStudentContent(classId),
  
  getProgress: () => api.get('/student/progress'),
  
  getSchedule: () => api.get('/student/schedule'),
  
  joinClass: async (classId: string) => {
    return Promise.resolve({ success: true, classId });
  },
};

// ===== PROFILE API =====
export const profileAPI = {
  getStudentProfile: async (userId: string) => {
    console.log('👤 Fetching student profile:', userId);
    const response = await fetch(`${PROFILE_API_BASE}/profile/student?userId=${userId}`);
    const data = await response.json();
    return data;
  },
  
  getTeacherProfile: async (userId: string) => {
    console.log('👤 Fetching teacher profile:', userId);
    const response = await fetch(`${PROFILE_API_BASE}/profile/teacher?userId=${userId}`);
    const data = await response.json();
    return data;
  },
  
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

export { sahayakAPI as api };    