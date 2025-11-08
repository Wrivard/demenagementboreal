// API endpoint to send estimation emails via Resend (Vercel Serverless Function)
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
    console.log('📧 Starting email send process...');
    
    // Check if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    
    console.log('🔑 API Key check:', {
      hasApiKey: !!resendApiKey,
      keyLength: resendApiKey ? resendApiKey.length : 0,
      keyPrefix: resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'none'
    });
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable not found');
      return res.status(503).json({
        success: false,
        message: 'Resend API key not configured. Please add RESEND_API_KEY to Vercel environment variables.',
        error: 'RESEND_API_KEY missing'
      });
    }

    // Initialize Resend with API key (dynamic import for Vercel compatibility)
    console.log('🔧 Initializing Resend...');
    let resend;
    try {
      const { Resend } = await import('resend');
      resend = new Resend(resendApiKey);
      console.log('✅ Resend initialized successfully');
    } catch (importError) {
      console.error('❌ Error importing Resend:', importError);
      return res.status(500).json({
        success: false,
        message: 'Erreur d\'importation Resend: ' + importError.message,
        error: importError.message
      });
    }
    
    // Parse request body
    console.log('📦 Parsing request body...');
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

    // Validate required fields
    console.log('✅ Request body parsed:', {
      hasEmail: !!data.email,
      hasName: !!data.name,
      hasChoices: !!data.choices,
      hasPricing: !!data.pricing,
      choicesLength: data.choices?.length || 0
    });
    
    if (!data.email || !data.name || !data.choices || !data.pricing) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        missing: {
          email: !data.email,
          name: !data.name,
          choices: !data.choices,
          pricing: !data.pricing
        }
      });
    }

    // For testing, send both emails to wrivard@kua.quebec
    // Since kua.quebec is verified on Resend, we can send to any email address
    const testEmail = 'wrivard@kua.quebec';
    const userEmail = data.email;
    const userName = data.name;
    const choices = data.choices || [];
    const pricing = data.pricing || {};

    // Logo URL - encode to handle special characters
    const logoUrl = encodeURI('https://demenagementboreal.ca/images/black_textlogo_white_background-removebg-preview.png');

    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    };

    // Build choices HTML
    const choicesHTML = choices.length > 0 
      ? choices.map(choice => {
          const [label, ...valueParts] = choice.split(':');
          const value = valueParts.join(':').trim();
          return `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">
                <strong style="color: #1a1a1a;">${label}:</strong>
                <span style="color: #666; margin-left: 4px;">${value}</span>
              </td>
            </tr>
          `;
        }).join('')
      : '<tr><td style="padding: 8px 0; color: #666;">Aucune information disponible</td></tr>';

    // Email 1: Confirmation to user
    const userEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Gradient line at top -->
            <div style="height: 4px; background: linear-gradient(90deg, #72adcb 0%, #5a9bb8 100%);"></div>
            
            <!-- Logo section -->
            <div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
              <img src="${logoUrl}" alt="Déménagement Boréal" style="max-width: 200px; height: auto; margin: 0 auto; display: block;">
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
                Merci pour votre demande !
              </h1>
              <p style="color: #666; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                Nous avons bien reçu votre estimation de déménagement
              </p>

              <div style="background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                  Estimation de prix
                </h2>
                <div style="text-align: center; padding: 20px 0;">
                  <div style="font-size: 36px; font-weight: 700; color: #72adcb; line-height: 1.2;">
                    ${formatPrice(pricing.min)} <span style="font-size: 20px; color: #999; font-weight: 500; margin: 0 8px;">à</span> ${formatPrice(pricing.max)}
                  </div>
                </div>
              </div>

              <div style="background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                  Récapitulatif de votre demande
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  ${choicesHTML}
                </table>
              </div>

              <div style="background: rgba(114, 173, 203, 0.08); border-left: 3px solid #72adcb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="font-size: 13px; color: #72adcb; margin: 0; line-height: 1.6;">
                  <strong>Note importante:</strong> Ces prix sont sujets à changement lors de la soumission et ne constituent qu'une estimation rapide. 
                  Pour une estimation précise et personnalisée, contactez-nous directement.
                </p>
              </div>

              <div style="text-align: center; padding: 20px 0;">
                <a href="tel:4506024832" style="display: inline-block; background: #72adcb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px 8px 0;">
                  Nous appeler
                </a>
                <a href="mailto:dettboreal@gmail.com" style="display: inline-block; background: #ffffff; color: #72adcb; border: 2px solid #72adcb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px 8px 0;">
                  Nous écrire
                </a>
              </div>

            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px;">Déménagement Boréal</p>
              <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">Téléphone: 450-602-4832 | Email: dettboreal@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email 2: Notification to owner
    const ownerEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Gradient line at top -->
            <div style="height: 4px; background: linear-gradient(90deg, #72adcb 0%, #5a9bb8 100%);"></div>
            
            <!-- Logo section -->
            <div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
              <img src="${logoUrl}" alt="Déménagement Boréal" style="max-width: 200px; height: auto; margin: 0 auto; display: block;">
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
                Nouvelle demande d'estimation
              </h1>
              <p style="color: #666; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                Une nouvelle estimation a été demandée via le calculateur
              </p>

              <div style="background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                  Estimation de prix
                </h2>
                <div style="text-align: center; padding: 20px 0;">
                  <div style="font-size: 36px; font-weight: 700; color: #72adcb; line-height: 1.2;">
                    ${formatPrice(pricing.min)} <span style="font-size: 20px; color: #999; font-weight: 500; margin: 0 8px;">à</span> ${formatPrice(pricing.max)}
                  </div>
                </div>
              </div>

              <div style="background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                  Informations du client
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  ${choicesHTML}
                </table>
              </div>

              <div style="text-align: center; padding: 20px 0;">
                <a href="mailto:${userEmail}" style="display: inline-block; background: #72adcb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Contacter le client
                </a>
              </div>

            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px;">Déménagement Boréal - Calculateur d'estimation</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send both emails
    console.log('📤 Sending emails...', {
      to: testEmail,
      from: 'noreply@kua.quebec'
    });
    
    try {
      const emailResults = await Promise.allSettled([
        // Email to user (confirmation) - sent to test email for now
        resend.emails.send({
          from: 'Déménagement Boréal <noreply@kua.quebec>', // Using verified domain kua.quebec
          to: [testEmail], // For testing, send to test email
          replyTo: 'dettboreal@gmail.com',
          subject: `Confirmation de votre estimation - Déménagement Boréal`,
          html: userEmailHTML,
        }),
        // Email to owner (notification) - sent to test email for now
        resend.emails.send({
          from: 'Déménagement Boréal <noreply@kua.quebec>', // Using verified domain kua.quebec
          to: [testEmail], // For testing, send to test email
          replyTo: userEmail,
          subject: `Nouvelle demande d'estimation - ${userName}`,
          html: ownerEmailHTML,
        }),
      ]);
      
      console.log('📬 Email results received:', {
        userStatus: emailResults[0].status,
        ownerStatus: emailResults[1].status
      });

      // Check results
      const userEmailResult = emailResults[0];
      const ownerEmailResult = emailResults[1];

      let userEmailId = null;
      let ownerEmailId = null;
      let hasError = false;

      if (userEmailResult.status === 'fulfilled') {
        const result = userEmailResult.value;
        console.log('📧 User email result:', {
          hasError: !!result.error,
          hasData: !!result.data,
          error: result.error,
          dataId: result.data?.id
        });
        
        if (result.error) {
          console.error('❌ Error sending user email:', result.error);
          hasError = true;
        } else {
          userEmailId = result.data?.id;
          console.log('✅ User email sent successfully:', userEmailId);
        }
      } else {
        console.error('❌ Error sending user email (rejected):', userEmailResult.reason);
        hasError = true;
      }

      if (ownerEmailResult.status === 'fulfilled') {
        const result = ownerEmailResult.value;
        console.log('📧 Owner email result:', {
          hasError: !!result.error,
          hasData: !!result.data,
          error: result.error,
          dataId: result.data?.id
        });
        
        if (result.error) {
          console.error('❌ Error sending owner email:', result.error);
          hasError = true;
        } else {
          ownerEmailId = result.data?.id;
          console.log('✅ Owner email sent successfully:', ownerEmailId);
        }
      } else {
        console.error('❌ Error sending owner email (rejected):', ownerEmailResult.reason);
        hasError = true;
      }

      // Return success if at least one email was sent
      const success = userEmailId || ownerEmailId;

      // Collect error details
      const errors = [];
      if (userEmailResult.status === 'fulfilled' && userEmailResult.value.error) {
        errors.push({ type: 'user', error: userEmailResult.value.error });
      } else if (userEmailResult.status === 'rejected') {
        errors.push({ type: 'user', error: userEmailResult.reason?.message || userEmailResult.reason });
      }
      
      if (ownerEmailResult.status === 'fulfilled' && ownerEmailResult.value.error) {
        errors.push({ type: 'owner', error: ownerEmailResult.value.error });
      } else if (ownerEmailResult.status === 'rejected') {
        errors.push({ type: 'owner', error: ownerEmailResult.reason?.message || ownerEmailResult.reason });
      }

      console.log('📊 Final result:', {
        success,
        userEmailId,
        ownerEmailId,
        hasError,
        errors: errors.length > 0 ? errors : 'none'
      });

      return res.status(success ? 200 : 500).json({
        success: !!success,
        message: success ? 'Emails envoyés avec succès' : 'Erreur lors de l\'envoi des emails',
        emailIds: {
          user: userEmailId,
          owner: ownerEmailId,
        },
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (emailError) {
      console.error('❌ Error in email sending process:', emailError);
      console.error('❌ Error stack:', emailError.stack);
      throw emailError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des emails',
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

