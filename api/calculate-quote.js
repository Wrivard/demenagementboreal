// API endpoint for calculating moving quote (Vercel Serverless Function)
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
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data['service-type']) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants'
      });
    }

    // Calculate quote based on service type
    let quote = {
      basePrice: 0,
      breakdown: {},
      total: 0
    };

    const serviceType = data['service-type'];
    const distance = parseFloat(data.distance) || 0;

    if (serviceType === 'residential') {
      // Residential pricing
      quote.basePrice = 500; // Base price for residential
      
      // Residence type multiplier
      const residenceMultipliers = {
        'apartment': 1.0,
        'family-house': 1.5,
        'condo': 1.2,
        'duplex': 1.3,
        'other': 1.1
      };
      const residenceType = data.residence || 'apartment';
      const residenceMultiplier = residenceMultipliers[residenceType] || 1.0;
      quote.basePrice *= residenceMultiplier;

      // Rooms multiplier
      const roomsMultipliers = {
        '1-2': 1.0,
        '3-4': 1.5,
        '5-6': 2.0,
        '7+': 2.5
      };
      const rooms = data.rooms || '1-2';
      const roomsMultiplier = roomsMultipliers[rooms] || 1.0;
      quote.basePrice *= roomsMultiplier;

      // Floor multiplier
      const floorMultipliers = {
        'ground-floor': 1.0,
        '2nd-floor': 1.2,
        '3rd-floor+': 1.4
      };
      const floors = data.floors || 'ground-floor';
      const floorMultiplier = floorMultipliers[floors] || 1.0;
      quote.basePrice *= floorMultiplier;

      quote.breakdown['Déménagement résidentiel'] = quote.basePrice;

      // Additional services (normalized to services[] in JavaScript)
      const services = Array.isArray(data['services[]']) ? data['services[]'] : [];
      if (services.includes('packing')) {
        const packingPrice = quote.basePrice * 0.3;
        quote.breakdown['Emballage'] = packingPrice;
        quote.basePrice += packingPrice;
      }
      if (services.includes('assembly')) {
        const assemblyPrice = quote.basePrice * 0.2;
        quote.breakdown['Démontage/Remontage'] = assemblyPrice;
        quote.basePrice += assemblyPrice;
      }
      if (services.includes('storage')) {
        const storagePrice = 200;
        quote.breakdown['Entreposage'] = storagePrice;
        quote.basePrice += storagePrice;
      }

      // Complex items
      const complexItems = Array.isArray(data['complex[]']) ? data['complex[]'] : [];
      if (complexItems.includes('piano')) {
        const pianoPrice = 300;
        quote.breakdown['Piano'] = pianoPrice;
        quote.basePrice += pianoPrice;
      }
      if (complexItems.includes('safebox')) {
        const safeboxPrice = 200;
        quote.breakdown['Coffre-fort'] = safeboxPrice;
        quote.basePrice += safeboxPrice;
      }
      if (complexItems.includes('art')) {
        const artPrice = 250;
        quote.breakdown['Œuvres d\'art'] = artPrice;
        quote.basePrice += artPrice;
      }

    } else if (serviceType === 'commercial') {
      // Commercial pricing
      quote.basePrice = 1000; // Base price for commercial
      
      // Establishment type multiplier
      const establishmentMultipliers = {
        'office': 1.0,
        'retail': 1.2,
        'restaurant': 1.5,
        'warehouse': 1.3,
        'medical': 1.4,
        'other': 1.1
      };
      const establishmentType = data['establishment-type'] || 'office';
      const establishmentMultiplier = establishmentMultipliers[establishmentType] || 1.0;
      quote.basePrice *= establishmentMultiplier;

      // Size multiplier
      const sizeMultipliers = {
        '0-100': 1.0,
        '101-300': 1.5,
        '301-500': 2.0,
        '501-1000': 2.5,
        '1000+': 3.0
      };
      const size = data.size || '0-100';
      const sizeMultiplier = sizeMultipliers[size] || 1.0;
      quote.basePrice *= sizeMultiplier;

      quote.breakdown['Déménagement commercial'] = quote.basePrice;

      // Additional services (normalized to services[] in JavaScript)
      const services = Array.isArray(data['services[]']) ? data['services[]'] : (Array.isArray(data['com-services[]']) ? data['com-services[]'] : []);
      if (services.includes('packing')) {
        const packingPrice = quote.basePrice * 0.4;
        quote.breakdown['Emballage'] = packingPrice;
        quote.basePrice += packingPrice;
      }
      if (services.includes('dismantling') || services.includes('assembly')) {
        const dismantlingPrice = quote.basePrice * 0.3;
        quote.breakdown['Démontage/Remontage'] = dismantlingPrice;
        quote.basePrice += dismantlingPrice;
      }
      if (services.includes('after-hours')) {
        const afterHoursPrice = quote.basePrice * 0.25;
        quote.breakdown['Hors heures'] = afterHoursPrice;
        quote.basePrice += afterHoursPrice;
      }
    }

    // Distance pricing (1.5$ per km)
    const distancePrice = distance * 1.5;
    if (distancePrice > 0) {
      quote.breakdown[`Distance (${distance} km)`] = distancePrice;
      quote.basePrice += distancePrice;
    }

    // Calculate total
    quote.total = Math.round(quote.basePrice);

    // Add tax calculation (15% GST + QST)
    const tax = quote.total * 0.15;
    quote.breakdown['Taxes (TPS + TVQ)'] = Math.round(tax);
    quote.total = Math.round(quote.total + tax);

    return res.status(200).json({
      success: true,
      ...quote
    });

  } catch (error) {
    console.error('Error calculating quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de l\'estimation'
    });
  }
}

