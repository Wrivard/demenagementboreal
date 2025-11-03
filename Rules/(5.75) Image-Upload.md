# Image Upload Integration Guide

A comprehensive guide for adding image upload functionality to contact forms with email attachments.

## Overview

This guide explains how to integrate image upload features into contact forms that send images as email attachments without requiring permanent storage. The solution works with both Vercel API routes and Express servers.

## Table of Contents

1. [Frontend Implementation](#frontend-implementation)
2. [Backend Implementation](#backend-implementation)
3. [Email Integration](#email-integration)
4. [Dependencies](#dependencies)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Complete Example](#complete-example)

## Frontend Implementation

### 1. HTML Form Setup - Multiple Button Approach (Recommended)

```html
<!-- Add enctype="multipart/form-data" to your form -->
<form id="contact-form" enctype="multipart/form-data">
  <!-- Your existing form fields -->
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  
  <!-- Image upload section with multiple buttons -->
  <div class="form-field">
    <label>Photos du projet (optionnel)</label>
    <div id="image-upload-container" style="border: 2px dashed #ccc; padding: 20px; border-radius: 8px; background: #f9f9f9;">
      <div id="add-image-buttons" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
        <button type="button" onclick="addImage()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">+ Ajouter une image</button>
      </div>
      <div id="selected-images" style="display: none;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333; font-weight: bold;">Images sélectionnées:</h4>
        <div id="image-list"></div>
      </div>
      <div class="text-size-small" style="margin-top: 10px; color: #666;">Format accepté: JPG, PNG, GIF - Max 5MB par image - Maximum 5 images</div>
    </div>
  </div>
  
  <button type="submit">Envoyer</button>
</form>
```

### 2. Alternative: Traditional File Input (Not Recommended)

```html
<!-- Traditional approach - can have browser compatibility issues -->
<div class="form-field">
  <label for="images">Photos du projet (optionnel)</label>
  <input type="file" 
         id="images" 
         name="images[]" 
         accept="image/*" 
         multiple 
         class="form-input">
  <small>Vous pouvez sélectionner plusieurs images (JPG, PNG, GIF - max 5MB chacune)</small>
</div>
```

### 2. JavaScript Implementation - Multiple Button Approach

```javascript
// Global variables
window.selectedFiles = [];
const maxImages = 5;

// Simple function to add image
function addImage() {
  console.log('🖱️ Add image button clicked!');
  
  // Check if we already have max images
  if (window.selectedFiles.length >= maxImages) {
    alert(`Maximum ${maxImages} images autorisées.`);
    return;
  }
  
  // Create file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      console.log('📄 File selected:', file.name, file.size);
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Maximum 5MB par image.');
        return;
      }
      
      // Add file to our list
      window.selectedFiles.push(file);
      console.log('✅ File added. Total files:', window.selectedFiles.length);
      updateDisplay();
    }
  };
  
  // Trigger file selection
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// Update display
function updateDisplay() {
  const selectedImagesDiv = document.getElementById('selected-images');
  const imageList = document.getElementById('image-list');
  const addButtonsContainer = document.getElementById('add-image-buttons');
  
  if (window.selectedFiles.length === 0) {
    selectedImagesDiv.style.display = 'none';
  } else {
    selectedImagesDiv.style.display = 'block';
    imageList.innerHTML = window.selectedFiles.map((file, index) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: white; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 5px;">
        <span style="flex: 1; color: #333; font-size: 14px;">${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        <button type="button" onclick="removeImage(${index})" style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px;">×</button>
      </div>
    `).join('');
  }
  
  // Update button
  const remaining = maxImages - window.selectedFiles.length;
  if (remaining > 0) {
    addButtonsContainer.innerHTML = `<button type="button" onclick="addImage()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">+ Ajouter une image</button>`;
  } else {
    addButtonsContainer.innerHTML = '<span style="color: #666; font-style: italic;">Maximum de 5 images atteint</span>';
  }
}

// Remove image function
function removeImage(index) {
  window.selectedFiles.splice(index, 1);
  updateDisplay();
}

// Initialize when page loads
window.addEventListener('load', function() {
  console.log('🚀 Image upload script loaded');
  updateDisplay();
});
```

### 3. Form Submission with Selected Files

```javascript
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Add selected files to form data
  const selectedFiles = window.selectedFiles || [];
  selectedFiles.forEach((file, index) => {
    formData.append('Contact-2-Image[]', file);
  });
  
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      body: formData // Send FormData directly
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Form submitted successfully!');
      form.reset();
      window.selectedFiles = []; // Clear selected files
      updateDisplay();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
});
```

### 4. Traditional File Input Approach (Alternative)

**❌ WRONG - This loses file data:**
```javascript
const formData = new FormData(form);
const data = {};
formData.forEach((value, key) => {
  data[key] = value; // File objects become empty {}
});

fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data) // Files are lost!
});
```

**✅ CORRECT - This preserves file data:**
```javascript
const formData = new FormData(form);

fetch('/api/submit', {
  method: 'POST',
  // Don't set Content-Type header - let browser set multipart boundary
  body: formData // Send FormData directly
});
```

### 3. Complete Frontend Example

```javascript
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Add any additional data
  formData.append('timestamp', new Date().toISOString());
  
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Form submitted successfully!');
      form.reset();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
});
```

## Backend Implementation

### 1. Vercel API Route (api/submit-form.js)

```javascript
import { Resend } from 'resend';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

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
    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5, // Maximum 5 files
      keepExtensions: true,
      uploadDir: '/tmp' // Temporary directory
    });

    const [fields, files] = await form.parse(req);
    
    // Extract form fields - handle both single values and arrays
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    
    // Extract uploaded files - handle both single file and multiple files
    let uploadedFiles = files['Contact-2-Image[]'] || files['Contact-2-Image'] || [];
    
    // Ensure uploadedFiles is always an array
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }
    
    // Filter out any undefined/null files
    uploadedFiles = uploadedFiles.filter(file => file && file.filepath);
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.'
      });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Prepare attachments
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file && file.filepath) {
          try {
            const fileBuffer = fs.readFileSync(file.filepath);
            attachments.push({
              filename: file.originalFilename || `image_${Date.now()}.jpg`,
              content: fileBuffer,
              contentType: file.mimetype || 'image/jpeg'
            });
          } catch (fileError) {
            console.error('Error reading file:', fileError);
          }
        }
      }
    }

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      ${uploadedFiles && uploadedFiles.length > 0 ? 
        `<p><strong>Images attached:</strong> ${uploadedFiles.length} file(s)</p>` : 
        ''
      }
    `;

    // Send email
    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: process.env.TO_EMAIL || 'your-email@domain.com',
      subject: `New Contact Form - ${name}`,
      html: emailContent,
      replyTo: email
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    // Clean up temporary files
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file && file.filepath) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
      }
    }

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}
```

### 2. Express Server (server.js)

```javascript
const express = require('express');
const multer = require('multer');
const { Resend } = require('resend');
const fs = require('fs');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // Temporary directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Contact form endpoint
app.post('/api/submit-form', upload.array('Contact-2-Image', 5), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const uploadedFiles = req.files || [];

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.'
      });
    }

    // Prepare attachments
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          const fileBuffer = fs.readFileSync(file.path);
          attachments.push({
            filename: file.originalname || `image_${Date.now()}.jpg`,
            content: fileBuffer,
            contentType: file.mimetype || 'image/jpeg'
          });
        } catch (fileError) {
          console.error('Error reading file:', fileError);
        }
      }
    }

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      ${uploadedFiles && uploadedFiles.length > 0 ? 
        `<p><strong>Images attached:</strong> ${uploadedFiles.length} file(s)</p>` : 
        ''
      }
    `;

    // Send email
    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: process.env.TO_EMAIL || 'your-email@domain.com',
      subject: `New Contact Form - ${name}`,
      html: emailContent,
      replyTo: email
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    // Clean up temporary files
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
    }

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Form submitted successfully!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Email Integration

### 1. Resend API Setup

```javascript
// Environment variables
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@domain.com
```

### 2. Email Template with Image Notifications

```javascript
const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>New Contact Form Submission</h2>
    
    <div class="client-info">
      <h3>Client Information</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    </div>
    
    <div class="project-details">
      <h3>Project Details</h3>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Message:</strong> ${message}</p>
      
      ${uploadedFiles && uploadedFiles.length > 0 ? `
      <div class="images-section">
        <h4>📷 Images Attached (${uploadedFiles.length})</h4>
        <p>The client has attached ${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} to their submission. See the email attachments.</p>
      </div>
      ` : ''}
    </div>
  </body>
  </html>
`;
```

## Dependencies

### package.json

```json
{
  "dependencies": {
    "resend": "^2.0.0",
    "formidable": "^3.5.1",
    "multer": "^1.4.5-lts.1",
    "express": "^4.18.2"
  }
}
```

### Installation

```bash
npm install resend formidable multer express
```

## Testing

### 1. Test Form Submission

```javascript
// Test with images
const formData = new FormData();
formData.append('name', 'Test User');
formData.append('email', 'test@example.com');
formData.append('message', 'Test message');

