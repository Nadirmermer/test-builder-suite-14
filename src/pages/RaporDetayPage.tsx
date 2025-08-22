
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiClipboard, FiDownload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toast } from '@/hooks/use-toast';
import { testSonucuService } from '@/lib/db';
import { TestSonucu } from '@/types';
import TestResultChart from '@/components/test/TestResultChart';
import { pdf } from '@react-pdf/renderer';
import { TestReportPDF } from '@/components/pdf/TestReportPDF';
import { generateMMPIInterpretation, fromPublicResults } from '@/lib/mmpi';

export default function RaporDetayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testSonucu, setTestSonucu] = useState<TestSonucu | null>(null);
  const [loading, setLoading] = useState(true);

  const { selectedDanisan } = useAppSelector((state) => state.danisanlar);

  useEffect(() => {
    if (id) {
      const sonucId = parseInt(id);
      testSonucuService.getir(sonucId).then((sonuc) => {
        if (sonuc) {
          setTestSonucu(sonuc);
        }
        setLoading(false);
      });
    }
  }, [id]);

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

  const downloadPDF = async () => {
    if (!testSonucu) return;
    
    try {
      const blob = await pdf(<TestReportPDF testSonucu={testSonucu} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-raporu-${testSonucu.testAdi}-${formatDate(new Date()).replace(/[:/\s]/g, '-')}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Rapor İndirildi",
        description: "Test raporu PDF formatında başarıyla indirildi.",
      });
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: `PDF oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Rapor yükleniyor...</p>
      </div>
    );
  }

  if (!testSonucu) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground">Rapor bulunamadı</h2>
        <p className="text-muted-foreground mt-2">Bu test sonucu kaydı mevcut değil.</p>
        <Button 
          onClick={() => navigate('/danisanlar')} 
          variant="outline" 
          className="mt-4"
        >
          Danışanlar Listesine Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/danisanlar')}
          className="p-2"
        >
          <FiArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test Raporu</h1>
          <p className="text-muted-foreground">{testSonucu.testAdi}</p>
        </div>

        <div className="ml-auto">
          <Button variant="outline" className="gap-2" onClick={downloadPDF}>
            <FiDownload className="h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      </div>

      {/* Test Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiClipboard className="text-primary" />
            Test Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Test Adı</p>
              <p className="text-foreground">{testSonucu.testAdi}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tamamlanma Tarihi</p>
              <p className="text-foreground">{formatDate(testSonucu.tamamlanmaTarihi)}</p>
            </div>
            
            {/* Sadece MMPI olmayan testler için toplam puan göster */}
            {!testSonucu.mmpiSonuclari && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Puan</p>
                <p className="text-2xl font-bold text-primary">{testSonucu.puan}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Sonucu Grafikleri */}
      <TestResultChart testSonucu={testSonucu} showOverallScore={false} />

      {/* MMPI Kapsamlı Yorumlama */}
      {testSonucu.mmpiSonuclari && (() => {
        const mmpiResults = fromPublicResults(testSonucu.mmpiSonuclari);
        const interpretation = generateMMPIInterpretation(mmpiResults);
        return (
          <div className="space-y-6">
            {/* Geçerlik Yorumu */}
            <Card>
              <CardHeader>
                <CardTitle>Geçerlik Profili Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {interpretation.validityInterpretation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Klinik Ölçek Yorumları */}
            {interpretation.individualScaleInterpretations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Klinik Ölçek Analizi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interpretation.individualScaleInterpretations.map((interp, idx) => (
                    <div key={idx} className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {interp}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Kod Tipi Yorumları */}
            {interpretation.codeTypeInterpretations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Profil Kod Tipi Analizi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interpretation.codeTypeInterpretations.map((interp, idx) => (
                    <div key={idx} className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {interp}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Genel Özet */}
            <Card>
              <CardHeader>
                <CardTitle>Genel Değerlendirme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-foreground leading-relaxed">
                    {interpretation.overallSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Klinik Öneriler */}
            <Card>
              <CardHeader>
                <CardTitle>Klinik Öneriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {interpretation.clinicalRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-1">
                        {idx + 1}
                      </Badge>
                      <p className="text-foreground text-sm leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Standart Sonuç Yorumu */}
      {!testSonucu.mmpiSonuclari && (
        <Card>
          <CardHeader>
            <CardTitle>Sonuç Değerlendirmesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-foreground text-lg leading-relaxed">
                {testSonucu.sonucYorumu}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cevap Detayları */}
      <Card>
        <CardHeader>
          <CardTitle>Cevap Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testSonucu.cevaplar.map((cevap, index) => (
              <div key={cevap.soruId} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Soru {index + 1} ({cevap.soruId})
                </span>
                <Badge variant="secondary">
                  {cevap.verilenPuan} puan
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
