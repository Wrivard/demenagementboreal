# 🚀 Complete Webflow to Resend Email Integration Guide
*Updated with Céramique JLepage implementation - Production Ready*

## 📋 Overview
This guide walks you through setting up professional email functionality for a Webflow-exported site using Resend API, including form handling, beautiful email templates, clean success/error messages, and deployment on Vercel.

**✨ Features Included:**
- Professional HTML email templates (business + client confirmation)
- Clean success/error message design with SVG icons
- Proper Webflow message override system
- French language support
- Mobile-responsive design
- Comprehensive error handling

## 🎯 Prerequisites
- Webflow site exported as HTML/CSS/JS
- Vercel account for hosting
- Resend account for email service
- Git repository for version control
- Basic knowledge of HTML/CSS/JavaScript

---

## 📦 1. Initial Setup

### 1.1 Project Structure
After Webflow export, your project should have:
```
project-root/
├── index.html
├── css/
├── js/
├── images/
├── api/
│   └── submit-form.js (create this)
├── package.json (create this)
└── vercel.json (create this)
```

### 1.2 Create package.json
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Webflow site with Resend email integration",
  "main": "server.js",
  "scripts": {
    "dev": "vercel dev",
    "start": "vercel dev",
    "test:email": "node verify-email.js"
  },
  "dependencies": {
    "resend": "^2.0.0"
  },
  "keywords": ["webflow", "resend", "email"],
  "license": "MIT"
}
```

### 1.3 Create vercel.json
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

## 🔧 2. Resend Configuration

### 2.1 Get Resend API Keys
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the API key (starts with `re_`)

### 2.2 Domain Verification (IMPORTANT)
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS verification steps
4. Wait for verification ✅

### 2.3 Set Environment Variables in Vercel
1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   RESEND_API_KEY = your_actual_resend_api_key
   FROM_EMAIL = noreply@yourdomain.com (or onboarding@resend.dev)
   ```

---

## 📧 3. Create API Endpoint

### 3.1 Create api/submit-form.js
*Production-ready version with professional email templates*

```javascript
import { Resend } from 'resend';

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
    // Extract form data (adjust field names to match your Webflow form)
    // Example for Céramique JLepage form structure:
    const {
      'Contact-6-First-Name': firstName,
      'Contact-6-Last-Name': lastName,
      'Contact-6-Email': email,
      'Contact-6-Phone': phone,
      'Contact-6-Select': projectType,
      'Contact-6-Radio': clientType,
      'Contact-6-Message': message
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants' // French error message
      });
    }

    // Initialize Resend
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable missing');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const businessEmail = 'your-business@email.com'; // Change this to your business email

    const fullName = \`\${firstName} \${lastName}\`;

    // Professional business email template with branding
    const emailContent = \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle soumission - Your Business Name</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header with brand colors -->
                <tr>
                  <td style="background: #d4a574; color: #fff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Nouvelle Demande de Soumission</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your Business Name</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h3 style="color: #333; margin-top: 0;">Informations du client</h3>
                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 30%;">Nom complet:</td>
                        <td style="border-bottom: 1px solid #eee; color: #333;">\${fullName}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Courriel:</td>
                        <td style="border-bottom: 1px solid #eee; color: #333;">\${email}</td>
                      </tr>
                      \${phone ? \`
                      <tr>
                        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Téléphone:</td>
                        <td style="border-bottom: 1px solid #eee; color: #333;">\${phone}</td>
                      </tr>\` : ''}
                      \${projectType ? \`
                      <tr>
                        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Type de projet:</td>
                        <td style="border-bottom: 1px solid #eee; color: #333;">\${projectType}</td>
                      </tr>\` : ''}
                      \${clientType ? \`
                      <tr>
                        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Type de client:</td>
                        <td style="border-bottom: 1px solid #eee; color: #333;">\${clientType}</td>
                      </tr>\` : ''}
                    </table>
                    
                    <h3 style="color: #333; margin-top: 25px;">Message</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #d4a574;">
                      <p style="margin: 0; line-height: 1.6; color: #333;">\${message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 8px; border: 1px solid #d4a574;">
                      <p style="margin: 0; font-size: 14px; color: #666;">
                        <strong>Action requise:</strong> Répondre au client dans les 24h pour maintenir notre standard de service.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      Soumission reçue via yourwebsite.com<br>
                      \${new Date().toLocaleString('fr-CA', { timeZone: 'America/Montreal' })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    \`;

    // Send business email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      subject: \`Nouvelle soumission - \${fullName} (\${projectType || 'Non spécifié'})\`,
      html: emailContent,
      replyTo: email
    });

    if (error) {
      console.error('Email send error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\\'envoi de l\\'email'
      });
    }

    // Professional client confirmation email
    const confirmationContent = \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de soumission - Your Business Name</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: #28a745; color: #fff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Merci pour votre demande!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Bonjour \${firstName},</p>
                    <p style="margin: 0 0 20px 0; line-height: 1.6; color: #333;">
                      Merci d'avoir choisi <strong>Your Business Name</strong> pour votre projet. 
                      Nous avons bien reçu votre demande de soumission et nous vous contacterons dans les <strong>24 à 48 heures</strong>.
                    </p>
                    <p style="margin: 0 0 20px 0; line-height: 1.6; color: #333;">
                      Notre équipe d'experts analysera votre projet et vous proposera une solution personnalisée 
                      qui respecte vos besoins et votre budget.
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin: 0 0 15px 0; color: #d4a574;">Prochaines étapes:</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #333;">
                        <li>Analyse de votre demande (24h)</li>
                        <li>Préparation de la soumission détaillée</li>
                        <li>Prise de contact pour planifier une visite si nécessaire</li>
                        <li>Remise de votre soumission personnalisée</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; line-height: 1.6; color: #333;">
                      En attendant, n'hésitez pas à consulter nos <a href="https://yourwebsite.com/realisations" style="color: #d4a574;">réalisations récentes</a> 
                      pour vous inspirer.
                    </p>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333;">
                        <strong>Une question urgente?</strong><br>
                        📞 <a href="tel:+1234567890" style="color: #d4a574; text-decoration: none;">Your Phone Number</a><br>
                        ✉️ <a href="mailto:your-email@domain.com" style="color: #d4a574; text-decoration: none;">your-email@domain.com</a>
                      </p>
                    </div>
                    
                    <p style="margin: 30px 0 0 0; color: #333;">
                      Cordialement,<br>
                      <strong>L'équipe Your Business Name</strong><br>
                      <em>Your tagline here</em>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    \`;

    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Confirmation de votre demande de soumission - Your Business Name',
        html: confirmationContent,
        replyTo: businessEmail
      });
    } catch (confirmationError) {
      console.warn('Confirmation email failed:', confirmationError);
      // Don't fail the main request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: 'Votre demande a été envoyée avec succès! Nous vous contacterons sous peu.',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
}
```

