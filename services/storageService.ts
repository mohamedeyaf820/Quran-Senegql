
import { User, ClassGroup, Content, EnrollmentRequest, UserRole, EnrollmentStatus, Quiz, QuizAttempt, LiveSession, Notification, SubscriptionPlan, ForumPost, Resource, BADGES_LIST } from '../types';

const KEYS = {
  USERS: 'qs_users',
  CLASSES: 'qs_classes',
  CONTENT: 'qs_content',
  ENROLLMENTS: 'qs_enrollments',
  CURRENT_USER: 'qs_current_user',
  PROGRESS: 'qs_progress',
  QUIZZES: 'qs_quizzes',
  ATTEMPTS: 'qs_attempts',
  LIVES: 'qs_lives',
  NOTIFICATIONS: 'qs_notifications',
  FORUM: 'qs_forum',
  RESOURCES: 'qs_resources'
};

const get = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    alert("Stockage local saturé ! Impossible de sauvegarder. Essayez de supprimer du contenu volumineux.");
    console.error(e);
  }
};

const simulateEmail = (to: string, subject: string, body: string) => {
    console.log(`%c[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`, 'color: cyan; font-weight: bold;');
    console.log(body);
};

export const storageService = {
  init: () => {
    const users = get<User>(KEYS.USERS);
    if (users.length === 0) {
      const admin: User = {
        id: 'admin-001',
        firstName: 'Admin',
        lastName: 'Principal',
        email: 'admin@quransn.com',
        phone: '000000000',
        password: 'admin123',
        role: UserRole.ADMIN,
        gender: 'Homme',
        joinedAt: new Date().toISOString(),
        xp: 0,
        level: 99,
        badges: [],
        subscriptionPlan: SubscriptionPlan.PREMIUM_YEARLY,
        referralCode: 'ADMIN'
      };
      set(KEYS.USERS, [admin]);
    }
    
    // Init Mock Resources if empty
    const resources = get<Resource>(KEYS.RESOURCES);
    if (resources.length === 0) {
        set(KEYS.RESOURCES, [
            { id: 'r1', title: 'Sourate Al-Fatiha Tafsir', category: 'TAFSIR', content: 'Explication détaillée des 7 versets de la mère du livre...' },
            { id: 'r2', title: 'Règles du Nun Sakina', category: 'TAJWID', content: 'Les 4 règles principales : Izhar, Idgham, Iqlab, Ikhfa...' },
            { id: 'r3', title: 'Doua de protection', category: 'DUA', content: 'Bismillahi alladhi la yadurru ma\'asmihi...' },
            { id: 'r4', title: 'Histoire de Moussa (AS)', category: 'HISTORY', content: 'Le prophète qui a parlé à Allah...' },
        ]);
    }
    
    // Init Mock Forum
    const forum = get<ForumPost>(KEYS.FORUM);
    if (forum.length === 0) {
        set(KEYS.FORUM, [
            { id: 'f1', userId: 'admin-001', userName: 'Admin Principal', title: 'Bienvenue sur le forum', content: 'Posez vos questions ici.', category: 'General', likes: 10, replies: [], createdAt: new Date().toISOString() }
        ]);
    }
  },

  // Auth & Gamification
  login: (email: string, password: string): User | null => {
    const users = get<User>(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  register: (user: User): boolean => {
    const users = get<User>(KEYS.USERS);
    if (users.some(u => u.email === user.email)) return false;
    
    // Generate referral code
    user.referralCode = user.firstName.substring(0,3).toUpperCase() + Math.floor(Math.random()*1000);
    user.xp = 0;
    user.level = 1;
    user.badges = [];
    user.subscriptionPlan = SubscriptionPlan.FREE;

    users.push(user);
    set(KEYS.USERS, users);
    
    storageService.createNotification({
        userId: 'ADMIN',
        title: 'Nouvelle Inscription',
        message: `${user.firstName} ${user.lastName} a créé un compte.`,
        type: 'INFO',
        linkTo: 'students'
    });
    
    return true;
  },

  addXP: (userId: string, amount: number) => {
      let users = get<User>(KEYS.USERS);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
          users[idx].xp += amount;
          
          // Level Up Logic (Example: Level = XP / 100)
          const newLevel = Math.floor(users[idx].xp / 100) + 1;
          if (newLevel > users[idx].level) {
              users[idx].level = newLevel;
              storageService.createNotification({
                  userId: userId,
                  title: 'Niveau Supérieur !',
                  message: `Bravo ! Vous êtes passé au niveau ${newLevel}.`,
                  type: 'SUCCESS'
              });
          }
          
          // Badge Logic (Simple examples)
          if (users[idx].xp >= 500 && !users[idx].badges.some(b => b.id === 'b2')) {
               const badge = BADGES_LIST.find(b => b.id === 'b2');
               if(badge) {
                   users[idx].badges.push({...badge, unlockedAt: new Date().toISOString()});
                   storageService.createNotification({
                       userId: userId,
                       title: 'Nouveau Badge !',
                       message: `Vous avez débloqué le badge : ${badge.name}`,
                       type: 'SUCCESS'
                   });
               }
          }

          set(KEYS.USERS, users);
          
          // Update current user if it matches
          const currentUser = storageService.getCurrentUser();
          if (currentUser && currentUser.id === userId) {
              localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[idx]));
          }
      }
  },

  getLeaderboard: (): User[] => {
      const users = get<User>(KEYS.USERS);
      return users.filter(u => u.role === UserRole.STUDENT).sort((a,b) => b.xp - a.xp).slice(0, 10);
  },

  // Forum
  getForumPosts: (): ForumPost[] => get<ForumPost>(KEYS.FORUM),
  addForumPost: (post: ForumPost) => {
      const posts = get<ForumPost>(KEYS.FORUM);
      posts.unshift(post);
      set(KEYS.FORUM, posts);
      storageService.addXP(post.userId, 10); // +10 XP for posting
  },

  // Resources
  getResources: (): Resource[] => get<Resource>(KEYS.RESOURCES),

  // Prayer Times (Using External API)
  getPrayerTimes: async () => {
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=Dakar&country=Senegal&method=2`);
        const data = await response.json();
        return data.data.timings;
    } catch (e) {
        console.error("Erreur API Adhan", e);
        return null;
    }
  },

  // Subscription
  upgradeSubscription: (userId: string, plan: SubscriptionPlan) => {
      let users = get<User>(KEYS.USERS);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
          users[idx].subscriptionPlan = plan;
          // Set expiry 1 year or 1 month later
          const date = new Date();
          if (plan === SubscriptionPlan.PREMIUM_MONTHLY) date.setMonth(date.getMonth() + 1);
          if (plan === SubscriptionPlan.PREMIUM_YEARLY) date.setFullYear(date.getFullYear() + 1);
          users[idx].subscriptionExpiry = date.toISOString();
          
          set(KEYS.USERS, users);
          
           // Update current user if it matches
          const currentUser = storageService.getCurrentUser();
          if (currentUser && currentUser.id === userId) {
              localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[idx]));
          }

          storageService.createNotification({
              userId: userId,
              title: 'Abonnement Activé',
              message: `Bienvenue dans le plan ${plan === SubscriptionPlan.PREMIUM_YEARLY ? 'Annuel' : 'Mensuel'} ! Profitez de tous les contenus.`,
              type: 'SUCCESS'
          });
      }
  },

  // --- Existing Methods (Classes, Content, etc.) ---
  
  getClasses: (): ClassGroup[] => get<ClassGroup>(KEYS.CLASSES),
  addClass: (cls: ClassGroup) => {
    const classes = get<ClassGroup>(KEYS.CLASSES);
    classes.push(cls);
    set(KEYS.CLASSES, classes);
  },
  updateClass: (cls: ClassGroup) => {
    let classes = get<ClassGroup>(KEYS.CLASSES);
    classes = classes.map(c => c.id === cls.id ? cls : c);
    set(KEYS.CLASSES, classes);
  },

  getContent: (classId?: string): Content[] => {
    const all = get<Content>(KEYS.CONTENT);
    if (classId) return all.filter(c => c.classId === classId);
    return all;
  },
  addContent: (content: Content) => {
    const all = get<Content>(KEYS.CONTENT);
    all.push(content);
    set(KEYS.CONTENT, all);
    const classes = get<ClassGroup>(KEYS.CLASSES);
    const cls = classes.find(c => c.id === content.classId);
    if (cls) {
        cls.studentIds.forEach(sid => {
            storageService.createNotification({
                userId: sid,
                title: 'Nouveau contenu',
                message: `Un nouveau cours "${content.title}" a été ajouté à ${cls.name}.`,
                type: 'INFO',
                linkTo: 'my-classes'
            });
        });
    }
  },
  deleteContent: (id: string) => {
    let all = get<Content>(KEYS.CONTENT);
    all = all.filter(c => c.id !== id);
    set(KEYS.CONTENT, all);
  },
  addComment: (contentId: string, comment: any) => {
    const all = get<Content>(KEYS.CONTENT);
    const idx = all.findIndex(c => c.id === contentId);
    if (idx !== -1) {
      all[idx].comments.push(comment);
      set(KEYS.CONTENT, all);
      storageService.createNotification({
          userId: 'ADMIN',
          title: 'Nouveau commentaire',
          message: `${comment.userName} a commenté sur un contenu.`,
          type: 'INFO',
          linkTo: 'content'
      });
      storageService.addXP(comment.userId, 5); // XP for comment
    }
  },

  getEnrollments: (): EnrollmentRequest[] => get<EnrollmentRequest>(KEYS.ENROLLMENTS),
  createEnrollment: (req: EnrollmentRequest) => {
    const all = get<EnrollmentRequest>(KEYS.ENROLLMENTS);
    if (all.some(e => e.userId === req.userId && e.classId === req.classId)) return;
    all.push(req);
    set(KEYS.ENROLLMENTS, all);
    storageService.createNotification({
        userId: 'ADMIN',
        title: 'Inscription en attente',
        message: `${req.userName} souhaite rejoindre ${req.className}.`,
        type: 'WARNING',
        linkTo: 'enrollments'
    });
  },
  updateEnrollmentStatus: (id: string, status: EnrollmentStatus) => {
    const all = get<EnrollmentRequest>(KEYS.ENROLLMENTS);
    const idx = all.findIndex(e => e.id === id);
    if (idx !== -1) {
      const req = all[idx];
      all[idx].status = status;
      set(KEYS.ENROLLMENTS, all);
      const notifType = status === EnrollmentStatus.APPROVED ? 'SUCCESS' : 'ERROR';
      const msg = status === EnrollmentStatus.APPROVED 
        ? `Votre inscription à ${req.className} a été validée !` 
        : `Votre inscription à ${req.className} a été refusée.`;
      storageService.createNotification({
          userId: req.userId,
          title: 'Mise à jour inscription',
          message: msg,
          type: notifType,
          linkTo: 'my-classes'
      });
      if (status === EnrollmentStatus.APPROVED) {
        const users = get<User>(KEYS.USERS);
        const user = users.find(u => u.id === req.userId);
        if (user) simulateEmail(user.email, "Inscription Validée - Quran SN", msg);
        const classes = get<ClassGroup>(KEYS.CLASSES);
        const classIdx = classes.findIndex(c => c.id === req.classId);
        if (classIdx !== -1) {
          if (!classes[classIdx].studentIds.includes(req.userId)) {
            classes[classIdx].studentIds.push(req.userId);
            set(KEYS.CLASSES, classes);
          }
        }
      }
    }
  },

  getViewedContent: (userId: string): string[] => {
      const allProgress = get<{userId: string, contentId: string}>(KEYS.PROGRESS);
      return allProgress.filter(p => p.userId === userId).map(p => p.contentId);
  },
  markContentViewed: (userId: string, contentId: string) => {
      const allProgress = get<{userId: string, contentId: string}>(KEYS.PROGRESS);
      if (!allProgress.some(p => p.userId === userId && p.contentId === contentId)) {
          allProgress.push({ userId, contentId });
          set(KEYS.PROGRESS, allProgress);
          storageService.addXP(userId, 20); // XP for viewing content
      }
  },

  getQuizzes: (classId?: string): Quiz[] => {
      const quizzes = get<Quiz>(KEYS.QUIZZES);
      if (classId) return quizzes.filter(q => q.classId === classId);
      return quizzes;
  },
  addQuiz: (quiz: Quiz) => {
      const quizzes = get<Quiz>(KEYS.QUIZZES);
      quizzes.push(quiz);
      set(KEYS.QUIZZES, quizzes);
  },
  saveQuizAttempt: (attempt: QuizAttempt) => {
      const attempts = get<QuizAttempt>(KEYS.ATTEMPTS);
      attempts.push(attempt);
      set(KEYS.ATTEMPTS, attempts);
      storageService.createNotification({
          userId: attempt.userId,
          title: 'Résultat Quiz',
          message: `Vous avez obtenu ${attempt.score}% au quiz.`,
          type: attempt.passed ? 'SUCCESS' : 'WARNING'
      });
      if (attempt.passed) storageService.addXP(attempt.userId, 50); // Big XP for passing quiz
  },
  getAttempts: (userId?: string, quizId?: string): QuizAttempt[] => {
      let attempts = get<QuizAttempt>(KEYS.ATTEMPTS);
      if (userId) attempts = attempts.filter(a => a.userId === userId);
      if (quizId) attempts = attempts.filter(a => a.quizId === quizId);
      return attempts;
  },

  getLives: (classId?: string): LiveSession[] => {
      const lives = get<LiveSession>(KEYS.LIVES);
      if (classId) return lives.filter(l => l.classId === classId);
      return lives;
  },
  addLive: (live: LiveSession) => {
      const lives = get<LiveSession>(KEYS.LIVES);
      lives.push(live);
      set(KEYS.LIVES, lives);
      const classes = get<ClassGroup>(KEYS.CLASSES);
      const cls = classes.find(c => c.id === live.classId);
      if (cls) {
          cls.studentIds.forEach(sid => {
              storageService.createNotification({
                  userId: sid,
                  title: 'Nouveau cours en direct',
                  message: `Live "${live.title}" prévu le ${new Date(live.scheduledAt).toLocaleDateString()}.`,
                  type: 'INFO',
                  linkTo: 'lives'
              });
              const users = get<User>(KEYS.USERS);
              const u = users.find(u => u.id === sid);
              if (u) simulateEmail(u.email, "Nouveau Live - Quran SN", `Rejoignez le cours ${live.title} sur ${live.platform}.`);
          });
      }
  },

  getNotifications: (userId: string): Notification[] => {
      const notifs = get<Notification>(KEYS.NOTIFICATIONS);
      if (userId === 'ADMIN') return notifs.filter(n => n.userId === 'ADMIN');
      return notifs.filter(n => n.userId === userId);
  },
  createNotification: (notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      const notifs = get<Notification>(KEYS.NOTIFICATIONS);
      const notif: Notification = {
          id: Date.now().toString() + Math.random().toString(),
          createdAt: new Date().toISOString(),
          isRead: false,
          ...notifData
      };
      notifs.unshift(notif); 
      set(KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationRead: (id: string) => {
      const notifs = get<Notification>(KEYS.NOTIFICATIONS);
      const idx = notifs.findIndex(n => n.id === id);
      if (idx !== -1) {
          notifs[idx].isRead = true;
          set(KEYS.NOTIFICATIONS, notifs);
      }
  },

  getAllUsers: (): User[] => get<User>(KEYS.USERS),
  
  getStats: () => {
    const users = get<User>(KEYS.USERS);
    const classes = get<ClassGroup>(KEYS.CLASSES);
    const enrollments = get<EnrollmentRequest>(KEYS.ENROLLMENTS);
    const content = get<Content>(KEYS.CONTENT);
    const quizzes = get<Quiz>(KEYS.QUIZZES);
    
    return {
      totalStudents: users.filter(u => u.role === UserRole.STUDENT).length,
      totalClasses: classes.length,
      pendingEnrollments: enrollments.filter(e => e.status === EnrollmentStatus.PENDING).length,
      totalContent: content.length,
      contentByType: {
        VIDEO: content.filter(c => c.type === 'VIDEO').length,
        AUDIO: content.filter(c => c.type === 'AUDIO').length,
        DOCUMENT: content.filter(c => c.type === 'DOCUMENT').length,
      },
      totalQuizzes: quizzes.length
    };
  }
};
