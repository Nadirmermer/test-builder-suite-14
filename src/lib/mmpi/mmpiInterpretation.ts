// MMPI Klinik Yorumlama Motoru
// Bu dosya MMPI T-skorlarını kullanarak kapsamlı klinik raporlar oluşturur

import { MMPIResults, MMPIScaleResult } from './mmpiScoring';

export interface MMPIInterpretation {
  validityInterpretation: string;
  individualScaleInterpretations: string[];
  codeTypeInterpretations: string[];
  lowScoreInterpretations: string[];
  overallSummary: string;
  clinicalRecommendations: string[];
}

/**
 * Ana MMPI yorumlama fonksiyonu
 */
export function generateMMPIInterpretation(results: MMPIResults): MMPIInterpretation {
  return {
    validityInterpretation: interpretValidityProfile(results.validityScales),
    individualScaleInterpretations: interpretIndividualScales(results.clinicalScales, results.validityScales),
    codeTypeInterpretations: interpretCodeTypes(results.clinicalScales),
    lowScoreInterpretations: interpretLowScores(results.clinicalScales),
    overallSummary: generateOverallSummary(results),
    clinicalRecommendations: generateClinicalRecommendations(results)
  };
}

/**
 * Geçerlik profili yorumlama - Kapsamlı analiz
 */
function interpretValidityProfile(validityScales: Record<string, MMPIScaleResult>): string {
  const L = validityScales.L?.tScore || 30;
  const F = validityScales.F?.tScore || 30;
  const K = validityScales.K?.tScore || 30;

  // Önce konfigürasyon analizini yap
  const configurationAnalysis = analyzeValidityConfiguration(L, F, K);
  
  // Sonra bireysel ölçek yorumlarını ekle
  const individualInterpretations = [
    interpretLScale(L),
    interpretFScale(F),
    interpretKScale(K)
  ].filter(Boolean);

  // Sonuçları birleştir
  const results = [configurationAnalysis, ...individualInterpretations].filter(Boolean);
  
  return results.join('\n\n') || "Geçerlik ölçekleri normal sınırlar içerisindedir.";
}

/**
 * Geçerlik ölçekleri konfigürasyon analizi (15 farklı profil türü)
 */
function analyzeValidityConfiguration(L: number, F: number, K: number): string {
  // Konfigürasyon 6: Rastgele Cevaplama
  if (L >= 55 && K >= 55 && F >= 105) {
    return "**Geçerlik Konfigürasyonu 6 - Rastgele Cevaplama:** Profil, hastanın maddeleri rastgele cevaplamasından dolayı geçersizdir. Bu durum hastanın konfüzyonundan, öfkesinden, test durumuna karşı direncinden ya da zeka faktöründen kaynaklanıyor olabilir. Klinisyen cevap verme örüntüsünün nedenlerini araştırdıktan sonra, testi hastaya tekrar vermelidir.";
  }

  // Konfigürasyon 7: Tümüne "doğru" yanıt verme
  if (L <= 35 && K <= 35 && F >= 120) {
    return "**Geçerlik Konfigürasyonu 7 - Tümüne Doğru Yanıtlama:** Bu profil geçersizdir. Profil şu durumlardan birini gösterebilir: 1) Her soruyu 'doğru' olarak işaretleme, 2) 'Yardım Çağrısı' profili, 3) Ergenlerde akut bir rahatsızlık yaşanması, 4) Yetişkinlerde çok dirençli olma, 5) 'Sahte Kötülük' profili. Eğer profil geçerli ise böyle bir kişi düşünce ve davranışlarındaki majör bozukluklar ve günlük yaşantısında yetersizliklerin hakim olduğu ajite psikotik bir tabloyu göstermektedir.";
  }

  // Konfigürasyon 8: Tümüne "yanlış" yanıt verme
  if (L >= 80 && F >= 80 && K >= 80) {
    return "**Geçerlik Konfigürasyonu 8 - Tümüne Yanlış Yanıtlama:** Profil geçersizdir. Hasta tüm maddelere yanlış olarak cevap verme eğilimdedir. Kişi konfüzyondadır, öfkelidir ya da test almak istememektedir. Klinisyen hastanın bu tutumunun nedenlerini araştırdıktan sonra, hastaya testi tekrar verebilir. Bu örüntü çok ajite ya da yıkımı olan psikotik hastalardan elde edilir.";
  }

  // Konfigürasyon 1: Tersine V (Yardım Çağrısı)
  if (F >= 70 && L >= 50 && L <= 60 && K >= 50 && K <= 60) {
    return "**Geçerlik Konfigürasyonu 1 - Tersine V (Yardım Çağrısı):** Birey kişisel ve duygusal zorluklarını kabullenmekte ve yardım istemektedir. Sorunlarıyla kendisinin başa çıkabileceğinden emin değildir. F alt testi yükseldikçe, bireyin sorunlarını abartarak kısa süre içinde yardım almak istediği ya da simülasyon yaptığı söylenebilir. Birey, kronik bir uyumsuzluk örüntüsü gösterse bile psikiyatrik açıdan yardım edilmesi güçtür ve zaman içinde de konfigürasyonda belirgin bir değişiklik olmaz.";
  }

  // Konfigürasyon 2: Savunucu V
  if (L >= 60 && K >= 60 && F <= 50) {
    return "**Geçerlik Konfigürasyonu 2 - Savunucu V:** Bu birey kabul edilmez duygularından, impulslarından, dürtülerinden ve sorunlarından kaçmakta ya da bunları inkar etmektedir. Birey kendini en iyi biçimde sunar. Dünyayı uçlarda, iyi ve kötü olarak görür. Eğer değerlendirilen bireyden elde edilen veriler yeterli ise savunuculuk ve psikopatolojinin inkarlarından şüphelenilmelidir. Bu konfigürasyon savunucu normallerden, histeriklerden ve hipokondriyak bireylerden elde edilir.";
  }

  // Konfigürasyon 3: Çok Kapalı V
  if (F <= 50 && L >= 60 && K >= 60) {
    return "**Geçerlik Konfigürasyonu 3 - Çok Kapalı Geçerlik:** Bu 'Çok Kapalı Geçerlik Konfigürasyonu'dur. L ve K alt testleri ne kadar çok yükselirse bu kişi kendisini olduğundan daha iyi gösterme çabası içindedir. Kişi böyle yaparak sorunlarını, kabul edilmeyen dürtülerini ya da duygularını azaltma ya da inkar etme yoluna gitmiştir. Bu inkar tutumu klinik testler üzerinde azaltıcı etkiye sahiptir. Böyle bir imaj sunmanın nedenleri şunlar olabilir: Bilinçli aldatma eğilimi, negativistik bir tutum ve iletişimi reddetme, aşırı katılık ve saflık ya da herhangi bir kişilik yetersizliğe yönelik açıklamayı tolere etmede güçsüzlük.";
  }

  // Konfigürasyon 4: Yükselen Eğilim
  if (L < F && F < K && L <= 40 && F >= 45 && F <= 55 && K <= 60) {
    return "**Geçerlik Konfigürasyonu 4 - Yükselen Eğilim:** Bu konfigürasyon sorunları ile baş edebilecek uygun kaynaklara sahip ve testi aldığı dönemde stres ya da gerilim yaşamayan normal kişilerin tipik konfigürasyonudur. Bu bireylerin K alt testindeki yükseltisi öğrenim durumlarına ve sosyo-ekonomik düzeylerine göre iniş-çıkış gösterecektir. Genellikle bu durum evlilik çatışması yaşayan 'normal' bireylerde, sofistike savunmaları olan üst sosyo-ekonomik ya da lise düzeyinde eğitim görmüşlerde görülebilir.";
  }

  // Konfigürasyon 5: Azalan Eğilim
  if (L > F && F > K && L <= 60 && F <= 50 && K >= 40 && K <= 45) {
    return "**Geçerlik Konfigürasyonu 5 - Azalan Eğilim:** Bu kişiler, kendilerini iyi göstermeye çalışırlar, sorunlarını kabul etmekten ya da kendileri ile uğraşılmasını istemekten hoşlanmazlar. Ancak bu kişilerin iyi görünme çabaları etkisizdir ve nevrotik üçlü genellikle yükselir. Erkeklerde Mf düşük olabilir. Eğitimi ve sosyo-ekonomik düzeyleri düşük bireylerde daha çok görülür.";
  }

  // Konfigürasyon 9: Açık Profil
  if (L <= 66 && K <= 66 && F >= 80 && F <= 100) {
    return "**Geçerlik Konfigürasyonu 9 - Açık Profil:** Bu profil geçerlidir. Geçerlik konfigürasyonu hastanın dile getirmek istediği psikolojik sorunları olduğunu göstermektedir. Bu tür konfigürasyon veren hastalar karamsar, dik kafalı, huzursuz ve asi kişilerdir. Kendilerini aşırı eleştirirler, psikolojik sorunlarını kabul etmeye hazırdırlar. Kullandıkları savunma mekanizmaları, içinde bulundukları durumla başa çıkmada yetersiz kalmaktadır.";
  }

  // Konfigürasyon 10: Karışık Profil
  if (L <= 66 && F >= 65 && F <= 69 && K >= 65) {
    return "**Geçerlik Konfigürasyonu 10 - Karışık Profil:** Profil geçerli gibi görünse de geçerlik konfigürasyonu geleneksel olmayan bir cevap örüntüsünün varlığını göstermektedir. Birey psikolojik sorunlarını kabul etmektedir. Bireyin akut bir bozukluğu vardır, ancak başa çıkmada kullandığı savunma mekanizmaları henüz bozulmamıştır. Patolojinin açık gösterimi ve savunucu kontrol arasındaki denge bu kişilerde durağan değildir ve yordanamaz.";
  }

  // Konfigürasyon 11: Düşük Savunma
  if (L <= 55 && F <= 64 && K <= 45) {
    return "**Geçerlik Konfigürasyonu 11 - Düşük Savunma:** Bu profil geçerlidir. Benzer profil veren bireyler konuşma ve tavırlarında açıktırlar ve laflarını sakınmazlar. Ergen grubu dışında kalan bireylerde ego gücünde düşüklük ve yetersiz savunma mekanizmaları vardır. Bu bireyler bir biçimde farklıdırlar. Eğer açık bir psikotik bozukluk yoksa hastada nevrotik bir uyum olduğu görülmektedir.";
  }

  // Konfigürasyon 12: Normal Profil
  if (L <= 50 && F <= 70 && K >= 50) {
    return "**Geçerlik Konfigürasyonu 12 - Normal Profil:** Bu profil geçerlidir. Birey yönergeleri dikkatli bir biçimde okuyarak anlamış ve yapmıştır. Yanıtlar olduğu gibi doğrudur ve hastanın durumunu yansıtmaktadır.";
  }

  // Konfigürasyon 13: Akut Bozukluk
  if (L >= 50 && F >= 55 && K >= 55 && Math.abs(F - K) <= 5) {
    if (F >= 70 && K >= 70) {
      return "**Geçerlik Konfigürasyonu 13 - Akut Bozukluk (Kötü Prognoz):** Bu örüntüdeki kişilerde hastalığına ilişkin içgörü yoktur ve prognoz kötüdür. Açık patoloji ile savunuculuk arasındaki denge yordanamaz ve kalıcı değildir.";
    } else {
      return "**Geçerlik Konfigürasyonu 13 - Akut Bozukluk:** Bu örüntüdeki kişilerin başa çıkma yetenekleri iyidir. Sorunlarının uzun zamandır devam etmesine karşın bununla yaşamlarını sürdürebilirler. Bu bireyler sadece şimdiki semptom ya da problemleri için yardım almak isterler ve tipik olarak durumsal stres azaldığında rahatlarlar.";
    }
  }

  // Konfigürasyon 14: Erdemli Görünme
  if (L >= 55 && F <= 60 && K >= 59 && K <= 64) {
    return "**Geçerlik Konfigürasyonu 14 - Erdemli Görünme:** Bu profil geçerlidir. Geçerlik konfigürasyonu olan bireyin kendisini çok erdemli biri olarak göstermek istediğini ve kendisini de böyle görmek istediğini göstermektedir. Bu bireyler kendilerini olduğundan çok daha iyi olarak gösterme eğilimindedirler.";
  }

  // Konfigürasyon 15: Karmaşık Durumsal Stres
  if (L >= 60 && F >= 70 && K <= 40) {
    return "**Geçerlik Konfigürasyonu 15 - Karmaşık Durumsal Stres:** F'in yüksekliği, bu kişinin karmaşıklık yaşadığını gösterir. L'deki ortalama yüksek puan, bireyin dünyayı basit, siyah ve beyaz olarak gördüğünün göstergesidir. Düşük K, bireyin benlik değerinin düşüklüğüne, başa çıkma kaynaklarının azlığına ve duygusal alanda katı olduğuna işaret etmektedir. Ancak L'nin yüksekliğini, bireyin katı bir şekilde geleneksel değerlere tutunduğunu gösterir.";
  }

  // Fallback - Genel değerlendirme
  if (L < 65 && F < 65 && K < 65) {
    return "**Geçerlik Profili Analizi - Normal Sınırlar:** Geçerlik ölçekleri, danışanın testi dürüst, tutarlı ve iş birliğine açık bir tutumla yanıtladığını göstermektedir. Profilin geri kalanının yorumlanması için güvenilir bir zemin bulunmaktadır.";
  }

  return "**Geçerlik Profili Analizi:** Geçerlik ölçeklerinin konfigürasyonu detaylı inceleme gerektirmektedir.";
}

