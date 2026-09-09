import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Ingest & ETL Pipeline',
  description: 'Sistema de Importação e Sincronização com Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}