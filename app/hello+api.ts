import { createUser, readUsers } from '@/backend/db';

export async function GET(request: Request) {
  const users = await readUsers();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await createUser(body.name, body.email);
  return Response.json(user);
}