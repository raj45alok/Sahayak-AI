import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../config/dynamodb.config';
import { v4 as uuidv4 } from 'uuid';

export const dynamoDBService = {
  // ==================== USERS TABLE ====================
  
  // Save user (Student or Teacher)
  saveUser: async (firebaseUser: any, userType: 'student' | 'teacher', additionalData?: any) => {
    const userId = userType === 'student' ? `STU-${uuidv4().slice(0, 8)}` : `TCH-${uuidv4().slice(0, 8)}`;
    
    const userData = {
      userId,
      firebaseUid: firebaseUser.uid, // Link to Firebase
      role: userType,
      name: firebaseUser.displayName || additionalData?.name || '',
      email: firebaseUser.email,
      phone: additionalData?.phone || '',
      createdAt: new Date().toISOString(),
      ...(userType === 'student' && {
        classId: additionalData?.classId || '',
      }),
      ...(userType === 'teacher' && {
        subjectSpecialization: additionalData?.subjectSpecialization || [],
      }),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: userData,
    }));

    return userData;
  },

  // Get user by Firebase UID
  getUserByFirebaseUid: async (firebaseUid: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'FirebaseUid-index', // You'll need to create this GSI
      KeyConditionExpression: 'firebaseUid = :uid',
      ExpressionAttributeValues: {
        ':uid': firebaseUid,
      },
    }));

    return result.Items?.[0];
  },

  // Get all students in a class (using GSI1)
  getStudentsByClass: async (classId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'GSI1', // classId → userId
      KeyConditionExpression: 'classId = :classId',
      FilterExpression: 'role = :role',
      ExpressionAttributeValues: {
        ':classId': classId,
        ':role': 'student',
      },
    }));

    return result.Items || [];
  },

  // Get all teachers (using GSI2)
  getAllTeachers: async () => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'GSI2', // role → userId
      KeyConditionExpression: 'role = :role',
      ExpressionAttributeValues: {
        ':role': 'teacher',
      },
    }));

    return result.Items || [];
  },

  // ==================== CONTENT TABLE ====================
  
  // Save scheduled lesson/enhanced note
  saveContent: async (contentData: {
    teacherId: string;
    classId: string;
    subject: string;
    s3Path: string;
    scheduleDate: string;
    enhancedS3Path?: string;
  }) => {
    const contentId = `CNT-${uuidv4().slice(0, 8)}`;
    
    const content = {
      contentId,
      SK: `${contentData.classId}#${contentData.subject}`,
      teacherId: contentData.teacherId,
      s3Path: contentData.s3Path,
      enhancedS3Path: contentData.enhancedS3Path || '',
      scheduleDate: contentData.scheduleDate,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.CONTENT,
      Item: content,
    }));

    return content;
  },

  // Get content by teacher (using GSI1)
  getContentByTeacher: async (teacherId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.CONTENT,
      IndexName: 'GSI1', // teacherId → contentId
      KeyConditionExpression: 'teacherId = :teacherId',
      ExpressionAttributeValues: {
        ':teacherId': teacherId,
      },
    }));

    return result.Items || [];
  },

  // ==================== WORKSHEETS TABLE ====================
  
  // Save worksheet
  saveWorksheet: async (worksheetData: {
    contentId: string;
    teacherId: string;
    classId: string;
    s3Path: string;
    metadata: any;
  }) => {
    const worksheetId = `WS-${uuidv4().slice(0, 8)}`;
    
    const worksheet = {
      worksheetId,
      SK: worksheetData.contentId,
      teacherId: worksheetData.teacherId,
      classId: worksheetData.classId,
      s3Path: worksheetData.s3Path,
      metadata: worksheetData.metadata,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.WORKSHEETS,
      Item: worksheet,
    }));

    return worksheet;
  },

  // Get worksheets by class (using GSI1)
  getWorksheetsByClass: async (classId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.WORKSHEETS,
      IndexName: 'GSI1', // classId → worksheetId
      KeyConditionExpression: 'classId = :classId',
      ExpressionAttributeValues: {
        ':classId': classId,
      },
    }));

    return result.Items || [];
  },

  // ==================== ASSIGNMENTS TABLE ====================
  
  // Create assignment
  createAssignment: async (assignmentData: {
    teacherId: string;
    classId: string;
    contentId: string;
    submissionDeadline: string;
  }) => {
    const assignmentId = `ASM-${uuidv4().slice(0, 8)}`;
    
    const assignment = {
      assignmentId,
      SK: assignmentData.classId,
      teacherId: assignmentData.teacherId,
      contentId: assignmentData.contentId,
      submissionDeadline: assignmentData.submissionDeadline,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.ASSIGNMENTS,
      Item: assignment,
    }));

    return assignment;
  },

  // Get assignments by teacher (using GSI1)
  getAssignmentsByTeacher: async (teacherId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.ASSIGNMENTS,
      IndexName: 'GSI1', // teacherId → assignmentId
      KeyConditionExpression: 'teacherId = :teacherId',
      ExpressionAttributeValues: {
        ':teacherId': teacherId,
      },
    }));

    return result.Items || [];
  },

  // ==================== SUBMISSIONS TABLE ====================
  
  // Submit assignment
  submitAssignment: async (submissionData: {
    assignmentId: string;
    studentId: string;
    submissionS3Path: string;
  }) => {
    const submission = {
      assignmentId: submissionData.assignmentId,
      SK: submissionData.studentId,
      submissionS3Path: submissionData.submissionS3Path,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: '',
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.SUBMISSIONS,
      Item: submission,
    }));

    return submission;
  },

  // Get submissions by student (using GSI1)
  getSubmissionsByStudent: async (studentId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.SUBMISSIONS,
      IndexName: 'GSI1', // studentId → assignmentId
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId,
      },
    }));

    return result.Items || [];
  },

  // Grade submission
  gradeSubmission: async (assignmentId: string, studentId: string, grade: number, feedback: string) => {
    await docClient.send(new UpdateCommand({
      TableName: TABLES.SUBMISSIONS,
      Key: { assignmentId, SK: studentId },
      UpdateExpression: 'SET grade = :grade, feedback = :feedback, gradedAt = :gradedAt',
      ExpressionAttributeValues: {
        ':grade': grade,
        ':feedback': feedback,
        ':gradedAt': new Date().toISOString(),
      },
    }));

    // Also update Performance table
    await dynamoDBService.savePerformance({
      studentId,
      metricType: 'assignment',
      metricId: assignmentId,
      score: grade,
      feedback,
    });
  },

  // ==================== PERFORMANCE TABLE ====================
  
  // Save performance metric
  savePerformance: async (performanceData: {
    studentId: string;
    metricType: string;
    metricId: string;
    score: number;
    feedback?: string;
  }) => {
    const performance = {
      studentId: performanceData.studentId,
      SK: `${performanceData.metricType}#${performanceData.metricId}`,
      score: performanceData.score,
      feedback: performanceData.feedback || '',
      date: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.PERFORMANCE,
      Item: performance,
    }));

    return performance;
  },

  // Get student performance
  getStudentPerformance: async (studentId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.PERFORMANCE,
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId,
      },
    }));

    return result.Items || [];
  },

  // ==================== DOUBT QUEUE TABLE ====================
  
  // Raise doubt
  raiseDoubt: async (doubtData: {
    studentId: string;
    question: string;
    aiAnswer?: string;
  }) => {
    const doubtId = `DBT-${uuidv4().slice(0, 8)}`;
    
    const doubt = {
      doubtId,
      SK: doubtData.studentId,
      question: doubtData.question,
      aiAnswer: doubtData.aiAnswer || '',
      status: doubtData.aiAnswer ? 'resolved' : 'flagged',
      teacherReview: '',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.DOUBT_QUEUE,
      Item: doubt,
    }));

    return doubt;
  },

  // Get flagged doubts (using GSI1)
  getFlaggedDoubts: async () => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.DOUBT_QUEUE,
      IndexName: 'GSI1', // status → doubtId
      KeyConditionExpression: 'status = :status',
      ExpressionAttributeValues: {
        ':status': 'flagged',
      },
    }));

    return result.Items || [];
  },

  // Get doubts by student (using GSI2)
  getDoubtsByStudent: async (studentId: string) => {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.DOUBT_QUEUE,
      IndexName: 'GSI2', // studentId → doubtId
      KeyConditionExpression: 'studentId = :studentId',
      ExpressionAttributeValues: {
        ':studentId': studentId,
      },
    }));

    return result.Items || [];
  },

  // Update doubt with teacher review
  updateDoubtReview: async (doubtId: string, studentId: string, teacherReview: string) => {
    await docClient.send(new UpdateCommand({
      TableName: TABLES.DOUBT_QUEUE,
      Key: { doubtId, SK: studentId },
      UpdateExpression: 'SET teacherReview = :review, status = :status',
      ExpressionAttributeValues: {
        ':review': teacherReview,
        ':status': 'resolved',
      },
    }));
  },
};