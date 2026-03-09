'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// ПРИОРИТЕТ: Используем переменную окружения, если она задана в хостинге. 
// Иначе откатываемся к 1234 только для локальной разработки.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '1234';
const SESSION_STORAGE_KEY = 'db_admin_react_v2';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Storage initialization failed:', e);
    }
  }, []);

  const login = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        setIsAdmin(true);
        
        toast({
          title: 'Доступ разрешен',
          description: 'Вы вошли в режим администратора DartBrig Pro.',
        });
        
        router.push('/admin');
      } catch (e) {
         toast({
            title: 'Ошибка сессии',
            description: 'Не удалось сохранить сессию. Проверьте настройки приватности браузера.',
            variant: 'destructive',
         });
      }
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Введен неверный пароль администратора.',
        variant: 'destructive',
      });
    }
  }, [toast, router]);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setIsAdmin(false);
      toast({
        title: 'Выход выполнен',
        description: 'Режим администратора отключен.',
      });
      router.push('/');
    } catch (e) {
        setIsAdmin(false);
    }
  }, [toast, router]);

  const value = { isAdmin, login, logout };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