/**
 * L (Yalan) Alt Testi Yorumlama
 */
function interpretLScale(LScore: number): string {
  if (LScore >= 69) {
    return `**L (Yalan) Alt Testi - T=${LScore} (≥69 T Puanı):** Puanlamada hata yapılmış olabilir. İki farklı değerlendirme vardır: 1) Bu kişiler sosyal açıdan kabul gören yanıtlar vererek kendilerini kontrol eden, etkili biri olduğu izlenimini bırakmaya çalışan bireylerdir. 2) Güvenilmez, pasif, uzak duran, kaygılı, içe kapanık kişilerdir. Diğerleri ile ilişki kurmaları zordur. Az sayıda kişide "patolojik yalan söyleme" gösterir.`;
  } else if (LScore >= 64) {
    return `**L (Yalan) Alt Testi - T=${LScore} (64-69 T Puanı):** Maddeleri gelişigüzel doldurma sonucu ortaya çıkabilir. Kişinin kendindeki zayıflıkları inkar ettiğini gösterir. Böyle kişiler patolojik olarak kendilerini iyi göstermeye çalışırlar; katı, regresiv ve savunucudurlar. Bu puanlar dini ve ahlaki inanç ve eğilimleri nedeniyle kendine aşırı kontrol koyan bireylerde görülür.`;
  } else if (LScore >= 56) {
    return `**L (Yalan) Alt Testi - T=${LScore} (56-63 T Puanı):** Bu birey iyi görünme çabası içinde olduğu düşünülmelidir. Bunlarda sosyal açıdan kabul gören yanıtlar verme eğilimi vardır. Bu bireyler aşırı geleneksel ve sosyal açıdan uyumludurlar.`;
  } else if (LScore >= 36) {
    return ""; // Normal aralık için özel yorum yok
  } else {
    return `**L (Yalan) Alt Testi - T=${LScore} (≤35 T Puanı):** Tüm maddeler doğrudur denebilir. Bağımsız, kendine güvenen, ufak sosyal hataları kabul etmeye hazır kimselerdir. İki farklı değerlendirme olabilir: Birey ya kendini oldukça patolojik göstermeye çalışıyordur ya da bağımsız, kendine güvenen, eksikliklerden açıkça bahseden, sosyal kurallara önem vermeyen normal bir insan olabilir.`;
  }
}

/**
 * F (Sıklık) Alt Testi Yorumlama  
 */
function interpretFScale(FScore: number): string {
  if (FScore >= 80) {
    return `**F (Sıklık) Alt Testi - T=${FScore} (≥80 T Puanı):** F alt testi 90 puanı aşarsa bu profil dikkatle değerlendirilmelidir. F alt testindeki yükselme nedenleri şunlar olabilir: 1) İlişki kurmak istememe, 2) Görme ya da okuma güçlüğü nedeniyle anlamada sorun ya da psikotik konfüzyon, 3) Sahte kötülük - simülasyon yapma, 4) Yardım çağrısı profili, 5) Açık psikoz ya da ciddi psikopatoloji vardır.`;
  } else if (FScore >= 70) {
    return `**F (Sıklık) Alt Testi - T=${FScore} (70-80 T Puanı):** Bireyin ego işlevselliğinde bozulma olduğunun, ilişki kurmak istemediğinin ya da yanlış anlaşıldığını düşünmesinin göstergesidir. Bu aralık psikozdaki hastaları ya da ciddi nevrotik bozukluğu olan kişileri göstermektedir. Bu bireyin alışılmadık ve geleneksel olmayan düşünce biçimi vardır. Anti-sosyal ve asi kişilerdir.`;
  } else if (FScore >= 55) {
    return `**F (Sıklık) Alt Testi - T=${FScore} (55-69 T Puanı):** Birey eğer bu ranjın üst sınırlarında ise negativist, değişken, huysuz ve huzursuzdur. Çeşitli tanı grupları bu ranja girebilir: Akut nevrozlar ve kişilik bozuklukları, durumsal stresi olan bireyler, savunucu psikotikler.`;
  } else if (FScore >= 44) {
    return `**F (Sıklık) Alt Testi - T=${FScore} (44-54 T Puanı):** Birey sadece belirgin maddelere yanıt vermiştir. İlgi alanları daralmıştır. Bireyin psikopatolojiyi, duygusal gerginliği gizlemek istediğini ve direncini gösterir ("Sahte iyilik").`;
  } else {
    return `**F (Sıklık) Alt Testi - T=${FScore} (Düşük Puanlar):** Bireyin savunucu olduğunun göstergesidir. Birey herhangi bir psikopatoloji, gerginlik ya da stresi olmadığı görünümünü vermek istemektedir ("Sahte İyilik").`;
  }
}

/**
 * K (Düzeltme) Alt Testi Yorumlama
 */
function interpretKScale(KScore: number): string {
  if (KScore >= 72) {
    return `**K (Düzeltme) Alt Testi - T=${KScore} (≥72 T Puanı):** Savunucu bireylerdir. Kendilerinde psikolojik sorunlar olduğunu kabul etmezler. Katıdırlar, esnek değildirler. Kendilerindeki sorunları kabul etmek istemezler. Tedaviye yanıt kötüdür.`;
  } else if (KScore >= 61) {
    return `**K (Düzeltme) Alt Testi - T=${KScore} (61-72 T Puanı):** Bu kişiler kendilerinde ve çevrelerinde olan bozuklukları en aza indirgeme ve görmezden gelme eğilimindedir. Savunmaları artmıştır, içgörü azdır. Histerik savunmaları olan nevrotikler için bu uygundur.`;
  } else if (KScore >= 46) {
    return `**K (Düzeltme) Alt Testi - T=${KScore} (46-60 T Puanı):** Bu düzeydeki puanlar dengeli bireyleri göstermektedir. Bu yükselme bireyin ego gücünün iyi olduğuna, olumlu kendilik değerine ve uyuma işaret etmektedir. Bunların psikolojik müdahaleyi istemek için yeterli kişisel kaynakları vardır.`;
  } else {
    return `**K (Düzeltme) Alt Testi - T=${KScore} (27-45 T Puanı):** Düşük sosyo-ekonomik düzeyden gelen bireylerde gözlenebilir. Bu hastalar sınırlı kişisel kaynakları ile açıkça ortaya koydukları ciddi sıkıntılar yaşamaktadır. Hastaların zayıf kendilik değerleri vardır ve kendilerinden hiç memnun değildirler. Genellikle kendine teşhir etme eğilimi içinde olan bireylerdir.`;
  }
}

/**
 * Tekil klinik ölçek yorumları
 */
