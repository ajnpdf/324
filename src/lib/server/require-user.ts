import { adminAuth } from './firebase-admin';

export async function requireUser(request: Request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED');
  }

  const token = header.slice('Bearer '.length).trim();
  return adminAuth.verifyIdToken(token, true);
}