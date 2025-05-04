import {
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
  Text,
  HStack,
  Image,
  Button,
} from "@chakra-ui/react";
import { useDisclosure, useSubmission } from "../hooks";
import loaderAnimation from "../assets/lottie/loader-json.json";
import { useLottie } from "lottie-react";
import { AirdropIcon, AlertIcon } from "./Icon";
import { useMemo, useEffect } from "react";
import { useSubmissionStore } from "../store/submissionStore";

export const SubmissionModal = () => {
  const { isLoading, response } = useSubmission();
  const { isOpen, onClose } = useDisclosure();
  const { refreshSubmissionData } = useSubmissionStore();

  // Lottie animation setup
  const lottieOptions = {
    animationData: loaderAnimation,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
  const { View: LottieView } = useLottie(lottieOptions);

  // Refresh submission data when modal closes after successful submission
  useEffect(() => {
    // Use optional chaining to safely access potentially undefined properties
    // TypeScript is happy with this approach
    const validityFactor = response?.validation?.validityFactor;
    const isSuccessful = !isLoading && validityFactor !== undefined && validityFactor > 0.5;
    
    if (isSuccessful) {
      // Schedule refresh after modal closes
      const refreshTimer = setTimeout(() => {
        console.log("Refreshing submission data after successful submission");
        refreshSubmissionData();
      }, 1000);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [isLoading, response, refreshSubmissionData]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <VStack
          bgGradient={
            "radial-gradient(76.36% 85.35% at 50.12% 27.48%, rgba(230, 252, 207, 0.82) 38.14%, rgba(194, 212, 254, 0.82) 100%), #7DF000"
          }
          minH={"40vh"}
          minW={"40vh"}
          borderRadius={16}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <div style={{ width: 200, height: 200 }}>
            {LottieView}
          </div>
          <Text fontSize={24} fontWeight={400}>
            Validating your images...
          </Text>
        </VStack>
      );
    }

    const isValid = response?.validation?.validityFactor === 1;
    const errorMessage = response?.validation?.descriptionOfAnalysis || "Something went wrong";
    const isNoRewardsError = errorMessage.includes("no rewards left");

    return isValid ? (
      <VStack
        bgGradient={
          "radial-gradient(76.36% 85.35% at 50.12% 27.48%, rgba(230, 252, 207, 0.82) 38.14%, rgba(194, 212, 254, 0.82) 100%), #7DF000"
        }
        minH={"40vh"}
        minW={"40vh"}
        borderRadius={16}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <AirdropIcon size={200} color="#373EDF" />
        <Text fontSize={32} fontWeight={600}>
          Congratulations!
        </Text>
        <HStack>
          <Text fontSize={24} fontWeight={400}>
            You've earned 1
          </Text>
          <Image src="b3tr-token.svg" />
        </HStack>
      </VStack>
    ) : (
      <VStack
        bgGradient={
          "radial-gradient(76.36% 85.35% at 50.12% 27.48%, rgba(230, 252, 207, 0.82) 38.14%, rgba(194, 212, 254, 0.82) 100%), #7DF000"
        }
        minH={"40vh"}
        minW={"40vh"}
        borderRadius={16}
        justifyContent={"center"}
        alignItems={"center"}
        p={4}
        spacing={4}
      >
        <AlertIcon size={isNoRewardsError ? 120 : 200} color="#373EDF" />
        <Text fontSize={32} fontWeight={600}>
          {isNoRewardsError ? "Reward Pool Empty" : "Oops!"}
        </Text>
        <Text fontSize={24} fontWeight={400} textAlign="center">
          {errorMessage}
        </Text>
        {isNoRewardsError && (
          <VStack spacing={3}>
            <Text fontSize={16} fontWeight={400} textAlign="center">
              Thank you for participating! We'll replenish the rewards soon.
            </Text>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </VStack>
        )}
      </VStack>
    );
  }, [isLoading, response, LottieView, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="transparent" boxShadow="none">
        {renderContent}
      </ModalContent>
    </Modal>
  );
};
