 // Optional NLP deps are loaded lazily in the constructor to avoid startup failures.

class ReceiptProcessor {
  constructor() {
    // Lazy/optional NLP dependencies
    try {
      this.natural = require('natural');
    } catch (e) {
      this.natural = null;
      console.warn('Optional dependency "natural" not installed; using basic tokenizer/stemmer');
    }

    try {
      this.nlp = require('compromise');
    } catch (e) {
      this.nlp = null;
      console.warn('Optional dependency "compromise" not installed; using regex-based vendor extraction');
    }

    this.tokenizer = this.natural
      ? new this.natural.WordTokenizer()
      : { tokenize: (t) => String(t || '').split(/\s+/) };

    this.stemmer = this.natural
      ? this.natural.PorterStemmer
      : { stem: (w) => w };
  }

  // Main method to process OCR text and extract receipt data
  async processReceiptText(ocrText) {
    try {
      // Clean and normalize the text
      const cleanedText = this.cleanText(ocrText);

      // Extract vendor information
      const vendor = this.extractVendor(cleanedText);

      // Extract total amount
      const amount = this.extractAmount(cleanedText);

      // Extract date
      const date = this.extractDate(cleanedText);

      // Extract items (if available)
      const items = this.extractItems(cleanedText);

      // Categorize the expense
      const category = this.categorizeExpense(vendor, items);

      return {
        vendor,
        amount,
        date,
        items,
        category,
        confidence: this.calculateConfidence(vendor, amount, date),
        rawText: cleanedText
      };
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw new Error('Failed to process receipt text');
    }
  }

