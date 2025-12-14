import axios from "axios";

export interface BlogPost {
  id: number;
  published: string;
  description: string;
  content: string | null;
  title: string;
  externalUrl?: string;
}

export interface BlogResponse {
  data: BlogPost[];
  meta?: {
    total_count: number;
    filter_count: number;
  };
}

export interface BlogQueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  fields?: string[];
}

const CMS_BASE_URL = "https://cms.deflock.me";

const blogApiService = axios.create({
  baseURL: CMS_BASE_URL,
  timeout: 10000,
});

export const blogService = {
  async getBlogPosts(params: BlogQueryParams = {}): Promise<BlogResponse> {
    const queryParams = new URLSearchParams();
    
    // Set default sorting by newest first
    const sort = params.sort || "-date_created";
    queryParams.append("sort", sort);
    
    // Set pagination parameters
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.offset) {
      queryParams.append("offset", params.offset.toString());
    }
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    
    // Set fields if specified
    if (params.fields && params.fields.length > 0) {
      queryParams.append("fields", params.fields.join(","));
    }
    
    // Request metadata for pagination
    queryParams.append("meta", "total_count,filter_count");
    
    try {
      const response = await blogApiService.get(`/items/blog?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw new Error("Failed to fetch blog posts");
    }
  },

  async getBlogPost(id: number): Promise<BlogPost> {
    try {
      const response = await blogApiService.get(`/items/blog/${id}?t=${Date.now()}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching blog post ${id}:`, error);
      throw new Error(`Failed to fetch blog post ${id}`);
    }
  }
};