// src/i18n/translations.ts

export type TranslationKey = string; // Allow any string for flexibility

interface Translations {
  app: {
    title: string;
  };
  common: {
    back: string;
    loading: string;
  };
  nav: {
    home: string;
    about: string;
    login: string;
    logout: string;
    register: string;
  };
  language: {
    english: string;
    hindi: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      getStarted: string;
      learnMore: string;
    };
    features: {
      title: string;
      subtitle: string;
      aiPowered: string;
      aiPoweredDesc: string;
      personalized: string;
      personalizedDesc: string;
      comprehensive: string;
      comprehensiveDesc: string;
      accessible: string;
      accessibleDesc: string;
    };
    cta: {
      title: string;
      description: string;
      startTrial: string;
      signIn: string;
    };
  };
  about: {
    title: string;
    description: string;
    mission: {
      title: string;
      description: string;
    };
    vision: {
      title: string;
      description: string;
    };
    values: {
      title: string;
      innovation: string;
      innovationDesc: string;
      accessibility: string;
      accessibilityDesc: string;
      excellence: string;
      excellenceDesc: string;
    };
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      asTeacher: string;
      asStudent: string;
      signInWith: string;
      google: string;
      fillAllFields: string;
      welcomeBack: string;
      error: string;
      googleComingSoon: string;
    };
    register: {
      title: string;
      teacher: string;
      student: string;
      backToHome: string;
      joinSahayak: string;
      createAccountDesc: string;
      chooseAccountType: string;
      fillRequiredFields: string;
      provideClassInfo: string;
      fillStudentDetails: string;
      welcomeMessage: string;
      error: string;
      creating: string;
      createTeacherAccount: string;
      createStudentAccount: string;
    };
    logout: {
      success: string;
    };
  };
  teacher: {
    dashboard: {
      title: string;
    };
    sidebar: {
      dashboard: string;
      worksheets: string;
      contentEnhancer: string;
      schedule: string;
      performance: string;
      doubts: string;
    };
  };
}

