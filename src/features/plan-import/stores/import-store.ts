import { create } from 'zustand';

import type {
  ImportedPlan,
  ImportFile,
  ImportPhoto,
  ImportSource,
} from '../lib/plan-import-service';

interface ImportState {
  source: ImportSource | null;
  /** Detected plan being reviewed on the confirm screen. */
  plan: ImportedPlan | null;
  /** Selected day tab on the confirm screen. */
  dayIndex: number;
  /** Counts voice inputs, to cycle through the scripted mock utterances. */
  voiceTake: number;
  setFile: (file: ImportFile) => void;
  addPhotos: (photos: ImportPhoto[]) => void;
  replacePhoto: (index: number, photo: ImportPhoto) => void;
  removePhoto: (index: number) => void;
  /** Drops photos beyond `count`, e.g. when the camera is closed without finishing. */
  truncatePhotos: (count: number) => void;
  setPlan: (plan: ImportedPlan) => void;
  editPlan: (edit: (plan: ImportedPlan) => ImportedPlan) => void;
  selectDay: (index: number) => void;
  nextVoiceTake: () => void;
}

const NO_PHOTOS: ImportPhoto[] = [];
const photosOf = (source: ImportSource | null) =>
  source?.kind === 'photos' ? source.photos : NO_PHOTOS;

/** In-memory state of one plan import session (source, detected plan, review position). */
export const useImportStore = create<ImportState>()((set) => ({
  source: null,
  plan: null,
  dayIndex: 0,
  voiceTake: 0,
  setFile: (file) => set({ source: { kind: 'file', file } }),
  addPhotos: (photos) =>
    set((s) => ({ source: { kind: 'photos', photos: [...photosOf(s.source), ...photos] } })),
  replacePhoto: (index, photo) =>
    set((s) => ({
      source: {
        kind: 'photos',
        photos: photosOf(s.source).map((p, i) => (i === index ? photo : p)),
      },
    })),
  truncatePhotos: (count) =>
    set((s) => {
      const kept = photosOf(s.source).slice(0, count);
      return { source: kept.length ? { kind: 'photos', photos: kept } : null };
    }),
  removePhoto: (index) =>
    set((s) => ({
      source: { kind: 'photos', photos: photosOf(s.source).filter((_, i) => i !== index) },
    })),
  setPlan: (plan) => set({ plan, dayIndex: 0 }),
  editPlan: (edit) => set((s) => (s.plan ? { plan: edit(s.plan) } : {})),
  selectDay: (dayIndex) => set({ dayIndex }),
  nextVoiceTake: () => set((s) => ({ voiceTake: s.voiceTake + 1 })),
}));

export const usePhotos = () => useImportStore((s) => photosOf(s.source));
