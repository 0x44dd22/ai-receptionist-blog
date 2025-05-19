# AI Receptionist Blog

Static blog website for [AI Receptionist](https://ai-receptionist.com/), deployed at [blog.ai-receptionist.com](https://blog.ai-receptionist.com/).

## Overview

A minimalist, responsive blog website built with pure HTML and CSS, featuring:
- SEO-optimized blog posts
- Responsive design that works on all devices
- Fast loading with no JavaScript dependencies

## Structure

```
/
├── index.html                 # Blog homepage with post listings
├── blogs/                     # Directory for blog posts
│   └── hello-world-meet-ai-receptionist.html
├── 404.html                  # Error page
├── styles.css                # Global styles
├── robots.txt               # SEO configuration
└── static/                  # Static assets
    ├── blog1/              # Images for first blog post
    └── undraw_page-not-found_6wni.svg
```

## Development

The website is built using:
- HTML5 with semantic markup for SEO
- CSS3 with modern features:
  - CSS Variables for theming
  - CSS Grid and Flexbox for layouts
  - Media queries for responsive design
- No JavaScript dependencies

## Local Development

To run the site locally, simply open any HTML file in a web browser:

```bash
open index.html
```

Or use Python's built-in HTTP server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Deployment

The site is deployed on GitHub Pages with a custom domain (blog.ai-receptionist.com). To deploy:

1. Push changes to the main branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. The site will be available at blog.ai-receptionist.com

The site is deployed on GitHub Pages with a custom domain (0x4d2.com). See `github-setup.sh` for deployment instructions.

## License

All rights reserved © 2025 0x4d2
