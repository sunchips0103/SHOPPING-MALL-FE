import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/login",{email,password});
      //성공
      //Loginpage
      //토큰저장
      //1.local storage 2. session storage
      sessionStorage.setItem("token",response.data.token);
      return response.data;
    }catch(error){
      //실패
      //실패시 생긴 에러값을 reducer에 저장
      return rejectWithValue(error.error);
   }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try{
      const response = await api.post("/user",{email,name,password});

      //성공
      //1. 성공 토스트 메세지 보여주기
      dispatch(showToastMessage({message:"회원가입을 성공했습니다",status:"success"}));
      //2. 로그인 페이지로 리다이렉트(사용자가 처음 요청한 URL이 아닌, 다른 URL로 보내는 것을 뜻) 
      navigate('/login');
      return response.data.data;//
    }catch(error){
      //실패
      //1. 실패 토스트 메세지를 보여준다
      dispatch(showToastMessage({message:"회원가입에 실패 했습니다.",status:"error"}));
      //2. 에러값을 저장한다
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try{
      const response = await api.get("/user/me");
      return response.data;
    }catch(error){
      return rejectWithValue(error.error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending,(state)=>{ // 데이터 로딩중
      state.loading=true;
    })
    .addCase(registerUser.fulfilled,(state)=>{ //정상적 값을 받음 , 로딩을 끝냄
      state.loading=false;
      state.registrationError=null; //에러 초기화
    })
    .addCase(registerUser.rejected,(state,action)=>{
      state.registrationError = action.payload;
    })
    .addCase(loginWithEmail.pending, (state)=>{
      state.loading = true;
    })
    .addCase(loginWithEmail.fulfilled, (state,action)=>{
      state.loading = false;
      state.user = action.payload.user;
      state.loginError=null
    })
    .addCase(loginWithEmail.rejected, (state,action)=>{
      state.loading = false;
      state.loginError=action.payload;
    })
    .addCase(loginWithToken.fulfilled,(state,action)=>{
      state.user=action.payload.user

    });
    
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
