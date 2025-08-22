// Sistem ayarları sayfası

import { useState, useRef, useEffect } from 'react';
import { FiSettings, FiDatabase, FiDownload, FiUpload, FiTrash2 } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { danisanlariYukle } from '@/store/slices/danisanSlice';
import { testleriYukle } from '@/store/slices/testSlice';
import { dataManager } from '@/lib/dataManager';
import { DataClearConfirmationDialog, ImportDataConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
export default function AyarlarPage() {
  const dispatch = useAppDispatch();
  const {
    toast
  } = useToast();
  const {
    items: danisanlar
  } = useAppSelector(state => state.danisanlar);
  const {
    mevcutTestler
  } = useAppSelector(state => state.testler);
  const [loading, setLoading] = useState({
    export: false,
    import: false,
    delete: false
  });
  const [confirmDialogs, setConfirmDialogs] = useState({
    clearData: false,
    importData: false
  });
  const [stats, setStats] = useState({
    danisanSayisi: 0,
    testSonucSayisi: 0
  });
  const importResolveRef = useRef<((value: boolean) => void) | null>(null);
  const clearResolveRef = useRef<((value: boolean) => void) | null>(null);
  const handleExportData = async () => {
    try {
      setLoading(prev => ({
        ...prev,
        export: true
      }));
      const jsonData = await dataManager.exportAllData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `psiko-test-yedek-${timestamp}.json`;
      dataManager.downloadFile(jsonData, filename);
      toast({
        title: "Başarılı",
        description: "Veriler başarıyla dışa aktarıldı."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({
        ...prev,
        export: false
      }));
    }
  };
  const handleImportData = async () => {
    try {
      setLoading(prev => ({
        ...prev,
        import: true
      }));
      const jsonData = await dataManager.uploadFile();
      await dataManager.importData(jsonData, async () => {
        return new Promise(resolve => {
          setConfirmDialogs(prev => ({
            ...prev,
            importData: true
          }));
          importResolveRef.current = resolve;
        });
      });

      // Verileri yeniden yükle
      await Promise.all([dispatch(danisanlariYukle()), dispatch(testleriYukle())]);

      // İstatistikleri güncelle
      const newStats = await dataManager.getStats();
      setStats(newStats);
      toast({
        title: "Başarılı",
        description: "Veriler başarıyla içe aktarıldı."
      });
    } catch (error) {
      if (error instanceof Error && error.message !== 'İptal edildi') {
        toast({
          title: "Hata",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(prev => ({
        ...prev,
        import: false
      }));
    }
  };
  const handleDeleteAllData = async () => {
    try {
      setLoading(prev => ({
        ...prev,
        delete: true
      }));
      await dataManager.clearAllData(async () => {
        return new Promise(resolve => {
          setConfirmDialogs(prev => ({
            ...prev,
            clearData: true
          }));
          clearResolveRef.current = resolve;
        });
      });

      // Verileri yeniden yükle
      await Promise.all([dispatch(danisanlariYukle()), dispatch(testleriYukle())]);

      // İstatistikleri güncelle
      const newStats = await dataManager.getStats();
      setStats(newStats);
      toast({
        title: "Başarılı",
        description: "Tüm veriler başarıyla silindi."
      });
    } catch (error) {
      if (error instanceof Error && error.message !== 'İptal edildi') {
        toast({
          title: "Hata",
          description: "Veriler silinirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(prev => ({
        ...prev,
        delete: false
      }));
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    const newStats = await dataManager.getStats();
    setStats(newStats);
  };

  // Sayfa yüklendiğinde istatistikleri al
  useEffect(() => {
    loadStats();
  }, []);
  return <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FiSettings className="text-primary" />
          Sistem Ayarları
        </h1>
        <p className="text-muted-foreground mt-1">
          Uygulama yapılandırması ve veri yönetimi
        </p>
      </div>

      {/* Sistem Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiDatabase className="text-primary" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uygulama Versiyonu</p>
              <p className="text-foreground">PsikoTest v1.0</p>
            </div>
            
            
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kayıtlı Danışan Sayısı</p>
              <Badge variant="secondary">{stats.danisanSayisi}</Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tamamlanan Test Sayısı</p>
              <Badge variant="secondary">{stats.testSonucSayisi}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Sistemdeki Test Sayısı</p>
              <Badge variant="secondary">{mevcutTestler.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veri Yönetimi */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Verileri Dışa Aktar</h4>
                <p className="text-sm text-muted-foreground">
                  Tüm danışan ve test verilerini JSON formatında indir
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} disabled={loading.export} className="min-w-[140px]">
                {loading.export ? <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Dışa Aktarılıyor...
                  </> : <>
                    <FiDownload className="mr-2 h-4 w-4" />
                    Dışa Aktar
                  </>}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Verileri İçe Aktar</h4>
                <p className="text-sm text-muted-foreground">
                  Önceden dışa aktarılmış verileri sisteme yükle
                </p>
              </div>
              <Button variant="outline" onClick={handleImportData} disabled={loading.import} className="min-w-[140px]">
                {loading.import ? <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    İçe Aktarılıyor...
                  </> : <>
                    <FiUpload className="mr-2 h-4 w-4" />
                    İçe Aktar
                  </>}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
              <div>
                <h4 className="font-medium text-destructive">Tüm Verileri Sil</h4>
                <p className="text-sm text-muted-foreground">
                  Dikkat: Bu işlem geri alınamaz!
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAllData} disabled={loading.delete} className="min-w-[140px]">
                {loading.delete ? <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Siliniyor...
                  </> : <>
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Verileri Sil
                  </>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Yönetimi */}
      

      {/* Confirmation Dialogs */}
      <DataClearConfirmationDialog open={confirmDialogs.clearData} onOpenChange={open => {
      setConfirmDialogs(prev => ({
        ...prev,
        clearData: open
      }));
      if (!open && clearResolveRef.current) {
        clearResolveRef.current(false);
        clearResolveRef.current = null;
      }
    }} onConfirm={() => {
      setConfirmDialogs(prev => ({
        ...prev,
        clearData: false
      }));
      if (clearResolveRef.current) {
        clearResolveRef.current(true);
        clearResolveRef.current = null;
      }
    }} />

      <ImportDataConfirmationDialog open={confirmDialogs.importData} onOpenChange={open => {
      setConfirmDialogs(prev => ({
        ...prev,
        importData: open
      }));
      if (!open && importResolveRef.current) {
        importResolveRef.current(false);
        importResolveRef.current = null;
      }
    }} onConfirm={() => {
      setConfirmDialogs(prev => ({
        ...prev,
        importData: false
      }));
      if (importResolveRef.current) {
        importResolveRef.current(true);
        importResolveRef.current = null;
      }
    }} />
    </div>;
}