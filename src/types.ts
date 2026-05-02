/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AIModel {
  KIMI = 'kimi',
  CLAUDE = 'claude',
  COPILOT = 'copilot',
  GPT35 = 'gpt-3.5-turbo'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: AIModel;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface User {
  username: string;
}

export const LOADING_IMAGES = Array.from({ length: 231 }, (_, i) => {
  const frameNumber = String(i + 1).padStart(3, '0');
  return `https://deploy.nexapanel.my.id/x/ezgif-frame-${frameNumber}.png`;
});

export const MODEL_CONFIGS = {
  [AIModel.KIMI]: "https://api.nexray.eu.cc/ai/kimi?text=",
  [AIModel.CLAUDE]: "https://api.nexray.eu.cc/ai/claude?text=",
  [AIModel.COPILOT]: "https://api.nexray.eu.cc/ai/copilot?text=",
  [AIModel.GPT35]: "https://api.nexray.eu.cc/ai/gpt-3.5-turbo?text="
};
