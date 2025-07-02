export interface TextProcessingResult {
  data: Record<string, any>[];
  columns: string[];
  columnTypes: Record<string, string>;
  metadata: {
    totalWords: number;
    totalSentences: number;
    totalParagraphs: number;
    processingMethod: string;
  };
}

export class TextProcessor {
  /**
   * Process plain text and extract structured data
   */
  static async processText(text: string): Promise<TextProcessingResult> {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try different processing methods based on text structure
    if (this.looksLikeTable(lines)) {
      return this.processAsTable(lines);
    } else if (this.looksLikeList(lines)) {
      return this.processAsList(lines);
    } else if (this.looksLikeJSON(text)) {
      return this.processAsJSON(text);
    } else {
      return this.processAsStructuredText(text);
    }
  }

  /**
   * Check if the text looks like a table (has consistent delimiters)
   */
  private static looksLikeTable(lines: string[]): boolean {
    if (lines.length < 2) return false;
    
    const firstLine = lines[0];
    const delimiters = [',', '\t', '|', ';'];
    
    for (const delimiter of delimiters) {
      const parts = firstLine.split(delimiter);
      if (parts.length >= 2) {
        // Check if other lines have similar structure
        const consistentStructure = lines.slice(1, Math.min(5, lines.length))
          .every(line => line.split(delimiter).length === parts.length);
        if (consistentStructure) return true;
      }
    }
    
    return false;
  }

  /**
   * Check if the text looks like a list
   */
  private static looksLikeList(lines: string[]): boolean {
    const listPatterns = [
      /^\d+\./, // numbered list
      /^[-*•]/, // bullet points
      /^[a-zA-Z]\./, // lettered list
    ];
    
    return lines.some(line => 
      listPatterns.some(pattern => pattern.test(line.trim()))
    );
  }

  /**
   * Check if the text looks like JSON
   */
  private static looksLikeJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Process text as a table (CSV-like format)
   */
  private static processAsTable(lines: string[]): TextProcessingResult {
    const text = lines.join('\n');
    const firstLine = lines[0];
    let delimiter = ',';
    
    // Detect delimiter
    const delimiters = [',', '\t', '|', ';'];
    for (const delim of delimiters) {
      const parts = firstLine.split(delim);
      if (parts.length >= 2) {
        delimiter = delim;
        break;
      }
    }

    const headers = firstLine.split(delimiter).map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      return row;
    });

    const columnTypes = this.inferColumnTypes(data, headers);

    return {
      data,
      columns: headers,
      columnTypes,
      metadata: {
        totalWords: text.split(/\s+/).length,
        totalSentences: text.split(/[.!?]+/).length,
        totalParagraphs: lines.length,
        processingMethod: 'table'
      }
    };
  }

  /**
   * Process text as a list
   */
  private static processAsList(lines: string[]): TextProcessingResult {
    const data = lines.map((line, index) => {
      const cleanLine = line.replace(/^[\d\-*•\s]+/, '').trim();
      return {
        id: index + 1,
        item: cleanLine,
        original: line.trim()
      };
    });

    return {
      data,
      columns: ['id', 'item', 'original'],
      columnTypes: { id: 'number', item: 'string', original: 'string' },
      metadata: {
        totalWords: lines.join(' ').split(/\s+/).length,
        totalSentences: lines.length,
        totalParagraphs: lines.length,
        processingMethod: 'list'
      }
    };
  }

  /**
   * Process text as JSON
   */
  private static processAsJSON(text: string): TextProcessingResult {
    const jsonData = JSON.parse(text);
    let data: Record<string, any>[];
    let columns: string[];

    if (Array.isArray(jsonData)) {
      data = jsonData;
      columns = data.length > 0 ? Object.keys(data[0]) : [];
    } else {
      data = [jsonData];
      columns = Object.keys(jsonData);
    }

    const columnTypes = this.inferColumnTypes(data, columns);

    return {
      data,
      columns,
      columnTypes,
      metadata: {
        totalWords: text.split(/\s+/).length,
        totalSentences: 1,
        totalParagraphs: 1,
        processingMethod: 'json'
      }
    };
  }

  /**
   * Process unstructured text and extract meaningful data
   */
  private static processAsStructuredText(text: string): TextProcessingResult {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Extract entities and patterns
    const entities = this.extractEntities(text);
    const patterns = this.extractPatterns(text);

    const data = [
      {
        text_length: text.length,
        word_count: words.length,
        sentence_count: sentences.length,
        paragraph_count: paragraphs.length,
        avg_sentence_length: words.length / sentences.length,
        unique_words: new Set(words).size,
        ...entities,
        ...patterns
      }
    ];

    const columns = Object.keys(data[0]);
    const columnTypes = this.inferColumnTypes(data, columns);

    return {
      data,
      columns,
      columnTypes,
      metadata: {
        totalWords: words.length,
        totalSentences: sentences.length,
        totalParagraphs: paragraphs.length,
        processingMethod: 'structured_text'
      }
    };
  }

  /**
   * Extract common entities from text
   */
  private static extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Email addresses
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    entities.email_count = emails.length;
    entities.emails = emails.join(', ');

    // Phone numbers
    const phones = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    entities.phone_count = phones.length;
    entities.phones = phones.join(', ');

    // URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    entities.url_count = urls.length;
    entities.urls = urls.join(', ');

    // Numbers
    const numbers = text.match(/\b\d+(?:\.\d+)?\b/g) || [];
    entities.number_count = numbers.length;
    entities.numbers = numbers.join(', ');

    // Dates
    const dates = text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g) || [];
    entities.date_count = dates.length;
    entities.dates = dates.join(', ');

    return entities;
  }

  /**
   * Extract common patterns from text
   */
  private static extractPatterns(text: string): Record<string, any> {
    const patterns: Record<string, any> = {};

    // Hashtags
    const hashtags = text.match(/#\w+/g) || [];
    patterns.hashtag_count = hashtags.length;
    patterns.hashtags = hashtags.join(', ');

    // Mentions
    const mentions = text.match(/@\w+/g) || [];
    patterns.mention_count = mentions.length;
    patterns.mentions = mentions.join(', ');

    // Capitalized words (potential proper nouns)
    const capitalized = text.match(/\b[A-Z][a-z]+\b/g) || [];
    patterns.capitalized_count = capitalized.length;
    patterns.capitalized_words = capitalized.join(', ');

    // All caps words
    const allCaps = text.match(/\b[A-Z]{2,}\b/g) || [];
    patterns.all_caps_count = allCaps.length;
    patterns.all_caps_words = allCaps.join(', ');

    return patterns;
  }

  /**
   * Infer column types from data
   */
  private static inferColumnTypes(data: Record<string, any>[], columns: string[]): Record<string, string> {
    const columnTypes: Record<string, string> = {};

    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length === 0) {
        columnTypes[column] = 'string';
        return;
      }

      // Check if all values are numbers
      const allNumbers = values.every(v => !isNaN(Number(v)) && v !== '');
      if (allNumbers) {
        columnTypes[column] = 'number';
        return;
      }

      // Check if all values are booleans
      const allBooleans = values.every(v => 
        typeof v === 'boolean' || 
        v.toLowerCase() === 'true' || 
        v.toLowerCase() === 'false'
      );
      if (allBooleans) {
        columnTypes[column] = 'boolean';
        return;
      }

      // Default to string
      columnTypes[column] = 'string';
    });

    return columnTypes;
  }
} 