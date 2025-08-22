// Standart test uygulama arayüzü - her sayfada tek soru

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAppDispatch } from '@/hooks/useRedux';
import { useIsMobile } from '@/hooks/use-mobile';
import { testOturumuBaslat, cevapGuncelle, soruIndexGuncelle, testOturumuBitir, testSonucuKaydet } from '@/store/slices/testSlice';
import { TestTanimi, TestOturumu, Danisan } from '@/types';
import { danisanService } from '@/lib/db';
import { getTestSorulari, getTestTalimatlar, isCinsiyetGerekli } from '@/utils/testUtils';
import GenderSelectionModal from './GenderSelectionModal';


interface StandardTestInterfaceProps {
  test: TestTanimi;
  danisanId: number;
  onComplete: () => void;
}

export default function StandardTestInterface({ test, danisanId, onComplete }: StandardTestInterfaceProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  
  const [danisan, setDanisan] = useState<Danisan | null>(null);
  const [testSorulari, setTestSorulari] = useState<any[]>([]);
  const [testTalimatlar, setTestTalimatlar] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showGenderSelection, setShowGenderSelection] = useState(false);
  
  const [oturum, setOturum] = useState<TestOturumu>({
    testId: test.id,
    danisanId: danisanId,
    yontem: 'standart',
    aktifSoruIndex: 0,
    cevaplar: {},
    baslamaTarihi: new Date(),
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Danışan bilgilerini ve test sorularını yükle
  useEffect(() => {
    const loadDanisanAndTest = async () => {
      try {
        const danisanData = await danisanService.getir(danisanId);
        if (danisanData) {
          setDanisan(danisanData);
          
          // Cinsiyet kontrolü yap
          if (isCinsiyetGerekli(test, danisanData)) {
            setShowGenderSelection(true);
            setLoading(false);
            return;
          }
          
          const sorular = getTestSorulari(test, danisanData);
          const talimatlar = getTestTalimatlar(test, danisanData);
          setTestSorulari(sorular);
          setTestTalimatlar(talimatlar);
        }
        setLoading(false);
      } catch (error) {
        console.error('Danışan bilgileri yüklenirken hata:', error);
        setLoading(false);
      }
    };

    loadDanisanAndTest();
  }, [test, danisanId]);

  // Timer effect for elapsed time
  useEffect(() => {
    if (loading) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Test oturumunu başlat
    dispatch(testOturumuBaslat(oturum));

    return () => clearInterval(interval);
  }, [dispatch, loading]);

  useEffect(() => {
    // Mevcut soru için önceki cevabı yükle
    const mevcutSoru = testSorulari[oturum.aktifSoruIndex];
    if (mevcutSoru && oturum.cevaplar[mevcutSoru.id] !== undefined) {
      setSelectedAnswer(oturum.cevaplar[mevcutSoru.id]);
    } else {
      setSelectedAnswer(null);
    }
  }, [oturum.aktifSoruIndex, testSorulari, oturum.cevaplar]);

  const mevcutSoru = testSorulari.length > 0 ? testSorulari[oturum.aktifSoruIndex] : null;
  // Progress bar'ı aktif soru index'e göre hesapla (soru bazlı progress)
  const progress = testSorulari.length > 0 ? ((oturum.aktifSoruIndex + 1) / testSorulari.length) * 100 : 0;
  const isLastQuestion = testSorulari.length > 0 ? oturum.aktifSoruIndex === testSorulari.length - 1 : false;

  const handleAnswerSelect = useCallback((puan: number) => {
    if (!mevcutSoru) return;
    
    setSelectedAnswer(puan);
    
    // Cevabı oturuma kaydet
    const yeniCevaplar = { ...oturum.cevaplar, [mevcutSoru.id]: puan };
    setOturum(prev => ({ ...prev, cevaplar: yeniCevaplar }));
    dispatch(cevapGuncelle({ soruId: mevcutSoru.id, puan }));
  }, [mevcutSoru, oturum.cevaplar, dispatch]);

  const handleNext = () => {
    if (selectedAnswer === null) return;

    if (isLastQuestion) {
      handleTestComplete();
    } else {
      const yeniIndex = oturum.aktifSoruIndex + 1;
      setOturum(prev => ({ ...prev, aktifSoruIndex: yeniIndex }));
      dispatch(soruIndexGuncelle(yeniIndex));
    }
  };

  const handlePrevious = () => {
    if (oturum.aktifSoruIndex > 0) {
      const yeniIndex = oturum.aktifSoruIndex - 1;
      setOturum(prev => ({ ...prev, aktifSoruIndex: yeniIndex }));
      dispatch(soruIndexGuncelle(yeniIndex));
    }
  };

  const handleTestComplete = async () => {
    // Puanlama türüne göre hesaplama yap
    let toplamPuan = 0;
    let altOlcekPuanlari: Record<string, {
      toplamPuan: number;
      ortalamaPuan: number;
      ad: string;
      baskın?: boolean;
    }> | undefined;

    if (test.puanlamaTuru === 'coklu_alt_olcek' && test.altOlcekler) {
      // Çoklu alt ölçek puanlaması
      altOlcekPuanlari = {};
      
      Object.entries(test.altOlcekler).forEach(([key, altOlcek]) => {
        const altOlcekToplam = altOlcek.sorular.reduce((toplam, soruId) => {
          return toplam + (oturum.cevaplar[soruId] || 0);
        }, 0);
        
        const ortalamaPuan = altOlcekToplam / altOlcek.sorular.length;
        const baskın = ortalamaPuan >= 4.0;
        
        altOlcekPuanlari![key] = {
          toplamPuan: altOlcekToplam,
          ortalamaPuan: Math.round(ortalamaPuan * 100) / 100,
          ad: altOlcek.ad,
          baskın
        };
      });
      
      // Genel toplam puanı hesapla (tüm sorular)
      toplamPuan = Object.values(oturum.cevaplar).reduce((toplam, puan) => toplam + puan, 0);
    } else {
      // Basit puanlama
      toplamPuan = Object.values(oturum.cevaplar).reduce((toplam, puan) => toplam + puan, 0);
    }
    
    // Sonuç yorumunu bul
    const sonucYorumu = test.sonucYorumlari.find(yorum => 
      toplamPuan >= yorum.aralik[0] && toplamPuan <= yorum.aralik[1]
    )?.yorum || 'Sonuç yorumu bulunamadı';

    // Test sonucunu kaydet
    const testSonucu = {
      danisanId: danisanId,
      testId: test.id,
      testAdi: test.testAdi,
      tamamlanmaTarihi: new Date(),
      puan: toplamPuan,
      sonucYorumu: sonucYorumu,
      cevaplar: Object.entries(oturum.cevaplar).map(([soruId, puan]) => ({
        soruId,
        verilenPuan: puan
      })),
      altOlcekPuanlari
    };

    await dispatch(testSonucuKaydet(testSonucu));
    dispatch(testOturumuBitir());
    onComplete();
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    dispatch(testOturumuBitir());
    navigate(`/danisan/${danisanId}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenderSelectionComplete = async () => {
    // Cinsiyet seçildikten sonra danışan bilgilerini yeniden yükle
    const danisanData = await danisanService.getir(danisanId);
    if (danisanData) {
      setDanisan(danisanData);
      const sorular = getTestSorulari(test, danisanData);
      const talimatlar = getTestTalimatlar(test, danisanData);
      setTestSorulari(sorular);
      setTestTalimatlar(talimatlar);
    }
    setShowGenderSelection(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Test hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (showGenderSelection && danisan) {
    return (
      <GenderSelectionModal
        test={test}
        danisan={danisan}
        onComplete={handleGenderSelectionComplete}
      />
    );
  }

  if (!danisan || testSorulari.length === 0 || !mevcutSoru) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Test bulunamadı</h2>
          <p className="text-muted-foreground mt-2">Test soruları yüklenemedi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 page-transition">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleExit}
              size={isMobile ? "sm" : "default"}
            >
              <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{test.testAdi}</h1>
              <p className="text-sm text-muted-foreground">
                Soru {oturum.aktifSoruIndex + 1} / {testSorulari.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              %{Math.round(progress)} Tamamlandı
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Test Talimatları (İlk soruda göster) */}
        {oturum.aktifSoruIndex === 0 && testTalimatlar && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Test Talimatları</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-line">{testTalimatlar}</p>
            </CardContent>
          </Card>
        )}

        {/* Soru */}
        <Card className="transition-smooth">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-xl leading-relaxed">
              {mevcutSoru.metin}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3 sm:space-y-4"
            >
              {mevcutSoru.secenekler.map((secenek, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg border hover:bg-secondary/50 transition-smooth cursor-pointer touch-manipulation"
                  onClick={() => handleAnswerSelect(secenek.puan)}
                >
                  <RadioGroupItem 
                    value={secenek.puan.toString()} 
                    id={`option-${index}`}
                    className="mt-1 pointer-events-none flex-shrink-0"
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer leading-relaxed pointer-events-none text-sm sm:text-base"
                  >
                    {secenek.metin}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={oturum.aktifSoruIndex === 0}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Önceki
          </Button>

          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            {Object.keys(oturum.cevaplar).length} / {testSorulari.length} soru cevaplanmış
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            variant={isLastQuestion ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            {isLastQuestion ? (
              <>
                <FiCheck className="h-4 w-4 mr-2" />
                Testi Bitir
              </>
            ) : (
              <>
                Sonraki
                <FiArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Exit Confirmation Dialog */}
        <ConfirmationDialog
          open={showExitDialog}
          onOpenChange={setShowExitDialog}
          onConfirm={confirmExit}
          title="Testi Sonlandır"
          description="Testi sonlandırmak istediğinizden emin misiniz? Verdiğiniz cevaplar kaydedilmeyecektir."
          confirmText="Evet, Sonlandır"
          cancelText="Devam Et"
          variant="destructive"
        />
      </div>
    </div>
  );
}