import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TARGET_TABLES, processAndValidateFile } from '@/lib/etl-processor';

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tableId = formData.get('tableId') as string;

    if (!file || !tableId) {
      return NextResponse.json(
        { error: 'Arquivo e ID da tabela de destino são obrigatórios.' },
        { status: 400 }
      );
    }

    const config = TARGET_TABLES[tableId];
    if (!config) {
      return NextResponse.json({ error: 'Tabela de destino inválida.' }, { status: 400 });
    }

    const fileContent = await file.text();
    const { processedData, logs } = processAndValidateFile(fileContent, config);

    // Se houver erros fatais na validação local, interrompe o salvamento
    const fatalErrors = logs.filter((l) => l.type === 'error');
    if (fatalErrors.length > 0) {
      return NextResponse.json({
        success: false,
        summary: { totalRows: 0, insertedRows: 0, errorCount: fatalErrors.length },
        logs
      });
    }

    if (processedData.length === 0) {
      return NextResponse.json({
        success: false,
        summary: { totalRows: 0, insertedRows: 0, errorCount: 1 },
        logs: [{ type: 'error', message: 'Nenhum registro válido foi processado.' }]
      });
    }

    // Processamento em lotes (Chunking) para evitar estourar o payload do Supabase
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
      const batch = processedData.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from(config.supabaseTable)
        .upsert(batch, { onConflict: config.onConflictKey });

      if (error) {
        console.error('Erro de Upsert no Supabase:', error);
        
        let friendlyMessage = `Erro ao salvar os dados no banco: ${error.message}`;
        let instruction = 'Verifique se você possui permissão de gravação ou se os registros possuem duplicidades não tratadas.';

        if (error.code === '23505') {
          friendlyMessage = 'Foram encontrados dados duplicados com chaves conflitantes.';
          instruction = 'O sistema tentou atualizar registros existentes, mas a restrição única impediu a operação.';
        }

        logs.push({
          type: 'error',
          message: friendlyMessage,
          fixInstruction: instruction
        });

        return NextResponse.json({
          success: false,
          summary: { totalRows: processedData.length, insertedRows: insertedCount, errorCount: logs.length },
          logs
        });
      }

      insertedCount += batch.length;
    }

    logs.push({
      type: 'success',
      message: `Sucesso! ${insertedCount} registros foram inseridos/atualizados (Merge executado com sucesso).`
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: processedData.length,
        insertedRows: insertedCount,
        errorCount: 0
      },
      logs
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Ocorreu um erro interno ao processar a requisição.' },
      { status: 500 }
    );
  }
}