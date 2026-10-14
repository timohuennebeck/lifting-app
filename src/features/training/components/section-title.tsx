import { Text } from '@/shared/ui/text';

/** Overline over a group on the Training tab and a plan's page. */
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="overline" tone="subtle" className="px-5 pt-8 pb-2.5 text-[11px]">
      {children}
    </Text>
  );
}
