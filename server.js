//server.js
const express = require("express");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const Stripe = require('stripe');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

// ========== GOOGLE PHOTOS PICKER API ENDPOINTS ==========

// Create a new Photos Picker session
app.post('/api/photos/create-session', async (req, res) => {
  try {
    const { accessToken } = req.body;
    console.log('📸 Creating Photos Picker session...');
    
    const response = await axios.post(
      'https://photospicker.googleapis.com/v1/sessions',
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Session created:', response.data.id);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error creating session:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Poll a Photos Picker session to check if user selected photos
app.get('/api/photos/session/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing access token' });
    }

    console.log(`📊 Polling Photos session: ${sessionId}`);
    
    const response = await axios.get(
      `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`📋 Session status:`, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error polling Photos session:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Fetch media items from a Photos Picker session using Library API
app.get('/api/photos/session/:sessionId/mediaItems', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing access token' });
    }

    console.log(`📥 Fetching media items for session: ${sessionId}`);

    // Step 1: Verify the session has media items
    const sessionResponse = await axios.get(
      `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`📋 Session verification:`, sessionResponse.data);

    if (!sessionResponse.data.mediaItemsSet) {
      return res.status(400).json({ error: 'No media items selected yet' });
    }

    // Step 2: Try multiple approaches to get selected photos
    let mediaItems = [];
    
    // Approach 1: Try to get from shared albums (most likely source)
    try {
      console.log(`📸 Attempting to fetch from shared albums...`);
      const albumsResponse = await axios.get(
        'https://photoslibrary.googleapis.com/v1/sharedAlbums',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (albumsResponse.data.sharedAlbums && albumsResponse.data.sharedAlbums.length > 0) {
        // Get photos from the first shared album
        const firstAlbum = albumsResponse.data.sharedAlbums[0];
        console.log(`📚 Fetching from album: ${firstAlbum.title}`);
        
        const albumPhotosResponse = await axios.post(
          'https://photoslibrary.googleapis.com/v1/mediaItems:search',
          {
            albumId: firstAlbum.id,
            pageSize: 100,
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        mediaItems = albumPhotosResponse.data.mediaItems || [];
        console.log(`✅ Found ${mediaItems.length} photos in shared album`);
      }
    } catch (albumError) {
      console.log(`⚠️ Shared albums approach failed, trying recent photos...`);
    }
    
    // Approach 2: If no shared albums, get recent photos
    if (mediaItems.length === 0) {
      console.log(`📸 Fetching recent photos from Photos Library API...`);
      
      const libraryResponse = await axios.post(
        'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        {
          pageSize: 100,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      mediaItems = libraryResponse.data.mediaItems || [];
      console.log(`✅ Fetched ${mediaItems.length} recent photos from Library API`);
    }
    
    // Format response to match expected structure
    res.json({
      mediaItems: mediaItems.map(item => ({
        mediaFile: {
          baseUrl: item.baseUrl,
          mimeType: item.mimeType,
          filename: item.filename,
          mediaFileMetadata: item.mediaMetadata,
        },
        baseUrl: item.baseUrl, // Also include at top level for compatibility
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching media items:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data,
    });
  }
});

// ========== STATIC FILES & ROUTES ==========

app.use(express.static(path.join(__dirname, 'build')));

// Stripe route
app.get('/stripe/payment-intent', async (req, res) => {
  console.log('in stripe intent');
  const stripe = Stripe(
    process.env.NODE_ENV === 'production' && req.type !== 'test'
      ? process.env.REACT_APP_STRIPE_PUBLIC_KEY_LIVE
      : process.env.REACT_APP_STRIPE_PUBLIC_KEY
  );
  const intent = stripe.paymentIntents.create({
    amount: req.amount,
    currency: 'usd',
  });
  res.json({ client_secret: intent.client_secret });
});

// CATCH-ALL MUST BE LAST!
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ========== SSL SETUP ==========

var key_url = '/etc/letsencrypt/live/bizbuz.design/privkey.pem';
var cert_url = '/etc/letsencrypt/live/bizbuz.design/fullchain.pem';

var options = {};

const isProd = process.env.SUDO_USER != undefined;

if (isProd) {
  options['key'] = fs.readFileSync(key_url);
  options['cert'] = fs.readFileSync(cert_url);
  http.createServer((req, res) => {
    res.writeHead(301, { Location: 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
  https.createServer(options, app).listen(443);
  console.log('🚀 Server running on HTTPS (port 443)');
} else {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}