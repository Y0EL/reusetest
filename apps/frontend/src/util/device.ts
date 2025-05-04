import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Generates a device ID using the FingerprintJS library
 * @returns {Promise<string>} The generated device ID
 */
export const getDeviceId = async () => {
  try {
    // Load the FingerprintJS agent
    const fp = await FingerprintJS.load();

    // Get the visitor identifier
    const result = await fp.get();

    // Use the fingerprint's visitorId as the device ID
    return result.visitorId;
  } catch (error) {
    console.error("Error generating device ID:", error);
    // Fallback to a random string if FingerprintJS fails
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};
