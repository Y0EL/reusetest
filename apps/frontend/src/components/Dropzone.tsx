import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, HStack, Text, VStack, Alert, AlertIcon, CloseButton } from "@chakra-ui/react";
import { ScanIcon } from "./Icon";
import { blobToBase64, getDeviceId, resizeImage } from "../util";
import { useWallet } from "@vechain/dapp-kit-react";
import { submitReceipt } from "../networking";
import { useDisclosure, useSubmission } from "../hooks";

export const Dropzone = () => {
  const { account } = useWallet();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setIsLoading, setResponse } = useSubmission();
  const { onOpen } = useDisclosure();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      onFileUpload(acceptedFiles); // Pass the files to the callback
    },
    maxFiles: 1, // Allow only one file
    accept: {
      "image/*": [], // Accept only image files
    },
  });

  const onFileUpload = useCallback(
    async (files: File[]) => {
      // Reset error message on new upload attempt
      setErrorMessage(null);
      
      if (files.length > 1 || files.length === 0) {
        setErrorMessage("Please upload only one image file");
        return;
      }

      if (!account) {
        setErrorMessage("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      onOpen();

      const file = files[0];

      const resizedBlob = await resizeImage(file);
      const base64Image = await blobToBase64(resizedBlob as Blob);

      const deviceID = await getDeviceId();

      try {
        const response = await submitReceipt({
          address: account,
          deviceID,
          image: base64Image,
        });

        console.log(response);
        setResponse(response);
      } catch (error: any) {
        // Extract and display the actual error message
        const errorMsg = error?.message || "An error occurred while uploading the receipt";
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
    },
    [account, onOpen, setIsLoading, setResponse],
  );

  return (
    <VStack w={"full"} mt={3} spacing={4}>
      {errorMessage && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text flex="1">{errorMessage}</Text>
          <CloseButton onClick={() => setErrorMessage(null)} />
        </Alert>
      )}
      
      <Box
        {...getRootProps()}
        p={5}
        border="2px"
        borderColor={isDragActive ? "green.300" : errorMessage ? "red.300" : "gray.300"}
        borderStyle="dashed"
        borderRadius="md"
        bg={isDragActive ? "green.100" : errorMessage ? "red.50" : "gray.50"}
        textAlign="center"
        cursor="pointer"
        _hover={{
          borderColor: errorMessage ? "red.500" : "green.500",
          bg: errorMessage ? "red.50" : "green.50",
        }}
        w={"full"}
        h={"200px"}
        display="flex" // Make the Box a flex container
        alignItems="center" // Align items vertically in the center
        justifyContent="center" // Center content horizontally
      >
        <input {...getInputProps()} />
        <HStack>
          <ScanIcon size={120} color={errorMessage ? "red" : "gray"} />
          <Text>{errorMessage ? "Try uploading again" : "Upload to scan receipt"}</Text>
        </HStack>
      </Box>
    </VStack>
  );
};
