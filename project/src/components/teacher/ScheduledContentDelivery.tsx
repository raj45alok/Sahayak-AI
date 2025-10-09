import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  FileText,
  Send,
  Users,
  Settings,
  RefreshCw,
  X,
  Upload,
  Eye,
  File,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ContentSegment {
  id: string;
  text: string;
  files: UploadedFile[];
}

export function ScheduledContentDelivery() {
  const [contentToSegment, setContentToSegment] = useState("");
  const [numberOfSegments, setNumberOfSegments] = useState([3]);
  const [selectedStudents, setSelectedStudents] = useState<
    string[]
  >([]);
  const [distributionMethod, setDistributionMethod] =
    useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [segments, setSegments] = useState<ContentSegment[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState("segment");
  const [isGeneratingSegments, setIsGeneratingSegments] =
    useState(false);
  const [isSendingToStudents, setIsSendingToStudents] =
    useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const students = [
    {
      id: "1",
      name: "Sarah Johnson",
      grade: "Grade 5",
      section: "A",
      performance: "A",
    },
    {
      id: "2",
      name: "Michael Chen",
      grade: "Grade 5",
      section: "A",
      performance: "B+",
    },
    {
      id: "3",
      name: "Emma Davis",
      grade: "Grade 5",
      section: "A",
      performance: "A-",
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      grade: "Grade 5",
      section: "B",
      performance: "B",
    },
    {
      id: "5",
      name: "Olivia Wilson",
      grade: "Grade 5",
      section: "B",
      performance: "A",
    },
    {
      id: "6",
      name: "Jake Thompson",
      grade: "Grade 5",
      section: "B",
      performance: "C+",
    },
    {
      id: "7",
      name: "Mia Brown",
      grade: "Grade 6",
      section: "A",
      performance: "B-",
    },
    {
      id: "8",
      name: "Ryan Miller",
      grade: "Grade 6",
      section: "A",
      performance: "C",
    },
    {
      id: "9",
      name: "Sophia Lee",
      grade: "Grade 6",
      section: "B",
      performance: "A",
    },
    {
      id: "10",
      name: "Ethan Davis",
      grade: "Grade 6",
      section: "B",
      performance: "B+",
    },
    {
      id: "11",
      name: "Isabella Garcia",
      grade: "Grade 7",
      section: "A",
      performance: "A",
    },
    {
      id: "12",
      name: "Mason White",
      grade: "Grade 7",
      section: "A",
      performance: "B",
    },
  ];

  const distributionMethods = [
    "Send to All Students",
    "Send to Selected Students",
    "Send by Grade",
  ];

  const grades = [
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) uploaded successfully!`);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success("File removed successfully!");
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGenerateSegments = () => {
    if (!contentToSegment.trim() && uploadedFiles.length === 0) {
      toast.error("Please provide content or upload files to segment");
      return;
    }

    setIsGeneratingSegments(true);

    // Simulate AI segmentation
    setTimeout(() => {
      const contentLength = contentToSegment.length;
      const segmentLength = Math.floor(
        contentLength / numberOfSegments[0],
      );
      const newSegments: ContentSegment[] = [];

      // Distribute files across segments
      const filesPerSegment = Math.ceil(uploadedFiles.length / numberOfSegments[0]);

      for (let i = 0; i < numberOfSegments[0]; i++) {
        const start = i * segmentLength;
        const end =
          i === numberOfSegments[0] - 1
            ? contentLength
            : (i + 1) * segmentLength;
        let segmentContent = contentToSegment.slice(start, end);

        // Add segment headers and formatting if there's text content
        if (segmentContent.trim()) {
          segmentContent = `**Segment ${i + 1} of ${numberOfSegments[0]}**\n\n${segmentContent}\n\n---\n*This segment is part of a larger document. Continue to the next segment for complete understanding.*`;
        }

        // Distribute files across segments
        const segmentFiles = uploadedFiles.slice(
          i * filesPerSegment,
          (i + 1) * filesPerSegment
        );

        newSegments.push({
          id: Math.random().toString(36).substr(2, 9),
          text: segmentContent,
          files: segmentFiles
        });
      }

      setSegments(newSegments);
      setIsGeneratingSegments(false);
      toast.success(
        `Content divided into ${numberOfSegments[0]} segments successfully!`,
      );
    }, 1500);
  };

  const handleSendToStudents = () => {
    if (segments.length === 0) {
      toast.error("Please generate segments first");
      return;
    }

    if (!distributionMethod) {
      toast.error("Please select a distribution method");
      return;
    }

    if (
      distributionMethod === "Send to Selected Students" &&
      selectedStudents.length === 0
    ) {
      toast.error("Please select at least one student");
      return;
    }

    if (
      distributionMethod === "Send by Grade" &&
      !selectedGrade
    ) {
      toast.error("Please select a grade");
      return;
    }

    setIsSendingToStudents(true);

    // Simulate sending to students
    setTimeout(() => {
      let recipientCount = 0;
      if (distributionMethod === "Send to All Students") {
        recipientCount = students.length;
      } else if (
        distributionMethod === "Send to Selected Students"
      ) {
        recipientCount = selectedStudents.length;
      } else if (distributionMethod === "Send by Grade") {
        recipientCount = students.filter(
          (student) => student.grade === selectedGrade,
        ).length;
      }

      setIsSendingToStudents(false);

      if (scheduleDate && scheduleTime) {
        toast.success(
          `Content segments scheduled to be sent to ${recipientCount} students on ${scheduleDate} at ${scheduleTime}!`,
        );
      } else {
        toast.success(
          `Content segments sent to ${recipientCount} students successfully!`,
        );
      }
    }, 2000);
  };

  const handleStudentSelection = (
    studentId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(
        selectedStudents.filter((id) => id !== studentId),
      );
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const getFilteredStudents = () => {
    if (distributionMethod === "Send to All Students") {
      return students;
    } else if (
      distributionMethod === "Send to Selected Students"
    ) {
      return students.filter((student) =>
        selectedStudents.includes(student.id),
      );
    } else if (
      distributionMethod === "Send by Grade" &&
      selectedGrade
    ) {
      return students.filter(
        (student) => student.grade === selectedGrade,
      );
    }
    return [];
  };

  const handleClear = () => {
    setContentToSegment("");
    setSegments([]);
    setUploadedFiles([]);
    setSelectedStudents([]);
    setDistributionMethod("");
    setSelectedGrade("");
    setScheduleDate("");
    setScheduleTime("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Schedule Delivery System
          </h1>
          <p className="text-muted-foreground mt-1">
            Create content segments, upload files, and schedule delivery to
            students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            Smart Scheduling
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            Grade-wise Distribution
          </Badge>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="segment">
            Content & Files
          </TabsTrigger>
          <TabsTrigger value="distribute">
            Schedule & Distribute
          </TabsTrigger>
        </TabsList>

        {/* Create Segments Tab */}
        <TabsContent value="segment" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content & Segmentation
                </CardTitle>
                <CardDescription>
                  Add text content, upload files, and configure how to divide them
                  into segments for delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Content to Segment</Label>
                  <Textarea
                    value={contentToSegment}
                    onChange={(e) =>
                      setContentToSegment(e.target.value)
                    }
                    placeholder="Paste your lesson content, notes, or educational material here that you want to divide into segments..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Upload Files (All Types Supported)</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports documents, images, videos, audio, archives, and more
                      </p>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="max-w-xs mx-auto"
                        accept="*/*"
                      />
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files ({uploadedFiles.length})</Label>
                      <div className="max-h-[150px] overflow-y-auto space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {file.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    Number of Segments: {numberOfSegments[0]}
                  </Label>
                  <Slider
                    value={numberOfSegments}
                    onValueChange={setNumberOfSegments}
                    max={10}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>2 segments</span>
                    <span>10 segments</span>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    Segmentation Preview
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Your content will be divided into{" "}
                      <strong>
                        {numberOfSegments[0]} segments
                      </strong>
                      {contentToSegment.trim() && (
                        <>
                          . Each text segment will be approximately{" "}
                          <strong>
                            {Math.round(
                              contentToSegment.length /
                                numberOfSegments[0],
                            )}{" "}
                            characters
                          </strong>{" "}
                          long
                        </>
                      )}
                      .
                    </p>
                    {uploadedFiles.length > 0 && (
                      <p>
                        <strong>{uploadedFiles.length} files</strong> will be distributed
                        across the segments (~{Math.ceil(uploadedFiles.length / numberOfSegments[0])} files per segment).
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateSegments}
                  className="w-full"
                  disabled={
                    isGeneratingSegments ||
                    (!contentToSegment.trim() && uploadedFiles.length === 0)
                  }
                >
                  {isGeneratingSegments ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Segments...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Segments
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("distribute")}
                    disabled={segments.length === 0}
                  >
                    Continue to Distribution
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Segments</CardTitle>
                <CardDescription>
                  Preview of your content segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {segments.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {segments.map((segment, index) => (
                      <div
                        key={segment.id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            Segment {index + 1}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {segment.text.length} chars • {segment.files.length} files
                          </div>
                        </div>
                        
                        {segment.text.trim() && (
                          <div className="text-sm bg-muted p-2 rounded max-h-[100px] overflow-y-auto mb-2">
                            <pre className="whitespace-pre-wrap">
                              {segment.text.substring(0, 200)}...
                            </pre>
                          </div>
                        )}

                        {segment.files.length > 0 && (
                          <div className="space-y-1 mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Files:</p>
                            <div className="flex flex-wrap gap-1">
                              {segment.files.map((file) => (
                                <Badge
                                  key={file.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 text-xs"
                                >
                                  {getFileIcon(file.type)}
                                  {file.name.length > 20 
                                    ? `${file.name.substring(0, 17)}...` 
                                    : file.name
                                  }
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview Full
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">
                      No Segments Generated
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add content or upload files and click "Generate Segments"
                      to divide your material into manageable
                      parts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule & Distribute Tab */}
        <TabsContent value="distribute" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribution & Scheduling
                </CardTitle>
                <CardDescription>
                  Choose recipients and schedule delivery of
                  your content segments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Distribution Method</Label>
                  <Select
                    value={distributionMethod}
                    onValueChange={setDistributionMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select distribution method" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {distributionMethod === "Send by Grade" && (
                  <div className="space-y-2">
                    <Label>Select Grade</Label>
                    <Select
                      value={selectedGrade}
                      onValueChange={setSelectedGrade}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {distributionMethod ===
                  "Send to Selected Students" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Select Students</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={
                            selectedStudents.length ===
                            students.length
                          }
                          onCheckedChange={
                            handleSelectAllStudents
                          }
                          id="select-all"
                        />
                        <Label
                          htmlFor="select-all"
                          className="text-sm"
                        >
                          Select All
                        </Label>
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(
                              student.id,
                            )}
                            onCheckedChange={(checked) =>
                              handleStudentSelection(
                                student.id,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={student.id}
                            className="flex-1 text-sm"
                          >
                            {student.name} - {student.grade}{" "}
                            {student.section} (
                            {student.performance})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule Date (Optional)</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) =>
                        setScheduleDate(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule Time (Optional)</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) =>
                        setScheduleTime(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    Distribution Summary
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Segments: {segments.length}</li>
                    <li>
                      • Total Files: {segments.reduce((acc, segment) => acc + segment.files.length, 0)}
                    </li>
                    <li>
                      • Recipients:{" "}
                      {getFilteredStudents().length}
                    </li>
                    <li>
                      • Total messages:{" "}
                      {segments.length *
                        getFilteredStudents().length}
                    </li>
                    {scheduleDate && (
                      <li>
                        • Scheduled: {scheduleDate}{" "}
                        {scheduleTime && `at ${scheduleTime}`}
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={handleSendToStudents}
                  className="w-full"
                  disabled={
                    isSendingToStudents ||
                    segments.length === 0 ||
                    !distributionMethod
                  }
                >
                  {isSendingToStudents ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {scheduleDate
                        ? "Scheduling..."
                        : "Sending to Students..."}
                    </>
                  ) : (
                    <>
                      {scheduleDate ? (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Delivery
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </>
                      )}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("segment")}
                >
                  Back to Segments
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recipient List</CardTitle>
                <CardDescription>
                  Students who will receive the content segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {getFilteredStudents().map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.grade} {student.section} •
                          Performance: {student.performance}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">
                          {segments.length} segments
                        </Badge>
                        {segments.reduce((acc, segment) => acc + segment.files.length, 0) > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {segments.reduce((acc, segment) => acc + segment.files.length, 0)} files
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {distributionMethod &&
                    getFilteredStudents().length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">
                          No Recipients Selected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Please configure your distribution
                          method and select recipients.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}