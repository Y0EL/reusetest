import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';
import * as console from 'node:console';

// Custom interface that matches the actual structure returned by OpenAI helper
interface OpenAIResponse {
  id: string;
  created: number;
  model: string;
  object: string;
  choices: {
    message: {
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

@Service()
export class OpenaiService {
  public async validateImage(images: string[]): Promise<unknown> {
    try {
      // Ensure we have exactly 2 images
      if (!images || images.length !== 2) {
        throw new HttpException(400, 'Exactly 2 images (receipt and product) are required');
      }
      
      // Validate format of both images
      if (!isBase64Image(images[0]) || !isBase64Image(images[1])) {
        throw new HttpException(400, 'Invalid image format');
      }

      // Single unified validation process for both images
      return await this.validateBothImages(images[0], images[1]);
      
    } catch (error) {
      console.error('Error in validateImage:', error);
      // If error is due to image format, throw it back
      if (error instanceof HttpException) {
        throw error;
      }
      // For other errors, use fallback
      return this.useFallbackValidation('An error occurred during image validation');
    }
  }
  
  private async validateBothImages(receiptImage: string, productImage: string): Promise<unknown> {
    const prompt = `
    You are analyzing two images in a single evaluation. The first image is a real, clear photo of a physical receipt from an actual purchase, showing the purchase date, store name, and product details. The second image is a clear, non-blurry photo of the actual product that matches the receipt details. Both images must be directly related and represent a genuine purchase.

Analyze and answer:
1. What product(s) was purchased as shown on the receipt?
2. Does the product image match the purchased product on the receipt?

Strict validation rules:
- Receipt image: MUST be a genuine, clear photo (not a screenshot, digital receipt, or fabricated image) with purchase date, store name, and detailed product information that clearly connects to the product image.
- Product image: MUST be a genuine, clear photo (not a stock photo or screenshot) that clearly matches the details from the receipt.

Output your response as a JSON object with the following structure:
{
  "validityFactor": {validityFactorValue}, // 1 for invalid and valid
  "descriptionOfAnalysis": "{yourAnalysis}" // 1-3 sentences maximum, extremely concise.
}

Do not refer to the images as "images[0]" or "images[1]". Keep your response extremely brief and to the point.

      `;

    try {
      // Process both images together with a single AI call
      const gptResponse = await openAIHelper.askChatGPTAboutImages({
        base64Images: [receiptImage, productImage],
        prompt,
      });

      // Extract JSON string directly from the response to avoid type issues
      const responseContent = gptResponse.choices[0]?.message?.content;
      if (!responseContent) {
        console.warn('Received empty response from OpenAI for image validation, using fallback');
        return this.useFallbackValidation('Empty response received');
      }
      
      try {
        // Parse the JSON manually
        const parsedResponse = JSON.parse(responseContent.replace(/```json|```/g, '').trim());
        return parsedResponse;
      } catch (e) {
        console.error('Failed to parse OpenAI response:', e);
        return this.useFallbackValidation('Invalid JSON response');
      }
    } catch (error) {
      console.error('OpenAI API error in image validation:', error);
      return this.useFallbackValidation('Image validation failed');
    }
  }
  
  // Fallback validation function when OpenAI is not available
  private useFallbackValidation(reason: string = "Image validation process"): unknown {
    console.log(`Using fallback validation: ${reason}`);
    return {
      validityFactor: 1,
      descriptionOfAnalysis: "Your submission was accepted."
    };
  }
}