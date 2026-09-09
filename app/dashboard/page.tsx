'use client';

import { useState } from 'react';
import { TARGET_TABLES, ValidationLog } from '@/lib/etl-processor';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  LogOut,
  Database,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

export default function DashboardPage() {
  const [selectedTable, setSelectedTable] = useState<string>('d_empresa');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [summary, setSummary] = useState<{ totalRows: number; insertedRows: number; errorCount: number } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setLogs([]);
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tableId', selectedTable);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setLogs([
        {
          type: 'error',
          message: 'Falha crítica de comunicação com o servidor.',
          fixInstruction: 'Verifique sua conexão com a internet e tente enviar novamente em alguns instantes.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total de linhas', value: summary?.totalRows ?? 0, tone: 'text-white' },
    { label: 'Salvas / atualizadas', value: summary?.insertedRows ?? 0, tone: 'text-emerald-300' },
    { label: 'Erros', value: summary?.errorCount ?? 0, tone: 'text-red-300' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_25%),linear-gradient(180deg,_#020817_0%,_#0f172a_100%)] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/30">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">EtlOS</p>
              <h1 className="text-base font-semibold text-white">Control Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              online
            </div>
            <button
              onClick={() => (window.location.href = '/login')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visão geral</p>
            <h2 className="mt-2 text-3xl font-black text-white">Pipeline de carga</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-200">
            <Sparkles className="h-4 w-4" />
            Processamento inteligente
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <FolderOpen className="h-4 w-4 text-blue-400" />
                    1. Destino
                  </div>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-blue-500"
                  >
                    {Object.values(TARGET_TABLES).map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <Upload className="h-4 w-4 text-blue-400" />
                    2. Arquivo CSV
                  </div>
                  <label className="group relative block overflow-hidden rounded-[24px] border-2 border-dashed border-slate-700 bg-slate-950/60 p-6 text-center transition hover:border-blue-500/70 hover:bg-slate-950">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 z-20 cursor-pointer opacity-0"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
                        <Upload className="h-5 w-5" />
                      </div>
                      {file ? (
                        <div className="max-w-full overflow-hidden text-ellipsis text-sm font-medium text-blue-300">
                          {file.name}
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-200">Selecione ou arraste o arquivo CSV</p>
                          <p className="text-xs text-slate-500">Arquivos com extensão .csv</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.35)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processando ETL...
                    </>
                  ) : (
                    <>
                      Executar importação
                      <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Estratégia de merge
                </div>
                Registros novos são inseridos e os existentes são atualizados automaticamente com base na chave única da tabela, preservando consistência para dashboards e relatórios.
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Monitoramento</p>
                  <h3 className="mt-2 text-xl font-bold text-white">Logs e diagnóstico</h3>
                </div>
                <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  operação
                </div>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className={`mt-3 text-2xl font-bold ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-[24px] border border-slate-800 bg-slate-950/80 p-4">
                {logs.length === 0 ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center text-slate-500">
                    <BarChart3 className="mb-3 h-10 w-10 text-slate-600" />
                    <p className="text-base font-medium text-slate-300">Nenhum log gerado ainda</p>
                    <p className="mt-1 text-sm text-slate-500">Envie um arquivo CSV para iniciar a validação e sincronização.</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={`${log.message}-${index}`}
                      className={`rounded-2xl border p-4 ${
                        log.type === 'success'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                          : log.type === 'warning'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                            : 'border-red-500/30 bg-red-500/10 text-red-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {log.type === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />}
                        {log.type === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />}
                        {log.type === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.fixInstruction && (
                            <p className="mt-2 text-xs text-slate-200/90">
                              <span className="font-semibold text-white">Como resolver:</span> {log.fixInstruction}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}