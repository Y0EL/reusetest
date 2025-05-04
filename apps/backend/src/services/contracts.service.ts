import { HttpException } from '@/exceptions/HttpException';
import { Submission } from '@/interfaces/submission.interface';
import { ecoEarnContract, thor, decodeRevertReason } from '@/utils/thor';
import { Service } from 'typedi';
import * as console from 'node:console';
import { unitsUtils } from '@vechain/sdk-core';
import { REWARD_AMOUNT } from '@config';

// Maksimal submission per address
const MAX_SUBMISSIONS_PER_CYCLE = 5;

@Service()
export class ContractsService {
  public async registerSubmission(submission: Submission): Promise<boolean> {
    let isSuccess = false;
    try {
      console.log(`Registering submission for address: ${submission.address}`);
      const amount = unitsUtils.parseUnits(REWARD_AMOUNT, 'ether');
      const result = await (
        await ecoEarnContract.transact.registerValidSubmission(submission.address, amount)
      ).wait();
      isSuccess = !result.reverted;
      if (!isSuccess) {
        // Coba decode revert reason jika transaksi gagal
        const txHash = result.meta?.txID; // Access txID from meta property
        if (txHash) {
          const revertReason = await decodeRevertReason(txHash);
          console.log('Transaction reverted with reason:', revertReason);
          
          // Error message in English if max submissions reached
          if (revertReason.includes("Max submissions")) {
            throw new HttpException(403, `You have reached the maximum number of submissions (${MAX_SUBMISSIONS_PER_CYCLE}) for this cycle`);
          }
          
          throw new HttpException(400, `Transaction failed: ${revertReason}`);
        }
        console.log('Transaction reverted without ID:', result);
        throw new HttpException(400, "Transaction failed with unknown reason");
      }
      console.log(`Successfully registered submission for ${submission.address}`);
    } catch (error) {
      console.log('Error registering submission:', error);
      // Provide more informative error if not HttpException
      if (!(error instanceof HttpException)) {
        throw new HttpException(500, `Error registering submission: ${error.message || 'Unknown error'}`);
      }
      throw error;
    }

    return isSuccess;
  }

  public async validateSubmission(submission: Submission): Promise<void> {
    try {
      console.log(`Validating submission for address: ${submission.address}`);
      const isMaxSubmissionsReached = (await ecoEarnContract.read.isUserMaxSubmissionsReached(submission.address))[0];
      
      // Check current submission count
      const currentCycle = (await ecoEarnContract.read.getCurrentCycle())[0];
      const userSubmissions = (await ecoEarnContract.read.submissions(currentCycle, submission.address))[0];
      console.log(`User ${submission.address} has submitted ${userSubmissions} times in current cycle`);
      
      if (Boolean(isMaxSubmissionsReached) === true || Number(userSubmissions) >= MAX_SUBMISSIONS_PER_CYCLE) {
        throw new HttpException(409, `You have reached the maximum number of submissions (${MAX_SUBMISSIONS_PER_CYCLE}) for this cycle`);
      }
      
      console.log(`Submission validation passed for ${submission.address}`);
    } catch (error) {
      console.log('Error validating submission:', error);
      if (!(error instanceof HttpException)) {
        throw new HttpException(500, `Error validating submission: ${error.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  public async getRemainingSubmissions(address: string): Promise<{ remaining: number, max: number }> {
    try {
      console.log(`Getting blockchain data for address: ${address}`);
      
      // Get current cycle
      const currentCycle = (await ecoEarnContract.read.getCurrentCycle())[0];
      console.log(`Current cycle from blockchain: ${currentCycle}`);
      
      // Get max submissions per cycle
      const maxSubmissions = MAX_SUBMISSIONS_PER_CYCLE;
      console.log(`Max submissions per cycle (hardcoded): ${maxSubmissions}`);
      
      // Get user's current submissions
      const userSubmissions = (await ecoEarnContract.read.submissions(currentCycle, address))[0];
      console.log(`User submissions from blockchain: ${userSubmissions}`);
      
      // Calculate remaining submissions
      const remaining = Math.max(0, maxSubmissions - Number(userSubmissions));
      
      const result = { 
        remaining: remaining, 
        max: maxSubmissions
      };
      
      console.log(`Final result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log('Error getting remaining submissions from blockchain:', error);
      throw new HttpException(500, `Error fetching submission data from blockchain: ${error.message || 'Unknown error'}`);
    }
  }
}