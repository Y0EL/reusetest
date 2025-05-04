import { Box, Image } from "@chakra-ui/react";
import { useMemo } from "react";

// Fungsi lokal untuk menghasilkan warna dari alamat
const generateColorFromAddress = (address: string): string => {
  if (!address) return '#000000';
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0');
  return `#${c}`;
};

interface AddressIconProps {
  address: string;
  boxSize?: number | string;
  rounded?: string;
}

export const AddressIcon = ({ address, boxSize = 6, rounded = "lg" }: AddressIconProps) => {
  const color = useMemo(() => generateColorFromAddress(address), [address]);
  
  return (
    <Box
      bg={color}
      boxSize={boxSize}
      rounded={rounded}
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  );
};
