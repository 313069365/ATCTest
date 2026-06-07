import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../views/search/Search.vue"),
  },
  {
    path: "/question/:id",
    name: "QuestionDetail",
    component: () => import("../views/search/QuestionDetail.vue"),
  },
  {
    path: "/practice",
    children: [
      {
        path: "",
        name: "Practice",
        component: () => import("../views/practice/PracticeHome.vue"),
      },
      {
        path: "quiz",
        name: "Quiz",
        component: () => import("../views/practice/QuizPage.vue"),
      },
      {
        path: "practice-history",
        name: "PracticeHistory",
        component: () => import("../views/practice/PracticeHistory.vue"),
      },
      {
        path: "result/:id?",
        name: "PracticeResult",
        component: () => import("../views/practice/PracticeResult.vue"),
      },
    ],
  },
  {
    path: "/exam",
    children: [
      {
        path: "",
        name: "Exam",
        component: () => import("../views/exam/ExamHome.vue"),
      },
      {
        path: "create",
        name: "ExamCreate",
        component: () => import("../views/exam/ExamCreate.vue"),
      },
      {
        path: "paper/:id?",
        name: "ExamPaper",
        component: () => import("../views/exam/ExamSession.vue"),
      },
      {
        path: "result/:id?",
        name: "ExamResult",
        component: () => import("../views/exam/ExamResult.vue"),
      },
      {
        path: "exam-history",
        name: "ExamHistory",
        component: () => import("../views/exam/ExamHistory.vue"),
      },
    ],
  },
  {
    path: "/aviation",
    name: "AviationPhonetics",
    component: () => import("../views/tools/AviationPhonetics.vue"),
  },
  {
    path: "/user",
    children: [
      {
        path: "/stats",
        name: "Stats",
        component: () => import("../views/user/Stats.vue"),
      },
      {
        path: "/profile",
        name: "Profile",
        component: () => import("../views/user/UserHome.vue"),
      },
      {
        path: "/wrongbook",
        name: "WrongBook",
        component: () => import("../views/user/WrongBook.vue"),
      },
      {
        path: "/favorites",
        name: "Favorites",
        component: () => import("../views/user/Favorites.vue"),
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("../views/user/Settings.vue"),
      },
      {
        path: "/data-management",
        name: "DataManagement",
        component: () => import("../views/user/DataManagement.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
