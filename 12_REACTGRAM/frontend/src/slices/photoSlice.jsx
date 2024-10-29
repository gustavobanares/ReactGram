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

// Publish user photo
export const publishPhoto = createAsyncThunk(
    'photo/publish',
    async(photo, thunkAPI) =>{

        const token = thunkAPI.getState().auth.user.token

        const data = await photoService.publishPhoto(photo, token)

        // Check for errors
        if(data.errors){
            return thunkAPI.rejectWithValue(data.errors[0])
        }

        return data

    }
)

// Get user photos
export const getUserPhotos = createAsyncThunk(
    'photo/userphotos',
    async(id, thunkAPI) =>{

        const token = thunkAPI.getState().auth.user.token

        const data = await photoService.getUserPhotos(id, token)

        return data

    }
)

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
      .addCase(publishPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.photo = action.payload;
        state.photos.unshift(state.photo)
        state.message = 'Foto publicada com sucesso!'
      })
      .addCase(publishPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.photo = {};
      })
      .addCase(getUserPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.photos = action.payload;
      })
}
})

export const { resetMessage } = photoSlice.actions;
export default photoSlice.reducer;