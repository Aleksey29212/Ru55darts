'use client';

import { useAdmin } from "@/context/admin-context";
import { useRouter } from 'next/navigation';
import { Pi } from 'lucide-react';
import { useIsClient } from "@/hooks/use-is-client";

export function AdminLoginTrigger() {
    const { isAdmin } = useAdmin();
    const router = useRouter();
    const isClient = useIsClient();

    const handleClick = () => {
        if (isAdmin) {
            router.push('/admin');
        } else {
            router.push('/gate');
        }
    };

    return (
        <div 
            className="fixed bottom-4 right-4 p-4 cursor-pointer z-[100] group flex items-center justify-center h-16 w-16" 
            onClick={handleClick} 
            title={isAdmin ? "Перейти в панель администратора" : "Вход для администратора"}
        >
             {isClient && (
                <Pi className="h-1 w-1 text-primary opacity-5 group-hover:opacity-20 transition-opacity" />
             )}
        </div>
    )
}
