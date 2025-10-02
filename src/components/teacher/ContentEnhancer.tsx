import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Sparkles, Upload, FileText, Download, RefreshCw, File, X, Send, Paperclip } from 'lucide-react';

type EnhancementType = 'Simplify Language' | 'Add Examples' | 'Include Visual Aids' | 'Add Interactive Elements' | 'Improve Structure' | 'Add Assessment Questions' | 'Make More Engaging' | 'Add Real-world Applications';

export function ContentEnhancer() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [enhancementType, setEnhancementType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const enhancementTypes: EnhancementType[] = [
    'Simplify Language',
    'Add Examples',
    'Include Visual Aids',
    'Add Interactive Elements',
    'Improve Structure',
    'Add Assessment Questions',
    'Make More Engaging',
    'Add Real-world Applications'
  ];

  const audiences = [
    'Elementary Students',
    'Middle School Students',
    'High School Students',
    'Advanced Learners',
    'Struggling Students',
    'Visual Learners',
    'Kinesthetic Learners'
  ];

  const supportedFileTypes = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    '.ppt', '.pptx', '.odp',
    '.xls', '.xlsx', '.ods',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp',
    '.mp4', '.avi', '.mov', '.wmv',
    '.mp3', '.wav', '.m4a',
    '.html', '.htm', '.xml'
  ];

  const handleFileUpload = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!supportedFileTypes.includes(fileExtension)) {
      toast.error(`File type ${fileExtension} is not supported. Please upload a valid file.`);
      return;
    }

    setUploadedFile(file);
    const sampleContent = generateSampleContentByFileType(fileExtension, file.name);
    setInputContent(sampleContent);
    toast.success(`File "${file.name}" uploaded successfully!`);
  };

  const generateSampleContentByFileType = (extension: string, fileName: string): string => {
    const sampleContents: Record<string, string> = {
      '.pdf': `# Mathematics: Introduction to Fractions
      
This document covers the fundamental concepts of fractions, including:

1. Understanding fractions as parts of a whole
2. Identifying numerators and denominators  
3. Comparing fractions
4. Adding and subtracting fractions
5. Real-world applications of fractions

Key concepts:
- A fraction represents a part of a whole
- The numerator tells us how many parts we have
- The denominator tells us how many equal parts the whole is divided into
- Equivalent fractions represent the same value`,

      '.doc': `Subject: Science - The Water Cycle
      
Lesson Objectives:
Students will understand the process of evaporation, condensation, and precipitation.

Content:
The water cycle is a continuous process that circulates water throughout Earth's atmosphere, land, and oceans. It consists of several key stages:

1. Evaporation: Water from oceans, lakes, and rivers turns into water vapor
2. Condensation: Water vapor cools and forms clouds
3. Precipitation: Water falls back to Earth as rain, snow, or hail
4. Collection: Water collects in bodies of water and the cycle repeats`,

      '.ppt': `Presentation: Ancient Civilizations
      
Slide 1: Introduction to Ancient Civilizations
- What makes a civilization?
- Key characteristics: writing, cities, government, religion

Slide 2: Mesopotamia
- Located between Tigris and Euphrates rivers
- First cities and writing system (cuneiform)
- Code of Hammurabi

Slide 3: Ancient Egypt
- Nile River civilization
- Hieroglyphic writing
- Pyramids and pharaohs`
    };

    return sampleContents[extension] || `Content extracted from ${fileName}

This is sample content that would normally be extracted from your uploaded file. The actual implementation would use appropriate libraries to read and extract text from various file formats.

File type: ${extension}
File name: ${fileName}

[Content would be displayed here based on the actual file contents]`;
  };

  const handlePostContent = () => {
    if (!enhancedContent.trim()) {
      toast.error('Please enhance content first before posting');
      return;
    }

    setIsPosting(true);
    
    setTimeout(() => {
      setIsPosting(false);
      toast.success('Enhanced content posted to student portal successfully!');
    }, 1500);
  };

  const handleEnhance = () => {
    if (!inputContent.trim()) {
      toast.error('Please enter content or upload a file to enhance');
      return;
    }

    if (!enhancementType || !targetAudience) {
      setShowSettings(true);
      toast.error('Please select enhancement type and target audience');
      return;
    }

    setIsEnhancing(true);

    setTimeout(() => {
      const enhanced = generateEnhancedContent(inputContent, enhancementType, targetAudience);
      setEnhancedContent(enhanced);
      setIsEnhancing(false);
      setInputContent('');
      setUploadedFile(null);
      toast.success('Content enhanced successfully!');
    }, 2000);
  };

  const generateEnhancedContent = (content: string, type: string, audience: string): string => {
    const enhancements: Partial<Record<EnhancementType, string>> = {
      'Simplify Language': `**Enhanced Content for ${audience}**

# Understanding Fractions (Simplified)

Fractions are like pieces of a pizza!

## What is a Fraction?
A fraction shows us parts of a whole thing. Think of it like this:
- If you have a pizza cut into 4 equal pieces
- And you eat 1 piece
- You ate 1/4 (one-fourth) of the pizza!

## The Two Parts of a Fraction:
1. **Top Number (Numerator)**: How many pieces you have
2. **Bottom Number (Denominator)**: How many pieces the whole thing is divided into

## Easy Examples:
- 1/2 = Half of something (like half a cookie)
- 1/4 = One piece out of four pieces
- 3/4 = Three pieces out of four pieces

## Fun Activity:
Try this at home! Cut an apple into 4 pieces. If you eat 2 pieces, what fraction did you eat? (Answer: 2/4 or 1/2!)

Remember: Fractions are everywhere - in cooking, sharing, and even in time!`,

      'Add Examples': `**Enhanced Content with Examples for ${audience}**

${content}

## Additional Examples:

### Real-World Fraction Examples:
1. **Cooking**: A recipe calls for 3/4 cup of flour
2. **Sports**: A basketball player made 7 out of 10 free throws (7/10)
3. **Time**: 15 minutes is 1/4 of an hour
4. **Money**: A quarter is 1/4 of a dollar

### Practice Problems:
1. If you eat 2 slices of a pizza that was cut into 8 slices, what fraction did you eat?
2. A class has 24 students. If 18 students passed the test, what fraction passed?
3. You read 50 pages of a 200-page book. What fraction have you completed?

### Visual Examples:
- Draw circles and divide them into equal parts
- Use pie charts to show different fractions
- Create fraction strips using paper`,

      'Include Visual Aids': `**Enhanced Content with Visual Learning for ${audience}**

${content}

## Visual Learning Tools:

### Fraction Charts and Diagrams:
- Use pie charts to show parts of a whole
- Create fraction bars for comparison
- Draw number lines with fraction markers

### Hands-On Activities:
- Fraction pizza cutouts
- Measuring cups for cooking fractions
- Colored blocks or tiles for visualization

### Interactive Elements:
- Online fraction games and simulators
- Virtual manipulatives for practice
- Fraction calculator tools

### Visual Memory Aids:
- Fraction vocabulary posters
- Step-by-step process charts
- Before and after comparison images`
    };

    return enhancements[type as EnhancementType] || `**Enhanced Content for ${audience}**

${content}

---
**Enhancement Applied:** ${type}
**Target Audience:** ${audience}

This content has been enhanced using AI to be more suitable for ${audience}. The enhancement focuses on ${type.toLowerCase()} to improve understanding and engagement.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedContent);
    toast.success('Enhanced content copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([enhancedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Enhanced content downloaded!');
  };

  const handleClear = () => {
    setInputContent('');
    setEnhancedContent('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-xl glass-effect border-2 border-primary/20 shadow-xl mb-6">
        <div>
          <h1 className="text-3xl font-bold animate-gradient-text">Content Enhancer</h1>
          <p className="text-muted-foreground mt-1">
            ChatGPT-style interface to enhance your content with AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {showSettings && (
          <Card className="w-80 glass-effect border-2 border-primary/20 shadow-xl">
            <CardHeader className="border-b-2 border-primary/10">
              <CardTitle className="text-lg">Enhancement Settings</CardTitle>
              <CardDescription>
                Configure AI preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Enhancement Type</Label>
                <Select value={enhancementType} onValueChange={setEnhancementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {enhancementTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleClear} variant="outline" className="w-full" size="sm">
                Clear All
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 glass-effect border-2 border-primary/20 shadow-xl flex flex-col min-h-0">
            <CardContent className="flex-1 flex flex-col p-6 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {enhancedContent && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">{enhancedContent}</pre>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCopy} variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-2" />
                            Copy
                          </Button>
                          <Button onClick={handleDownload} variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                          <Button
                            onClick={handlePostContent}
                            disabled={isPosting}
                            size="sm"
                          >
                            {isPosting ? (
                              <>
                                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-2" />
                                Post to Students
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {!enhancedContent && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Ready to Enhance</h3>
                      <p className="text-muted-foreground text-sm">
                        Type your content or upload a file to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                {uploadedFile && (
                  <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <File className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setInputContent('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isEnhancing}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={supportedFileTypes.join(',')}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                  <Textarea
                    ref={textareaRef}
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Type your content here or attach a file..."
                    className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEnhance();
                      }
                    }}
                  />
                  <Button
                    onClick={handleEnhance}
                    disabled={isEnhancing || !inputContent.trim()}
                    size="icon"
                  >
                    {isEnhancing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}