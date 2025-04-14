import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware to allow CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// Serve the generated image files from /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('🎨 AssetGen API is alive and running!');
});

// 🎨 Image generation route
app.post('/generate', async (req, res) => {
  const { prompt, type } = req.body;

  console.log('Received POST request to /generate');
  console.log(`Request Body: prompt=${prompt}, type=${type}`);

  if (!prompt || !type) {
    console.log('Error: Prompt or type missing');
    return res.status(400).json({ error: 'Prompt and type are required' });
  }

  try {
    console.log('Sending request to OpenAI API...');
    
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

    const imageUrl = response.data.data[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Save the image to /public/generated folder
    const filename = `asset_${Date.now()}.png`;
    const filepath = path.join(__dirname, 'public', 'generated');

    // Ensure directory exists
    fs.mkdirSync(filepath, { recursive: true });

    const fullPath = path.join(filepath, filename);
    fs.writeFileSync(fullPath, imageResponse.data);

    console.log(`Image saved to ${fullPath}`);

    // Return both preview URL and download link
    const publicUrl = `/public/generated/${filename}`;
    const fullDownloadLink = `${req.protocol}://${req.get('host')}${publicUrl}`;

    res.json({
      preview: fullDownloadLink,
      download: fullDownloadLink
    });
  } catch (err) {
    console.error('Error generating image:', err);
    console.error('Error details:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
