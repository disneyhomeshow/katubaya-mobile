/**
 * Message Preview - WhatsApp-style message preview
 */

import { useTranslation } from 'react-i18next';
import { Copy, Check, RefreshCw, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MessagePreviewProps {
  message: string;
  isStale?: boolean;
  onCopy: () => Promise<boolean>;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function MessagePreview({
  message,
  isStale,
  onCopy,
  onRegenerate,
  isRegenerating
}: MessagePreviewProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopy();
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      'border-2 transition-colors',
      isStale ? 'border-harvest-warning/50' : 'border-primary/20'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            {t('availability.preview')}
          </CardTitle>
          {isStale && (
            <span className="text-xs text-harvest-warning font-medium">
              {t('home.stale')}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Message preview box styled like WhatsApp */}
        <div className="bg-whatsapp text-foreground rounded-lg p-4 mb-4 text-base leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
          {message || t('availability.noItems')}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex-1"
            disabled={!message}
            variant={copied ? 'outline' : 'default'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t('actions.copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                {t('availability.copyMessage')}
              </>
            )}
          </Button>
          
          {onRegenerate && (
            <Button
              variant="outline"
              size="icon"
              aria-label={t('actions.regenerate')}
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={cn(
                'h-4 w-4',
                isRegenerating && 'animate-spin'
              )} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
