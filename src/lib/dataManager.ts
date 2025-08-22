// Veri içe/dışa aktarma ve silme işlemleri

import { db } from './db';
import { Danisan, TestSonucu } from '@/types';

export interface ExportData {
  version: string;
  exportDate: string;
  danisanlar: Danisan[];
  testSonuclari: TestSonucu[];
}

class DataManager {
  // Tüm verileri dışa aktar
  async exportAllData(): Promise<string> {
    try {
      const danisanlar = await db.danisanlar.toArray();
      const testSonuclari = await db.testSonuclari.toArray();

      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        danisanlar,
        testSonuclari,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      throw new Error('Veriler dışa aktarılırken bir hata oluştu');
    }
  }

  // JSON dosyasından veri içe aktar
  async importData(jsonData: string, confirmCallback?: () => Promise<boolean>): Promise<void> {
    try {
      const data: ExportData = JSON.parse(jsonData);
      
      // Veri formatını kontrol et
      if (!data.version || !data.danisanlar || !data.testSonuclari) {
        throw new Error('Geçersiz veri formatı');
      }

      // Kullanıcı onayı kontrolü
      if (confirmCallback) {
        const shouldContinue = await confirmCallback();
        if (!shouldContinue) {
          return;
        }
      }

      // Veritabanını temizle
      await db.transaction('rw', [db.danisanlar, db.testSonuclari], async () => {
        await db.danisanlar.clear();
        await db.testSonuclari.clear();
      });

      // Yeni verileri ekle - dates properly converted
      await db.transaction('rw', [db.danisanlar, db.testSonuclari], async () => {
        // Convert date strings to Date objects for danisanlar
        const danisanlarWithDates = data.danisanlar.map(danisan => ({
          ...danisan,
          eklenmeTarihi: typeof danisan.eklenmeTarihi === 'string' ? new Date(danisan.eklenmeTarihi) : danisan.eklenmeTarihi
        }));
        
        // Convert date strings to Date objects for test sonuclari
        const testSonuclariWithDates = data.testSonuclari.map(sonuc => ({
          ...sonuc,
          tamamlanmaTarihi: typeof sonuc.tamamlanmaTarihi === 'string' ? new Date(sonuc.tamamlanmaTarihi) : sonuc.tamamlanmaTarihi
        }));
        
        await db.danisanlar.bulkAdd(danisanlarWithDates);
        await db.testSonuclari.bulkAdd(testSonuclariWithDates);
      });

      console.log('Veri içe aktarma tamamlandı');
    } catch (error) {
      console.error('Veri içe aktarma hatası:', error);
      throw new Error('Veriler içe aktarılırken bir hata oluştu');
    }
  }

  // Tüm verileri sil
  async clearAllData(confirmCallback?: () => Promise<boolean>): Promise<void> {
    try {
      // Kullanıcı onayı kontrolü
      if (confirmCallback) {
        const shouldContinue = await confirmCallback();
        if (!shouldContinue) {
          return;
        }
      }

      await db.transaction('rw', [db.danisanlar, db.testSonuclari], async () => {
        await db.danisanlar.clear();
        await db.testSonuclari.clear();
      });

      console.log('Tüm veriler silindi');
    } catch (error) {
      console.error('Veri silme hatası:', error);
      throw new Error('Veriler silinirken bir hata oluştu');
    }
  }

  // Dosya indirme yardımcı fonksiyonu
  downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Dosya yükleme yardımcı fonksiyonu
  async uploadFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('Dosya seçilmedi'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => {
          reject(new Error('Dosya okunamadı'));
        };
        reader.readAsText(file);
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  // Veritabanı istatistikleri
  async getStats() {
    try {
      const danisanSayisi = await db.danisanlar.count();
      const testSonucSayisi = await db.testSonuclari.count();
      
      return {
        danisanSayisi,
        testSonucSayisi,
      };
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      return {
        danisanSayisi: 0,
        testSonucSayisi: 0,
      };
    }
  }
}

export const dataManager = new DataManager();