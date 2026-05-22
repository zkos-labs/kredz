import axios from 'axios';
import { config } from '../config';

interface SumSubConfig {
  apiUrl: string;
  appToken: string;
  secretKey: string;
}

function getConfig(): SumSubConfig | null {
  if (!config.SUMSUB_API_URL || !config.SUMSUB_APP_TOKEN || !config.SUMSUB_SECRET_KEY) {
    return null;
  }
  return {
    apiUrl: config.SUMSUB_API_URL,
    appToken: config.SUMSUB_APP_TOKEN,
    secretKey: config.SUMSUB_SECRET_KEY,
  };
}

export const sumsub = {
  async getCredentialStatus(externalUserId: string): Promise<'pending' | 'approved' | 'rejected' | 'unknown'> {
    const cfg = getConfig();
    if (!cfg) return 'unknown';

    try {
      const response = await axios.get(
        `${cfg.apiUrl}/resources/applicants/-/status?externalUserId=${externalUserId}`,
        {
          headers: {
            'App-Token': cfg.appToken,
            'Accept': 'application/json',
          },
        },
      );

      return response.data?.reviewResult?.reviewAnswer ?? 'unknown';
    } catch (err) {
      console.warn('[sumsub] API call failed:', (err as Error).message);
      return 'unknown';
    }
  },

  async createAccessToken(externalUserId: string, levelName: string = 'basic-kyc-level'): Promise<string | null> {
    const cfg = getConfig();
    if (!cfg) return null;

    try {
      const response = await axios.post(
        `${cfg.apiUrl}/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}`,
        null,
        {
          headers: {
            'App-Token': cfg.appToken,
            'Accept': 'application/json',
          },
        },
      );

      return response.data?.token ?? null;
    } catch (err) {
      console.warn('[sumsub] failed to create access token:', (err as Error).message);
      return null;
    }
  },
};
