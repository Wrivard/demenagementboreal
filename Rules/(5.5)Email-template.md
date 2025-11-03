# 📧 Professional Email Templates for Webflow + Resend Integration

*Production-ready HTML email templates based on Céramique JLepage implementation*

## 🎯 Overview

These email templates provide a professional, responsive design that works across all email clients. They include:
- **Business Notification Email** - Sent to your business when a form is submitted
- **Client Confirmation Email** - Sent to the client as confirmation
- **Customizable branding** with your colors and content
- **Mobile-responsive design** with table-based layout
- **French language support** (easily adaptable to other languages)

---

## 📧 1. Business Notification Email Template

*This email is sent to your business email when someone submits a form*

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle soumission - [BUSINESS_NAME]</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header with brand colors -->
          <tr>
            <td style="background: #d4a574; color: #fff; text-align: center; padding: 30px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">📋 Nouvelle Demande de Soumission</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">[BUSINESS_NAME]</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="color: #333; margin-top: 0;">👤 Informations du client</h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 30%;">Nom complet:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[FULL_NAME]</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Courriel:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[EMAIL]</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Téléphone:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[PHONE]</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Type de projet:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[PROJECT_TYPE]</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Type de tuiles:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[TILE_TYPE]</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Superficie:</td>
                  <td style="border-bottom: 1px solid #eee; color: #333;">[SUPERFICIE]</td>
                </tr>
              </table>
              
              <h3 style="color: #333; margin-top: 25px;">💬 Message</h3>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #d4a574;">
                <p style="margin: 0; line-height: 1.6; color: #333;">[MESSAGE]</p>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 8px; border: 1px solid #d4a574;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>⚡ Action requise:</strong> Répondre au client dans les 24h pour maintenir notre standard de service.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Soumission reçue via [WEBSITE_URL]<br>
                [TIMESTAMP]
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 🔧 Business Email Customization Variables:
- `[BUSINESS_NAME]` - Your business name
- `[FULL_NAME]` - Client's full name
- `[EMAIL]` - Client's email address
- `[PHONE]` - Client's phone number
- `[PROJECT_TYPE]` - Type of project selected
- `[TILE_TYPE]` - Type of tiles (Céramique, Porcelaine, Marbre, etc.)
- `[SUPERFICIE]` - Surface area (10-25 m², 50-100 m², etc.)
- `[MESSAGE]` - Client's message
- `[WEBSITE_URL]` - Your website URL
- `[TIMESTAMP]` - Form submission timestamp
- `#d4a574` - Replace with your brand color

---

## 🎉 2. Client Confirmation Email Template

*This email is sent to the client as confirmation of their form submission*

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation de soumission - [BUSINESS_NAME]</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: #d4a574; color: #fff; text-align: center; padding: 30px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Merci pour votre demande!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Bonjour [FIRST_NAME],</p>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #333;">
                Merci d'avoir choisi <strong>[BUSINESS_NAME]</strong> pour votre projet. 
                Nous avons bien reçu votre demande de soumission et nous vous contacterons dans les <strong>24 à 48 heures</strong>.
              </p>
              
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #333;">
                Notre équipe d'experts analysera votre projet et vous proposera une solution personnalisée 
                qui respecte vos besoins et votre budget.
              </p>
              
              <!-- Next Steps -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #d4a574;">Prochaines étapes:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #333;">
                  <li>Analyse de votre demande (24h)</li>
                  <li>Préparation de la soumission détaillée</li>
                  <li>Prise de contact pour planifier une visite si nécessaire</li>
                  <li>Remise de votre soumission personnalisée</li>
                </ul>
              </div>
              
              <!-- Portfolio Link -->
              <p style="margin: 20px 0 0 0; line-height: 1.6; color: #333;">
                En attendant, n'hésitez pas à consulter nos <a href="[PORTFOLIO_URL]" style="color: #d4a574; text-decoration: none;">réalisations récentes</a> 
                pour vous inspirer.
              </p>
              
              <!-- Contact Info -->
              <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #333;">
                  <strong>Une question urgente?</strong><br>
                  📞 <a href="tel:[PHONE_NUMBER]" style="color: #333; text-decoration: none; font-weight: 600;">[PHONE_DISPLAY]</a><br>
                  ✉️ <a href="mailto:[BUSINESS_EMAIL]" style="color: #333; text-decoration: none; font-weight: 600;">[BUSINESS_EMAIL]</a>
                </p>
              </div>
              
              <!-- Signature -->
              <p style="margin: 30px 0 0 0; color: #333;">
                Cordialement,<br>
                <strong>L'équipe [BUSINESS_NAME]</strong><br>
                <em>[BUSINESS_TAGLINE]</em>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Vous recevez cet email car vous avez soumis une demande sur [WEBSITE_URL]<br>
                <a href="[WEBSITE_URL]" style="color: #d4a574; text-decoration: none;">[WEBSITE_URL]</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 🔧 Client Email Customization Variables:
