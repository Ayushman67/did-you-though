'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { 
  Home, 
  Users, 
  Calendar, 
  Trash2, 
  CheckCircle2,
  Flame,
  LogOut,
  LogIn,
  User
} from 'lucide-react';
import AuthModal from './AuthModal';

interface SidebarProps {
  activeTab: 'home' | 'people' | 'meetings';
  onTabChange: (tab: 'home' | 'people' | 'meetings') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const { tasks, clearAllData } = useData();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const openTasks = tasks.filter(t => t.status === 'Open').length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const completionRate = tasks.length > 0 
    ? Math.round((doneTasks / tasks.length) * 100) 
    : 0;

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'people' as const, label: 'People', icon: Users },
    { id: 'meetings' as const, label: 'Meetings', icon: Calendar },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <aside className="w-60 border-r border-border bg-surface flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Flame className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">DidYouThough?</h1>
              <p className="text-xs text-text-muted">Accountability Engine</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          {authLoading ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-white">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${activeTab === item.id 
                    ? 'bg-accent-light text-accent' 
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Progress Section */}
        {user && (
          <div className="p-4 border-t border-border">
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-secondary font-medium">Progress</span>
                <span className="text-text-primary font-semibold">{completionRate}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span>{openTasks} open</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>{doneTasks} done</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-1">
          {user && (
            <>
              <button
                onClick={clearAllData}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all data
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          )}
        </div>
      </aside>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
