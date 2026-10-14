import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';

import { CollectionsGlyph, ProgramGlyph, TemplateGlyph } from './glyphs';

type CreateKind = 'collection' | 'template' | 'program';

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateCollection: () => void;
  onCreateTemplate: () => void;
  onCreateProgram: () => void;
}

const glyphColor = (active: boolean) => (active ? colors.onAccent : colors.fgMid);

/** "+" sheet: new collection, template or program (01·V·A·6); a program is imported or made. */
export function CreateSheet({
  visible,
  onClose,
  onCreateCollection,
  onCreateTemplate,
  onCreateProgram,
}: CreateSheetProps) {
  const { t } = useTranslation('training');
  const [kind, setKind] = useState<CreateKind>('template');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      value={kind}
      onChange={setKind}
      onConfirm={(value) => {
        if (value === 'collection') onCreateCollection();
        else if (value === 'template') onCreateTemplate();
        else onCreateProgram();
      }}
      options={[
        {
          value: 'collection',
          title: t('create.collection'),
          description: t('create.collectionHint'),
          cta: t('create.createCollection'),
          renderIcon: (active) => <CollectionsGlyph color={glyphColor(active)} />,
        },
        {
          value: 'template',
          title: t('create.template'),
          description: t('create.templateHint'),
          cta: t('create.createTemplate'),
          renderIcon: (active) => <TemplateGlyph color={glyphColor(active)} />,
        },
        {
          value: 'program',
          title: t('create.program'),
          description: t('create.programHint'),
          cta: t('create.createProgram'),
          renderIcon: (active) => <ProgramGlyph color={glyphColor(active)} />,
        },
      ]}
    />
  );
}
