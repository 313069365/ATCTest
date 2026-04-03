import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/practice',
    name: 'Practice',
    children: [
      {
        path: '',
        component: () => import('../views/practice/PracticePage.vue')
      },
      {
        path: 'quiz',
        name: 'Quiz',
        component: () => import('../views/practice/QuizPage.vue')
      },
      {
        path: 'history',
        name: 'PracticeHistory',
        component: () => import('../views/practice/PracticeHistory.vue')
      },
      {
        path: 'result/:id?',
        name: 'PracticeResult',
        component: () => import('../views/practice/PracticeResult.vue')
      }
    ]
  },
  {
    path: '/exam',
    name: 'Exam',
    children: [
      {
        path: '',
        component: () => import('../views/exam/ExamManage.vue')
      },
      {
        path: 'create',
        name: 'ExamCreate',
        component: () => import('../views/exam/ExamCreate.vue')
      },
      {
        path: 'paper/:id?',
        name: 'ExamPaper',
        component: () => import('../views/exam/ExamPaper.vue')
      },
      {
        path: 'result/:id?',
        name: 'ExamResult',
        component: () => import('../views/exam/ExamResult.vue')
      },
      {
        path: 'history',
        name: 'ExamHistory',
        component: () => import('../views/exam/ExamHistory.vue')
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router