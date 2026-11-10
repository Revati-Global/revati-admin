# Revati Global - Admin Dashboard (`revati-admin`)

Executive administration portal for Revati Global built with Vite, React 18, Tailwind CSS, and Lucide Icons.

## Features
- Complete content management for products, categories, blogs, services, industries, banners, and static pages.
- Lead management for customer inquiries and newsletter subscribers.
- Secure JWT-based authentication with session auto-expiry.
- In-browser document and media viewer with proxy support.
- Fully aligned with Revati Global Brand Identity System.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Configuration
Copy `.env.example` to `.env` and fill in the required variables:
```bash
cp .env.example .env
```

#### Required Environment Variables (Names Only)
- `VITE_API_URL` - Base URL of the Revati Backend API
- `VITE_API_KEY` - API key for backend communications
- `VITE_SITE_URL` - Live public website URL for preview links

### Running the Application
```bash
# Start development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```
