'use client';

import { useState, useTransition, useRef } from 'react';
import type { PlayerProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePlayer, deletePlayerAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { CardBackgrounds } from '@/lib/card-backgrounds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from './ui/skeleton';

interface PlayerManagementProps {
  players: PlayerProfile[];
}

function PlayerFormDialog({ 
    player, 
    mode = 'edit', 
    trigger 
}: { 
    player?: PlayerProfile, 
    mode?: 'edit' | 'create',
    trigger?: React.ReactNode
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const initialData: PlayerProfile = player || {
      id: '',
      name: '',
      nickname: 'Новичок',
      avatarUrl: 'https://picsum.photos/seed/newplayer/400/400',
      bio: '',
      imageHint: 'person portrait',
      backgroundUrl: '',
      backgroundImageHint: 'abstract background',
      sponsorshipCallToAction: 'Станьте спонсором этого игрока!',
      showSponsorshipCallToAction: true,
      sponsors: []
  };
  const [formData, setFormData] = useState<PlayerProfile>(initialData);

  const handleSponsorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSponsors = [...(formData.sponsors || [])];
    newSponsors[index] = { ...newSponsors[index], [name]: value };
    setFormData(prev => ({ ...prev, sponsors: newSponsors }));
  }

  const addSponsor = () => {
    if ((formData.sponsors?.length || 0) < 3) {
      setFormData(prev => ({ ...prev, sponsors: [...(prev.sponsors || []), { name: '', logoUrl: '', linkUrl: '' }] }));
    }
  }

  const removeSponsor = (index: number) => {
    setFormData(prev => ({ ...prev, sponsors: (prev.sponsors || []).filter((_, i) => i !== index) }));
  }

  const handleSave = () => {
    if (!formData.name || (mode === 'create' && !formData.id)) {
        toast({ title: 'Ошибка', description: 'ID и Имя обязательны для нового игрока.', variant: 'destructive' });
        return;
    }
    
    startTransition(async () => {
        const result = await updatePlayer(formData);
        toast({
            title: result.success ? 'Успешно' : 'Ошибка',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" className="w-full sm:w-auto"><Edit className="h-4 w-4 mr-2" /> Редактировать</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glassmorphism max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Редактировать игрока' : 'Добавить игрока'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">ID (уникальный)</Label>
            <Input 
                id="id" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                className="col-span-3" 
                disabled={mode === 'edit'} 
                placeholder="ivan-ivanov"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Имя</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" placeholder="Иван Иванов" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">Никнейм</Label>
            <Input id="nickname" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">Биография</Label>
            <Textarea id="bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="col-span-3" rows={3} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatarUrl" className="text-right">URL аватара</Label>
            <Input id="avatarUrl" value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backgroundUrl" className="text-right">Фон карточки</Label>
            <div className="col-span-3">
              <Select
                value={formData.backgroundUrl}
                onValueChange={value => setFormData({ ...formData, backgroundUrl: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите фон..." />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  <SelectItem value="">
                      <div className="flex items-center gap-2">
                          <span>Без фона (стандартный)</span>
                      </div>
                  </SelectItem>
                  {CardBackgrounds.map(bg => (
                    <SelectItem key={bg.id} value={bg.url}>
                      <div className="flex items-center gap-2">
                        <Image src={bg.url} alt={bg.hint} width={40} height={20} className="rounded-sm object-cover" />
                        <span className="capitalize">{bg.hint}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="col-span-4 mt-4 border-t pt-4">
             <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">Спонсорство</h4>
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="sponsorshipCallToAction" className="text-right pt-2">Призыв</Label>
                <Textarea id="sponsorshipCallToAction" value={formData.sponsorshipCallToAction || ''} onChange={e => setFormData({...formData, sponsorshipCallToAction: e.target.value})} className="col-span-3" placeholder="Слоган для привлечения спонсоров" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="showSponsorshipCallToAction" className="text-right">Показывать призыв</Label>
                <div className="col-span-3">
                    <Switch id="showSponsorshipCallToAction" checked={formData.showSponsorshipCallToAction ?? true} onCheckedChange={checked => setFormData({...formData, showSponsorshipCallToAction: checked})} />
                </div>
            </div>
             <Separator className="my-4"/>
              {(formData.sponsors || []).map((sponsor, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg mb-4 relative">
                  <p className="text-sm font-medium">Спонсор #{index + 1}</p>
                   <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeSponsor(index)}><Trash2 className="h-4 w-4" /></Button>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Имя</Label>
                      <Input name="name" value={sponsor.name} onChange={(e) => handleSponsorChange(index, e)} className="col-span-3" placeholder="Название компании"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">URL лого</Label>
                      <Input name="logoUrl" value={sponsor.logoUrl} onChange={(e) => handleSponsorChange(index, e)} className="col-span-3" placeholder="https://.../logo.png"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">URL ссылки</Label>
                      <Input name="linkUrl" value={sponsor.linkUrl} onChange={(e) => handleSponsorChange(index, e)} className="col-span-3" placeholder="https://.../"/>
                  </div>
                </div>
              ))}
               {(formData.sponsors?.length || 0) < 3 && (
                <Button variant="outline" className="w-full" onClick={addSponsor}>
                    <PlusCircle /> Добавить спонсора
                </Button>
              )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {mode === 'edit' ? 'Сохранить изменения' : 'Создать профиль'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlayerManagement({ players }: PlayerManagementProps) {
  const { toast } = useToast();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [playerToDelete, setPlayerToDelete] = useState<PlayerProfile | null>(null);
  const isMobile = useIsMobile();
  const isClient = useIsClient();

  const confirmDelete = () => {
    if (!playerToDelete) return;

    startDeleteTransition(async () => {
      const result = await deletePlayerAction(playerToDelete.id);
      toast({
        title: result.success ? 'Удалено' : 'Ошибка',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      setPlayerToDelete(null); // Close dialog
    });
  };

  if (!isClient) {
    return (
        <div className="space-y-4 pt-4">
            <div className="flex justify-end mb-6">
                <Skeleton className="h-10 w-[290px]" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
  }

  return (
    <>
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent className="glassmorphism">
            <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены, что хотите удалить игрока "{playerToDelete?.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                    Профиль игрока будет удален. Его исторические результаты в турнирах останутся, но он исчезнет из будущих рейтингов. Это действие необратимо.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletePending}>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                    {isDeletePending ? <Loader2 className="animate-spin" /> : 'Да, удалить'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardContent className="p-0">
        <div className="flex justify-end mb-6">
            <PlayerFormDialog 
              mode="create" 
              trigger={<Button className="gap-2"><PlusCircle className="h-4 w-4" /> Добавить игрока вручную</Button>} 
            />
        </div>
        
        {isMobile ? (
          <Accordion type="multiple" className="w-full">
            {players.map((player) => (
              <AccordionItem value={player.id} key={player.id} className="border-b">
                <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar>
                      <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1 text-left">
                      <p className="font-medium">{player.name}</p>
                      <Badge variant="secondary" className="font-normal w-fit mt-1">{player.nickname}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-secondary/30 text-sm">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ID:</span>
                          <p className="font-mono break-all ml-4">{player.id}</p>
                      </div>
                      <div className="flex flex-col gap-2 pt-4 border-t">
                         <PlayerFormDialog player={player} mode="edit" />
                         <Button 
                            variant="destructive" 
                            className="w-full" 
                            onClick={() => setPlayerToDelete(player)}
                            disabled={isDeletePending}
                          >
                           <Trash2 className="h-4 w-4 mr-2" />
                           Удалить профиль
                         </Button>
                      </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Игрок</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium">{player.name}</p>
                        <Badge variant="secondary" className="font-normal w-fit mt-1">{player.nickname}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground font-mono break-all">{player.id}</p>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <PlayerFormDialog player={player} mode="edit" />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10" 
                        onClick={() => setPlayerToDelete(player)}
                        disabled={isDeletePending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </>
  );
}
