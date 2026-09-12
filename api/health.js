import { getJson } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, private');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const checks = {
    service: true,
    storage: false,
    piApiKeyConfigured: Boolean(process.env.PI_API_KEY)
  };

  try {
    await getJson('iiou-mainnet:health');
    checks.storage = true;
  } catch (error) {
    return res.status(503).json({
      ok: false,
      service: 'iiou-mainnet',
      checks,
      error: 'Storage is not ready'
    });
  }

  return res.status(200).json({
    ok: true,
    service: 'iiou-mainnet',
    checks
  });
}
