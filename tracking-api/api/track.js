
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trackingNumber, courier } = req.body;

  if (!trackingNumber || !courier) {
    return res.status(400).json({ error: 'Missing tracking number or courier' });
  }

  const API_KEYS = {
    aramex: process.env.ARAMEX_API_TOKEN,
    imile: process.env.IMILE_API_TOKEN
  };

  const URLS = {
    aramex: 'https://api.aramex.net/shipping/v1/Tracking',
    imile: 'https://api.imile.com/track'
  };

  const apiKey = API_KEYS[courier];
  const url = URLS[courier];

  if (!apiKey || !url) {
    return res.status(400).json({ error: 'Unsupported courier or missing API key' });
  }

  const payload = courier === 'aramex'
    ? { ShipmentTrackingNumbers: [trackingNumber] }
    : { waybill_number: trackingNumber };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching from courier API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
