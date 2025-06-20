import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../utils/axiosClient";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      return response.data.user;
    } catch (error) {
      const message = error?.response?.data?.error || "Something went wrong";
      return rejectWithValue({ message });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);
      return response.data.user;
    } catch (error) {
     const message = error?.response?.data?.error || "Something went wrong";
      return rejectWithValue({ message });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/user/check");
      return data.user;
    } catch (error) {
     const message = error?.response?.data?.error || "Something went wrong";
      return rejectWithValue({ message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.get("/user/logout");
      return null;
    } catch (error) {
      const message = error?.response?.data?.error || "Something went wrong";
      return rejectWithValue({ message });
    }
  }
);
