import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useLanguage } from './LanguageContext';
import { toast } from 'sonner';

// Define only the languages that are actually supported by setLanguage
type SupportedLanguage = 'en' | 'hi';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === language) return;
    
    setIsChanging(true);
    try {
      setLanguage(newLanguage);
      toast.success(
        newLanguage === 'hi' 
          ? 'भाषा हिंदी में बदल दी गई' 
          : 'Language changed to English'
      );
    } catch (error) {
      console.error('Language change error:', error);
      toast.error('Failed to change language');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 glass-effect btn-3d hover-glow"
          disabled={isChanging}
        >
          <Globe className={`h-4 w-4 ${isChanging ? 'animate-spin' : 'animate-breathe'}`} />
          <span className="hidden sm:inline">
            {language === 'en' ? t('language.english') : t('language.hindi')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`flex items-center gap-2 transition-all duration-300 hover-scale ${language === 'en' ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
          disabled={isChanging}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇺🇸</span>
            <span>{t('language.english')}</span>
          </div>
          {language === 'en' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse-color" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('hi')}
          className={`flex items-center gap-2 transition-all duration-300 hover-scale ${language === 'hi' ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
          disabled={isChanging}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇮🇳</span>
            <span>{t('language.hindi')}</span>
          </div>
          {language === 'hi' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse-color" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}