import { getPartners } from '@/lib/partners';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, Store, ShoppingBag, Star, BadgeCheck, ArrowRight, Send, Gamepad2, Globe, ExternalLink, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { getSponsorshipSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import type { PartnerCategory } from '@/lib/types';
import Link from 'next/link';

const categoryConfig: Record<PartnerCategory, { 
    label: string; 
    icon: React.ElementType; 
    color: string;
    buttonText: string;
    buttonIcon: React.ElementType;
}> = {
    shop: { label: 'Магазин', icon: Store, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', buttonText: 'Перейти в магазин', buttonIcon: ShoppingBag },
    platform: { label: 'Игровая платформа', icon: Gamepad2, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', buttonText: 'На платформу', buttonIcon: Gamepad2 },
    media: { label: 'Инфо-партнер', icon: Globe, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', buttonText: 'На сайт', buttonIcon: ExternalLink },
    other: { label: 'Партнер', icon: Star, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', buttonText: 'Подробнее', buttonIcon: ExternalLink },
};


export default async function PartnersPage() {
    const partners = await getPartners();
    const settings = await getSponsorshipSettings();

    return (
        <main className="container py-12 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500">
                        <Handshake className="h-4 w-4" />
                        Наше сообщество растет
                    </div>
                    <h1 className="text-4xl md:text-7xl font-headline text-primary text-glow drop-shadow-2xl uppercase tracking-tighter">Наши партнеры</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Компании и бренды, которые разделяют нашу страсть к дартсу и поддерживают профессиональное развитие игроков.
                    </p>
                </div>

                <div className="flex justify-center pt-4">
                    <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group">
                        <a href="#become-partner">
                            <PlusCircle className="mr-3 h-6 w-6" />
                            Стать партнером проекта
                            <ArrowRight className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </a>
                    </Button>
                </div>
            </section>

            {/* Recruitment Section (NOW ABOVE PARTNERS GRID) */}
            <section id="become-partner" className="space-y-12 animate-in fade-in duration-1000">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-headline uppercase tracking-tight">Ваш бизнес в DartBrig Pro</h2>
                    <p className="text-muted-foreground text-lg font-medium">Выберите формат интеграции, который подходит именно вам.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
                    {/* Banner 1: Shop placement */}
                    <Card className="glassmorphism border-accent/50 bg-gradient-to-br from-accent/10 to-background/50 overflow-hidden relative group hover:border-accent transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShoppingBag className="h-48 w-48 -mr-12 -mt-12 text-accent" />
                        </div>
                        <CardHeader className="relative z-10 pb-8">
                            <div className="bg-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/10 border border-accent/20">
                                <ShoppingBag className="text-accent h-8 w-8" />
                            </div>
                            <CardTitle className="text-3xl font-headline">МАГАЗИН В СИСТЕМЕ</CardTitle>
                            <CardDescription className="text-base text-foreground/70 font-medium">
                                Прямые продажи и лояльность активной аудитории.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 relative z-10">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-accent shrink-0" />
                                    <span>Ссылки в карточках ТОП-игроков</span>
                                </li>
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-accent shrink-0" />
                                    <span>Логотип в сквозной ротации сайта</span>
                                </li>
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-accent shrink-0" />
                                    <span>Система промокодов для игроков</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground font-black py-8 text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-accent/5" asChild>
                                <a href={settings.adminVkLink} target="_blank" rel="noopener noreferrer">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current mr-3" xmlns="http://www.w3.org/2000/svg"><path d="M15.073 2H8.937C3.333 2 2 3.333 2 8.937v6.136C2 20.667 3.333 22 8.927 22h6.136c5.604 0 6.937-1.333 6.937-6.937V8.937C22 3.333 20.667 2 15.073 2zm3.51 13.172c0 3.125-2.406 3.125-2.406 3.125h-1.146s-.344-.042-.531-.25c-.188-.208-.49-.646-.49-.646s-.312-.417-.562-.385c-.25.03-.312.323-.312.323s-.02.448-.313.625c-.29.177-.812.135-.812.135h-.5s-1.5-.104-2.812-1.562c-1.313-1.458-2.469-4.333-2.469-4.333s-.166-.417.02-.625c.188-.208.646-.208.646-.208h1.25s.188.02.313.125c.125.104.198.292.198.292s.208.531.48 1.01c.541.958.77 1.22.968 1.22.198 0 .28-.125.28-.73 0-1.187-.187-1.687-.541-1.937-.282-.198-.49-.25-.375-.458.115-.208.458-.208.792-.208h1.937s.25.03.375.156c.125.125.115.365.115.365s-.02 1.26.25 1.49c.188.156.438-.156.979-1.22.271-.531.469-1.125.469-1.125s.062-.146.166-.219c.104-.073.25-.052.25-.052h1.312s.396-.052.458.125c.062.177-.083.583-.083.583s-.521 1.219-1.104 2.135c-.438.688-.563.865-.146 1.25.417.385 1.115 1.073 1.51 1.562.292.365.51.667.51.667s.156.23.01.385c-.145.156-.427.146-.427.146z"/></svg>
                                    СВЯЗАТЬСЯ С АДМИНОМ
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Banner 2: Tournament Sponsor */}
                    <Card className="glassmorphism border-primary/50 bg-gradient-to-br from-primary/10 to-background/50 overflow-hidden relative group hover:border-primary transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Star className="h-48 w-48 -mr-12 -mt-12 text-primary" />
                        </div>
                        <CardHeader className="relative z-10 pb-8">
                            <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/10 border border-primary/20">
                                <Star className="text-primary h-8 w-8" />
                            </div>
                            <CardTitle className="text-3xl font-headline">ГЕНЕРАЛЬНЫЙ СПОНСОР</CardTitle>
                            <CardDescription className="text-base text-foreground/70 font-medium">
                                Интеграция бренда в структуру лиг и турниров.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 relative z-10">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-primary shrink-0" />
                                    <span>Брендирование названий целых лиг</span>
                                </li>
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-primary shrink-0" />
                                    <span>Охват в социальных сетях проекта</span>
                                </li>
                                <li className="flex items-start gap-4 text-sm font-bold">
                                    <BadgeCheck className="h-6 w-6 text-primary shrink-0" />
                                    <span>Присутствие на церемониях награждения</span>
                                </li>
                            </ul>
                            <Button className="w-full font-black py-8 text-sm uppercase tracking-widest rounded-xl shadow-2xl shadow-primary/20 bg-primary text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]" asChild>
                                <a href={settings.groupVkLink} target="_blank" rel="noopener noreferrer">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current mr-3" xmlns="http://www.w3.org/2000/svg"><path d="M15.073 2H8.937C3.333 2 2 3.333 2 8.937v6.136C2 20.667 3.333 22 8.927 22h6.136c5.604 0 6.937-1.333 6.937-6.937V8.937C22 3.333 20.667 2 15.073 2zm3.51 13.172c0 3.125-2.406 3.125-2.406 3.125h-1.146s-.344-.042-.531-.25c-.188-.208-.49-.646-.49-.646s-.312-.417-.562-.385c-.25.03-.312.323-.312.323s-.02.448-.313.625c-.29.177-.812.135-.812.135h-.5s-1.5-.104-2.812-1.562c-1.313-1.458-2.469-4.333-2.469-4.333s-.166-.417.02-.625c.188-.208.646-.208.646-.208h1.25s.188.02.313.125c.125.104.198.292.198.292s.208.531.48 1.01c.541.958.77 1.22.968 1.22.198 0 .28-.125.28-.73 0-1.187-.187-1.687-.541-1.937-.282-.198-.49-.25-.375-.458.115-.208.458-.208.792-.208h1.937s.25.03.375.156c.125.125.115.365.115.365s-.02 1.26.25 1.49c.188.156.438-.156.979-1.22.271-.531.469-1.125.469-1.125s.062-.146.166-.219c.104-.073.25-.052.25-.052h1.312s.396-.052.458.125c.062.177-.083.583-.083.583s-.521 1.219-1.104 2.135c-.438.688-.563.865-.146 1.25.417.385 1.115 1.073 1.51 1.562.292.365.51.667.51.667s.156.23.01.385c-.145.156-.427.146-.427.146z"/></svg>
                                    НАПИСАТЬ В СООБЩЕСТВО
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <hr className="border-border/50 max-w-4xl mx-auto opacity-30" />

            {/* Current Partners Grid */}
            <section className="space-y-12">
                <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-headline uppercase">Текущие партнеры</h2>
                </div>
                {partners.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                        {partners.map(partner => {
                            const config = categoryConfig[partner.category] || categoryConfig.other;
                            const CategoryIcon = config.icon;
                            const ButtonIcon = config.buttonIcon;
                            
                            return (
                                <Card key={partner.id} className="glassmorphism overflow-hidden group hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                                    <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                        <div className="w-full flex justify-between items-start">
                                            <Badge className={`${config.color} border font-bold uppercase tracking-widest text-[9px]`}>
                                                <CategoryIcon className="w-3 h-3 mr-1.5" />
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <div className="relative h-32 w-full bg-primary/5 rounded-xl p-6 shadow-inner border border-white/5">
                                            <Image 
                                                src={partner.logoUrl} 
                                                alt={partner.name} 
                                                fill 
                                                className="object-contain filter grayscale brightness-125 group-hover:grayscale-0 transition-all duration-500"
                                                unoptimized={partner.logoUrl.startsWith('data:image') ? true : undefined}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-black uppercase tracking-tight">{partner.name}</h3>
                                            {partner.promoCode && (
                                                <div className="inline-block bg-primary/10 text-primary py-2 px-5 rounded-lg font-mono text-sm border border-primary/20 shadow-inner">
                                                    Промокод: <span className="font-black">{partner.promoCode}</span>
                                                </div>
                                            )}
                                        </div>
                                        {partner.linkUrl && (
                                            <Button asChild className="w-full group-hover:scale-105 transition-transform font-bold rounded-xl h-12">
                                                <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer">
                                                    <ButtonIcon className="mr-2 h-4 w-4" />
                                                    {config.buttonText}
                                                </a>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-card/20 rounded-[3rem] border-2 border-dashed border-white/10 mx-4">
                        <p className="text-muted-foreground text-lg italic font-medium">Список партнеров обновляется. Станьте первым!</p>
                    </div>
                )}
            </section>
        </main>
    );
}
