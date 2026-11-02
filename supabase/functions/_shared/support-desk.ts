// For the functions the support desk (a website) calls: CORS, and the check that the caller is
// the support account (app_metadata.role = 'support', which only the service role can set).
import { reply, requestUser } from './common.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const corsReply = (status: number, body: unknown) => reply(status, body, CORS);

/** The answer to the browser's preflight request. */
export const preflight = () => new Response(null, { status: 204, headers: CORS });

export async function isSupportRequest(req: Request) {
  const user = await requestUser(req);
  return user?.app_metadata?.role === 'support';
}
