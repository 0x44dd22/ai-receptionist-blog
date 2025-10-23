#!/usr/bin/env node

/**
 * Check Image Sizes Script
 * 
 * Scans all images and reports their sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const STATIC_DIR = path.join(rootDir, 'static');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function findImages(dir) {
  const images = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      images.push(...findImages(fullPath));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(item.name) && !item.name.includes('.original.')) {
      const stats = fs.statSync(fullPath);
      images.push({
        path: fullPath,
        size: stats.size,
        name: path.relative(rootDir, fullPath),
      });
    }
  }

  return images;
}

const images = findImages(STATIC_DIR);
images.sort((a, b) => b.size - a.size);

console.log('Image Sizes Report\n');
console.log('Size\t\tFile');
console.log('====\t\t====');

let total = 0;
for (const img of images) {
  console.log(`${formatBytes(img.size).padEnd(10)}\t${img.name}`);
  total += img.size;
}

console.log('\n============================');
console.log(`Total: ${formatBytes(total)}`);
console.log(`Count: ${images.length} images`);
