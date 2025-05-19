import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../utils/api";
import {showToastMessage} from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({id, size}, {rejectWithValue, dispatch}) => {
    try {
      console.log("response start")
      const response = await api.post("/cart", {productId: id, size, qty: 1});
      console.log("cart response",response);
      console.log("Sending to server:", { id, size }); // 이거 꼭 찍어보세요

      if (response.status !== 200) throw new Error(response.error);
      dispatch(
        showToastMessage({
          message: "카트에 아이템이 추가 됐습니다",
          status: "success",
        })
      );
      return response.data.cartItemQty; //todo
    } catch (error) {
      dispatch(
        showToastMessage({
          message: "카트에 아이템 추가 실패",
          status: "error",
        })
      );
      return rejectWithValue(error.error);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, {rejectWithValue, dispatch}) => {
    try{
      const response = await api.get("/cart");
      if(response.status!==200)throw new Error(response.error)
        return response.data.data;
    }catch(error){
        return rejectWithValue(error.error);

    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, {rejectWithValue, dispatch}) => {
    try{
      const response = await api.delete(`/cart/${id}`);
      if(response.status!==200)throw new Error(response.error)
        dispatch(
        showToastMessage({
          message: "아이템이 삭제됨",
          status: "success",
        })
      );
        dispatch(getCartList())

        return response.data.cartItemCount;
    }catch(error){
      dispatch(
        showToastMessage({
          message: "아이템 삭제 실패",
          status: "error",
        })
      );
      return rejectWithValue(error.error);

    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({id, value}, {rejectWithValue,dispatch}) => {
    try {
    const response = await api.put(`/cart/${id}`, { qty: value });
    if (response.status !== 200) throw new Error(response.error);
    dispatch(
        showToastMessage({
          message: "아이템이 수정 성공공",
          status: "success",
        })
      );
      return response.data.data;
  } catch (error) {
    dispatch(
        showToastMessage({
          message: "아이템 수정 실패",
          status: "error",
        })
      );
    rejectWithValue(error.error);

  }
  }
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, {rejectWithValue, dispatch}) => {
    try {
      const response = await api.get("/cart/qty");
      if (response.status !== 200) throw new Error(response.error);
        return response.data.qty
    } catch (error) {
      rejectWithValue(error.error);

    }
  });


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state, action) => {
        state.loading=true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading=false;
        state.error=""
        state.cartItemCount=action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading=false;
        state.error=action.payload;
      })
      .addCase(getCartList.pending, (state, action) => {
        state.loading=true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading=false;
        state.error=""
        state.cartList=action.payload;
        state.totalPrice= action.payload.reduce(
          (total,item)=>total+item.productId.price*item.qty,
          0
        );
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading=false;
        state.error=action.payload;
      })
      .addCase(deleteCartItem.pending,(state,action)=>{
        state.loading=true;
      })
      .addCase(deleteCartItem.fulfilled,(state,action)=>{
        state.loading=false;
        state.error="";
        state.cartItemCount=action.payload
      })
      .addCase(deleteCartItem.rejected,(state,action)=>{
        state.loading=false;
        state.error=action.payload
      })
      .addCase(updateQty.pending,(state,action)=>{
        state.loading=true;
      })
      .addCase(updateQty.fulfilled,(state,action)=>{
        state.loading=false;
        state.error="";
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce(
          (total, item) => total + item.productId.price * item.qty,
          0
        );
      })
      .addCase(updateQty.rejected,(state,action)=>{
        state.loading=false;
        state.error=action.payload;
      })
      .addCase(getCartQty.pending,(state,action)=>{
        state.loading=true;
      })
      .addCase(getCartQty.fulfilled,(state,action)=>{
        state.loading=true;
        state.error="";
        state.cartItemCount=action.payload;
      })
      .addCase(getCartQty.rejected,(state,action)=>{
        state.loading=true;
        state.error=action.payload;
        
      })
  },
});

export default cartSlice.reducer;
export const {initialCart} = cartSlice.actions;