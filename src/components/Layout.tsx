import React from 'react';
import { Navigation } from './Navigation';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white pb-24">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
          Telzo Shop
        </h1>
      </div>
      <main className="max-w-4xl mx-auto p-4 pt-8">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  );
}
