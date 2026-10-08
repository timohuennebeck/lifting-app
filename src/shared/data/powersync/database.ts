import '@azure/core-asynciterator-polyfill';

import { PowerSyncDatabase } from '@powersync/react-native';

import { SupabaseConnector } from './connector';
import { AppSchema } from './schema';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'forge.db' },
});

export const connector = new SupabaseConnector();

/** The transaction handed to `db.writeTransaction` callbacks. */
export type Tx = Parameters<Parameters<typeof db.writeTransaction>[0]>[0];
