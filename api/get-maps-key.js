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

    console.log('🔑 API key check:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });

    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY environment variable not found');
      return res.status(503).json({
        success: false,
        message: 'Google Maps API key not configured'
      });
    }

    // Return the API key (in production, you might want to add additional security)
    console.log('✅ API key found, returning to client');
    return res.status(200).json({
      success: true,
      apiKey: apiKey
    });
  } catch (error) {
    console.error('❌ Error retrieving Maps API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving API key'
    });
  }
}

