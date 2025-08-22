// Test uygulama yöntemi seçim modalı

import { useState } from 'react';
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogDescription,
} from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FiUser, FiList, FiClock, FiZap, FiEdit3 } from 'react-icons/fi';
import { TestTanimi } from '@/types';

interface TestApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestTanimi;
  danisanId: number;
  onMethodSelect: (method: 'standard' | 'fast' | 'bulk') => void;
}

export default function TestApplicationModal({
  open,
  onOpenChange,
  test,
  danisanId,
  onMethodSelect,
}: TestApplicationModalProps) {
  const handleMethodSelect = (method: 'standard' | 'fast' | 'bulk') => {
    onMethodSelect(method);
    onOpenChange(false);
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[500px]">
        <CustomDialogHeader>
          <CustomDialogTitle>{test.testAdi}</CustomDialogTitle>
          <CustomDialogDescription>
            Test uygulama yöntemini seçiniz
          </CustomDialogDescription>
        </CustomDialogHeader>
        
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:bg-secondary/50 transition-smooth border-2 hover:border-primary/50 hover:shadow-card"
            onClick={() => handleMethodSelect('standard')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-medical flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Danışan Ekrandan Çözecek
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standart test arayüzü - Her sayfada tek soru
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FiList className="h-3 w-3" />
                      Tek soru/sayfa
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3 w-3" />
                      Normal süre
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-secondary/50 transition-smooth border-2 hover:border-primary/50 hover:shadow-card"
            onClick={() => handleMethodSelect('fast')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <FiZap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Cevapları Hızlı Gir
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tablo arayüzü - Tüm sorular tek ekranda
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FiList className="h-3 w-3" />
                      Tüm sorular
                    </span>
                    <span className="flex items-center gap-1">
                      <FiZap className="h-3 w-3" />
                      Hızlı giriş
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MMPI için özel metin giriş seçeneği */}
          {test.puanlamaTuru === 'mmpi-profil' && (
            <Card 
              className="cursor-pointer hover:bg-secondary/50 transition-smooth border-2 hover:border-primary/50 hover:shadow-card"
              onClick={() => handleMethodSelect('bulk')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <FiEdit3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Metin Bloğu ile Hızlı Giriş
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      566 cevabı tek seferde yapıştır - D/Y/* formatı
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FiEdit3 className="h-3 w-3" />
                        Toplu giriş
                      </span>
                      <span className="flex items-center gap-1">
                        <FiZap className="h-3 w-3" />
                        En hızlı
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
}