---

## 🎨 4. Modify Webflow Form

### 4.1 Hide Default Webflow Messages
First, hide the default Webflow success/error messages and add custom containers:

```html
<!-- Hide default Webflow messages -->
<div class="form_message-success-wrapper w-form-done" style="display: none !important;">
  <div class="form_message-success">
    <div class="success-text">Merci ! Votre demande a été reçue avec succès.</div>
  </div>
</div>
<div class="form_message-error-wrapper w-form-fail" style="display: none !important;">
  <div class="form_message-error">
    <div class="error-text">Erreur lors de l'envoi. Veuillez réessayer.</div>
  </div>
</div>

<!-- Custom success message -->
<div id="custom-success-message" style="display: none;"></div>

<!-- Custom error message -->
<div id="custom-error-message" style="display: none;"></div>
```

### 4.2 Disable Webflow Form Handling (CRITICAL)
**Important:** Add `data-wf-ignore="true"` to your form tag to prevent Webflow interference:

```html
<form id="wf-form-Contact-6-Form" name="wf-form-Contact-6-Form" 
      data-name="Contact 6 Form" method="post" class="contact6_form" 
      data-wf-page-id="..." data-wf-element-id="..." 
      data-wf-ignore="true">
  <!-- Your form fields here -->
</form>
```

### 4.3 Update Form JavaScript with Clean Messages
Add this enhanced script before the closing `</body>` tag in your form page:

