import { Button, HStack, Text, Tooltip, Box, Spinner } from "@chakra-ui/react";
import { useWallet } from "@vechain/dapp-kit-react";
import { useEffect } from "react";
import { FaReceipt } from "react-icons/fa6";
import { useSubmissionStore } from "../store/submissionStore";

interface SubmissionCounterProps {
  isCompact?: boolean;
}

export const SubmissionCounter = ({ isCompact = false }: SubmissionCounterProps) => {
  const { account } = useWallet();
  const { submissionData, isLoading, hasError, fetchSubmissionData, refreshSubmissionData } = useSubmissionStore();

  // Update meta tag for store to access current wallet
  useEffect(() => {
    if (account) {
      // Create or update meta tag for current wallet
      let metaTag = document.querySelector('meta[name="current-wallet"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'current-wallet');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', account);
    }
  }, [account]);

  useEffect(() => {
    const loadData = async () => {
      if (!account) return;
      
      await fetchSubmissionData(account);
    };

    loadData();

    // Refresh data setiap 60 detik
    const intervalId = setInterval(() => {
      if (account) refreshSubmissionData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [account, fetchSubmissionData]);

  // Handle manual refresh
  const handleRefresh = () => {
    if (account) {
      fetchSubmissionData(account);
    }
  };

  // If not connected, don't show anything
  if (!account) return null;

  // Show loading or error state
  if (isCompact) {
    return (
      <Tooltip label={hasError ? "Could not load data" : "Remaining submissions for this cycle"}>
        <Box 
          px={2}
          py={1}
          bg="rgba(235, 236, 252, 1)"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          onClick={handleRefresh}
          cursor="pointer"
          role="button"
          aria-label="Refresh submission data"
        >
          {isLoading ? (
            <Spinner size="xs" />
          ) : hasError ? (
            <Text fontSize="xs" fontWeight="medium" color="red.500">Error</Text>
          ) : submissionData ? (
            <>
              <FaReceipt size={14} />
              <Text fontSize="xs" fontWeight="medium">
                {submissionData.remaining}/{submissionData.max}
              </Text>
            </>
          ) : (
            <Spinner size="xs" />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={hasError ? "Could not load data" : "Remaining submissions for this cycle"}>
      <Button
        rounded={"full"}
        color="black"
        size="md"
        bg="rgba(235, 236, 252, 1)"
        isLoading={isLoading}
        onClick={handleRefresh}
      >
        <HStack spacing={2}>
          {hasError ? (
            <Text fontWeight={"400"} color="red.500">Connection Error</Text>
          ) : submissionData ? (
            <>
              <FaReceipt />
              <Text fontWeight={"400"}>
                {submissionData.remaining}/{submissionData.max}
              </Text>
            </>
          ) : (
            <Spinner size="xs" />
          )}
        </HStack>
      </Button>
    </Tooltip>
  );
}; 