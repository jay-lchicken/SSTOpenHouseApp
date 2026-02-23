import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Open House 2026',
  description: 'SST Open House App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

