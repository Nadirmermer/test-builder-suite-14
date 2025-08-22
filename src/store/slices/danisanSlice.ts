// Danışan yönetimi için Redux slice

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Danisan } from '@/types';
import { danisanService } from '@/lib/db';

interface DanisanState {
  items: Danisan[];
  loading: boolean;
  error: string | null;
  selectedDanisan: Danisan | null;
}

const initialState: DanisanState = {
  items: [],
  loading: false,
  error: null,
  selectedDanisan: null,
};

// Async thunk'lar
export const danisanlariYukle = createAsyncThunk(
  'danisanlar/yukle',
  async () => {
    return await danisanService.tumunuGetir();
  }
);

export const danisanEkle = createAsyncThunk(
  'danisanlar/ekle',
  async (danisan: Omit<Danisan, 'id'>) => {
    const id = await danisanService.ekle(danisan);
    return { ...danisan, id };
  }
);

export const danisanGuncelle = createAsyncThunk(
  'danisanlar/guncelle',
  async ({ id, danisan }: { id: number; danisan: Partial<Danisan> }) => {
    await danisanService.guncelle(id, danisan);
    return { id, danisan };
  }
);

export const danisanSil = createAsyncThunk(
  'danisanlar/sil',
  async (id: number) => {
    await danisanService.sil(id);
    return id;
  }
);

export const danisanGetir = createAsyncThunk(
  'danisanlar/getir',
  async (id: number) => {
    return await danisanService.getir(id);
  }
);

const danisanSlice = createSlice({
  name: 'danisanlar',
  initialState,
  reducers: {
    selectedDanisanTemizle: (state) => {
      state.selectedDanisan = null;
    },
    errorTemizle: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Danışanları yükle
      .addCase(danisanlariYukle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(danisanlariYukle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(danisanlariYukle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Danışanlar yüklenirken hata oluştu';
      })
      
      // Danışan ekle
      .addCase(danisanEkle.fulfilled, (state, action) => {
        state.items.unshift(action.payload as Danisan);
      })
      
      // Danışan güncelle
      .addCase(danisanGuncelle.fulfilled, (state, action) => {
        const { id, danisan } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...danisan };
        }
        if (state.selectedDanisan?.id === id) {
          state.selectedDanisan = { ...state.selectedDanisan, ...danisan };
        }
      })
      
      // Danışan sil
      .addCase(danisanSil.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedDanisan?.id === action.payload) {
          state.selectedDanisan = null;
        }
      })
      
      // Danışan getir
      .addCase(danisanGetir.fulfilled, (state, action) => {
        state.selectedDanisan = action.payload || null;
      });
  },
});

export const { selectedDanisanTemizle, errorTemizle } = danisanSlice.actions;
export default danisanSlice.reducer;