function interpretIndividualScales(clinicalScales: Record<string, MMPIScaleResult>, validityScales: Record<string, MMPIScaleResult>): string[] {
  const interpretations: string[] = [];

  // Hs (Hipokondriazis) - Ölçek 1
  const Hs = clinicalScales.Hs?.tScore || 30;
  if (Hs >= 65) {
    interpretations.push(interpretHsScale(Hs));
  }

  // D (Depresyon) - Ölçek 2
  const D = clinicalScales.D?.tScore || 30;
  if (D >= 45) {
    interpretations.push(interpretDepressionScale(D, clinicalScales));
  }

  // Hy (Hysteri) - Ölçek 3
  const Hy = clinicalScales.Hy?.tScore || 30;
  if (Hy >= 45) {
    interpretations.push(interpretHysteriaScale(Hy, clinicalScales, validityScales));
  }

  // Pd (Psikopatik Sapma) - Ölçek 4
  const Pd = clinicalScales.Pd?.tScore || 30;
  if (Pd >= 65) {
    interpretations.push(`**Psikopatik Sapma (Pd) - T=${Pd}:** Bu alt testteki yükselme, sosyal kurallara ve otoriteye karşı isyankar bir tutuma işaret edebilir. Kişi dürtüsel davranabilir, engellenmeye toleransı düşük olabilir.`);
  }

  // Mf (Kadınlık-Erkeklik) - Ölçek 5
  const Mf = clinicalScales.Mf?.tScore || 30;
  if (Mf >= 65) {
    interpretations.push(`**Kadınlık-Erkeklik (Mf) - T=${Mf}:** (Yorum danışanın cinsiyetine göre yapılmalıdır) Geleneksel cinsiyet rollerinden uzaklaşmayı, farklı ilgi ve aktivite alanlarını gösterebilir.`);
  }

  // Pa (Paranoya) - Ölçek 6
  const Pa = clinicalScales.Pa?.tScore || 30;
  if (Pa >= 65) {
    interpretations.push(`**Paranoya (Pa) - T=${Pa}:** Bu yükselme, kuşkuculuk, alınganlık, başkalarının niyetlerini kötüye yorma ve kendini aşırı önemli görme gibi paranoid eğilimlere işaret eder.`);
  }

  // Pt (Psikasteni) - Ölçek 7
  const Pt = clinicalScales.Pt?.tScore || 30;
  if (Pt >= 20) {
    interpretations.push(interpretPsychasteniaScale(Pt, clinicalScales));
  }

  // Sc (Şizofreni) - Ölçek 8
  const Sc = clinicalScales.Sc?.tScore || 30;
  if (Sc >= 60) {
    interpretations.push(interpretSchizophreniaScale(Sc, clinicalScales));
  }

  // Ma (Hipomani) - Ölçek 9
  const Ma = clinicalScales.Ma?.tScore || 30;
  if (Ma >= 21) {
    interpretations.push(interpretHypomaniaScale(Ma, clinicalScales, validityScales));
  }

  // Si (Sosyal İçedönüklük) - Ölçek 0
  const Si = clinicalScales.Si?.tScore || 30;
  if (Si >= 65) {
    interpretations.push(`**Sosyal İçedönüklük (Si) - T=${Si}:** Bu yükselme, kişinin sosyal ortamlarda kendini rahatsız hissettiğini, utangaç, çekingen ve yalnızlığa eğilimli olduğunu gösterir.`);
  }

  return interpretations;
}

/**
 * D (Depresyon) Alt Testi Kapsamlı Yorumlama
 */
function interpretDepressionScale(DScore: number, clinicalScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Depresyon (D) Alt Testi - T=${DScore}:**\n\n`;
  
  // T-Skoru aralıklarına göre yorum
  if (DScore >= 85) {
    interpretation += `**85 ve Üstü T Puanı:** Bir şeye odaklaşamayacak ya da açık bir biçimde düşünemeyecek kadar kederli olan bireyleri gösterir.`;
  } else if (DScore >= 79) {
    interpretation += `**79 ve Üstü T Puanı:** Birey depresif ve kaygılıdır, benlik saygısı düşüktür. Genel olarak yaşama bakışı karamsardır. Tipik olarak ilgi alanları daralmış, morali bozuktur ve kendisini işe yaramaz olarak görür. Bu kişilerin duyarlıkları kendi depresyonlarına ve fonksiyon düzeylerine yönelmiştir. Aynı zamanda kendilerini soyutlama ile içe çekilme görülür. Bu negatif yüklemeler kendilerinden hoşnut olmama sonucunu doğurur, bu da değişme isteğiyle birlikte iyi bir prognoz sağlar. Yüksek puanlar sıklıkla somatik belirtiler ve yakınmalarla bir arada bulunur.`;
  } else if (DScore >= 70) {
    interpretation += `**70 – 79 T Puanı:** Ciddi ve kendine güveni olmayan bireyleri gösterir. Eğer o an durumsal baskılar yoksa ve özellikle L de yükselmiş ise bu bireyler, tipik olarak iyi ve kötü ya da doğru ve yanlış biçiminde düşünürler. Klinik olarak belirgin depresyonu olan bireyi gösterir. Bu bireyler en küçük bir şey karşısında bile endişe duyma eğilimi içindedirler. Psikiyatrik hastalar bu ranjda yer alırlar. Bu alanda bireyin yaşadığı huzursuzluk onun iyileşme için motive olduğunun göstergesidir.`;
    
    // İntihar riski değerlendirmesi
    const otherElevatedScales = Object.entries(clinicalScales)
      .filter(([key, result]) => key !== 'D' && result.tScore >= 70)
      .map(([key]) => key);
    
    if (otherElevatedScales.length === 0) {
      interpretation += `\n\n⚠️ **İNTİHAR RİSKİ UYARISI:** Sadece D alt testinin yüksek olduğu ve depresyona ilişkin açık davranışsal belirtiler yoksa intihar riskine karşı dikkatli olmak gerekir.`;
    }
  } else if (DScore >= 60) {
    interpretation += `**60 – 69 T Puanı:** Bu bireylerde orta düzeyde depresyon, endişe ve karamsarlık göstergesi vardır. Bu duygudurum hali, durumsal krize bağlı olabileceği gibi kalıcı ve geri dönüşü olmayan bir durum da olabilir.`;
  } else if (DScore >= 45) {
    interpretation += `**45 – 59 T Puanı:** Bu bireyin yaşamında iyimserlik ve karamsarlık dengesini kurduğunun göstergesidir.`;
  } else if (DScore >= 28) {
    interpretation += `**28 – 44 T Puanı:** Olasılıkla neşeli, meraklı, iyimser, aktif ve dışa dönüktürler. Bu durum bazen bu bireylerin kayıtsız gibi algılanmasına neden olur, bu da diğerlerinde hostilite ortaya çıkar.`;
  }

  // Sadece D'nin yüksek olması durumu
  const elevatedScales = Object.entries(clinicalScales)
    .filter(([key, result]) => result.tScore >= 70)
    .map(([key]) => key);
    
  if (DScore >= 70 && elevatedScales.length === 1 && elevatedScales[0] === 'D') {
    interpretation += `\n\n**Sadece D Alt Testinin Yükselmesi:** Birey reaktif bir depresyon yaşamaktadır. Yetersiz, güvensizdir, kendini cezalandırarak suçluluk duygularından kurtulma çabası içindedirler ve çok fazla kaygılıdır, kendini eleştirir. Birey depresif olduğunu (bu duygudurumu başkaları için çok açık olabildiği halde) inkar edecektir. Psikoterapi prognozu genellikle kısa bir süre içinde iyidir ve bu tür hastalar yönetici, yüzleştirici bir yaklaşıma iyi yanıt verirler.`;
  }

  return interpretation;
}

/**
 * Histeri (Hy) Alt Testi Kapsamlı Yorumlama
 */
function interpretHysteriaScale(HyScore: number, clinicalScales: Record<string, MMPIScaleResult>, validityScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Histeri (Hy) Alt Testi - T=${HyScore}:**\n\n`;

  if (HyScore >= 85) {
    interpretation += `**85 T Puanı ve Üstü:** Aşırı immatür, benmerkezcil ve bağımlı kişilerdir. Bastırma savunma mekanizmasını yoğun kullanmaları içgörü eksikliğine işaret eder. Semptomlar gerçek organik patolojiye uymayabilir ve genellikle kroniktir.`;
  } else if (HyScore >= 76) {
    interpretation += `**76 – 85 T Puanı:** 70 – 75 bandına ek olarak; uzun süredir devam eden gerginliğe bağlı konversif semptomlar (baş/sırt/göğüs ağrısı, baş dönmesi, baygınlık) görülebilir. Güven duyamama, immatürite ve organize olmuş bedensel yakınmalar vardır.`;
  } else if (HyScore >= 70) {
    interpretation += `**70 – 75 T Puanı:** Bastırma ve inkarı çok fazla kullanan, uyumlu (itaatkar), saf ve çocuksu benmerkezci yapı; anksiyete ile bağlantılı somatik yakınmalar. Histeroid mekanizmalar ve ikincil kazançlar belirgin olabilir. Sevilme ve kabul ihtiyacı yüksektir; bağlanma gerektiren durumlarda ilk tepki coşkulu, ardından kızgınlık ve pasif direnç gelebilir.`;
  } else if (HyScore >= 60) {
    const Hs = clinicalScales.Hs?.tScore || 0;
    const D = clinicalScales.D?.tScore || 0;
    if (Math.abs(Hs - HyScore) <= 10 && D <= Math.min(Hs, HyScore) - 10) {
      interpretation += `**60 – 69 T Puanı (Hs ≈ Hy, D daha düşük):** Histerik kişiye işaret eder; stres sırasında somatizasyona sığınma görülebilir.`;
    } else if (HyScore >= (Hs + 10)) {
      interpretation += `**60 – 69 T Puanı (Hy ≥ Hs +10):** Histerik özellikler belirgindir. Kişi kendine odaklıdır, kendisini olduğundan farklı ve mükemmel görmek ister, kişilerarası ilişkilerde içgörü azlığı vardır.`;
    } else {
      interpretation += `**60 – 69 T Puanı:** Orta düzeyde somatizasyon ve gerilimle ilişkili yakınmalar görülebilir.`;
    }
  } else if (HyScore >= 45) {
    interpretation += `**45 – 59 T Puanı:** Bu alan için özgül bir tanımlama yoktur.`;
  } else if (HyScore >= 24) {
    interpretation += `**24 – 44 T Puanı:** Kişi kendini sürekli eleştirir. Olumlu kişilerarası ilişkileri inkar etme eğilimi olabilir. Si yükselmişse birey diğer insanlardan kaçınma eğilimindedir.`;
  }

  // Sadece Hy'nin yükselmesi
  const elevated = Object.entries(clinicalScales).filter(([_, r]) => r.tScore >= 70).map(([k]) => k);
  if (HyScore >= 70 && elevated.length === 1 && elevated[0] === 'Hy') {
    interpretation += `\n\n**Sadece Hy Alt Testinin Yükselmesi:** Kabul edilme ve sevilme gereksinimi fazladır. Grup tarafından reddedilme olasılığına yönelik endişe yaşar; kızgınlık ve kendini ortaya koymayı içeren yüzleşme durumlarında belirgin rahatsızlık olur. İyimserlik ve sosyal uyum vurgulanırken doğal olmayan davranışlar en aza indirgenir.`;
  }

  // Yüksek 3 / Yüksek K özel durumu
  const K = validityScales.K?.tScore || 0;
  const F = validityScales.F?.tScore || 0;
  const Sc = clinicalScales.Sc?.tScore || 0;
  if (HyScore >= 65 && K >= 60 && F < 65 && Sc < 65) {
    interpretation += `\n\n**Yüksek 3 / Yüksek K (F ve Sc düşük):** Sevilme, kabul edilme ve yaşamı üzerinde kontrol sergileme gereksinimi abartılıdır. Çok katı bir optimizm görülebilir; bağımsız karar ve güç gerektiren durumlardan kaçınma eğilimi vardır.`;
  }

  return interpretation;
}

/**
 * Psikasteni (Pt) Alt Testi Kapsamlı Yorumlama
 */
