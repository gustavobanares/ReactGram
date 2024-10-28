import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import photoService from '../services/photoService';

const initialState = {
  photos: [],
  photo: {},
  error: false,
  success: false,
  loading: false,
  message: null,
};

// Thunk para buscar todas as fotos
export const fetchPhotos = createAsyncThunk(
  'photo/fetchPhotos',
  async (_, { rejectWithValue }) => {
    try {
      const photos = await photoService.getAllPhotos();
      return photos;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para adicionar uma nova foto
export const createPhoto = createAsyncThunk(
  'photo/createPhoto',
  async ({ photoData, token }, { rejectWithValue }) => {
    try {
      const newPhoto = await photoService.addPhoto(photoData, token);
      return newPhoto;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const photoSlice = createSlice({
  name: 'photo',
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload;
        state.success = true;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(createPhoto.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.photos.push(action.payload);
        state.success = true;
      })
      .addCase(createPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export const { resetMessage } = photoSlice.actions;
export default photoSlice.reducer;