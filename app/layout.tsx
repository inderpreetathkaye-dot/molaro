import './globals.css';

export const metadata = {
  title: 'Aura Events',
  description: 'Your description here',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}