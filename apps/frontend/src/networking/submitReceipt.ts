import axios from "axios";
import { ReceiptData } from "./type";
import { backendURL } from "../config/index";

export type Response = {
  validation: {
    validityFactor: number;
    descriptionOfAnalysis: string;
  };
};

export const submitReceipt = async (data: ReceiptData): Promise<Response> => {
  try {
    // Ensure images array is provided and has at least 2 images
    if (!data.images || !Array.isArray(data.images) || data.images.length < 2) {
      throw new Error("Both receipt and product images are required");
    }

    // Ensure both images are valid strings
    if (typeof data.images[0] !== 'string' || data.images[0].trim() === '' ||
        typeof data.images[1] !== 'string' || data.images[1].trim() === '') {
      throw new Error("Both images must be valid data URLs");
    }

    const response = await axios.post(`${backendURL}/submitReceipt`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error posting data:", error);
    
    // More specific error handling
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error("Cannot connect to server. Please check your internet connection.");
      } else if (error.response?.status === 401) {
        throw new Error("Wallet authentication required. Please reconnect your wallet.");
      } else if (error.response?.status === 403) {
        throw new Error("Permission denied. Make sure you are using the correct VeWorld Wallet.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else if (error.response?.status === 413) {
        throw new Error("Images are too large. Please try again with smaller images.");
      } else if (error.response?.status === 400) {
        // Extract the actual error message from the response
        const errorMessage = error.response.data?.message || 
                             error.response.data?.error || 
                             (typeof error.response.data === 'string' ? error.response.data : null);
        
        if (errorMessage && errorMessage.includes("EcoEarn: Not enough rewards left")) {
          throw new Error("ReUse: Sorry, no rewards left:( We're working on replenishing the rewards pool. Please check back later!");
        } else if (errorMessage && errorMessage.includes("Transaction failed")) {
          throw new Error("Transaction failed. Please check your wallet and try again.");
        } else if (errorMessage) {
          throw new Error(errorMessage);
        } else {
          throw new Error("An error occurred while processing your request.");
        }
      }
      
      // Handle any other error response with status and message if available
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = typeof errorData === 'object' && errorData.message
          ? errorData.message
          : typeof errorData === 'string'
            ? errorData
            : "An unexpected error occurred.";
        
        throw new Error(errorMessage);
      }
    }
    
    throw new Error("Failed to send data. Please check your VeWorld Wallet connection.");
  }
};
