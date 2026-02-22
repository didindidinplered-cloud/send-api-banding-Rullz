import nodemailer from 'nodemailer';

// Ganti dengan API Key yang kamu inginkan (bisa random string)
const VALID_API_KEYS = ['Fucking12']; // Bisa lebih dari satu

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  // Check API Key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid API Key' 
    });
  }

  try {
    const { 
      to, 
      subject, 
      text, 
      html,
      sender_user,  // Email pengirim
      sender_pass   // Password email pengirim
    } = req.body;

    // Validasi input
    if (!to || !subject || (!text && !html) || !sender_user || !sender_pass) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Buat transporter dengan akun pengirim dinamis
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Atau gunakan SMTP server lain
      auth: {
        user: sender_user,
        pass: sender_pass
      }
    });

    // Kirim email
    const mailOptions = {
      from: sender_user,
      to: Array.isArray(to) ? to.join(',') : to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      response: info.response
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}