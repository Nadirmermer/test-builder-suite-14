// Cinsiyet kontrol ve yönlendirme komponenti

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTanimi, Danisan } from '@/types';
import { danisanService } from '@/lib/db';

interface GenderSelectionModalProps {
  test: TestTanimi;
  danisan: Danisan;
  onComplete: () => void;
}

export default function GenderSelectionModal({ test, danisan, onComplete }: GenderSelectionModalProps) {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState<'Erkek' | 'Kadın' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedGender) return;
    
    try {
      setLoading(true);
      await danisanService.guncelle(danisan.id!, { cinsiyet: selectedGender });
      onComplete();
    } catch (error) {
      console.error('Cinsiyet güncellenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/danisan/${danisan.id}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <FiArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">Cinsiyet Bilgisi Gerekli</CardTitle>
                <p className="text-muted-foreground">
                  {test.testAdi} testi için cinsiyet bilgisi gereklidir
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <FiAlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{test.testAdi}</strong> kadın ve erkek için farklı sorular içermektedir. 
                Bu nedenle testi çözebilmek için cinsiyet bilginizi belirtmeniz gerekmektedir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label className="text-base font-medium">Cinsiyetinizi seçin:</Label>
              <RadioGroup
                value={selectedGender}
                onValueChange={(value) => setSelectedGender(value as 'Erkek' | 'Kadın')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-smooth cursor-pointer">
                  <RadioGroupItem value="Kadın" id="kadin" />
                  <Label htmlFor="kadin" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      Kadın
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-smooth cursor-pointer">
                  <RadioGroupItem value="Erkek" id="erkek" />
                  <Label htmlFor="erkek" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      Erkek
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                İptal
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!selectedGender || loading}
                className="flex-1"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Teste Başla'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}