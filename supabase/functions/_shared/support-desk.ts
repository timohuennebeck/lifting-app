// For the functions the support desk (a website) calls: CORS, and the check that the caller is
// the support account (app_metadata.role = 'support', which only the service role can set).
import { requestUser } from './common.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const corsReply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** The answer to the browser's preflight request. */
export const preflight = () => new Response(null, { status: 204, headers: CORS });

export async function isSupportRequest(req: Request) {
  const user = await requestUser(req);
  return user?.app_metadata?.role === 'support';
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
