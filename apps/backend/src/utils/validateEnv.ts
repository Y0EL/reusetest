import { makeValidator, cleanEnv, port, str } from 'envalid';

const openApiKey = makeValidator((apiKey: string) => {
  // Terima semua format API key
  // Paling penting, aplikasi tidak crash saat startup
  if (apiKey && apiKey.length > 0) {
    return apiKey;
  } else {
    throw new Error('OpenAI API Key is required');
  }
});

export const ValidateEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port({ devDefault: 3000 }),
    ORIGIN: str({ devDefault: '*' }),
    LOG_FORMAT: str({ devDefault: 'prod' }),
    LOG_DIR: str({ devDefault: '../logs' }),
    REWARD_AMOUNT: str({ devDefault: '1' }),
    ADMIN_MNEMONIC: str(),
    NETWORK_URL: str({ devDefault: 'http://localhost:8669' }),
    NETWORK_TYPE: str({ devDefault: 'solo' }),
    OPENAI_API_KEY: openApiKey(),
    MAX_FILE_SIZE: str({ devDefault: '10mb' }),
    ADMIN_ADDRESS: str({ default: '' }),
  });
};
