const translations = {
  en: {
    // base
    aviationMeteorology: "Aviation Meteorology",
    airNavigation: "Air Navigation",
    communicationNavigationSurveillance:
      "Communication Navigation Surveillance",
    principlesOfFlight: "Principles of Flight",
    aircraftSystems: "Aircraft Systems",
    aeronauticalInformation: "Aeronautical Information",
    airTrafficServicesGeneral: "Air Traffic Services General",
    airspace: "Airspace",
    humanFactors: "Human Factors",
    generalAviation: "General Aviation",

    // professional
    aerodromeControl: "Aerodrome Control",
    approachControl: "Approach Control",
    approachRadarControl: "Approach Radar Control",
    areaControl: "Area Control",
    areaRadarControl: "Area Radar Control",
    flightService: "Flight Service",
    regionalOperationsMonitoring: "Regional Operations Monitoring",
    caacOperationsMonitoring: "CAAC Operations Monitoring",
    specialSkillAdsb: "Special Skill ADS-B",
    apronControl: "Apron Control",

    // english
    singleChoice: "Single Choice",
    readingComprehension: "Reading Comprehension",

    // common
    base: "Base Exam",
    professional: "Professional Exam",
    english: "English Exam",

    atc: "ATC",
    airport: "Airport",
    airline: "Airline",

    subject: "Subject",

    practice: "Practice",
    new: "new",
    sort: "Sort",
    sequence: "sequence",
    reverse: "Reverse",
    random: "Random",
    shuffle: "shuffle",
    review: "review",
    answer: "answer",

    // Practice Settings
    practiceSettings: "Practice Settings",
    questionOrder: "Question Order",
    practiceMode: "Practice Mode",
    answerDisplay: "Answer Display",
    autoJump: "Auto Jump to Next",
    autoJumpDesc: "Reduce steps, improve efficiency",
    optionOrder: "Option Order",
    shuffleOptions: "Shuffle Options",
    shuffleOptionsDesc: "Enable for random, disable for original order",
    showImmediately: "Show Immediately",
    showOnDemand: "Show On Demand",
    startPractice: "Start Practice",
    reviewMode: "Review Mode",
    reviewModeDesc: "Show correct answer and explanation directly",
    answerMode: "Answer Mode",
    answerModeDesc: "Check answer after answering",

    // Quiz Page
    loadingQuestions: "Loading questions...",
    noQuestions: "No questions available",
    questions: "questions",
    questionId: "Question ID",
    checkAnswer: "Check Answer",
    explanation: "Explanation",
    single: "Single Choice",
    multiple: "Multiple Choice",
    boolean: "True/False",
    noExplanation: "No explanation available",
  },

  zh: {
    // base
    aviationMeteorology: "航空气象",
    airNavigation: "空中导航",
    communicationNavigationSurveillance: "通信、导航和监视设备",
    principlesOfFlight: "飞行原理",
    aircraftSystems: "航空器及应用",
    aeronauticalInformation: "航空情报",
    airTrafficServicesGeneral: "空中交通管制一般规定",
    airspace: "空域",
    humanFactors: "人为因素",
    generalAviation: "通用航空",

    // professional
    aerodromeControl: "机场管制",
    approachControl: "进近管制",
    approachRadarControl: "进近雷达管制",
    areaControl: "区域管制",
    areaRadarControl: "区域雷达管制",
    flightService: "飞行服务",
    regionalOperationsMonitoring: "运行监控（地区）",
    caacOperationsMonitoring: "运行监控（民航局）",
    specialSkillAdsb: "特殊技能ADS-B",
    apronControl: "机坪管制",

    // english
    singleChoice: "单项选择",
    readingComprehension: "阅读理解",

    // common
    base: "基础题库",
    professional: "专业题库",
    english: "英文题库",
    atc: "空管",
    airport: "机场",
    airline: "航司",
    subject: "科目",

    home: "主页",
    practice: "练习",
    exam: "考试",
    profile: "我的",

    new: "新的练习",
    sort: "排序",
    sequence: "顺序",
    reverse: "逆序",
    random: "随机",
    shuffle: "乱序",
    review: "背题模式",
    answer: "答题模式",

    // Practice Settings
    practiceSettings: "练习设置",
    questionOrder: "习题顺序",
    practiceMode: "练习模式",
    answerDisplay: "答案显示方式",
    autoJump: "答对自动跳转下一题",
    autoJumpDesc: "减少操作步骤，提升刷题效率",
    optionOrder: "选项顺序",
    shuffleOptions: "打乱选项",
    shuffleOptionsDesc: "开启为乱序，关闭为原序",
    showImmediately: "立即显示答案",
    showOnDemand: "按需显示答案",
    startPractice: "开始练习",
    reviewMode: "背题模式",
    reviewModeDesc: "直接显示正确答案和解析",
    answerMode: "答题模式",
    answerModeDesc: "先作答后看解析",

    // Quiz Page
    loadingQuestions: "加载题目中...",
    noQuestions: "暂无题目",
    questions: "题",
    questionId: "题目编号",
    checkAnswer: "查看答案",
    explanation: "解析",
    single: "单选题",
    multiple: "多选题",
    boolean: "判断题",
    noExplanation: "暂无解析",
  },
};

// 获取当前语言
function getLanguage() {
  return localStorage.getItem("language") || "zh";
}

// 翻译函数
function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations.zh[key] || key;
}

// 设置语言
function setLanguage(lang) {
  localStorage.setItem("language", lang);
  window.dispatchEvent(new Event("languageChanged"));
}

// 获取语言列表
function getLanguages() {
  return Object.keys(translations);
}

// 导出
export { t, setLanguage, getLanguage, getLanguages };
export default { t, setLanguage, getLanguage, getLanguages };
