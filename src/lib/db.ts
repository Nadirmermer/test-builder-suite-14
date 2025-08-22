// Dexie.js veritabanı yapılandırması - IndexedDB ile offline storage

import Dexie, { Table } from 'dexie';
import { Danisan, TestSonucu } from '@/types';

export class PsikoTestDB extends Dexie {
  danisanlar!: Table<Danisan>;
  testSonuclari!: Table<TestSonucu>;

  constructor() {
    super('PsikoTestDB');
    
    this.version(1).stores({
      danisanlar: '++id, adSoyad, tcKimlikNo, eklenmeTarihi',
      testSonuclari: '++id, danisanId, testId, tamamlanmaTarihi, puan'
    });
  }
}

// Veritabanı örneği
export const db = new PsikoTestDB();

// Danışan CRUD işlemleri
export const danisanService = {
  async ekle(danisan: Omit<Danisan, 'id'>): Promise<number> {
    return await db.danisanlar.add(danisan);
  },

  async tumunuGetir(): Promise<Danisan[]> {
    const danisanlar = await db.danisanlar.orderBy('eklenmeTarihi').reverse().toArray();
    // Ensure dates are properly converted to Date objects
    return danisanlar.map(danisan => ({
      ...danisan,
      eklenmeTarihi: danisan.eklenmeTarihi instanceof Date ? danisan.eklenmeTarihi : new Date(danisan.eklenmeTarihi),
      dogumTarihi: danisan.dogumTarihi ? (typeof danisan.dogumTarihi === 'string' ? danisan.dogumTarihi : danisan.dogumTarihi) : undefined
    }));
  },

  async getir(id: number): Promise<Danisan | undefined> {
    return await db.danisanlar.get(id);
  },

  async guncelle(id: number, danisan: Partial<Danisan>): Promise<void> {
    await db.danisanlar.update(id, danisan);
  },

  async sil(id: number): Promise<void> {
    // Önce danışanın tüm test sonuçlarını sil
    await db.testSonuclari.where('danisanId').equals(id).delete();
    // Sonra danışanı sil
    await db.danisanlar.delete(id);
  }
};

// Test sonucu CRUD işlemleri
export const testSonucuService = {
  async ekle(testSonucu: Omit<TestSonucu, 'id'>): Promise<number> {
    return await db.testSonuclari.add(testSonucu);
  },

  async danisanSonuclari(danisanId: number): Promise<TestSonucu[]> {
    return await db.testSonuclari
      .where('danisanId')
      .equals(danisanId)
      .reverse()
      .sortBy('tamamlanmaTarihi');
  },

  async getir(id: number): Promise<TestSonucu | undefined> {
    return await db.testSonuclari.get(id);
  },

  async sil(id: number): Promise<void> {
    await db.testSonuclari.delete(id);
  }
};