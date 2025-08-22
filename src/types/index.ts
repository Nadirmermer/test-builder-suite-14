// Temel veri modelleri - Core data models for PsikoTest

export interface Danisan {
  id?: number; // Auto-incremented by Dexie
  adSoyad: string;
  tcKimlikNo?: string;
  dogumTarihi?: string;
  cinsiyet?: 'Erkek' | 'Kadın' | 'Belirtmek istemiyorum';
  telefon?: string;
  adres?: string;
  notlar?: string;
  eklenmeTarihi: Date;
}

export interface TestSonucu {
  id?: number;
  danisanId: number;
  testId: string; // e.g., "bde-01"
  testAdi: string;
  tamamlanmaTarihi: Date;
  puan: number;
  sonucYorumu: string;
  cevaplar: { soruId: string; verilenPuan: number }[];
  altOlcekPuanlari?: Record<string, {
    toplamPuan: number;
    ortalamaPuan: number;
    ad: string;
    baskın?: boolean;
  }>;
  // MMPI özel sonuç alanları
  mmpiSonuclari?: {
    gecerlikOlcekleri: Record<string, {
      hammaddePuan: number;
      tSkoru: number;
      durum: 'gecerli' | 'sınırda' | 'gecersiz';
    }>;
    klinikOlcekler: Record<string, {
      hammaddePuan: number;
      tSkoru: number;
      seviye: 'normal' | 'yükseltilmiş' | 'klinik';
    }>;
    profilKodu: string;
    gecerlikDurumu: 'gecerli' | 'sınırlı' | 'gecersiz';
    uygulanabilirYorumlar: string[];
    riskDeğerlendirmesi: {
      genel: 'düşük' | 'orta' | 'yüksek';
      alanlar: Record<string, string>;
    };
  };
}

// Test tanımlama için JSON şeması
export interface TestTanimi {
  id: string;
  testAdi: string;
  kisaAciklama: string;
  talimatlar: string;
  sorular: TestSorusu[];
  sonucYorumlari: SonucYorumu[];
  grafikTanimlari?: GrafikTanimi | null;
  kategori?: string;
  anahtar_kelimeler?: string[];
  sureDakika?: number;
  formTuru?: 'standart' | 'cinsiyete-ozel' | 'mmpi-profil';
  puanlamaTuru?: 'basit' | 'cinsiyete-ozel' | 'gorusmeci-degerlendirmesi' | 'coklu_alt_olcek' | 'mmpi-profil';
  formlar?: {
    Kadın?: TestSorusu[];
    Erkek?: TestSorusu[];
  };
  altOlcekler?: Record<string, AltOlcek>;
  puanlamaAnahtari?: Record<string, { dogru?: number[]; yanlis?: number[] }>;
  k_duzeltmesi?: Record<string, number>;
  t_skoru_tablolari?: {
    Erkek: Record<string, Record<string, number>>;
    Kadin: Record<string, Record<string, number>>;
  };
  // MMPI özel alanları
  mmpiYapilandirmasi?: {
    gecerlikOlcekleri: Record<string, MMPIOlcek>;
    klinikOlcekler: Record<string, MMPIOlcek>;
    normTablolari: MMPINormTablosu[];
    yorumKurallari: MMPIYorumKurali[];
    profilGrafigi: MMPIProfilAyarlari;
  };
}

export interface AltOlcek {
  ad: string;
  sorular: string[];
}

// MMPI özel tip tanımları
export interface MMPIOlcek {
  ad: string;
  kisaAd: string;
  aciklama: string;
  sorular: string[];
  puanlamaYontemi: 'dogru-yanlis' | 'yanlis-dogru' | 'karma';
  kritikSeviye?: number;
}

export interface MMPINormTablosu {
  cinsiyet: 'Erkek' | 'Kadin';
  yasAraligi: [number, number];
  olcek: string;
  hammaddenTSkoruTablosu: Record<number, number>;
}

export interface MMPIYorumKurali {
  id: string;
  kosul: string; // JavaScript expression olarak değerlendirilecek
  oncelik: number;
  yorum: string;
  kategori: 'genel' | 'gecerlik' | 'klinik' | 'profil';
}

export interface MMPIProfilAyarlari {
  tip: 'profil-grafigi';
  baslik: string;
  gecerlikOlcekleriGoster: boolean;
  klinikOlcekleriGoster: boolean;
  tSkoruSiniri: number;
  riskSeviyeSinirlari: {
    dusuk: number;
    orta: number;
    yuksek: number;
  };
}

export interface TestSorusu {
  id: string;
  metin: string;
  secenekler: TestSecenegi[];
}

export interface TestSecenegi {
  metin: string;
  puan: number;
}

export interface SonucYorumu {
  aralik: [number, number];
  yorum: string;
  seviye?: 'minimal' | 'hafif' | 'orta' | 'siddetli';
}

export interface GrafikTanimi {
  tip: 'bar' | 'line' | 'pie';
  baslik: string;
  veriAlanlari: string[];
}

// UI durum modelleri
export interface UIState {
  loading: boolean;
  error: string | null;
  activeModal: string | null;
  darkMode: boolean;
}

// Test uygulama modları
export type TestUygulamaYontemi = 'standart' | 'hizli';

export interface TestOturumu {
  testId: string;
  danisanId: number;
  yontem: TestUygulamaYontemi;
  cevaplar: Record<string, number>;
  aktifSoruIndex: number;
  baslamaTarihi: Date;
  baslangicZamani?: Date; // Add this for backward compatibility
}