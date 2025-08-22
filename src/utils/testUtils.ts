// Test yardımcı fonksiyonları

import { TestTanimi, TestSorusu, Danisan } from '@/types';

/**
 * Danışanın cinsiyetine göre uygun test sorularını döndürür
 */
export function getTestSorulari(test: TestTanimi, danisan: Danisan): TestSorusu[] {
  // Eğer test cinsiyete özgü değilse, normal soruları döndür
  if (test.formTuru !== 'cinsiyete-ozel') {
    return test.sorular;
  }

  // Cinsiyete özgü test için uygun formu seç
  if (!test.formlar) {
    console.warn(`Test ${test.id} cinsiyete özgü olarak tanımlanmış ama formlar bulunamadı`);
    return test.sorular;
  }

  // Danışanın cinsiyetine göre formu seç
  const cinsiyet = danisan.cinsiyet;
  
  if (cinsiyet === 'Kadın' && test.formlar.Kadın) {
    return test.formlar.Kadın;
  } else if (cinsiyet === 'Erkek' && test.formlar.Erkek) {
    return test.formlar.Erkek;
  } else {
    // Cinsiyet belirtilmemişse veya uygun form yoksa, varsayılan olarak erkek formunu kullan
    console.warn(`Danışan cinsiyeti "${cinsiyet}" için uygun form bulunamadı, erkek formu kullanılıyor`);
    return test.formlar.Erkek || test.formlar.Kadın || test.sorular;
  }
}

/**
 * Test için uygun talimatları döndürür
 */
export function getTestTalimatlar(test: TestTanimi, danisan: Danisan): string {
  if (test.formTuru === 'cinsiyete-ozel') {
    const cinsiyetInfo = danisan.cinsiyet === 'Kadın' ? 'kadın formu' : 'erkek formu';
    return `${test.talimatlar}\n\nNot: Bu test için ${cinsiyetInfo} kullanılmaktadır.`;
  }
  return test.talimatlar;
}

/**
 * Cinsiyete özgü test için cinsiyet gereksinimini kontrol eder
 */
export function isCinsiyetGerekli(test: TestTanimi, danisan: Danisan): boolean {
  if (test.formTuru !== 'cinsiyete-ozel') {
    return false;
  }
  
  return !danisan.cinsiyet || danisan.cinsiyet === 'Belirtmek istemiyorum';
}