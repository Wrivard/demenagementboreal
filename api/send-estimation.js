// API endpoint to send estimation emails via Resend (Vercel Serverless Function)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Validate required fields
    if (!data.email || !data.name || !data.choices || !data.pricing) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants'
      });
    }

    // For testing, send both emails to wrivard@kua.quebec
    const testEmail = 'wrivard@kua.quebec';
    const userEmail = data.email;
    const userName = data.name;
    const choices = data.choices || [];
    const pricing = data.pricing || {};

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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #72adcb 0%, #5a9bb8 100%); border-radius: 12px; padding: 32px 24px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">
              Merci pour votre demande !
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
              Nous avons bien reçu votre estimation de déménagement
            </p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
              Estimation de prix
            </h2>
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 36px; font-weight: 700; color: #72adcb; margin-bottom: 8px;">
                ${formatPrice(pricing.min)}
              </div>
              <div style="font-size: 16px; color: #999; margin-bottom: 8px;">à</div>
              <div style="font-size: 36px; font-weight: 700; color: #72adcb;">
                ${formatPrice(pricing.max)}
              </div>
            </div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
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

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
            <p style="margin: 0;">Déménagement Boréal</p>
            <p style="margin: 4px 0 0 0;">Téléphone: 450-602-4832 | Email: dettboreal@gmail.com</p>
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; border-radius: 12px; padding: 32px 24px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">
              Nouvelle demande d'estimation
            </h1>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; margin: 0;">
              Une nouvelle estimation a été demandée via le calculateur
            </p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
              Estimation de prix
            </h2>
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 36px; font-weight: 700; color: #72adcb; margin-bottom: 8px;">
                ${formatPrice(pricing.min)}
              </div>
              <div style="font-size: 16px; color: #999; margin-bottom: 8px;">à</div>
              <div style="font-size: 36px; font-weight: 700; color: #72adcb;">
                ${formatPrice(pricing.max)}
              </div>
            </div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
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

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
            <p style="margin: 0;">Déménagement Boréal - Calculateur d'estimation</p>
          </div>
        </body>
      </html>
    `;

    // Send both emails
    const emailResults = await Promise.allSettled([
      // Email to user (confirmation) - sent to test email for now
      resend.emails.send({
        from: 'Déménagement Boréal <onboarding@resend.dev>', // Update with your verified domain
        to: [testEmail], // For testing, send to test email
        replyTo: 'dettboreal@gmail.com',
        subject: `Confirmation de votre estimation - Déménagement Boréal`,
        html: userEmailHTML,
      }),
      // Email to owner (notification) - sent to test email for now
      resend.emails.send({
        from: 'Déménagement Boréal <onboarding@resend.dev>', // Update with your verified domain
        to: [testEmail], // For testing, send to test email
        replyTo: userEmail,
        subject: `Nouvelle demande d'estimation - ${userName}`,
        html: ownerEmailHTML,
      }),
    ]);

    // Check results
    const userEmailResult = emailResults[0];
    const ownerEmailResult = emailResults[1];

    let userEmailId = null;
    let ownerEmailId = null;
    let hasError = false;

    if (userEmailResult.status === 'fulfilled') {
      const result = userEmailResult.value;
      if (result.error) {
        console.error('❌ Error sending user email:', result.error);
        hasError = true;
      } else {
        userEmailId = result.data?.id;
        console.log('✅ User email sent successfully:', userEmailId);
      }
    } else {
      console.error('❌ Error sending user email:', userEmailResult.reason);
      hasError = true;
    }

    if (ownerEmailResult.status === 'fulfilled') {
      const result = ownerEmailResult.value;
      if (result.error) {
        console.error('❌ Error sending owner email:', result.error);
        hasError = true;
      } else {
        ownerEmailId = result.data?.id;
        console.log('✅ Owner email sent successfully:', ownerEmailId);
      }
    } else {
      console.error('❌ Error sending owner email:', ownerEmailResult.reason);
      hasError = true;
    }

    // Return success if at least one email was sent
    const success = userEmailId || ownerEmailId;

    return res.status(success ? 200 : 500).json({
      success: !!success,
      message: success ? 'Emails envoyés avec succès' : 'Erreur lors de l\'envoi des emails',
      emailIds: {
        user: userEmailId,
        owner: ownerEmailId,
      },
    });
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des emails',
      error: error.message,
    });
  }
}

