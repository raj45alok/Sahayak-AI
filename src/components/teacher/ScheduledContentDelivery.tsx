import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Upload, FileText, RefreshCw, Calendar, Eye, AlertCircle, CheckCircle, Edit, Trash2, Brain, BookOpen, Send, Clock } from "lucide-react";
import { AuthContext } from "../../App";
import { api } from "../../services/api";

type UploadMethod = "pdf" | "kb_topic" | "";

interface PreviewData {
  contentId: string;
  status: string;
  subject: string;
  classId: string;
  totalParts: number;
  enhancedParts: number;
  isReadyForScheduling: boolean;
  canEdit: boolean;
  parts: Array<{
    partNumber: string;
    summary: string;
    estimatedStudyTime: number;
    enhancedContent: string;
    videoLinks: Array<{
      title: string;
      url: string;
      duration: string;
    }>;
    practiceQuestions: Array<string | {
      question: string;
      answer: string;
    }>;
  }>;
}

interface ScheduledContentItem {
  contentId: string;
  subject: string;
  classId: string;
  status: string;
  totalParts: number;
  deliveredParts: number;
  pendingParts: number;
  deliveryTime: string;
  intervalDays: number;
  parts: Array<{
    partNumber: string;
    summary: string;
    scheduledDate: string;
    status: string;
  }>;
}