// Add test image
const fileInput = document.getElementById('images');
if (fileInput.files.length > 0) {
  for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('images', fileInput.files[i]);
  }
}

fetch('/api/submit-form', {
  method: 'POST',
  body: formData
});
```

### 2. Debug Logging

```javascript
// Add to your API handler
console.log('Uploaded files:', uploadedFiles);
console.log('Attachments prepared:', attachments.length);
console.log('Email data:', emailData);
```

## Troubleshooting

### Common Issues

1. **Files not being received:**
   - Check that `enctype="multipart/form-data"` is set on the form
   - Ensure you're sending `FormData` directly, not converting to JSON
   - Don't set `Content-Type` header manually

2. **Files not appearing in email:**
   - Check file size limits (4MB per file, 4.5MB total for Vercel)
   - Verify file types (images only)
   - Check server logs for errors
   - Ensure Resend API key is valid

3. **Form data truncated:**
   - Use proper field extraction for formidable/multer
   - Handle both single values and arrays

4. **413 Payload Too Large errors:**
   - Vercel limits total request size to ~4.5MB (includes multipart overhead)
   - Reduce per-file limit to 4MB and validate total size client-side
   - Example: 3.79MB + 0.73MB = 4.52MB exceeds limit with overhead
   - Solution: Validate total size before upload and show specific error messages

5. **Error messages not displaying properly:**
   - Generic error messages instead of specific ones
   - Handle 413 errors before trying to parse JSON response
   - Extract and display error.message in catch block
   - Sanitize error messages for HTML display

### Debug Checklist

- [ ] Form has `enctype="multipart/form-data"`
- [ ] JavaScript sends `FormData` directly
- [ ] No `Content-Type` header set manually
- [ ] Backend uses formidable (Vercel) or multer (Express)
- [ ] File validation is working
- [ ] Email service supports attachments
- [ ] Temporary files are cleaned up

## Complete Example

See the working implementation in this project:
- Frontend: `soumission-en-ligne.html`
- Vercel API: `api/submit-form.js`
- Express Server: `server.js`

## Multiple Button vs Traditional File Input

### Multiple Button Approach (Recommended)

**Advantages:**
- ✅ **More reliable** - no browser compatibility issues
- ✅ **Better UX** - clear visual feedback for each image
- ✅ **Easier debugging** - simple inline functions
- ✅ **Individual control** - remove specific images easily
- ✅ **File validation** - check size before adding to list
- ✅ **Visual progress** - see exactly what's selected

**Disadvantages:**
- ❌ **More code** - requires custom JavaScript
- ❌ **One image at a time** - can't select multiple in one dialog

### Traditional File Input Approach

**Advantages:**
- ✅ **Less code** - uses native HTML input
- ✅ **Multiple selection** - can select many files at once
- ✅ **Familiar UX** - standard file picker behavior

**Disadvantages:**
- ❌ **Browser issues** - some browsers don't handle multiple files well
- ❌ **Less control** - harder to validate individual files
- ❌ **Poor UX** - no visual feedback until form submission
- ❌ **Complex debugging** - harder to troubleshoot issues

## Key Takeaways

1. **Use the Multiple Button approach** for better reliability and UX
2. **Always use `FormData`** for file uploads
3. **Never convert to JSON** - it loses file data
4. **Let the browser set Content-Type** for multipart data
5. **Clean up temporary files** after processing
6. **Validate file types and sizes** on both frontend and backend
7. **Use proper error handling** for file operations
8. **Provide clear visual feedback** to users

This approach provides a robust, scalable solution for image uploads in contact forms without requiring permanent file storage.

## Real-World Implementation Lessons (December 2024)

### Critical Issues Discovered & Solutions

#### 1. Image Compression & Filename Preservation

**Problem**: Compressed images were losing their original filenames, showing as "blob" attachments in emails.

**Root Cause**: 
```javascript
// ❌ WRONG - Creates blob without filename
const compressedFile = new File([compressedBlob], 'compressed.jpg');

// ✅ CORRECT - Preserve original filename
const properFile = new File([compressedFile], file.name, {
  type: 'image/jpeg',
  lastModified: Date.now()
});
```

**Solution**: Always preserve the original filename when creating compressed files.

#### 2. Form Message Display Logic

**Problem**: Both success and error messages were showing simultaneously when form submission succeeded.

**Root Cause**: Error messages weren't being hidden when success occurred.

**Solution**:
```javascript
// Clear messages at start of submission
if (errorMessage) errorMessage.style.display = 'none';
if (successMessage) successMessage.style.display = 'none';

