import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { TestSonucu } from '@/types';

// Register fonts with error handling
try {
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2' },
      { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2', fontWeight: 'bold' },
    ],
  });
} catch (error) {
  // Fallback to default fonts if network error
  console.warn('Font loading failed, using default fonts');
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    lineHeight: 1.5,
    color: '#374151',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderLeft: 4,
    borderLeftColor: '#2563eb',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    color: '#1f2937',
  },
  scoreCard: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
    textAlign: 'center',
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  resultBox: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#2563eb',
    marginBottom: 15,
  },
  resultText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#1f2937',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  subscaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  subscaleCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subscaleTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  subscaleScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#6b7280',
  },
  // MMPI specific styles
  mmpiScoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mmpiScoreItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  mmpiScaleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  mmpiScoreValue: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  mmpiRawScore: {
    fontSize: 8,
    color: '#6b7280',
  },
  mmpiProfileCode: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  mmpiValidityStatus: {
    fontSize: 10,
    color: '#059669',
  },
});

interface TestReportPDFProps {
  testSonucu: TestSonucu;
}

const formatDate = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }
  
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const TestReportPDF: React.FC<TestReportPDFProps> = ({ testSonucu }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PsikoTest Raporu</Text>
        <Text style={styles.subtitle}>{testSonucu.testAdi}</Text>
        <Text style={styles.date}>Oluşturulma Tarihi: {formatDate(new Date())}</Text>
      </View>

      {/* Test Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Bilgileri</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Test Adı</Text>
            <Text style={styles.infoValue}>{testSonucu.testAdi}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tamamlanma Tarihi</Text>
            <Text style={styles.infoValue}>{formatDate(testSonucu.tamamlanmaTarihi)}</Text>
          </View>
        </View>
      </View>

      {/* Toplam Puan - Sadece MMPI olmayan testler için */}
      {!testSonucu.mmpiSonuclari && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toplam Puan</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{testSonucu.puan}</Text>
          </View>
        </View>
      )}

      {/* MMPI Özel Sonuçları */}
      {testSonucu.mmpiSonuclari && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MMPI Profil Analizi</Text>
          
          {/* Geçerlik Ölçekleri */}
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>Geçerlik Ölçekleri</Text>
            <View style={styles.mmpiScoreGrid}>
              {Object.entries(testSonucu.mmpiSonuclari.gecerlikOlcekleri).map(([key, scale]) => (
                <View key={key} style={styles.mmpiScoreItem}>
                  <Text style={styles.mmpiScaleLabel}>{key}</Text>
                  <Text style={styles.mmpiScoreValue}>T: {scale.tSkoru}</Text>
                  <Text style={styles.mmpiRawScore}>Ham: {scale.hammaddePuan}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Klinik Ölçekler */}
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>Klinik Ölçekler</Text>
            <View style={styles.mmpiScoreGrid}>
              {Object.entries(testSonucu.mmpiSonuclari.klinikOlcekler).map(([key, scale]) => (
                <View key={key} style={styles.mmpiScoreItem}>
                  <Text style={styles.mmpiScaleLabel}>{key}</Text>
                  <Text style={styles.mmpiScoreValue}>T: {scale.tSkoru}</Text>
                  <Text style={styles.mmpiRawScore}>Ham: {scale.hammaddePuan}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Profil Kodu ve Durum */}
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.mmpiProfileCode}>Profil Kodu: {testSonucu.mmpiSonuclari.profilKodu}</Text>
            <Text style={styles.mmpiValidityStatus}>
              Geçerlik Durumu: {testSonucu.mmpiSonuclari.gecerlikDurumu === 'gecerli' ? 'Geçerli' : 'Geçersiz'}
            </Text>
          </View>
        </View>
      )}

      {/* Alt Ölçek Puanları (MMPI olmayan testler için) */}
      {!testSonucu.mmpiSonuclari && testSonucu.altOlcekPuanlari && Object.keys(testSonucu.altOlcekPuanlari).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alt Ölçek Puanları</Text>
          <View style={styles.subscaleGrid}>
            {Object.entries(testSonucu.altOlcekPuanlari).map(([key, olcek]) => (
              <View key={key} style={styles.subscaleCard}>
                <Text style={styles.subscaleTitle}>{olcek.ad}</Text>
                <Text style={styles.subscaleScore}>{olcek.toplamPuan}</Text>
                {olcek.baskın && (
                  <Text style={{ fontSize: 8, color: '#dc2626', marginTop: 2 }}>Baskın</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sonuç Değerlendirmesi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sonuç Değerlendirmesi</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{testSonucu.sonucYorumu}</Text>
        </View>
      </View>

      {/* Cevap Detayları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cevap Detayları</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Soru No</Text>
            <Text style={styles.tableHeaderCell}>Soru ID</Text>
            <Text style={styles.tableHeaderCell}>Verilen Puan</Text>
          </View>
          {testSonucu.cevaplar.slice(0, 50).map((cevap, index) => (
            <View 
              key={cevap.soruId} 
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{cevap.soruId}</Text>
              <Text style={styles.tableCell}>
                {cevap.verilenPuan === -1 ? 'Boş' : 
                 cevap.verilenPuan === 1 ? 'Doğru' : 
                 cevap.verilenPuan === 0 ? 'Yanlış' : 
                 cevap.verilenPuan}
              </Text>
            </View>
          ))}
          {testSonucu.cevaplar.length > 50 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontStyle: 'italic', textAlign: 'center' }]}>
                ... ve {testSonucu.cevaplar.length - 50} cevap daha
              </Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Bu rapor PsikoTest sistemi tarafından otomatik olarak oluşturulmuştur.
      </Text>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Sayfa ${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);