import '@azure/core-asynciterator-polyfill';

import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncDatabase } from '@powersync/react-native';

import { SupabaseConnector } from './connector';
import { AppSchema, drizzleSchema } from './schema';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'forge.db' },
});

/**
 * Typed query builder on top of `db`. Writes still land in PowerSync's upload queue,
 * and `drizzle.transaction` runs as a PowerSync write transaction.
 */
export const drizzle = wrapPowerSyncWithDrizzle(db, { schema: drizzleSchema });

export const connector = new SupabaseConnector();

/** The transaction handed to `drizzle.transaction` callbacks. */
export type Tx = Parameters<Parameters<typeof drizzle.transaction>[0]>[0];

/** The database or a transaction, for helpers that work in both. */
export type Executor = typeof drizzle | Tx;
