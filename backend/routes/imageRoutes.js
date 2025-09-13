const express = require('express');
const Image = require('../models/Image');

const router = express.Router();

// Express backend
router.get('/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const image = await Image.findOne({ imageId });
  if (!image) return res.status(404).json({ error: 'Not found' });
  res.json({ image });
});

router.put('/:imageId/analysis', async (req, res) => {
  const { imageId } = req.params;
  const analysis = req.body;

  try {
    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      { analysis },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json({
      message: 'Analysis updated successfully',
      image: updatedImage
    });
  } catch (error) {
    console.error('Error updating analysis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
