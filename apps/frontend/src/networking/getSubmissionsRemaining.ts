import axios from "axios";
import { backendURL } from "../config/index";

export interface SubmissionsRemainingResponse {
  remaining: number;
  max: number;
}

export const getSubmissionsRemaining = async (address: string): Promise<SubmissionsRemainingResponse> => {
  try {
    // Try several possible API endpoint URLs
    // Priority order:
    // 1. /api/v1/remaining/:address (most recommended)
    // 2. /submitReceipt/remaining/:address
    // 3. /api/submitReceipt/remaining/:address
    const possibleEndpoints = [
      `${backendURL}/api/v1/remaining/${address}`,
      `${backendURL}/submitReceipt/remaining/${address}`,
      `${backendURL}/api/submitReceipt/remaining/${address}`
    ];
    
    let lastError = null;
    
    // Try each endpoint until one succeeds
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        console.log('Response received:', response.data);
        
        // Validate data
        if (response.data && typeof response.data.remaining === 'number' && typeof response.data.max === 'number') {
          return response.data;
        } else {
          console.warn('Invalid data format received from endpoint:', endpoint, response.data);
        }
      } catch (error) {
        console.warn(`Error with endpoint ${endpoint}:`, error instanceof Error ? error.message : String(error));
        lastError = error;
      }
    }
    
    // If all endpoints fail, throw the last error
    throw lastError || new Error('All endpoints failed');
  } catch (error) {
    console.error("Error fetching remaining submissions:", error);
    throw error;
  }
}; 