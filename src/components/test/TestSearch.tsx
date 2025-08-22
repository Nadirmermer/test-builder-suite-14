// Test arama ve filtreleme bileşeni

import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TestTanimi } from '@/types';

interface TestSearchProps {
  tests: TestTanimi[];
  onFilteredTests: (tests: TestTanimi[]) => void;
}

const TEST_CATEGORIES = [
  { id: 'all', name: 'Tüm Testler' },
  { id: 'depresyon', name: 'Depresyon Testleri' },
  { id: 'anksiyete', name: 'Anksiyete Testleri' },
  { id: 'kisilik', name: 'Kişilik Testleri' },
  { id: 'bilissel', name: 'Bilişsel Testler' },
  { id: 'sosyal', name: 'Sosyal Testler' },
];

export default function TestSearch({ tests, onFilteredTests }: TestSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterTests(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterTests(searchQuery, category);
  };

  const filterTests = (query: string, category: string) => {
    let filtered = tests;

    // Kategori filtresi
    if (category !== 'all') {
      filtered = filtered.filter(test => 
        test.kategori?.toLowerCase().includes(category) ||
        test.testAdi.toLowerCase().includes(category) ||
        test.kisaAciklama.toLowerCase().includes(category)
      );
    }

    // Arama filtresi
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter(test =>
        test.testAdi.toLowerCase().includes(lowerQuery) ||
        test.kisaAciklama.toLowerCase().includes(lowerQuery) ||
        test.anahtar_kelimeler?.some(keyword => 
          keyword.toLowerCase().includes(lowerQuery)
        )
      );
    }

    onFilteredTests(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    onFilteredTests(tests);
  };

  const selectedCategoryName = TEST_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'Tüm Testler';

  return (
    <div className="space-y-4">
      {/* Arama ve Filtre Başlığı */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Test Arama ve Filtreleme
        </h3>
        {(searchQuery || selectedCategory !== 'all') && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Arama Çubuğu */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Test adı veya açıklama ara..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kategori Filtresi */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FiFilter className="h-4 w-4 mr-2" />
              {selectedCategoryName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {TEST_CATEGORIES.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={selectedCategory === category.id ? 'bg-secondary' : ''}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Aktif Filtreler */}
        {selectedCategory !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {selectedCategoryName}
            <button 
              onClick={() => handleCategoryChange('all')}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}