
import { User, ClassGroup, Content, EnrollmentRequest, UserRole, EnrollmentStatus, Quiz, QuizAttempt, LiveSession, Notification, SubscriptionPlan, ForumPost, Resource, BADGES_LIST, Gender, ContentType, LEVELS, QuestionType, DailyInspiration } from '../types';

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
    // 1. ADMIN INITIALIZATION
    let users = get<User>(KEYS.USERS);
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
      users = [admin];
      set(KEYS.USERS, users);
    }

    // 2. MOCK STUDENTS GENERATION (If only admin exists or forced check)
    // We check if we have less than 2 users to trigger student generation
    if (users.length <= 1) {
        console.log("Generating 6 Mock Students...");
        
        const mockStudents: User[] = [
            // HOMMES
            {
                id: 's1', firstName: 'Moussa', lastName: 'Diop', email: 'moussa@test.com', phone: '770000001', password: '123',
                role: UserRole.STUDENT, gender: 'Homme', joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
                xp: 1250, level: 3, badges: [BADGES_LIST[0], BADGES_LIST[1]], subscriptionPlan: SubscriptionPlan.PREMIUM_MONTHLY, referralCode: 'MOU123'
            },
            {
                id: 's3', firstName: 'Amadou', lastName: 'Fall', email: 'amadou@test.com', phone: '770000003', password: '123',
                role: UserRole.STUDENT, gender: 'Homme', joinedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
                xp: 150, level: 1, badges: [], subscriptionPlan: SubscriptionPlan.FREE, referralCode: 'AMA789'
            },
            {
                id: 's5', firstName: 'Cheikh', lastName: 'Beye', email: 'cheikh@test.com', phone: '770000005', password: '123',
                role: UserRole.STUDENT, gender: 'Homme', joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                xp: 50, level: 0, badges: [], subscriptionPlan: SubscriptionPlan.FREE, referralCode: 'CHE202'
            },
            // FEMMES
            {
                id: 's2', firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@test.com', phone: '770000002', password: '123',
                role: UserRole.STUDENT, gender: 'Femme', joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
                xp: 2800, level: 5, badges: [BADGES_LIST[0], BADGES_LIST[2], BADGES_LIST[4]], subscriptionPlan: SubscriptionPlan.PREMIUM_YEARLY, referralCode: 'FAT456'
            },
            {
                id: 's4', firstName: 'Aissatou', lastName: 'Sow', email: 'aicha@test.com', phone: '770000004', password: '123',
                role: UserRole.STUDENT, gender: 'Femme', joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                xp: 450, level: 2, badges: [BADGES_LIST[0]], subscriptionPlan: SubscriptionPlan.FREE, referralCode: 'AIS101'
            },
             {
                id: 's6', firstName: 'Mariama', lastName: 'Ba', email: 'mariama@test.com', phone: '770000006', password: '123',
                role: UserRole.STUDENT, gender: 'Femme', joinedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                xp: 0, level: 0, badges: [], subscriptionPlan: SubscriptionPlan.FREE, referralCode: 'MAR303'
            }
        ];
        
        users = [...users, ...mockStudents];
        set(KEYS.USERS, users);
    }

    // 3. MOCK CLASSES
    let classes = get<ClassGroup>(KEYS.CLASSES);
    if (classes.length === 0) {
        const mockClassesData: ClassGroup[] = [
            {
                id: 'c1', name: 'Initiation Alphabet', level: LEVELS[0], gender: Gender.MIXED, capacity: 50,
                description: 'Apprentissage des lettres de base et de la prononciation correcte.',
                studentIds: ['s3', 's5', 's6']
            },
            {
                id: 'c2', name: 'Mémorisation Juz Amma', level: LEVELS[1], gender: Gender.FEMALE, capacity: 20,
                description: 'Cercle réservé aux soeurs pour la mémorisation du dernier Juz.',
                studentIds: ['s2', 's4']
            },
            {
                id: 'c3', name: 'Tajwid Théorique & Pratique', level: LEVELS[3], gender: Gender.MALE, capacity: 30,
                description: 'Étude approfondie des règles de Noon Sakina et Madd.',
                studentIds: ['s1']
            },
            {
                id: 'c4', name: 'Lecture Fluide', level: LEVELS[2], gender: Gender.MIXED, capacity: 40,
                description: 'Pour ceux qui connaissent les lettres mais butent sur la lecture.',
                studentIds: ['s3', 's4']
            },
            {
                id: 'c5', name: 'Exégèse (Tafsir)', level: LEVELS[4], gender: Gender.MIXED, capacity: 100,
                description: 'Comprendre le sens profond des versets. Niveau intermédiaire requis.',
                studentIds: ['s1', 's2']
            }
        ];
        set(KEYS.CLASSES, mockClassesData);
        classes = mockClassesData;
    }

    // 4. MOCK ENROLLMENTS
    let enrollments = get<EnrollmentRequest>(KEYS.ENROLLMENTS);
    if (enrollments.length === 0) {
        const mockEnrollments: EnrollmentRequest[] = [
            // Approved
            { id: 'e1', userId: 's3', userName: 'Amadou Fall', classId: 'c1', className: 'Initiation Alphabet', status: EnrollmentStatus.APPROVED, requestedAt: new Date().toISOString() },
            { id: 'e2', userId: 's5', userName: 'Cheikh Beye', classId: 'c1', className: 'Initiation Alphabet', status: EnrollmentStatus.APPROVED, requestedAt: new Date().toISOString() },
            { id: 'e3', userId: 's2', userName: 'Fatou Ndiaye', classId: 'c2', className: 'Mémorisation Juz Amma', status: EnrollmentStatus.APPROVED, requestedAt: new Date().toISOString() },
            { id: 'e4', userId: 's1', userName: 'Moussa Diop', classId: 'c3', className: 'Tajwid Théorique', status: EnrollmentStatus.APPROVED, requestedAt: new Date().toISOString() },
            { id: 'e7', userId: 's4', userName: 'Aissatou Sow', classId: 'c4', className: 'Lecture Fluide', status: EnrollmentStatus.APPROVED, requestedAt: new Date().toISOString() },

            // Pending
            { id: 'e5', userId: 's6', userName: 'Mariama Ba', classId: 'c2', className: 'Mémorisation Juz Amma', status: EnrollmentStatus.PENDING, requestedAt: new Date().toISOString() },
            { id: 'e6', userId: 's5', userName: 'Cheikh Beye', classId: 'c4', className: 'Lecture Fluide', status: EnrollmentStatus.PENDING, requestedAt: new Date().toISOString() }
        ];
        set(KEYS.ENROLLMENTS, mockEnrollments);
    }

    // 5. MOCK CONTENT
    let content = get<Content>(KEYS.CONTENT);
    if (content.length === 0) {
        const mockContent: Content[] = [
            {
                id: 'ct1', classId: 'c1', title: 'Leçon 1: Alif à Tha', description: 'Introduction aux premières lettres.',
                type: ContentType.VIDEO, dataUrl: 'data:video/mp4;base64,AAAA', fileName: 'lecon1.mp4', createdAt: new Date().toISOString(), comments: []
            },
            {
                id: 'ct2', classId: 'c1', title: 'Fiche d\'écriture', description: 'Exercice à imprimer.',
                type: ContentType.DOCUMENT, dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...', fileName: 'ecriture.pdf', createdAt: new Date().toISOString(), comments: []
            },
            {
                id: 'ct3', classId: 'c3', title: 'Règle de l\'Idgham', description: 'Explication audio avec exemples.',
                type: ContentType.AUDIO, dataUrl: 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', fileName: 'idgham.mp3', createdAt: new Date().toISOString(), comments: []
            },
            {
                 id: 'ct4', classId: 'c2', title: 'Sourate An-Naba', description: 'Répétition pour mémorisation.',
                 type: ContentType.AUDIO, dataUrl: 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', fileName: 'naba.mp3', createdAt: new Date().toISOString(), comments: []
            }
        ];
        set(KEYS.CONTENT, mockContent);
    }

    // 6. MOCK QUIZZES
    const quizzes = get<Quiz>(KEYS.QUIZZES);
    if (quizzes.length === 0) {
         set(KEYS.QUIZZES, [
            {
                id: 'q1', classId: 'c1', title: 'Quiz Alphabet', description: 'Testez vos connaissances sur les lettres.',
                questions: [
                    { id: 'qq1', type: QuestionType.MCQ_SINGLE, text: 'Quelle est la première lettre ?', options: ['Ba', 'Alif', 'Ta'], correctAnswers: ['Alif'], points: 10 },
                    { id: 'qq2', type: QuestionType.TRUE_FALSE, text: 'La lettre Ba a un point en dessous.', points: 10 }
                ],
                timeLimitMinutes: 10, passingScore: 50, maxAttempts: 3, createdAt: new Date().toISOString()
            },
            {
                id: 'q2', classId: 'c3', title: 'Examen Tajwid', description: 'Règles de Nun Sakina.',
                questions: [
                    { id: 'qq3', type: QuestionType.MCQ_MULTI, text: 'Lesquelles sont des lettres de Idgham ?', options: ['Ya', 'Ra', 'Mim', 'Lam', 'Waw', 'Nun'], points: 20 },
                    { id: 'qq4', type: QuestionType.AUDIO_RECITATION, text: 'Récitez la sourate Al-Ikhlas avec Idgham.', points: 30 }
                ],
                timeLimitMinutes: 30, passingScore: 70, maxAttempts: 1, createdAt: new Date().toISOString()
            }
         ]);
    }

    // 7. MOCK LIVES
    const lives = get<LiveSession>(KEYS.LIVES);
    if (lives.length === 0) {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(18, 0, 0, 0);
        const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); nextWeek.setHours(10, 0, 0, 0);
        
        set(KEYS.LIVES, [
            {
                id: 'l1', classId: 'c1', title: 'Correction Prononciation', description: 'Session live pour corriger la Makhraj.',
                platform: 'Google Meet', meetingLink: 'https://meet.google.com/abc-defg-hij',
                scheduledAt: tomorrow.toISOString(), durationMinutes: 60, isRecorded: false
            },
            {
                id: 'l2', classId: 'c3', title: 'Q&A Tajwid', description: 'Posez toutes vos questions sur le cours.',
                platform: 'Zoom', meetingLink: 'https://zoom.us/j/123456789',
                scheduledAt: nextWeek.toISOString(), durationMinutes: 90, isRecorded: true
            }
        ]);
    }

    // 8. MOCK RESOURCES
    const resources = get<Resource>(KEYS.RESOURCES);
    if (resources.length === 0) {
        set(KEYS.RESOURCES, [
            { id: 'r1', title: 'Sourate Al-Fatiha Tafsir', category: 'TAFSIR', content: 'Explication détaillée des 7 versets de la mère du livre. La Fatiha est la sourate la plus importante...' },
            { id: 'r2', title: 'Règles du Nun Sakina', category: 'TAJWID', content: 'Les 4 règles principales : Izhar (Clarté), Idgham (Fusion), Iqlab (Transformation), Ikhfa (Dissimulation)...' },
            { id: 'r3', title: 'Doua de protection', category: 'DUA', content: 'Bismillahi alladhi la yadurru ma\'asmihi...' },
            { id: 'r4', title: 'Histoire de Moussa (AS)', category: 'HISTORY', content: 'Le prophète qui a parlé à Allah. Son combat contre Pharaon est cité de nombreuses fois...' },
        ]);
    }
    
    // 9. MOCK FORUM
    const forum = get<ForumPost>(KEYS.FORUM);
    if (forum.length === 0) {
        set(KEYS.FORUM, [
            { id: 'f1', userId: 'admin-001', userName: 'Admin Principal', title: 'Bienvenue sur le forum', content: 'Posez vos questions ici. Soyez respectueux.', category: 'General', likes: 10, replies: [], createdAt: new Date().toISOString() },
            { id: 'f2', userId: 's1', userName: 'Moussa Diop', title: 'Question sur le Madd', content: 'Quelle est la durée exacte du Madd Lazim ?', category: 'Tajwid', likes: 2, replies: [], createdAt: new Date().toISOString() }
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

  // LOGIN VIA GOOGLE (New)
  loginGoogleUser: (googleProfile: { email: string, firstName: string, lastName: string, picture: string }): User => {
      const users = get<User>(KEYS.USERS);
      let user = users.find(u => u.email === googleProfile.email);

      // Register if new
      if (!user) {
          const newUser: User = {
              id: Date.now().toString(),
              firstName: googleProfile.firstName,
              lastName: googleProfile.lastName,
              email: googleProfile.email,
              phone: '', // Optional for Google Users
              password: Math.random().toString(36).slice(-8), // Random pw
              role: UserRole.STUDENT,
              gender: 'Homme', // Default, user can change in profile
              joinedAt: new Date().toISOString(),
              xp: 0,
              level: 1,
              badges: [],
              subscriptionPlan: SubscriptionPlan.FREE,
              referralCode: googleProfile.firstName.substring(0,3).toUpperCase() + Math.floor(Math.random()*1000),
              bannerUrl: ''
          };
          users.push(newUser);
          set(KEYS.USERS, users);
          
          storageService.createNotification({
              userId: 'ADMIN',
              title: 'Nouvelle Inscription (Google)',
              message: `${newUser.firstName} s'est inscrit avec Google.`,
              type: 'INFO'
          });
          user = newUser;
      }

      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
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

  updateUser: (updatedUser: User) => {
    let users = get<User>(KEYS.USERS);
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    set(KEYS.USERS, users);
    
    // Update current user session if it matches
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }
  },

  addXP: (userId: string, amount: number) => {
      let users = get<User>(KEYS.USERS);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
          users[idx].xp = (users[idx].xp || 0) + amount;
          
          // Level Up Logic (Example: Level = XP / 100)
          const newLevel = Math.floor(users[idx].xp / 100) + 1;
          if (newLevel > (users[idx].level || 1)) {
              users[idx].level = newLevel;
              storageService.createNotification({
                  userId: userId,
                  title: 'Niveau Supérieur !',
                  message: `Bravo ! Vous êtes passé au niveau ${newLevel}.`,
                  type: 'SUCCESS'
              });
          }
          
          // Badge Logic (Simple examples)
          if (users[idx].xp >= 500 && !(users[idx].badges || []).some(b => b.id === 'b2')) {
               const badge = BADGES_LIST.find(b => b.id === 'b2');
               if(badge) {
                   if (!users[idx].badges) users[idx].badges = [];
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
      return users.filter(u => u.role === UserRole.STUDENT).sort((a,b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
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
        if (!navigator.onLine) throw new Error("Offline");

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const dateStr = `${dd}-${mm}-${yyyy}`;

        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=Dakar&country=Senegal&method=2`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data.timings;
    } catch (e) {
        // Silently warn to avoid alarming console errors in offline/dev environments
        // console.warn("API Adhan non accessible (Offline ou Erreur), utilisation horaires par défaut.");
        return {
            Fajr: "05:30",
            Dhuhr: "13:15",
            Asr: "16:30",
            Maghrib: "19:10",
            Isha: "20:25"
        };
    }
  },

  // Daily Inspiration (Ayat of the Day)
  getDailyInspiration: (): DailyInspiration => {
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      
      const inspirations: DailyInspiration[] = [
          { text: "Souvenez-vous de Moi, Je me souviendrai de vous. Et soyez reconnaissants envers Moi et ne soyez pas ingrats.", source: "Sourate Al-Baqara, 2:152", type: "VERSE" },
          { text: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", source: "Hadith, Sahih Bukhari", type: "HADITH" },
          { text: "Allah n'impose à aucune âme une charge supérieure à sa capacité.", source: "Sourate Al-Baqara, 2:286", type: "VERSE" },
          { text: "Certes, avec la difficulté vient la facilité.", source: "Sourate Ash-Sharh, 94:6", type: "VERSE" },
          { text: "Celui qui suit une route à la recherche de la science, Allah lui facilite une route vers le Paradis.", source: "Hadith, Sahih Muslim", type: "HADITH" }
      ];
      
      return inspirations[dayOfYear % inspirations.length];
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
      if (!all[idx].comments) all[idx].comments = [];
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
