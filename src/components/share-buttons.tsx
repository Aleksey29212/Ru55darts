'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import type { Player } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ShareButtons({ player }: { player: Player }) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Construct the canonical URL without query params
    setShareUrl(window.location.origin + window.location.pathname);
  }, []);

  const handleShareToVk = () => {
    if (!shareUrl) return;

    const title = `${player.name} - Rank #${player.rank} | DartBrig Pro`;
    const description = player.bio;
    // VK might not handle data:image URLs well. picsum.photos should be fine.
    const imageUrl = player.avatarUrl.startsWith('data:image') ? '' : player.avatarUrl;

    const vkShareUrl = `https://vk.com/share.php?url=${encodeURIComponent(
      shareUrl
    )}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(
      description
    )}&image=${encodeURIComponent(imageUrl)}`;

    window.open(vkShareUrl, '_blank', 'noopener,noreferrer');
  };

  if (!shareUrl) {
    return null;
  }

  return (
    <Card className="glassmorphism">
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Share2 className="text-primary"/>
                Поделиться
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Button onClick={handleShareToVk} className="w-full">
                Поделиться в VK
            </Button>
        </CardContent>
    </Card>
  );
}
