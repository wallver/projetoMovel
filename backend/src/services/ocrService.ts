import * as vision from '@google-cloud/vision';
import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';
import sharp from 'sharp';

/**
 * Interface para resultado do OCR
 */
export interface OCRResult {
  fullText: string;
  confidence: number;
  lines: string[];
  detectedData: {
    value?: number;
    dueDate?: Date;
    barcode?: string;
    pixCode?: string;
    company?: string;
  };
}

/**
 * Service para processamento OCR de imagens de contas
 */
class OCRService {
  private useLocalOCR: boolean;
  private visionClient: vision.ImageAnnotatorClient | null = null;

  constructor() {
    this.useLocalOCR = process.env.USE_LOCAL_OCR === 'true';
    
    // Inicializar Google Vision se não estiver usando OCR local
    if (!this.useLocalOCR && process.env.GOOGLE_VISION_API_KEY) {
      this.visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }
  }

  /**
   * Detecta QR Code na imagem e extrai código Pix
   */
  async detectQRCode(imageBuffer: Buffer): Promise<string | null> {
    try {
      console.log('🔍 Procurando QR Code...');
      
      // Converter imagem para formato que jsQR entende (RGBA)
      const image = sharp(imageBuffer);
      const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Detectar QR Code
      const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
      
      if (code && code.data) {
        console.log('📱 QR Code detectado!');
        
        // Verificar se é código Pix (geralmente começa com "00020126" ou contém "BR.GOV.BCB.PIX")
        const qrData = code.data;
        if (qrData.includes('BR.GOV.BCB.PIX') || qrData.startsWith('00020')) {
          console.log('💰 QR Code Pix identificado!');
          return qrData;
        } else {
          console.log('⚠️ QR Code encontrado mas não é Pix');
        }
      } else {
        console.log('❌ Nenhum QR Code encontrado');
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao detectar QR Code:', error);
      return null;
    }
  }

  /**
   * Processa imagem e extrai texto usando OCR
   * 
   * Nota: A imagem é recebida em qualidade máxima (1.0) do frontend,
   * o que melhora significativamente a precisão do OCR sem necessidade
   * de pré-processamento adicional na maioria dos casos.
   */
  async processImage(imageBuffer: Buffer): Promise<OCRResult> {
    let fullText = '';
    let confidence = 0;

    console.log('🔍 Iniciando processamento OCR...');
    console.log('📸 Tamanho da imagem:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    // Tentar detectar QR Code Pix primeiro
    const pixCode = await this.detectQRCode(imageBuffer);

    if (this.useLocalOCR) {
      // Usar Tesseract (OCR local) com configurações otimizadas
      console.log('🤖 Usando Tesseract OCR (local)');
      const result = await Tesseract.recognize(imageBuffer, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log('Tesseract: Reconhecendo texto...', Math.round(m.progress * 100) + '%');
          }
        },
        // Configurações otimizadas para contas/faturas
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1',
      });
      
      fullText = result.data.text;
      confidence = result.data.confidence;
      console.log('✅ Tesseract concluído. Confiança:', confidence.toFixed(1) + '%');
    } else if (this.visionClient) {
      // Usar Google Vision API
      console.log('🌐 Usando Google Vision API');
      const [result] = await this.visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      
      if (detections && detections.length > 0) {
        fullText = detections[0].description || '';
        confidence = 90; // Google Vision não retorna confidence para text detection
        console.log('✅ Google Vision concluído');
      }
    } else {
      throw new Error('Nenhum serviço de OCR configurado');
    }

    const lines = fullText.split('\n').filter(line => line.trim().length > 0);
    const detectedData = this.extractBillData(fullText);

    // Adicionar código Pix se foi detectado
    if (pixCode) {
      detectedData.pixCode = pixCode;
    }

    // Log para debug
    console.log('📝 Texto extraído (primeiras 5 linhas):');
    lines.slice(0, 5).forEach(line => console.log('  -', line));
    console.log('💰 Valor detectado:', detectedData.value || 'Não encontrado');
    console.log('📅 Data detectada:', detectedData.dueDate ? detectedData.dueDate.toLocaleDateString('pt-BR') : 'Não encontrada');
    console.log('📊 Código de barras:', detectedData.barcode ? `${detectedData.barcode.substring(0, 15)}...` : 'Não encontrado');
    console.log('💳 Código Pix:', detectedData.pixCode ? `${detectedData.pixCode.substring(0, 30)}...` : 'Não encontrado');
    console.log('🏢 Empresa detectada:', detectedData.company || 'Não identificada');
    console.log('📊 Confiança:', confidence.toFixed(1) + '%');

