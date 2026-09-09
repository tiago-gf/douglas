import Papa from 'papaparse';

export interface TargetTableConfig {
  id: string;
  name: string;
  supabaseTable: string;
  onConflictKey: string;
  requiredColumns: string[];
}

export const TARGET_TABLES: Record<string, TargetTableConfig> = {
  d_empresa: {
    id: 'd_empresa',
    name: 'Empresas (d_Empresa)',
    supabaseTable: 'd_empresa',
    onConflictKey: 'id',
    requiredColumns: ['ID', 'EMPRESA']
  },
  d_centro_custo: {
    id: 'd_centro_custo',
    name: 'Centros de Custo (dCentroCusto)',
    supabaseTable: 'd_centro_custo',
    onConflictKey: 'id_cc',
    requiredColumns: ['Id_CC', 'CENTRODECUSTOS']
  },
  d_cfop: {
    id: 'd_cfop',
    name: 'CFOP (dCfop)',
    supabaseTable: 'd_cfop',
    onConflictKey: 'id_cfop',
    requiredColumns: ['Id_Cfop', 'Cfop']
  },
  d_epe: {
    id: 'd_epe',
    name: 'EPE (dEPE)',
    supabaseTable: 'd_epe',
    onConflictKey: 'id_epe',
    requiredColumns: ['Id_EPE', 'EPE']
  },
  d_operacao: {
    id: 'd_operacao',
    name: 'Operações (dOperacao)',
    supabaseTable: 'd_operacao',
    onConflictKey: 'id_op',
    requiredColumns: ['ID_Op', 'Desc_Operacao']
  },
  f_faturamento: {
    id: 'f_faturamento',
    name: 'Faturamento Mensal (f_Faturamento)',
    supabaseTable: 'f_faturamento',
    onConflictKey: 'id_emp,mes',
    requiredColumns: ['ID_EMP', 'Empresa', 'Mes', ' Valor ']
  },
  f_faturamento_operacao: {
    id: 'f_faturamento_operacao',
    name: 'Faturamento por Operação (faturamento_operacao)',
    supabaseTable: 'f_faturamento_operacao',
    onConflictKey: 'id_emp,nf,id_oper,mes,valor',
    requiredColumns: ['ID_Emp', 'NF', 'ID_Oper', 'Mês', ' Valor ']
  },
  f_nova_base: {
    id: 'f_nova_base',
    name: 'Lançamentos Financeiros (nova_base)',
    supabaseTable: 'f_nova_base',
    onConflictKey: 'id_lcto',
    requiredColumns: ['ID_LCTO', 'Data', 'ID_Empresa', ' VALOR ']
  },
  f_zootecnicos: {
    id: 'f_zootecnicos',
    name: 'Zootécnicos (zootecnicos)',
    supabaseTable: 'f_zootecnicos',
    onConflictKey: 'cod_operacao,operacao,quant_exportados,peso_exportado_total',
    requiredColumns: ['COD_OPERACAO', 'OPERACAO', 'QUANT. EXPORTADOS']
  }
};

export function parseBrazilianNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  
  let str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'n/a') return null;
  
  str = str.replace(/\s+/g, '');
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  } else if ((str.match(/\./g) || []).length > 1) {
    str = str.replace(/\./g, '');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed;
}

export function parseBrazilianDate(val: any): string | null {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;

  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = str.match(dateRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  const monthMap: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12'
  };
  const shortMatch = str.toLowerCase().match(/^([a-z]{3})\/(\d{2})$/);
  if (shortMatch) {
    const month = monthMap[shortMatch[1]] || '01';
    const year = `20${shortMatch[2]}`;
    return `${year}-${month}-01`;
  }

  return null;
}

export interface ValidationLog {
  type: 'success' | 'error' | 'warning';
  rowNumber?: number;
  message: string;
  fixInstruction?: string;
}

