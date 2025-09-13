const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const Image = require('../models/Image'); // Ensure this path is valid

router.post('/', async (req, res) => {
  const { imageId } = req.body;
  console.log(imageId);
  if (!imageId) {
    return res.status(400).json({ error: 'imageId is required' });
  }

  try {
    const image = await Image.findOne({ imageId });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imgFolder = path.join(__dirname, '..', 'uploads', image.userId, image.imageId);
    const outFolder = path.resolve(__dirname, '../generated', image.userId, image.imageId); 

    fs.mkdirSync(outFolder, { recursive: true });

    console.log('📤 Triggering FastAPI:', {
      img_folder: imgFolder,
      out_folder: outFolder
    });

    const response = await axios.post('http://localhost:8000/generate', {
      img_folder: imgFolder,
      out_folder: outFolder
    });

    const files = fs.readdirSync(outFolder);
    const objFile = files.find(f => f.endsWith('.obj'));

    if (!objFile) {
      throw new Error('Mesh .obj file not found in output directory');
    }

    const meshPath = `/generated/${image.userId}/${image.imageId}/${objFile}`;

    image.meshGenerated = true;
    image.meshPath = meshPath;
    image.generatedAt = new Date();

    await image.save();

    return res.status(200).json({
      message: response.data.message,
      logs: response.data.output || 'Generation complete',
      meshPath: meshPath
    });

  } catch (error) {
    console.error('⚠️ Error during generation:', error?.response?.data || error.message);
    return res.status(500).json({
      error: 'Mesh generation failed',
      detail: error?.response?.data?.detail || error.message,
    });
  }
});

module.exports = router;
