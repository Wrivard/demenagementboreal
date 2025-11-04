// API endpoint for calculating distance between two addresses (Vercel Serverless Function)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Parse request body
    let data;
    if (typeof req.body === 'string') {
      try {
        data = JSON.parse(req.body);
      } catch (e) {
        data = req.body;
      }
    } else {
      data = req.body || {};
    }

    const { origin, destination } = data;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Adresses d\'origine et de destination requises'
      });
    }

    // Option 1: Use Google Maps Distance Matrix API
    // You need to set GOOGLE_MAPS_API_KEY in your Vercel environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;
        
        const response = await fetch(url);
        const result = await response.json();

        if (result.status === 'OK' && result.rows && result.rows.length > 0) {
          const element = result.rows[0].elements[0];
          
          if (element.status === 'OK') {
            // Distance is in meters, convert to kilometers
            const distanceInKm = element.distance.value / 1000;
            
            return res.status(200).json({
              success: true,
              distance: Math.round(distanceInKm),
              duration: element.duration?.text || null
            });
          } else {
            return res.status(400).json({
              success: false,
              message: 'Impossible de calculer la distance entre ces adresses'
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: 'Erreur lors du calcul de la distance'
          });
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'appel à l\'API Google Maps'
        });
      }
    } else {
      // Fallback: Return error message indicating API key is needed
      return res.status(503).json({
        success: false,
        message: 'Service de calcul de distance non configuré. Veuillez saisir la distance manuellement.',
        requiresApiKey: true
      });
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la distance'
    });
  }
}