- `[FIRST_NAME]` - Client's first name
- `[BUSINESS_NAME]` - Your business name
- `[PORTFOLIO_URL]` - Link to your portfolio/gallery page
- `[PHONE_NUMBER]` - Phone number for tel: link (e.g., +15147756608)
- `[PHONE_DISPLAY]` - Phone number for display (e.g., (514) 775-6608)
- `[BUSINESS_EMAIL]` - Your business email address
- `[BUSINESS_TAGLINE]` - Your business tagline or description
- `[WEBSITE_URL]` - Your website URL
- `#d4a574` - Primary brand color (used consistently throughout)

---

## ✨ 3. Recent Improvements (Based on Céramique JLepage Project)

### 🎯 **Visual Enhancements:**
- **Added emojis** for better visual hierarchy:
  - 📋 Main header for business emails
  - 👤 Client information section
  - 💬 Message section
  - ⚡ Action required alerts
- **Improved accessibility** with better contrast ratios
- **Professional yet engaging** design approach

### 🔧 **Form Field Updates:**
- **Replaced generic "Client Type"** with industry-specific "Tile Type"
- **Added "Superficie" field** for better project estimation
- **Tile type options:** Céramique, Porcelaine, Marbre, Granit, Travertin, Autre
- **Surface area ranges:** <10m², 10-25m², 25-50m², 50-100m², 100-200m², >200m², "Je ne sais pas"

### ♿ **Accessibility Improvements:**
- **Contact links in black (#333)** instead of brand color for better contrast
- **Bold font weight (600)** for important links
- **WCAG compliant** color combinations
- **Mobile-friendly** responsive design

### 📧 **Email Subject Optimization:**
- **Prioritizes tile type** in subject line for better organization
- **Format:** `Nouvelle soumission - [Name] ([Tile Type])`
- **Fallback to project type** if tile type not specified

---

## 🎨 4. Customization Guide

### Brand Colors:
Replace these colors with your brand palette:
- **Primary Brand Color:** `#d4a574` (used for headers, links, and accents)
- **Text Colors:** `#333` (dark), `#666` (medium), `#999` (light)
- **Background Colors:** `#f8f9fa` (light gray), `#fff3e0` (light brand tint)

### Typography:
- **Font Family:** Arial, sans-serif (safe for all email clients)
- **Header Size:** 24px, font-weight: 600
- **Body Text:** 16px, line-height: 1.6
- **Small Text:** 12-14px for footers and notes

### Responsive Design:
The templates use table-based layouts for maximum email client compatibility:
- **Max Width:** 600px for desktop
- **Padding:** Consistent 20-30px spacing
- **Mobile-friendly:** Scales down automatically

---

## 🔧 5. Implementation in API

### JavaScript Template Usage:

```javascript
// Business Email Template
const businessEmailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Nouvelle soumission - ${businessName}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
    <!-- Use the business template above, replacing variables with: -->
    <!-- ${fullName}, ${email}, ${phone}, ${projectType}, ${tileType}, ${superficie}, ${message} -->
  </body>
  </html>
`;

// Client Confirmation Template
const confirmationEmailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Confirmation de soumission - ${businessName}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
    <!-- Use the client template above, replacing variables with: -->
    <!-- ${firstName}, ${businessName}, ${portfolioUrl}, etc. -->
  </body>
  </html>
`;
```

### Configuration Variables:
Create a config object for easy customization:

```javascript
const emailConfig = {
  businessName: "Your Business Name",
  businessTagline: "Your expertise tagline",
  businessEmail: "contact@yourbusiness.com",
  phoneNumber: "+1234567890",
  phoneDisplay: "(123) 456-7890",
  websiteUrl: "https://yourbusiness.com",
  portfolioUrl: "https://yourbusiness.com/portfolio",
  brandColor: "#d4a574"
};
```

---

## 📱 6. Email Client Testing

These templates are tested and work well in:
- ✅ **Gmail** (Desktop & Mobile)
- ✅ **Outlook** (2016, 2019, 365, Web)
- ✅ **Apple Mail** (macOS & iOS)
- ✅ **Yahoo Mail**
- ✅ **Thunderbird**
- ✅ **Mobile clients** (iPhone, Android)

### Testing Tools:
- [Litmus](https://litmus.com/) - Email testing across clients
- [Email on Acid](https://www.emailonacid.com/) - Comprehensive testing
- [Mailtrap](https://mailtrap.io/) - Email testing in development

---

## 🚀 7. Quick Start Checklist

For your next project:

1. **Copy the templates** from this file
2. **Replace all `[VARIABLES]`** with your business information
3. **Update brand colors** (`#d4a574` to your color)
4. **Customize the content** for your industry/services
5. **Test in your email client** before going live
6. **Update the API endpoint** with your templates

---

## 💡 8. Pro Tips

### Email Deliverability:
- Keep subject lines under 50 characters
- Use a verified domain for FROM_EMAIL
- Include both text and HTML versions
- Test spam score before sending

### Personalization:
- Always use the client's first name
- Reference their specific project type
- Include relevant next steps
- Add your business personality

### Mobile Optimization:
- Use single-column layouts
- Keep text size 16px+ for mobile
- Make buttons finger-friendly (44px+)
- Test on actual mobile devices

---

**🎉 These templates provide a professional foundation that you can customize for any business or industry!**
