import type { LegalKind } from '../data/legal-documents';

/** The in-app page of the terms or the privacy policy, which every link to them opens. */
export const legalHref = (kind: LegalKind) => `/legal/${kind}` as const;
