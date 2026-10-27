import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { create } from 'zustand';

import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';

import { exitProgressCheck } from '../lib/navigation';
import { useProgressCheckStore } from '../stores/progress-check-store';

/** Whether the flow asks before throwing away the photos taken (`useCloseCheck`). */
const useDiscardPrompt = create<{ open: boolean }>(() => ({ open: false }));

export const askDiscardCheck = () => useDiscardPrompt.setState({ open: true });
const dismiss = () => useDiscardPrompt.setState({ open: false });

/** Leaves the flow and deletes its photos. */
export function discardCheck() {
  exitProgressCheck();
  useProgressCheckStore.getState().discard();
}

/**
 * "Körpercheck verwerfen?" with keep and discard side by side, as signing out. Mounted once by
 * the flow's layout, over whichever of its screens asked.
 */
export function DiscardCheckSheet() {
  const { t } = useTranslation('progressCheck');
  const open = useDiscardPrompt((s) => s.open);
  return (
    <Sheet
      visible={open}
      onClose={dismiss}
      title={t('discard.title')}
      subtitle={t('discard.message')}
    >
      <View className="flex-row gap-2.5 pt-2">
        <View className="min-w-0 flex-1">
          <Button label={t('discard.keep')} variant="secondary" onPress={dismiss} />
        </View>
        <View className="min-w-0 flex-1">
          <Button
            label={t('discard.confirm')}
            haptic="warning"
            onPress={() => {
              dismiss();
              discardCheck();
            }}
          />
        </View>
      </View>
    </Sheet>
  );
}
