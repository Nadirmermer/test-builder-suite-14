// Client-side data encryption utilities
// For sensitive data protection in localStorage and IndexedDB

class DataEncryption {
  private key: string;

  constructor() {
    // Get or create encryption key
    this.key = this.getOrCreateKey();
  }

  private getOrCreateKey(): string {
    const stored = localStorage.getItem('app_key');
    if (stored) {
      return stored;
    }
    
    // Generate a simple key based on device characteristics
    const key = this.generateKey();
    localStorage.setItem('app_key', key);
    return key;
  }

  private generateKey(): string {
    // Simple key generation for client-side use
    const factors = [
      navigator.userAgent.slice(0, 20),
      screen.width.toString(),
      screen.height.toString(),
      new Date().getTimezoneOffset().toString(),
    ];
    
    return btoa(factors.join('|')).replace(/[^A-Za-z0-9]/g, '').slice(0, 32);
  }

  // Simple XOR encryption (not cryptographically secure, but obfuscates data)
  encrypt(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.key.charCodeAt(i % this.key.length);
      const dataChar = data.charCodeAt(i);
      result += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(result);
  }

  decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      let result = '';
      for (let i = 0; i < data.length; i++) {
        const keyChar = this.key.charCodeAt(i % this.key.length);
        const dataChar = data.charCodeAt(i);
        result += String.fromCharCode(dataChar ^ keyChar);
      }
      return result;
    } catch (error) {
      console.warn('Decryption failed, returning empty string');
      return '';
    }
  }

  // Encrypt sensitive fields in objects
  encryptSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveFields = ['tcKimlikNo', 'telefon', 'email', 'adres'];
    const result = { ...obj };

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.encrypt(result[field]);
      }
    }

    return result;
  }

  // Decrypt sensitive fields in objects
  decryptSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveFields = ['tcKimlikNo', 'telefon', 'email', 'adres'];
    const result = { ...obj };

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.decrypt(result[field]);
      }
    }

    return result;
  }
}

export const dataEncryption = new DataEncryption();