
import { create } from 'zustand';
import { getSubmissionsRemaining, SubmissionsRemainingResponse } from '../networking';

interface SubmissionState {
  submissionData: SubmissionsRemainingResponse | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  fetchSubmissionData: (address: string) => Promise<void>;
  refreshSubmissionData: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissionData: null,
  isLoading: false,
  hasError: false,
  errorMessage: '',
  
  fetchSubmissionData: async (address: string) => {
    if (!address) {
      set({ hasError: true, errorMessage: 'No wallet address provided' });
      return;
    }
    
    try {
      set({ isLoading: true, hasError: false, errorMessage: '' });
      console.log(`Store: Fetching submission data for ${address}`);
      
      const data = await getSubmissionsRemaining(address);
      set({ submissionData: data, isLoading: false });
      console.log(`Store: Submission data updated: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Store: Error fetching submission data:', error);
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        submissionData: null,
        isLoading: false
      });
    }
  },
  
  refreshSubmissionData: () => {
    // Get current account from vechain wallet
    // Since we can't use hooks directly in Zustand, we'll need to get the address from where this function is called
    const currentAccount = document.querySelector('meta[name="current-wallet"]')?.getAttribute('content');
    
    if (currentAccount) {
      get().fetchSubmissionData(currentAccount);
    } else {
      console.warn('Store: Cannot refresh submission data - no wallet connected');
    }
  }
})); 