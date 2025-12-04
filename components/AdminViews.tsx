import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { googleApiService } from '../services/googleApiService';
import { ClassGroup, Gender, LEVELS, User, EnrollmentStatus, Content, ContentType, Quiz, Question, QuestionType, LiveSession, UserRole, SubscriptionPlan } from '../types';
import { Users, BookOpen, Clock, FileText, CheckCircle, XCircle, Upload, Trash2, Video, Music, AlertTriangle, UserPlus, HelpCircle, Calendar, ExternalLink, RefreshCw, Filter } from 'lucide-react';

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState(storageService.getStats());

  useEffect(() => {
    setStats(storageService.getStats());
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${color.replace('border-', 'bg-').replace('500', '50')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Élèves" value={stats.totalStudents} icon={Users} color="border-teal-500" />
        <StatCard title="Classes Actives" value={stats.totalClasses} icon={BookOpen} color="border-indigo-500" />
        <StatCard title="En attente" value={stats.pendingEnrollments} icon={Clock} color="border-amber-500" />
        <StatCard title="Contenus & Quiz" value={stats.totalContent + stats.totalQuizzes} icon={FileText} color="border-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charts Visualization (CSS only for simplicity/performance) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-6">Répartition du Contenu</h3>
              <div className="flex items-center justify-center gap-8">
                  <div className="relative w-40 h-40 rounded-full border-[16px] border-gray-100 flex items-center justify-center" 
                       style={{
                           background: `conic-gradient(
                               #f87171 0% ${((stats.contentByType.VIDEO / stats.totalContent) || 0) * 100}%, 
                               #60a5fa ${((stats.contentByType.VIDEO / stats.totalContent) || 0) * 100}% ${(((stats.contentByType.VIDEO + stats.contentByType.AUDIO) / stats.totalContent) || 0) * 100}%, 
                               #fb923c ${(((stats.contentByType.VIDEO + stats.contentByType.AUDIO) / stats.totalContent) || 0) * 100}% 100%
                           )`
                       }}>
                      <div className="absolute inset-0 m-4 bg-white rounded-full flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-gray-800">{stats.totalContent}</span>
                          <span className="text-xs text-gray-400 font-bold uppercase">Fichiers</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-400"></span> Vidéos ({stats.contentByType.VIDEO})</div>
                      <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Audios ({stats.contentByType.AUDIO})</div>
                      <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Documents ({stats.contentByType.DOCUMENT})</div>
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Activité Récente</h3>
              <div className="space-y-4">
                  {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">S{i}</div>
                          <div>
                              <p className="text-sm font-bold text-gray-800">Nouvelle inscription validée</p>
                              <p className="text-xs text-gray-400">Il y a {i * 2} heures</p>
                          </div>
                      </div>
                  ))}
                  <button className="w-full text-center text-sm text-teal-600 font-bold mt-2 hover:underline">Voir tout l'historique</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '', level: LEVELS[0], gender: Gender.MIXED, capacity: 20, description: ''
  });

  useEffect(() => { setClasses(storageService.getClasses()); }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cls: ClassGroup = {
      id: Date.now().toString(),
      ...newClass,
      studentIds: []
    };
    storageService.addClass(cls);
    setClasses(storageService.getClasses());
    setShowForm(false);
    setNewClass({ name: '', level: LEVELS[0], gender: Gender.MIXED, capacity: 20, description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Classes</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-md shadow-teal-600/20 font-medium transition-all"
        >
          {showForm ? 'Annuler' : '+ Nouvelle Classe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-2xl shadow-lg border border-teal-100 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom de la classe</label>
                <input 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="Ex: Tajwid Avancé" required 
                value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} 
                />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Niveau</label>
                <select 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value})}
                >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Genre</label>
                <select 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                value={newClass.gender} onChange={e => setNewClass({...newClass, gender: e.target.value as Gender})}
                >
                <option value={Gender.MIXED}>{Gender.MIXED}</option>
                <option value={Gender.MALE}>{Gender.MALE}</option>
                <option value={Gender.FEMALE}>{Gender.FEMALE}</option>
                </select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Capacité</label>
                <input 
                type="number" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="20" required 
                value={newClass.capacity} onChange={e => setNewClass({...newClass, capacity: parseInt(e.target.value)})} 
                />
            </div>
          </div>
           <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="Description..." rows={3}
                value={newClass.description} onChange={e => setNewClass({...newClass, description: e.target.value})}
              ></textarea>
          </div>
          <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors">Créer la classe</button>
        </form>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
            <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-500">{cls.level} • <span className="text-teal-600 font-medium">{cls.gender}</span></p>
                </div>
            </div>
             <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                    {cls.studentIds.length} / {cls.capacity} élèves
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminEnrollments: React.FC = () => {
    const [requests, setRequests] = useState(storageService.getEnrollments().filter(r => r.status === EnrollmentStatus.PENDING));

    const handleStatus = (id: string, status: EnrollmentStatus) => {
        storageService.updateEnrollmentStatus(id, status);
        setRequests(storageService.getEnrollments().filter(r => r.status === EnrollmentStatus.PENDING));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Demandes d'inscription</h2>
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-gray-400 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">Aucune demande en attente.</div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{req.userName}</h3>
                                <p className="text-sm text-gray-600">Souhaite rejoindre : <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{req.className}</span></p>
                            </div>
                             <div className="flex gap-3">
                                <button onClick={() => handleStatus(req.id, EnrollmentStatus.APPROVED)} className="bg-teal-100 text-teal-700 px-4 py-2 rounded-xl font-medium hover:bg-teal-200"><CheckCircle size={18} /></button>
                                <button onClick={() => handleStatus(req.id, EnrollmentStatus.REJECTED)} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200"><XCircle size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const AdminStudents: React.FC = () => {
    // New feature: Register student manually
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', gender: 'Homme' as 'Homme' | 'Femme'
    });
    
    const [students, setStudents] = useState<User[]>(
        storageService.getAllUsers().filter(u => u.role === UserRole.STUDENT)
    );

    const handleCreateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        const user: User = {
            id: Date.now().toString(),
            role: UserRole.STUDENT,
            joinedAt: new Date().toISOString(),
            ...newUser,
            xp: 0,
            level: 1,
            badges: [],
            subscriptionPlan: SubscriptionPlan.FREE,
            referralCode: ''
        };
        if(storageService.register(user)) {
            alert("Élève ajouté avec succès !");
            setStudents(storageService.getAllUsers().filter(u => u.role === UserRole.STUDENT));
            setShowForm(false);
            setNewUser({firstName: '', lastName: '', email: '', phone: '', password: '', gender: 'Homme'});
        } else {
            alert("Erreur: Email déjà existant.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 flex items-center gap-2 font-medium shadow-md shadow-teal-600/20">
                    <UserPlus size={18} /> Inscrire un élève
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateStudent} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold mb-4 text-gray-700">Nouvel Élève</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input className="input-field border p-2 rounded-lg" placeholder="Prénom" required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
                        <input className="input-field border p-2 rounded-lg" placeholder="Nom" required value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                        <input className="input-field border p-2 rounded-lg" placeholder="Email" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        <input className="input-field border p-2 rounded-lg" placeholder="Téléphone" required value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                        <input className="input-field border p-2 rounded-lg" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        <select className="input-field border p-2 rounded-lg" value={newUser.gender} onChange={e => setNewUser({...newUser, gender: e.target.value as any})}>
                            <option value="Homme">Homme</option>
                            <option value="Femme">Femme</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold hover:bg-teal-700">Enregistrer</button>
                </form>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-50 uppercase">Nom</th>
                            <th className="p-4 text-xs font-bold text-gray-50 uppercase">Contact</th>
                            <th className="p-4 text-xs font-bold text-gray-50 uppercase">Genre</th>
                            <th className="p-4 text-xs font-bold text-gray-50 uppercase">Inscrit le</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{s.firstName} {s.lastName}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{s.email}</span>
                                        <span className="text-xs text-gray-400">{s.phone}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{s.gender}</td>
                                <td className="p-4 text-sm text-gray-600">{new Date(s.joinedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminContent: React.FC = () => {
  const [classes] = useState<ClassGroup[]>(storageService.getClasses());
  const [contents, setContents] = useState<Content[]>(storageService.getContent());
  const [quizzes, setQuizzes] = useState<Quiz[]>(storageService.getQuizzes());
  const [lives, setLives] = useState<LiveSession[]>(storageService.getLives());
  const [activeTab, setActiveTab] = useState<'MEDIA' | 'QUIZ' | 'LIVE'>('MEDIA');
  
  // Filtering states for Content
  const [filterType, setFilterType] = useState<'ALL' | ContentType>('ALL');
  const [filterClassId, setFilterClassId] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Google Auth State
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);

  // Confirm delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  useEffect(() => {
    googleApiService.init((auth) => setIsGoogleAuthorized(auth));
  }, []);

  const handleGoogleLogin = async () => {
      try {
          await googleApiService.login();
          setIsGoogleAuthorized(true);
      } catch (e) {
          alert("Erreur de connexion Google: " + JSON.stringify(e));
      }
  };
  
  // Media Upload State
  const [newContent, setNewContent] = useState<{classId: string, title: string, type: ContentType, description: string}>({
    classId: '', title: '', type: ContentType.VIDEO, description: ''
  });
  
  // Quiz Creation State
  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({ questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({ type: QuestionType.MCQ_SINGLE, options: [''] });

  // Live Creation State
  const [newLive, setNewLive] = useState<Partial<LiveSession>>({ platform: 'Google Meet', durationMinutes: 60 });

  const refreshData = () => {
      setContents(storageService.getContent());
      setQuizzes(storageService.getQuizzes());
      setLives(storageService.getLives());
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !newContent.classId) return;
      if (file.size > 5000000) { alert("Fichier trop lourd (>5MB)."); return; }
      
      const reader = new FileReader();
      reader.onloadend = () => {
          storageService.addContent({
              id: Date.now().toString(),
              classId: newContent.classId,
              title: newContent.title,
              description: newContent.description,
              type: newContent.type,
              dataUrl: reader.result as string,
              fileName: file.name,
              createdAt: new Date().toISOString(),
              comments: []
          });
          refreshData();
          setNewContent({...newContent, title: '', description: ''});
      };
      reader.readAsDataURL(file);
  };

  const promptDelete = (id: string) => {
      setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
      if (deleteConfirm.id) {
          storageService.deleteContent(deleteConfirm.id);
          refreshData();
          setDeleteConfirm({ isOpen: false, id: null });
      }
  };

  const handleAddQuestion = () => {
      if (!currentQuestion.text) return;
      const q: Question = {
          id: Date.now().toString(),
          text: currentQuestion.text || '',
          type: currentQuestion.type || QuestionType.MCQ_SINGLE,
          options: currentQuestion.options?.filter(o => o !== ''),
          correctAnswers: currentQuestion.correctAnswers,
          points: currentQuestion.points || 1,
          explanation: currentQuestion.explanation
      };
      setNewQuiz({ ...newQuiz, questions: [...(newQuiz.questions || []), q] });
      setCurrentQuestion({ type: QuestionType.MCQ_SINGLE, options: [''], text: '', points: 1 });
  };

  const handleSaveQuiz = () => {
      if (!newQuiz.title || !newQuiz.classId) return;
      const fullQuiz: Quiz = {
          id: Date.now().toString(),
          classId: newQuiz.classId,
          title: newQuiz.title,
          description: newQuiz.description || '',
          questions: newQuiz.questions || [],
          timeLimitMinutes: newQuiz.timeLimitMinutes || 0,
          passingScore: newQuiz.passingScore || 50,
          maxAttempts: newQuiz.maxAttempts || 3,
          createdAt: new Date().toISOString()
      };
      storageService.addQuiz(fullQuiz);
      refreshData();
      setNewQuiz({ questions: [] });
      alert("Quiz créé !");
  };

  const handleSaveLive = async () => {
      if(!newLive.title || !newLive.classId) return;
      
      let meetingLink = newLive.meetingLink || '';

      // Integration Google Meet
      if (newLive.platform === 'Google Meet' && !meetingLink && isGoogleAuthorized) {
          if (!newLive.scheduledAt) {
              alert("Veuillez définir une date pour créer un Meet.");
              return;
          }
          setIsCreatingMeet(true);
          try {
              meetingLink = await googleApiService.createMeet(
                  newLive.title,
                  newLive.description || "Cours Quran SN",
                  newLive.scheduledAt,
                  newLive.durationMinutes || 60
              );
              setNewLive({ ...newLive, meetingLink: meetingLink });
          } catch (e) {
              alert("Impossible de créer le Meet automatiquement.");
              setIsCreatingMeet(false);
              return;
          }
          setIsCreatingMeet(false);
      } else if (newLive.platform === 'Google Meet' && !meetingLink && !isGoogleAuthorized) {
           alert("Veuillez vous connecter à Google pour générer un lien Meet automatiquement, ou entrez le lien manuellement.");
           return;
      }

      if (!meetingLink) {
          meetingLink = 'https://meet.google.com/new'; // Fallback
      }

      const fullLive: LiveSession = {
          id: Date.now().toString(),
          classId: newLive.classId,
          title: newLive.title!,
          description: newLive.description || '',
          platform: newLive.platform || 'Google Meet',
          meetingLink: meetingLink,
          scheduledAt: newLive.scheduledAt || new Date().toISOString(),
          durationMinutes: newLive.durationMinutes || 60,
          isRecorded: false
      };
      storageService.addLive(fullLive);
      refreshData();
      setNewLive({ platform: 'Google Meet', durationMinutes: 60 });
      alert("Session Live planifiée !");
  };

  // Logic to extract and sort unique levels - Explicitly typed to avoid 'any' error
  const uniqueLevels = Array.from(new Set(classes.map(c => c.level))).sort((a: string, b: string) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Filter Logic
  const filteredContents = contents.filter(c => {
      const cls = classes.find(cl => cl.id === c.classId);
      const matchesType = filterType === 'ALL' || c.type === filterType;
      const matchesClass = filterClassId === 'ALL' || c.classId === filterClassId;
      const matchesLevel = filterLevel === 'ALL' || cls?.level === filterLevel;
      return matchesType && matchesClass && matchesLevel;
  });

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800">Gestion des Contenus</h2>
       
       <div className="flex gap-2 border-b border-gray-200 pb-1">
           <button onClick={() => setActiveTab('MEDIA')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'MEDIA' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'}`}>Médiathèque</button>
           <button onClick={() => setActiveTab('QUIZ')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'QUIZ' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'}`}>Quiz & Évaluations</button>
           <button onClick={() => setActiveTab('LIVE')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'LIVE' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'}`}>Cours en Direct</button>
       </div>

       {/* MEDIA TAB */}
       {activeTab === 'MEDIA' && (
           <div className="space-y-6 animate-in fade-in">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-100">
                    <h3 className="font-bold mb-4 text-teal-800 flex items-center gap-2"><Upload size={20} /> Uploader un fichier</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select className="input-field border p-3 rounded-xl" value={newContent.classId} onChange={e => setNewContent({...newContent, classId: e.target.value})}>
                            <option value="">-- Classe --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="input-field border p-3 rounded-xl" placeholder="Titre" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} />
                        <select className="input-field border p-3 rounded-xl" value={newContent.type} onChange={e => setNewContent({...newContent, type: e.target.value as ContentType})}>
                            <option value={ContentType.VIDEO}>Vidéo</option>
                            <option value={ContentType.AUDIO}>Audio</option>
                            <option value={ContentType.DOCUMENT}>Document</option>
                        </select>
                        <input className="input-field border p-3 rounded-xl" placeholder="Description" value={newContent.description} onChange={e => setNewContent({...newContent, description: e.target.value})} />
                    </div>
                    <input type="file" onChange={handleMediaUpload} disabled={!newContent.classId} />
               </div>
               
               {/* Filters */}
               <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-center shadow-sm">
                   <div className="flex gap-2 items-center w-full overflow-x-auto pb-2 xl:pb-0">
                       <span className="text-gray-400 text-sm flex items-center gap-1 mr-2 shrink-0"><Filter size={16}/> Filtrer:</span>
                       <button onClick={() => setFilterType('ALL')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === 'ALL' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>Tout</button>
                       <button onClick={() => setFilterType(ContentType.VIDEO)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === ContentType.VIDEO ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>Vidéos</button>
                       <button onClick={() => setFilterType(ContentType.AUDIO)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === ContentType.AUDIO ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>Audios</button>
                       <button onClick={() => setFilterType(ContentType.DOCUMENT)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === ContentType.DOCUMENT ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>Docs</button>
                   </div>
                   <div className="w-full flex gap-2">
                        <select 
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-gray-50"
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                        >
                            <option value="ALL">Tous les niveaux</option>
                            {uniqueLevels.map(lvl => <option key={lvl} value={lvl}>{String(lvl)}</option>)}
                        </select>
                        <select 
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-gray-50"
                            value={filterClassId}
                            onChange={(e) => setFilterClassId(e.target.value)}
                        >
                            <option value="ALL">Toutes les classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                   </div>
               </div>

               <div className="space-y-3">
                   {filteredContents.length > 0 ? filteredContents.map(c => (
                       <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between group hover:shadow-md transition-shadow">
                           <div className="flex gap-4 items-center">
                               <div className={`p-3 rounded-lg ${c.type === ContentType.VIDEO ? 'bg-red-50 text-red-500' : c.type === ContentType.AUDIO ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                   {c.type === ContentType.VIDEO && <Video size={20} />}
                                   {c.type === ContentType.AUDIO && <Music size={20} />}
                                   {c.type === ContentType.DOCUMENT && <FileText size={20} />}
                               </div>
                               <div>
                                    <span className="font-bold text-gray-800">{c.title}</span> 
                                    <p className="text-xs text-gray-500 mt-0.5">Classe: {classes.find(cl => cl.id === c.classId)?.name} • {classes.find(cl => cl.id === c.classId)?.level} • Ajouté le {new Date(c.createdAt).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <button onClick={() => promptDelete(c.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                       </div>
                   )) : (
                       <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                           Aucun contenu ne correspond à vos filtres.
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* QUIZ TAB */}
       {activeTab === 'QUIZ' && (
           <div className="space-y-6 animate-in fade-in">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100">
                   <h3 className="font-bold mb-4 text-indigo-800 flex items-center gap-2"><HelpCircle size={20} /> Créer un Quiz</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <select className="border p-3 rounded-xl" value={newQuiz.classId || ''} onChange={e => setNewQuiz({...newQuiz, classId: e.target.value})}>
                            <option value="">-- Classe cible --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="border p-3 rounded-xl" placeholder="Titre du Quiz" value={newQuiz.title || ''} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} />
                        <input className="border p-3 rounded-xl" type="number" placeholder="Temps (min)" value={newQuiz.timeLimitMinutes || ''} onChange={e => setNewQuiz({...newQuiz, timeLimitMinutes: parseInt(e.target.value)})} />
                        <input className="border p-3 rounded-xl" type="number" placeholder="Seuil réussite (%)" value={newQuiz.passingScore || ''} onChange={e => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value)})} />
                   </div>
                   
                   {/* Add Question Area */}
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                       <h4 className="font-bold text-sm text-gray-600 mb-2">Ajouter une question</h4>
                       <div className="space-y-3">
                           <textarea className="w-full p-2 rounded border" placeholder="Question..." value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} />
                           <select className="border p-2 rounded w-full" value={currentQuestion.type} onChange={e => setCurrentQuestion({...currentQuestion, type: e.target.value as QuestionType})}>
                               <option value={QuestionType.MCQ_SINGLE}>QCM Unique</option>
                               <option value={QuestionType.TRUE_FALSE}>Vrai / Faux</option>
                               <option value={QuestionType.OPEN}>Question Ouverte</option>
                               <option value={QuestionType.AUDIO_RECITATION}>Récitation Audio</option>
                           </select>
                           
                           {/* MCQ Options */}
                           {(currentQuestion.type === QuestionType.MCQ_SINGLE || currentQuestion.type === QuestionType.MCQ_MULTI) && (
                               <div className="space-y-2 pl-4 border-l-2 border-indigo-200">
                                   <p className="text-xs font-bold">Options (séparées par une virgule pour démo)</p>
                                   <input className="w-full p-2 border rounded" placeholder="Option A, Option B, Option C..." 
                                     value={currentQuestion.options?.join(',')} 
                                     onChange={e => setCurrentQuestion({...currentQuestion, options: e.target.value.split(',')})} 
                                   />
                               </div>
                           )}
                           
                           <button onClick={handleAddQuestion} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Ajouter la question</button>
                       </div>
                   </div>

                   {/* Question List Preview */}
                   {newQuiz.questions && newQuiz.questions.length > 0 && (
                       <div className="mb-4 space-y-2">
                           {newQuiz.questions.map((q, idx) => (
                               <div key={idx} className="bg-indigo-50 p-2 rounded text-sm text-indigo-800 flex justify-between">
                                   <span>{idx + 1}. {q.text} <span className="opacity-50 text-xs">({q.type})</span></span>
                               </div>
                           ))}
                       </div>
                   )}

                   <button onClick={handleSaveQuiz} disabled={!newQuiz.questions?.length} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-50">Enregistrer le Quiz</button>
               </div>

               <div className="space-y-3">
                   <h3 className="font-bold text-gray-700">Quiz existants</h3>
                   {quizzes.map(q => (
                       <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100">
                           <div className="flex justify-between">
                               <span className="font-bold text-gray-800">{q.title}</span>
                               <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{q.questions.length} questions</span>
                           </div>
                           <p className="text-xs text-gray-500 mt-1">Classe: {classes.find(c => c.id === q.classId)?.name}</p>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {/* LIVE TAB */}
       {activeTab === 'LIVE' && (
           <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                   <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-red-800 flex items-center gap-2"><Video size={20} /> Planifier un Live</h3>
                        
                        {/* Google Auth Status */}
                        {newLive.platform === 'Google Meet' && (
                             isGoogleAuthorized ? (
                                <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle size={12}/> Connecté à Google
                                </span>
                             ) : (
                                <button 
                                    type="button" 
                                    onClick={handleGoogleLogin}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 shadow-sm"
                                >
                                    Se connecter à Google
                                </button>
                             )
                        )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select className="border p-3 rounded-xl" value={newLive.classId || ''} onChange={e => setNewLive({...newLive, classId: e.target.value})}>
                            <option value="">-- Classe cible --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="border p-3 rounded-xl" placeholder="Sujet du cours" value={newLive.title || ''} onChange={e => setNewLive({...newLive, title: e.target.value})} />
                        <input className="border p-3 rounded-xl" type="datetime-local" value={newLive.scheduledAt || ''} onChange={e => setNewLive({...newLive, scheduledAt: e.target.value})} />
                        <select className="border p-3 rounded-xl" value={newLive.platform} onChange={e => setNewLive({...newLive, platform: e.target.value as any})}>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Zoom">Zoom</option>
                        </select>
                        <div className="col-span-2 relative">
                            <input 
                                className={`border p-3 rounded-xl w-full ${newLive.platform === 'Google Meet' && isGoogleAuthorized ? 'bg-gray-100' : ''}`} 
                                placeholder={newLive.platform === 'Google Meet' && isGoogleAuthorized ? "Le lien sera généré automatiquement à la création..." : "Lien de la réunion (ex: https://meet.google.com/...)"}
                                value={newLive.meetingLink || ''} 
                                onChange={e => setNewLive({...newLive, meetingLink: e.target.value})}
                                disabled={newLive.platform === 'Google Meet' && isGoogleAuthorized}
                            />
                        </div>
                   </div>
                   <button 
                        onClick={handleSaveLive} 
                        disabled={isCreatingMeet}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 flex justify-center items-center gap-2"
                    >
                       {isCreatingMeet ? <RefreshCw className="animate-spin" size={20} /> : "Planifier la session"}
                   </button>
                </div>

                <div className="space-y-3">
                   <h3 className="font-bold text-gray-700">Sessions programmées</h3>
                   {lives.map(l => (
                       <div key={l.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                           <div>
                               <p className="font-bold text-gray-800">{l.title}</p>
                               <p className="text-sm text-gray-500">{new Date(l.scheduledAt).toLocaleString()}</p>
                           </div>
                           <a href={l.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm"><ExternalLink size={14}/> Lien</a>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {/* Delete Confirmation Modal */}
       {deleteConfirm.isOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
                   <div className="flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                           <AlertTriangle size={24} />
                       </div>
                       <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression ?</h3>
                       <p className="text-gray-500 text-sm mb-6">
                           Cette action est irréversible. Le contenu sera définitivement retiré.
                       </p>
                       <div className="flex gap-3 w-full">
                           <button 
                               onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                               className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                           >
                               Annuler
                           </button>
                           <button 
                               onClick={confirmDelete}
                               className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                           >
                               Supprimer
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};