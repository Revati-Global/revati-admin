# Revati Global - Admin Portal (`revati-admin`)

Modern, high-performance administrative single-page application for Revati Global, built with React 18, Vite, and Tailwind CSS.

## Key Features
- **Client-Side WebP Compression:** Images are compressed and resized in the browser using HTML5 Canvas according to strict preset budgets before upload.
- **Direct Supabase Uploads:** Media uploads directly to Supabase Storage signed URLs without routing bytes through the backend serverless function.
- **Role-Based Navigation:** Dynamic sidebar adapting to user role (`super admin`, `admin`, `editor`, `sales`).
- **Storage Consumption Bar:** Real-time visual monitoring of the 1 GB Supabase storage quota with amber threshold at 70%.
- **Module Suite:**
  - Customer Enquiries (status pipeline, notification badges, CSV lead export).
  - Heating & HVAC Products (specifications table, capacity, power, PDF datasheets).
  - Engineering Solutions, Applications & Reference Projects.
  - Brochures & Technical Downloads.
  - Users & Role Authorization (Super Admin only).
  - Company & Brand Identity Settings.
  - Storage Maintenance & Orphan Scanner.

## Getting Started
```bash
npm install
npm run dev
npm run build
```
