
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || '';

// Type definitions
export interface AdminContent {
  id: string;
  pageName: string;
  contentType: 'text' | 'image' | 'video';
  contentKey: string;
  contentValue: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  categoryName: string;
  iconName: string;
  routePath: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  planDescription?: string;
  price: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// API helper function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`[AdminAPI] ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AdminAPI] Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[AdminAPI] Success:`, data);
    return data;
  } catch (error) {
    console.error('[AdminAPI] Request failed:', error);
    throw error;
  }
}

// Admin Content API
export const adminContentApi = {
  async getAllContent(): Promise<AdminContent[]> {
    return apiCall<AdminContent[]>('/api/admin/content', { method: 'GET' });
  },
  async getContentByPage(pageName: string): Promise<AdminContent[]> {
    return apiCall<AdminContent[]>(`/api/admin/content/${pageName}`, { method: 'GET' });
  },
  async createContent(input: Omit<AdminContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminContent> {
    return apiCall<AdminContent>('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updateContent(id: string, input: Partial<Omit<AdminContent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AdminContent> {
    return apiCall<AdminContent>(`/api/admin/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async deleteContent(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/admin/content/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Admin Categories API
export const adminCategoriesApi = {
  async getCategories(): Promise<AdminCategory[]> {
    return apiCall<AdminCategory[]>('/api/admin/categories', { method: 'GET' });
  },
  async createCategory(input: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminCategory> {
    return apiCall<AdminCategory>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updateCategory(id: string, input: Partial<Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AdminCategory> {
    return apiCall<AdminCategory>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// Admin Subscriptions API
export const adminSubscriptionsApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    return apiCall<SubscriptionPlan[]>('/api/admin/subscriptions', { method: 'GET' });
  },
  async createPlan(input: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    return apiCall<SubscriptionPlan>('/api/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updatePlan(id: string, input: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SubscriptionPlan> {
    return apiCall<SubscriptionPlan>(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  async deletePlan(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/admin/subscriptions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// AI Content Generation API
export const adminAiApi = {
  async generateContent(prompt: string, contentType: 'text' | 'description' | 'features', context?: string): Promise<{ generatedContent: string }> {
    return apiCall<{ generatedContent: string }>('/api/admin/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify({ prompt, contentType, context }),
    });
  },
  async improveContent(content: string, improvementType: 'clarity' | 'tone' | 'length' | 'engagement'): Promise<{ improvedContent: string }> {
    return apiCall<{ improvedContent: string }>('/api/admin/ai/improve-content', {
      method: 'POST',
      body: JSON.stringify({ content, improvementType }),
    });
  },
  async generateFeatures(planName: string, planType: 'basic' | 'premium' | 'enterprise'): Promise<{ features: string[] }> {
    return apiCall<{ features: string[] }>('/api/admin/ai/generate-features', {
      method: 'POST',
      body: JSON.stringify({ planName, planType }),
    });
  },
};

// Image Upload API
export const adminUploadApi = {
  async uploadImage(imageUri: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${BACKEND_URL}/api/admin/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AdminAPI] Upload Error ${response.status}:`, errorText);
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};
