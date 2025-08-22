// MMPI Toplu Metin Giriş Arayüzü - 566 cevabı tek seferde yapıştırma

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { TestTanimi } from '@/types';
import { testSonucuService } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculateMMPIScores, generateMMPISummary, toPublicResults } from '@/lib/mmpi';
import { useAppSelector } from '@/hooks/useRedux';
import GenderSelectionModal from './GenderSelectionModal';

interface BulkMMPIInterfaceProps {
  test: TestTanimi;
  danisanId: number;
  onComplete: () => void;
}

export default function BulkMMPIInterface({ test, danisanId, onComplete }: BulkMMPIInterfaceProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // MMPI cinsiyet kontrolü için danışan bilgisi
  const { selectedDanisan } = useAppSelector((state) => state.danisanlar);
  const danisan = selectedDanisan;
  const [showGenderSelection, setShowGenderSelection] = useState(!danisan?.cinsiyet);
  
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const expectedLength = 566;
  const currentLength = textInput.length;
  const progress = (currentLength / expectedLength) * 100;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Gerçek zamanlı doğrulama
  useEffect(() => {
    const errors: string[] = [];
    
    if (textInput.length > 0) {
      // Karakter sayısı kontrolü
      if (textInput.length !== expectedLength && textInput.length > 0) {
        errors.push(`${expectedLength} karakter gerekli, ${textInput.length} karakter girildi.`);
      }
      
      // Geçersiz karakter kontrolü
      const invalidChars = textInput.replace(/[DYdy*\s]/g, '');
      if (invalidChars.length > 0) {
        errors.push(`Geçersiz karakterler bulundu: ${[...new Set(invalidChars)].join(', ')}`);
      }
    }
    
    setValidationErrors(errors);
  }, [textInput, expectedLength]);

  const parseTextInput = (input: string): { cevaplar: Record<string, number>; bosCevaplar: Set<string> } => {
    const cevaplar: Record<string, number> = {};
    const bosCevaplar = new Set<string>();
    
    // Boşlukları temizle ve büyük harfe çevir
    const cleanedInput = input.replace(/\s/g, '').toUpperCase();
    
    test.sorular.forEach((soru, index) => {
      if (index < cleanedInput.length) {
        const char = cleanedInput[index];
        if (char === 'D') {
          cevaplar[soru.id] = 1; // Doğru
        } else if (char === 'Y') {
          cevaplar[soru.id] = 0; // Yanlış
        } else if (char === '*') {
          bosCevaplar.add(soru.id); // Boş/Bilmiyorum
        }
      }
    });
    
    return { cevaplar, bosCevaplar };
  };

  const handleSubmit = async () => {
    // Final doğrulama
    if (textInput.length !== expectedLength) {
      toast({
        title: "Geçersiz Giriş",
        description: `Lütfen tam olarak ${expectedLength} karakter giriniz.`,
        variant: "destructive"
      });
      return;
    }

    const invalidChars = textInput.replace(/[DYdy*\s]/g, '');
    if (invalidChars.length > 0) {
      toast({
        title: "Geçersiz Karakterler",
        description: "Lütfen sadece D, Y ve * karakterlerini kullanın.",
        variant: "destructive"
      });
      return;
    }

    // Cinsiyet bilgisini al
    const cinsiyetBilgisi = (danisan?.cinsiyet === 'Erkek' || danisan?.cinsiyet === 'Kadın') 
      ? danisan.cinsiyet 
      : localStorage.getItem(`danisan_${danisanId}_cinsiyet`) as 'Erkek' | 'Kadın' || 'Erkek';

    setIsLoading(true);
    try {
      // Metni ayrıştır
      const { cevaplar, bosCevaplar } = parseTextInput(textInput);
      
      // MMPI puanlama motoru ile hesaplama
      const results = calculateMMPIScores(cevaplar, bosCevaplar, cinsiyetBilgisi === 'Kadın' ? 'Kadin' : 'Erkek');
      const genelOzet = generateMMPISummary(results);
      const mmpiSonuclari = toPublicResults(results);
      
      // Toplam T-skoru hesaplama (genel puan için)
      const toplamTSkoru = Object.values(mmpiSonuclari.klinikOlcekler)
        .reduce((sum, olcek) => sum + olcek.tSkoru, 0);
      
      await testSonucuService.ekle({
        danisanId,
        testId: test.id,
        testAdi: test.testAdi + " (Toplu)",
        tamamlanmaTarihi: new Date(),
        puan: Math.round(toplamTSkoru / Object.keys(mmpiSonuclari.klinikOlcekler).length) || 50,
        sonucYorumu: genelOzet,
        cevaplar: [
          ...Object.entries(cevaplar).map(([soruId, verilenPuan]) => ({
            soruId,
            verilenPuan
          })),
          ...Array.from(bosCevaplar).map(soruId => ({
            soruId,
            verilenPuan: -1 // -1 = boş cevap işareti
          }))
        ],
        mmpiSonuclari
      });

      toast({
        title: "Test Tamamlandı", 
        description: results.validityStatus === 'valid' 
          ? "MMPI toplu analizi başarıyla tamamlandı ve kaydedildi." 
          : "MMPI toplu testi tamamlandı ancak geçerlilik sorunu tespit edildi."
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
    return (
      <GenderSelectionModal
        test={test}
        danisan={danisan}
        onComplete={handleGenderSelectionComplete}
      />
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
              <p className="text-sm text-muted-foreground">Metin Bloğu ile Hızlı Giriş</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant={currentLength === expectedLength ? "default" : "outline"} className="text-xs">
              {currentLength} / {expectedLength}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={Math.min(progress, 100)} className="h-2" />

        {/* Talimatlar */}
        <Alert>
          <FiAlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>MMPI Toplu Giriş Talimatları:</strong>
            <br />
            • 566 karakterlik cevap dizinini buraya yapıştırın
            <br />
            • <strong>D</strong> = Doğru, <strong>Y</strong> = Yanlış, <strong>*</strong> = Bilmiyorum
            <br />
            • Cevaplar arasında boşluk bırakmayın
            <br />
            • Örnek: DYYDY*DDYY...
          </AlertDescription>
        </Alert>

        {/* Doğrulama Hataları */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <FiAlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Doğrulama Hataları:</strong>
              <ul className="list-disc list-inside mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Ana Giriş Kartı */}
        <Card className="transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cevap Metni</span>
              <span className="text-sm font-normal text-muted-foreground">
                {currentLength} / {expectedLength} karakter
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.toUpperCase())}
              placeholder="566 karakterlik cevap dizinini buraya yapıştırın (DYYDY*DDYY...)"
              className="min-h-[200px] font-mono text-sm"
              maxLength={expectedLength}
            />
            
            {/* Karakter İstatistikleri */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>D: {(textInput.match(/D/g) || []).length}</span>
              <span>Y: {(textInput.match(/Y/g) || []).length}</span>
              <span>*: {(textInput.match(/\*/g) || []).length}</span>
              <span>Toplam: {currentLength}</span>
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSubmit}
            disabled={validationErrors.length > 0 || currentLength !== expectedLength || isLoading}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            size="lg"
          >
            {isLoading ? (
              "Kaydediliyor..."
            ) : (
              <>
                <FiCheck className="h-5 w-5 mr-2" />
                Cevapları Kaydet ve Sonucu Hesapla
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
          description="Testi sonlandırmak istediğinizden emin misiniz? Girdiğiniz veriler kaydedilmeyecektir."
          confirmText="Evet, Sonlandır"
          cancelText="Devam Et"
          variant="destructive"
        />
      </div>
    </div>
  );
}