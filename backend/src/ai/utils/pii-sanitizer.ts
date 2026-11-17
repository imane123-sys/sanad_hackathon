export interface SanitizationResult {
  sanitizedText: string;
  hasRedactions: boolean;
  redactedTypes: string[];
}

export class PiiSanitizer {
  // Moroccan National Identity Card (CIN): 1-2 letters + 5-7 digits (e.g. AB123456, K98765)
  private static readonly CIN_REGEX = /\b[A-Za-z]{1,2}\s?[0-9]{5,7}\b/g;

  // Moroccan Phone Numbers: +2126..., +2127..., 06..., 07..., 05...
  private static readonly PHONE_REGEX = /(?:\+212|00212|0)[5-7][0-9]{8}\b/g;

  // Email addresses
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Credit Card Numbers
  private static readonly CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

  // Common Moroccan street address patterns (Rue, Bd, Derb, Hay, Zenqa...)
  private static readonly ADDRESS_REGEX =
    /\b(?:\d+[\s,]+)?(?:rue|avenue|boulevard|bd|derb|hay|zenqa|quartier|lotissement)\s+[\w\s]{3,30}\b/gi;

  /**
   * Minimizes and redacts personal data before forwarding text to an external LLM provider.
   */
  public static sanitize(text: string): SanitizationResult {
    if (!text) {
      return { sanitizedText: '', hasRedactions: false, redactedTypes: [] };
    }

    let sanitized = text;
    const redactedTypes: string[] = [];

    if (this.EMAIL_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.EMAIL_REGEX, '[EMAIL_CONFIDENTIEL]');
      redactedTypes.push('EMAIL');
    }

    if (this.PHONE_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.PHONE_REGEX, '[TEL_CONFIDENTIEL]');
      redactedTypes.push('PHONE');
    }

    if (this.CIN_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.CIN_REGEX, '[CIN_CONFIDENTIEL]');
      redactedTypes.push('CIN');
    }

    if (this.CARD_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.CARD_REGEX, '[CARTE_CONFIDENTIELLE]');
      redactedTypes.push('FINANCIAL');
    }

    if (this.ADDRESS_REGEX.test(sanitized)) {
      sanitized = sanitized.replace(this.ADDRESS_REGEX, '[ADRESSE_CONFIDENTIELLE]');
      redactedTypes.push('ADDRESS');
    }

    return {
      sanitizedText: sanitized,
      hasRedactions: redactedTypes.length > 0,
      redactedTypes,
    };
  }
}
