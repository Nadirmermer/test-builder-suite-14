import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TestSonucu } from '@/types';
import MMPIResultChart from './MMPIResultChart';

interface TestResultChartProps {
  testSonucu: TestSonucu;
  showOverallScore?: boolean;
}

export default function TestResultChart({ testSonucu, showOverallScore = true }: TestResultChartProps) {
  // MMPI için özel grafik bileşenini kullan
  if (testSonucu.mmpiSonuclari) {
    return <MMPIResultChart testSonucu={testSonucu} />;
  }

  // Alt ölçek puanları varsa grafik verisi hazırla
  const chartData = testSonucu.altOlcekPuanlari
    ? Object.entries(testSonucu.altOlcekPuanlari).map(([key, data]) => ({
        name: data.ad.length > 15 ? data.ad.substring(0, 15) + '...' : data.ad,
        fullName: data.ad,
        puan: data.ortalamaPuan,
        toplamPuan: data.toplamPuan,
        baskın: data.baskın
      }))
    : [];

  const baskınAlanlar = chartData.filter(item => item.baskın);

  if (!testSonucu.altOlcekPuanlari) {
    // Alt ölçek yoksa sadece genel puanı göster
    return showOverallScore ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Sonucu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{testSonucu.puan}</div>
            <p className="text-muted-foreground">{testSonucu.sonucYorumu}</p>
          </div>
        </CardContent>
      </Card>
    ) : null;
  }

  return (
    <div className="space-y-6">
      {showOverallScore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Genel Test Skoru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{testSonucu.puan}</div>
              <p className="text-muted-foreground">{testSonucu.sonucYorumu}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alt Ölçek Puanları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value.toFixed(2), 'Puan']}
                  labelFormatter={(label: any, payload: any) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.fullName}`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="linear" 
                  dataKey="puan" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Detay tablo */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm">Detaylı Puanlar:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {chartData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="font-medium">{item.fullName}:</span>
                  <span>{item.puan.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}