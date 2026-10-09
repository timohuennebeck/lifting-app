import { max, sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';

import { drizzle } from './powersync/database';

/**
 * Subquery for the position after the last row matching `where` (0 when there is none),
 * for appending a row inside the same INSERT statement.
 */
export function nextPosition(column: SQLiteColumn, where: SQL | undefined) {
  return sql<number>`${drizzle
    .select({ next: sql`coalesce(${max(column)}, -1) + 1` })
    .from(column.table)
    .where(where)}`;
}
