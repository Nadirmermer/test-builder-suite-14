// MMPI Puanlama Motoru
// Bu dosya MMPI testinin tüm hesaplama mantığını içerir

import { scoringKeys, kCorrectionFactors, tScoreTables } from './mmpiData';

export interface MMPIScaleResult {
  rawScore: number;
  tScore: number;
  level: 'normal' | 'elevated' | 'clinical';
  validity: 'valid' | 'borderline' | 'invalid';
}

export interface MMPIResults {
  validityScales: Record<string, MMPIScaleResult>;
  clinicalScales: Record<string, MMPIScaleResult>;
  profileCode: string;
  validityStatus: 'valid' | 'limited' | 'invalid';
  overallValidity: 'valid' | 'limited' | 'invalid';
  riskAssessment: {
    overall: 'low' | 'moderate' | 'high';
    areas: Record<string, string>;
  };
}

/**
 * Ham puan hesaplama - cinsiyet-duyarlı
 */
function calculateRawScore(
  scaleId: string,
  answers: Record<string, number>,
  gender?: 'Erkek' | 'Kadin'
): number {
  const scale = scoringKeys[scaleId as keyof typeof scoringKeys];
  if (!scale) return 0;
  
  let score = 0;
  
  // Doğru puanlanan sorular
  if ('dogru' in scale) {
    let trueQuestions;
    
    if (typeof scale.dogru === 'object' && !Array.isArray(scale.dogru) && gender) {
      // Cinsiyet-özel (Mf için)
      trueQuestions = scale.dogru[gender] || [];
    } else if (Array.isArray(scale.dogru)) {
      trueQuestions = scale.dogru;
    } else {
      trueQuestions = [];
    }
    
    for (const questionId of trueQuestions) {
      if (answers[questionId.toString()] === 1) {
        score++;
      }
    }
  }
  
  // Yanlış puanlanan sorular
  if ('yanlis' in scale) {
    let falseQuestions;
    
    if (typeof scale.yanlis === 'object' && !Array.isArray(scale.yanlis) && gender) {
      // Cinsiyet-özel (Mf için)
      falseQuestions = scale.yanlis[gender] || [];
    } else if (Array.isArray(scale.yanlis)) {
      falseQuestions = scale.yanlis;
    } else {
      falseQuestions = [];
    }
    
    for (const questionId of falseQuestions) {
      if (answers[questionId.toString()] === 0) {
        score++;
      }
    }
  }
  
  return score;
}

/**
 * Ham puan -> T-skoru dönüştürme
 */
function convertToTScore(
  scaleId: string,
  rawScore: number,
  gender: 'Erkek' | 'Kadin',
  withKCorrection: boolean = false
): number {
  const tableName = withKCorrection ? `${scaleId}_K` : scaleId;
  const table = tScoreTables[gender][tableName as keyof typeof tScoreTables['Erkek']];
  
  if (!table) {
    console.warn(`T-skoru tablosu bulunamadı: ${tableName}, ${gender}`);
    return 50;
  }
  
  // Ham puan için en yakın değeri bul
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  if (rawScore <= keys[0]) {
    return table[keys[0].toString()];
  }
  
  if (rawScore >= keys[keys.length - 1]) {
    return table[keys[keys.length - 1].toString()];
  }
  
  // İnterpolasyon
  let lowerKey = keys[0];
  let upperKey = keys[keys.length - 1];
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (rawScore >= keys[i] && rawScore <= keys[i + 1]) {
      lowerKey = keys[i];
      upperKey = keys[i + 1];
      break;
    }
  }
  
  if (lowerKey === upperKey) {
    return table[lowerKey.toString()];
  }
  
  // Lineer interpolasyon
  const ratio = (rawScore - lowerKey) / (upperKey - lowerKey);
  const lowerT = table[lowerKey.toString()];
  const upperT = table[upperKey.toString()];
  
  return Math.round(lowerT + (upperT - lowerT) * ratio);
}

/**
 * T-skoru seviye belirleme
 */
function determineLevel(tScore: number, scaleType: 'validity' | 'clinical'): 'normal' | 'elevated' | 'clinical' {
  if (scaleType === 'validity') {
    if (tScore >= 75) return 'clinical';
    if (tScore >= 65) return 'elevated';
    return 'normal';
  } else {
    if (tScore >= 75) return 'clinical';
    if (tScore >= 65) return 'elevated';
    return 'normal';
  }
}

/**
 * Geçerlik durumu belirleme
 */
function determineValidity(tScore: number, scaleId: string): 'valid' | 'borderline' | 'invalid' {
  switch (scaleId) {
    case 'L':
      if (tScore >= 75) return 'invalid';
      if (tScore >= 65) return 'borderline';
      return 'valid';
    case 'F':
      if (tScore >= 90) return 'invalid';
      if (tScore >= 80) return 'borderline';
      return 'valid';
    case 'K':
      if (tScore >= 75) return 'borderline';
      return 'valid';
    default:
      return 'valid';
  }
}

/**
 * Profil kodu oluşturma (Welch kodu)
 */
function generateProfileCode(clinicalScales: Record<string, MMPIScaleResult>): string {
  const elevatedScales = Object.entries(clinicalScales)
    .filter(([_, result]) => result.tScore >= 65)
    .sort(([, a], [, b]) => b.tScore - a.tScore)
    .map(([scaleId]) => scaleId);
  
  if (elevatedScales.length === 0) {
    return 'NORMAL';
  }
  
  return elevatedScales.slice(0, 3).join('-');
}

/**
 * Ana MMPI puanlama fonksiyonu
 */
