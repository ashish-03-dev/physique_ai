const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations
const Image = require('../models/Image');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Temporary storage (we'll move manually after saving DB entry)
const tempStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, '../uploads/tmp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG/PNG allowed'), false);
};

const upload = multer({ storage: tempStorage, fileFilter });

router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(400).json({ error: 'User not identified' });
    const imageDocs = [];

    for (const file of req.files) {
      const imageId = uuidv4(); // Unique ID for the image
      const imageDir = path.join(__dirname, `../uploads/${userId}/${imageId}`);
      await fs.mkdir(imageDir, { recursive: true }); // Async mkdir

      const finalFilePath = path.join(imageDir, 'original.jpg');
      await fs.rename(file.path, finalFilePath); // Async rename

      const newImage = new Image({
        userId,
        imageId,
        originalFilename: file.originalname,
        storedFilename: 'original.jpg',
        filePath: `/uploads/${userId}/${imageId}/original.jpg`,
        meshGenerated: false,
        meshPath: null,
        analysis: null
      });

      await newImage.save();
      imageDocs.push(newImage);
    }

    return res.status(200).json({
      message: 'Files uploaded and saved in DB',
      files: imageDocs
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get all images for the user
router.get('/my-images', async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(400).json({ error: 'User not identified' });

    const images = await Image.find({ userId }).sort({ uploadDate: -1 });
    return res.status(200).json({ images });
  } catch (err) {
    console.error('Fetch images error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User not identified' });
    }

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    // Find the image in the database
    const image = await Image.findOne({ imageId, userId });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Define paths for image and generated files
    const imageDir = path.join(__dirname, '../uploads', userId, imageId);
    const generatedDir = path.join(__dirname, '../generated', userId, imageId);

    // Delete files from filesystem
    try {
      await fs.rm(imageDir, { recursive: true, force: true });
      await fs.rm(generatedDir, { recursive: true, force: true });
    } catch (err) {
      console.error('File deletion error:', err.message);
      return res.status(500).json({ error: 'Failed to delete files', details: err.message });
    }

    // Delete image document from database
    await Image.deleteOne({ imageId, userId });

    return res.status(200).json({
      message: 'Image and associated data deleted successfully'
    });
  } catch (err) {
    console.error('Delete error:', err.message);
    return res.status(500).json({ error: 'Server error during deletion', details: err.message });
  }
});

module.exports = router;