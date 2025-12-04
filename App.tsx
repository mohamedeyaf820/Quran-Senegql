
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { AdminStats, AdminClasses, AdminStudents, AdminContent, AdminEnrollments } from './components/AdminViews';
import { StudentClasses, StudentClassroom, StudentProfile, StudentResources, StudentForum, StudentSubscription } from './components/StudentViews';
import { storageService } from './services/storageService';
import { User, UserRole, EnrollmentStatus } from './types';
import { BookOpen, CheckCircle, Award } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    storageService.init();
    const storedUser = storageService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentView(storedUser.role === UserRole.ADMIN ? 'dashboard' : 'my-classes');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === UserRole.ADMIN ? 'dashboard' : 'my-classes');
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (user.role === UserRole.ADMIN) {
      switch (currentView) {
        case 'dashboard': return <AdminStats />;
        case 'classes': return <AdminClasses />;
        case 'students': return <AdminStudents />;
        case 'enrollments': return <AdminEnrollments />;
        case 'content': return <AdminContent />;
        default: return <AdminStats />;
      }
    } else {
      switch (currentView) {
        case 'browse': return <StudentClasses currentUser={user} />;
        case 'my-classes': return <StudentClassroom currentUser={user} />;
        case 'resources': return <StudentResources currentUser={user} />;
        case 'forum': return <StudentForum currentUser={user} />;
        case 'subscription': return <StudentSubscription currentUser={user} />;
        case 'profile': return <StudentProfile currentUser={user} />;
        default: return <StudentClassroom currentUser={user} />;
      }
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentView={currentView} 
      onViewChange={setCurrentView}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
