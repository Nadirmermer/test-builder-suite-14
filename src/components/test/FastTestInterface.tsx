// Hızlı test giriş arayüzü - numpad tarzı giriş

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAppDispatch } from '@/hooks/useRedux';
import { useIsMobile } from '@/hooks/use-mobile';
import { testOturumuBaslat, testOturumuBitir, testSonucuKaydet } from '@/store/slices/testSlice';
import { TestTanimi, Danisan } from '@/types';
import { danisanService } from '@/lib/db';
import { getTestSorulari, getTestTalimatlar, isCinsiyetGerekli } from '@/utils/testUtils';
import GenderSelectionModal from './GenderSelectionModal';


interface FastTestInterfaceProps {
  test: TestTanimi;
  danisanId: number;
  onComplete: () => void;
}

export default function FastTestInterface({ test, danisanId, onComplete }: FastTestInterfaceProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [danisan, setDanisan] = useState<Danisan | null>(null);
  const [testSorulari, setTestSorulari] = useState<any[]>([]);
  const [testTalimatlar, setTestTalimatlar] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showGenderSelection, setShowGenderSelection] = useState(false);
  
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({});
  const [touchedQuestions, setTouchedQuestions] = useState<Set<string>>(new Set()); // Girilen ama işaretlenmemiş sorular için
  const [focusedQuestion, setFocusedQuestion] = useState<number>(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
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

  useEffect(() => {
    if (loading) return;
    
    // Timer effect
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Test oturumunu başlat
    dispatch(testOturumuBaslat({
      testId: test.id,
      danisanId: danisanId,
      yontem: 'hizli',
      aktifSoruIndex: 0,
      cevaplar: {},
      baslamaTarihi: new Date(),
    }));

    return () => clearInterval(interval);
  }, [dispatch, test.id, danisanId, loading]);

  // İlk soruya odaklan
  useEffect(() => {
    if (testSorulari.length > 0 && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [testSorulari]);

  const cevaplanmisSoruSayisi = Object.keys(cevaplar).length;
  const progress = (cevaplanmisSoruSayisi / testSorulari.length) * 100;

  // Minimum ve maksimum puanları belirle
  const minPuan = testSorulari.length > 0 ? testSorulari[0].secenekler[0]?.puan || 1 : 1;
  const maxPuan = testSorulari.length > 0 ? testSorulari[0].secenekler[testSorulari[0].secenekler.length - 1]?.puan || 6 : 6;

  const handleInputChange = (soruId: string, value: string, index: number) => {
    // Soruya dokunulduğunu işaretle
    setTouchedQuestions(prev => new Set(prev).add(soruId));
    
    if (value === '') {
      // Boş değer - cevabı sil
      setCevaplar(prev => {
        const newCevaplar = { ...prev };
        delete newCevaplar[soruId];
        return newCevaplar;
      });
      return;
    }
    
    const numValue = parseInt(value);
    // 0 değerine de izin ver (Beck Anksiyete gibi testler için)
    if (isNaN(numValue) || numValue < 0 || numValue > maxPuan) {
      return; // Geçersiz değer
    }

    setCevaplar(prev => ({ ...prev, [soruId]: numValue }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Tab ile geçilen soruları touched olarak işaretle
      const currentSoruId = testSorulari[index].id;
      setTouchedQuestions(prev => new Set(prev).add(currentSoruId));
      
      const nextIndex = index + 1;
      if (nextIndex < testSorulari.length) {
        setFocusedQuestion(nextIndex);
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 10);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < testSorulari.length) {
        setFocusedQuestion(nextIndex);
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 10);
      } else {
        // Son soru - testi tamamla
        handleTestComplete();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        setFocusedQuestion(index - 1);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < testSorulari.length - 1) {
        setFocusedQuestion(index + 1);
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 10);
      }
    }
  };

  const handleTestComplete = async () => {
    if (cevaplanmisSoruSayisi !== testSorulari.length) {
      setShowIncompleteDialog(true);
      return;
    }

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
          return toplam + (cevaplar[soruId] || 0);
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
      toplamPuan = Object.values(cevaplar).reduce((toplam, puan) => toplam + puan, 0);
    } else {
      // Basit puanlama
      toplamPuan = Object.values(cevaplar).reduce((toplam, puan) => toplam + puan, 0);
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
      cevaplar: Object.entries(cevaplar).map(([soruId, puan]) => ({
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

  if (!danisan || testSorulari.length === 0) {
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
              <p className="text-sm text-muted-foreground">Hızlı Numpad Giriş</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {cevaplanmisSoruSayisi} / {testSorulari.length}
            </Badge>
            <Badge variant={cevaplanmisSoruSayisi === testSorulari.length ? "default" : "outline"} className="text-xs">
              %{Math.round(progress)} Tamamlandı
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Test Talimatları */}
        {testTalimatlar && (
          <Alert>
            <FiInfo className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Test Talimatları:</strong> <span className="whitespace-pre-line">{testTalimatlar}</span>
              <br />
              <strong>Hızlı Giriş:</strong> Sadece 0-{maxPuan} arası sayı girin. Tab/Enter: sonraki soru, ↑↓ ok tuşları: önceki/sonraki soru. Aktif soruya odaklanın ve alt kısımdan seçenekleri de görebilirsiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* Puan Ölçeği Açıklama - En üste taşındı */}
        <Card className="border-muted">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">Puan Ölçeği:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {testSorulari.length > 0 && testSorulari[0].secenekler.map((secenek, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                    {secenek.puan}
                  </span>
                  <span className="text-muted-foreground">{secenek.metin}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sorular - Numpad Style */}
        <div className="space-y-3">
          {testSorulari.map((soru, index) => {
            const isAnswered = cevaplar[soru.id] !== undefined;
            const isTouched = touchedQuestions.has(soru.id);
            const isUnanswered = isTouched && !isAnswered;
            const isFocused = focusedQuestion === index;
            
            return (
              <Card 
                key={soru.id} 
                className={`transition-all duration-200 ${
                  focusedQuestion === index ? 'ring-2 ring-primary' : ''
                } ${
                  isAnswered ? 'border-success bg-success/5' : 
                  isUnanswered ? 'border-destructive bg-destructive/5' : 
                  'border-muted'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isAnswered ? 'bg-success text-success-foreground' :
                        isUnanswered ? 'bg-destructive text-destructive-foreground' :
                        'bg-primary text-primary-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <p className="text-sm text-foreground">{soru.metin}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cevaplar[soru.id]?.toString() || ''}
                        onChange={(e) => handleInputChange(soru.id, e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={() => {
                          setFocusedQuestion(index);
                          // Focus olunca da touched işaretle
                          const currentSoruId = testSorulari[index].id;
                          setTouchedQuestions(prev => new Set(prev).add(currentSoruId));
                        }}
                        className={`w-16 h-12 text-center text-lg font-bold ${
                          isUnanswered ? 'border-destructive' : ''
                        }`}
                        placeholder="?"
                        maxLength={2} // 0-9 için 2 haneli olmalı
                      />
                      <div className="text-xs text-muted-foreground">
                        <div className="font-mono">({0}-{maxPuan})</div>
                        {isAnswered && (
                          <Badge variant="secondary" className="mt-1">
                            ✓
                          </Badge>
                        )}
                        {isUnanswered && (
                          <Badge variant="destructive" className="mt-1">
                            !
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dinamik puan seçenekleri - sadece aktif soru için */}
                  {isFocused && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {soru.secenekler.map((secenek, secenekIndex) => (
                          <button
                            key={secenekIndex}
                            type="button"
                            onClick={() => handleInputChange(soru.id, secenek.puan.toString(), index)}
                            className={`p-2 text-xs rounded-md border transition-all duration-200 text-left ${
                              cevaplar[soru.id] === secenek.puan
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                            }`}
                          >
                            <div className="font-bold">{secenek.puan}</div>
                            <div className="text-xs opacity-75">{secenek.metin}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>


        {/* Sonuçları Hesapla */}
        <Card className="border-primary/20 bg-primary/5 sticky bottom-4 sm:static">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Test Tamamlandı mı?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {cevaplanmisSoruSayisi === testSorulari.length 
                    ? 'Tüm sorular cevaplanmış. Sonuçları hesaplayabilirsiniz.'
                    : `${testSorulari.length - cevaplanmisSoruSayisi} soru daha cevaplanması gerekiyor.`
                  }
                </p>
              </div>
              <Button
                onClick={() => {
                  if (cevaplanmisSoruSayisi !== testSorulari.length) {
                    // Eksik soruları bul ve ilkine odaklan
                    const firstUnanswered = testSorulari.findIndex(soru => 
                      cevaplar[soru.id] === undefined
                    );
                    if (firstUnanswered !== -1) {
                      setFocusedQuestion(firstUnanswered);
                      setTimeout(() => {
                        inputRefs.current[firstUnanswered]?.focus();
                        inputRefs.current[firstUnanswered]?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }, 100);
                    }
                  } else {
                    handleTestComplete();
                  }
                }}
                size={isMobile ? "sm" : "lg"}
                className="w-full sm:w-auto"
                variant={cevaplanmisSoruSayisi === testSorulari.length ? "default" : "secondary"}
              >
                <FiSave className="h-4 w-4 mr-2" />
                {cevaplanmisSoruSayisi === testSorulari.length 
                  ? "Sonuçları Hesapla" 
                  : "İlk Eksik Soruya Git"
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialogs */}
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

        <ConfirmationDialog
          open={showIncompleteDialog}
          onOpenChange={setShowIncompleteDialog}
          onConfirm={() => setShowIncompleteDialog(false)}
          title="Test Tamamlanmamış"
          description="Lütfen tüm soruları cevaplayarak testi tamamlayın."
          confirmText="Tamam"
          cancelText=""
          variant="default"
        />
      </div>
    </div>
  );
}