// Hide error when showing success
if (result.success) {
  if (errorMessage) errorMessage.style.display = 'none';
  if (successMessage) successMessage.style.display = 'block';
}
```

#### 3. Email Attachment Filename Sanitization

**Problem**: Special characters in filenames caused email attachment issues.

**Solution**:
```javascript
// Generate clean filenames for email attachments
const cleanFilename = file.originalFilename ? 
  file.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_') : 
  `image_${timestamp}.${fileExtension}`;
```

#### 4. File Size Validation & User Feedback

**Problem**: Large files caused 413 errors without clear user feedback. Files under the per-file limit were still rejected.

**Root Cause**: 
- Vercel has a **total request payload limit of ~4.5MB** (not per file)
- This includes multipart encoding overhead, form data, and all files combined
- Example: 3.79MB + 0.73MB = 4.52MB total, which exceeds the limit when combined with multipart overhead

**Solution - Client-Side Validation**:
```javascript
// Check file size (4MB max per file)
const maxFileSize = 4 * 1024 * 1024; // 4MB per file
if (file.size > maxFileSize) {
  alert('Le fichier est trop volumineux. Maximum 4MB par image.');
  return;
}

// Check total size (4.5MB max total to account for multipart overhead)
const totalSize = window.selectedFiles.reduce((sum, f) => sum + f.size, 0);
const maxTotalSize = 4.5 * 1024 * 1024; // 4.5MB total
if (totalSize + file.size > maxTotalSize) {
  alert('La taille totale des images est trop importante. Maximum ~4.5MB au total (incluant toutes les images).');
  return;
}
```

**Solution - Server-Side Configuration**:
```javascript
// Vercel has a ~4.5MB total payload limit, so we use 4MB per file
const form = formidable({
  maxFileSize: 4 * 1024 * 1024, // 4MB per file (to account for multipart overhead)
  maxFiles: 5,
  keepExtensions: true,
  uploadDir: '/tmp'
});

// Handle formidable parsing errors (file size, etc.)
let fields, files;
try {
  [fields, files] = await form.parse(req);
} catch (parseError) {
  // Handle file size errors from formidable
  if (parseError.message && parseError.message.includes('maxFileSize') || parseError.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Les images sont trop volumineuses. Veuillez réduire la taille des images ou en sélectionner moins. Maximum ~4.5MB au total.'
    });
  }
  // Re-throw other errors
  throw parseError;
}
```

**Solution - 413 Error Handling**:
```javascript
// Check for 413 error (payload too large) - handle before trying to parse JSON
if (response.status === 413) {
  const errorMsg = 'Les images sont trop volumineuses. Veuillez réduire la taille des images ou en sélectionner moins. Maximum ~4.5MB au total.';
  throw new Error(errorMsg);
}

// Try to parse JSON response
let result;
try {
  const responseText = await response.text();
  if (responseText) {
    result = JSON.parse(responseText);
  } else {
    throw new Error('Réponse vide du serveur');
  }
} catch (parseError) {
  // If JSON parsing fails, check status code
  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status}): ${response.statusText || 'Erreur inconnue'}`);
  }
  throw parseError;
}
```