export function processAndValidateFile(
  fileContent: string,
  config: TargetTableConfig
): { processedData: any[]; logs: ValidationLog[] } {
  const logs: ValidationLog[] = [];
  
  const parseResult = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim()
  });

  if (parseResult.errors.length > 0) {
    parseResult.errors.forEach((err) => {
      logs.push({
        type: 'error',
        rowNumber: err.row ? err.row + 1 : undefined,
        message: `O arquivo possui um problema de formatação na linha ${err.row ? err.row + 1 : 'desconhecida'}.`,
        fixInstruction: 'Abra a planilha no Excel, verifique se existem aspas soltas ou vírgulas fora de lugar e salve novamente como CSV.'
      });
    });
  }

  const rawRows = parseResult.data as Record<string, any>[];
  if (!rawRows || rawRows.length === 0) {
    logs.push({
      type: 'error',
      message: 'O arquivo enviado está totalmente vazio.',
      fixInstruction: 'Selecione um arquivo CSV que contenha dados válidos.'
    });
    return { processedData: [], logs };
  }

  const presentHeaders = Object.keys(rawRows[0] || {});
  const missingHeaders = config.requiredColumns.filter(
    (col) => !presentHeaders.includes(col.trim())
  );

  if (missingHeaders.length > 0) {
    logs.push({
      type: 'error',
      message: `A tabela selecionada exige a coluna "${missingHeaders.join(', ')}", mas ela não foi encontrada no arquivo.`,
      fixInstruction: `Certifique-se de que selecionou o arquivo correto para a tabela "${config.name}".`
    });
    return { processedData: [], logs };
  }

  const processedData: any[] = [];

  rawRows.forEach((row, index) => {
    const lineNum = index + 2;
    const cleanRow: Record<string, any> = {};

    try {
      if (config.id === 'd_empresa') {
        const id = parseBrazilianNumber(row['ID']);
        if (id === null) throw new Error('O campo "ID" da Empresa deve ser um número válido.');
        cleanRow['id'] = id;
        cleanRow['empresa'] = String(row['EMPRESA'] || '').trim();
      } 
      else if (config.id === 'd_centro_custo') {
        const id = parseBrazilianNumber(row['Id_CC']);
        if (id === null) throw new Error('O campo "Id_CC" deve ser um número inteiro.');
        cleanRow['id_cc'] = id;
        cleanRow['centrodecustos'] = String(row['CENTRODECUSTOS'] || '').trim();
      } 
      else if (config.id === 'd_cfop') {
        const id = parseBrazilianNumber(row['Id_Cfop']);
        if (id === null) throw new Error('O campo "Id_Cfop" deve ser um número válido.');
        cleanRow['id_cfop'] = id;
        cleanRow['cfop'] = String(row['Cfop'] || '').trim();
      } 
      else if (config.id === 'd_epe') {
        const id = parseBrazilianNumber(row['Id_EPE']);
        if (id === null) throw new Error('O campo "Id_EPE" deve ser um número válido.');
        cleanRow['id_epe'] = id;
        cleanRow['epe'] = String(row['EPE'] || '').trim();
      } 
      else if (config.id === 'd_operacao') {
        const id = parseBrazilianNumber(row['ID_Op']);
        if (id === null) throw new Error('O campo "ID_Op" deve ser um número válido.');
        cleanRow['id_op'] = id;
        cleanRow['desc_operacao'] = String(row['Desc_Operacao'] || '').trim();
      } 
      else if (config.id === 'f_faturamento') {
        const idEmp = parseBrazilianNumber(row['ID_EMP']);
        if (idEmp === null) throw new Error('O campo "ID_EMP" não pode ser vazio ou conter texto.');
        cleanRow['id_emp'] = idEmp;
        cleanRow['empresa'] = String(row['Empresa'] || '').trim();
        cleanRow['mes'] = String(row['Mes'] || '').trim();
        cleanRow['valor'] = parseBrazilianNumber(row[' Valor '] ?? row['Valor']) || 0;
      } 
      else if (config.id === 'f_faturamento_operacao') {
        const idEmp = parseBrazilianNumber(row['ID_Emp']);
        if (idEmp === null) throw new Error('O campo "ID_Emp" é obrigatório.');
        cleanRow['id_emp'] = idEmp;
        cleanRow['empresa'] = String(row['Empresa'] || '').trim();
        cleanRow['mes'] = parseBrazilianDate(row['Mês'] ?? row['Mes']);
        cleanRow['nf'] = String(row['NF'] || 'S/N').trim();
        cleanRow['oper'] = String(row['Oper'] || '').trim();
        cleanRow['data_embarque'] = parseBrazilianDate(row['Data_Embarque']);
        cleanRow['id_oper'] = parseBrazilianNumber(row['ID_Oper']) || 0;
        cleanRow['cliente'] = String(row['CLIENTE'] || '').trim();
        cleanRow['invoice'] = String(row['INVOICE'] || '0').trim();
        cleanRow['csll'] = parseBrazilianNumber(row['CSLL']) || 0;
        cleanRow['ir'] = parseBrazilianNumber(row['IR']) || 0;
        cleanRow['epe'] = String(row['EPE'] || '').trim();
        cleanRow['id_epe'] = parseBrazilianNumber(row['ID_EPE']) || 0;
        cleanRow['qtd_exportado'] = parseBrazilianNumber(row['QTD_EXPORTADO']) || 0;
        cleanRow['valor'] = parseBrazilianNumber(row[' Valor '] ?? row['Valor']) || 0;
        cleanRow['data_contrato'] = parseBrazilianDate(row['Data_Contrato']);
      } 
      else if (config.id === 'f_nova_base') {
        const idLcto = parseBrazilianNumber(row['ID_LCTO']);
        if (idLcto === null) throw new Error('O código "ID_LCTO" na planilha está em branco ou inválido.');
        cleanRow['id_lcto'] = idLcto;
        cleanRow['data'] = parseBrazilianDate(row['Data']);
        cleanRow['tipo'] = String(row['Tipo'] || '').trim();
        cleanRow['num'] = String(row['NUM'] || '').trim();
        cleanRow['fornecedor'] = String(row['FORNECEDOR'] || '').trim();
        cleanRow['cfop'] = String(row['CFOP'] || '').trim();
        cleanRow['id_cfop'] = parseBrazilianNumber(row['Id_Cfop']);
        cleanRow['produto_servico'] = String(row['PRODUTO_SERVICO'] || '').trim();
        cleanRow['quant_boi'] = parseBrazilianNumber(row['QUANT_BOI']);
        cleanRow['emissao'] = parseBrazilianDate(row['EMISSÃO'] ?? row['EMISSO']);
        cleanRow['venc'] = parseBrazilianDate(row['VENC']);
        cleanRow['valor'] = parseBrazilianNumber(row[' VALOR '] ?? row['VALOR']) || 0;
        cleanRow['centrodecustos'] = String(row['CENTRODECUSTOS'] || '').trim();
        cleanRow['id_cc'] = parseBrazilianNumber(row['Id_CC']);
        cleanRow['epe'] = String(row['EPE'] || '').trim();
        cleanRow['id_epe'] = parseBrazilianNumber(row['Id_Epe']);
        cleanRow['operacao'] = String((row['OPERAÇÃO'] ?? row['OPERAO']) || '').trim();
        cleanRow['id_op'] = parseBrazilianNumber(row['Id_Op']) || 0;
        cleanRow['forma_de_pagamento'] = String(row['FORMA DE PAGAMENTO'] || '').trim();
        cleanRow['dados_bancarios'] = String((row['DADOS BANCÁRIOS'] ?? row['DADOS BANCRIOS']) || '').trim();
        cleanRow['status'] = String(row['STATUS'] || '').trim();
        cleanRow['tem_comp_pgto'] = String(row['TEM COMP PGTO?'] || '').trim();
        cleanRow['arquivado'] = String(row['ARQUIVADO?'] || '').trim();
        cleanRow['id_empresa'] = parseBrazilianNumber(row['ID_Empresa']) || 1;
        cleanRow['env_grupo'] = String(row['ENV GRUPO'] || '').trim();
      } 
      else if (config.id === 'f_zootecnicos') {
        const codOp = parseBrazilianNumber(row['COD_OPERACAO']);
        if (codOp === null) throw new Error('O campo "COD_OPERACAO" está inválido.');
        cleanRow['cod_operacao'] = codOp;
        cleanRow['protocolo'] = String(row['PROTOCOLO'] || '').trim();
        cleanRow['operacao'] = String(row['OPERACAO'] || '').trim();
        cleanRow['pais'] = String((row['PAÍS'] ?? row['PAS']) || '').trim();
        cleanRow['tempo_quarentena'] = parseBrazilianNumber(row['TEMPO DE QUARENTENA']) || 0;
        cleanRow['quant_comprado'] = parseBrazilianNumber(row['QUANT. COMPRADO']) || 0;
        cleanRow['quant_exportados'] = parseBrazilianNumber(row['QUANT. EXPORTADOS']) || 0;
        cleanRow['n_positivos'] = parseBrazilianNumber(row['N° POSITIVOS']) || 0;
        cleanRow['n_mortes'] = parseBrazilianNumber(row['N° MORTES']) || 0;
        cleanRow['estoque_final'] = parseBrazilianNumber(row['ESTOQUE FINAL']) || 0;
        cleanRow['peso_compra_total'] = parseBrazilianNumber(row['PESO COMPRA TOTAL']);
        cleanRow['peso_exportado_total'] = parseBrazilianNumber(row['PESO EXPORTADO TOTAL']);
        cleanRow['n_abate_sanitario'] = parseBrazilianNumber(row['N° ABATE SANITÁRIO']) || 0;
        cleanRow['pct_morte'] = parseBrazilianNumber(row['% MORTE']);
        cleanRow['estoque_final_kg'] = parseBrazilianNumber(row['ESTOQUE FINAL EM KG']);
        cleanRow['peso_medio_compra'] = parseBrazilianNumber(row['PESO MÉDIO COMPRA']);
        cleanRow['peso_medio_exportacao'] = parseBrazilianNumber(row['PESO MÉDIO EXPORTAÇÃO']);
        cleanRow['estoque_final_rs'] = parseBrazilianNumber(row['ESTOQUE FINAL R$']);
        cleanRow['n_dias_medio'] = parseBrazilianNumber(row['N° DIAS MÉDIO']) || 0;
        cleanRow['n_diarias_total'] = parseBrazilianNumber(row['N° DIÁRIAS TOTAL']);
        cleanRow['consumo_por_animal'] = parseBrazilianNumber(row['CONSUMO POR ANIMAL']);
        cleanRow['consumo_diario_por_animal'] = parseBrazilianNumber(row['CONSUMO DIÁRIO POR ANIMAL']);
        cleanRow['consumo_total'] = parseBrazilianNumber(row['CONSUMO TOTAL']);
        cleanRow['ganho_peso_medio'] = parseBrazilianNumber(row['GANHO PESO MÉDIO']);
        cleanRow['ganho_peso_total'] = parseBrazilianNumber(row['GANHO PESO TOTAL']);
        cleanRow['custo_materia_seca'] = parseBrazilianNumber(row['CUSTO DA MATÉRIA SECA']);
        cleanRow['custo_diaria_nutricional'] = parseBrazilianNumber(row['CUSTO DIÁRIA NUTRICIONAL']);
        cleanRow['custo_total'] = parseBrazilianNumber(row['CUSTO TOTAL']);
        cleanRow['valor_por_animal'] = parseBrazilianNumber(row['VALOR POR ANIMAL']);
        cleanRow['valor_por_kg'] = parseBrazilianNumber(row['VALOR POR KG']);
        cleanRow['custo_frete_por_animal'] = parseBrazilianNumber(row['CUSTO FRETE POR ANIMAL']);
        cleanRow['quebra_peso'] = parseBrazilianNumber(row['QUEBRA DE PESO']);
        cleanRow['quebra_peso_chegada'] = parseBrazilianNumber(row['QUEBRA DE PESO CHEGADA']);
        cleanRow['distancia'] = parseBrazilianNumber(row['DISTÂNCIA']) || 0;
        cleanRow['distancia_porto'] = parseBrazilianNumber(row['DISTÂNCIA PORTO']) || 0;
        cleanRow['comissao_por_animal'] = parseBrazilianNumber(row['COMISSÃO POR ANIMAL']);
        cleanRow['quarentena_custo'] = parseBrazilianNumber(row['QUARENTENA CUSTO']);
        cleanRow['venda_interna'] = parseBrazilianNumber(row['VENDA_INTERNA']);
        cleanRow['rs_compra_gado'] = parseBrazilianNumber(row['R$ COMPRA GADO']);
        cleanRow['centro_de_custos'] = String(row['CENTRO DE CUSTOS'] || '').trim();
        cleanRow['id_centro_de_custos'] = parseBrazilianNumber(row['ID CENTRO DE CUSTOS']) || 6;
        cleanRow['epe'] = String(row['EPE'] || '').trim();
        cleanRow['id_epe'] = parseBrazilianNumber(row['ID EPE']) || 0;
        cleanRow['compra_gado_fat'] = parseBrazilianNumber(row['COMPRA GADO FAT']) || 0;
        cleanRow['frete'] = parseBrazilianNumber(row['FRETE']) || 0;
        cleanRow['comissao'] = parseBrazilianNumber(row['COMISSÃO']) || 0;
        cleanRow['comida'] = parseBrazilianNumber(row['COMIDA']) || 0;
      }

      processedData.push(cleanRow);
    } catch (err: any) {
      logs.push({
        type: 'error',
        rowNumber: lineNum,
        message: `Linha ${lineNum}: ${err.message || 'Dados inválidos nesta linha.'}`,
        fixInstruction: `Corrija o valor na linha ${lineNum} da sua planilha e faça o upload do arquivo novamente.`
      });
    }
  });

  return { processedData, logs };
}