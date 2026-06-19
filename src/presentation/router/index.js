import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/home/Home.vue"),
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../pages/search/Search.vue"),
  },
  {
    path: "/question/:id",
    name: "QuestionDetail",
    component: () => import("../pages/search/QuestionDetail.vue"),
  },
  {
    path: "/practice",
    children: [
      {
        path: "",
        name: "Practice",
        component: () => import("../pages/practice/PracticeHome.vue"),
      },
      {
        path: "quiz",
        name: "Quiz",
        component: () => import("../pages/practice/QuizPage.vue"),
      },
      {
        path: "practice-history",
        name: "PracticeHistory",
        component: () => import("../pages/practice/PracticeHistory.vue"),
      },
      {
        path: "result/:id?",
        name: "PracticeResult",
        component: () => import("../pages/practice/PracticeResult.vue"),
      },
    ],
  },
  {
    path: "/exam",
    children: [
      {
        path: "",
        name: "Exam",
        component: () => import("../pages/exam/ExamHome.vue"),
      },
      {
        path: "create",
        name: "ExamCreate",
        component: () => import("../pages/exam/ExamCreate.vue"),
      },
      {
        path: "paper/:id?",
        name: "ExamPaper",
        component: () => import("../pages/practice/QuizPage.vue"),
      },
      {
        path: "result/:id?",
        name: "ExamResult",
        component: () => import("../pages/exam/ExamResult.vue"),
      },
      {
        path: "exam-history",
        name: "ExamHistory",
        component: () => import("../pages/exam/ExamHistory.vue"),
      },
    ],
  },
  {
    path: "/user",
    children: [
      {
        path: "/stats",
        name: "Stats",
        component: () => import("../pages/user/Stats.vue"),
      },
      {
        path: "/profile",
        name: "Profile",
        component: () => import("../pages/user/UserHome.vue"),
      },
      {
        path: "/wrongbook",
        name: "WrongBook",
        component: () => import("../pages/collection/WrongBook.vue"),
      },
      {
        path: "/favorites",
        name: "Favorites",
        component: () => import("../pages/collection/Favorites.vue"),
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("../pages/user/Settings.vue"),
      },
      {
        path: "/data-management",
        name: "DataManagement",
        component: () => import("../pages/user/DataManagement.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
