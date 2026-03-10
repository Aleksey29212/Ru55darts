'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/context/admin-context';
import { useRouter } from 'next/navigation';
import { landscapeImages, aphorisms } from '@/lib/gate-data';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Unlock, ShieldAlert } from 'lucide-react';

type Aphorism = {
  text: string;
  author: string;
};

export default function GatePage() {
  const { isAdmin, login } = useAdmin();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedAphorism, setSelectedAphorism] = useState<Aphorism | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    setSelectedImage(landscapeImages[Math.floor(Math.random() * landscapeImages.length)]);
    setSelectedAphorism(aphorisms[Math.floor(Math.random() * aphorisms.length)]);
  }, []);

  useEffect(() => {
    if (showLoginForm) {
        setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [showLoginForm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLoggingIn) return;
    
    setIsLoggingIn(true);
    login(password);
    
    setTimeout(() => {
        setIsLoggingIn(false);
    }, 800);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 sm:p-8 overflow-x-hidden">
      <div className="w-full max-w-3xl flex flex-col items-center gap-12 relative">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Image Frame - ALWAYS ON TOP, NEVER OVERLAPPED */}
        <div className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-neutral-800 to-neutral-900 p-4 shadow-2xl shadow-black/50 ring-2 ring-white/5 group transition-transform duration-500 hover:scale-[1.01]">
            <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-inner shadow-black/50">
                {selectedImage ? (
                    <Image
                        src={selectedImage}
                        alt="Inspiring landscape"
                        fill
                        className="object-cover transition-transform duration-[15s] group-hover:scale-110"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-700 animate-pulse"></div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Hidden Access Trigger (The Lambda) */}
                <div 
                    className="absolute bottom-4 left-4 z-20 h-16 w-16 cursor-pointer select-none group/lambda flex items-center justify-center interactive-scale"
                    onClick={() => setShowLoginForm(!showLoginForm)}
                    title="Вход в систему"
                >
                    <span className="font-headline text-5xl text-white/5 transition-all group-hover/lambda:text-white/40 group-hover/lambda:scale-110 drop-shadow-lg">
                    λ
                    </span>
                </div>

                {isLoggingIn && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="font-headline text-white uppercase tracking-widest text-sm">Проверка ключа...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Dynamic Content Area: replaces aphorism with login form */}
        <div className="w-full max-w-md relative min-h-[240px] flex items-center justify-center">
            {/* Aphorism Text */}
            <div className={cn(
                "text-center transition-all duration-500 absolute inset-0 flex flex-col justify-center items-center",
                showLoginForm ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
            )}>
                {selectedAphorism && (
                    <>
                    <p className="font-headline text-2xl md:text-3xl text-foreground/90 leading-tight">
                        &ldquo;{selectedAphorism.text}&rdquo;
                    </p>
                    <p className="mt-4 text-primary font-bold uppercase tracking-widest text-xs opacity-60">
                        &mdash; {selectedAphorism.author}
                    </p>
                    </>
                )}
            </div>

            {/* Login Form Card */}
            <div className={cn(
                "w-full transition-all duration-500",
                showLoginForm ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
            )}>
                <div className="glassmorphism p-8 rounded-[2.5rem] border-primary/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-headline text-xl uppercase tracking-tighter">Панель управления</h3>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Введите пароль доступа</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Input
                                ref={passwordInputRef}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/40 border-white/10 text-white h-14 rounded-2xl px-6 text-xl tracking-widest focus:ring-primary focus:border-primary/50 transition-all"
                                disabled={isLoggingIn}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setShowLoginForm(false)}
                                className="h-14 rounded-2xl flex-1 font-bold uppercase tracking-widest text-xs interactive-scale"
                            >
                                Отмена
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoggingIn || !password}
                                className="h-14 rounded-2xl flex-[2] font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 interactive-scale"
                            >
                                {isLoggingIn ? <Loader2 className="animate-spin h-5 w-5" /> : <Unlock className="h-5 w-5 mr-2" />}
                                Войти в систему
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
