// Test yönetimi için Redux slice

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestTanimi, TestSonucu, TestOturumu } from '@/types';
import { testSonucuService } from '@/lib/db';

interface TestState {
  mevcutTestler: TestTanimi[];
  testSonuclari: TestSonucu[];
  aktifOturum: TestOturumu | null;
  loading: boolean;
  error: string | null;
}

const initialState: TestState = {
  mevcutTestler: [],
  testSonuclari: [],
  aktifOturum: null,
  loading: false,
  error: null,
};

// Test tanımlarını yükle (public/tests klasöründen + MMPI)
export const testleriYukle = createAsyncThunk(
  'testler/yukle',
  async () => {
    try {
      // Önce test listesini al
      const response = await fetch('/tests/test-list.json');
      const testListesi = await response.json();
      
      // Public klasöründen normal testleri yükle
      const testler: TestTanimi[] = [];
      for (const testDosyasi of testListesi.tests) {
        const testResponse = await fetch(`/tests/${testDosyasi}`);
        const test = await testResponse.json();
        testler.push(test);
      }
      
      // MMPI testini ayrı olarak ekle (lib'den import)
      const { mmpiQuestions } = await import('@/lib/mmpi/mmpiData');
      const mmpiTest: TestTanimi = {
        id: 'mmpi',
        testAdi: 'MMPI Minnesota Çok Yönlü Kişilik Envanteri',
        kisaAciklama: 'Minnesota Çok Yönlü Kişilik Envanteri - 566 soruluk kapsamlı kişilik değerlendirmesi',
        talimatlar: 'Her ifadeyi dikkatlice okuyun ve kendiniz için "DOĞRU" mu yoksa "YANLIŞ" mı olduğuna karar verin.',
        kategori: 'Kişilik',
        sureDakika: 90,
        sorular: mmpiQuestions.map(q => ({
          id: q.id,
          metin: q.metin,
          secenekler: [...q.secenekler]
        })),
        sonucYorumlari: [],
        puanlamaTuru: 'mmpi-profil'
      };
      
      testler.push(mmpiTest);
      
      return testler;
    } catch (error) {
      throw new Error('Test dosyaları yüklenirken hata oluştu');
    }
  }
);

// Danışan test sonuçlarını yükle
export const danisanTestSonuclari = createAsyncThunk(
  'testler/danisanSonuclari',
  async (danisanId: number) => {
    return await testSonucuService.danisanSonuclari(danisanId);
  }
);

// Test sonucu kaydet
export const testSonucuKaydet = createAsyncThunk(
  'testler/sonucKaydet',
  async (testSonucu: Omit<TestSonucu, 'id'>) => {
    const id = await testSonucuService.ekle(testSonucu);
    return { ...testSonucu, id };
  }
);

const testSlice = createSlice({
  name: 'testler',
  initialState,
  reducers: {
    testOturumuBaslat: (state, action: PayloadAction<TestOturumu>) => {
      state.aktifOturum = action.payload;
    },
    
    cevapGuncelle: (state, action: PayloadAction<{ soruId: string; puan: number }>) => {
      if (state.aktifOturum) {
        state.aktifOturum.cevaplar[action.payload.soruId] = action.payload.puan;
      }
    },
    
    soruIndexGuncelle: (state, action: PayloadAction<number>) => {
      if (state.aktifOturum) {
        state.aktifOturum.aktifSoruIndex = action.payload;
      }
    },
    
    testOturumuBitir: (state) => {
      state.aktifOturum = null;
    },
    
    errorTemizle: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Testleri yükle
      .addCase(testleriYukle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testleriYukle.fulfilled, (state, action) => {
        state.loading = false;
        state.mevcutTestler = action.payload;
      })
      .addCase(testleriYukle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Testler yüklenirken hata oluştu';
      })
      
      // Danışan test sonuçları
      .addCase(danisanTestSonuclari.fulfilled, (state, action) => {
        state.testSonuclari = action.payload;
      })
      
      // Test sonucu kaydet
      .addCase(testSonucuKaydet.fulfilled, (state, action) => {
        state.testSonuclari.unshift(action.payload as TestSonucu);
      });
  },
});

export const {
  testOturumuBaslat,
  cevapGuncelle,
  soruIndexGuncelle,
  testOturumuBitir,
  errorTemizle,
} = testSlice.actions;

export default testSlice.reducer;