function interpretPsychasteniaScale(PtScore: number, clinicalScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Psikasteni (PT) Alt Testi - T=${PtScore}:**\n\n`;
  
  if (PtScore >= 84) {
    interpretation += `**84 T puanı ve üstü:** Bireyin ajite ruminasyonları, korku hali, obsesyonları ve kompulsiyonları ya da fobileri olduğunu göstermektedir. Anksiyete ve gerginlik o kadar fazladır ki günlük yaşamlarını bile devam ettiremezler. Entellektüalizasyon, izolasyon ve rasyonalizasyon sıklıkla görülür.`;
  } else if (PtScore >= 75) {
    interpretation += `**75-84 T puanı:** Temiz, titiz, düzenli kişilerdir. Önemsiz sorunlar karşısında bile gerginlik ve endişe yaşarlar. Kendilerini yetersiz, aşağılık duyguları ve suçluluğu olan kişiler olarak gösterilirler. Bu kendilerine güvenmemelerine bağlıdır, herhangi bir konuda fikir üretemezler. Obsesyonları, kompulsiyonları ve fobileri dışlayınız.`;
  } else if (PtScore >= 60) {
    interpretation += `**60-74 T puanı:** Bu yükseltiler dürüst, mükemmeliyetçi, titiz ve kendini eleştiren bireyler olduklarına işaret etmektedir. Küçük sorunları bile kendilerine dert etme eğilimindedirler.`;
  } else if (PtScore >= 45) {
    interpretation += `**45-59 T puanı:** Bu bireyler yaşamlarını ve işlerini endişe ve güvensizlik duymadan yürütebilirler.`;
  } else if (PtScore >= 20) {
    interpretation += `**20-44 T puanı:** Rahat, duygusal, gerginliği olmayan bireylerdir. Çoğu kendine güvenir ve uyumludur. Üretici ve yeterlidirler. Kaygı düzeyleri çok düşük olduğu için sanki tembel gibi görülürler. Başarıya, statüye, kabul görmeye önem veren kişilerdir.`;
  }

  // Sadece Pt alt testinin yükselmesi durumu
  const elevatedScales = Object.entries(clinicalScales)
    .filter(([key, result]) => result.tScore >= 70)
    .map(([key]) => key);
    
  if (PtScore >= 70 && elevatedScales.length === 1 && elevatedScales[0] === 'Pt') {
    interpretation += `\n\n**Sadece Pt Alt Testinin Yükselmesi:** Alt test 7'de yüksek puanları psikiatrik grupta, genellikle kaygı, gerginlik, kararsızlık ve dikkatini bir noktaya yoğunlaştıramayan bireyleri tanımlamaktadır. Bu kişilerde obsesif düşünceler, ruminasyonlar, kendinden şüphe, ve bunlara eşlik eden depresif özellikler vardır. Fobi ve kompulsif davranışlar, bu alt testte yüksek puan alan bireylerde görülmesine karşın, bu yüksek puan karakteristiği değildir. Bu kişilerin yakınmaları daha çok kardiyovasküler sisteminde yoğunlaşır. Ayrıca gastrointestinal işlevlerle ilişkili yakınmalara rastlanır. Terapötik yardımdan önce anksiyetelerinin semptom tedavisi gerçekleştirilmelidir.`;
  }

  return interpretation;
}

/**
 * Şizofreni (Sc) Alt Testi Kapsamlı Yorumlama
 */
function interpretSchizophreniaScale(ScScore: number, clinicalScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Şizofreni (Sc) Alt Testi - T=${ScScore}:**\n\n`;
  
  if (ScScore >= 100) {
    interpretation += `**100 T puanı ve üstü:** Akut bozukluğun eşlik ettiği uzun süreli ciddi bir stresin sonucunda ortaya çıkar. Bu kişiler tipik olarak şizofreni değildir. Daha çok akut psikotik reaksiyon içine giren hastalardır. Ayrıca kimlik krizindeki ergenlerde de bu ranja rastlanır. T>95'in üzerinde olan değerler akut durumsal stres ve ciddi özdeşim krizleri gösterir.`;
  } else if (ScScore >= 75) {
    interpretation += `**75 T puanı ve üstü:** Yabancılaşma yaşayan ve doğru düşünmeyen bireyler tarafından verilir. Düşüncede ve hareketlerde sıradan değildirler, olasılıkla sosyal açıdan çekiniktirler ve derin kişilerarası ilişki kuramazlar. Kendilerinin kim olduğunu ve bu dünyadaki yerlerinin ne olduğu konusunda oldukça bozuk düşünceleri vardır ve genellikle bu dünyaya ait olmadıklarını düşünürler. İletişim kurmada sorunlar temeldir, dezorganize düşünceleri vardır ve bunların açık ve mantıklı düşünmesini engeller. Bu bireylerin gerçek ile bağlantıları var gibi görünse de oldukça yüzeyseldir. T puanı 80'e yaklaştığında, mantıkta ve düşünmede tuhaflık belirginleşirler. Gerçek şizoid düşünce süreci gözlenebilir.`;
  } else if (ScScore >= 60) {
    interpretation += `**60-74 T puanı:** Bu yükselme değerlendirilirken profilin tümü ele alınmalıdır. Bu yükselmenin alt sınırlarında ve nevrotik profilde yükselme varsa bu bireyin soyut konularla ilgilendiğini göstermektedir. 65-74 T puan aralığındaki değerlendirmede genel bir yabancılaşma ya da örtük psikoz olup olmadığı değerlendirilmelidir. Bu kişiler ilişkilerinde çekingen, derin duygusal ilişkilerden kaçınma, temkinli tutucu, rekabet etmek istemeyen kişilerdir.`;
  }

  return interpretation;
}

/**
 * Hipomani (Ma) Alt Testi Kapsamlı Yorumlama
 */
function interpretHypomaniaScale(MaScore: number, clinicalScales: Record<string, MMPIScaleResult>, validityScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Hipomani (Ma) Alt Testi - T=${MaScore}:**\n\n`;
  
  if (MaScore >= 85) {
    interpretation += `**85 T puanı ve üstü:** Ajitasyon ya da manik dönem olabilir. Birey hiperaktiftir, davranışları yordanamaz, fikir uçuşmaları vardır. Kendi değerlerini abartırlar.`;
  } else if (MaScore >= 75) {
    interpretation += `**75-84 T Puanı:** Enerjik, konuşkan, eylemi düşünceye tercih eden kişilerdir. İlgileri çok geniş alana yayılmıştır ve hemen gerçekleştirmek istedikleri çok sayıda projeleri vardır. Bu kişilerin çoğunda aktivite ve güç, abartı düzeyde yüksektir, ancak projelerini tamamlayamazlar. Tipik olarak davranışlarını, düşmanlık duygularını ve öfkelerini kontrol edemezler. Gerçek manik özellikler gösterebilirler fikir uçuşması, duygudurumda kaymalar ve değişmeler, büyük sanrılar ve hiperaktiviteler gibi.\n\nErgenlerde bu yükselme, artmış hareketliliği gösterir. İmpulsif ve kontrolsüzdürler. Grandiozite ve çağrışımlarda artma vardır.`;
  } else if (MaScore >= 69) {
    interpretation += `**69-75 T puanı:** Enerjik, dışadönük ve aktif bireyleri gösterir. Bunlar, diğerleri tarafından hoş ve yeterli olarak görülürler. Bu düzeydeki puanlar lise ya da lise mezunu öğrencilerinde çok sıktır, çünkü bu bireylerde enerji düzeyleri yüksek olması beklenen bir durumdur. Bu düzeyde puan alan kişiler onay ve statü kazanmak için çaba harcarlar ve düşünce ve davranışlarda özgür olma eğilimleri vardır.`;
  } else if (MaScore >= 60) {
    interpretation += `**60-69 T puanı:** Hoş, enerjik, meraklı, sosyal, kolay ilişki kuran, ilgi alanları geniş kişilerdir. Bu hallerinden kendileri de memnundur. İyimserlik, bağımsızlık ve kendine güven vardır.`;
  } else if (MaScore >= 45) {
    interpretation += `**45-59 T puanı:** Normal aralığıdır. Puan normal aralıktan yükseldikçe mani düzeyinin arttığı düşünülür.`;
  } else if (MaScore >= 21) {
    interpretation += `**21-44 T puanı:** Düşük enerji düzeyi, güdü azlığı ve hatta apatiyi gösterir. Bu geçici yorgunluk ya da hastalığa işaret etmektedir. Düşük puanların çoğunluğu, kronik açıdan düşük enerji düzeyinin belirtisidir. Bireylerin kendilerine güvenleri azdır ve amaçları genellikle yoktur. Sabahları kalkmak istemezler ve herhangi bir projeye başlamakta kendilerini aşırı çaba göstermek zorunda hissederler. Yaşlı insanlarda 9'un düşüklüğü beklenen bir durumdır, normal yaşlanma sürecini gösterir, 45 yaşın altında düşük olması beklenen bir durum değildir ve dikkat edilmesi gerekir.`;
  }

  // Özel kombinasyonlar
  const K = validityScales.K?.tScore || 0;
  if (MaScore >= 70 && K >= 70) {
    interpretation += `\n\n**Yüksek 9/Yüksek K Kodu:** Bu kişiler enerjik, organize, diğerlerinin kendileri üzerinde otorite kurmasını istemeyen kişilerdir. Genellikle bu kişiler çok iyi yöneticilerdir. Güç yönelimli bireylerdir, bunlar için belirsizlik, fikir üretmeme ya da çelişkili durumlar tahammül edilemez şeylerdir. Kendilerinin kontrol edemediği durumlarda ve bilgi verilmeyen, yapılanamamış durumlardan rahatsız olurlar.`;
  } else if (MaScore >= 70 && K <= 45) {
    interpretation += `\n\n**Yüksek 9/Düşük K Kodu:** Narsistik kişilerdir. Kadınlar, eksibisyonist bir biçimde kendilerini sergileyerek dikkatleri bu şekilde üstlerine çekerler.`;
  }

  return interpretation;
}

/**
 * Sosyal İçedönüklük (Si) Alt Testi Kapsamlı Yorumlama
 */
