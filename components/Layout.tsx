
import React, { useState, useEffect } from 'react';
import { User, UserRole, ContentType, EnrollmentStatus } from '../types';
import { storageService } from '../services/storageService';
import { LogOut, LayoutDashboard, BookOpen, Users, FolderOpen, Search, GraduationCap, Video, Music, FileText, Bell, ChevronRight, CheckCircle, MessageSquare, Library, CreditCard, Moon, Sun, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onViewChange }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{type: 'Student' | 'Class' | 'Content', data: any}[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // States V2
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false); // Visual only for now
  
  const logoUrl = "https://file-service-104866657805.us-central1.run.app/files/aa932470-360d-4702-8618-f2b3e8e74a87";

  useEffect(() => {
    // Fetch prayer times for Dakar
    const fetchPrayers = async () => {
        const timings = await storageService.getPrayerTimes();
        if (timings) {
            setPrayerTimes(timings);
            // Simple logic for next prayer (mock)
            const now = new Date();
            const currentHour = now.getHours();
            if (currentHour < 13) setNextPrayer('Dhuhr');
            else if (currentHour < 16) setNextPrayer('Asr');
            else if (currentHour < 19) setNextPrayer('Maghrib');
            else if (currentHour < 21) setNextPrayer('Isha');
            else setNextPrayer('Fajr');
        }
    };
    fetchPrayers();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const checkNotifications = () => {
        const enrollments = storageService.getEnrollments();
        const pending = enrollments.filter(e => e.status === EnrollmentStatus.PENDING).length;
        setPendingEnrollmentsCount(pending);
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 2000);
    return () => clearInterval(interval);
  }, [isAdmin, currentView]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: {type: 'Student' | 'Class' | 'Content', data: any}[] = [];

    const classes = storageService.getClasses();
    classes.forEach(c => {
      if (c.name.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'Class', data: c });
      }
    });

    const content = storageService.getContent();
    content.forEach(c => {
      if (c.title.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'Content', data: c });
      }
    });

    if (isAdmin) {
      const users = storageService.getAllUsers();
      users.forEach(u => {
        if (u.role === UserRole.STUDENT && (
          u.firstName.toLowerCase().includes(lowerQuery) || 
          u.lastName.toLowerCase().includes(lowerQuery)
        )) {
          results.push({ type: 'Student', data: u });
        }
      });
    }

    setSearchResults(results.slice(0, 10));
  };

  const handleResultClick = (result: {type: string, data: any}) => {
    setSearchQuery('');
    setSearchResults([]);
    if (result.type === 'Class') {
        onViewChange(isAdmin ? 'classes' : 'browse');
    } else if (result.type === 'Student') {
        onViewChange('students');
    } else if (result.type === 'Content') {
        onViewChange(isAdmin ? 'content' : 'my-classes');
    }
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => onViewChange(id)}
      className={`w-full flex items-center space-x-3 px-6 py-3 my-1 mx-2 rounded-xl transition-all duration-300 group max-w-[90%] ${
        currentView === id 
          ? 'bg-teal-700/50 text-cyan-50 shadow-inner border border-teal-600/30' 
          : 'text-teal-200/80 hover:bg-teal-800/50 hover:text-white'
      }`}
    >
      <Icon size={20} className={`transition-transform duration-300 ${currentView === id ? "text-cyan-400 scale-110" : "group-hover:text-cyan-200"}`} />
      <span className={`font-medium tracking-wide ${currentView === id ? 'text-white' : ''}`}>{label}</span>
      {currentView === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
    </button>
  );

  return (
    <div className={`flex h-screen font-sans ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className="w-72 bg-[#042f2e] text-white flex flex-col shadow-2xl relative z-20 border-r border-teal-900">
        <div className="p-8 pb-6 flex flex-col items-center justify-center border-b border-teal-900/50 bg-gradient-to-b from-[#0f3d3e] to-[#042f2e]">
            <div className="relative w-24 h-24 mb-4 rounded-full shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">Quran SN</h1>
            <p className="text-teal-400 text-xs mt-1 uppercase tracking-[0.2em] font-medium opacity-80">{isAdmin ? 'Admin' : 'Espace Élève'}</p>
        </div>

        {/* XP Bar for Students */}
        {!isAdmin && (
             <div className="px-6 py-4 bg-teal-950/50 border-b border-teal-900/30">
                 <div className="flex justify-between text-xs text-teal-300 mb-1">
                     <span>Niveau {user.level || 1}</span>
                     <span>{user.xp || 0} XP</span>
                 </div>
                 <div className="w-full bg-teal-900 rounded-full h-2 overflow-hidden">
                     <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((user.xp % 100) || 0, 100)}%` }}></div>
                 </div>
             </div>
        )}

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {isAdmin ? (
            <>
              <div className="px-6 mb-2 text-xs font-bold text-teal-600 uppercase tracking-wider">Gestion</div>
              <NavItem id="dashboard" label="Tableau de bord" icon={LayoutDashboard} />
              <NavItem id="classes" label="Classes" icon={BookOpen} />
              <NavItem id="students" label="Élèves" icon={Users} />
              <div className="px-6 mb-2 mt-6 text-xs font-bold text-teal-600 uppercase tracking-wider">Contenu</div>
              <NavItem id="enrollments" label="Inscriptions" icon={GraduationCap} />
              <NavItem id="content" label="Médiathèque" icon={FolderOpen} />
            </>
          ) : (
            <>
              <div className="px-6 mb-2 text-xs font-bold text-teal-600 uppercase tracking-wider">Mon Parcours</div>
              <NavItem id="my-classes" label="Mes Cours" icon={BookOpen} />
              <NavItem id="browse" label="Explorer" icon={Search} />
              <NavItem id="resources" label="Ressources" icon={Library} />
              <div className="px-6 mb-2 mt-6 text-xs font-bold text-teal-600 uppercase tracking-wider">Communauté</div>
              <NavItem id="forum" label="Forum & Groupes" icon={MessageSquare} />
              <div className="px-6 mb-2 mt-6 text-xs font-bold text-teal-600 uppercase tracking-wider">Personnel</div>
              <NavItem id="profile" label="Mon Profil" icon={Users} />
              <NavItem id="subscription" label="Abonnement" icon={CreditCard} />
            </>
          )}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-teal-900/40 border border-teal-800/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-md border border-teal-400/30">
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold truncate text-teal-50">{user.firstName}</p>
                    <p className="text-xs text-teal-400 truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 py-2 rounded-lg transition-all text-xs font-medium border border-red-500/10 hover:border-red-500/30 group"
            >
                <LogOut size={14} className="group-hover:text-red-100" />
                <span>Déconnexion</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6 flex-1">
                <div>
                   <h2 className="text-xl font-bold text-slate-800 capitalize">
                      {currentView.replace('-', ' ')}
                   </h2>
                </div>

                <div className="relative w-full max-w-lg hidden md:block group ml-8">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full bg-slate-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />
                    {isSearchFocused && searchQuery && (
                        <div className="absolute mt-3 w-full bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50">
                            {searchResults.length > 0 ? (
                                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                    {searchResults.map((result, index) => (
                                        <li key={index} onClick={() => handleResultClick(result)} className="cursor-pointer hover:bg-teal-50 p-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-semibold text-gray-800">{result.type === 'Class' ? result.data.name : result.type === 'Student' ? result.data.firstName : result.data.title}</p>
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{result.type}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<div className="p-6 text-center text-gray-400 text-sm">Rien trouvé.</div>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Prayer Times Widget */}
                {prayerTimes && (
                    <div className="hidden lg:flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-full text-xs shadow-md">
                        <Clock size={14} className="text-amber-400" />
                        <span>Prochaine prière : <strong className="text-white">{nextPrayer}</strong> ({nextPrayer && prayerTimes[nextPrayer]})</span>
                        <span className="opacity-50">| Dakar</span>
                    </div>
                )}
                
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
                        <Bell size={20} />
                        {pendingEnrollmentsCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>}
                    </button>
                    {/* Same notification dropdown logic as before... */}
                </div>
            </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
            {children}
        </div>
      </main>
    </div>
  );
};
