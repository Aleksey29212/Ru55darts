'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveSponsorshipAction } from '@/app/actions';
import { Save, Loader2, Info, RectangleHorizontal, Square, Minus, CreditCard, Box } from 'lucide-react';
import type { SponsorshipSettings, SponsorTemplateId } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  adminTelegramLink: z.string().url('Введите корректную ссылку.'),
  groupTelegramLink: z.string().url('Введите корректную ссылку.'),
  adminVkLink: z.string().url('Введите корректную ссылку.'),
  groupVkLink: z.string().url('Введите корректную ссылку.'),
  showSponsorsInProfile: z.boolean().optional(),
  showSponsorshipCallToAction: z.boolean().optional(),
  sponsorTemplate: z.enum(['default', 'banner', 'minimal', 'card', 'integrated']).optional(),
  callToActionSlogansRaw: z.string().optional(),
});

type SponsorshipFormValues = z.infer<typeof schema>;

const templateOptions: {id: SponsorTemplateId, name: string, description: string, icon: React.ElementType}[] = [
    { id: 'default', name: 'Компактный', description: 'Горизонтальный блок: лого слева, текст справа.', icon: RectangleHorizontal },
    { id: 'banner', name: 'Баннер', description: 'Широкий блок на всю ширину с акцентным фоном.', icon: Square },
    { id: 'minimal', name: 'Минималистичный', description: 'Маленький виджет без фона, только лого и имя.', icon: Minus },
    { id: 'card', name: 'Карточка', description: 'Отдельная карточка с тенью и рамкой.', icon: CreditCard },
    { id: 'integrated', name: 'Интегрированный', description: 'Логотип размещается в углу карточки игрока.', icon: Box },
];

export function SponsorshipSettingsForm({ initialSettings }: { initialSettings: SponsorshipSettings }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<SponsorshipFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
        ...initialSettings,
        showSponsorsInProfile: initialSettings.showSponsorsInProfile ?? true,
        showSponsorshipCallToAction: initialSettings.showSponsorshipCallToAction ?? true,
        sponsorTemplate: initialSettings.sponsorTemplate ?? 'default',
        callToActionSlogansRaw: (initialSettings.callToActionSlogans || []).join('\n'),
    },
  });

  async function onSubmit(data: SponsorshipFormValues) {
    startTransition(async () => {
      const slogans = data.callToActionSlogansRaw?.split('\n').map(s => s.trim()).filter(Boolean) || [];
      const settingsToSave: SponsorshipSettings = {
        adminTelegramLink: data.adminTelegramLink,
        groupTelegramLink: data.groupTelegramLink,
        adminVkLink: data.adminVkLink,
        groupVkLink: data.groupVkLink,
        showSponsorsInProfile: data.showSponsorsInProfile,
        showSponsorshipCallToAction: data.showSponsorshipCallToAction,
        sponsorTemplate: data.sponsorTemplate,
        callToActionSlogans: slogans,
      };

      const result = await saveSponsorshipAction(settingsToSave);
      toast({
        title: result.success ? 'Успешно' : 'Ошибка',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        
        <FormField
          control={form.control}
          name="showSponsorsInProfile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Показывать спонсоров в профилях</FormLabel>
                <FormDescription>
                  Включите, чтобы отображать блок спонсора в карточке игрока.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showSponsorshipCallToAction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Показывать призыв к спонсорству</FormLabel>
                <FormDescription>
                  Включите, чтобы в профилях игроков без спонсора отображался рекламный слоган.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="callToActionSlogansRaw"
          render={({ field }) => (
            <FormItem className="rounded-lg border p-4 shadow-sm bg-card/50">
              <FormLabel className="text-base">Слоганы для призыва к спонсорству</FormLabel>
              <FormControl>
                <Textarea
                    placeholder="Один слоган на строку..."
                    rows={4}
                    {...field}
                />
              </FormControl>
              <FormDescription>
                Случайный слоган из этого списка будет показан в профиле игрока без спонсора.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground italic">
                Эти ссылки используются в рекламных баннерах на странице «Партнеры». 
                Они позволяют потенциальным спонсорам мгновенно связаться с вами через Telegram или ВКонтакте.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <h3 className="font-medium text-lg border-b pb-2">Telegram</h3>
                <FormField
                  control={form.control}
                  name="adminTelegramLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram администратора</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/your_admin_name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Для баннера «Ваш магазин в системе».
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupTelegramLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram группы</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/your_group_link" {...field} />
                      </FormControl>
                      <FormDescription>
                        Для баннера «Спонсорство лиги».
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="space-y-6">
                <h3 className="font-medium text-lg border-b pb-2">ВКонтакте (VK)</h3>
                <FormField
                  control={form.control}
                  name="adminVkLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VK администратора</FormLabel>
                      <FormControl>
                        <Input placeholder="https://vk.com/id..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Для баннера «Ваш магазин в системе».
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupVkLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VK группы</FormLabel>
                      <FormControl>
                        <Input placeholder="https://vk.com/group..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Для баннера «Спонсорство лиги».
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>

        <Separator/>

        <div className="space-y-4">
            <h3 className="font-medium text-lg">Шаблон виджета спонсора</h3>
            <p className="text-sm text-muted-foreground">
                Выберите, как будет выглядеть блок спонсора в карточке игрока.
            </p>
            <FormField
              control={form.control}
              name="sponsorTemplate"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {templateOptions.map(option => {
                        const Icon = option.icon;
                        return (
                           <FormItem key={option.id}>
                            <FormControl>
                               <RadioGroupItem value={option.id} className="sr-only" id={`template-${option.id}`} />
                            </FormControl>
                             <Label 
                                htmlFor={`template-${option.id}`}
                                className={`flex flex-col items-start justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer 
                                ${field.value === option.id ? 'border-primary' : 'border-muted'}`}
                             >
                                <div className="flex items-center gap-3 w-full mb-2">
                                    <Icon className="h-5 w-5 text-primary"/>
                                    <span className="font-bold">{option.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground text-left w-full">{option.description}</p>
                            </Label>
                          </FormItem>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Сохранить настройки связи
          </Button>
        </div>
      </form>
    </Form>
  );
}
