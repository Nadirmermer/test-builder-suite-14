// MMPI Klinik Norm Tabloları - Tanı Gruplarına Göre Ortalama ve Standart Sapmalar
// Kaynak: MMPI Değerlendirme Kitabı Tablolar 35-38

export interface ClinicalNormData {
  scales: {
    L: { mean: number; sd: number };
    F: { mean: number; sd: number };
    K: { mean: number; sd: number };
    Hs: { mean: number; sd: number };
    D: { mean: number; sd: number };
    Hy: { mean: number; sd: number };
    Pd: { mean: number; sd: number };
    Mf: { mean: number; sd: number };
    Pa: { mean: number; sd: number };
    Pt: { mean: number; sd: number };
    Sc: { mean: number; sd: number };
    Ma: { mean: number; sd: number };
    Si: { mean: number; sd: number };
  };
  sampleSize: number;
}

export interface ClinicalProfile {
  groupName: string;
  male: ClinicalNormData;
  female: ClinicalNormData;
}

// Klinik grup norm tabloları
export const clinicalNorms: Record<string, ClinicalProfile> = {
  // Tablo 35: Genel Tanılar
  'nevrotik': {
    groupName: 'Nevrotik Bozukluklar',
    male: {
      scales: {
        L: { mean: 5.66, sd: 2.57 },
        F: { mean: 12.13, sd: 7.54 },
        K: { mean: 13.12, sd: 4.82 },
        Hs: { mean: 19.21, sd: 5.06 },
        D: { mean: 27.95, sd: 6.94 },
        Hy: { mean: 25.59, sd: 6.80 },
        Pd: { mean: 25.32, sd: 5.11 },
        Mf: { mean: 25.31, sd: 4.73 },
        Pa: { mean: 13.65, sd: 4.84 },
        Pt: { mean: 34.44, sd: 8.36 },
        Sc: { mean: 35.33, sd: 10.98 },
        Ma: { mean: 20.48, sd: 5.06 },
        Si: { mean: 32.25, sd: 8.19 }
      },
      sampleSize: 290
    },
    female: {
      scales: {
        L: { mean: 6.35, sd: 2.27 },
        F: { mean: 13.80, sd: 7.20 },
        K: { mean: 16.80, sd: 5.23 },
        Hs: { mean: 21.10, sd: 6.56 },
        D: { mean: 30.53, sd: 6.69 },
        Hy: { mean: 27.52, sd: 7.21 },
        Pd: { mean: 25.41, sd: 5.10 },
        Mf: { mean: 30.99, sd: 5.09 },
        Pa: { mean: 15.86, sd: 5.98 },
        Pt: { mean: 36.74, sd: 7.04 },
        Sc: { mean: 39.76, sd: 9.96 },
        Ma: { mean: 21.75, sd: 5.20 },
        Si: { mean: 35.17, sd: 7.77 }
      },
      sampleSize: 105
    }
  },

  'psikotik': {
    groupName: 'Psikotik Bozukluklar',
    male: {
      scales: {
        L: { mean: 5.40, sd: 2.60 },
        F: { mean: 20.87, sd: 9.85 },
        K: { mean: 11.67, sd: 4.18 },
        Hs: { mean: 20.10, sd: 6.31 },
        D: { mean: 30.16, sd: 7.79 },
        Hy: { mean: 25.62, sd: 6.86 },
        Pd: { mean: 28.05, sd: 5.53 },
        Mf: { mean: 27.22, sd: 4.14 },
        Pa: { mean: 18.82, sd: 5.53 },
        Pt: { mean: 39.58, sd: 8.24 },
        Sc: { mean: 47.48, sd: 11.50 },
        Ma: { mean: 23.96, sd: 5.62 },
        Si: { mean: 37.74, sd: 9.77 }
      },
      sampleSize: 361
    },
    female: {
      scales: {
        L: { mean: 6.32, sd: 3.01 },
        F: { mean: 18.11, sd: 9.09 },
        K: { mean: 10.64, sd: 4.01 },
        Hs: { mean: 19.53, sd: 5.77 },
        D: { mean: 30.15, sd: 7.79 },
        Hy: { mean: 25.96, sd: 6.23 },
        Pd: { mean: 27.55, sd: 5.89 },
        Mf: { mean: 30.17, sd: 3.83 },
        Pa: { mean: 17.72, sd: 6.65 },
        Pt: { mean: 38.47, sd: 8.80 },
        Sc: { mean: 46.11, sd: 10.89 },
        Ma: { mean: 24.10, sd: 5.88 },
        Si: { mean: 35.20, sd: 8.16 }
      },
      sampleSize: 105
    }
  },

  'kisilik_bozuklugu': {
    groupName: 'Kişilik Bozukluğu',
    male: {
      scales: {
        L: { mean: 5.56, sd: 2.61 },
        F: { mean: 22.09, sd: 12.16 },
        K: { mean: 11.18, sd: 4.06 },
        Hs: { mean: 21.59, sd: 7.29 },
        D: { mean: 29.39, sd: 6.82 },
        Hy: { mean: 28.99, sd: 7.43 },
        Pd: { mean: 32.74, sd: 4.99 },
        Mf: { mean: 28.16, sd: 5.04 },
        Pa: { mean: 18.73, sd: 6.40 },
        Pt: { mean: 38.84, sd: 5.94 },
        Sc: { mean: 47.48, sd: 13.30 },
        Ma: { mean: 24.61, sd: 5.65 },
        Si: { mean: 35.08, sd: 10.68 }
      },
      sampleSize: 95
    },
    female: {
      scales: {
        L: { mean: 6.42, sd: 2.35 },
        F: { mean: 14.10, sd: 5.67 },
        K: { mean: 11.84, sd: 3.48 },
        Hs: { mean: 18.37, sd: 5.73 },
        D: { mean: 26.79, sd: 5.12 },
        Hy: { mean: 26.16, sd: 6.47 },
        Pd: { mean: 28.37, sd: 5.42 },
        Mf: { mean: 30.31, sd: 3.84 },
        Pa: { mean: 15.89, sd: 4.29 },
        Pt: { mean: 40.40, sd: 7.12 },
        Sc: { mean: 37.31, sd: 8.79 },
        Ma: { mean: 23.31, sd: 4.28 },
        Si: { mean: 31.10, sd: 7.62 }
      },
      sampleSize: 19
    }
  },

  'borderline': {
    groupName: 'Borderline Kişilik Bozukluğu',
    male: {
      scales: {
        L: { mean: 5.87, sd: 2.27 },
        F: { mean: 15.09, sd: 4.82 },
        K: { mean: 11.65, sd: 3.52 },
        Hs: { mean: 22.74, sd: 5.32 },
        D: { mean: 30.52, sd: 5.78 },
        Hy: { mean: 31.39, sd: 5.78 },
        Pd: { mean: 29.22, sd: 3.19 },
        Mf: { mean: 27.69, sd: 4.15 },
        Pa: { mean: 15.69, sd: 3.84 },
        Pt: { mean: 38.43, sd: 5.80 },
        Sc: { mean: 43.78, sd: 7.10 },
        Ma: { mean: 23.60, sd: 3.54 },
        Si: { mean: 34.43, sd: 6.54 }
      },
      sampleSize: 20
    },
    female: {
      scales: {
        L: { mean: 8.20, sd: 2.13 },
        F: { mean: 16.80, sd: 5.23 },
        K: { mean: 12.00, sd: 5.06 },
        Hs: { mean: 24.00, sd: 6.66 },
        D: { mean: 34.00, sd: 5.80 },
        Hy: { mean: 30.00, sd: 6.42 },
        Pd: { mean: 28.00, sd: 6.77 },
        Mf: { mean: 32.60, sd: 1.94 },
        Pa: { mean: 16.40, sd: 5.88 },
        Pt: { mean: 40.40, sd: 7.12 },
        Sc: { mean: 46.20, sd: 12.50 },
        Ma: { mean: 25.20, sd: 3.65 },
        Si: { mean: 39.20, sd: 9.64 }
      },
      sampleSize: 5
    }
  },

  // Tablo 36: Ayrıntılı Nevroz Tanıları
  'anksiyete_nevrozu': {
    groupName: 'Anksiyete Nevrozu',
    male: {
      scales: {
        L: { mean: 6.95, sd: 2.60 },
        F: { mean: 9.47, sd: 6.67 },
        K: { mean: 14.48, sd: 4.72 },
        Hs: { mean: 17.48, sd: 7.19 },
        D: { mean: 23.74, sd: 5.28 },
        Hy: { mean: 24.08, sd: 6.35 },
        Pd: { mean: 23.68, sd: 4.97 },
        Mf: { mean: 24.59, sd: 3.77 },
        Pa: { mean: 12.26, sd: 3.83 },
        Pt: { mean: 32.58, sd: 7.15 },
        Sc: { mean: 31.72, sd: 7.87 },
        Ma: { mean: 19.98, sd: 3.67 },
        Si: { mean: 28.76, sd: 7.93 }
      },
      sampleSize: 62
    },
    female: {
      scales: {
        L: { mean: 6.17, sd: 2.01 },
        F: { mean: 11.94, sd: 6.95 },
        K: { mean: 13.99, sd: 3.83 },
        Hs: { mean: 20.22, sd: 5.69 },
        D: { mean: 27.00, sd: 7.17 },
        Hy: { mean: 26.65, sd: 5.74 },
        Pd: { mean: 24.28, sd: 5.04 },
        Mf: { mean: 32.72, sd: 4.69 },
        Pa: { mean: 16.00, sd: 7.96 },
        Pt: { mean: 36.33, sd: 9.04 },
        Sc: { mean: 38.83, sd: 12.54 },
        Ma: { mean: 22.44, sd: 3.50 },
        Si: { mean: 34.89, sd: 8.79 }
      },
      sampleSize: 18
    }
  },

  // Tablo 37: Psikotik Tanılar  
  'sizofreni_akut': {
    groupName: 'Şizofreni (Akut)',
    male: {
      scales: {
        L: { mean: 6.26, sd: 2.39 },
        F: { mean: 19.95, sd: 7.79 },
        K: { mean: 8.67, sd: 3.70 },
        Hs: { mean: 18.63, sd: 6.11 },
        D: { mean: 28.19, sd: 6.83 },
        Hy: { mean: 24.80, sd: 6.18 },
        Pd: { mean: 27.86, sd: 4.74 },
        Mf: { mean: 27.44, sd: 4.11 },
        Pa: { mean: 18.20, sd: 4.78 },
        Pt: { mean: 38.93, sd: 6.98 },
        Sc: { mean: 46.83, sd: 8.00 },
        Ma: { mean: 24.27, sd: 6.01 },
        Si: { mean: 37.01, sd: 8.22 }
      },
      sampleSize: 115
    },
    female: {
      scales: {
        L: { mean: 6.20, sd: 2.75 },
        F: { mean: 18.69, sd: 7.16 },
        K: { mean: 10.14, sd: 3.84 },
        Hs: { mean: 19.65, sd: 5.70 },
        D: { mean: 29.25, sd: 6.74 },
        Hy: { mean: 26.25, sd: 6.61 },
        Pd: { mean: 26.87, sd: 5.54 },
        Mf: { mean: 31.05, sd: 3.62 },
        Pa: { mean: 18.13, sd: 5.29 },
        Pt: { mean: 34.44, sd: 6.81 },
        Sc: { mean: 46.82, sd: 6.72 },
        Ma: { mean: 24.64, sd: 6.09 },
        Si: { mean: 35.82, sd: 7.40 }
      },
      sampleSize: 55
    }
  }
};

