/**
 * Backend API Client for Atlas Brawler
 * Connects to Spring Boot backend (http://localhost:8080/api)
 */

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8080/api';

export interface PlayerResponse {
  id: number;
  walletAddress: string;
  username: string;
  softTokenBalance: number;
  cUSDBalance: number;
  totalGamesPlayed: number;
  totalWins: number;
  highScore: number;
}

export interface GameSessionRequest {
  walletAddress: string;
  score: number;
  wavesSurvived: number;
  isWin: boolean;
}

export interface RewardClaimRequest {
  rewardId: number;
  walletAddress: string;
  signature: string;
}

/**
 * Register player with wallet signature
 */
export async function registerPlayer(
  walletAddress: string,
  username: string,
  signature: string,
  message: string
): Promise<PlayerResponse> {
  const response = await fetch(`${API_BASE}/players/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, username, signature, message }),
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get player balance
 */
export async function getPlayerBalance(walletAddress: string): Promise<PlayerResponse | null> {
  const response = await fetch(`${API_BASE}/players/${walletAddress}/balance`);
  
  if (!response.ok) {
    // If player is not found, return null instead of throwing so callers can handle this case
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch balance: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Complete game session and earn rewards
 */
export async function completeGameSession(data: GameSessionRequest): Promise<any> {
  const response = await fetch(`${API_BASE}/game/session/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Session complete failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Claim pending rewards
 */
export async function claimReward(data: RewardClaimRequest): Promise<any> {
  const response = await fetch(`${API_BASE}/rewards/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Claim failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get pending rewards for player
 */
export async function getPendingRewards(walletAddress: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/rewards/pending/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch rewards: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