**Important Limits for Vercel**:
- **Per file limit**: 4MB (to leave room for overhead)
- **Total payload limit**: ~4.5MB (Vercel's hard limit)
- **Maximum files**: 5 files
- **UI text**: "Max 4MB par image - Maximum 5 images - Total max ~4.5MB"

### Debugging Techniques That Worked

#### 1. Console Logging for File Processing
```javascript
console.log('📎 Creating attachment:', {
  originalFilename: file.originalFilename,
  cleanFilename: cleanFilename,
  mimetype: file.mimetype,
  size: fileBuffer.length
});
```

#### 2. Step-by-Step File Validation
```javascript
console.log('📄 File selected:', file.name, file.size);
console.log('✅ File compressed and added. Original:', file.size, 'Compressed:', compressedFile.size);
```

#### 3. Email Service Debugging
- Check Resend API key validity
- Verify email addresses are verified
- Monitor server logs for attachment processing

### Performance Optimizations Implemented

#### 1. Image Compression Before Upload
- Reduces file sizes by 60-80%
- Prevents 413 errors
- Faster upload times
- Better user experience

#### 2. Client-Side File Validation
- Immediate feedback on file size
- Prevents unnecessary server requests
- Better error messages

#### 3. Proper Error Handling & Message Display

**Problem**: Error messages were showing in console but displaying generic message on webpage.

**Solution - Display Specific Error Messages**:
```javascript
} catch (error) {
  console.error('Form submission error:', error);
  
  // Get error message and sanitize for HTML
  const errorMsg = error && error.message ? 
    error.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 
    'Veuillez réessayer ou nous contacter directement';
  
  if (errorMessage) {
    errorMessage.style.display = 'block';
    errorMessage.innerHTML = `
      <div style="...">
        <h3>Une erreur est survenue</h3>
        <p>${errorMsg}</p>
      </div>
    `;
  }
}
```

**Key Points**:
- Always handle 413 errors before attempting to parse JSON
- Extract error.message from caught errors
- Sanitize error messages for HTML display
- Show specific error messages instead of generic ones
- Handle both network errors and server errors gracefully

### Common Pitfalls to Avoid

#### 1. Don't Convert FormData to JSON
```javascript
// ❌ WRONG - Loses file data
const data = {};
formData.forEach((value, key) => {
  data[key] = value; // File objects become empty {}
});
fetch('/api/submit', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data) // Files are lost!
});

// ✅ CORRECT - Send FormData directly
fetch('/api/submit', {
  body: formData // Preserves file data
});
```

#### 2. Always Clean Up Temporary Files
```javascript
// Clean up after email sending
if (uploadedFiles && uploadedFiles.length > 0) {
  for (const file of uploadedFiles) {
    if (file && file.filepath) {
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
}
```

#### 3. Handle Both Single and Multiple Files
```javascript
// Ensure uploadedFiles is always an array
let uploadedFiles = files['Contact-12-Image[]'] || files['Contact-12-Image'] || [];
if (!Array.isArray(uploadedFiles)) {
  uploadedFiles = [uploadedFiles];
}
uploadedFiles = uploadedFiles.filter(file => file && file.filepath);
```

### Testing Checklist

#### Before Going Live:
- [ ] Test with various file sizes (small, medium, large)
- [ ] Test with different file types (JPG, PNG, GIF)
- [ ] Test with special characters in filenames
- [ ] Test error scenarios (file too large, network issues)
- [ ] Verify email attachments display correctly
- [ ] Test form message display logic
- [ ] Verify temporary file cleanup
- [ ] Test on different browsers and devices

#### Email Testing:
- [ ] Check attachment filenames are readable
- [ ] Verify images display in email client
- [ ] Test with multiple attachments
- [ ] Check email formatting and layout
- [ ] Verify reply-to functionality

### Production Deployment Notes

#### Environment Variables Required:
```bash
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@domain.com
```

#### Vercel Configuration:
- No special configuration needed for file uploads
- `/tmp` directory is available for temporary files
- **~4.5MB total payload limit** (Vercel's hard limit for request body)
- Recommended: **4MB per file**, max **5 files** (to account for multipart overhead)
- Note: Total request size includes multipart encoding overhead (~10-15% additional)

#### Monitoring:
- Set up error logging for file processing
- Monitor email delivery rates
- Track form submission success rates
- Monitor server response times

### Future Improvements

#### Potential Enhancements:
1. **Image Preview**: Show thumbnails before upload
2. **Drag & Drop**: Allow dragging files onto upload area
3. **Progress Bars**: Show upload progress
4. **Image Editing**: Basic crop/resize functionality
5. **Cloud Storage**: Store images temporarily in cloud storage
6. **Email Templates**: Rich HTML email templates
7. **File Type Validation**: More robust file type checking
8. **Virus Scanning**: Scan uploaded files for malware

#### Scalability Considerations:
- Consider using cloud storage for large files
- Implement rate limiting for form submissions
- Add CAPTCHA for spam protection
- Consider using a CDN for image delivery
- Implement proper logging and monitoring

### Key Success Metrics

#### What Worked Well:
- ✅ Image compression reduced file sizes significantly
- ✅ Proper filename handling improved email experience
- ✅ Client-side validation prevented server errors
- ✅ Clear error messages improved user experience
- ✅ Form message logic provided clear feedback

#### Areas for Improvement:
- 🔄 Could add image preview functionality
- 🔄 Could implement drag-and-drop interface
- 🔄 Could add progress indicators
- 🔄 Could improve error message styling

This real-world implementation provides a solid foundation for future image upload integrations and highlights the importance of proper file handling, user feedback, and error management.