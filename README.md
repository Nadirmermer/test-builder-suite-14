# Psikolojik Test Uygulaması

Modern, güvenli ve kapsamlı psikolojik test uygulama platformu. MMPI, Beck serisi testler ve diğer standardize edilmiş psikolojik değerlendirme araçlarını dijital ortamda güvenle uygulayın.

## 🎯 Özellikler

### ✅ Tam MMPI Entegrasyonu
- **566 soruluk** tam MMPI-2 testi
- **Cinsiyet bazlı** T-skoru normları
- **K-düzeltmesi** otomatik uygulaması
- **Geçerlik kontrolü** ve profil analizi
- **Klinik yorumlama** motoru

### 📊 Test Koleksiyonu
- **MMPI** (Minnesota Çok Yönlü Kişilik Envanteri)
- **Beck Depresyon Envanteri** (BDI)
- **Beck Anksiyete Envanteri** (BAI)
- **Beck Umutsuzluk Ölçeği** (BUO)
- **Young Şema Ölçeği** (YSQ)
- **Anksiyete Duyarlılığı İndeksi** (ADI-3)

### 🔒 Güvenlik & Veri Koruma
- Şifreli veri saklama
- KVKV uyumlu veri işleme
- Güvenli PDF rapor oluşturma
- Danışan gizliliği koruması

## 🚀 Kullanım

### Yeni Danışan Ekleme
1. Ana sayfada "Yeni Danışan" butonuna tıklayın
2. Gerekli bilgileri doldurun
3. Danışan kaydı oluşturulur

### Test Uygulama
1. Danışan detay sayfasında "Test Uygula" butonuna tıklayın
2. Test seçimi yapın (Standart/Hızlı mod)
3. MMPI için cinsiyet seçimi gereklidir
4. Test uygulamasını tamamlayın

### Rapor Görüntüleme
- Test sonuçları otomatik kaydedilir
- Detaylı grafikler ve yorumlar
- PDF rapor oluşturma
- Geçmiş test karşılaştırması

## 🏗️ Yeni MMPI Modüler Mimarisi

### MMPI Kütüphanesi (`src/lib/mmpi/`)

MMPI entegrasyonu artık tamamen modüler bir yapıya sahiptir. Tek doğruluk kaynağı olarak `src/lib/mmpi/` klasörü kullanılır:

#### 📂 Dosya Yapısı
```
src/lib/mmpi/
├── mmpiData.ts          # Ham veriler (566 soru, puanlama anahtarları, T-skoru tabloları)
├── mmpiScoring.ts       # Hesaplama motoru (ham puan → T-skoru dönüşümü)
├── mmpiInterpretation.ts # Klinik yorumlama motoru
├── adapter.ts           # Format adaptörü (UI ↔ kütüphane arası dönüşüm)
└── index.ts            # Tek giriş noktası
```

#### 🎯 Public API

```typescript
// MMPI kütüphanesinin tüm fonksiyonları tek importla:
import { 
  calculateMMPIScores,     // Ana hesaplama motoru
  generateMMPIInterpretation, // Kapsamlı klinik yorumlama
  generateMMPISummary,     // Kısa özet metni
  toPublicResults,         // Kütüphane → UI format
  fromPublicResults        // UI → Kütüphane format
} from '@/lib/mmpi';
```

#### ⚙️ UI Kullanım Rehberi

**Test Interface'lerde:**
```typescript
// 1. Test sonuçlarını hesapla
const results = calculateMMPIScores(cevaplar, bosCevaplar, cinsiyet);

// 2. UI formatına dönüştür (TestSonucu.mmpiSonuclari için)
const mmpiSonuclari = toPublicResults(results);

// 3. Veritabanına kaydet
await testSonucuService.ekle({ ...testData, mmpiSonuclari });
```

**Rapor Sayfalarında:**
```typescript
// 1. Kayıtlı sonuçları kütüphane formatına dönüştür
const mmpiResults = fromPublicResults(testSonucu.mmpiSonuclari);

// 2. Kapsamlı yorumlama oluştur
const interpretation = generateMMPIInterpretation(mmpiResults);

// interpretation.validityInterpretation
// interpretation.individualScaleInterpretations
// interpretation.codeTypeInterpretations
```

#### 🔄 Genişletilebilirlik

Gelecekteki MMPI geliştirmeleri (Harris-Lingoes alt ölçekleri, içerik ölçekleri vb.) tamamen `src/lib/mmpi/` altında gerçekleşir:

1. **mmpiData.ts**: Yeni veri setleri eklenir
2. **mmpiScoring.ts**: Yeni hesaplama fonksiyonları eklenir  
3. **mmpiInterpretation.ts**: Yeni yorumlama kuralları eklenir
4. **index.ts**: Yeni fonksiyonlar dışa aktarılır

UI bileşenleri hiç etkilenmez - sadece yeni API fonksiyonlarını kullanır.

#### ✅ Doğrulama ve Güvenilirlik

- **Tek Kaynak Prensibi**: Tüm MMPI mantığı `src/lib/mmpi/` altında
- **Tip Güvenliği**: TypeScript ile tam tip koruması
- **Format Uyumluluğu**: Mevcut `TestSonucu.mmpiSonuclari` şeması korunur
- **Geriye Uyumluluk**: Mevcut PDF ve grafik bileşenleri çalışmaya devam eder

## 🏗️ Teknik Yapı

### Frontend
- **React** 18.3+ TypeScript ile
- **Tailwind CSS** modern tasarım sistemi
- **Shadcn/ui** bileşen kütüphanesi  
- **Redux Toolkit** state yönetimi
- **React Router** sayfa yönlendirme

### Backend & Storage
- **Dexie.js** IndexedDB abstraction
- **Yerel veri** tarayıcı depolama
- **Şifreli** danışan bilgileri
- **PDF Generation** @react-pdf/renderer

### Test Motoru
- **JSON bazlı** test tanımları  
- **Çoklu puanlama** sistemleri
- **Alt ölçek** hesaplamaları
- **Grafik visualizasyon** recharts

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

## 🔧 Geliştirme

### Yeni Test Ekleme
1. `public/tests/` klasörüne JSON test dosyası ekle
2. `public/tests/test-list.json` dosyasını güncelle
3. Gerekirse özel puanlama mantığı ekle

### Test Customization
- Test JSON formatları tam esnek
- Cinsiyete özel formlar desteklenir
- Çoklu alt ölçek yapıları mümkün

## 📄 Lisans

Bu proje kapalı kaynak olarak geliştirilmiştir. Kullanım hakları saklıdır.

---

**Geliştirici Notu**: Bu uygulama profesyonel psikolojik değerlendirme amacıyla tasarlanmıştır. Test sonuçları lisanslı psikolog/psikiyatrist gözetiminde değerlendirilmelidir.