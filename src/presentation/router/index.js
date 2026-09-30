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
        component: () => import("../pages/session/QuizPage.vue"),
      },
      {
        path: "practice-history",
        name: "PracticeHistory",
        component: () => import("../pages/session/PracticeHistory.vue"),
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
        component: () => import("../pages/session/QuizPage.vue"),
      },
      {
        path: "result/:id?",
        name: "ExamResult",
        component: () => import("../pages/exam/ExamResult.vue"),
      },
      {
        path: "exam-history",
        name: "ExamHistory",
        component: () => import("../pages/session/ExamHistory.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/user/Login.vue"),
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
      {
        path: "/user-data",
        name: "UserData",
        component: () => import("../pages/user/UserData.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 导航守卫：检测登录状态
router.beforeEach((to, from) => {
  const currentUserId = localStorage.getItem("current_user_id");
  const isGuest = !currentUserId || currentUserId.startsWith("guest_");

  if (to.path === "/login") {
    // 正式用户访问 /login 时重定向到首页；游客可访问登录页
    if (currentUserId && !isGuest) {
      return "/";
    }
    return true;
  }

  // 未登录时跳转登录页
  if (!currentUserId) {
    return "/login";
  }

  return true;
});

export default router;
