import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to generate a response using Gemini
async function generateResponse(geminiApiKey, emailContent) {
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const response = await model.generateContent(emailContent);
    const result = await response.response;
    const text = await result.text(); // Fix for extracting text properly

    console.log('Generated response:', text);
    return text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate email response');
  }
}

// Function to send an email using nodemailer
async function sendEmail(to, subject, text, emailUser, emailPass) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    secure: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });

  let mailOptions = {
    from: emailUser,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate the error for better error handling
  }
}

// Main function to handle the process
export default async function handleEmail(
  geminiApiKey,
  emailUser,
  emailPass,
  emailContent,
  recipient
) {
  try {
    console.log('Handling email:', emailContent);

    const response = await generateResponse(geminiApiKey, emailContent);
    await sendEmail(
      recipient,
      'Response from MediFlow',
      response,
      emailUser,
      emailPass
    );
  } catch (error) {
    console.error('Error handling email:', error);
  }
}
