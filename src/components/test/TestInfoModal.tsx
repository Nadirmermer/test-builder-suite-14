// Test bilgilendirme modalı

import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogDescription,
} from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiFileText, FiInfo } from 'react-icons/fi';
import { TestTanimi } from '@/types';

interface TestInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestTanimi;
  onContinue: () => void;
}

export default function TestInfoModal({
  open,
  onOpenChange,
  test,
  onContinue,
}: TestInfoModalProps) {
  
  const handleContinue = () => {
    onContinue();
    onOpenChange(false);
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <CustomDialogHeader>
          <CustomDialogTitle className="flex items-center gap-2">
            <FiFileText className="text-primary" />
            {test.testAdi}
          </CustomDialogTitle>
          <CustomDialogDescription>
            Test hakkında bilgilendirme
          </CustomDialogDescription>
        </CustomDialogHeader>
        
        <div className="space-y-4">
          {/* Test ID */}
          <div>
            <Badge variant="secondary">ID: {test.id}</Badge>
          </div>

          {/* Açıklama */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Açıklama</h4>
            <p className="text-muted-foreground">{test.kisaAciklama}</p>
          </div>

          {/* Talimatlar */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Uygulama Talimatları</h4>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {test.talimatlar}
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-secondary/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{test.sorular.length}</p>
              <p className="text-sm text-muted-foreground">Toplam Soru</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{test.sonucYorumlari.length}</p>
              <p className="text-sm text-muted-foreground">Sonuç Seviyesi</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {test.sureDakika ? `${test.sureDakika} dk` : 'Belirtilmemiş'}
              </p>
              <p className="text-sm text-muted-foreground">Tahmini Süre</p>
            </div>
          </div>

          {/* Sonuç Yorumları */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Sonuç Yorumları</h4>
            <div className="space-y-2">
              {test.sonucYorumlari.map((yorum, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        yorum.seviye === 'minimal' ? 'default' :
                        yorum.seviye === 'hafif' ? 'secondary' :
                        yorum.seviye === 'orta' ? 'outline' : 'destructive'
                      }
                    >
                      {yorum.aralik[0]} - {yorum.aralik[1]} puan
                    </Badge>
                    <span className="text-sm text-foreground">{yorum.yorum}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleContinue}>
            Teste Başla
          </Button>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
}