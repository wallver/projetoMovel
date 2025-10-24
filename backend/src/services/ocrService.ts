import * as vision from '@google-cloud/vision';
import Tesseract from 'tesseract.js';

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
   * Processa imagem e extrai texto usando OCR
   */
  async processImage(imageBuffer: Buffer): Promise<OCRResult> {
    let fullText = '';
    let confidence = 0;

    if (this.useLocalOCR) {
      // Usar Tesseract (OCR local)
      const result = await Tesseract.recognize(imageBuffer, 'por', {
        logger: (m) => console.log('Tesseract:', m),
      });
      
      fullText = result.data.text;
      confidence = result.data.confidence;
    } else if (this.visionClient) {
      // Usar Google Vision API
      const [result] = await this.visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      
      if (detections && detections.length > 0) {
        fullText = detections[0].description || '';
        confidence = 90; // Google Vision não retorna confidence para text detection
      }
    } else {
      throw new Error('Nenhum serviço de OCR configurado');
    }

    const lines = fullText.split('\n').filter(line => line.trim().length > 0);
    const detectedData = this.extractBillData(fullText);

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

    // Extrair valor (busca por padrões específicos de contas brasileiras)
    const valuePatterns = [
      // Padrão específico: "Total a pagar", "Valor Total", etc.
      /(?:total\s*a\s*pagar|valor\s*total|total|valor|pagar)[:\s]*R?\$?\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})/gi,
      // Padrão com R$
      /R\$\s*(\d{1,3}(?:[\.,]\d{3})*[,\.]\d{2})/gi,
      // Valores grandes (priorizar valores acima de 10 reais)
      /(\d{2,3}(?:[\.,]\d{3})*[,\.]\d{2})/g,
    ];

    const foundValues: number[] = [];
    
    for (const pattern of valuePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const valueStr = match[1] || match[0];
        // Normalizar: trocar pontos por nada e vírgulas por ponto
        const normalized = valueStr
          .replace(/[^\d,\.]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        
        const value = parseFloat(normalized);
        if (!isNaN(value) && value >= 10 && value < 100000) {
          foundValues.push(value);
        }
      }
    }

    // Pegar o maior valor encontrado (geralmente é o total)
    if (foundValues.length > 0) {
      data.value = Math.max(...foundValues);
    }

    // Extrair data de vencimento (formatos brasileiros)
    const datePatterns = [
      // Com contexto de vencimento
      /(?:vencimento|venc\.?|data\s*venc|pagar\s*até|pagamento)[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}|\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2})/gi,
      // Formato completo DD/MM/YYYY ou DD-MM-YYYY
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/g,
      // Formato curto DD/MM/YY ou DD-MM-YY
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2})/g,
    ];

    const foundDates: Date[] = [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    for (const pattern of datePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const dateStr = match[1] || match[0];
        const cleanDate = dateStr.match(/\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}/);
        
        if (cleanDate) {
          const parts = cleanDate[0].split(/[\/\-\.]/);
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          let year = parseInt(parts[2]);
          
          // Se ano com 2 dígitos, assumir século atual
          if (year < 100) {
            year += 2000;
          }
          
          const date = new Date(year, month - 1, day);
          
          // Validar se a data faz sentido (entre 1 mês atrás e 1 ano no futuro)
          if (!isNaN(date.getTime()) && 
              date >= oneMonthAgo && 
              date <= oneYearFromNow &&
              day >= 1 && day <= 31 &&
              month >= 1 && month <= 12) {
            foundDates.push(date);
          }
        }
      }
    }

    // Priorizar datas futuras (vencimento), pegar a mais próxima
    const futureDates = foundDates.filter(d => d >= now);
    if (futureDates.length > 0) {
      data.dueDate = futureDates.sort((a, b) => a.getTime() - b.getTime())[0];
    } else if (foundDates.length > 0) {
      // Se não houver datas futuras, pegar a mais recente do passado
      data.dueDate = foundDates.sort((a, b) => b.getTime() - a.getTime())[0];
    }

    // Extrair código de barras (vários formatos)
    const barcodePatterns = [
      // Formato com pontos e espaços: 12345.67890 12345.678901 12345.678901 1 12345678901234
      /(\d{5}[\.\s]?\d{5}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d[\s]?\d{14})/g,
      // Formato contínuo: 48 dígitos seguidos
      /(\d{48})/g,
      // Formato de linha digitável
      /(\d{5}[\.\s]?\d{5}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d{5}[\.\s]?\d{6}[\s]?\d[\s]?\d{14})/g,
    ];

    for (const pattern of barcodePatterns) {
      const barcodeMatch = text.match(pattern);
      if (barcodeMatch && barcodeMatch[0]) {
        const cleanBarcode = barcodeMatch[0].replace(/[^\d]/g, '');
        if (cleanBarcode.length >= 44 && cleanBarcode.length <= 48) {
          data.barcode = cleanBarcode;
          break;
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

