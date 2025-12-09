import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Servir les fichiers statiques (index.html, etc.)
app.use(express.static(path.join(process.cwd())));

const FILE_PATH = path.join(process.cwd(), 'pixels.json');

function readPixels() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(FILE_PATH, 'utf8');
  return JSON.parse(data);
}

function writePixels(pixels) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(pixels, null, 2));
}

// GET tous les pixels
app.get('/api/pixels', (req, res) => {
  const pixels = readPixels();
  res.json(pixels);
});

// POST un pixel
app.post('/api/pixels', (req, res) => {
  const { x, y, color } = req.body;
  if (
    typeof x === 'number' && x >= 0 && x < 1000 &&
    typeof y === 'number' && y >= 0 && y < 1000 &&
    typeof color === 'string'
  ) {
    let pixels = readPixels();
    const index = pixels.findIndex(p => p.x === x && p.y === y);
    if(index !== -1) pixels[index].color = color;
    else pixels.push({x, y, color});
    writePixels(pixels);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/api/download', (req, res) => {
  res.download(FILE_PATH, 'pixels.json');
});
