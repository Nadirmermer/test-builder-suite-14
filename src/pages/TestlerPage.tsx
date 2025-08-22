// Test arşivi sayfası

import { FiClipboard, FiFileText, FiInfo } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/hooks/useRedux';

export default function TestlerPage() {
  const { mevcutTestler, loading } = useAppSelector((state) => state.testler);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Testler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FiClipboard className="text-primary" />
          Test Arşivi
        </h1>
        <p className="text-muted-foreground mt-1">
          Sistemde {mevcutTestler.length} test tanımı mevcut
        </p>
      </div>

      {/* Test Listesi */}
      {mevcutTestler.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-medium text-foreground">Test tanımı bulunamadı</h3>
          <p className="text-muted-foreground">
            Sistemde henüz yüklenmiş test dosyası bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {mevcutTestler.map((test) => (
            <Card key={test.id} className="hover:shadow-floating transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FiFileText className="text-primary mt-1" />
                    <div>
                      <h3 className="text-xl">{test.testAdi}</h3>
                      <Badge variant="secondary" className="mt-1">
                        ID: {test.id}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Açıklama */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Açıklama</h4>
                  <p className="text-muted-foreground">{test.kisaAciklama}</p>
                </div>

                {/* Talimatlar */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Uygulama Talimatları</h4>
                  <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                    {test.talimatlar}
                  </p>
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
                      {test.grafikTanimlari ? 'Var' : 'Yok'}
                    </p>
                    <p className="text-sm text-muted-foreground">Grafik Desteği</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}