/**
 * MMPI profilini klinik norm gruplarıyla karşılaştır
 */
export function compareWithClinicalNorms(
  testResults: Record<string, number>,
  gender: 'Erkek' | 'Kadin'
): Array<{
  groupName: string;
  similarity: number;
  deviationScore: number;
}> {
  const genderKey = gender === 'Erkek' ? 'male' : 'female';
  const comparisons: Array<{
    groupName: string;
    similarity: number;
    deviationScore: number;
  }> = [];

  for (const [groupKey, profile] of Object.entries(clinicalNorms)) {
    const normData = profile[genderKey];
    let totalDeviation = 0;
    let validScaleCount = 0;

    // Her ölçek için Z-skoru hesapla
    for (const [scaleId, result] of Object.entries(testResults)) {
      const normScale = normData.scales[scaleId as keyof typeof normData.scales];
      if (normScale && typeof result === 'number') {
        // Z-skoru: (X - μ) / σ
        const zScore = Math.abs((result - normScale.mean) / normScale.sd);
        totalDeviation += zScore;
        validScaleCount++;
      }
    }

    if (validScaleCount > 0) {
      const averageDeviation = totalDeviation / validScaleCount;
      // Benzerlik skoru: Düşük sapma = Yüksek benzerlik
      const similarity = Math.max(0, 100 - (averageDeviation * 20));

      comparisons.push({
        groupName: profile.groupName,
        similarity: Math.round(similarity * 10) / 10,
        deviationScore: Math.round(averageDeviation * 100) / 100
      });
    }
  }

  // Benzerlik skoruna göre sırala (en yüksekten en düşüğe)
  return comparisons.sort((a, b) => b.similarity - a.similarity);
}

/**
 * En olası tanı gruplarını belirle
 */
export function getMostLikelyDiagnoses(
  testResults: Record<string, number>,
  gender: 'Erkek' | 'Kadin',
  threshold: number = 70
): string[] {
  const comparisons = compareWithClinicalNorms(testResults, gender);
  
  return comparisons
    .filter(comp => comp.similarity >= threshold)
    .slice(0, 3) // En yüksek 3 eşleşme
    .map(comp => `${comp.groupName} (%${comp.similarity} benzerlik)`);
}