function interpretSocialIntroversionScale(SiScore: number, clinicalScales: Record<string, MMPIScaleResult>): string {
  let interpretation = `**Sosyal İçedönüklük (Si) Alt Testi - T=${SiScore}:**\n\n`;
  
  interpretation += `Bu alt test, içedönüklük ve dışadönüklük üzerinde çok çalışılmış bir kişilik boyutudur. Bu alt test içedönüklüğün yalnızca bir boyutunu, sosyal ilişkilerdeki içedönüklüğü ölçmeyi amaçlamaktadır. Psikiyatrik ve normal populasyon için alt test Si de alınan yüksek puanlar benzer şekilde tanımlanır. Alt test Si deki puanlar yaşla birlikte artar.\n\n`;
  
  if (SiScore >= 70) {
    interpretation += `**70 T Puanı ve üstü:** Sosyal açıdan beceriksiz olan kişilerdir. Sosyal ilişkilerinde anksiyete yaşar ve ilişki kurmaktan kaçınırlar. Nevrotik üçlüde yükselme görülebilir.`;
  } else if (SiScore >= 60) {
    interpretation += `**60-69 T puanı:** Bu kendini ortaya koymak istemeyen, yakın aile çevresinde rahat olan bireylerin profilidir. Çekingen, utangaç kişilerdir.`;
  } else if (SiScore >= 45) {
    interpretation += `**45-59 T puanı:** Sosyal ilişki kurmada başarılı olan bireylere işaret etmektedir.`;
  } else if (SiScore >= 25) {
    interpretation += `**25-44 T Puanı:** İyimser, manipulatif, yüzeysel ve hatta biraz uçuk bireylerdir. Dürtü kontrol sorunları vardır. Diğerleri ile olmak isteyen, yalnız kalamayan bireyleri gösterir. Çoğu kolay ilişki kurar, arkadaş canlısı ve gereksinimleri çok fazla olan bireylerdir.`;
  }

  // Özel kombinasyonlar
  const Pd = clinicalScales.Pd?.tScore || 0;
  const Ma = clinicalScales.Ma?.tScore || 0;
  const D = clinicalScales.D?.tScore || 0;
  const Pt = clinicalScales.Pt?.tScore || 0;
  const Sc = clinicalScales.Sc?.tScore || 0;
  
  if (SiScore >= 60 && (Pd >= 70 || Ma >= 70)) {
    interpretation += `\n\n**Si Yüksek + Pd/Ma Yüksek:** Alt test Si'deki yükselmeye, alt test 4 ve 9'daki yükselmeler de eşlik ediyorsa, eyleme vurukluğun bastırıldığı düşünülmektedir.`;
  }
  
  if (SiScore >= 60 && (D >= 70 || Pt >= 70 || Sc >= 70)) {
    interpretation += `\n\n**Si Yüksek + D/Pt/Sc Yüksek:** Alt test 2 ya da 7 özellikle alt test 8'in eşlik ettiği durumda, ruminatik davranışların kuvvetlendiği görülür.`;
  }

  return interpretation;
}

/**
 * İkili ve üçlü kod tipi yorumları
 */
function interpretCodeTypes(clinicalScales: Record<string, MMPIScaleResult>): string[] {
  const interpretations: string[] = [];
  
  // T-skorları al
  const scores = Object.fromEntries(
    Object.entries(clinicalScales).map(([key, result]) => [key, result.tScore])
  );

  // En yüksek skorları bul (T>=65)
  const elevatedScales = Object.entries(scores)
    .filter(([_, score]) => score >= 65)
    .sort(([, a], [, b]) => b - a)
    .map(([scale]) => scale);

  if (elevatedScales.length < 2) {
    return interpretations;
  }

  const highest = elevatedScales[0];
  const second = elevatedScales[1];
  const third = elevatedScales.length > 2 ? elevatedScales[2] : null;

  // ÖZEL PROFIL ÖRÜNTÜLERİ KONTROLÜ
  // Konversiyon Vadisi ("V" Profili)
  if ((scores.Hs >= 65 && scores.Hy >= 65) && scores.D < Math.min(scores.Hs, scores.Hy) - 10) {
    interpretations.push(`**Konversiyon Vadisi Profili:** Bu profil, bireyin yaşadığı gerilimi ve stresi doğrudan kabul etmek yerine, bunları bedensel yakınmalara dönüştürerek (somatizasyon) başa çıkma eğiliminde olduğunu gösterir.`);
  }

  // İKİLİ KOD TİPLERİ
  const codeType = `${highest}${second}`;

  switch (codeType) {
    case 'HsD':
    case 'DHs':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (12/21 Kodu):** Bu profilin en belirgin özellikleri bedensel rahatsızlık ve ağrıdır. Bu kişiler, belirtilerinin organik bir dayanağı olmamasına rağmen, kendilerini fiziksel bir rahatsızlık varmış gibi gösterirler. Genellikle anksiyöz, gergin, sinirli ve karamsardırlar. Pasif-bağımlı bir yaşam tarzı benimseyebilir ve davranışlarının sorumluluğunu üstlenmekten kaçınabilirler.`);
      break;

    case 'HsHy':
    case 'HyHs':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (13/31 Kodu):** Bu profil 'Konversiyon V' olarak da bilinir ve kişinin strese karşı fiziksel semptomlar geliştirerek tepki verdiğini gösterir. Bu bireyler psikolojik olarak olgunlaşmamış, ben-merkezci ve bağımlıdırlar. Duygusal sorunlarını inkar etme eğilimindedirler.`);
      break;

    case 'HsPd':
    case 'PdHs':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (14/41 Kodu):** Bu profil, bedensel şikayetlerin antisosyal davranışlarla birleştiği karmaşık bir yapıyı gösterir. Kişi otoriteye karşı dirençli olabilir ve sağlık konularını manipülatif amaçlarla kullanabilir.`);
      break;

    case 'HsSc':
    case 'ScHs':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (18/81 Kodu):** Bu profil, somatik yakınmaların psikotik belirtilerle birleştiği ciddi bir duruma işaret eder. Kişi gerçeklikten kopuk ve izole olabilir.`);
      break;

    case 'HsMa':
    case 'MaHs':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (19/91 Kodu):** Bu profil, fiziksel yakınmaların hipertimik özelliklerle birleştiğini gösterir. Kişi aşırı aktif ancak aynı zamanda somatik şikayetlerle dolu olabilir.`);
      break;

    case 'DHy':
    case 'HyD':
      interpretations.push(interpretDepressionHysteriaCode(scores.D, scores.Hy, scores));
      break;

    case 'DPd':
    case 'PdD':
      interpretations.push(interpretDepressionPsychopathicCode(scores.D, scores.Pd, scores));
      break;

    case 'DPt':
    case 'PtD':
      interpretations.push(interpretDepressionPsychastheniaCode(scores.D, scores.Pt, scores));
      break;

    case 'DSc':
    case 'ScD':
      interpretations.push(interpretDepressionSchizophreniaCode(scores.D, scores.Sc, scores));
      break;

    case 'DMa':
    case 'MaD':
      interpretations.push(interpretDepressionHypomaniaCode(scores.D, scores.Ma, scores));
      break;

    case 'DSi':
    case 'SiD':
      interpretations.push(interpretDepressionSocialIntroversionCode(scores.D, scores.Si, scores));
      break;

    case 'DPd':
    case 'PdD':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (24/42 Kodu):** Bu profil, dürtüsel ve antisosyal davranışların ardından gelen suçluluk ve depresyon döngüsünü yansıtır. Kişi impulsif davranışlar sergiledikten sonra yoğun pişmanlık yaşabilir.`);
      break;

    case 'DPt':
    case 'PtD':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (27/72 Kodu):** Bu profil, gerginlik, depresyon, anksiyete, suçluluk ve kendini değersizleştirme gibi yoğun içsel sıkıntılarla karakterizedir. Kişi kronik endişe ve umutsuzluk yaşar.`);
      break;

    case 'HyPd':
    case 'PdHy':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (34/43 Kodu):** Bu profil, manipülatif davranışların ve somatik yakınmaların birleştiği karmaşık bir yapıyı gösterir. Kişi hem fiziksel hem de davranışsal şikayetler üzerinden dikkat çekme eğilimindedir.`);
      break;

    case 'PdPa':
    case 'PaPd':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (46/64 Kodu):** Bu profil, yoğun bir kızgınlık, küskünlük ve güvensizlik örüntüsünü gösterir. Kişi otoriteye karşı paranoid tutumlar sergileyebilir ve sosyal kurallara karşı agresif olabilir.`);
      break;

    case 'PdSc':
    case 'ScPd':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (48/84 Kodu):** Bu profil, antisosyal eğilimlerin psikotik belirtilerle birleştiği ciddi bir duruma işaret eder. Kişi hem davranış bozuklukları hem de gerçeklik algısında problemler yaşayabilir.`);
      break;

    case 'PdMa':
    case 'MaPd':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (49/94 Kodu):** Bu profil, impulsivite ve antisosyal davranışların hipertimik özelliklerle birleştiğini gösterir. Kişi aşırı enerji ve riskli davranışlar sergileyebilir.`);
      break;

    case 'PaSc':
    case 'ScPa':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (68/86 Kodu):** Bu profil ciddi bir psikopatolojiye işaret edebilir. Kişi, kendini diğer insanlardan soyutlanmış ve yabancılaşmış hisseder. Paranoid düşünceler ve psikotik belirtiler görülebilir.`);
      break;

    case 'PtSc':
    case 'ScPt':
      interpretations.push(interpretPsychasteniaSchizophreniaCode(scores.Pt, scores.Sc, scores));
      break;

    case 'PtMa':
    case 'MaPt':
      interpretations.push(interpretPsychasteniaHypomaniaCode(scores.Pt, scores.Ma, scores));
      break;

    case 'PtSi':
    case 'SiPt':
      interpretations.push(interpretPsychasteniaIntroversionCode(scores.Pt, scores.Si, scores));
      break;

    case 'ScMa':
    case 'MaSc':
      interpretations.push(`**Profilin Ayırıcı Özellikleri (89/98 Kodu):** Bu profil, ben-merkezci ve başkalarından çocuksu beklentileri olan bireyleri tanımlar. Psikotik belirtiler ve hipertimik özellikler birlikte görülebilir.`);
      break;
  }

  // Üçlü kod tipi kontrolleri
  if (elevatedScales.length >= 3) {
    const thirdScale = third;
    const tripleCode = `${highest}${second}${thirdScale}`;
    
    // Nevrotik Üçlü (123/213/321)
    if ((highest === 'Hs' && second === 'D' && thirdScale === 'Hy') ||
        (highest === 'D' && second === 'Hs' && thirdScale === 'Hy') ||
        (highest === 'Hy' && second === 'D' && thirdScale === 'Hs')) {
      interpretations.push(`**Özel Profil Örüntüsü (123 Kodu - Nevrotik Üçlü):** Bu profil, yorgunluk, güçsüzlük ve çeşitli bedensel yakınmalarla kendini gösteren kronik bir duruma işaret eder. Bireyde genellikle depresif ve ilgisiz bir ruh hali hakimdir. Atılgan olmayan, risk almaktan çekinen ve bağımlı bir yapı sergileyebilir.`);
    }
    
    // Psikotik Vadi (687/867/678)
    if ((highest === 'Pa' && second === 'Sc' && scores.Pt < Math.min(scores.Pa, scores.Sc) - 10) ||
        (highest === 'Sc' && second === 'Pa' && scores.Pt < Math.min(scores.Pa, scores.Sc) - 10)) {
      interpretations.push(`**Özel Profil Örüntüsü (687 Kodu - Psikotik Vadi):** Bu örüntü, 6. ve 8. alt testlerin yüksek, 7. alt testin ise bunlardan belirgin şekilde (genellikle 10 T puanı veya daha fazla) düşük olmasıyla karakterizedir. Ciddi bir psikopatolojiye, genellikle paranoid şizofreniye işaret eder. Halüsinasyonlar, hezeyanlar ve sanrılar görülebilir.`);
    }
  }

  return interpretations;
}

