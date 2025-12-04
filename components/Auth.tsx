import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { UserRole, User, SubscriptionPlan } from '../types';
import { LogIn, UserPlus, Shield, GraduationCap, ChevronRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [targetRole, setTargetRole] = useState<UserRole>(UserRole.STUDENT);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: 'Homme' as 'Homme' | 'Femme'
  });
  const [error, setError] = useState('');

  const logoUrl = "https://file-service-104866657805.us-central1.run.app/files/aa932470-360d-4702-8618-f2b3e8e74a87";

  const handleRoleChange = (role: UserRole) => {
    setTargetRole(role);
    setError('');
    if (role === UserRole.ADMIN) {
      setIsLogin(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = storageService.login(formData.email, formData.password);
      if (user) {
        if (user.role !== targetRole) {
            setError(
                targetRole === UserRole.ADMIN 
                ? "Ce compte n'a pas les droits d'administrateur." 
                : "Veuillez vous connecter via l'espace Administration."
            );
            return;
        }
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: UserRole.STUDENT,
        gender: formData.gender,
        joinedAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        badges: [],
        subscriptionPlan: SubscriptionPlan.FREE,
        referralCode: '' // Generated in storageService
      };

      const success = storageService.register(newUser);
      if (success) {
        alert('Compte créé avec succès ! Connectez-vous maintenant.');
        setIsLogin(true);
      } else {
        setError('Cet email est déjà utilisé.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#042f2e] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decor Elements matching logo curves */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-teal-800/20 blur-3xl"></div>
         <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-3xl"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 overflow-hidden z-10 transition-all duration-300 min-h-[600px]">
        
        {/* Left Side: Brand Visual */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-[#0f3d3e] to-[#042f2e] text-white p-8 flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white rounded-full"></div>
                <div className="absolute right-0 top-0 transform translate-x-1/3 -translate-y-1/3 w-80 h-80 border border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
                <img src={logoUrl} alt="Logo" className="w-24 h-24 mb-6 drop-shadow-lg" />
                <h1 className="text-3xl font-bold mb-2">Bienvenue sur Quran SN</h1>
                <p className="text-teal-200 text-sm leading-relaxed opacity-90">
                    Rejoignez une communauté dédiée à l'apprentissage du Saint Coran. Progressez à votre rythme avec des outils modernes.
                </p>
            </div>

            <div className="relative z-10 text-xs text-teal-400">
                &copy; 2024 Quran Senegal. Tous droits réservés.
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center bg-white">
            
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
                 <img src={logoUrl} alt="Logo" className="w-20 h-20 mx-auto mb-2" />
                 <h2 className="text-2xl font-bold text-[#042f2e]">Quran SN</h2>
            </div>

            {/* Role Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 self-center w-full max-w-sm">
            <button
                onClick={() => handleRoleChange(UserRole.STUDENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                targetRole === UserRole.STUDENT 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <GraduationCap size={18} /> Élève
            </button>
            <button
                onClick={() => handleRoleChange(UserRole.ADMIN)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                targetRole === UserRole.ADMIN 
                    ? 'bg-white text-teal-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Shield size={18} /> Admin
            </button>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isLogin ? 'Bon retour parmi nous' : 'Créer un compte'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    {isLogin 
                        ? 'Veuillez saisir vos identifiants pour continuer.' 
                        : 'Remplissez le formulaire ci-dessous pour commencer.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && targetRole === UserRole.STUDENT && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <input
                            type="text"
                            placeholder="Prénom"
                            required
                            className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div className="group">
                            <input
                            type="text"
                            placeholder="Nom"
                            required
                            className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.lastName}
                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value as any})}
                        >
                            <option value="Homme">Homme</option>
                            <option value="Femme">Femme</option>
                        </select>
                        <input
                            type="tel"
                            placeholder="Téléphone"
                            required
                            className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <input
                    type="email"
                    placeholder="Adresse email"
                    required
                    className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    required
                    className="w-full p-3.5 bg-slate-50 rounded-xl border-slate-200 border focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>

            <button
                type="submit"
                className={`w-full font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg mt-6 ${
                    targetRole === UserRole.ADMIN 
                    ? 'bg-teal-900 hover:bg-teal-950 text-white shadow-teal-900/30' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
                }`}
            >
                {isLogin ? (
                    <><LogIn size={20} /> Se connecter</>
                ) : (
                    <><UserPlus size={20} /> Créer mon compte</>
                )}
            </button>

            {targetRole === UserRole.STUDENT && (
                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-teal-600 font-medium hover:text-teal-800 transition-colors text-sm flex items-center justify-center gap-1 mx-auto"
                    >
                        {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
            </form>
        </div>
      </div>
    </div>
  );
};