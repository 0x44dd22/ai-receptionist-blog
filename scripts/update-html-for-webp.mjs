#!/usr/bin/env node

/**
 * Update HTML files to use WebP images with fallbacks
 * 
 * This script:
 * 1. Finds all HTML files with PNG/JPG image references
 * 2. Replaces <img> tags with <picture> tags
 * 3. Adds WebP source with PNG/JPG fallback
 * 4. Maintains all existing attributes (class, alt, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Convert <img> tag to <picture> tag with WebP and fallback
 */
function convertImgToPicture(imgTag) {
  // Extract attributes
  const srcMatch = imgTag.match(/src="([^"]+)"/);
  const altMatch = imgTag.match(/alt="([^"]*)"/);
  const classMatch = imgTag.match(/class="([^"]*)"/);
  const loadingMatch = imgTag.match(/loading="([^"]*)"/);
  
  if (!srcMatch) return imgTag;
  
  const originalSrc = srcMatch[1];
  
  // Only process PNG/JPG images
  if (!/\.(png|jpg|jpeg)$/i.test(originalSrc)) {
    return imgTag;
  }
  
  // Generate WebP path
  const webpSrc = originalSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  // Build attributes
  const alt = altMatch ? altMatch[1] : '';
  const classAttr = classMatch ? ` class="${classMatch[1]}"` : '';
  const loadingAttr = loadingMatch ? ` loading="${loadingMatch[1]}"` : ' loading="lazy"';
  
  // Create picture tag
  return `<picture>
                <source srcset="${webpSrc}" type="image/webp">
                <img${classAttr} src="${originalSrc}" alt="${alt}"${loadingAttr}>
            </picture>`;
}

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Find all img tags
  const imgRegex = /<img[^>]+>/g;
  const matches = content.match(imgRegex);
  
  if (!matches) {
    return 0;
  }
  
  let replacements = 0;
  for (const imgTag of matches) {
    // Only process if it's a PNG/JPG image
    if (/\.(png|jpg|jpeg)"/i.test(imgTag)) {
      const pictureTag = convertImgToPicture(imgTag);
      if (pictureTag !== imgTag) {
        content = content.replace(imgTag, pictureTag);
        replacements++;
      }
    }
  }
  
  if (replacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return replacements;
}

/**
 * Find all HTML files
 */
function findHtmlFiles(dir) {
  const htmlFiles = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.')) {
      htmlFiles.push(...findHtmlFiles(fullPath));
    } else if (item.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}=================================`);
  console.log('Update HTML to Use WebP Images');
  console.log(`=================================${colors.reset}\n`);
  
  const htmlFiles = findHtmlFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  let totalReplacements = 0;
  for (const filePath of htmlFiles) {
    const replacements = processHtmlFile(filePath);
    if (replacements > 0) {
      console.log(`${colors.green}✓${colors.reset} ${path.relative(rootDir, filePath)}: ${replacements} images updated`);
      totalReplacements += replacements;
    }
  }
  
  console.log(`\n${colors.green}=================================`);
  console.log(`Total: ${totalReplacements} images converted to <picture> tags`);
  console.log(`=================================${colors.reset}\n`);
}

main();