    return {
      fullText,
      confidence,
      lines,
      detectedData,
    };
  }

  /**
   * Extrai dados específicos da conta (valor, vencimento, código de barras)
   */
  private extractBillData(text: string): OCRResult['detectedData'] {
    const data: OCRResult['detectedData'] = {};

    // Limpar texto para melhor análise
    const cleanText = text.replace(/[|]/g, 'I').replace(/[l]/g, '1');

    // Extrair valor (busca por padrões específicos de contas brasileiras)
    const valuePatterns = [
      // Padrão específico: "Total a pagar", "Valor Total", etc. com contexto
      /(?:total\s*a\s*pagar|valor\s*total|total\s+a\s+pagar|valor\s+a\s+pagar|total|pagar)[:\s=]*R?\$?\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})/gi,
      // Padrão com R$ (prioridade alta)
      /R\$\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})/gi,
      // Padrão de valores com "RS" ou "rs" (comum em OCR)
      /(?:RS|rs)\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})/gi,
      // Valores isolados em linha (geralmente destaque)
      /^\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})\s*$/gm,
      // Valores com pelo menos 2 casas decimais
      /(\d{2,3}(?:[\.,]\d{3})*[,\.]\d{2})/g,
    ];

    const foundValues: Array<{value: number, priority: number}> = [];
    
    for (let i = 0; i < valuePatterns.length; i++) {
      const pattern = valuePatterns[i];
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const valueStr = match[1] || match[0];
        // Normalizar: trocar pontos por nada e vírgulas por ponto
        const normalized = valueStr
          .replace(/[^\d,\.]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        
        const value = parseFloat(normalized);
        // Ajustar range mínimo e máximo
        if (!isNaN(value) && value >= 5 && value < 100000) {
          // Dar prioridade maior para padrões mais específicos (índice menor)
          const priority = 10 - i;
          foundValues.push({ value, priority });
        }
      }
    }

    // Pegar o maior valor dos mais prioritários
    if (foundValues.length > 0) {
      foundValues.sort((a, b) => {
        // Primeiro por prioridade, depois por valor
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.value - a.value;
      });
      data.value = foundValues[0].value;
    }

    // Extrair data de vencimento (formatos brasileiros)
    const datePatterns = [
      // Com contexto de vencimento (prioridade máxima)
      /(?:vencimento|venc\.?|vencto|data\s*de?\s*venc(?:imento)?|pagar\s*até|pagamento\s*até?|até)[:\s=]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}|\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2})/gi,
      // Formato completo DD/MM/YYYY ou DD-MM-YYYY
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/g,
      // Formato curto DD/MM/YY ou DD-MM-YY
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2})/g,
      // Formato com espaços (OCR pode separar)
      /(\d{2}\s*[\/\-\.]\s*\d{2}\s*[\/\-\.]\s*\d{2,4})/g,
    ];

    const foundDates: Array<{date: Date, priority: number}> = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Resetar horas para comparação correta
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    for (let i = 0; i < datePatterns.length; i++) {
      const pattern = datePatterns[i];
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const dateStr = match[1] || match[0];
        const cleanDate = dateStr.replace(/\s+/g, '').match(/\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}/);
        
        if (cleanDate) {
          const parts = cleanDate[0].split(/[\/\-\.]/);
          let day = parseInt(parts[0]);
          let month = parseInt(parts[1]);
          let year = parseInt(parts[2]);
          
          // Se ano com 2 dígitos, assumir século atual
          if (year < 100) {
            year += 2000;
          }
          
          // Validar dia e mês antes de criar a data
          if (day < 1 || day > 31 || month < 1 || month > 12) {
            continue;
          }
          
          const date = new Date(year, month - 1, day);
          date.setHours(0, 0, 0, 0);
          
          // Validar se a data é válida e está dentro do range razoável
          if (!isNaN(date.getTime()) && 
              date >= twoMonthsAgo && 
              date <= twoYearsFromNow &&
              // Verificar se o dia existe no mês (ex: 31/02 é inválido)
              date.getDate() === day &&
              date.getMonth() === month - 1) {
            
            // Calcular prioridade: 
            // - Maior para datas com contexto (vencimento)
            // - Maior para datas futuras próximas
            let priority = 5 - i; // Prioridade do padrão
            
            if (date >= now) {
              // Data futura: adicionar prioridade extra
              priority += 10;
              // Quanto mais próxima, maior a prioridade (até 3 meses)
              const daysUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (daysUntil <= 90) {
                priority += (90 - daysUntil) / 30; // 0-3 pontos extra
              }
            }
            
            foundDates.push({ date, priority });
          }
        }
      }
    }

    // Pegar a data com maior prioridade
    if (foundDates.length > 0) {
      foundDates.sort((a, b) => b.priority - a.priority);
      data.dueDate = foundDates[0].date;
    }

    // Extrair código de barras (linha digitável de boletos)
    const barcodePatterns = [
      // Linha digitável padrão: 5 blocos (XXXXX.XXXXX XXXXX.XXXXXX XXXXX.XXXXXX X XXXXXXXXXXXXXXXX)
      /(\d{5}[\.\s]?\d{5}[\s]+\d{5}[\.\s]?\d{6}[\s]+\d{5}[\.\s]?\d{6}[\s]+\d[\s]+\d{14})/g,
      // Formato com pontos e espaços variados
      /(\d{5}[\.\s]?\d{5}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d[\s]?\d{14})/g,
      // Formato sem espaços mas com pontos
      /(\d{5}\.\d{5}\d{5}\.\d{6}\d{5}\.\d{6}\d\d{14})/g,
      // Formato contínuo: 47-48 dígitos seguidos
      /(\d{47,48})/g,
      // Busca por sequência de muitos dígitos (última tentativa)
      /(\d{44,50})/g,
    ];

    const foundBarcodes: string[] = [];

    for (const pattern of barcodePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const barcodeStr = match[1] || match[0];
        // Limpar: remover tudo exceto dígitos
        const cleanBarcode = barcodeStr.replace(/[^\d]/g, '');
        
        // Validar tamanho (linha digitável tem 47 ou 48 dígitos)
        if (cleanBarcode.length >= 44 && cleanBarcode.length <= 48) {
          foundBarcodes.push(cleanBarcode);
        }
      }
    }

    // Pegar o código mais longo encontrado (geralmente o correto)
    if (foundBarcodes.length > 0) {
      foundBarcodes.sort((a, b) => b.length - a.length);
      data.barcode = foundBarcodes[0];
      
      // Formatar para exibição legível (adicionar pontos e espaços)
      if (data.barcode.length === 47 || data.barcode.length === 48) {
        // Formato: XXXXX.XXXXX XXXXX.XXXXXX XXXXX.XXXXXX X XXXXXXXXXXXXXXXX
        const formatted = data.barcode.replace(
          /(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
          '$1.$2 $3.$4 $5.$6 $7 $8'
        );
        // Salvar formatado se deu match
        if (formatted !== data.barcode && formatted.length > data.barcode.length) {
          data.barcode = data.barcode; // Manter limpo no banco
        }
      }
    }

    // Identificar empresa (busca mais robusta)
    const companies = {
      'CPFL': ['cpfl', 'c p f l', 'cpfl energia', 'cpfl paulista', 'cpfl piratininga'],
      'CEMIG': ['cemig', 'c e m i g'],
      'LIGHT': ['light', 'light sesa'],
      'ENEL': ['enel', 'enel distribuição'],
      'ELETROPAULO': ['eletropaulo', 'aes eletropaulo'],
      'ENERGISA': ['energisa'],
      'ELEKTRO': ['elektro', 'elektro eletricidade'],
      'SABESP': ['sabesp'],
      'CEDAE': ['cedae'],
      'SANEPAR': ['sanepar'],
      'COPASA': ['copasa'],
      'EMBASA': ['embasa'],
      'CAESB': ['caesb'],
      'COMGAS': ['comgas', 'companhia de gás'],
    };

    const lowerText = text.toLowerCase();
    for (const [companyName, keywords] of Object.entries(companies)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          data.company = companyName;
          break;
        }
      }
      if (data.company) break;
    }

    return data;
  }

  /**
   * Formata código de barras para exibição legível
   */
  formatBarcode(barcode: string): string {
    if (!barcode) return '';
    
    // Remover formatação existente
    const clean = barcode.replace(/[^\d]/g, '');
    
    // Formatar linha digitável (47-48 dígitos)
    if (clean.length === 47 || clean.length === 48) {
      // Formato: XXXXX.XXXXX XXXXX.XXXXXX XXXXX.XXXXXX X XXXXXXXXXXXXXXXX
      const formatted = clean.replace(
        /(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
        '$1.$2 $3.$4 $5.$6 $7 $8'
      );
      return formatted;
    }
    
    // Se não conseguir formatar, retornar com espaços a cada 4 dígitos (facilita leitura)
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  }

  /**
   * Identifica o tipo de conta baseado no texto extraído
   */
  identifyBillType(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Palavras-chave para ENERGIA ELÉTRICA (mais abrangente)
    const electricityKeywords = [
      'energia', 'eletric', 'kwh', 'kw/h', 'consumo de energia',
      'cpfl', 'cemig', 'light', 'enel', 'eletropaulo', 'energisa', 'elektro',
      'distribuidora de energia', 'fornecimento de energia'
    ];
    
    // Palavras-chave para ÁGUA
    const waterKeywords = [
      'água', 'agua', 'saneamento', 'abastecimento',
      'sabesp', 'cedae', 'sanepar', 'copasa', 'embasa', 'caesb',
      'm³', 'm3', 'metro cúbico'
    ];
    
    // Palavras-chave para GÁS
    const gasKeywords = [
      'gás', 'gas', 'comgas', 'companhia de gás',
      'gás natural', 'gas natural'
    ];
    
    // Palavras-chave para INTERNET
    const internetKeywords = [
      'internet', 'banda larga', 'fibra', 'wi-fi', 'wifi',
      'provedor', 'mega', 'mbps', 'gb'
    ];
    
    // Palavras-chave para TELEFONE
    const phoneKeywords = [
      'telefon', 'celular', 'mobile', 'tim', 'vivo', 'claro', 'oi',
      'linha telefônica', 'serviços de telefonia'
    ];
    
    if (electricityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'ELECTRICITY';
    }
    
    if (waterKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'WATER';
    }
    
    if (gasKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'GAS';
    }
    
    if (internetKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'INTERNET';
    }
    
    if (phoneKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'PHONE';
    }
    
    return 'OTHER';
  }
}

export default new OCRService();

