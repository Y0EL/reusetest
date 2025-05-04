import { Button, Fade, HStack, Text, useBreakpointValue } from "@chakra-ui/react";
import { useWallet, useWalletModal } from "@vechain/dapp-kit-react";
import { FaWallet } from "react-icons/fa6";
import { AddressIcon } from "./Icon";
import { humanAddress } from "@repo/utils/FormattingUtils";

export const ConnectWalletButton = () => {
  const { account } = useWallet();
  const { open } = useWalletModal();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!account)
    return (
      <Fade in={true}>
        <Button
          onClick={open}
          colorScheme="primary"
          size={isMobile ? "sm" : "md"}
          leftIcon={<FaWallet />}
          data-testid="connect-wallet"
        >
          {isMobile ? "" : "Connect Wallet"}
        </Button>
      </Fade>
    );

  return (
    <Fade in={true}>
      <Button
        onClick={open}
        rounded={"full"}
        color="black"
        size={isMobile ? "sm" : "md"}
        bg="rgba(235, 236, 252, 1)"
        p={isMobile ? 2 : 4}
      >
        <HStack spacing={2}>
          <AddressIcon address={account} boxSize={4} rounded={"full"} />
          <Text fontWeight={"400"} display={{ base: "none", sm: "block" }}>
            {humanAddress(account, 4, 6)}
          </Text>
        </HStack>
      </Button>
    </Fade>
  );
};
