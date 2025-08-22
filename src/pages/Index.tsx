import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TestTube, BarChart3, Settings, ArrowRight, Stethoscope } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
const Index = () => {
  const navigate = useNavigate();
  const {
    items: danisanlar
  } = useAppSelector(state => state.danisanlar);
  const {
    testSonuclari
  } = useAppSelector(state => state.testler);

  // Quick stats
  const stats = {
    totalDanisanlar: danisanlar.length,
    totalTestler: testSonuclari.length,
    sonGunTestleri: testSonuclari.filter(test => {
      const today = new Date();
      const testDate = new Date(test.tamamlanmaTarihi);
      return testDate.toDateString() === today.toDateString();
    }).length
  };
  return <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl shadow-medical">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-medical bg-clip-text text-transparent">
              PsikoTest Uygulaması
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Psikolojik değerlendirme testlerini dijital ortamda uygulayın, 
            danışan verilerini güvenle yönetin ve kapsamlı raporlar oluşturun.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Danışan</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalDanisanlar}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı danışan sayısı</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Test</CardTitle>
              <TestTube className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.totalTestler}</div>
              <p className="text-xs text-muted-foreground">Tamamlanan test sayısı</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü Testler</CardTitle>
              <BarChart3 className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.sonGunTestleri}</div>
              <p className="text-xs text-muted-foreground">Bugün tamamlanan</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 rounded-none">
          <Card className="shadow-card hover:shadow-medical transition-all duration-300 cursor-pointer group" onClick={() => navigate('/danisanlar')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Danışanlar</CardTitle>
              <CardDescription>
                Danışan bilgilerini görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Danışanlara Git <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-medical transition-all duration-300 cursor-pointer group" onClick={() => navigate('/testler')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors">
                <TestTube className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Testler</CardTitle>
              <CardDescription>
                Psikolojik testleri uygulayın ve sonuçlara erişin
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                Testlere Git <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-medical transition-all duration-300 cursor-pointer group" onClick={() => navigate('/ayarlar')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-secondary/50 rounded-lg w-fit group-hover:bg-secondary transition-colors">
                <Settings className="h-6 w-6 text-foreground" />
              </div>
              <CardTitle className="text-lg">Ayarlar</CardTitle>
              <CardDescription>
                Uygulama ayarlarını ve veri yönetimini yapın
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                Ayarlara Git <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          
        </div>

        {/* Features */}
        <Card className="shadow-floating">
          <CardHeader>
            <CardTitle className="text-center text-xl">Özellikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TestTube className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Dijital Test Uygulama</h4>
                  <p className="text-sm text-muted-foreground">Beck Depresyon ve Anksiyete Envanteri gibi standart testler</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium">Danışan Yönetimi</h4>
                  <p className="text-sm text-muted-foreground">Danışan bilgilerini güvenle saklayın ve yönetin</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium">Otomatik Raporlama</h4>
                  <p className="text-sm text-muted-foreground">Test sonuçlarından otomatik yorumlar ve grafikler</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;