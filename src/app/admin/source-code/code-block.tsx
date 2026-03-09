'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast({
      title: "Код скопирован",
      description: "Вы можете вставить его в другой редактор или ИИ.",
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button size="sm" variant="secondary" onClick={handleCopy} className="gap-2">
          {hasCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {hasCopied ? 'Скопировано' : 'Копировать'}
        </Button>
      </div>
      <pre className="p-6 bg-neutral-950 text-neutral-50 overflow-x-auto font-mono text-sm leading-relaxed max-h-[600px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
