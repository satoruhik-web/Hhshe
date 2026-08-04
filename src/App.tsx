import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';

// Shop Pages
import { Catalog } from './pages/Catalog';
import { TopUp } from './pages/TopUp';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';

function TopupHandler({ children }: { children: React.ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const topupToken = searchParams.get('topup_token');
    const { user, updateBalance } = useAuth();
    
    useEffect(() => {
        if (topupToken && user) {
            fetch('/api/topup/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: topupToken, phone: user.phone })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success('Баланс успешно пополнен!');
                    updateBalance(data.balance);
                } else {
                    toast.success(data.message);
                }
                searchParams.delete('topup_token');
                setSearchParams(searchParams);
            });
        }
    }, [topupToken, user]);
    
    return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuth();
    const location = useLocation();
    
    if (!isInitialized) return null; // or a loading spinner
    
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-center" />
      <AuthProvider>
        <LanguageProvider>
        <TopupHandler>
          <Routes>
            {/* Shop Routes */}
            <Route path="/" element={<ProtectedRoute><Layout><Catalog /></Layout></ProtectedRoute>} />
            <Route path="/topup" element={<ProtectedRoute><Layout><TopUp /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
                      
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </TopupHandler>
      </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