  // Clean and normalize OCR text
  cleanText(text) {
    return text
      .replace(/[^\w\s.,\-\/]/g, ' ') // Remove special characters except common ones
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/(\d)\s*,\s*(\d)/g, '$1$2') // Fix number formatting
      .trim();
  }

  // Extract vendor/store name
  extractVendor(text) {
    const doc = this.nlp ? this.nlp(text) : null;

    // Look for organization names
    const organizations = doc ? doc.organizations().out('array') : [];

    // Look for proper nouns that might be business names
    const properNouns = doc ? doc.match('#ProperNoun+').out('array') : [];

    // Common vendor patterns
    const vendorPatterns = [
      /(?:from|at|store|shop|restaurant|cafe|hotel|supermarket|mart|grocery|pharmacy|gas|station)\s*:\s*([A-Za-z\s&]+?)(?:\s|$|total|amount|date)/i,
      /^([A-Z][A-Za-z\s&]+?)(?:\s|$|total|amount|date)/m,
      /([A-Za-z\s&]+?)(?:\s+total|\s+amount|\s+date|\s+\$|\s+kes|\s+sh)/i
    ];

    for (const pattern of vendorPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
        return match[1].trim();
      }
    }

    // Fallback to organizations or proper nouns
    if (organizations.length > 0) {
      return organizations[0];
    }

    if (properNouns.length > 0) {
      return properNouns.slice(0, 3).join(' ');
    }

    // Last resort: first line or first meaningful words
    const lines = text.split('\n').filter(line => line.trim().length > 3);
    if (lines.length > 0) {
      return lines[0].substring(0, 30).trim();
    }

    return 'Unknown Vendor';
  }

  // Extract total amount
  extractAmount(text) {
    // Multiple regex patterns to find amounts
    const amountPatterns = [
      /(?:total|amount|sum|grand total|balance due|you owe|pay|kes|sh|ksh)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(?:total|amount|sum)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:kes|sh|ksh|$)/gi,
      /\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:kes|sh|ksh|$)/gi
    ];

    const candidates = [];

    for (const pattern of amountPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0 && amount < 1000000) { // Reasonable amount limits
          candidates.push(amount);
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Return the highest amount (usually the total)
    return Math.max(...candidates);
  }

  // Extract date from receipt
  extractDate(text) {
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
      /(?:date|time)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(?:date|time)\s*:?\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/gi
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          // Try to parse the date
          const dateStr = match[0];
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Default to current date if no date found
    return new Date();
  }

  // Extract items from receipt (basic implementation)
  extractItems(text) {
    const lines = text.split('\n');
    const items = [];

    for (const line of lines) {
      // Look for lines that might contain item descriptions and prices
      const itemMatch = line.match(/^(.+?)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)$/);
      if (itemMatch) {
        const description = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2].replace(/,/g, ''));

        if (description.length > 2 && price > 0 && price < 100000) {
          items.push({
            description,
            amount: price
          });
        }
      }
    }

    return items;
  }

  // Categorize expense based on vendor and items
  categorizeExpense(vendor, items) {
    const text = (vendor + ' ' + items.map(item => item.description).join(' ')).toLowerCase();

    const categories = {
      'Food & Dining': ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'chicken', 'coffee', 'tea', 'bakery', 'deli'],
      'Groceries': ['supermarket', 'grocery', 'mart', 'shoprite', 'nakumatt', 'tuskys', 'quickmart'],
      'Transportation': ['gas', 'fuel', 'petrol', 'station', 'taxi', 'uber', 'matatu', 'bus'],
      'Healthcare': ['pharmacy', 'hospital', 'clinic', 'medical', 'pharma', 'chemist'],
      'Entertainment': ['cinema', 'movie', 'theater', 'game', 'park', 'museum'],
      'Shopping': ['mall', 'store', 'shop', 'boutique', 'clothing', 'shoes', 'electronics'],
      'Utilities': ['electricity', 'water', 'internet', 'phone', 'airtime', 'utility'],
      'Education': ['school', 'university', 'college', 'book', 'stationery']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  // Calculate confidence score for extraction
  calculateConfidence(vendor, amount, date) {
    let confidence = 0;

    if (vendor && vendor !== 'Unknown Vendor') confidence += 30;
    if (amount && amount > 0) confidence += 40;
    if (date) confidence += 20;

    // Additional checks
    if (vendor && vendor.length > 3) confidence += 5;
    if (amount && amount < 100000) confidence += 5;

    return Math.min(confidence, 100);
  }

  // Match receipt to existing transaction
  async matchToTransaction(receiptData, userId) {
    const { Transaction } = require('../models');

    // Find transactions within a date range and amount tolerance
    const dateTolerance = 7 * 24 * 60 * 60 * 1000; // 7 days
    const amountTolerance = 0.1; // 10% tolerance

    const startDate = new Date(receiptData.date.getTime() - dateTolerance);
    const endDate = new Date(receiptData.date.getTime() + dateTolerance);

    const potentialMatches = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
      amount: {
        $gte: receiptData.amount * (1 - amountTolerance),
        $lte: receiptData.amount * (1 + amountTolerance)
      }
    });

    if (potentialMatches.length === 0) {
      return null;
    }

    // Return the closest match
    return potentialMatches[0];
  }

  // Process receipt and create/update transaction
  async processAndSaveReceipt(ocrText, userId, receiptData = null) {
    const processedData = await this.processReceiptText(ocrText);

    // Try to match with existing transaction
    const matchedTransaction = await this.matchToTransaction(processedData, userId);

    if (matchedTransaction) {
      // Update existing transaction with receipt data
      matchedTransaction.description = processedData.vendor;
      matchedTransaction.tag = processedData.category;
      matchedTransaction.receiptData = processedData;
      await matchedTransaction.save();

      return {
        action: 'updated',
        transaction: matchedTransaction,
        receiptData: processedData
      };
    } else {
      // Create new transaction
      const { Transaction } = require('../models');

      const newTransaction = new Transaction({
        user: userId,
        type: 'expense',
        amount: processedData.amount,
        description: processedData.vendor,
        tag: processedData.category,
        date: processedData.date,
        receiptData: processedData
      });

      await newTransaction.save();

      return {
        action: 'created',
        transaction: newTransaction,
        receiptData: processedData
      };
    }
  }
}

module.exports = new ReceiptProcessor();