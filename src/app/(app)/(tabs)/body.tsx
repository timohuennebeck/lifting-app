import { TabHeader } from '@/shared/components/tab-header';
import { Screen } from '@/shared/ui/screen';

export default function Placeholder() {
  return <Screen header={<TabHeader />}>{null}</Screen>;
}
