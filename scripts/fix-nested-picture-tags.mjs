#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=================================');
console.log('Fix Nested Picture Tags');
console.log('=================================');

const blogsDir = path.join(__dirname, '..', 'blogs');
const rootDir = path.join(__dirname, '..');
const blogFiles = fs.readdirSync(blogsDir).filter(file => file.endsWith('.html')).map(file => path.join(blogsDir, file));
const rootFiles = ['index.html'].map(file => path.join(rootDir, file));
const htmlFiles = [...blogFiles, ...rootFiles];

console.log(`Found ${htmlFiles.length} HTML files\n`);

let totalFixed = 0;

htmlFiles.forEach(filePath => {
    const file = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Count occurrences before fixing
    const beforeCount = (content.match(/<picture>\s*<source[^>]*>\s*<picture>/g) || []).length;
    
    if (beforeCount > 0) {
        // Fix the nested picture tags pattern:
        // <picture>
        //   <source srcset="..." type="image/webp">
        //   <picture>
        //   <source srcset="..." type="image/webp">
        //   <img ... />
        // </picture>
        // </picture>
        
        // Remove the duplicate inner picture tag and source
        content = content.replace(
            /<picture>\s*<source\s+srcset="([^"]+)"\s+type="image\/webp">\s*<picture>\s*<source\s+srcset="\1"\s+type="image\/webp">\s*(<img[^>]*>)/g,
            '<picture>\n                <source srcset="$1" type="image/webp">\n                $2'
        );
        
        // Remove duplicate closing picture tags
        content = content.replace(
            /(\s*<\/picture>)\s*<\/picture>/g,
            '$1'
        );
        
        // Count after fixing
        const afterCount = (content.match(/<picture>\s*<source[^>]*>\s*<picture>/g) || []).length;
        const fixed = beforeCount - afterCount;
        
        if (fixed > 0) {
            fs.writeFileSync(filePath, content);
            console.log(`✓ ${file}: ${fixed} nested picture tags fixed`);
            totalFixed += fixed;
        }
    }
});

console.log('\n=================================');
console.log(`Total nested picture tags fixed: ${totalFixed}`);
console.log('=================================');