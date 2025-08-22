// MMPI Sonuç Adaptörü - İç format ile UI format arası dönüşüm
import { MMPIResults } from './mmpiScoring';
import { TestSonucu } from '@/types';

// UI için mevcut TestSonucu.mmpiSonuclari formatı ile uyumlu tip
export interface MMPIOlcekSonucuTR {
  hammaddePuan: number;
  tSkoru: number;
  durum: 'gecerli' | 'sınırda' | 'gecersiz';
  seviye: 'normal' | 'yükseltilmiş' | 'klinik';
}

export interface MMPISonuclariTR {
  gecerlikOlcekleri: Record<string, MMPIOlcekSonucuTR>;
  klinikOlcekler: Record<string, MMPIOlcekSonucuTR>;
  profilKodu: string;
  gecerlikDurumu: 'gecerli' | 'sınırlı' | 'gecersiz';
  uygulanabilirYorumlar: string[];
  riskDeğerlendirmesi: {
    genel: 'düşük' | 'orta' | 'yüksek';
    alanlar: Record<string, string>;
  };
}

/**
 * MMPIResults -> TestSonucu.mmpiSonuclari formatına dönüştür
 */
export function toPublicResults(results: MMPIResults): TestSonucu['mmpiSonuclari'] {
  // Geçerlik ölçekleri (sadece hammaddePuan, tSkoru, durum)
  const gecerlikOlcekleri: TestSonucu['mmpiSonuclari']['gecerlikOlcekleri'] = {};
  for (const [key, val] of Object.entries(results.validityScales)) {
    gecerlikOlcekleri[key] = {
      hammaddePuan: val.rawScore,
      tSkoru: val.tScore,
      durum: val.validity === 'valid' ? 'gecerli' : val.validity === 'borderline' ? 'sınırda' : 'gecersiz'
    };
  }

  // Klinik ölçekler (hammaddePuan, tSkoru, seviye)
  const klinikOlcekler: TestSonucu['mmpiSonuclari']['klinikOlcekler'] = {};
  for (const [key, val] of Object.entries(results.clinicalScales)) {
    klinikOlcekler[key] = {
      hammaddePuan: val.rawScore,
      tSkoru: val.tScore,
      seviye: val.level === 'normal' ? 'normal' : val.level === 'elevated' ? 'yükseltilmiş' : 'klinik'
    };
  }

  return {
    gecerlikOlcekleri,
    klinikOlcekler,
    profilKodu: results.profileCode,
    gecerlikDurumu: results.validityStatus === 'valid' ? 'gecerli' : results.validityStatus === 'limited' ? 'sınırlı' : 'gecersiz',
    uygulanabilirYorumlar: [], // generateMMPISummary tarafından doldurulacak
    riskDeğerlendirmesi: {
      genel: results.riskAssessment.overall === 'low' ? 'düşük' : results.riskAssessment.overall === 'moderate' ? 'orta' : 'yüksek',
      alanlar: results.riskAssessment.areas
    }
  };
}

/**
 * TestSonucu.mmpiSonuclari formatından MMPIResults'a dönüştür
 */
export function fromPublicResults(publicResults: TestSonucu['mmpiSonuclari']): MMPIResults {
  if (!publicResults) {
    throw new Error('MMPI sonuçları bulunamadı');
  }
  const validityScales: MMPIResults['validityScales'] = {};
  for (const [key, val] of Object.entries(publicResults.gecerlikOlcekleri)) {
    validityScales[key] = {
      rawScore: val.hammaddePuan,
      tScore: val.tSkoru,
      validity: val.durum === 'gecerli' ? 'valid' : val.durum === 'sınırda' ? 'borderline' : 'invalid',
      level: 'normal' // Geçerlik ölçeklerinde level'i normal olarak sabit tutalım
    };
  }

  const clinicalScales: MMPIResults['clinicalScales'] = {};
  for (const [key, val] of Object.entries(publicResults.klinikOlcekler)) {
    clinicalScales[key] = {
      rawScore: val.hammaddePuan,
      tScore: val.tSkoru,
      validity: 'valid', // Klinik ölçeklerde validity'yi valid olarak sabit tutalım
      level: val.seviye === 'normal' ? 'normal' : val.seviye === 'yükseltilmiş' ? 'elevated' : 'clinical'
    };
  }

  return {
    validityScales,
    clinicalScales,
    profileCode: publicResults.profilKodu,
    validityStatus: publicResults.gecerlikDurumu === 'gecerli' ? 'valid' : publicResults.gecerlikDurumu === 'sınırlı' ? 'limited' : 'invalid',
    overallValidity: publicResults.gecerlikDurumu === 'gecerli' ? 'valid' : publicResults.gecerlikDurumu === 'sınırlı' ? 'limited' : 'invalid',
    riskAssessment: {
      overall: publicResults.riskDeğerlendirmesi.genel === 'düşük' ? 'low' : publicResults.riskDeğerlendirmesi.genel === 'orta' ? 'moderate' : 'high',
      areas: publicResults.riskDeğerlendirmesi.alanlar
    }
  };
}