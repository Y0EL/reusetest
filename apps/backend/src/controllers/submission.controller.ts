import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OpenaiService } from '@/services/openai.service';
import { Submission } from '@/interfaces/submission.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ContractsService } from '@/services/contracts.service';
import * as console from 'node:console';

export class SubmissionController {
  public openai = Container.get(OpenaiService);
  public contracts = Container.get(ContractsService);

  public submitReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body: Omit<Submission, 'timestamp'> = req.body;

      // Validate that we have two images
      if (!body.images || body.images.length !== 2) {
        throw new HttpException(400, 'Both receipt and product images are required');
      }

      const submissionRequest: Submission = {
        ...body,
        timestamp: Date.now(),
      };
      // Submission validation with smart contract
      await this.contracts.validateSubmission(submissionRequest);

      // Pass the array of images to the openai service
      const validationResult = await this.openai.validateImage(body.images);

      if (validationResult == undefined || !('validityFactor' in (validationResult as object))) {
        throw new HttpException(500, 'Error validating images');
      }

      const validityFactor = validationResult['validityFactor'];

      if (validityFactor > 0.5) {
        if (!(await this.contracts.registerSubmission(submissionRequest))) {
          throw new HttpException(500, 'Error registering submission and sending rewards');
        }
      }

      res.status(200).json({ validation: validationResult });
    } catch (error) {
      console.error('Error in submitReceipt:', error);
      next(error);
      return;
    }
  };

  public getRemainingSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const address = req.params.address;
      
      if (!address) {
        throw new HttpException(400, 'Wallet address is required');
      }

      console.log(`Getting remaining submissions for address: ${address}`);

      // Ambil data langsung dari blockchain
      const submissions = await this.contracts.getRemainingSubmissions(address);
      console.log(`Retrieved submissions data: ${JSON.stringify(submissions)}`);
      res.status(200).json(submissions);
    } catch (error) {
      console.error('Error in getRemainingSubmissions:', error);
      next(error);
      return;
    }
  };
}
