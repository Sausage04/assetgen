import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();

// Middleware to allow CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// Root route for checking if the server is live
app.get('/', (req, res) => {
  res.send('🎨 AssetGen API is alive and running!');
});

// 🎨 Image generation route
app.post('/generate', async (req, res) => {
  const { prompt, type } = req.body; // Expect prompt and type (3d or 2d)

  if (!prompt || !type) {
    return res.status(400).json({ error: 'Prompt and type are required' });
  }

  console.log(`Received prompt: ${prompt}, type: ${type}`);

  try {
    // Send request to OpenAI's image generation API
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt,
        n: 1,
        size: '512x512',  // Adjust this size as needed
        response_format: 'url',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Return the URL of the generated image
    res.json({ url: response.data.data[0].url });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Listen on dynamic port provided by Render, default to 8080 locally
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