export function calculateMMPIScores(
  answers: Record<string, number>,
  unansweredQuestions: Set<string>,
  gender: 'Erkek' | 'Kadin'
): MMPIResults {
  // Geçerlilik kontrolü - "?" (Bir Şey Diyemem) Testi
  // Kullanıcı spesifikasyonuna göre: 30 ve üzeri geçersiz, 10'dan az ise etkilenmez
  if (unansweredQuestions.size >= 30) {
    return {
      validityScales: {},
      clinicalScales: {},
      profileCode: 'INVALID',
      validityStatus: 'invalid',
      overallValidity: 'invalid',
      riskAssessment: {
        overall: 'high',
        areas: { 
          validity: `Test geçersiz: ${unansweredQuestions.size} soru boş (≥30)`,
          unanswered: `Profil geçersiz - çok fazla soru cevaplanmadı`
        }
      }
    };
  }
  
  // 1. Geçerlik ölçekleri hesapla
  const validityScales: Record<string, MMPIScaleResult> = {};
  const validityScaleIds = ['L', 'F', 'K'];
  
  for (const scaleId of validityScaleIds) {
    const rawScore = calculateRawScore(scaleId, answers, gender);
    const tScore = convertToTScore(scaleId, rawScore, gender);
    const level = determineLevel(tScore, 'validity');
    const validity = determineValidity(tScore, scaleId);
    
    validityScales[scaleId] = {
      rawScore,
      tScore,
      level,
      validity
    };
  }
  
  // 2. Klinik ölçekler hesapla
  const clinicalScales: Record<string, MMPIScaleResult> = {};
  const clinicalScaleIds = ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];
  const kScore = validityScales.K?.rawScore || 0;
  
  for (const scaleId of clinicalScaleIds) {
    let rawScore = calculateRawScore(scaleId, answers, gender);
    
    // K-düzeltmesi uygula - sadece belirtilen ölçeklere
    // Kullanıcı spesifikasyonuna göre: Hs(+0.5K), Pd(+0.4K), Pt(+1.0K), Sc(+1.0K), Ma(+0.2K)
    const kFactor = kCorrectionFactors[scaleId as keyof typeof kCorrectionFactors];
    const hasKCorrection = kFactor !== undefined;
    
    if (hasKCorrection) {
      // K değerinin belirtilen oranını ekle
      rawScore += Math.round(kScore * kFactor);
    }
    
    const tScore = convertToTScore(scaleId, rawScore, gender, hasKCorrection);
    const level = determineLevel(tScore, 'clinical');
    
    clinicalScales[scaleId] = {
      rawScore,
      tScore,
      level,
      validity: 'valid'
    };
  }
  
  // 3. Profil kodu oluştur
  const profileCode = generateProfileCode(clinicalScales);
  
  // 4. Genel geçerlik durumu belirle
  const L = validityScales.L?.tScore || 50;
  const F = validityScales.F?.tScore || 50;
  const K = validityScales.K?.tScore || 50;
  
  let overallValidity: 'valid' | 'limited' | 'invalid' = 'valid';
  
  // Geçerlik kuralları - kullanıcı spesifikasyonuna uygun
  if (F >= 90 || L >= 75) {
    overallValidity = 'invalid';
  } else if (F >= 80 || L >= 70 || K >= 75) {
    overallValidity = 'limited';
  }
  
  // 5. Risk değerlendirmesi ve '?' ölçeği
  const elevatedClinicalScales = Object.entries(clinicalScales)
    .filter(([_, result]) => result.tScore >= 75)
    .map(([scaleId]) => scaleId);
  
  const overallRisk = elevatedClinicalScales.length >= 3 ? 'high' :
                     elevatedClinicalScales.length >= 1 ? 'moderate' : 'low';
  
  const riskAreas: Record<string, string> = {};
  if (elevatedClinicalScales.length > 0) {
    riskAreas.clinicalElevations = `${elevatedClinicalScales.join(', ')} ölçeklerinde yüksek puanlar`;
  }
  
  // '?' Testi (Bir Şey Diyemem Testi) değerlendirmesi
  if (unansweredQuestions.size > 30) {
    riskAreas.unanswered = `${unansweredQuestions.size} soru cevaplanmadı - Profil geçersiz`;
  } else if (unansweredQuestions.size >= 10) {
    riskAreas.unanswered = `${unansweredQuestions.size} soru cevaplanmadı - Profil tartışmalı`;
  } else if (unansweredQuestions.size >= 5) {
    riskAreas.unanswered = `${unansweredQuestions.size} soru cevaplanmadı - Hafif şüphecilik`;
  }
  
  return {
    validityScales,
    clinicalScales,
    profileCode,
    validityStatus: overallValidity,
    overallValidity,
    riskAssessment: {
      overall: overallRisk,
      areas: riskAreas
    }
  };
}

/**
 * MMPI sonuçları için özet oluşturma
 */
export function generateMMPISummary(results: MMPIResults): string {
  if (results.overallValidity === 'invalid') {
    return 'MMPI profili geçersiz kabul edilmiştir. Klinik yorumlama yapılamaz.';
  }
  
  const elevatedScales = Object.entries(results.clinicalScales)
    .filter(([_, result]) => result.tScore >= 65)
    .map(([scaleId, result]) => `${scaleId} (T=${result.tScore})`)
    .join(', ');
  
  if (elevatedScales) {
    const validityNote = results.overallValidity === 'limited' ? ' Dikkatli yorumlama gerekir.' : '';
    return `MMPI profil kodu: ${results.profileCode}. Yükseltilmiş ölçekler: ${elevatedScales}.${validityNote}`;
  } else {
    return `MMPI profili normal sınırlar içerisindedir (Profil kodu: ${results.profileCode}). Klinik anlamlı yükselme saptanmamıştır.`;
  }
}