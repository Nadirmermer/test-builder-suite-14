// Yeni danışan ekleme modalı

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch } from '@/hooks/useRedux';
import { danisanEkle } from '@/store/slices/danisanSlice';
import { setActiveModal } from '@/store/slices/uiSlice';
import { toast } from '@/hooks/use-toast';
import { FiUser, FiCalendar, FiPhone, FiMapPin, FiFileText } from 'react-icons/fi';

interface YeniDanisanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function YeniDanisanModal({ open, onClose }: YeniDanisanModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    adSoyad: '',
    tcKimlikNo: '',
    dogumTarihi: '',
    cinsiyet: '',
    telefon: '',
    adres: '',
    notlar: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adSoyad.trim()) {
      toast({
        title: "Hata",
        description: "Ad Soyad alanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await dispatch(danisanEkle({
        ...formData,
        adSoyad: formData.adSoyad.trim(),
        tcKimlikNo: formData.tcKimlikNo || undefined,
        dogumTarihi: formData.dogumTarihi || undefined,
        cinsiyet: formData.cinsiyet as 'Erkek' | 'Kadın' | 'Belirtmek istemiyorum' || undefined,
        telefon: formData.telefon || undefined,
        adres: formData.adres || undefined,
        notlar: formData.notlar || undefined,
        eklenmeTarihi: new Date()
      })).unwrap();

      toast({
        title: "Başarılı",
        description: "Danışan başarıyla eklendi.",
        variant: "default"
      });

      // Formu temizle ve modalı kapat
      setFormData({
        adSoyad: '',
        tcKimlikNo: '',
        dogumTarihi: '',
        cinsiyet: '',
        telefon: '',
        adres: '',
        notlar: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Danışan eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FiUser className="text-primary" />
            Yeni Danışan Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Ad Soyad - Zorunlu */}
          <div className="space-y-2">
            <Label htmlFor="adSoyad" className="text-sm font-medium flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              Ad Soyad *
            </Label>
            <Input
              id="adSoyad"
              value={formData.adSoyad}
              onChange={(e) => handleChange('adSoyad', e.target.value)}
              placeholder="Danışanın tam adını giriniz"
              required
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* T.C. Kimlik No */}
          <div className="space-y-2">
            <Label htmlFor="tcKimlikNo" className="text-sm font-medium">
              T.C. Kimlik No
            </Label>
            <Input
              id="tcKimlikNo"
              value={formData.tcKimlikNo}
              onChange={(e) => handleChange('tcKimlikNo', e.target.value)}
              placeholder="11 haneli kimlik numarası"
              maxLength={11}
              pattern="[0-9]*"
            />
          </div>

          {/* İki sütunlu layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doğum Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="dogumTarihi" className="text-sm font-medium flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Doğum Tarihi
              </Label>
              <Input
                id="dogumTarihi"
                type="date"
                value={formData.dogumTarihi}
                onChange={(e) => handleChange('dogumTarihi', e.target.value)}
              />
            </div>

            {/* Cinsiyet */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cinsiyet</Label>
              <Select value={formData.cinsiyet} onValueChange={(value) => handleChange('cinsiyet', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erkek">Erkek</SelectItem>
                  <SelectItem value="Kadın">Kadın</SelectItem>
                  <SelectItem value="Belirtmek istemiyorum">Belirtmek istemiyorum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Telefon */}
          <div className="space-y-2">
            <Label htmlFor="telefon" className="text-sm font-medium flex items-center gap-1">
              <FiPhone className="w-4 h-4" />
              Telefon
            </Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={(e) => handleChange('telefon', e.target.value)}
              placeholder="0532 123 45 67"
            />
          </div>

          {/* Adres */}
          <div className="space-y-2">
            <Label htmlFor="adres" className="text-sm font-medium flex items-center gap-1">
              <FiMapPin className="w-4 h-4" />
              Adres
            </Label>
            <Textarea
              id="adres"
              value={formData.adres}
              onChange={(e) => handleChange('adres', e.target.value)}
              placeholder="İkamet adresi"
              rows={2}
            />
          </div>

          {/* Ek Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notlar" className="text-sm font-medium flex items-center gap-1">
              <FiFileText className="w-4 h-4" />
              Ek Notlar
            </Label>
            <Textarea
              id="notlar"
              value={formData.notlar}
              onChange={(e) => handleChange('notlar', e.target.value)}
              placeholder="Danışan hakkında önemli notlar..."
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-medical hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}