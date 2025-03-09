import express from 'express';
import dotenv from 'dotenv';
import handleEmail from './handleEmail.js';
import cors from 'cors';
dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediFlow Mail Service is running',
    endpoints: ['/send-email']
  });
});

app.post('/send-email', async (req, res) => {
  const { prompt, recipient } = req.body;
  console.log('recipient:', recipient);
  if (!prompt || !recipient) {
    return res
      .status(400)
      .json({ error: 'Email content and recipient are required' });
  }

  try {
    await handleEmail(
      process.env.GEMINI_API_KEY,
      process.env.SENDER_EMAIL,
      process.env.SENDER_EMAIL_PASSWORD,
      prompt,
      recipient
    );
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
