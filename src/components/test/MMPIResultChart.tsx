import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TestSonucu } from '@/types';

interface MMPIResultChartProps {
  testSonucu: TestSonucu;
}

export default function MMPIResultChart({ testSonucu }: MMPIResultChartProps) {
  if (!testSonucu.mmpiSonuclari) {
    return null;
  }

  const { gecerlikOlcekleri, klinikOlcekler } = testSonucu.mmpiSonuclari;

  // MMPI profil grafiği için veri hazırla
  const chartData = [
    { name: 'L', fullName: 'Yalan', tSkoru: gecerlikOlcekleri.L?.tSkoru || 30, kategori: 'geçerlik' },
    { name: 'F', fullName: 'Sıklık', tSkoru: gecerlikOlcekleri.F?.tSkoru || 30, kategori: 'geçerlik' },
    { name: 'K', fullName: 'Düzeltme', tSkoru: gecerlikOlcekleri.K?.tSkoru || 30, kategori: 'geçerlik' },
    { name: 'Hs(1)', fullName: 'Hipokondriazis', tSkoru: klinikOlcekler.Hs?.tSkoru || 30, kategori: 'klinik' },
    { name: 'D(2)', fullName: 'Depresyon', tSkoru: klinikOlcekler.D?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Hy(3)', fullName: 'Hysteri', tSkoru: klinikOlcekler.Hy?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Pd(4)', fullName: 'Psikopati Sapması', tSkoru: klinikOlcekler.Pd?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Mf(5)', fullName: 'Maskülinite-Femininite', tSkoru: klinikOlcekler.Mf?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Pa(6)', fullName: 'Paranoid', tSkoru: klinikOlcekler.Pa?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Pt(7)', fullName: 'Psikastenik', tSkoru: klinikOlcekler.Pt?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Sc(8)', fullName: 'Şizofreni', tSkoru: klinikOlcekler.Sc?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Ma(9)', fullName: 'Hipomani', tSkoru: klinikOlcekler.Ma?.tSkoru || 30, kategori: 'klinik' },
    { name: 'Si(0)', fullName: 'Sosyal İçedönüklük', tSkoru: klinikOlcekler.Si?.tSkoru || 30, kategori: 'klinik' }
  ];

  // Yüksek puanları (T>65) tespit et
  const yuksekPuanlar = chartData.filter(item => item.tSkoru >= 65);
  const cokYuksekPuanlar = chartData.filter(item => item.tSkoru >= 75);

  return (
    <div className="space-y-6">
      {/* MMPI Profil Grafiği */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MMPI Kişilik Profili</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  domain={[30, 120]}
                  label={{ value: 'T-Skoru', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any) => [value, 'T-Skoru']}
                  labelFormatter={(label: any, payload: any) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.fullName} (${data.name})`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                {/* Klinik anlamlılık çizgisi (T=65) */}
                <ReferenceLine 
                  y={65} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <Line 
                  type="linear" 
                  dataKey="tSkoru" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Referans çizgisi açıklaması */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <div className="w-4 h-0.5 bg-destructive opacity-60" style={{ background: 'repeating-linear-gradient(to right, hsl(var(--destructive)) 0, hsl(var(--destructive)) 5px, transparent 5px, transparent 10px)' }}></div>
            <span>T=65: Klinik Anlamlılık Eşiği</span>
          </div>

          {/* Yüksek Puanlar Özeti */}
          {yuksekPuanlar.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Yükseltilmiş Alt Testler (T ≥ 65):</h4>
              <div className="flex flex-wrap gap-2">
                {yuksekPuanlar.map((item, index) => (
                  <Badge 
                    key={index} 
                    variant={item.tSkoru >= 75 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {item.name}: {item.tSkoru}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* T-Skoru Detay Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detaylı T-Skoru Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geçerlik Ölçekleri */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Geçerlik Ölçekleri</h4>
              <div className="space-y-2">
                {Object.entries(gecerlikOlcekleri).map(([key, data]) => {
                  const item = chartData.find(c => c.name === key);
                  return (
                    <div key={key} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                      <div>
                        <span className="font-medium text-sm">{item?.fullName} ({key})</span>
                        <div className="text-xs text-muted-foreground">
                          Ham Puan: {data.hammaddePuan}
                        </div>
                      </div>
                      <Badge variant={data.tSkoru >= 65 ? "destructive" : "outline"}>
                        T={data.tSkoru}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Klinik Ölçekler */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Klinik Ölçekler</h4>
              <div className="space-y-2">
                {Object.entries(klinikOlcekler).map(([key, data]) => {
                  const item = chartData.find(c => c.name.includes(key));
                  return (
                    <div key={key} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                      <div>
                        <span className="font-medium text-sm">{item?.fullName}</span>
                        <div className="text-xs text-muted-foreground">
                          Ham Puan: {data.hammaddePuan}
                        </div>
                      </div>
                      <Badge variant={data.tSkoru >= 65 ? "destructive" : "outline"}>
                        T={data.tSkoru}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}