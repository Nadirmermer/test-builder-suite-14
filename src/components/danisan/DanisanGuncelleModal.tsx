import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave, FiX } from 'react-icons/fi';
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
} from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/hooks/useRedux';
import { danisanGuncelle } from '@/store/slices/danisanSlice';
import { Danisan } from '@/types';
import { useToast } from '@/hooks/use-toast';

const danisanSchema = z.object({
  adSoyad: z.string().min(1, 'Ad Soyad gereklidir'),
  tcKimlikNo: z.string().optional(),
  dogumTarihi: z.string().optional(),
  cinsiyet: z.enum(['Erkek', 'Kadın', 'Belirtmek istemiyorum']).optional(),
  telefon: z.string().optional(),
  adres: z.string().optional(),
  notlar: z.string().optional(),
});

type DanisanFormData = z.infer<typeof danisanSchema>;

interface DanisanGuncelleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  danisan: Danisan;
}

export default function DanisanGuncelleModal({ 
  open, 
  onOpenChange, 
  danisan 
}: DanisanGuncelleModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<DanisanFormData>({
    resolver: zodResolver(danisanSchema),
    defaultValues: {
      adSoyad: danisan.adSoyad,
      tcKimlikNo: danisan.tcKimlikNo || '',
      dogumTarihi: danisan.dogumTarihi || '',
      cinsiyet: danisan.cinsiyet,
      telefon: danisan.telefon || '',
      adres: danisan.adres || '',
      notlar: danisan.notlar || '',
    }
  });

  const cinsiyetValue = watch('cinsiyet');

  useEffect(() => {
    if (open && danisan) {
      reset({
        adSoyad: danisan.adSoyad,
        tcKimlikNo: danisan.tcKimlikNo || '',
        dogumTarihi: danisan.dogumTarihi || '',
        cinsiyet: danisan.cinsiyet,
        telefon: danisan.telefon || '',
        adres: danisan.adres || '',
        notlar: danisan.notlar || '',
      });
    }
  }, [open, danisan, reset]);

  const onSubmit = async (data: DanisanFormData) => {
    setLoading(true);
    try {
      await dispatch(danisanGuncelle({
        id: danisan.id,
        danisan: {
          ...data,
          // Boş stringler için undefined gönder
          tcKimlikNo: data.tcKimlikNo || undefined,
          dogumTarihi: data.dogumTarihi || undefined,
          telefon: data.telefon || undefined,
          adres: data.adres || undefined,
          notlar: data.notlar || undefined,
        }
      })).unwrap();

      toast({
        title: "Başarılı",
        description: "Danışan bilgileri güncellendi.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CustomDialogHeader>
          <CustomDialogTitle>Danışan Bilgilerini Güncelle</CustomDialogTitle>
        </CustomDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ad Soyad */}
            <div className="md:col-span-2">
              <Label htmlFor="adSoyad">Ad Soyad *</Label>
              <Input
                id="adSoyad"
                {...register('adSoyad')}
                className={errors.adSoyad ? 'border-destructive' : ''}
              />
              {errors.adSoyad && (
                <p className="text-sm text-destructive mt-1">
                  {errors.adSoyad.message}
                </p>
              )}
            </div>

            {/* T.C. Kimlik No */}
            <div>
              <Label htmlFor="tcKimlikNo">T.C. Kimlik No</Label>
              <Input
                id="tcKimlikNo"
                {...register('tcKimlikNo')}
                maxLength={11}
                placeholder="12345678901"
              />
            </div>

            {/* Doğum Tarihi */}
            <div>
              <Label htmlFor="dogumTarihi">Doğum Tarihi</Label>
              <Input
                id="dogumTarihi"
                type="date"
                {...register('dogumTarihi')}
              />
            </div>

            {/* Cinsiyet */}
            <div>
              <Label htmlFor="cinsiyet">Cinsiyet</Label>
              <Select
                value={cinsiyetValue || ''}
                onValueChange={(value) => setValue('cinsiyet', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erkek">Erkek</SelectItem>
                  <SelectItem value="Kadın">Kadın</SelectItem>
                  <SelectItem value="Belirtmek istemiyorum">Belirtmek istemiyorum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Telefon */}
            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                {...register('telefon')}
                placeholder="0555 123 45 67"
              />
            </div>

            {/* Adres */}
            <div className="md:col-span-2">
              <Label htmlFor="adres">Adres</Label>
              <Textarea
                id="adres"
                {...register('adres')}
                placeholder="Ev/iş adresi"
                rows={2}
              />
            </div>

            {/* Notlar */}
            <div className="md:col-span-2">
              <Label htmlFor="notlar">Notlar</Label>
              <Textarea
                id="notlar"
                {...register('notlar')}
                placeholder="Ek notlar..."
                rows={3}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <FiX className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              <FiSave className="h-4 w-4 mr-2" />
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </CustomDialogContent>
    </CustomDialog>
  );
}