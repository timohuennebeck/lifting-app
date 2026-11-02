import { Text } from '@/shared/ui/text';

import { boldParts } from '../lib/answer-text';

/** The coach's answer: 15pt, with its key numbers in bold. Both texts avoid a lone last word. */
export function AnswerText({ text }: { text: string }) {
  return (
    <Text
      lineBreakStrategyIOS="push-out"
      className="font-inter text-label leading-[22.5px] text-fg-soft"
    >
      {boldParts(text).map((part, i) =>
        part.bold ? (
          <Text key={i} className="font-inter-semibold text-label leading-[22.5px] text-fg">
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}

/** A question the user asked, on the right; its text takes at most 78 % of the width. */
export function QuestionBubble({ text }: { text: string }) {
  return (
    <Text
      lineBreakStrategyIOS="push-out"
      className="max-w-[87%] self-end overflow-hidden rounded-[22px] bg-elevated px-4 py-[11px] font-inter text-label leading-[21px] text-fg"
      selectable
    >
      {text}
    </Text>
  );
}
