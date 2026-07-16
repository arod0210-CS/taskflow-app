import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "icons");
const PURPLE = [99, 102, 241];
const WHITE = [255, 255, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function encodePng(width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.from([0]), pixels.subarray(y * width * 4, (y + 1) * width * 4));
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND")
  ]);
}

function segmentDistance(x, y, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const amount = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared));
  return Math.hypot(x - (start.x + amount * dx), y - (start.y + amount * dy));
}

function blendPixel(pixels, index, color, alpha) {
  const sourceAlpha = Math.max(0, Math.min(1, alpha));
  const destinationAlpha = pixels[index + 3] / 255;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha === 0) return;
  for (let channel = 0; channel < 3; channel += 1) {
    pixels[index + channel] = Math.round(
      (color[channel] * sourceAlpha + pixels[index + channel] * destinationAlpha * (1 - sourceAlpha)) / outputAlpha
    );
  }
  pixels[index + 3] = Math.round(outputAlpha * 255);
}

function renderIcon(size, { maskable = false, apple = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.46875;
  const antialias = Math.max(1, size / 512);
  const backgroundIsSolid = maskable || apple;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      if (backgroundIsSolid) {
        blendPixel(pixels, index, PURPLE, 1);
      } else {
        const distance = Math.hypot(x + 0.5 - center, y + 0.5 - center);
        blendPixel(pixels, index, PURPLE, Math.max(0, Math.min(1, radius + antialias - distance)));
      }
    }
  }

  const points = maskable || apple
    ? [{ x: 0.31, y: 0.52 }, { x: 0.44, y: 0.64 }, { x: 0.69, y: 0.38 }]
    : [{ x: 0.25, y: 0.53 }, { x: 0.41, y: 0.69 }, { x: 0.75, y: 0.34 }];
  const scaled = points.map((point) => ({ x: point.x * size, y: point.y * size }));
  const halfWidth = size * (maskable || apple ? 0.042 : 0.047);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.min(
        segmentDistance(x + 0.5, y + 0.5, scaled[0], scaled[1]),
        segmentDistance(x + 0.5, y + 0.5, scaled[1], scaled[2])
      );
      const coverage = Math.max(0, Math.min(1, halfWidth + antialias - distance));
      if (coverage > 0) blendPixel(pixels, (y * size + x) * 4, WHITE, coverage);
    }
  }

  return encodePng(size, size, pixels);
}

const icons = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["icon-maskable-192.png", 192, { maskable: true }],
  ["icon-maskable-512.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180, { apple: true }]
];

fs.mkdirSync(outputDirectory, { recursive: true });
icons.forEach(([filename, size, options]) => {
  fs.writeFileSync(path.join(outputDirectory, filename), renderIcon(size, options));
  console.log(`generated ${filename} (${size}x${size})`);
});
