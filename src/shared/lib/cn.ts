import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge about the custom font families and text sizes in global.css.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-family': [{ font: ['inter', 'inter-medium', 'inter-semibold', 'inter-bold'] }],
      'font-size': [{ text: ['display', 'title', 'headline', 'body', 'label', 'caption'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
