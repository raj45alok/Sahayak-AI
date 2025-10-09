import React, { useState, useEffect, useContext } from 'react';
import {
  Book,
  Printer,
  Clock,
  Video,
  HelpCircle,
  Calendar,
  BookOpen,
  ExternalLink,
  Play,
  ArrowRight,
  Bookmark,
  Languages,
} from 'lucide-react';
import { AuthContext } from '../../App';

const API_BASE = 'https://4x4vw766tf.execute-api.us-east-1.amazonaws.com/prod';

interface VideoLink {
  videoId: string;
  thumbnail: string;
  title: string;
  url: string;
  channelTitle: string;
}

interface ContentPart {
  partNumber: string;
  summary: string;
  enhancedContent: string;
  videoLinks: VideoLink[];
  practiceQuestions: string[];
  estimatedStudyTime: number;
}

interface Content {
  contentId: string;
  subject: string;
  topicName: string;
  totalParts: number;
  currentPart?: string;
  parts: ContentPart[];
  language: string;
  deliveredAt: string;
  downloadUrl: string | null;
  originalFileName: string;
}

type Language = 'en' | 'hi';

const translations = {
  en: {
    todaysLearning: "Today's Learning",
    contentDelivered: "Content delivered for Class",
    noLessons: "No Lessons Scheduled for Today",
    noLessonsDesc: "Your teacher hasn't scheduled any content for today. Take this time to review previous lessons or reach out if you need help!",
    checkTomorrow: "Check Back Tomorrow",
    checkTomorrowDesc: "New content is delivered daily",
    reviewPast: "Review Past Lessons",
    reviewPastDesc: "Reinforce what you've learned",
    viewContent: "View Content",
    print: "Print",
    save: "Save for later",
    unsave: "Unsave",
    saved: "Saved",
    minutes: "min",
    videos: "videos",
    questions: "Qs",
    summary: "Summary",
    fullContent: "Full Content",
    estimatedTime: "Estimated study time",
    recommendedVideos: "Recommended Videos",
    practiceQuestions: "Practice Questions",
    back: "Back",
    backToOverview: "Back to Overview",
    previousPart: "Previous Part",
    nextPart: "Next Part",
    part: "Part",
    clickToWatch: "Click to watch on YouTube",
  },
  hi: {
    todaysLearning: "आज का पाठ",
    contentDelivered: "कक्षा के लिए सामग्री वितरित",
    noLessons: "आज के लिए कोई पाठ निर्धारित नहीं",
    noLessonsDesc: "आपके शिक्षक ने आज के लिए कोई सामग्री निर्धारित नहीं की है। पिछले पाठों की समीक्षा करें या मदद के लिए संपर्क करें!",
    checkTomorrow: "कल फिर देखें",
    checkTomorrowDesc: "नई सामग्री प्रतिदिन वितरित की जाती है",
    reviewPast: "पिछले पाठों की समीक्षा करें",
    reviewPastDesc: "जो आपने सीखा है उसे मजबूत करें",
    viewContent: "सामग्री देखें",
    print: "प्रिंट करें",
    save: "बाद के लिए सहेजें",
    unsave: "हटाएं",
    saved: "सहेजा गया",
    minutes: "मिनट",
    videos: "वीडियो",
    questions: "प्रश्न",
    summary: "सारांश",
    fullContent: "पूर्ण सामग्री",
    estimatedTime: "अनुमानित अध्ययन समय",
    recommendedVideos: "अनुशंसित वीडियो",
    practiceQuestions: "अभ्यास प्रश्न",
    back: "वापस",
    backToOverview: "अवलोकन पर वापस",
    previousPart: "पिछला भाग",
    nextPart: "अगला भाग",
    part: "भाग",
    clickToWatch: "YouTube पर देखने के लिए क्लिक करें",
  },
};

const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_{1,2}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/^\s*[-•]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .trim();
};

const subjectImages: Record<string, string[]> = {
  Science: [
    'https://images.unsplash.com/photo-1576319155264-99536e0be1ee?w=500&q=80',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=80',
    'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=500&q=80',
    'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=500&q=80',
    'https://images.unsplash.com/photo-1582719471137-c3967ffb906f?w=500&q=80',
  ],
  Mathematics: [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80',
    'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=500&q=80',
    'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=500&q=80',
    'https://images.unsplash.com/photo-1632571401005-458e9d244591?w=500&q=80',
    'https://images.unsplash.com/photo-1611360932544-82e31a6f9c48?w=500&q=80',
  ],
  'Social Science': [
    'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=500&q=80',
    'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=500&q=80',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=500&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80',
  ],
  English: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=500&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
  ],
  Hindi: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=500&q=80',
  ],
  Default: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80',
  ],
};