```html
<!-- Custom Form Submission Handler -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('wf-form-Contact-6-Form'); // Update with your form ID
  const successMessage = document.getElementById('custom-success-message');
  const errorMessage = document.getElementById('custom-error-message');
  const submitButton = form ? form.querySelector('input[type="submit"]') : null;

  // Function to completely hide all Webflow messages
  function hideAllWebflowMessages() {
    const webflowSuccess = document.querySelector('.w-form-done');
    const webflowError = document.querySelector('.w-form-fail');
    const webflowSuccessWrapper = document.querySelector('.form_message-success-wrapper');
    const webflowErrorWrapper = document.querySelector('.form_message-error-wrapper');
    
    if (webflowSuccess) webflowSuccess.style.display = 'none !important';
    if (webflowError) webflowError.style.display = 'none !important';
    if (webflowSuccessWrapper) webflowSuccessWrapper.style.display = 'none !important';
    if (webflowErrorWrapper) webflowErrorWrapper.style.display = 'none !important';
  }

  // Hide Webflow messages immediately and periodically
  hideAllWebflowMessages();
  setInterval(hideAllWebflowMessages, 100);

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Immediately hide all messages
      hideAllWebflowMessages();
      
      // Disable submit button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = 'Envoi en cours...';
      }
      
      // Hide any previous custom messages
      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';
      
      // Get form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        // Submit to API endpoint
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          // Hide form and all error messages
          form.style.display = 'none';
          if (errorMessage) errorMessage.style.display = 'none';
          
          // Ensure all Webflow messages stay hidden
          hideAllWebflowMessages();
          
          if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.innerHTML = \`
              <div style="text-align: center; padding: 50px 40px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); margin: 40px auto; max-width: 500px; border: 1px solid #e9ecef;">
                
                <!-- Simple round checkmark icon -->
                <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="color: white;">
                    <path stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                
                <h2 style="color: #2c3e50; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">
                  Demande envoyée avec succès!
                </h2>
                
                <p style="color: #6c757d; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">
                  Merci pour votre confiance. Notre équipe vous contactera dans les <strong style="color: #28a745;">24-48 heures</strong>.
                </p>
                
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; font-size: 14px; color: #6c757d;">
                  📧 Email de confirmation envoyé
                </div>
                
              </div>
            \`;
          }
        } else {
          throw new Error(result.message || 'Erreur lors de l\\'envoi');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Hide success message and ensure Webflow messages stay hidden
        if (successMessage) successMessage.style.display = 'none';
        hideAllWebflowMessages();
        
        if (errorMessage) {
          errorMessage.style.display = 'block';
          errorMessage.innerHTML = \`
            <div style="text-align: center; padding: 50px 40px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); margin: 40px auto; max-width: 500px; border: 1px solid #e9ecef;">
              
              <!-- Simple round warning icon -->
              <div style="width: 80px; height: 80px; background: #ffc107; border-radius: 50%; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(255, 193, 7, 0.3);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="color: white;">
                  <path stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              
              <h3 style="color: #2c3e50; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">
                Une erreur est survenue
              </h3>
              
              <p style="color: #6c757d; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">
                Veuillez réessayer ou nous contacter directement
              </p>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; font-size: 14px; color: #6c757d;">
                📞 <a href="tel:+1234567890" style="color: #6c757d; text-decoration: none; font-weight: 600;">Your Phone Number</a>
              </div>
              
            </div>
          \`;
        }
      } finally {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = 'Envoyer la soumission';
        }
      }
    });
  }
});
</script>
```

### 4.2 Form Fields Mapping
Make sure your Webflow form field names match your API expectations:
- `Contact-2-First-Name` → Full Name
- `Contact-2-Last-Name` → City  
- `Contact-2-Email-2` → Email
- `Contact-2-Phone` → Phone
- `Contact-2-Select` → Service
- `Contact-2-Radio` → Budget
- `Contact-2-Message` → Message

---

## 🔐 5. reCAPTCHA Integration (Optional)

### 5.1 Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create new site (choose reCAPTCHA v3)
3. Add your domain
4. Get Site Key and Secret Key

### 5.2 Add to Vercel Environment Variables
```
RECAPTCHA_SECRET_KEY = your_secret_key_here
```

### 5.3 Add reCAPTCHA to Form Page
```html
<!-- Add before closing </head> -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<!-- Update form script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('wf-form-Contact-2-Form');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get reCAPTCHA token
    let recaptchaToken = 'no-recaptcha';
    if (typeof grecaptcha !== 'undefined') {
      try {
        recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
      } catch (error) {
        console.warn('reCAPTCHA failed:', error);
      }
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data['g-recaptcha-response'] = recaptchaToken;

    // Rest of form submission code...
  });
});
</script>
```

---

## 🧹 6. Console Cleanup (Optional)

### 6.1 Add Permissions Policy
Add to `<head>` section of all pages:
```html
<meta http-equiv="Permissions-Policy" content="interest-cohort=(), browsing-topics=(), attribution-reporting=(), run-ad-auction=(), join-ad-interest-group=(), private-state-token-issuance=(), private-aggregation=()">
```

