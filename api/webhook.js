import { handleGet, handlePost } from '../src/webhook.js';
import '../src/config.js';

export default async function handler(req, res) {
  if (req.method === 'GET')  return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.status(405).end('Method not allowed');
}
