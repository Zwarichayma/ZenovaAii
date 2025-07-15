import axios from "axios";
const API_URL = "http://172.20.10.13:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"

export interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: null | string;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}
 console.log(API_URL)
console.log(API_KEY)

export interface ImageData {
  id: number;
  documentId: string;
  name: string;
  alternativeText: null | string;
  caption: null | string;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: null | string;
  provider: string;
  provider_metadata: null | any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TestAttributes {
  documentId: string;
  title: string;
  description: Array<{
    type: string;
    children: Array<{
      type: string;
      text: string;
    }>;
  }>;
  questions: Array<{
    question: string;
    options: Array<{ text: string; score: number }>;
  }>;
  result_interpretation: {
    excellent_sleep: string;
    good_sleep: string;
    average_sleep: string;
    poor_sleep: string;
    very_poor_sleep: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image: ImageData[];
}

export interface Test {
  id: number;
  attributes: TestAttributes;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const getTests = async (): Promise<Test[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Test[]>>("/testes?populate=*");
    return response.data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getTestById = async (id: number): Promise<Test | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Test>>(`/testes/${id}?populate=image`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    handleAxiosError(error);
    throw error;
  }
};

export const getQuestions = async () => {
  try {
    const response = await axiosInstance.get("/questions");
    return response.data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const calculateScore = async (
  testTitle: string,
  userResponses: Record<string, string>
) => {
  try {
    const response = await axiosInstance.post("/teste/calculate-score", {
      testTitle,
      userResponses,
    });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getQuestionsByTestId = async (testId: string) => {
  try {
    const response = await axiosInstance.get("/questions");
    const testPrefix = testId.slice(0, 6);
    const filteredQuestions = response.data.data.filter((q: any) =>
      q.attributes.documentId.startsWith(testPrefix)
    );
    return filteredQuestions.map((item: any) => ({
      id: item.id,
      documentId: item.attributes.documentId,
      texte: item.attributes.texte,
    }));
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getResponses = async () => {
  try {
    const response = await axiosInstance.get("/reponses?pagination[limit]=500");
    return response.data.data.map((item: any) => ({
      id: item.id,
      documentId: item.attributes.documentId,
      texte: item.attributes.texte,
      coefficient: item.attributes.coefficient,
    }));
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getTestWithQuestions = async (testId: string) => {
  try {
    const response = await axiosInstance.get(`/testes?populate[questions][populate]=*`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
    });
  } else {
    console.error("Unexpected error:", error);
  }
};
