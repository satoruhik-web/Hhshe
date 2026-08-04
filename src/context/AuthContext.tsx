import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: number;
  username: string;
  phone?: string;
  balance: number;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('telzo_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Fetch fresh data
        fetch('/api/auth/me?id=' + parsed.id)
          .then(res => res.json())
          .then(data => {
              if (data.success) {
                  setUser(data.user);
                  localStorage.setItem('telzo_user', JSON.stringify(data.user));
              } else {
                  setUser(null);
                  localStorage.removeItem('telzo_user');
              }
          })
          .catch(() => {})
          .finally(() => setIsInitialized(true));
        return;
      } catch(e) {}
    }
    setIsInitialized(true);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('telzo_user', JSON.stringify(userData));
  };

  const logout = () => { setUser(null); localStorage.removeItem('telzo_user'); window.location.href = '/auth'; };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('telzo_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
