'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck, Sparkles, Database, BarChart3, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 900);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-[28px] border border-slate-800/80 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.7)] backdrop-blur-xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              ETL Intelligence
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                Pipeline de dados para
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent"> decisões rápidas</span>
              </h1>
              <p className="max-w-xl text-base text-slate-300 md:text-lg">
                Centralize upload, validação, limpeza e sincronização de arquivos CSV em uma plataforma moderna e confiável.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Database, label: 'Upload inteligente' },
                { icon: BarChart3, label: 'Business view' },
                { icon: Zap, label: 'Processamento em lote' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                  <Icon className="h-4 w-4 text-blue-400" />
                  {label}
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.45)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_40px_rgba(34,211,238,0.35)]"
            >
              <span>Acessar painel</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-700 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/50">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Sistema em operação</p>
                  <p className="text-xs text-slate-400">Conectado ao ambiente de dados</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                online
              </span>
            </div>

            <div className="space-y-4">
              {[
                ['Arquivos processados', '128'],
                ['Validação automatizada', '99.3%'],
                ['Tempo médio', '2.4 min']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              Redirecionando para o acesso...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}