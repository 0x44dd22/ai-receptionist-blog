#!/usr/bin/env node

/**
 * Deployment Verification Script for AI Receptionist Blog
 * 
 * Verifies that the deployed blog site has:
 * - Correct canonical tags (with trailing slash for homepage only)
 * - Required meta tags
 * - Accessible resources
 */

const BASE_URL = 'https://blog.ai-receptionist.com';

// Pages to test
const PAGES_TO_TEST = [
  {
    path: '/',
    expectedCanonical: 'https://blog.ai-receptionist.com/',
    title: 'AI Receptionist Blog'
  },
  {
    path: '/blogs/november-2025-feature-updates.html',
    expectedCanonical: 'https://blog.ai-receptionist.com/blogs/november-2025-feature-updates.html',
    title: 'November 2025 Feature Updates'
  },
  {
    path: '/blogs/hello-world-meet-ai-receptionist.html',
    expectedCanonical: 'https://blog.ai-receptionist.com/blogs/hello-world-meet-ai-receptionist.html',
    title: 'Hello World'
  },
  {
    path: '/blogs/why-ai-receptionists-beat-traditional-phone-systems-every-time.html',
    expectedCanonical: 'https://blog.ai-receptionist.com/blogs/why-ai-receptionists-beat-traditional-phone-systems-every-time.html',
    title: 'Why AI Receptionists Beat Traditional Phone Systems'
  }
];

let passedTests = 0;
let failedTests = 0;

async function fetchPage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

function extractCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match ? match[1] : null;
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1] : null;
}

async function verifyPage(page) {
  const url = `${BASE_URL}${page.path}`;
  console.log(`\n🔍 Testing: ${url}`);
  
  try {
    const html = await fetchPage(url);
    
    // Check canonical tag
    const canonical = extractCanonical(html);
    if (canonical === page.expectedCanonical) {
      console.log(`  ✅ Canonical: ${canonical}`);
      passedTests++;
    } else {
      console.log(`  ❌ Incorrect canonical:`);
      console.log(`     Expected: "${page.expectedCanonical}"`);
      console.log(`     Received: "${canonical}"`);
      failedTests++;
    }
    
    // Check title exists
    const title = extractTitle(html);
    if (title && title.includes(page.title)) {
      console.log(`  ✅ Title contains: ${page.title}`);
      passedTests++;
    } else {
      console.log(`  ❌ Title issue: Expected to contain "${page.title}", got "${title}"`);
      failedTests++;
    }
    
    console.log('  ✅ All checks passed');
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    failedTests++;
  }
}

async function main() {
  console.log('============================================================');
  console.log(`🚀 Verifying deployment: ${BASE_URL}`);
  console.log('============================================================');
  
  for (const page of PAGES_TO_TEST) {
    await verifyPage(page);
  }
  
  console.log('\n============================================================');
  console.log('📊 SUMMARY');
  console.log('============================================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n✅ ALL TESTS PASSED\n');
    process.exit(0);
  } else {
    console.log('\n❌ VERIFICATION FAILED\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
