import { syncCrdtRecords } from '@/backend/sync';

export async function POST(request: Request) {
  const body = await request.json();
  const updatedRecords = await syncCrdtRecords(body);
  return Response.json(updatedRecords);
}