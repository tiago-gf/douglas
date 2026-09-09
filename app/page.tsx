'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ETL Data Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">Carregamento e Sincronização Inteligente para Supabase e Power BI</p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Redirecionando para o ambiente de acesso...</span>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition flex items-center justify-center space-x-2"
        >
          <span>Acessar o Sistema Agora</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}