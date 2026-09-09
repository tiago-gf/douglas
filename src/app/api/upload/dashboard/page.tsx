'use client';

import { useState } from 'react';
import { TARGET_TABLES, TargetTableConfig, ValidationLog } from '@/lib/etl-processor';
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, LogOut } from 'lucide-react';

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
        body: formData
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
          fixInstruction: 'Verifique sua conexão com a internet e tente enviar novamente em alguns instantes.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">ETL Control Center & Database Sync</h1>
          <p className="text-xs text-slate-400">Importador Unificado para Supabase e Power BI</p>
        </div>
        <button
          onClick={() => (window.location.href = '/login')}
          className="text-xs flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Column */}
        <section className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                1. Selecione a Tabela de Destino
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {Object.values(TARGET_TABLES).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                2. Selecione o Arquivo CSV
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-950/50 hover:bg-slate-950 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                {file ? (
                  <div className="flex items-center space-x-2 text-blue-400 font-medium text-sm">
                    <FileText className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-300">Clique para selecionar o arquivo</p>
                    <p className="text-xs text-slate-500 mt-1">Aceita somente formato .csv</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando e Processando...</span>
                </>
              ) : (
                <span>Executar Importação / Merge</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
            <p className="font-semibold text-slate-400 mb-1">Estratégia de Ingestão:</p>
            <p>
              Os dados são inseridos via <code className="text-blue-400">UPSERT (Merge)</code>. Registros novos são
              criados e registros já existentes são atualizados automaticamente com base nas chaves exclusivas.
            </p>
          </div>
        </section>

        {/* Logs & Results Column */}
        <section className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-col">
          <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3 tracking-wider">
            Resultado da Operação & Logs
          </h2>

          {/* KPI Summary Header */}
          {summary && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Total de Linhas</span>
                <span className="text-lg font-bold text-slate-100">{summary.totalRows}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Processadas / Salvas</span>
                <span className="text-lg font-bold text-emerald-400">{summary.insertedRows}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Erros Encontrados</span>
                <span className="text-lg font-bold text-red-400">{summary.errorCount}</span>
              </div>
            </div>
          )}

          {/* Logs Terminal Area */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md p-4 overflow-y-auto max-h-[480px] space-y-3 font-sans">
            {logs.length === 0 ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-600 text-xs">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p>Nenhum log gerado ainda.</p>
                <p>Selecione a tabela, escolha o CSV e clique em "Executar Importação".</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border text-xs leading-relaxed ${
                    log.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                      : log.type === 'warning'
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      : 'bg-red-950/30 border-red-800/50 text-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}

                    <div className="flex-1">
                      <p className="font-semibold">{log.message}</p>
                      {log.fixInstruction && (
                        <div className="mt-2 pt-2 border-t border-slate-800/60 text-slate-300">
                          <strong className="text-amber-300">Como corrigir este problema: </strong>
                          {log.fixInstruction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}