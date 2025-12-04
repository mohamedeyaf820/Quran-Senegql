import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, EnrollmentStatus, LiveSession, Notification } from '../types';
import { storageService } from '../services/storageService';
import { LogOut, LayoutDashboard, BookOpen, Users, FolderOpen, Search, GraduationCap, Video, Bell, ChevronRight, MessageSquare, Library, CreditCard, Moon, Sun, Clock, WifiOff, Calendar as CalendarIcon, ChevronLeft, X, AlertCircle, Book, Menu, FileText } from 'lucide-react';
import { ChatBot } from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Toast: React.FC<{ notification: Notification, onClose: () => void }> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        INFO: 'bg-blue-600',
        SUCCESS: 'bg-green-600',
        WARNING: 'bg-amber-600',
        ERROR: 'bg-red-600'
    };

    return (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-auto md:right-4 z-[70] ${bgColors[notification.type]} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in min-w-[300px]`}>
            <div className="flex-1">
                <h4 className="font-bold text-sm">{notification.title}</h4>
                <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={16}/></button>
        </div>
    );
};

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
  const [darkMode, setDarkMode] = useState(false); 
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<LiveSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  // Toasts
  const [toasts, setToasts] = useState<Notification[]>([]);
  
  const notifiedLivesRef = useRef<Set<string>>(new Set());
  const logoUrl = "/logo.svg";

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch Lives for Calendar
    setLives(storageService.getLives());

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

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll for new notifications to show as toasts
  useEffect(() => {
      const interval = setInterval(() => {
          const notifs = storageService.getNotifications(user.id);
          // Simple logic: find recent unread notifs (last 5 sec) that haven't been toasted
          // For this demo, we just check manually added ones or rely on local state updates if we had a robust store
      }, 5000);
      return () => clearInterval(interval);
  }, [user.id]);

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

  // STUDENT NOTIFICATION LOGIC (Live Sessions)
  useEffect(() => {
    if (user.role !== UserRole.STUDENT) return;

    const checkUpcomingLives = () => {
        const allLives = storageService.getLives();
        const classes = storageService.getClasses();
        // Get classes where user is enrolled
        const myClassIds = classes.filter(c => c.studentIds.includes(user.id)).map(c => c.id);
        
        const now = new Date();

        allLives.forEach(live => {
            // Check if live is for one of my classes
            if (!myClassIds.includes(live.classId)) return;

            const liveDate = new Date(live.scheduledAt);
            const diffMs = liveDate.getTime() - now.getTime();
            const diffMins = diffMs / (1000 * 60);

            // If start time is within 60 minutes from now and haven't notified yet
            if (diffMins > 0 && diffMins <= 60 && !notifiedLivesRef.current.has(live.id)) {
                const notif = {
                    id: Date.now().toString(),
                    userId: user.id,
                    title: 'Rappel Cours en Direct',
                    message: `Le cours "${live.title}" commence dans ${Math.ceil(diffMins)} minutes.`,
                    type: 'INFO' as const,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    linkTo: 'my-classes'
                };
                storageService.createNotification(notif);
                notifiedLivesRef.current.add(live.id);
                // Trigger notification badge update visually
                setPendingEnrollmentsCount(prev => prev + 1);
                // Show Toast
                setToasts(prev => [...prev, notif]);
            }
        });
    };

    const interval = setInterval(checkUpcomingLives, 60000); // Check every minute
    checkUpcomingLives(); // Run immediately

    return () => clearInterval(interval);
  }, [user]);

  // --- Search Logic ---
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

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 = Sunday
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
    setSelectedDate(null);
    setSelectedDayEvents([]);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    const targetDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const events = lives.filter(l => {
        const d = new Date(l.scheduledAt);
        return d.getDate() === day && d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear();
    });
    setSelectedDayEvents(events);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const startDay = getFirstDayOfMonth(calendarDate); // 0 (Sun) to 6 (Sat)
    
    // Adjust for Monday start (Optional, sticking to Sunday for simplicity or custom logic)
    // Let's assume standard Sunday start for grid
    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full animate-in zoom-in duration-200">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-700 p-4 text-white flex justify-between items-center shadow-md">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft size={20}/></button>
                <h3 className="font-bold text-lg">{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronRight size={20}/></button>
            </div>

            <div className="p-4">
                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-gray-400">
                    <div>DIM</div><div>LUN</div><div>MAR</div><div>MER</div><div>JEU</div><div>VEN</div><div>SAM</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10"></div>)}
                    {days.map(day => {
                        const dateObj = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                        const isToday = new Date().toDateString() === dateObj.toDateString();
                        const dayEvents = lives.filter(l => {
                            const d = new Date(l.scheduledAt);
                            return d.getDate() === day && d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear();
                        });
                        const hasEvent = dayEvents.length > 0;
                        const isSelected = selectedDate === day;

                        return (
                            <button 
                                key={day} 
                                onClick={() => handleDateClick(day)}
                                className={`h-10 rounded-lg flex flex-col items-center justify-center relative text-sm transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-teal-600 text-white font-bold shadow-md transform scale-105 z-10' 
                                        : isToday 
                                            ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200' 
                                            : 'hover:bg-gray-100 text-gray-700'}
                                `}
                            >
                                {day}
                                {hasEvent && (
                                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'} ${isToday ? 'animate-pulse' : ''}`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Events List for Selected Day */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 min-h-[150px]">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <CalendarIcon size={12}/>
                    {selectedDate 
                        ? `Événements du ${selectedDate} ${monthNames[calendarDate.getMonth()]}` 
                        : "Sélectionnez une date"}
                </h4>
                {selectedDate && selectedDayEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-4">
                        <span className="text-xs italic">Aucun cours en direct prévu ce jour-là.</span>
                    </div>
                )}
                <div className="space-y-2">
                    {selectedDayEvents.map(evt => (
                        <div key={evt.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                            <div className="bg-red-50 text-red-600 p-2 rounded-lg shrink-0">
                                <Video size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{evt.title}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={10}/>
                                    {new Date(evt.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {evt.platform}
                                </p>
                            </div>
                            <a href={evt.meetingLink} target="_blank" rel="noreferrer" className="text-teal-600 text-xs font-bold hover:underline px-2 py-1 rounded bg-teal-50">Rejoindre</a>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-2 border-t border-gray-100 text-center">
                <button onClick={() => setShowCalendar(false)} className="text-sm text-gray-500 hover:text-gray-800 py-2 w-full">Fermer</button>
            </div>
        </div>
    );
  };

  const NavItem = ({ id, label, icon: Icon }: any) => {
    const isActive = currentView === id;
    return (
        <button
        onClick={() => {
            onViewChange(id);
            if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close on mobile after click
        }}
        className={`w-full flex items-center space-x-3 px-6 py-3 my-1.5 mx-2 rounded-xl transition-all duration-300 group max-w-[90%] ${
            isActive 
            ? 'bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-900/20 border-l-4 border-cyan-400 transform translate-x-1' 
            : 'text-teal-100/70 hover:bg-white/10 hover:text-white hover:pl-7'
        }`}
        >
        <Icon size={20} className={`transition-transform duration-300 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-200 group-hover:scale-110"}`} />
        <span className={`font-medium tracking-wide text-sm ${isActive ? 'text-white' : ''}`}>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>}
        </button>
    );
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50'}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Responsive */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-b from-[#042f2e] via-[#115e59] to-[#042f2e] text-white flex flex-col shadow-2xl z-40 border-r border-teal-900/50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 pb-6 flex flex-col items-center justify-center border-b border-white/10 bg-white/5 backdrop-blur-sm relative">
            {/* Close Button Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>

            <div className="relative w-20 h-20 mb-4 rounded-full shadow-[0_0_30px_rgba(45,212,191,0.3)] bg-gradient-to-br from-teal-400 to-emerald-600 p-0.5">
                <div className="w-full h-full bg-[#042f2e] rounded-full overflow-hidden flex items-center justify-center">
                    <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
                </div>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">Quran SN</h1>
            <p className="text-teal-300 text-[10px] mt-1 uppercase tracking-[0.25em] font-medium opacity-80">{isAdmin ? 'Admin' : 'Espace Élève'}</p>
        </div>

        {/* XP Bar for Students */}
        {!isAdmin && (
             <div className="px-6 py-5 bg-black/20 backdrop-blur-md border-b border-white/5">
                 <div className="flex justify-between text-xs text-teal-200 mb-2 font-medium">
                     <span>Niveau {user.level || 1}</span>
                     <span>{user.xp || 0} XP</span>
                 </div>
                 <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden shadow-inner border border-white/10">
                     <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 h-2 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${Math.min((user.xp % 100) || 0, 100)}%` }}></div>
                 </div>
             </div>
        )}

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {isAdmin ? (
            <>
              <div className="px-6 mb-2 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-widest">Gestion</div>
              <NavItem id="dashboard" label="Tableau de bord" icon={LayoutDashboard} />
              <NavItem id="classes" label="Classes" icon={BookOpen} />
              <NavItem id="students" label="Élèves" icon={Users} />
              <div className="px-6 mb-2 mt-6 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-widest">Contenu</div>
              <NavItem id="enrollments" label="Inscriptions" icon={GraduationCap} />
              <NavItem id="content" label="Médiathèque" icon={FolderOpen} />
            </>
          ) : (
            <>
              <div className="px-6 mb-2 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-widest">Mon Parcours</div>
              <NavItem id="my-classes" label="Mes Cours" icon={BookOpen} />
              <NavItem id="quran" label="Coran (Mushaf)" icon={Book} />
              <NavItem id="browse" label="Explorer" icon={Search} />
              <NavItem id="resources" label="Ressources" icon={Library} />
              <div className="px-6 mb-2 mt-6 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-widest">Communauté</div>
              <NavItem id="forum" label="Forum & Groupes" icon={MessageSquare} />
              <div className="px-6 mb-2 mt-6 text-[10px] font-extrabold text-teal-400/80 uppercase tracking-widest">Personnel</div>
              <NavItem id="profile" label="Mon Profil" icon={Users} />
              <NavItem id="subscription" label="Abonnement" icon={CreditCard} />
            </>
          )}
        </nav>

        <div className="p-4 m-4 mt-2 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white/20">
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold truncate text-white">{user.firstName}</p>
                    <p className="text-xs text-teal-200 truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 py-2.5 rounded-xl transition-all text-xs font-bold border border-red-500/20 hover:border-red-500/40 group shadow-sm hover:shadow-red-900/20"
            >
                <LogOut size={16} className="group-hover:text-red-100 transition-transform group-hover:-translate-x-1" />
                <span>Déconnexion</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-slate-50 relative flex flex-col w-full">
        {/* Offline Banner */}
        {isOffline && (
            <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top-full">
                <WifiOff size={16} />
                Mode Hors Ligne Activé - Vous avez accès à votre contenu téléchargé.
            </div>
        )}

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Hamburger */}
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>

                <div>
                   <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight truncate">
                      {currentView.replace('-', ' ')}
                   </h2>
                </div>

                <div className="relative w-full max-w-lg hidden md:block group ml-8">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full bg-slate-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm shadow-sm"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />
                    {isSearchFocused && searchQuery && (
                        <div className="absolute mt-3 w-full bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            {searchResults.length > 0 ? (
                                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                                    {searchResults.map((result, index) => (
                                        <li key={index} onClick={() => handleResultClick(result)} className="cursor-pointer hover:bg-teal-50 p-3 px-4 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg shrink-0 ${
                                                    result.type === 'Class' ? 'bg-blue-100 text-blue-600' : 
                                                    result.type === 'Student' ? 'bg-purple-100 text-purple-600' : 
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {result.type === 'Class' && <BookOpen size={20} />}
                                                    {result.type === 'Student' && <Users size={20} />}
                                                    {result.type === 'Content' && <FileText size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-gray-800 truncate">
                                                            {result.type === 'Class' ? result.data.name : 
                                                             result.type === 'Student' ? `${result.data.firstName} ${result.data.lastName}` : 
                                                             result.data.title}
                                                        </p>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">{result.type}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                        {result.type === 'Class' ? `Niveau: ${result.data.level}` : 
                                                         result.type === 'Student' ? result.data.email : 
                                                         `Type: ${result.data.type}`}
                                                    </p>
                                                    <p className="text-[10px] text-teal-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                                                        Voir les détails <ChevronRight size={10} />
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<div className="p-6 text-center text-gray-400 text-sm">Aucun résultat trouvé pour "{searchQuery}".</div>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Prayer Times Widget */}
                {prayerTimes && (
                    <div className="hidden lg:flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-full text-xs shadow-md border border-slate-700/50">
                        <Clock size={14} className="text-amber-400" />
                        <span>Prochaine prière : <strong className="text-white">{nextPrayer}</strong> ({nextPrayer && prayerTimes[nextPrayer]})</span>
                        <span className="opacity-50 border-l border-white/20 pl-2 ml-1">Dakar</span>
                    </div>
                )}
                
                {/* Calendar Button */}
                <button 
                    onClick={() => setShowCalendar(true)} 
                    className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 relative transition-all hover:scale-105 active:scale-95"
                    title="Calendrier des Lives"
                >
                    <CalendarIcon size={20} />
                </button>

                <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-all hover:scale-105 active:scale-95 hidden md:block">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 relative transition-all hover:scale-105 active:scale-95">
                        <Bell size={20} />
                        {pendingEnrollmentsCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                    </button>
                </div>
            </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            {children}
        </div>

        {/* Toasts Container */}
        <div className="pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast notification={toast} onClose={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>

      </main>

      {/* Calendar Modal */}
      {showCalendar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="relative w-full max-w-lg">
                  <button 
                      onClick={() => setShowCalendar(false)}
                      className="absolute -top-12 right-0 text-white hover:text-gray-200 bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors"
                  >
                      <X size={24} />
                  </button>
                  {renderCalendar()}
              </div>
          </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 ring-4 ring-red-50/50">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Déconnexion</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={confirmLogout}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ChatBot Overlay */}
      <ChatBot user={user} />
    </div>
  );
};