export const translations: Record<'en' | 'hi', Translations> = {
  en: {
    app: {
      title: 'Sahayak AI'
    },
    common: {
      back: 'Back',
      loading: 'Loading...'
    },
    nav: {
      home: 'Home',
      about: 'About',
      login: 'Login',
      logout: 'Logout',
      register: 'Register'
    },
    language: {
      english: 'English',
      hindi: 'हिंदी'
    },
    home: {
      hero: {
        title: 'Transform Education with AI',
        subtitle: 'Empowering Teachers, Inspiring Students',
        description: 'Sahayak AI is your intelligent teaching assistant, helping create engaging content, track progress, and solve doubts instantly.',
        getStarted: 'Get Started',
        learnMore: 'Learn More'
      },
      features: {
        title: 'Why Choose Sahayak AI?',
        subtitle: 'Powerful features designed for modern education',
        aiPowered: 'AI-Powered Learning',
        aiPoweredDesc: 'Advanced AI adapts to each student\'s learning style',
        personalized: 'Personalized Experience',
        personalizedDesc: 'Customized content for every learner',
        comprehensive: 'Comprehensive Tools',
        comprehensiveDesc: 'Everything you need in one platform',
        accessible: '24/7 Accessible',
        accessibleDesc: 'Learn anytime, anywhere'
      },
      cta: {
        title: 'Ready to Transform Your Teaching?',
        description: 'Join thousands of teachers already using Sahayak AI',
        startTrial: 'Start Free Trial',
        signIn: 'Sign In'
      }
    },
    about: {
      title: 'About Sahayak AI',
      description: 'We are on a mission to revolutionize education through artificial intelligence.',
      mission: {
        title: 'Our Mission',
        description: 'To make quality education accessible to every student through innovative AI technology.'
      },
      vision: {
        title: 'Our Vision',
        description: 'A world where every student has access to personalized, quality education.'
      },
      values: {
        title: 'Our Values',
        innovation: 'Innovation',
        innovationDesc: 'Constantly pushing boundaries',
        accessibility: 'Accessibility',
        accessibilityDesc: 'Education for everyone',
        excellence: 'Excellence',
        excellenceDesc: 'Committed to quality'
      }
    },
    auth: {
      login: {
        title: 'Welcome Back',
        subtitle: 'Sign in to continue learning',
        email: 'Email',
        password: 'Password',
        asTeacher: 'as Teacher',
        asStudent: 'as Student',
        signInWith: 'Or sign in with',
        google: 'Continue with Google',
        fillAllFields: 'Please fill in all fields',
        welcomeBack: 'Welcome back',
        error: 'Login failed. Please try again.',
        googleComingSoon: 'Google Sign-In coming soon!'
      },
      register: {
        title: 'Create Account',
        teacher: 'Teacher',
        student: 'Student',
        backToHome: 'Back to Home',
        joinSahayak: 'Join Sahayak AI',
        createAccountDesc: 'Start your learning journey today',
        chooseAccountType: 'Choose your account type',
        fillRequiredFields: 'Please fill all required fields',
        provideClassInfo: 'Please provide class information',
        fillStudentDetails: 'Please fill all student details',
        welcomeMessage: 'Welcome',
        error: 'Registration failed. Please try again.',
        creating: 'Creating...',
        createTeacherAccount: 'Create Teacher Account',
        createStudentAccount: 'Create Student Account'
      },
      logout: {
        success: 'Logged out successfully'
      }
    },
    teacher: {
      dashboard: {
        title: 'Teacher Dashboard'
      },
      sidebar: {
        dashboard: 'Dashboard',
        worksheets: 'Worksheets',
        contentEnhancer: 'Content Enhancer',
        schedule: 'Schedule',
        performance: 'Performance',
        doubts: 'Doubt Solver'
      }
    }
  },
  hi: {
    app: {
      title: 'सहायक AI'
    },
    common: {
      back: 'वापस',
      loading: 'लोड हो रहा है...'
    },
    nav: {
      home: 'होम',
      about: 'हमारे बारे में',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      register: 'पंजीकरण'
    },
    language: {
      english: 'English',
      hindi: 'हिंदी'
    },
    home: {
      hero: {
        title: 'AI के साथ शिक्षा बदलें',
        subtitle: 'शिक्षकों को सशक्त बनाना, छात्रों को प्रेरित करना',
        description: 'सहायक AI आपका बुद्धिमान शिक्षण सहायक है, जो आकर्षक सामग्री बनाने, प्रगति ट्रैक करने और तुरंत संदेह हल करने में मदद करता है।',
        getStarted: 'शुरू करें',
        learnMore: 'और जानें'
      },
      features: {
        title: 'सहायक AI क्यों चुनें?',
        subtitle: 'आधुनिक शिक्षा के लिए शक्तिशाली सुविधाएँ',
        aiPowered: 'AI-संचालित शिक्षा',
        aiPoweredDesc: 'उन्नत AI प्रत्येक छात्र की सीखने की शैली के अनुकूल होता है',
        personalized: 'व्यक्तिगत अनुभव',
        personalizedDesc: 'हर शिक्षार्थी के लिए अनुकूलित सामग्री',
        comprehensive: 'व्यापक उपकरण',
        comprehensiveDesc: 'एक मंच में आपको चाहिए सब कुछ',
        accessible: '24/7 सुलभ',
        accessibleDesc: 'कभी भी, कहीं भी सीखें'
      },
      cta: {
        title: 'अपने शिक्षण को बदलने के लिए तैयार हैं?',
        description: 'हजारों शिक्षक पहले से ही सहायक AI का उपयोग कर रहे हैं',
        startTrial: 'निःशुल्क परीक्षण शुरू करें',
        signIn: 'साइन इन करें'
      }
    },
    about: {
      title: 'सहायक AI के बारे में',
      description: 'हम कृत्रिम बुद्धिमत्ता के माध्यम से शिक्षा में क्रांति लाने के मिशन पर हैं।',
      mission: {
        title: 'हमारा मिशन',
        description: 'नवीन AI तकनीक के माध्यम से हर छात्र के लिए गुणवत्तापूर्ण शिक्षा सुलभ बनाना।'
      },
      vision: {
        title: 'हमारी दृष्टि',
        description: 'एक ऐसी दुनिया जहाँ हर छात्र को व्यक्तिगत, गुणवत्तापूर्ण शिक्षा तक पहुँच हो।'
      },
      values: {
        title: 'हमारे मूल्य',
        innovation: 'नवाचार',
        innovationDesc: 'लगातार सीमाओं को आगे बढ़ाना',
        accessibility: 'सुलभता',
        accessibilityDesc: 'सभी के लिए शिक्षा',
        excellence: 'उत्कृष्टता',
        excellenceDesc: 'गुणवत्ता के लिए प्रतिबद्ध'
      }
    },
    auth: {
      login: {
        title: 'वापसी पर स्वागत है',
        subtitle: 'सीखना जारी रखने के लिए साइन इन करें',
        email: 'ईमेल',
        password: 'पासवर्ड',
        asTeacher: 'शिक्षक के रूप में',
        asStudent: 'छात्र के रूप में',
        signInWith: 'या इसके साथ साइन इन करें',
        google: 'Google के साथ जारी रखें',
        fillAllFields: 'कृपया सभी फ़ील्ड भरें',
        welcomeBack: 'वापसी पर स्वागत है',
        error: 'लॉगिन विफल। कृपया पुनः प्रयास करें।',
        googleComingSoon: 'Google साइन-इन जल्द आ रहा है!'
      },
      register: {
        title: 'खाता बनाएं',
        teacher: 'शिक्षक',
        student: 'छात्र',
        backToHome: 'होम पर वापस जाएं',
        joinSahayak: 'सहायक AI में शामिल हों',
        createAccountDesc: 'आज ही अपनी सीखने की यात्रा शुरू करें',
        chooseAccountType: 'अपना खाता प्रकार चुनें',
        fillRequiredFields: 'कृपया सभी आवश्यक फ़ील्ड भरें',
        provideClassInfo: 'कृपया कक्षा की जानकारी प्रदान करें',
        fillStudentDetails: 'कृपया सभी छात्र विवरण भरें',
        welcomeMessage: 'स्वागत है',
        error: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
        creating: 'बना रहे हैं...',
        createTeacherAccount: 'शिक्षक खाता बनाएं',
        createStudentAccount: 'छात्र खाता बनाएं'
      },
      logout: {
        success: 'सफलतापूर्वक लॉग आउट किया गया'
      }
    },
    teacher: {
      dashboard: {
        title: 'शिक्षक डैशबोर्ड'
      },
      sidebar: {
        dashboard: 'डैशबोर्ड',
        worksheets: 'वर्कशीट',
        contentEnhancer: 'सामग्री बढ़ाने वाला',
        schedule: 'अनुसूची',
        performance: 'प्रदर्शन',
        doubts: 'संदेह समाधानकर्ता'
      }
    }
  }
};

// Helper function to get nested translation values
export function getTranslation(
  lang: 'en' | 'hi',
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return key; // Return the key if translation not found
    }
  }
  
  return value;
}