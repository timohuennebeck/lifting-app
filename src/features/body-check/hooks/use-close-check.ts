import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { haptics } from '@/shared/lib/haptics';

import { exitBodyCheck } from '../lib/navigation';
import { useBodyCheckStore } from '../stores/body-check-store';

/** Close action of the flow: asks before throwing away photos already taken. */
export function useCloseCheck() {
  const { t } = useTranslation('bodyCheck');
  return () => {
    const { shots, discard } = useBodyCheckStore.getState();
    const leave = () => {
      exitBodyCheck();
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
