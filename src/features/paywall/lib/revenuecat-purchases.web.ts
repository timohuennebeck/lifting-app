import { createMockPurchases } from './mock-purchases';

/** No store on the web (the screenshot preview): the simulated store stands in. */
export const createRevenueCatPurchases = (_apiKey: string) => createMockPurchases();
