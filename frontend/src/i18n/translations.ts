export type Language = 'en' | 'am';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Candidate Profile',
    'nav.jobs': 'Target Jobs',
    'nav.practice': 'Practice Mode',
    'nav.mock': 'Mock Interview',
    'nav.stories': 'Story Bank',
    'nav.memories': 'AI Memory Settings',
    'nav.settings': 'Settings',
    'nav.badge.ai_live': 'AI Live',
    'nav.platform_navigation': 'Platform Navigation',

    // Header & Navbar
    'header.title': 'AI Interview Coach',
    'header.memory_active': 'Memory Active',
    'header.subtitle': 'Personalized Preparation Engine',
    'header.sign_in': 'Sign In',
    'header.get_started': 'Get Started',
    'header.logout': 'Logout',

    // Settings Page
    'settings.title': 'Platform Settings',
    'settings.subtitle': 'Configure AI interview coach behavior, long-term memory permissions, language preferences, and evaluation settings.',
    'settings.success': 'Preferences saved successfully!',
    'settings.saving': 'Saving...',
    'settings.save': 'Save Settings',

    // Settings - Language Card
    'settings.lang.title': 'Language Settings / የቋንቋ ቅንብሮች',
    'settings.lang.desc': 'Select your preferred application interface and AI response language.',
    'settings.lang.label': 'Preferred Platform & AI Language',
    'settings.lang.en': 'English (Default)',
    'settings.lang.am': 'አማርኛ (Amharic)',

    // Settings - Memory Card
    'settings.memory.title': 'Personalized AI Memory',
    'settings.memory.desc': 'When enabled, the platform extracts key strengths, weak technical areas, and communication habits from your mock interviews to personalize future preparation sessions.',
    'settings.memory.enable_label': 'Enable Long-Term Candidate Memory',
    'settings.memory.enable_sub': 'Allows AI to recall historical performance and target weak areas',

    // Settings - Coaching Mode Card
    'settings.coach.title': 'Interview Coaching Mode',
    'settings.coach.immediate_label': 'Immediate Answer Feedback',
    'settings.coach.immediate_sub': 'Show breakdown & score after every question in Practice Mode',
    'settings.coach.model_label': 'Preferred AI Engine Model',

    // Settings - Voice Settings
    'settings.voice.title': 'Voice Interview Settings (Future Phase)',
    'settings.voice.enable_label': 'Enable Speech-to-Text Voice Answering',
    'settings.voice.enable_sub': 'Submit mock interview responses using your microphone',

    // Dashboard
    'dashboard.welcome': 'Welcome Back',
    'dashboard.overview': 'Personalized Interview Readiness Dashboard',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.practice_now': 'Practice Now',
    'dashboard.start_mock': 'Start Mock Interview',
    'dashboard.add_story': 'Add STAR Story',
    'dashboard.readiness_score': 'Interview Readiness Score',
    'dashboard.weaknesses': 'Target Focus Areas',
    'dashboard.recent_sessions': 'Recent Sessions',
    'dashboard.prep_plan': 'Personalized 7-Day Plan',
    'dashboard.view_plan': 'View Full Plan',
    'dashboard.no_plan': 'No active preparation plan yet. Upload a job posting to generate one.',

    // Common UI
    'common.status': 'Status',
    'common.active': 'ACTIVE',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
  },
  am: {
    // Navigation
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.profile': 'የተወዳዳሪ መገለጫ',
    'nav.jobs': 'የታለሙ ሥራዎች',
    'nav.practice': 'የልምምድ ሁኔታ',
    'nav.mock': 'የሙከራ ቃለ መጠይቅ',
    'nav.stories': 'የታሪክ ባንክ',
    'nav.memories': 'የኤአይ ማህደረ ትውስታ ቅንብሮች',
    'nav.settings': 'ቅንብሮች',
    'nav.badge.ai_live': 'ቀጥታ ኤአይ',
    'nav.platform_navigation': 'የመድረክ መላኪያ',

    // Header & Navbar
    'header.title': 'የኤአይ ቃለ መጠይቅ አሠልጣኝ',
    'header.memory_active': 'ማህደረ ትውስታ ንቁ ነው',
    'header.subtitle': 'ግላዊ የቃለ መጠይቅ ዝግጅት ሞተር',
    'header.sign_in': 'ግባ',
    'header.get_started': 'ጀምር',
    'header.logout': 'ውጣ',

    // Settings Page
    'settings.title': 'የመድረክ ቅንብሮች',
    'settings.subtitle': 'የኤአይ ቃለ መጠይቅ አሠልጣኝ ባህሪን፣ የረጅም ጊዜ ማህደረ ትውስታ ፈቃዶችን፣ የቋንቋ ምርጫዎችን እና የግምገማ ቅንብሮችን ያዋቅሩ።',
    'settings.success': 'ምርጫዎችዎ በተሳካ ሁኔታ ተቀምጠዋል!',
    'settings.saving': 'በማስቀመጥ ላይ...',
    'settings.save': 'ቅንብሮችን ያስቀምጡ',

    // Settings - Language Card
    'settings.lang.title': 'የቋንቋ ቅንብሮች / Language Settings',
    'settings.lang.desc': 'የመድረኩን መተግበሪያ እና የኤአይ ምላሽ ቋንቋ ይምረጡ።',
    'settings.lang.label': 'የተመረጠ የመድረክ እና ኤአይ ቋንቋ',
    'settings.lang.en': 'English (እንግሊዝኛ)',
    'settings.lang.am': 'አማርኛ (Amharic)',

    // Settings - Memory Card
    'settings.memory.title': 'ግላዊ የኤአይ ማህደረ ትውስታ',
    'settings.memory.desc': 'ይህ ሲነቃ መድረኩ ወደፊት የሚደረጉ የዝግጅት ክፍለ ጊዜዎችን ለማሻሻል ከሙከራ ቃለ መጠይቆችዎ ዋና ዋና ጥንካሬዎችን፣ የቴክኒክ ድክመቶችን እና የመግባቢያ ልምዶችን ያወጣል።',
    'settings.memory.enable_label': 'የተወዳዳሪ የረጅም ጊዜ ማህደረ ትውስታን አንቅት',
    'settings.memory.enable_sub': 'ኤአይ ያለፉትን አፈፃፀሞች እንዲያስታውስ እና ድክመቶችን እንዲያላምድ ያስችለዋል',

    // Settings - Coaching Mode Card
    'settings.coach.title': 'የቃለ መጠይቅ አሰልጣኝነት ሁኔታ',
    'settings.coach.immediate_label': 'የወዲያውኑ መልስ ግብረ-መልስ',
    'settings.coach.immediate_sub': 'በልምምድ ሁኔታ በእያንዳንዱ ጥያቄ በኋላ ውጤቱን እና ዝርዝሩን ያሳዩ',
    'settings.coach.model_label': 'የተመረጠው የኤአይ ሞዴል',

    // Settings - Voice Settings
    'settings.voice.title': 'የድምፅ ቃለ መጠይቅ ቅንብሮች (የወደፊት ምዕራፍ)',
    'settings.voice.enable_label': 'በድምፅ መልስ የመስጠት ዘዴን አንቅት',
    'settings.voice.enable_sub': 'የሙከራ ቃለ መጠይቅ መልሶችን በማይክሮፎንዎ ያስገቡ',

    // Dashboard
    'dashboard.welcome': 'እንኳን ደህና መጡ',
    'dashboard.overview': 'ግላዊ የቃለ መጠይቅ ዝግጅት ዳሽቦርድ',
    'dashboard.quick_actions': 'ፈጣን እርምጃዎች',
    'dashboard.practice_now': 'አሁን ይለማመዱ',
    'dashboard.start_mock': 'የሙከራ ቃለ መጠይቅ ጀምር',
    'dashboard.add_story': 'STAR ታሪክ አክል',
    'dashboard.readiness_score': 'የቃለ መጠይቅ ዝግጁነት ነጥብ',
    'dashboard.weaknesses': 'የታለሙ ትኩረት አቅጣጫዎች',
    'dashboard.recent_sessions': 'ቅርብ ጊዜ የተደረጉ ክፍለ ጊዜዎች',
    'dashboard.prep_plan': 'የ 7-ቀን ግላዊ የዝግጅት ዕቅድ',
    'dashboard.view_plan': 'ሙሉ ዕቅዱን ይመልከቱ',
    'dashboard.no_plan': 'እስካሁን ምንም ንቁ የዝግጅት ዕቅድ የለም። ዕቅድ ለማመንጨት የሥራ ማስታወቂያ ይስቀሉ።',

    // Common UI
    'common.status': 'ሁኔታ',
    'common.active': 'ንቁ',
    'common.view': 'ተመልከት',
    'common.edit': 'አርም',
    'common.delete': 'ሰርዝ',
    'common.cancel': 'ሰርዝ',
    'common.confirm': 'አረጋግጥ',
  }
};
