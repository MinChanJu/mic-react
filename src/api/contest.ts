import axios from './axiosInstance';
import { ApiResponse } from "../types/ApiResponse";
import { Contest } from '../types/Contest';

export const getAllContests = async (): Promise<ApiResponse<Contest[]>> => {
  const response = await axios.get(`/contests`);
  return response.data;
};

export const getContestById = async (id: number): Promise<ApiResponse<Contest>> => {
  const response = await axios.get(`/contests/${id}`);
  return response.data;
};

export const getAllContestsByUserId = async (userId: string): Promise<ApiResponse<Contest[]>> => {
  const response = await axios.get(`/contests/user/${userId}`);
  return response.data;
};

export const createContest = async (contestDetail: Contest): Promise<ApiResponse<Contest>> => {
  const response = await axios.post('/contests/create', contestDetail);
  return response.data;
};

export const updateContest = async (contestDetail: Contest): Promise<ApiResponse<Contest>> => {
  const response = await axios.put('/contests/update', contestDetail);
  return response.data;
};

export const deleteContestById = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axios.delete(`/contests/${id}`);
  return response.data;
};