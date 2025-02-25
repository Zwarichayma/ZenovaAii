import axios from "axios"

const API_URL = "http://192.168.100.24:1337/api"
const TOKEN =
  "3bf5dd63e926b8274c69d0725cbcb58fff0557c122389deb3b1b05c891c62c9fc18917cfa1b913ea60731cc1687426d8d1b1df629e479c783ade7bdc261e025fb2189a84daf3c0fc38a7acc07aae9c809464955f0a1d68c7fd3d9d17c4855986c632f756cfd3a73c9ac714f84e484db0f547ccdf84613e6bdb9b5d1e36e7b2b9"

export interface ImageFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: null | string
  width: number
  height: number
  size: number
  sizeInBytes: number
  url: string
}

export interface ImageData {
  id: number
  documentId: string
  name: string
  alternativeText: null | string
  caption: null | string
  width: number
  height: number
  formats: {
    thumbnail: ImageFormat
    small: ImageFormat
  }
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: null | string
  provider: string
  provider_metadata: null | any
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface TestAttributes {
  documentId: string
  title: string
  description: Array<{
    type: string
    children: Array<{
      type: string
      text: string
    }>
  }>
  questions: Array<{
    question: string
    options: Array<{ text: string; score: number }>
  }>
  result_interpretation: {
    excellent_sleep: string
    good_sleep: string
    average_sleep: string
    poor_sleep: string
    very_poor_sleep: string
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
  image: ImageData[]
}

export interface Test {
  id: number
  attributes: TestAttributes
}

export interface ApiResponse<T> {
  data: T
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
})

export const getTests = async (): Promise<Test[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Test[]>>("/tests?populate=*")
    console.log("API Response:", JSON.stringify(response.data, null, 2))
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export const getTestById = async (id: number): Promise<Test> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Test>>(`/tests/${id}?populate=image`)
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export const calculateTestScore = async (testId: number, answers: string[]): Promise<{
  totalScore: number;
  interpretation: string;
  maxPossibleScore: number;
  numberOfQuestions: number;
}> => {
  try {
    const response = await axiosInstance.post(`/tests/${testId}/calculate-score`, { answers });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
};