/**
 * Depresyon-Histeri Kod Yorumlama (23/32)
 */
function interpretDepressionHysteriaCode(DScore: number, HyScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (23/32 Kodu):**\n\n`;
  
  const codeType = DScore > HyScore ? '23' : '32';
  const isWithinRange = Math.abs(DScore - HyScore) <= 5;
  
  if (codeType === '23' || isWithinRange) {
    interpretation += `**23 Kodu:** Bireyler kendilerini sıklıkla (özellikle düşük Ma) zayıf, yorgun ya da tükenmiş hissederler ve bunların depresyonu genellikle uzun sürelidir. Mutsuzluğa tolere ederler ve görevlere başlayamadıkları ya da başladıklarında tamamlayamadıkları için düşük bir etkinlik düzeyinde fonksiyon göstermeyi kabul ederler.

**Temel Özellikler:**
• Histeroid savunmaların yetersiz kullanımı sonucu ortaya çıkar
• Azalmış aktivite düzeyi, apati ve çaresizlik içeren depresyon
• Kişilik özellikleri olarak immatür, yetersiz ve bağımlı
• Kronik sorunlarına alışmışlar ve yıllar boyunca azalmış etkinlik düzeyinde işlevlerini sürdürürler
• Bedensel yakınmalar sıklıkla histerik niteliktedir ve değişkendir

**Tedavi Yaklaşımı:**
Bu hastalar psikoterapiye dirençlidir çünkü kronik sorunlarına nasıl uyum yapacaklarını öğrenmişlerdir. Değişime ilişkin motivasyonları düşüktür.`;
  } else {
    interpretation += `**32 Kodu:** Bu bireyler sağlıkları ve bir ölçüde de belirgin olmayan depresyonları ile fazlaca ilgilenirler. Yorgunluk, gastrik yakınmalar, baş ağrıları ve baş dönmesi geneldir. Genellikle bu semptomlar hafiftir ve anksiyete ve depresyon duyguları aşırı biçimde kontrol etme çabaları ile açık olarak ilişkilidir.

**Erkeklerde:**
• Anksiyeteyle ilgili olarak genellikle gergin ve meraklıdırlar
• İş sorunları ile kendilerini üzerler, gerginliğin sonucu semptomlar ortaya çıkar
• Bedensel sorunlarının psikolojik yorumlarını reddederler ve içgörüleri yoktur

**Kadınlarda:**
• Sıklıkla sorunlu evlilik öyküsü
• Depresiftirler, kocalarının sadakatsizliğından ve alkol almasından yakınırlar
• Eleştiriye ya da reddedilmeye karşı aşırı duyarlıdırlar
• Kronik mutsuzluğu tolere edeceklerdir
• Yorgunluk ve tükenmişlikten yakınabilirler`;
  }
  
  return interpretation;
}

/**
 * Depresyon-Psikopatik Sapma Kod Yorumlama (24/42)
 */
function interpretDepressionPsychopathicCode(DScore: number, PdScore: number, scores: Record<string, number>): string {
  return `**Profilin Ayırıcı Özellikleri (24/42 Kodu):**

Bu tür profil veren hastalar, immatür, bağımlı ve ben merkezcidirler. Dürtülerini kontrol etmede zorluk çekerler, ancak şu anda depresyon, pişmanlık ve suçluluk yaşamaktadırlar.

**Temel Özellikler:**
• Sosyal olarak kabul edilmeyen bir biçimde eyleme vurmadan sonra rahatsızlık yaşarlar
• Görünen suçluluk duyguları şiddetli olsa da eyleme vuruk davranışlar gelecekte döngüsel bir biçimde tekrarlanır
• Aile ile ilişki sorunları, iş kaybı öyküsü bu örüntüye eşlik eder
• Ağır bir biçimde madde kötüye kullanımı ya da alkolizm ve yasal sorunları sıktır

**Ergenlerde:**
• Kabul edilmiş sosyal standartlara belirgin bir aldırmazlık
• Otorite figürlerine karşı küskün, tartışmacı
• Başkaları ile yakınlık kurmaktan korkan, suçlayıcı
• Yasal ihlaller, evden ya da tedavi merkezlerinden kaçma

**İlaç Yaklaşımı:**
Bu kişiler davranışlarını değiştirmek için kesin bir biçimde niyetli olabilirler ancak bu örüntü devamlıdır ve uzun sürede prognoz iyi değildir. Tedavide katı sınırlamalar, stratejik terapi yordamaları, sık görüşme ve çevresel düzenlemelerin bir arada kullanımı çok yardımcı olabilir.

**Olası Tanı:**
• Psikopatik Kişilik Bozukluğu tanısı konulan bireylerde duruma bağlı depresyon
• Dürtü Kontrol Bozukluğu
• Stres karşısında alkol ya da madde kullanımı`;
}

/**
 * Depresyon-Psikasteni Kod Yorumlama (27/72)
 */
function interpretDepressionPsychastheniaCode(DScore: number, PtScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (27/72 Kodu):**

Bu kodlar psikiyatri poliklinikleri başvuranlar arasında çok görülür. Gerginlik, depresyon, sinirlilik, kaygı, suçluluk, kendini değersizleştirme, aşırı biçimde kendini sorgulama ve boşuna aynı şeyler üzerinde sürekli olarak durma çok görülen özelliklerdir.

**Temel Belirtiler:**
• Yetersizlik duyguları, kendine güvenin olmaması
• İş etkiliğinin azalması ve uykusuzluk
• Düşüncelerindeki katılık, doğru ve yanlış konular üzerinde çok fazla durma
• Aşırı kontrollü olma ve duygularını açık olarak ifade etmekte zorluk
• Kişiler arası ilişkilerde sıklıkla bağımlılık ve pasiflik`;

  // Özel alt kod yorumları
  if (scores.Hs >= 65) {
    interpretation += `\n\n**273/723 Alt Kodu:** Pasif kişiler, kişiler arası ilişkilerinde çok bağımlı oldukları zamanlar kendilerini çok rahat hissederler. Kendilerinin korunma ve bakım altında bulundurulmalarına çok kolay adapte olurlar. Çoğunlukla kendileri için çok yüksek standartlar belirleyerek stres yaşarlar.`;
  }
  
  if (scores.Pd >= 65) {
    interpretation += `\n\n**274/724 Alt Kodu:** Yoğun yetersizlik ve suçluluk duyguları vardır. Kendilerini küçülterek, kendi zayıflık ve yetersizlikleri ile sürekli uğraşırlar. İntihar düşünceleri, niyeti ve planı sıklıkla görülür. Bu açıdan dikkatle değerlendirilmelidir.`;
  }
  
  if (scores.Mf >= 70 || scores.Mf <= 35) {
    interpretation += `\n\n**275/725 Alt Kodu:** Endişe, depresyon ve aşırı düzeyde aynı şeyler üzerinde durmaya ek olarak çekingenlik görülür. Kronik bir başarısızlık duygusu ya da kendilik konusunda ambivalansları vardır. Karşı cinsle ilişkilerde güçlükler vardır.`;
  }
  
  if (scores.Sc >= 65) {
    interpretation += `\n\n**278/728 Alt Kodu:** ⚠️ **İNTİHAR RİSKİ:** Gergin, kaygılı, depresif, aşırı biçimde aynı şeyler üzerinde duran ve kendilerine ilişkin kuşkularla dolu olan bu bireylerde intihar düşüncesi ya da girişimi olasılığı yüksektir. Obsesif düşünme, korkular ve fobiler çok görülür.`;
  }

  interpretation += `\n\n**Terapi Prognozu:**
27 kod tiplerindeki yükselmeler bireyin psikoterapi için iyi aday olmasının göstergesidir, çünkü bu genellikle içsel rahatsızlık ve kendini sorgulama eğilimini değiştirmek için güdülenmiş olmanın işaretidir. Ancak çok fazla yükselmeler (85 T puanının üstünde) sıklıkla bireyin sözel terapide yeterli derecede odaklaşamayacak kadar ajite ve endişeli olduğu anlamına gelir.`;

  return interpretation;
}

/**
 * Depresyon-Şizofreni Kod Yorumlama (28/82)
 */
function interpretDepressionSchizophreniaCode(DScore: number, ScScore: number, scores: Record<string, number>): string {
  return `**Profilin Ayırıcı Özellikleri (28/82 Kodu):**

Bu kod tipindeki kişiler anksiyete ve ajitasyonla birlikte şiddetli depresyon yaşayan hastalardır. Depresyon ve ajitasyon, genellikle dikkat ve konsantrasyonda azalma, unutkanlık ve konfüzyon hali ortaya çıkarabilir.

**Temel Belirtiler:**
• Obsesif ruminasyonlar sergilerler
• Düşünce bozuğu, yorgunluk gibi somatik yakınmalar sık görülür
• Kişiler arası ilişkilerden ve aktivitelerden kendilerini izole edip çekilme eğilimleri
• İntihar girişimleri olabilir - dikkat edilmesi gerekir
• "Şizofrenik" özellikler de gösterebilirler
• İşitsel ve görsel halüsinasyonlar ve sistemli hezeyanlar olabilir

**Ergenlerde Özel Özellikler:**
• Başkaları ile duygusal bağlar kurmaktan korkarlar
• Duygusal bağımlılıkları ve cinsellik konusunda çatışmaları
• Çocukluk döneminde tekrarlanan incinme öyküsü
• Karşı cinsle ilişkileri genellikle çok az, üstelik sorunlar ya da sapkın davranışları içerir
• Duygularını uygun olmayan biçimlerde gösterirler

**Alt Kodlar:**
**281/821:** Çok çeşitli somatik yakınmaları vardır. Genellikle belirsiz ya da medikal yönden atipiktir ve titremeler, düşünme güçlükleri ya da hatta somatik delüzyonlar içerebilir.

**284/824:** Yetişkinlerde bu kod sıklıkla şizoid ya da şizofrenik durumlarla bağlantılıdır. Kızgınlık, isyankârlık, başkalarının uzak ve soğuk olma duyguları güçlü bileşenlerdir.

**287/827:** Depresyon, kaygı ve tanjansiyel düşünce süreçleri gösterirler. Mental konfüzyon, uykusuzluk, halüsinasyonlar ya da açık düşünce bozuklukları vardır.

**Prognoz:**
Bu bireylerde terapötik ilişki kurmak zordur, psikoterapi prognozu kötüdür. Psikofarmakoloji en azından başlangıçta yararlı olabilir.`;
}

