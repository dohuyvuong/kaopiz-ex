import { AuthParams } from '../interfaces/token.interface';

/**
 * Utility để extract code và session_state từ callback URL
 */
export function extractAuthParams(input: string): AuthParams {
  if (!input || !input.trim()) {
    return { code: null, sessionState: null };
  }

  const trimmed = input.trim();
  let code: string | null = null;
  let sessionState: string | null = null;

  // Nếu là URL đầy đủ
  if (trimmed.includes('code=')) {
    // Extract từ hash fragment (#code=...)
    if (trimmed.includes('#code=')) {
      const hashPart = trimmed.split('#')[1];
      const params = new URLSearchParams(hashPart);
      code = params.get('code');
      sessionState = params.get('session_state');
    }
    // Extract từ query string (?code=...)
    else if (trimmed.includes('?code=')) {
      try {
        const urlObj = new URL(trimmed);
        code = urlObj.searchParams.get('code');
        sessionState = urlObj.searchParams.get('session_state');
      } catch {
        // Fallback: manual parsing
        const codeMatch = trimmed.match(/code=([^&]+)/);
        const sessionMatch = trimmed.match(/session_state=([^&]+)/);
        if (codeMatch) code = codeMatch[1];
        if (sessionMatch) sessionState = sessionMatch[1];
      }
    }
    // Fallback: manual parsing
    else {
      const codeMatch = trimmed.match(/code=([^&]+)/);
      const sessionMatch = trimmed.match(/session_state=([^&]+)/);
      if (codeMatch) code = codeMatch[1];
      if (sessionMatch) sessionState = sessionMatch[1];
    }
  }
  // Nếu chỉ là code (không phải URL)
  else {
    code = trimmed;
  }

  return { code, sessionState };
}
