import { adminAuth } from './firebase-admin';

export async function requireUser(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED');
  }

  return adminAuth.verifyIdToken(authorization.slice(7).trim(), true);
}