/**
 * Depresyon-Hipomani Kod Yorumlama (29/92)
 */
function interpretDepressionHypomaniaCode(DScore: number, MaScore: number, scores: Record<string, number>): string {
  return `**Profilin Ayırıcı Özellikleri (29/92 Kodu):**

Bu gruptaki kişiler benmerkezcil ve narsistik olma eğilimindedirler. Kendi değerlerini abartırlar. 29/92 profil kodlu bireyleri yüksek enerji düzeyine sahiptirler, ancak bu depresyon ve kaygı ile bağlantılıdır.

**Üç Tip Birey Bu Kodu Elde Eder:**

**1. Ajite Depresyonu Olan Bireyler:**
• Ağlama, feryat etme, depresif ruminasyonlar belirgindir
• Çocuklar gibi ilgi çekmek için çok fazla duygusal olabilirler

**2. Alttaki Depresyonları ile Manik Savunmalar Kullanan Bireyler:**
• Büyüklük düşünceleri ve inkar, depresyonu maskelemede yeterli olabilir
• Ancak çoğunlukla bu savunmalar uzun süre etkili değildir
• Sıklıkla daha sonra çok fazla içki içme davranışına dönerler

**3. Organik Beyin Sendromu Olan Bireyler:**
• İşlevsellik ve yeteneklerindeki azalmanın farkında ama bunu inkar etmeye çalışan
• Başkalarından saklamaya çalışan bireyler
• Daha önce kolaylıkla yaptıkları şeyleri yapamamanın eksikliğine bağlı ajitasyon

**Prognoz:**
Yüksek enerji düzeyi ya başa çıkmayı ya da bir kontrol kaybını telafi etme girişimini temsil eder. Sıklıkla test 3 ya da 4, üçüncü en yüksek testtir.`;
}

/**
 * Depresyon-Sosyal İçedönüklük Kod Yorumlama (20/02)
 */
function interpretDepressionSocialIntroversionCode(DScore: number, SiScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (20/02 Kodu):**

Bu bireylerde sinirlilik, zayıflık, yorgunluk, benlik değerinde düşme belirgin özelliklerdir. Bu kod sosyal olarak geri çekilmiş hafif, ancak kronik depresyonu olan bireyleri gösterir.

**Temel Özellikler:**
• Depresyon sıklıkla bireyin kişiler arası ve sosyal becerilerinin kötü olması ile bağlantılıdır
• Aşağılık ve utançlık duyguları ile birliktedir
• Özellikle sosyal ilişkilerde kendilerini sinirli ve engellenmiş hissederler
• Çok az arkadaşları vardır
• Çoğu fiziksel olarak çekici olmadığını da düşünür
• Uykusuzluk, suçluluk duyguları ve endişe sıklıkla vardır`;

  if (scores.Pt >= 65) {
    interpretation += `\n\n**207 Alt Kodu:** Bu kod tipindeki bireyler gergin, kaygılı, ürkek kişilerdir. Kendilik değerlerinde düşme vardır. Şizoid içe çekilme gösterirler. Sosyal ortamlarda yetersizlik duygusu ve gerçek sosyal beceri eksikliği ile içe dönük tutum sergilerler. Bu bireylerin saldırganlık ve öfke patlamaları göstermesi beklenmez.`;
  }

  interpretation += `\n\n**Olası Tanı:** Pasif-Agresif Kişilik

Bu kod tipinde çoğunlukla test 7 ya da 4, üçüncü en yüksek testtir.`;

  return interpretation;
}

/**
 * Düşük puan yorumları
 */
function interpretLowScores(clinicalScales: Record<string, MMPIScaleResult>): string[] {
  const interpretations: string[] = [];

  const D = clinicalScales.D?.tScore || 30;
  const Si = clinicalScales.Si?.tScore || 30;

  // Düşük Depresyon Puanı
  if (D < 35) {
    interpretations.push(`**Düşük Depresyon Puanı (D - T=${D}):** Depresyon alt testindeki bu belirgin düşüklük, kişinin neşeli, iyimser ve enerjik olduğunu gösterebilir. Ancak, aynı zamanda kişinin kendi olumsuz duygularıyla yüzleşmekten kaçındığına da işaret edebilir.`);
  }

  // Düşük Sosyal İçedönüklük Puanı
  if (Si < 35) {
    interpretations.push(`**Düşük Sosyal İçedönüklük Puanı (Si - T=${Si}):** Sosyal İçedönüklük alt testindeki bu belirgin düşüklük, kişinin aşırı dışadönük, sosyal, konuşkan ve insanlarla birlikte olmaya yoğun ihtiyaç duyan bir yapıda olduğunu gösterir.`);
  }

  return interpretations;
}

/**
 * Genel özet oluşturma
 */
function generateOverallSummary(results: MMPIResults): string {
  const elevatedScales = Object.entries(results.clinicalScales)
    .filter(([_, result]) => result.tScore >= 65)
    .sort(([, a], [, b]) => b.tScore - a.tScore);

  let summary = "MMPI profil analizi, danışanın kişilik yapısı ve potansiyel psikolojik zorlukları hakkında önemli bilgiler sağlamaktadır. ";

  if (elevatedScales.length === 0) {
    summary += "Profil, genel olarak normal sınırlar içerisindedir ve ciddi psikopatolojik belirtiler görülmemektedir.";
  } else if (elevatedScales.length === 1) {
    summary += `Profilde öne çıkan tek yükselme ${elevatedScales[0][0]} ölçeğindedir. Bu, kişinin belirli bir alanda zorlanma yaşadığını ancak genel işlevselliğinin korunmuş olduğunu gösterir.`;
  } else if (elevatedScales.length <= 3) {
    summary += `Profilde ${elevatedScales.length} ölçekte yükselme gözlenmektedir. Bu, karmaşık bir psikolojik tablo işaret eder ve multidisipliner yaklaşım gerektirebilir.`;
  } else {
    summary += "Profilde yaygın yükselmeler gözlenmektedir. Bu durum, ciddi psikolojik sıkıntı veya kronik stres gösterebilir ve kapsamlı tedavi planlaması gerektirebilir.";
  }

  // Geçerlik durumu hakkında bilgi ekle
  const L = results.validityScales.L?.tScore || 50;
  const F = results.validityScales.F?.tScore || 50;
  const K = results.validityScales.K?.tScore || 50;
  
  if (F > 90 || L > 75 || K > 75) {
    summary += " Geçerlik ölçeklerindeki yükselmeler, sonuçların dikkatli yorumlanması gerektiğini göstermektedir.";
  }

  return summary;
}

/**
 * Klinik öneriler oluşturma
 */
function generateClinicalRecommendations(results: MMPIResults): string[] {
  const recommendations: string[] = [];

  const elevatedScales = Object.entries(results.clinicalScales)
    .filter(([_, result]) => result.tScore >= 65)
    .map(([scaleId, result]) => ({ scale: scaleId, score: result.tScore }));

  if (elevatedScales.length === 0) {
    recommendations.push("Profil normal sınırlar içerisinde olduğundan, önleyici ruh sağlığı hizmetleri ve kişisel gelişim odaklı yaklaşımlar önerilir.");
    return recommendations;
  }

  // Genel öneriler
  recommendations.push("MMPI sonuçları, detaylı klinik değerlendirme ile desteklenmelidir.");
  
  // Spesifik öneriler
  const hasDepression = elevatedScales.some(s => s.scale === 'D' && s.score >= 65);
  const hasAnxiety = elevatedScales.some(s => s.scale === 'Pt' && s.score >= 65);
  const hasPsychotic = elevatedScales.some(s => (s.scale === 'Sc' || s.scale === 'Pa') && s.score >= 75);
  const hasPersonality = elevatedScales.some(s => s.scale === 'Pd' && s.score >= 65);

  if (hasDepression) {
    recommendations.push("Depresif belirtiler nedeniyle bireysel psikoterapi ve/veya antidepresan tedavi değerlendirmesi önerilir.");
  }

  if (hasAnxiety) {
    recommendations.push("Anksiyete yönetimi için kognitif davranışçı terapi ve gevşeme teknikleri önerilir.");
  }

  if (hasPsychotic) {
    recommendations.push("Psikotik belirtiler riski nedeniyle acil psikiyatrik değerlendirme ve olası antipsikotik tedavi değerlendirmesi gereklidir.");
  }

  if (hasPersonality) {
    recommendations.push("Kişilik dinamikleri nedeniyle uzun süreli psikoterapi ve sosyal uyum programları önerilir.");
  }

  // Sosyal ve çevresel öneriler
  const somaticScales = elevatedScales.filter(s => ['Hs', 'Hy'].includes(s.scale));
  if (somaticScales.length > 0) {
    recommendations.push("Somatik yakınmalar için multidisipliner yaklaşım (tıbbi + psikolojik) önerilir.");
  }

  recommendations.push("Düzenli psikolojik kontroller ve tedavi yanıtının izlenmesi önemlidir.");

  return recommendations;
}

/**
 * Hipokondriazis (Hs) Alt Testi Detaylı Yorumlama
 */
function interpretHsScale(HsScore: number): string {
  let interpretation = `**Hipokondriazis (Hs) - T=${HsScore}:** `;
  
  if (HsScore >= 84) {
    interpretation += `Yakınmaları bütün organ sistemlerine yayılmış olan kişilerle görülür. Ağrı, yorgunluk ve güçsüzlük sıklıkla vardır. Somatik ilgiler somatik delüzyonlara dönüş demektir. Bu belki de şizofrenik bir epizodun başlangıcıdır.

**Hs Alt Testinden Yüksek Puan Alan Bireyin Özellikleri:**
• Aşırı bedensel uğraşları vardır, somatik delüzyonlar görülebilir
• Somatik semptomlar genellikle belirsizdir, eğer belirginse temelde mide ve karın bölgesine ilişkindir
• Kronik yorgunluk, ağrı ve güçsüzlükten yakınır
• Somatoform, depresyon ya da anksiyete bozukluğu tanısı konulabilir
• Kendine odaklaşmış, bencil ve narsistiktir
• Karamsar, yıkıcı, alaycı bir yapısı vardır
• Doyumsuz ve mutsuzdurlar, diğerlerini bıktırırlar
• Diğerlerine bağımlı ve eleştiricidir
• Düşmanlığını dolaylı yollardan ifade eder
• Semptomları için tıbbi açıklamalar ve tedavi isterler
• Psikoterapi ya da danışmanlığa içgörü eksikliği ve alaycı tavırları ile çok iyi yanıt vermez`;
    
  } else if (HsScore >= 75) {
    interpretation += `Bedensel yakınmalar ile çok fazla uğraşan bireylerde ortaya çıkmaktadır. Genel olarak iş yapma istekleri azalmıştır, benmerkezcil ve narsistiklerdir. Sürekli şikayet eder ve sızlanırlar. Yakınmalarını diğerlerine kabul ettirme eğilimleri çok fazladır, bu nedenle aşırı talep edici bir tutum içindedirler. Çevrelerindekileri rahatsız ederek öfkelerini ortaya çıkarırlar. Tipik olarak inatçı, kötümser, genel olarak yaşamda mutsuz, tutkusuzdurlar ve güdülenmişlerdir.`;
    
  } else if (HsScore >= 60) {
    interpretation += `Bu puanlar sıklıkla bu kişilerin hem şimdiki hem de geçmiş yaşantıda fiziksel bozukluk gösterdiğine işaret eder. Sağlık konularına bu ilgi, basit olarak yapıcı bir ilgi olabilir ya da sağlığa aşırı duyarlılığı temsil eder. Böyle kişiler kötümser olmaya ve yaşamlarını sıkıcı hale getirmeye eğilimlidirler. Bedensel hastalığı olan bireylerde 65 T puanının üstünde bir yükselme bu bireyin yaşadıkları güçlüklere aşırı tepki verdiklerini ve kabul edilmez dürtülerini somatizasyon ile ifade ettiklerini göstermektedir.`;
    
  } else if (HsScore >= 50) {
    interpretation += `Bu kişilerin beden konuları ile aşırı ilgilenmediği ve diğer klinik ölçekler (2,6,7,8 ya da 0) 70'in üzerine yükselmediği zaman günlük yaşam aktivitelerini yerine getirdiği söylenebilir. Bu kişiler sıklıkla yetenekli, sorumluluk sahibi, vicdanlı, dikkatli ve yargılamaları iyi olan kişilerdir. Spesifik tıbbi hastalığı olan bireyler bu alanda yer almaktadır.`;
    
  } else {
    interpretation += `Bu durum şu kişilerde görülebilir: 1) Hastalığın hiç konu olmadığı ailelerde yetişen bireyler, 2) Şimdiye kadar hiç ağrı, acı ya da hastalık geçirmediği ile övünç kişilerde. Bedensel yakınmaları ve genel sağlık durumları ile çok az ilgilenen kişilerdir. Genellikle uyanık, iyimser yeterli ve yaşamda etkin olan kişilerdir.

**Hs Alt Testinde Düşük Puan Alan Bireyin Özellikleri:**
• Somatik uğraşları yoktur
• İyimserdir, duyarlıdır
• İçgörüsü vardır
• Günlük yaşamda oldukça etkindir`;
  }

  return interpretation;
}

