// API endpoint to retrieve Google Maps API key (Vercel Serverless Function)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'Google Maps API key not configured'
      });
    }

    // Return the API key (in production, you might want to add additional security)
    return res.status(200).json({
      success: true,
      apiKey: apiKey
    });
  } catch (error) {
    console.error('Error retrieving Maps API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving API key'
    });
  }
}

