import { Image, type ImageContentFit, type ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { usePhotoSource } from '../hooks/use-photo-source';
import type { BodyPose } from '../lib/poses';

export interface CheckPhotoProps {
  checkId: string;
  pose: BodyPose;
  storagePath?: string | null;
  /** A draft photo that is not saved yet; shown instead of the saved one. */
  uri?: string;
  /** Rendered while no image is available (not uploaded yet, offline, …). */
  fallback?: ReactNode;
  /** "contain" shows the whole photo, e.g. full screen. */
  contentFit?: ImageContentFit;
  onLoad?: ImageProps['onLoad'];
  accessibilityLabel?: string;
}

/** Fills its parent with a check photo (local file first, else signed URL). */
export function CheckPhoto({
  checkId,
  pose,
  storagePath,
  uri,
  fallback = null,
  contentFit = 'cover',
  onLoad,
  accessibilityLabel,
}: CheckPhotoProps) {
  const saved = usePhotoSource(checkId, pose, storagePath);
  const source = uri ? { uri } : saved;
  if (!source) return fallback;
  return (
    <Image
      source={source}
      contentFit={contentFit}
      onLoad={onLoad}
      transition={150}
      accessibilityLabel={accessibilityLabel}
      style={StyleSheet.absoluteFill}
    />
  );
}
