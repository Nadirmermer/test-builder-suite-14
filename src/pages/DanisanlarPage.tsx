// Ana danışanlar sayfası

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DanisanCard from '@/components/danisan/DanisanCard';
import YeniDanisanModal from '@/components/danisan/YeniDanisanModal';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { Danisan } from '@/types';

export default function DanisanlarPage() {
  const navigate = useNavigate();
  const { items: danisanlar, loading } = useAppSelector((state) => state.danisanlar);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [filteredDanisanlar, setFilteredDanisanlar] = useState<Danisan[]>([]);

  // Arama filtreleme
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDanisanlar(danisanlar);
    } else {
      const filtered = danisanlar.filter(danisan =>
        danisan.adSoyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (danisan.tcKimlikNo && danisan.tcKimlikNo.includes(searchTerm)) ||
        (danisan.telefon && danisan.telefon.includes(searchTerm))
      );
      setFilteredDanisanlar(filtered);
    }
  }, [danisanlar, searchTerm]);

  const handleDanisanClick = (danisan: Danisan) => {
    navigate(`/danisan/${danisan.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FiUsers className="text-primary" />
            Danışanlar
          </h1>
          <p className="text-muted-foreground mt-1">
            Toplam {danisanlar.length} danışan kayıtlı
          </p>
        </div>
        
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-medical hover:opacity-90 shadow-medical text-white px-6 py-3 h-auto"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Yeni Danışan Ekle
        </Button>
      </div>

      {/* Arama */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Danışan ara (ad, TC, telefon)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Danışanlar Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Danışanlar yükleniyor...</p>
        </div>
      ) : filteredDanisanlar.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <>
              <FiSearch className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Arama sonucu bulunamadı</h3>
              <p className="text-muted-foreground">
                "{searchTerm}" araması için sonuç bulunamadı.
              </p>
            </>
          ) : (
            <>
              <FiUsers className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-medium text-foreground">Henüz danışan kaydı yok</h3>
              <p className="text-muted-foreground mb-6">
                İlk danışanınızı ekleyerek başlayın.
              </p>
              <Button 
                onClick={() => setModalOpen(true)}
                className="bg-gradient-medical hover:opacity-90"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                İlk Danışanı Ekle
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDanisanlar.map((danisan) => (
            <DanisanCard
              key={danisan.id}
              danisan={danisan}
              onClick={() => handleDanisanClick(danisan)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <YeniDanisanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}