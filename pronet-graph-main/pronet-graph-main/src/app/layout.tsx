import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProNet — Red Profesional',
  description: 'Red profesional basada en grafos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
