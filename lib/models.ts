export type ModelProvider = 'groq' | 'together' | 'deepseek';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  apiUrl: string;
  apiKeyEnv: string;
  modelName: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: 'llama-3.3-70b',
    name: 'LLaMA 3.3 70B (Groq)',
    provider: 'groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKeyEnv: 'GROQ_API_KEY',
    modelName: 'llama-3.3-70b-versatile'
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 (Together)',
    provider: 'together',
    apiUrl: 'https://api.together.xyz/v1/chat/completions',
    apiKeyEnv: 'TOGETHER_API_KEY',
    modelName: 'deepseek-ai/DeepSeek-V3'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    modelName: 'deepseek-reasoner'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    modelName: 'deepseek-chat'
  }
];
