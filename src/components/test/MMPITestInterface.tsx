import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TestTanimi } from '@/types';
import { testSonucuService } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { useAppSelector } from '@/hooks/useRedux';
import { calculateMMPIScores, generateMMPISummary, toPublicResults } from '@/lib/mmpi';
import GenderSelectionModal from './GenderSelectionModal';
import { danisanService } from '@/lib/db';
interface MMPITestInterfaceProps {
  test: TestTanimi;
  danisanId: number;
  onComplete: () => void;
}
export default function MMPITestInterface({
  test,
  danisanId,
  onComplete
}: MMPITestInterfaceProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // MMPI cinsiyet kontrolü için danışan bilgisi
  const {
    selectedDanisan
  } = useAppSelector(state => state.danisanlar);
  const danisan = selectedDanisan;
  const [showGenderSelection, setShowGenderSelection] = useState(!danisan?.cinsiyet);

  // State'ler - hooks kuralına uygun şekilde hep aynı sırada
  const [aktifSoruIndex, setAktifSoruIndex] = useState(0);
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({});
  const [bosCevaplar, setBosCevaplar] = useState<Set<string>>(new Set());
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputLockRef = useRef(false);

  // Temel değişkenler
  const toplamSoru = test.sorular.length;
  const aktifSoru = test.sorular[aktifSoruIndex];
  const cevaplanmisSoru = Object.keys(cevaplar).length;
  const bosCevapSayisi = bosCevaplar.size;
  const totalCevaplanan = cevaplanmisSoru + bosCevapSayisi;
  const progress = aktifSoruIndex > 0 ? aktifSoruIndex / toplamSoru * 100 : 0;
  const isLastQuestion = aktifSoruIndex === toplamSoru - 1;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Klavye kısayolları
  // Klavye kısayolları effect'i handleCevap tanımından sonra eklenir

  // LocalStorage ile ilerleme kaydetme
  const saveProgressToStorage = useCallback((soruIndex: number, cevaplar: Record<string, number>, bosCevaplar: Set<string>) => {
    const progressData = {
      danisanId,
      testId: test.id,
      aktifSoruIndex: soruIndex,
      cevaplar,
      bosCevaplar: Array.from(bosCevaplar),
      timestamp: Date.now()
    };
    localStorage.setItem(`mmpi_progress_${danisanId}`, JSON.stringify(progressData));
  }, [danisanId, test.id]);

  // İlerlemeyi localStorage'dan yükle
  useEffect(() => {
    const savedProgress = localStorage.getItem(`mmpi_progress_${danisanId}`);
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        // Son 24 saat içindeki ilerlemeyi kabul et
        if (Date.now() - progressData.timestamp < 24 * 60 * 60 * 1000) {
          setAktifSoruIndex(progressData.aktifSoruIndex);
          setCevaplar(progressData.cevaplar);
          setBosCevaplar(new Set(progressData.bosCevaplar));
          toast({
            title: "İlerleme Yüklendi",
            description: `Daha önce ${progressData.aktifSoruIndex + 1}. soruya kadar ilerlemişsiniz.`
          });
        }
      } catch (error) {
        console.error('İlerleme yükleme hatası:', error);
      }
    }
  }, [danisanId]);
  const handleCevap = useCallback((puan: number | 'bos') => {
    if (!aktifSoru) return;
    if (inputLockRef.current) return; // işlem devam ederken yeni girişleri engelle
    inputLockRef.current = true;
    let newCevaplar = cevaplar;
    let newBosCevaplar = bosCevaplar;
    if (puan === 'bos') {
      newBosCevaplar = new Set(bosCevaplar).add(aktifSoru.id);
      setBosCevaplar(newBosCevaplar);
      newCevaplar = {
        ...cevaplar
      };
      delete newCevaplar[aktifSoru.id];
      setCevaplar(newCevaplar);
    } else {
      newCevaplar = {
        ...cevaplar,
        [aktifSoru.id]: puan
      };
      setCevaplar(newCevaplar);
      newBosCevaplar = new Set(bosCevaplar);
      newBosCevaplar.delete(aktifSoru.id);
      setBosCevaplar(newBosCevaplar);
    }

    // Otomatik olarak sonraki soruya geç
    setTimeout(() => {
      const nextIndex = aktifSoruIndex < toplamSoru - 1 ? aktifSoruIndex + 1 : aktifSoruIndex;
      if (nextIndex !== aktifSoruIndex) {
        setAktifSoruIndex(nextIndex);
        // İlerlemeyi kaydet
        saveProgressToStorage(nextIndex, newCevaplar, newBosCevaplar);
      }
      inputLockRef.current = false;
    }, 300);
  }, [aktifSoru, aktifSoruIndex, toplamSoru, cevaplar, bosCevaplar, saveProgressToStorage]);

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!aktifSoru) return;
      if (e.repeat) return; // uzun basmada tekrarları engelle
      if (inputLockRef.current) return; // geçiş sırasında kilit

      const key = e.key.toLowerCase();
      if (key === '1' || key === 'd') {
        handleCevap(1);
      } else if (key === '2' || key === 'y') {
        handleCevap(0);
      } else if (key === '3' || key === ' ') {
        e.preventDefault();
        handleCevap('bos');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [aktifSoru, handleCevap]);
  const handleOncekiSoru = () => {
    if (aktifSoruIndex > 0) {
      setAktifSoruIndex(prev => prev - 1);
    }
  };
  const handleSonrakiSoru = () => {
    if (aktifSoruIndex < toplamSoru - 1) {
      setAktifSoruIndex(prev => prev + 1);
    }
  };

  // MMPI tam puanlama motoru - artık gerçek hesaplama yapılacak
  // Bu fonksiyon silinecek ve yeni motordan kullanılacak

  const handleTestiTamamla = async () => {
    if (totalCevaplanan < toplamSoru) {
      toast({
        title: "Eksik Cevaplar",
        description: `Henüz ${toplamSoru - totalCevaplanan} soru cevaplanmadı.`,
        variant: "destructive"
      });
      return;
    }

    // Cinsiyet bilgisini al (localStorage'dan veya danışan bilgilerinden)
    const cinsiyetBilgisi = danisan?.cinsiyet === 'Erkek' || danisan?.cinsiyet === 'Kadın' ? danisan.cinsiyet : localStorage.getItem(`danisan_${danisanId}_cinsiyet`) as 'Erkek' | 'Kadın' || 'Erkek';
    setIsLoading(true);
    try {
      // MMPI puanlama motoru ile hesaplama
      const results = calculateMMPIScores(cevaplar, bosCevaplar, cinsiyetBilgisi === 'Kadın' ? 'Kadin' : 'Erkek');
      const genelOzet = generateMMPISummary(results);
      const mmpiSonuclari = toPublicResults(results);

      // Toplam T-skoru hesaplama (genel puan için)
      const toplamTSkoru = Object.values(mmpiSonuclari.klinikOlcekler).reduce((sum, olcek) => sum + olcek.tSkoru, 0);
      await testSonucuService.ekle({
        danisanId,
        testId: test.id,
        testAdi: test.testAdi,
        tamamlanmaTarihi: new Date(),
        puan: Math.round(toplamTSkoru / Object.keys(mmpiSonuclari.klinikOlcekler).length) || 50,
        sonucYorumu: genelOzet,
        cevaplar: [...Object.entries(cevaplar).map(([soruId, verilenPuan]) => ({
          soruId,
          verilenPuan
        })), ...Array.from(bosCevaplar).map(soruId => ({
          soruId,
          verilenPuan: -1
        }))],
        mmpiSonuclari
      });

      // İlerleme kaydını temizle
      localStorage.removeItem(`mmpi_progress_${danisanId}`);
      toast({
        title: "Test Tamamlandı",
        description: results.validityStatus === 'valid' ? "MMPI analizi başarıyla tamamlandı ve kaydedildi." : "MMPI testi tamamlandı ancak geçerlilik sorunu tespit edildi."
      });
      onComplete();
    } catch (error) {
      console.error('Test sonucu kaydetme hatası:', error);
      toast({
        title: "Hata",
        description: "Test sonucu kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleExit = () => {
    setShowExitDialog(true);
  };
  const confirmExit = () => {
    navigate(`/danisan/${danisanId}`);
  };
  const handleGenderSelectionComplete = () => {
    setShowGenderSelection(false);
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Cinsiyet seçimi ekranı
  if (showGenderSelection && danisan) {
    return <GenderSelectionModal test={test} danisan={danisan} onComplete={handleGenderSelectionComplete} />;
  }

  // Loading state
  if (!aktifSoru) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Test bulunamadı</h2>
          <p className="text-muted-foreground mt-2">Soru verisi yüklenemedi.</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background p-2 sm:p-4 page-transition">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleExit} size={isMobile ? "sm" : "default"}>
              <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{test.testAdi}</h1>
              <p className="text-sm text-muted-foreground">
                Soru {aktifSoruIndex + 1} / {toplamSoru}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {formatTime(elapsedTime)}
            </Badge>
            
            {bosCevapSayisi > 0 && <Badge variant="outline" className="text-xs">
                {bosCevapSayisi} boş
              </Badge>}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={(aktifSoruIndex + 1) / toplamSoru * 100} className="h-2" />

        {/* Test Talimatları (İlk soruda göster) */}
        {aktifSoruIndex === 0 && <Alert>
            <AlertDescription className="text-sm">
              <strong>MMPI Talimatları:</strong> Her ifadeyi dikkatlice okuyun ve kendiniz için "DOĞRU" mu yoksa "YANLIŞ" mı olduğuna karar verin.
              <br />
              <strong>Klavye:</strong> 1/D = Doğru, 2/Y = Yanlış, 3/Boşluk = Bilmiyorum
            </AlertDescription>
          </Alert>}

        {/* Ana Soru Kartı */}
        <Card className="transition-smooth">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="leading-relaxed text-center sm:text-5xl text-3xl">
              {aktifSoru.metin}
            </CardTitle>
          </CardHeader>
          <CardContent className="my-[70px]">
            {/* MMPI Cevap Seçenekleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant={cevaplar[aktifSoru.id] === 1 ? "default" : "outline"} className="h-20 text-lg relative group hover:scale-105 transition-all" onClick={() => handleCevap(1)}>
                <CheckCircle className="w-6 h-6 mr-3" />
                <div className="flex flex-col">
                  <span className="font-semibold">DOĞRU</span>
                  
                </div>
              </Button>
              
              <Button variant={cevaplar[aktifSoru.id] === 0 ? "default" : "outline"} className="h-20 text-lg relative group hover:scale-105 transition-all" onClick={() => handleCevap(0)}>
                <XCircle className="w-6 h-6 mr-3" />
                <div className="flex flex-col">
                  <span className="font-semibold">YANLIŞ</span>
                  
                </div>
              </Button>
              
              <Button variant={bosCevaplar.has(aktifSoru.id) ? "default" : "outline"} className="h-20 text-lg relative group hover:scale-105 transition-all" onClick={() => handleCevap('bos')}>
                <HelpCircle className="w-6 h-6 mr-3" />
                <div className="flex flex-col">
                  <span className="font-semibold">BİLMİYORUM</span>
                  
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation - Sadece önceki buton ve test bitirme */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" onClick={handleOncekiSoru} disabled={aktifSoruIndex === 0} size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Önceki Soru
          </Button>

          

          <div className="flex gap-2">
            {isLastQuestion && totalCevaplanan >= toplamSoru && <Button onClick={handleTestiTamamla} disabled={isLoading} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
                {isLoading ? <>Kaydediliyor...</> : <>
                    <FiCheck className="h-4 w-4 mr-2" />
                    Testi Bitir
                  </>}
              </Button>}
          </div>
        </div>

        {/* Boş cevap uyarısı */}
        {bosCevapSayisi > 20 && <Alert variant="destructive">
            <AlertDescription>
              <strong>Uyarı:</strong> {bosCevapSayisi} soru boş bırakıldı. 30'dan fazla boş cevap testin geçersiz olmasına neden olur.
            </AlertDescription>
          </Alert>}

        {/* Exit Confirmation Dialog */}
        <ConfirmationDialog open={showExitDialog} onOpenChange={setShowExitDialog} onConfirm={confirmExit} title="Testi Sonlandır" description="Testi sonlandırmak istediğinizden emin misiniz? Verdiğiniz cevaplar kaydedilmeyecektir." confirmText="Evet, Sonlandır" cancelText="Devam Et" variant="destructive" />
      </div>
    </div>;
}