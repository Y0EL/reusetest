import { Box, Container, HStack, Image, Flex, Show, Hide } from "@chakra-ui/react";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { SubmissionCounter } from "./SubmissionCounter";

export const Navbar = () => {
  return (
    <Box
      px={0}
      position={"sticky"}
      top={0}
      zIndex={10}
      py={4}
      h={"auto"}
      w={"full"}
      bg={"#f7f7f7"}
    >
      <Container
        w="full"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems={"center"}
        maxW={"container.xl"}
      >
        <HStack flex={1} justifyContent={"start"}>
          <Image src="/vebetterdao-logo.svg" />
        </HStack>

        <Hide below="md">
          <HStack flex={1} spacing={4} justifyContent={"end"}>
            <SubmissionCounter />
            <ConnectWalletButton />
          </HStack>
        </Hide>

        <Show below="md">
          <Flex alignItems="center" justifyContent="flex-end" gap={2}>
            <SubmissionCounter isCompact={true} />
            <ConnectWalletButton />
          </Flex>
        </Show>
      </Container>
    </Box>
  );
};