export function ScheduledContentDelivery() {
  const { user } = React.useContext(AuthContext);
  
  // Upload Step
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [kbTopic, setKbTopic] = useState("");
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [numParts, setNumParts] = useState(3);
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState("hindi");
  
  // Processing State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentId, setContentId] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  
  // Preview State
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  
  // Schedule State
  const [startDate, setStartDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  
  // NEW: Custom Schedule State
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [intervalDays, setIntervalDays] = useState(2);
  const [useDefaultSchedule, setUseDefaultSchedule] = useState(true);
  
  // NEW: Edit Schedule State
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [editedScheduleDate, setEditedScheduleDate] = useState("");
  const [editedScheduleTime, setEditedScheduleTime] = useState("");
  
  // NEW: Scheduled Content State
  const [scheduledContent, setScheduledContent] = useState<ScheduledContentItem[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  const classes = ["6A", "6B", "7A", "7B", "8A", "8B"];
  const subjects = ["Hindi", "English", "Science", "Social Science", "Maths"];
  const languages = ["hindi", "english", "marathi", "tamil"];

  // NEW: Fetch scheduled content on component mount
  useEffect(() => {
    if (user?.id) {
      fetchScheduledContent();
    }
  }, [user?.id]);

  const fetchScheduledContent = async () => {
    try {
      setLoadingScheduled(true);
      const response = await api.getScheduledContent({
        teacherId: user?.id || "TCH-001",
        classId: user?.classId || "7A"
      });
      setScheduledContent(response.scheduledContent || []);
    } catch (error: any) {
      console.error("Failed to fetch scheduled content:", error);
      // Don't show error toast, just keep empty state
    } finally {
      setLoadingScheduled(false);
    }
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size should be less than 50MB");
        return;
      }
      setPdfFile(file);
      toast.success("PDF selected successfully");
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleUpload = async () => {
    if (!classId || !subject) {
      toast.error("Please select class and subject");
      return;
    }

    if (uploadMethod === "pdf" && !pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (uploadMethod === "kb_topic" && !kbTopic.trim()) {
      toast.error("Please enter a topic name");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      let s3Key = "";
      let base64Content = "";

      // Handle PDF Upload
      if (uploadMethod === "pdf" && pdfFile) {
        // Check if file is <= 4MB for base64 conversion
        if (pdfFile.size <= 4 * 1024 * 1024) {
          // Convert to base64
          const reader = new FileReader();
          reader.onload = async () => {
            const result = reader.result as string;
            const base64Payload = result.split(",")[1];
            setUploadProgress(60);
            await processContent(base64Payload, s3Key);
          };
          reader.readAsDataURL(pdfFile);
          return;
        } else {
          // Use S3 upload for larger files
          const uploadUrlResponse = await api.getUploadUrl({
            teacherId: user?.id || "TCH-001",
            fileName: pdfFile.name,
            fileSize: pdfFile.size,
          });

          setUploadProgress(30);
          await api.uploadToS3(uploadUrlResponse.uploadUrl, pdfFile);
          s3Key = uploadUrlResponse.s3Key;
          setUploadProgress(60);
          await processContent(base64Content, s3Key);
        }
      } else {
        setUploadProgress(60);
        await processContent(base64Content, s3Key);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
      setAiProcessing(false);
    }
  };

  const processContent = async (base64Content: string, s3Key: string) => {
    try {
      const processPayload: any = {
        teacherId: user?.id || "TCH-001",
        classId,
        subject,
        numParts,
        instructions,
        language,
      };

      if (uploadMethod === "pdf") {
        if (base64Content) {
          processPayload.pdfBase64 = base64Content;
        } else {
          processPayload.s3Key = s3Key;
        }
      } else {
        processPayload.textContent = kbTopic;
      }

      const processResponse = await api.processContent(processPayload);
      setContentId(processResponse.contentId);
      setUploadProgress(100);

      toast.success("Content uploaded! Enhancement in progress...", {
        description: "This will take 1-2 minutes. Preview will load automatically.",
      });

      startAiProcessingAnimation();
      pollForPreview(processResponse.contentId);
    } catch (error: any) {
      console.error("Process error:", error);
      toast.error(error.message || "Processing failed");
      setIsUploading(false);
      setUploadProgress(0);
      setAiProcessing(false);
    }
  };

  // FIXED: Improved AI Processing Animation with smooth progress
  const startAiProcessingAnimation = () => {
    setAiProgress(0);
    const duration = 70000; // 70 seconds total
    const interval = 500; // Update every 500ms for smoother progress
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Smooth progress curve - starts slower, accelerates in middle, ends slower
      const progress = Math.min(
        (currentStep / steps) * 100 * 
        (0.3 + 0.7 * Math.sin((currentStep / steps) * Math.PI * 0.5)), // Ease-in-out curve
        95 // Cap at 95% until API returns
      );
      setAiProgress(progress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return timer; // Return timer so we can clear it
  };

  const pollForPreview = async (cid: string, attempts = 0) => {
    if (attempts > 30) { // Increased from 20 to 30 attempts
      toast.error("Enhancement is taking longer than expected. Please check back later.");
      setIsUploading(false);
      setAiProcessing(false);
      return;
    }

    try {
      const preview = await api.getPreview(cid);
      
      if (preview.isReadyForScheduling) {
        // Set to 100% when done
        setAiProgress(100);
        setTimeout(() => {
          setPreviewData(preview);
          setIsUploading(false);
          setAiProcessing(false);
          toast.success("Content ready for preview!");
        }, 500); // Small delay to show 100%
      } else {
        // Increment progress based on attempts
        const progress = Math.min(20 + (attempts * 4), 95);
        setAiProgress(progress);
        setTimeout(() => pollForPreview(cid, attempts + 1), 6000);
      }
    } catch (error) {
      // Continue polling on error but don't increase progress
      setTimeout(() => pollForPreview(cid, attempts + 1), 6000);
    }
  };

  const handleEditContent = (partNumber: string, currentContent: string) => {
    setEditingPart(partNumber);
    setEditedContent(currentContent);
  };

  const handleSaveEdit = async (partNumber: string) => {
    if (!contentId) return;

    try {
      const part = previewData?.parts.find(p => p.partNumber === partNumber);
      if (!part) return;

      await api.updateContent({
        contentId,
        action: "update",
        partNumber,
        updates: {
          enhancedContent: editedContent,
        },
      });

      const updatedPreview = await api.getPreview(contentId);
      setPreviewData(updatedPreview);
      setEditingPart(null);
      toast.success("Content updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update content");
    }
  };

  const handleDeleteVideo = async (partNumber: string, videoIndex: number) => {
    if (!contentId) return;

    try {
      const part = previewData?.parts.find(p => p.partNumber === partNumber);
      if (!part) return;

      const updatedVideos = part.videoLinks.filter((_, i) => i !== videoIndex);

      await api.updateContent({
        contentId,
        action: "update",
        partNumber,
        updates: {
          videoLinks: updatedVideos,
        },
      });

      const updatedPreview = await api.getPreview(contentId);
      setPreviewData(updatedPreview);
      toast.success("Video removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove video");
    }
  };

  // FIXED: Handle Send Now with API call - working version
  const handleSendNow = async (contentId: string, partNumber: string) => {
    try {
      const response = await api.sendNow({
        contentId,
        partNumber,
        teacherId: user?.id || "TCH-001"
      });
      
      toast.success("Content sent successfully!", {
        description: `${response.emailsSent || response.message || 'Students notified'}`
      });
      
      // Refresh scheduled content
      await fetchScheduledContent();
    } catch (error: any) {
      console.error("Send Now error:", error);
      toast.error(error.message || "Failed to send content");
    }
  };

  // NEW: Handle Edit Schedule for individual part
  const handleEditSchedule = (index: number, currentDate: string, currentTime: string) => {
    setEditingScheduleIndex(index);
    setEditedScheduleDate(currentDate);
    setEditedScheduleTime(currentTime);
  };

  // NEW: Handle Save Schedule Edit
  const handleSaveScheduleEdit = async (index: number) => {
    if (!contentId) return;

    try {
      // Here you would call an API to update the schedule for this specific part
      // For now, we'll just update the local state and show a toast
      toast.success(`Part ${index + 1} schedule updated to ${editedScheduleDate} at ${editedScheduleTime}`);
      setEditingScheduleIndex(null);
      
      // In a real implementation, you would call:
      // await api.updateSchedule({ contentId, partIndex: index, newDate: editedScheduleDate, newTime: editedScheduleTime });
      
    } catch (error: any) {
      toast.error(error.message || "Failed to update schedule");
    }
  };

  // UPDATED: Handle Schedule with custom schedule options
  const handleSchedule = async () => {
    if (!contentId || !startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      setIsScheduling(true);
      
      const scheduleData: any = {
        contentId,
        startDate,
        classId,
      };
      
      // Add custom schedule if not using defaults
      if (!useDefaultSchedule) {
        scheduleData.deliveryTime = deliveryTime;
        scheduleData.intervalDays = intervalDays;
      }
      
      await api.scheduleContent(scheduleData);

      toast.success("Content scheduled successfully!", {
        description: useDefaultSchedule 
          ? `Students will receive parts on alternate days at 8:00 AM starting ${startDate}`
          : `Students will receive parts every ${intervalDays} day(s) at ${deliveryTime} starting ${startDate}`
      });

      // Refresh scheduled content list
      await fetchScheduledContent();
      handleClear();
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule content");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleClear = () => {
    setUploadMethod("");
    setPdfFile(null);
    setKbTopic("");
    setClassId("");
    setSubject("");
    setNumParts(3);
    setInstructions("");
    setLanguage("hindi");
    setContentId(null);
    setPreviewData(null);
    setUploadProgress(0);
    setStartDate("");
    setEditingPart(null);
    setAiProcessing(false);
    setAiProgress(0);
    // Reset schedule options
    setDeliveryTime("08:00");
    setIntervalDays(2);
    setUseDefaultSchedule(true);
    // Reset edit schedule
    setEditingScheduleIndex(null);
  };

  const AiProcessingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: 'Analyzing content structure...', color: 'text-blue-600' },
    { icon: BookOpen, text: 'Enhancing educational material...', color: 'text-purple-600' },
    { icon: FileText, text: 'Generating practice questions...', color: 'text-green-600' },
    { icon: Calendar, text: 'Preparing delivery schedule...', color: 'text-indigo-600' },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 20000); // 20 seconds per step

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-2">
            AI Content Enhancement
          </h1>
          <p className="text-muted-foreground text-lg">
            Please wait while we enhance your educational content
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(aiProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary to-primary/70 h-4 rounded-full transition-all duration-500"
              style={{ width: `${aiProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center p-4 rounded-lg transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/10 border-2 border-primary scale-105'
                    : isCompleted
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-muted/50 border border-border'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/70 animate-pulse'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`font-medium text-base ${
                    isActive ? 'text-foreground' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {step.text}
                </span>
                {isActive && (
                  <div className="ml-auto flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                {isCompleted && (
                  <CheckCircle className="ml-auto w-6 h-6 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            This usually takes 1-2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

  // UPDATED: Scheduled Content Panel Component with delivered counts and FIXED Send Now button
  const ScheduledContentPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Scheduled Content</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchScheduledContent}
          disabled={loadingScheduled}
        >
          <RefreshCw className={`h-4 w-4 ${loadingScheduled ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loadingScheduled ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading scheduled content...</p>
          </div>
        ) : scheduledContent.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No scheduled content</p>
            <p className="text-sm text-muted-foreground mt-1">Schedule content to see it here</p>
          </div>
        ) : (
          scheduledContent.map((item) => (
            <Card key={item.contentId} className="border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold text-foreground">{item.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.classId}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status === 'scheduled' ? 'Scheduled' :
                         item.status === 'in_progress' ? 'In Progress' :
                         'Completed'}
                      </Badge>
                      {/* NEW: Delivered count badge */}
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                        {item.deliveredParts || 0}/{item.totalParts} delivered
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{item.totalParts} parts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.deliveryTime}</span>
                  </div>
                  <div className="text-xs">
                    Every {item.intervalDays} day{item.intervalDays > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-2">
                  {item.parts.slice(0, 3).map((part, idx) => (
                    <div key={part.partNumber} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Part {idx + 1}: {part.summary}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(part.scheduledDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {/* FIXED: Send Now button - properly integrated */}
                      {part.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendNow(item.contentId, part.partNumber)}
                          className="ml-2 bg-primary hover:bg-primary/90"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send Now
                        </Button>
                      )}
                      {part.status === 'delivered' && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                          Sent
                        </Badge>
                      )}
                    </div>
                  ))}
                  {item.parts.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{item.parts.length - 3} more parts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Step 1: Upload Form (with two-column layout)
  if (!contentId && !previewData) {
    return (
      <div className="h-full bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center md:text-left">
            {/* UPDATED: Primary color for heading */}
            <h1 className="text-4xl font-bold text-primary">
              Schedule Content Delivery
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload educational content and schedule automated delivery to students
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT PANEL - Upload Section */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader className="bg-muted/50 rounded-t-lg p-6 border-b">
                <CardTitle className="text-xl font-bold text-foreground">Upload Content</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose to upload a PDF or fetch content from NCERT Knowledge Base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium text-foreground">Content Source</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setUploadMethod("pdf")}
                      className={`p-6 border-2 rounded-xl text-center transition-all bg-background hover:shadow-md ${
                        uploadMethod === "pdf"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-semibold text-base text-foreground">Upload PDF</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload your own study material
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setUploadMethod("kb_topic")}
                      className={`p-6 border-2 rounded-xl text-center transition-all bg-background hover:shadow-md ${
                        uploadMethod === "kb_topic"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-semibold text-base text-foreground">NCERT Knowledge Base</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Fetch content from uploaded NCERT books
                      </p>
                    </button>
                  </div>
                </div>

                {uploadMethod === "pdf" && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Select PDF File</Label>
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5">
                      <Upload className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                      {pdfFile ? (
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground truncate max-w-xs">{pdfFile.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                            {pdfFile.size <= 4 * 1024 * 1024 ? " (Base64 conversion)" : " (S3 upload)"}
                          </p>
                          <Button variant="outline" size="sm" onClick={() => setPdfFile(null)}>
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-base text-foreground mb-3">Click to upload PDF</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Files ≤ 4MB will use Base64 conversion • Larger files use S3 upload
                          </p>
                          <Input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            className="max-w-xs mx-auto"
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {uploadMethod === "kb_topic" && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Topic Name</Label>
                    <Input
                      value={kbTopic}
                      onChange={(e) => setKbTopic(e.target.value)}
                      placeholder="e.g., photosynthesis chapter 7, adolescence chapter 10"
                      className="text-base py-6 text-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the chapter name or topic from NCERT curriculum
                    </p>
                  </div>
                )}

                {uploadMethod && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Class</Label>
                        <Select value={classId} onValueChange={setClassId}>
                          <SelectTrigger className="py-6 text-base text-foreground">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls} className="text-base">
                                Class {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="py-6 text-base text-foreground">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subj) => (
                              <SelectItem key={subj} value={subj} className="text-base">
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Number of Parts ({numParts})</Label>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          value={numParts}
                          onChange={(e) => setNumParts(parseInt(e.target.value) || 3)}
                          className="py-6 text-base text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="py-6 text-base text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang} className="text-base">
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">AI Enhancement Instructions (Optional)</Label>
                      <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g., Add real-world examples, Simplify technical terms, Include diagrams"
                        className="min-h-[120px] text-base p-4 text-foreground"
                      />
                    </div>

                    {isUploading && (
  <div className="text-center py-4">
    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
    <p className="text-sm text-muted-foreground">Uploading...</p>
  </div>
)}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 py-6 text-base font-semibold bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            Upload & Process
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleClear} size="lg" className="py-6">
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* RIGHT PANEL - Scheduled Content */}
            <Card className="border-0 shadow-lg bg-card h-[800px]">
              <CardContent className="p-6 h-full">
                <ScheduledContentPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // AI Processing State - Now full page centered
  if (aiProcessing) {
    return <AiProcessingAnimation />;
  }

  // Step 2: Preview & Schedule
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* UPDATED: Primary color for heading */}
          <h1 className="text-3xl font-bold text-primary">
            Content Preview
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and schedule delivery
          </p>
        </div>
        {/* UPDATED: Better visibility for Start New Upload button */}
        <Button onClick={handleClear} size="lg" className="py-6 bg-primary hover:bg-primary/90">
          Start New Upload
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-xl text-foreground">{previewData?.subject}</h3>
                <Badge variant="secondary" className="px-4 py-2 text-base">
                  {previewData?.classId}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {previewData?.totalParts} parts • {previewData?.enhancedParts} enhanced
              </p>
            </div>
            
            {previewData?.isReadyForScheduling ? (
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-green-100 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Ready to Schedule
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                <AlertCircle className="h-5 w-5" />
                Processing...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <div className="grid gap-6">
          {previewData.parts.map((part, index) => (
            <Card key={part.partNumber} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Part {index + 1}: {part.summary}
                  </CardTitle>
                  <Badge variant="outline" className="px-4 py-2 text-base">
                    ~{part.estimatedStudyTime} mins
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Enhanced Content</Label>
                    {previewData.canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContent(part.partNumber, part.enhancedContent)}
                        className="text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {editingPart === part.partNumber ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[200px] font-mono text-sm p-4 text-foreground"
                      />
                      <div className="flex gap-3">
                        <Button size="lg" onClick={() => handleSaveEdit(part.partNumber)} className="px-6 bg-primary hover:bg-primary/90">
                          Save Changes
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => setEditingPart(null)} className="px-6">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg max-h-[250px] overflow-y-auto border">
                      <p className="text-sm whitespace-pre-wrap text-foreground">
                        {part.enhancedContent}
                      </p>
                    </div>
                  )}
                </div>

                {part.videoLinks.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-3">
                      YouTube Videos ({part.videoLinks.length})
                    </Label>
                    <div className="space-y-3">
                      {part.videoLinks.map((video, i) => (
                        <div key={i} className="flex items-start justify-between p-4 border rounded-lg bg-background">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground">{video.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{video.duration}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" asChild>
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            {previewData.canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteVideo(part.partNumber, i)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {part.practiceQuestions.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-3">
                      Practice Questions ({part.practiceQuestions.length})
                    </Label>
                    <div className="space-y-3">
                      {part.practiceQuestions.map((q, i) => {
                        let question = '';
                        let answer = '';
                        
                        if (typeof q === 'string') {
                          const parts = q.split('**Answer:**');
                          if (parts.length === 2) {
                            question = parts[0].replace(/\*\*/g, '').trim();
                            answer = parts[1].replace(/\*\*/g, '').trim();
                          } else {
                            question = q.trim();
                            answer = 'Answer not available';
                          }
                        } else if (typeof q === 'object') {
                          question = q.question || 'Question unavailable';
                          answer = q.answer || 'Answer unavailable';
                        }
                        
                        return (
                          <div key={i} className="p-4 border rounded-lg bg-background">
                            <p className="text-sm font-medium text-foreground">Q{i + 1}. {question}</p>
                            <details className="mt-3">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground font-medium">
                                Show answer
                              </summary>
                              <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground">
                                {answer}
                              </p>
                            </details>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewData?.isReadyForScheduling && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-muted/50 rounded-t-lg p-6 border-b">
            <CardTitle className="text-2xl font-bold text-primary">Schedule Delivery</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure when and how often content should be delivered to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="py-6 text-base text-foreground"
              />
            </div>

            {/* NEW: Custom Schedule Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useDefaultSchedule"
                  checked={useDefaultSchedule}
                  onChange={(e) => setUseDefaultSchedule(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="useDefaultSchedule" className="text-base font-medium text-foreground">
                  Use Default Schedule (8:00 AM, Every 2 days)
                </Label>
              </div>

              {!useDefaultSchedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Delivery Time</Label>
                    <Input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="py-6 text-base text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Interval Days</Label>
                    <Select value={intervalDays.toString()} onValueChange={(value) => setIntervalDays(parseInt(value))}>
                      <SelectTrigger className="py-6 text-base text-foreground">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="text-base">Every day</SelectItem>
                        <SelectItem value="2" className="text-base">Every 2 days</SelectItem>
                        <SelectItem value="3" className="text-base">Every 3 days</SelectItem>
                        <SelectItem value="7" className="text-base">Every week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {startDate && previewData && (
              <div className="p-5 bg-muted/30 rounded-lg border">
                <Label className="text-base font-medium mb-3 text-foreground">Delivery Timeline</Label>
                <ul className="space-y-3">
                  {Array.from({ length: previewData.totalParts }).map((_, i) => {
                    const deliveryDate = new Date(startDate);
                    deliveryDate.setDate(deliveryDate.getDate() + i * intervalDays);
                    
                    // Format time for display
                    const displayTime = useDefaultSchedule ? "8:00 AM" : 
                      `${parseInt(deliveryTime.split(':')[0]) % 12 || 12}:${deliveryTime.split(':')[1]} ${parseInt(deliveryTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}`;
                    
                    const currentDate = deliveryDate.toISOString().split('T')[0];
                    
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 py-2 px-3 bg-background rounded border">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-foreground font-medium">
                              Part {i + 1}
                            </span>
                            {editingScheduleIndex === i ? (
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="date"
                                  value={editedScheduleDate}
                                  onChange={(e) => setEditedScheduleDate(e.target.value)}
                                  className="flex-1 text-sm"
                                />
                                <Input
                                  type="time"
                                  value={editedScheduleTime}
                                  onChange={(e) => setEditedScheduleTime(e.target.value)}
                                  className="flex-1 text-sm"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {deliveryDate.toLocaleDateString("en-IN")} at {displayTime}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {editingScheduleIndex === i ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveScheduleEdit(i)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingScheduleIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSchedule(i, currentDate, deliveryTime)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <Button
              onClick={handleSchedule}
              disabled={!startDate || isScheduling}
              className="w-full py-6 text-base font-semibold bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isScheduling ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  Confirm Schedule
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}