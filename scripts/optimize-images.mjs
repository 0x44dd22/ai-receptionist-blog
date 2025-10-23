#!/usr/bin/env node

/**
 * Image Optimization Script for AI Receptionist Blog
 * 
 * This script:
 * 1. Finds all PNG/JPG images in the static directory
 * 2. Converts them to WebP format with optimal compression
 * 3. Resizes images that are too large (max 1200px width)
 * 4. Keeps originals as backup with .original extension
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const MAX_WIDTH = 1200; // Max width for blog images
const WEBP_QUALITY = 85; // WebP quality (0-100)
const STATIC_DIR = path.join(rootDir, 'static');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Find all image files recursively
 */
function findImages(dir) {
  const images = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      images.push(...findImages(fullPath));
    } else if (/\.(png|jpg|jpeg)$/i.test(item.name) && !item.name.includes('.original.')) {
      images.push(fullPath);
    }
  }

  return images;
}

/**
 * Get human-readable file size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  const ext = path.extname(imagePath);
  const basename = path.basename(imagePath, ext);
  const dirname = path.dirname(imagePath);
  const webpPath = path.join(dirname, `${basename}.webp`);
  const originalPath = `${imagePath}.original${ext}`;

  try {
    // Get original file info
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;

    console.log(`\n${colors.cyan}Processing:${colors.reset} ${path.relative(rootDir, imagePath)}`);
    console.log(`  Original: ${width}x${height}, ${formatBytes(originalSize)}`);

    // Create sharp instance
    let sharpInstance = sharp(imagePath);

    // Resize if needed
    if (width > MAX_WIDTH) {
      const newHeight = Math.round((height * MAX_WIDTH) / width);
      sharpInstance = sharpInstance.resize(MAX_WIDTH, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      console.log(`  ${colors.yellow}Resizing to:${colors.reset} ${MAX_WIDTH}x${newHeight}`);
    }

    // Convert to WebP
    await sharpInstance
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

    console.log(`  ${colors.green}Created WebP:${colors.reset} ${formatBytes(webpSize)} (${savings}% smaller)`);
    console.log(`  ${colors.blue}Output:${colors.reset} ${path.relative(rootDir, webpPath)}`);

    // Backup original if not already backed up
    if (!fs.existsSync(originalPath)) {
      fs.copyFileSync(imagePath, originalPath);
      console.log(`  ${colors.yellow}Backed up original${colors.reset}`);
    }

    return {
      original: imagePath,
      webp: webpPath,
      originalSize,
      webpSize,
      savings: originalSize - webpSize,
    };
  } catch (error) {
    console.error(`  ${colors.reset}\x1b[31mError:${colors.reset} ${error.message}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}=================================`);
  console.log('AI Receptionist Blog - Image Optimizer');
  console.log(`=================================${colors.reset}\n`);

  console.log(`Scanning for images in: ${STATIC_DIR}\n`);

  const images = findImages(STATIC_DIR);
  
  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${images.length} images to optimize`);

  const results = [];
  for (const imagePath of images) {
    const result = await optimizeImage(imagePath);
    if (result) {
      results.push(result);
    }
  }

  // Print summary
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalWebp = results.reduce((sum, r) => sum + r.webpSize, 0);
  const totalSavings = totalOriginal - totalWebp;
  const percentSavings = ((totalSavings / totalOriginal) * 100).toFixed(1);

  console.log(`\n${colors.green}=================================`);
  console.log('SUMMARY');
  console.log(`=================================${colors.reset}`);
  console.log(`Images optimized: ${results.length}`);
  console.log(`Original size:    ${formatBytes(totalOriginal)}`);
  console.log(`WebP size:        ${formatBytes(totalWebp)}`);
  console.log(`Total savings:    ${formatBytes(totalSavings)} (${percentSavings}%)`);
  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log(`1. Update HTML files to use .webp images`);
  console.log(`2. Add <picture> tags with fallbacks for older browsers`);
  console.log(`3. Test the blog locally before deploying\n`);
}

main().catch(console.error);
