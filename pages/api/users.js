import { getDb } from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const users = await db.collection('users').find().toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
