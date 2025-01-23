export interface ApiResponse<T> {
    data?: T;
    error?: string;
  }
  
  export interface Stats {
    users: number;
    products: number;
    posts: number;
    comments: number;
    reactions: number;
    categories: number;
    orders: number;
    appointments: number;
    locations: number;
  }
  
  export async function getStats(): Promise<ApiResponse<Stats>> {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }