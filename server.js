import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Add root endpoint
app.get('/', (req, res) => {
  res.send('🎨 AssetGen API is alive and running!');
});

// 🎨 Image generation route
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt,
        n: 1,
        size: '512x512',
        response_format: 'url',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json({ url: response.data.data[0].url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.listen(8080, () => console.log('Server running on port 8080'));
