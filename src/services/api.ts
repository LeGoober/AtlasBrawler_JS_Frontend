import { PlayerStats, GameSession } from '../types';

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8080/api';

export interface PlayerResponse extends PlayerStats {
  id: number;
}

export interface GameSessionRequest extends GameSession {
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
  try {
    const response = await fetch(`${API_BASE}/players/${walletAddress}/balance`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }
    
    return response.json();
  } catch (err) {
    console.error('API Error fetching player balance:', err);
    return null;
  }
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
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  } catch (err) {
    console.error('Health check failed:', err);
    return { status: 'offline' };
  }
}

/**
 * Get game leaderboard
 */
export async function getLeaderboard(limit: number = 10): Promise<PlayerResponse[]> {
  const response = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Update player username
 */
export async function updateUsername(walletAddress: string, newUsername: string): Promise<PlayerResponse> {
  const response = await fetch(`${API_BASE}/players/${walletAddress}/username`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: newUsername }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update username: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get player game history
 */
export async function getPlayerHistory(walletAddress: string, limit: number = 10): Promise<any[]> {
  const response = await fetch(`${API_BASE}/players/${walletAddress}/history?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch player history: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Purchase shop item
 */
export async function purchaseItem(walletAddress: string, itemId: number, signature: string): Promise<any> {
  const response = await fetch(`${API_BASE}/shop/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, itemId, signature }),
  });
  
  if (!response.ok) {
    throw new Error(`Purchase failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get available shop items
 */
export async function getShopItems(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/shop/items`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch shop items: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get player inventory
 */
export async function getPlayerInventory(walletAddress: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/players/${walletAddress}/inventory`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch inventory: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Transfer tokens to another player
 */
export async function transferTokens(
  fromAddress: string,
  toAddress: string,
  amount: number,
  signature: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/tokens/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, amount, signature }),
  });
  
  if (!response.ok) {
    throw new Error(`Transfer failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(walletAddress: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/transactions/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction history: ${response.statusText}`);
  }
  
  return response.json();
}