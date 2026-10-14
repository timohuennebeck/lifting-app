import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { haptics } from '@/shared/lib/haptics';

import { exitProgressCheck } from '../lib/navigation';
import { useProgressCheckStore } from '../stores/progress-check-store';

/** Close action of the flow: asks before throwing away photos already taken. */
export function useCloseCheck() {
  const { t } = useTranslation('progressCheck');
  return () => {
    const { shots, discard } = useProgressCheckStore.getState();
    const leave = () => {
      exitProgressCheck();
      discard();
    };
    if (!Object.keys(shots).length) return leave();
    haptics.warning();
    Alert.alert(t('discard.title'), t('discard.message'), [
      { text: t('discard.keep'), style: 'cancel' },
      { text: t('discard.confirm'), style: 'destructive', onPress: leave },
    ]);
  };
}