### 6.2 Add Console Error Suppression
Add before closing `</body>` on all pages:
```html
<!-- Console Error Suppression -->
<script>
// Suppress common console warnings that don't affect functionality
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('Permissions-Policy') || 
      message.includes('deprecated') ||
      message.includes('NoApiKeys') ||
      message.includes('sensor=fal')) {
    return; // Don't log these warnings
  }
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('InvalidValueError') && message.includes('NaN')) {
    return; // Don't log coordinate errors
  }
  originalError.apply(console, args);
};
</script>
```

---

## 🚀 7. Deployment

### 7.1 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set up environment variables in Vercel dashboard
# Deploy production
vercel --prod
```

### 7.2 Test Deployment
1. Submit test form
2. Check email delivery
3. Verify confirmation emails
4. Check Vercel function logs if issues

---

## 🐛 8. Debug Tools

### 8.1 Create Debug API Endpoint
Create `api/debug-form.js` for troubleshooting:

```javascript
// Debug version of the form submission endpoint
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
    console.log('=== DEBUG FORM SUBMISSION ===');
    console.log('Request body:', req.body);
    console.log('Environment variables check:');
    console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || 'Not set');

    // Extract form data
    const {
      'Contact-6-First-Name': firstName,
      'Contact-6-Last-Name': lastName,
      'Contact-6-Email': email,
      'Contact-6-Phone': phone,
      'Contact-6-Select': projectType,
      'Contact-6-Radio': clientType,
      'Contact-6-Message': message
    } = req.body;

    console.log('Form data extracted:');
    console.log('- firstName:', firstName);
    console.log('- lastName:', lastName);
    console.log('- email:', email);

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          message: !message
        }
      });
    }

    // Check if we can initialize Resend
    if (!process.env.RESEND_API_KEY) {
      console.log('ERROR: RESEND_API_KEY environment variable missing');
      return res.status(500).json({
        success: false,
        message: 'Configuration manquante - RESEND_API_KEY'
      });
    }

    // Try to import and initialize Resend
    let resend;
    try {
      const { Resend } = await import('resend');
      resend = new Resend(process.env.RESEND_API_KEY);
      console.log('Resend initialized successfully');
    } catch (importError) {
      console.log('ERROR importing Resend:', importError);
      return res.status(500).json({
        success: false,
        message: 'Erreur d\\'importation Resend: ' + importError.message
      });
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const businessEmail = 'your-test@email.com';
    const fullName = \`\${firstName} \${lastName}\`;

    console.log('Attempting to send email...');
    console.log('- From:', fromEmail);
    console.log('- To:', businessEmail);

    // Try to send a simple test email first
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      subject: \`TEST - Nouvelle soumission - \${fullName}\`,
      html: \`
        <h2>Test Email - Form Submission</h2>
        <p><strong>Name:</strong> \${fullName}</p>
        <p><strong>Email:</strong> \${email}</p>
        <p><strong>Message:</strong> \${message}</p>
        <p><em>This is a test email to debug the form submission.</em></p>
      \`
    });

    if (error) {
      console.log('EMAIL SEND ERROR:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\\'envoi: ' + error.message,
        error: error
      });
    }

    console.log('Email sent successfully:', data);

    res.status(200).json({
      success: true,
      message: 'Email de test envoyé avec succès!',
      data: data,
      debug: {
        fullName,
        email,
        fromEmail,
        businessEmail
      }
    });

  } catch (error) {
    console.log('GENERAL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne: ' + error.message,
      stack: error.stack
    });
  }
}
```

### 8.2 Temporary Debug Usage
To use the debug endpoint, temporarily change your form JavaScript:
```javascript
// Change this line:
const response = await fetch('/api/submit-form', {
// To this:
const response = await fetch('/api/debug-form', {
```

## 🔧 9. Troubleshooting

### Common Issues & Solutions:

**❌ Double Messages (Success + Error showing together):**
- **Cause:** Webflow default messages interfering with custom messages
- **Solution:** 
  1. Add `data-wf-ignore="true"` to form tag to disable Webflow handling
  2. Hide Webflow messages with `display: none !important;` and use custom containers
  3. Use `hideAllWebflowMessages()` function with periodic cleanup (every 100ms)
  4. Add `e.stopPropagation()` to prevent event bubbling

**❌ Error message shows during loading ("Envoi en cours..." + error):**
- **Cause:** Webflow tries to submit form to non-existent endpoint while custom JS submits to API
- **Solution:** Add `data-wf-ignore="true"` to completely disable Webflow form handling
- **Prevention:** Use the enhanced JavaScript with `hideAllWebflowMessages()` function

**❌ "Testing only" reCAPTCHA:**
- Replace test keys with production keys from Google reCAPTCHA admin

**❌ Emails not sending:**
- Check RESEND_API_KEY is set correctly in Vercel environment variables
- Verify domain is verified in Resend dashboard
- Use `onboarding@resend.dev` for FROM_EMAIL if domain not verified
- Check Vercel function logs for detailed error messages

**❌ Form not submitting:**
- Check form field names match API expectations exactly
- Verify API endpoint is accessible at `/api/submit-form`
- Check browser console for JavaScript errors
- Ensure form method is set to `POST`

**❌ 500 Server Error:**
- Check Vercel function logs: Dashboard → Functions → submit-form → Logs
- Verify all environment variables are set
- Check API code syntax and imports
- Use debug endpoint to isolate the issue

**❌ Emails going to spam:**
- Set up DNS records (SPF, DKIM, DMARC) in your domain settings
- Use verified domain for FROM_EMAIL
- Encourage users to mark as "not spam"
- Avoid spam trigger words in subject lines

**❌ Form shows loading state forever:**
- Check network tab for API response
- Verify JavaScript error handling
- Ensure button re-enabling in `finally` block

### Debug Tools:

**1. Test API directly:**
```bash
curl -X POST https://your-site.vercel.app/api/submit-form \\
  -H "Content-Type: application/json" \\
  -d '{"Contact-6-First-Name":"Test","Contact-6-Last-Name":"User","Contact-6-Email":"test@test.com","Contact-6-Message":"Test message"}'
```

**2. Check Vercel logs:**
- Vercel Dashboard → Functions → submit-form → Logs
- Look for console.log outputs and error messages

**3. Test email configuration:**
```bash
npm run test:email
```

**4. Browser debugging:**
- Open Developer Tools → Console
- Look for JavaScript errors during form submission
- Check Network tab for API request/response details

---

## ✅ 10. Final Checklist

### Environment Setup:
- [ ] Resend account created and domain verified
- [ ] Environment variables set in Vercel (`RESEND_API_KEY`, `FROM_EMAIL`)
- [ ] API endpoint created and tested
- [ ] Debug endpoint created for troubleshooting

### Form Implementation:
- [ ] **CRITICAL:** `data-wf-ignore="true"` added to form tag to disable Webflow handling
- [ ] Webflow default messages hidden with `display: none !important;`
- [ ] Custom message containers added (`#custom-success-message`, `#custom-error-message`)
- [ ] Enhanced JavaScript with `hideAllWebflowMessages()` function implemented
- [ ] Periodic cleanup (100ms interval) to suppress Webflow messages
- [ ] Form method changed from GET to POST
- [ ] Loading states implemented (button disable/enable)
- [ ] `e.stopPropagation()` added to prevent event bubbling

### Email Templates:
- [ ] Professional business email template with branding
- [ ] Client confirmation email with next steps
- [ ] French language support implemented
- [ ] Montreal timezone for timestamps

### Testing:
- [ ] Test form submission works (use debug endpoint first)
- [ ] Business emails received at correct address
- [ ] Confirmation emails sent to clients
- [ ] Success message shows cleanly (no double messages)
- [ ] Error handling works properly
- [ ] Mobile responsive design verified

### Production:
- [ ] Debug endpoint removed or secured
- [ ] Business email address updated from test email
- [ ] Production deployment successful
- [ ] All environment variables set in production

---

## 🎯 What We Accomplished

This implementation provides:

### ✨ **Professional User Experience:**
- Clean, minimal success/error messages with SVG icons
- No interference from Webflow default messages
- Loading states and proper error handling
- Mobile-responsive design

### 📧 **Enterprise Email System:**
- Professional HTML templates with branding
- Business notifications with all form data
- Client confirmation emails with next steps
- French language support
- Montreal timezone integration

### 🛠️ **Developer-Friendly:**
- Comprehensive debug tools
- Detailed error logging
- Easy customization for different projects
- Production-ready code structure

### 🚀 **Scalable Architecture:**
- Serverless functions on Vercel
- Environment-based configuration
- Proper error handling and fallbacks
- Easy to replicate for other projects

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [Webflow Form Documentation](https://university.webflow.com/lesson/forms)

---

## 🔄 For Next Projects

This guide is now optimized based on the Céramique JLepage implementation. For your next project:

1. **Copy the API endpoint** and update business details
2. **Use the clean message design** - just update colors/branding
3. **Follow the Webflow message hiding strategy** to avoid conflicts
4. **Use the debug endpoint** for quick troubleshooting
5. **Customize email templates** with client branding

**🎉 Congratulations! You now have a production-ready, professional email integration system that can be replicated for any Webflow project!**
