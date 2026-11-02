import { useTranslation } from 'react-i18next';
import { SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { CheckCircle } from '@/shared/ui/check-item';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

/** A chat in the list: its first question, the start of its first answer, when it was last used. */
export interface ChatSummary {
  id: string;
  question: string;
  preview: string;
  time: string;
}

export interface ChatSection {
  key: string;
  title: string;
  data: ChatSummary[];
}

export interface CoachHistoryViewProps {
  sections: ChatSection[];
  onOpen: (chatId: string) => void;
  onBack: () => void;
  onNew: () => void;
  /** Choosing chats to delete, with a box in front of each, as in Claude's chat list. */
  selecting: boolean;
  selected: ReadonlySet<string>;
  onSelecting: (selecting: boolean) => void;
  onToggle: (chatId: string) => void;
  onDelete: () => void;
}

interface RowProps {
  chat: ChatSummary;
  selecting: boolean;
  checked: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function ChatRow({ chat, selecting, checked, onPress, onLongPress }: RowProps) {
  return (
    <PressableScale
      haptic="tap"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={selecting ? { checked } : undefined}
      className="flex-row gap-3 px-2 py-3.5"
    >
      {selecting ? (
        <CheckCircle
          checked={checked}
          size={22}
          glyph={12}
          ring="border-outline"
          className="mt-px"
        />
      ) : null}
      <View className="min-w-0 flex-1 gap-[5px]">
        <View className="flex-row items-baseline gap-3">
          <Text
            numberOfLines={1}
            className="min-w-0 flex-1 font-inter-semibold text-label leading-[19.5px] text-fg"
          >
            {chat.question}
          </Text>
          <Text className="font-inter text-xs leading-[15px] text-dim">{chat.time}</Text>
        </View>
        <Text numberOfLines={2} className="font-inter text-sm leading-[19.6px] text-subtle">
          {chat.preview}
        </Text>
      </View>
    </PressableScale>
  );
}

/**
 * Kai's earlier chats (design CO2-G), grouped by when they were last used. A long press puts
 * boxes in front for deleting one or several.
 */
export function CoachHistoryView({
  sections,
  onOpen,
  onBack,
  onNew,
  selecting,
  selected,
  onSelecting,
  onToggle,
  onDelete,
}: CoachHistoryViewProps) {
  const { t } = useTranslation(['coach', 'common']);
  const insets = useSafeAreaInsets();
  return (
    <Screen
      header={
        selecting ? (
          <ScreenHeader
            icon="close"
            onBack={() => onSelecting(false)}
            title={t('history.selected', { count: selected.size })}
            action={
              <PressableScale
                haptic="tap"
                disabled={!selected.size}
                onPress={onDelete}
                className={cn('h-10.5 justify-center px-1', !selected.size && 'opacity-35')}
              >
                <Text className="font-inter-semibold text-label text-red">
                  {t('common:actions.delete')}
                </Text>
              </PressableScale>
            }
          />
        ) : (
          <ScreenHeader
            onBack={onBack}
            title={t('history.title')}
            action={
              <IconButton
                icon="plus"
                iconSize={14}
                color={colors.onAccent}
                accessibilityLabel={t('newChat')}
                onPress={onNew}
                className="bg-accent"
              />
            }
          />
        )
      }
    >
      <SectionList
        sections={sections}
        keyExtractor={(chat) => chat.id}
        // The rows draw again when the boxes come, go or change.
        extraData={selecting ? selected : null}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={
          <Text className="pt-12 text-center font-inter text-label leading-[22px] text-subtle">
            {t('history.empty')}
          </Text>
        }
        renderSectionHeader={({ section }) => (
          <Text className="px-2 pt-[18px] pb-1 font-inter-semibold text-[11px] leading-[13px] tracking-[1.1px] text-dim uppercase">
            {section.title}
          </Text>
        )}
        renderItem={({ item: chat }) => (
          <ChatRow
            chat={chat}
            selecting={selecting}
            checked={selected.has(chat.id)}
            onPress={() => (selecting ? onToggle(chat.id) : onOpen(chat.id))}
            onLongPress={() => {
              // The boxes appear with a tick, like any press.
              haptics.press();
              if (!selecting) onSelecting(true);
              onToggle(chat.id);
            }}
          />
        )}
      />
    </Screen>
  );
}