/**
 * Psikasteni-Şizofreni Kod Yorumlama (78/87)
 */
function interpretPsychasteniaSchizophreniaCode(PtScore: number, ScScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (78/87 Kodu):**\n\n`;
  
  const codeType = PtScore > ScScore ? '78' : '87';
  
  interpretation += `Psikolojik yardım arayan bireylerde oldukça sık görülür. Bu kodu alan bireyler nevrotik ve psikotik tanısı alabilirler. Yetişkinlerde 8 alt testi 7'den yüksekse, akut psikotik durum vardır. Ergenlerde ise 78 kodu 87 kodu kadar ciddi değildir.

**Temel Özellikler:**
• Endişeli, kaygılı, gergin ve tekrarlayıcı ruminasyonları olan kişilerdir
• Düşünce ve dikkatlerini toplama konusunda sorunları vardır  
• Stresleri o kadar fazladır ki uykusuzluk ve intihar düşünceleri görülebilir
• İntihar potansiyeli dikkatli bir biçimde değerlendirilmelidir
• Yakın kişilerarası ilişki kurmada güçlükleri vardır
• Genelde içedönük ve çekiniktirler

**Klinik Özellikler:**
• Karşı cinsle ilişkilerde yetersiz hissederler
• Yoğun kaygıya bağlı olarak cinsel performansları kötü olabilir
• Bu bireylerin çoğu gevşemek için aşırı alkol alırlar
• 8 alt testi 7 alt testinden daha yüksekse intihar girişimi tuhaftır ve kendine zarar vermeyi içerir

**Olası Tanılar:**
• 7>8: Birey düşünce ve davranış bozukluğu geliştirmemek için hala savaş vermektedir
• 7<8: Her iki yükselme de 75 T puanının üstünde ve 8 alt testinde belirgin bir yükselme varsa tanı şizofrenidir`;
  
  return interpretation;
}

/**
 * Psikasteni-Hipomani Kod Yorumlama (79/97) 
 */
function interpretPsychasteniaHypomaniaCode(PtScore: number, MaScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (79/97 Kodu):**\n\n`;
  
  interpretation += `Bu oldukça az görülen bir koddur. 8 ve 4, üçüncü yükselen alt testtir. Bu bireyler ajitasyon düzeyinde kaygı yaşarlar. Korkuları vardır, olaylara aşırı tepki verirler, korkularına ve yetersizliklerine bağlı olarak kendilerini gevşetmeleri ve bunlardan kurtulmaları mümkün değildir ve aşırı rüminasyon gösterirler.

**Klinik Tabloda:**
• Eğer 2 alt testi de yükselmişse depresyon görülür
• Ancak klinik tabloda anksiyete ve gerginlik ön plandadır
• Hastalar genellikle fiziksel semptomlar getirirler
• Bazı bireylerde manik örüntü vardır ve bu farmakolojik müdahale gerektirir

**Ergenlerde:**
• Bu kodu alan ergenlerin yoğun ilgi gereksinimleri vardır
• Ancak kontrolü kaybedeceklerini düşünerek böyle bir şey yapmaktan kaçınırlar  
• Ayrıca ergenlerde bağımlılık, bağımsızlık çatışması çok fazladır`;
  
  return interpretation;
}

/**
 * Psikasteni-Sosyal İçedönüklük Kod Yorumlama (70/07)
 */
function interpretPsychasteniaIntroversionCode(PtScore: number, SiScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (70/07 Kodu):**\n\n`;
  
  interpretation += `Bu profili veren kişiler gerçekte utangaç, içedönük, sosyal becerilerden yoksun, gergin, ve endişelidirler, uykusuzluktan yakınırlar. Oldukça nadir görülür. 2 ve 8 alt testleri, en sık görülen 3. yüksektir.

**Erkeklerde:**
• Sosyal yetenekler veya da fiziksel görünümler konusunda endişeli ve gergindirler
• Kendilerini yetersiz görürler
• Çoğunluğu içedönüktür bu sözelleştirmeyi de engeller
• Güvensizlikleri ve karar vermekteki güçlükleri onları konfüzyonda bırakır
• Aşırı kontrollüdürler ve kendilerini suçlarlar
• Ruminasyonları uykusuzluk ile sonlanır
• Anneleri ve kardeşleri ile yoğun çatışmaları vardır
• Sosyal alandaki yetersizlikleri, karşı cinsle ilişkilerini de etkilemektedir

**Kadınlarda:**
• Eğer 5 alt testi, 40 T puanının altında ise aynı örüntü vardır
• Bunlar yoksa sorunların ciddilik oranı daha azdır
• Kendilerinin ne olduğunun farkındadırlar
• Fiziksel görünüm olarak çekici olmadıklarını düşünürler
• Sosyal açıdan güvensizlik ve karşı cinsle rahat ilişki kuramama gibi sorunları vardır`;
  
  return interpretation;
}

/**
 * Şizofreni-Hipomani Kod Yorumlama (89/98)
 */
function interpretSchizophreniaHypomaniaCode(ScScore: number, MaScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (89/98 Kodu):**\n\n`;
  
  interpretation += `Bu kod tipi ergenlerde ve yetişkinlerde ciddi psikopatolojiyi gösterir. Benmerkezcidirler ve başkalarından çocuksu beklentileri vardır. Bu bireyler aşırı derecede idealize eden kişilerdir, günleri fanteziler, hayal kurmalar ve ruminasyonlar ile geçirirler.

**Klinik Özellikler:**
• Gerginlik, ajitasyon ve uykusuzluk vardır
• Genellikle çok konuşma, davranışsal huzursuzluk, duygusal labilite ve fikir uçuşmaları görülebilir
• Kişiler arası ilişkilerinde özellikle karşı cinsle ilişkilerde huzursuzluk oldukça tipiktir
• Bu bireyler yakın kişilerarası ilişkilerden korkarlar ve bu nedenle bu tür ilişki kurmaktan kaçınırlar
• Stres altında dağılma belirtileri vardır
• Kod daha da yükselirse delüzyon ve halüsinasyonlar görülür, psikotik bir tablo ortaya çıkar

**Demografik Özellikler:**
• Yaşı 27'den küçük olanlarda görülür
• Üçüncü yükselen alt test 7 ya da 6'dır

**Olası Tanılar:**
• Şizofreni
• Madde kullanımına bağlı psikoz`;
  
  return interpretation;
}

/**
 * Şizofreni-Sosyal İçedönüklük Kod Yorumlama (80/08)
 */
function interpretSchizophreniaIntroversionCode(ScScore: number, SiScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (80/08 Kodu):**\n\n`;
  
  interpretation += `Bu kod tipindeki 7 ve 2 alt tipleri en yüksek üçüncü koddur. Genellikle uzak ve sosyal açıdan çekingen kişilerdir.

**Temel Özellikler:**
• Kişiler arası ilişkilerde hata yapmak istemedikleri için ilişki kurmaktan kaçınırlar
• Kişisel fantezileri ile zamanlarını geçirirler
• Sosyal izolasyonları o kadar fazladır ki kendi ailelerinden bile uzaklaşırlar
• Bunun yanı sıra endişeli, kararsız, kaygılı, depresif ve diğerleri tarafından yanlış anlaşılan kişilerdir
• Kendilerini neyin rahatsız ettiği, ne istedikleri konusunda konfüzyonları vardır
• Atılgan değillerdir
• Danışmanlık görüşmelerinde genellikle konuşmazlar

**Olası Tanı:**
• Şizoid Kişilik`;
  
  return interpretation;
}

/**
 * Hipomani-Sosyal İçedönüklük Kod Yorumlama (90/09)
 */
function interpretHypomaniaIntroversionCode(MaScore: number, SiScore: number, scores: Record<string, number>): string {
  let interpretation = `**Profilin Ayırıcı Özellikleri (90/09 Kodu):**\n\n`;
  
  interpretation += `Bu kod oldukça nadirdir, özellikle erkeklerde çok nadir görülür. Bu nedenle bilgi azdır.

**Temel Özellikler:**
• Bu koddaki bireyler enerjik ve olasılıkla ajitedirler
• Genellikle yalnız kişilerdir
• Bu koddaki Si alt testinin yükselmesi bırakılarak yorum, yükselen diğer iki alt test ile yapılmalıdır
• Daha sonra eğer gerekirse Si alt testi yorumlanmalıdır`;
  
  return interpretation;
}