const getSubjectImage = (subject: string, contentId: string): string => {
  const normalizedSubject = subject.trim();
  const images = subjectImages[normalizedSubject] || subjectImages['Default'];
  const hash = contentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % images.length;
  return images[index];
};

export function StudentContent() {
  const { user } = useContext(AuthContext);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedPart, setSelectedPart] = useState(0);
  const [showPrintView, setShowPrintView] = useState(false);
  const [savedContents, setSavedContents] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  useEffect(() => {
    fetchTodayContent();
  }, [language, user?.classId]);

  const fetchTodayContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/content/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: user?.classId || '7A',
          todayOnly: true,
          language: language === 'en' ? 'English' : 'Hindi',
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch content');

      const data = await response.json();
      setContents(data.content || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedContents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handlePrint = (content: Content) => {
    setSelectedContent(content);
    setShowPrintView(true);
    setTimeout(() => window.print(), 500);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    try {
      return new Date(dateString).toLocaleDateString(
        language === 'en' ? 'en-IN' : 'hi-IN',
        options
      );
    } catch {
      return new Date(dateString).toLocaleDateString('en-IN', options);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (selectedContent) {
    return (
      <ContentDetailPage
        content={selectedContent}
        selectedPart={selectedPart}
        onClose={() => setSelectedContent(null)}
        onPartChange={setSelectedPart}
        onPrint={() => handlePrint(selectedContent)}
        language={language}
        translations={t}
        toggleLanguage={toggleLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.todaysLearning}
            </h1>
            <p className="text-gray-600">
              Class {user?.classId || '7A'} • {formatDate(new Date().toISOString())}
            </p>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
            aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Languages className="h-4 w-4" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>

        {/* Print View */}
        {showPrintView && selectedContent && (
          <PrintableContent
            content={selectedContent}
            onClose={() => setShowPrintView(false)}
          />
        )}

        {/* Empty State */}
        {contents.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl shadow-sm p-12 border border-gray-200">
            <div className="text-center max-w-xl mx-auto">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t.noLessons}
              </h3>
              <p className="text-gray-600 mb-6">{t.noLessonsDesc}</p>
              <div className="flex gap-4 justify-center">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-48">
                  <Calendar className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900 text-sm">{t.checkTomorrow}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-48">
                  <Book className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900 text-sm">{t.reviewPast}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* COMPACT CARDS - ~50% shorter */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content, contentIdx) => {
              const part = content.parts[0];
              const partLabel = content.currentPart?.replace('PART-', '') || '1';
              const isSaved = savedContents.has(content.contentId);

              return (
                <div
                  key={`${content.contentId}-${contentIdx}`}
                  className="bg-white rounded-lg shadow border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setSelectedContent(content);
                    setSelectedPart(0);
                  }}
                  aria-label={`View content for ${content.subject}`}
                >
                  <div className="relative h-32 overflow-hidden"> {/* Fixed height instead of aspect-video */}
                    <img
                      src={getSubjectImage(content.subject, content.contentId)}
                      alt={content.subject}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-blue-600 font-semibold text-xs">
                        {content.subject}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleSave(content.contentId, e)}
                          className={`backdrop-blur-sm p-1 rounded transition-all ${
                            isSaved ? 'bg-yellow-400 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
                          }`}
                          title={isSaved ? t.unsave : t.save}
                          aria-label={isSaved ? t.unsave : t.save}
                        >
                          <Bookmark className={`h-3 w-3 ${isSaved ? 'fill-white' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(content);
                          }}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-blue-600 p-1 rounded transition-all"
                          title={t.print}
                          aria-label={t.print}
                        >
                          <Printer className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-xs font-semibold text-white drop-shadow-sm line-clamp-2">
                        {part.summary}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {t.part} {partLabel}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                        {content.language}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{formatDate(content.deliveredAt).split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{part.estimatedStudyTime} {t.minutes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3 text-gray-400" />
                        <span>{part.videoLinks.length} {t.videos}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                        <span>{part.practiceQuestions.length} {t.questions}</span>
                      </div>
                    </div>

                    <div className="pt-1 mt-1 border-t border-gray-100">
                      <div className="flex items-center justify-between text-blue-600 text-xs font-medium">
                        <span>{t.viewContent}</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Content Detail Page - FIXED STICKY HEADER
function ContentDetailPage({
  content,
  selectedPart,
  onClose,
  onPartChange,
  onPrint,
  language,
  translations: t,
  toggleLanguage,
}: {
  content: Content;
  selectedPart: number;
  onClose: () => void;
  onPartChange: (idx: number) => void;
  onPrint: () => void;
  language: Language;
  translations: typeof translations.en;
  toggleLanguage: () => void;
}) {
  const part = content.parts[selectedPart];
  const cleanedContent = cleanMarkdown(part.enhancedContent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED: Removed sticky positioning to prevent background overlay issues */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{content.subject}</h1>
              <p className="text-gray-600 text-sm mt-0.5">{part.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium flex items-center gap-1"
              >
                <Languages className="h-3 w-3" />
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>
              <button
                onClick={onPrint}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs font-medium flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                {t.print}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-medium"
              >
                {t.back}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Part Navigation */}
        {content.parts.length > 1 && (
          <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
            {content.parts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPartChange(idx)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPart === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.part} {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Summary Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r mb-4">
          <div className="flex items-start gap-2">
            <Book className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm mb-1">{t.summary}</h3>
              <p className="text-gray-700 text-sm">{part.summary}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{part.estimatedStudyTime} {t.minutes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t.fullContent}</h3>
          <div className="bg-white p-4 rounded border border-gray-200">
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {cleanedContent}
            </div>
          </div>
        </div>

        {/* Videos */}
        {part.videoLinks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-1">
              <Video className="h-4 w-4 text-blue-600" />
              {t.recommendedVideos}
            </h3>
            <div className="space-y-2">
              {part.videoLinks.map((video) => (
                <a
                  key={video.videoId}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-3 bg-white border border-gray-200 rounded hover:border-blue-400 hover:shadow transition-all"
                >
                  <div className="relative flex-shrink-0 w-24 h-16 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs mb-0.5 line-clamp-2 group-hover:text-blue-600 transition">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-600">{video.channelTitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Practice Questions */}
        {part.practiceQuestions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              {t.practiceQuestions}
            </h3>
            <div className="space-y-2">
              {part.practiceQuestions.map((question, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-100 rounded p-3">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-semibold text-xs">
                      {idx + 1}
                    </div>
                    <p className="flex-1 text-gray-800 text-xs leading-relaxed">
                      {cleanMarkdown(question)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="bg-white p-4 rounded border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium text-sm hover:bg-gray-300 transition"
            >
              ← {t.backToOverview}
            </button>
            <div className="flex gap-1">
              {selectedPart > 0 && (
                <button
                  onClick={() => onPartChange(selectedPart - 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition"
                >
                  ← {t.previousPart}
                </button>
              )}
              {selectedPart < content.parts.length - 1 && (
                <button
                  onClick={() => onPartChange(selectedPart + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition"
                >
                  {t.nextPart} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Printable Content
function PrintableContent({ content, onClose }: { content: Content; onClose: () => void }) {
  useEffect(() => {
    const handleAfterPrint = () => onClose();
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [onClose]);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .printable-content,
          .printable-content * {
            visibility: visible !important;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
        }
      `}</style>

      <div className="printable-content fixed inset-0 pointer-events-none opacity-0 print:opacity-100 print:pointer-events-auto">
        <div className="bg-white p-6">
          <div className="mb-4 border-b border-gray-300 pb-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{content.subject}</h1>
            <p className="text-gray-600 text-sm">
              Delivered: {new Date(content.deliveredAt).toLocaleDateString('en-IN')}
            </p>
            <p className="text-gray-600 text-sm">
              Part: {content.currentPart?.replace('PART-', '') || '1'} | Language: {content.language}
            </p>
          </div>

          {content.parts.map((part, idx) => (
            <div key={part.partNumber} className="mb-6 break-inside-avoid">
              <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                Part {idx + 1}
              </h2>

              <div className="mb-3 bg-gray-100 p-2 rounded">
                <p className="font-semibold text-xs text-gray-700 mb-1">Summary:</p>
                <p className="text-gray-800 text-sm">{part.summary}</p>
              </div>

              <div className="mb-3 leading-relaxed text-gray-800 whitespace-pre-line text-sm">
                {cleanMarkdown(part.enhancedContent)}
              </div>

              {part.videoLinks.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Recommended Videos:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {part.videoLinks.map((video) => (
                      <li key={video.videoId} className="text-gray-800">
                        {video.title} - {video.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {part.practiceQuestions.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Practice Questions:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {part.practiceQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="text-gray-800">{cleanMarkdown(q)}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}

          <div className="text-center text-xs text-gray-600 mt-6 pt-3 border-t border-gray-300">
            <p>Sahayak AI - AI-Powered Education Assistant</p>
          </div>
        </div>
      </div>
    </>
  );
}