'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, ShieldCheck, Database, CircleCheckBig } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg('Supabase ainda não está configurado. Defina as variáveis de ambiente antes de entrar.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_22%),linear-gradient(135deg,_#020817_0%,_#09111f_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/80 shadow-[0_30px_80px_rgba(2,6,23,0.8)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden border-r border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9))] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_35%)]" />
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/30">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">EtlOS</p>
                <p className="text-sm text-slate-400">Data Control Suite</p>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-md text-4xl font-black leading-tight text-white">
                Automatize a ingestão de dados com segurança e rapidez.
              </h1>
              <p className="max-w-md text-base text-slate-300">
                Valide arquivos, normalize composições e sincronize informação com consistência para o seu time de negócio.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              'Upload de CSV em poucos passos',
              'Validação inteligente por campo',
              'Sincronização com Supabase e BI'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CircleCheckBig className="h-4 w-4" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Acesso</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Entrar</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/30">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">E-mail corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(59,130,246,0.38)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? 'Autenticando...' : 'Acessar dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}