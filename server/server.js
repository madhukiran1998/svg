const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ImageTracer = require('imagetracerjs');
const sharp = require('sharp');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;

  try {
    // Read the image with Sharp
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Get raw pixel data
    const { data } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Trace the image
    const svgString = ImageTracer.imagedataToSVG(
      { width, height, data },
      { colorsampling: 2, numberofcolors: 16 }
    );

    // Modify SVG to include width and height
    const modifiedSvg = svgString.replace('<svg', `<svg width="${width}" height="${height}"`);

    // Send SVG to client
    res.json({ svg: modifiedSvg, width, height });

    // Clean up temporary files
    fs.unlinkSync(inputPath);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));