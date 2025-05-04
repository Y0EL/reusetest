import { useCallback, useState, useRef } from "react";
import { 
  Box, 
  VStack, 
  Text, 
  HStack, 
  Button, 
  Alert, 
  AlertIcon, 
  CloseButton,
  useToast,
  Input,
  Image,
  SimpleGrid
} from "@chakra-ui/react";
import { ScanIcon } from "./Icon";
import { blobToBase64, getDeviceId, resizeImage } from "../util";
import { useWallet } from "@vechain/dapp-kit-react";
import { submitReceipt } from "../networking";
import { useDisclosure, useSubmission } from "../hooks";

export const CameraCapture = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { account } = useWallet();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [captureStep, setCaptureStep] = useState<number>(0); // 0: Start, 1: Receipt, 2: Product

  const { setIsLoading, setResponse } = useSubmission();
  const { onOpen } = useDisclosure();

  // Reset the capture process
  const resetCapture = useCallback(() => {
    setCapturedImages([]);
    setCaptureStep(0);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Don't allow more than 2 images
    if (capturedImages.length >= 2) {
      toast({
        title: "Maximum images reached",
        description: "You can only upload 2 images. Please submit or reset.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      // Get the file
      const file = files[0];
      
      // Basic validation for image type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload an image file');
        return;
      }
      
      // Size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image is too large (max 5MB)');
        return;
      }
      
      // Create a FileReader to read the file
      const reader = new FileReader();
      
      // Define what happens on file load
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          try {
            // Convert to base64
            const base64Image = e.target.result.toString();
            
            // Optimize image size
            const tempFile = await fetch(base64Image)
              .then(res => res.blob())
              .then(blob => new File([blob], file.name, { type: file.type }));
            
            // Resize the image
            const resizedBlob = await resizeImage(tempFile);
            const optimizedBase64 = await blobToBase64(resizedBlob as Blob);
            
            // Add to captured images (limit to 2)
            setCapturedImages(prev => {
              const newImages = [...prev, optimizedBase64];
              if (newImages.length > 2) {
                return newImages.slice(0, 2);
              }
              return newImages;
            });
            
            // Update step (max to 3)
            const isFirstImage = capturedImages.length === 0;
            const newStep = isFirstImage ? 1 : 2;
            setCaptureStep(newStep);
            
            // Show notification based on step
            toast({
              title: isFirstImage ? "Receipt uploaded!" : "Product uploaded!",
              description: isFirstImage ? "Now upload your 2nd Product" : "Images ready to submit",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            
            // Clear the input for next upload
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (error) {
            console.error('Error processing image:', error);
            setErrorMessage('Error processing image. Please try again with a different image.');
          }
        }
      };
      
      // Handle file reading errors
      reader.onerror = () => {
        setErrorMessage('Error reading file. Please try again.');
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file. Please try again.');
    }
  }, [captureStep, capturedImages, toast]);

  // Trigger file input click
  const triggerFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Submit captured images
  const submitImages = useCallback(async () => {
    // Validate exactly 2 images
    if (capturedImages.length !== 2) {
      setErrorMessage("Please upload exactly one receipt and one product image");
      return;
    }

    if (!account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      onOpen();

      const deviceID = await getDeviceId();

      // Send both images to backend
      const response = await submitReceipt({
        address: account,
        deviceID,
        images: capturedImages,  // Send both receipt and product images
      });

      console.log(response);
      setResponse(response);
      
      // Reset the capture process after successful submission
      setCapturedImages([]);
      setCaptureStep(0);
      
    } catch (error: any) {
      // Extract and display the actual error message
      const errorMsg = error?.message || "An error occurred while uploading the images";
      setErrorMessage(errorMsg);
      setIsLoading(false);
      
      // Close the modal if it's open
      if (setResponse) {
        setResponse({
          validation: {
            validityFactor: 0,
            descriptionOfAnalysis: errorMsg
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [account, capturedImages, onOpen, setIsLoading, setResponse]);

  // Determine the upload button text based on capture step
  const uploadButtonText = useCallback(() => {
    if (captureStep === 0) return "Upload Receipt";
    if (captureStep === 1) return "Upload Product";
    return "Upload Complete";
  }, [captureStep]);

  // Get label for image based on index
  const getImageLabel = useCallback((index: number) => {
    return index === 0 ? "Receipt" : "Product";
  }, []);

  // Show preview of captured images
  const renderImagePreviews = useCallback(() => {
    if (capturedImages.length === 0) return null;
    
    return (
      <VStack spacing={3} w="full">
        <Text fontWeight="bold">Uploaded Images ({capturedImages.length}/2):</Text>
        {capturedImages.length === 2 && (
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Only the receipt image will be validated, but both images help us verify your purchase.
            Please make sure your receipt is clearly visible.
          </Text>
        )}
        <SimpleGrid columns={capturedImages.length > 1 ? 2 : 1} spacing={3} w="full">
          {capturedImages.map((image, index) => (
            <Box 
              key={index}
              borderWidth="1px"
              borderRadius="md"
              overflow="hidden"
              borderColor={index === 0 ? "blue.300" : "gray.300"}
              position="relative"
            >
              <VStack>
                <Box position="relative" w="full" h="150px">
                  <Image 
                    src={image}
                    objectFit="cover"
                    w="full"
                    h="full"
                    alt={`Uploaded ${getImageLabel(index)}`}
                  />
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg={index === 0 ? "rgba(0,100,255,0.7)" : "rgba(0,0,0,0.6)"}
                    color="white"
                    p={1}
                    fontSize="sm"
                    textAlign="center"
                  >
                    {getImageLabel(index)} {index === 0 ? "(For Validation)" : "(Reference Only)"}
                  </Box>
                  <Button
                    position="absolute"
                    top="2"
                    right="2"
                    size="xs"
                    colorScheme="red"
                    borderRadius="full"
                    onClick={() => {
                      // Remove this image from array
                      setCapturedImages(prev => prev.filter((_, i) => i !== index));
                      // Reset step based on remaining images
                      if (capturedImages.length === 2) {
                        setCaptureStep(1); // Back to second image step
                      } else if (capturedImages.length === 1) {
                        setCaptureStep(0); // Back to first image step
                      }
                    }}
                  >
                    ✕
                  </Button>
                </Box>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    );
  }, [capturedImages, getImageLabel]);

  return (
    <VStack w={"full"} mt={3} spacing={4}>
      {errorMessage && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text flex="1">{errorMessage}</Text>
          <CloseButton onClick={() => setErrorMessage(null)} />
        </Alert>
      )}
      
      {/* Hidden file input for uploads */}
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        display="none"
        onChange={handleFileUpload}
      />
      
      <VStack spacing={4} w="full">
        {/* Upload instructions */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>
            {captureStep === 0 
              ? "Please upload a clear image of your receipt"
              : captureStep === 1 
                ? "Now upload an image of the product" 
                : "Images ready to submit"}
          </Text>
        </Alert>
        
        <Button
          colorScheme="blue"
          leftIcon={<ScanIcon size={20} color="white" />}
          onClick={triggerFileUpload}
          w="full"
          h="50px"
          fontSize="md"
        >
          {uploadButtonText()}
        </Button>
        
        {renderImagePreviews()}
        
        {captureStep > 0 && (
          <HStack spacing={2} my={2}>
            {[1, 2].map((step) => (
              <Box 
                key={step} 
                w="10px" 
                h="10px" 
                borderRadius="full" 
                bg={captureStep >= step ? "green.500" : "gray.300"}
              />
            ))}
          </HStack>
        )}
        
        {capturedImages.length === 2 && (
          <Button 
            colorScheme="purple" 
            onClick={submitImages}
            w="full"
            size="lg"
          >
            Submit Images
          </Button>
        )}
        
        {capturedImages.length > 0 && (
          <Button 
            colorScheme="red" 
            variant="outline"
            onClick={resetCapture}
            w="full"
          >
            Reset
          </Button>
        )}
      </VStack>
    </VStack>
  );
}; 