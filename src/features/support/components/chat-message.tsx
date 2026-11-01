import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { Text } from '@/shared/ui/text';

import { AttachmentThumb } from './attachment-thumb';
import { TeamAvatar } from './team-avatar';

export interface ChatMessageProps {
  author: 'user' | 'team';
  content: string;
  attachments?: string[];
  /** Importance of a feature request, shown under its first message. */
  priority?: number | null;
  /** A team reply in the app language, when the team wrote in another; shown instead. */
  translation?: string | null;
  onOpenAttachment?: (path: string) => void;
}

interface AttachmentsProps {
  paths: string[];
  onOpen?: (path: string) => void;
  alignEnd?: boolean;
}

const noop = () => {};

function Attachments({ paths, onOpen = noop, alignEnd }: AttachmentsProps) {
  if (!paths.length) return null;
  return (
    <View className={cn('flex-row flex-wrap gap-1.5', alignEnd && 'justify-end')}>
      {paths.map((path) => (
        <AttachmentThumb key={path} path={path} onOpen={onOpen} />
      ))}
    </View>
  );
}

/**
 * User bubble (accent, right) or team bubble with the team avatar (left), as in 01f-3e. A team
 * reply the server translated shows in the app language, with "Translated · Show original" under
 * it to switch between the two.
 */
export function ChatMessage({
  author,
  content,
  attachments = [],
  priority,
  translation,
  onOpenAttachment,
}: ChatMessageProps) {
  const { t } = useTranslation('support');
  const [original, setOriginal] = useState(false);
  const text = content.trim();

  if (author === 'team') {
    const translated = translation?.trim() ?? '';
    const showTranslation = !!translated && !original;
    const shown = showTranslation ? translated : text;
    return (
      <View className="max-w-[84%] flex-row items-end gap-2">
        <TeamAvatar size={28} />
        <View className="shrink gap-1">
          <Attachments paths={attachments} onOpen={onOpenAttachment} />
          {shown ? (
            <View className="rounded-[20px] bg-raised px-3.5 py-2.5">
              <Text className="font-inter text-[15px] leading-5.25">{shown}</Text>
            </View>
          ) : null}
          {translated ? (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.5}
              hitSlop={8}
              onPress={() => {
                haptics.select();
                setOriginal((value) => !value);
              }}
              className="self-start px-1"
            >
              <Text className="font-inter text-xs text-subtle">
                {showTranslation
                  ? `${t('chat.translated')} · ${t('chat.showOriginal')}`
                  : t('chat.showTranslation')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="max-w-[78%] items-end gap-1.5 self-end">
      <Attachments paths={attachments} onOpen={onOpenAttachment} alignEnd />
      {text ? (
        <View className="rounded-[20px] bg-accent px-3.5 py-2.5">
          <Text tone="onAccent" className="font-inter text-[15px] leading-5.25">
            {text}
          </Text>
        </View>
      ) : null}
      {priority ? (
        <View className="flex-row items-center gap-2 pr-1">
          <Text className="font-inter text-xs text-subtle">{t('chat.priority')}</Text>
          <View className="size-7 items-center justify-center rounded-full bg-fg-mid">
            <Text variant="caption" tone="onAccent">
              {priority}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
