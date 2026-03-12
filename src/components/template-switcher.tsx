'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Wand2, LayoutGrid } from 'lucide-react';

export type TemplateId = 
    | 'classic' 
    | 'modern' 
    | 'dynamic' 
    | 'elite' 
    | 'cyber' 
    | 'retro' 
    | 'impact' 
    | 'minimal' 
    | 'arena' 
    | 'stealth';

interface TemplateSwitcherProps {
    selectedTemplate: TemplateId;
    onTemplateChange: (template: TemplateId) => void;
}

const templates: { id: TemplateId, name: string, desc: string }[] = [
    { id: 'classic', name: 'Классический', desc: 'Стеклянный эффект и фон' },
    { id: 'modern', name: 'Современный', desc: 'Минимализм и разделение' },
    { id: 'dynamic', name: 'Динамичный', desc: 'Неоновые акценты' },
    { id: 'elite', name: 'Элитный', desc: 'Золото и премиум' },
    { id: 'cyber', name: 'Киберпанк', desc: 'Цифровой стиль будущего' },
    { id: 'retro', name: 'Ретро', desc: 'Стиль игровых автоматов' },
    { id: 'impact', name: 'Импакт', desc: 'Акцент на фото и тени' },
    { id: 'minimal', name: 'Минимал', desc: 'Только важная информация' },
    { id: 'arena', name: 'Стадион', desc: 'Эффект арены и света' },
    { id: 'stealth', name: 'Стелс', desc: 'Глубокий черный и матовость' },
];

export function TemplateSwitcher({ selectedTemplate, onTemplateChange }: TemplateSwitcherProps) {
    return (
        <Card className="glassmorphism border-primary/20">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 uppercase tracking-tighter">
                    <LayoutGrid className="text-primary h-5 w-5"/>
                    Дизайн-система
                </CardTitle>
                <CardDescription>
                    Выберите один из 10 мастер-шаблонов для оформления профиля.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    defaultValue={selectedTemplate}
                    onValueChange={(value: TemplateId) => onTemplateChange(value)}
                    className="grid grid-cols-1 gap-2"
                >
                    {templates.map(template => (
                         <div key={template.id} className="relative">
                            <RadioGroupItem value={template.id} id={`template-${template.id}`} className="peer sr-only" />
                            <Label 
                                htmlFor={`template-${template.id}`}
                                className="flex flex-col p-3 rounded-xl border-2 border-white/5 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <span className="font-bold text-sm uppercase tracking-tight">{template.name}</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-medium">{template.desc}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
