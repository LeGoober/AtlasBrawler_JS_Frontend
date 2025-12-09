# Atlas Brawler Wallet Integration Guide

## Overview
Atlas Brawler now supports seamless wallet integration with MetaMask and MiniPay (Celo's native wallet). This guide explains the UI changes, integration details, and how to leverage the premium wallet features for enhanced user experience.

## Supported Wallets

### MetaMask
- **Browser Extension**: Standard Ethereum wallet
- **Network**: Automatically switches to Celo Sepolia testnet
- **Connection**: Manual user approval required
- **UI Flow**: Full wallet connection prompts

### MiniPay
- **Mobile App**: Celo's native dApp wallet
- **Network**: Native Celo support
- **Connection**: Automatic silent connection
- **UI Flow**: Streamlined, wallet-optional experience

## UI Changes and User Experience

### 1. Login Screen (`components/screens/Login.tsx`)

#### MetaMask Users
- Displays "LOGIN" header
- Shows "Connect Wallet" button with MetaMask branding
- Full connection flow with user prompts

#### MiniPay Users
- Displays "WELCOME SKATER" header
- Shows "Connected via MiniPay. Starting game..." message
- **No connect button** - automatic silent connection
- Screen may be skipped entirely if already connected

```typescript
// Key UI Logic
if (isMiniPay && isConnected) {
  return null; // Skip login screen entirely
}
```

### 2. Signup Screen (`components/screens/Signup.tsx`)

#### MetaMask Users
- Standard signup flow:
  1. Connect wallet button
  2. Username input field
  3. Sign message for verification
  4. Registration completion

#### MiniPay Users
- **Ultra-streamlined experience**:
  - Auto-connects wallet silently
  - Clean "CHOOSE YOUR TAG" interface
  - Only username input required
  - No visible wallet connection UI
  - "Connected via MiniPay" indicator

```typescript
// MiniPay Flow
if (isMiniPay) {
  // Clean UI with just username input
  // Auto-connects in background
}
```

### 3. Profile Screen (`components/screens/Profile.tsx`)

#### Universal Features
- Displays wallet address (truncated with copy button)
- Shows player stats (wins, losses)
- Balance display
- Friend addition functionality

#### Wallet-Specific Enhancements
- **MiniPay**: Native Celo token display
- **MetaMask**: Standard ERC-20 token display

## Integration Architecture

### Core Hook: `useWallet` (`src/hooks/useWallet.ts`)

#### Key Features
- **Auto-detection**: Detects MiniPay vs MetaMask
- **Auto-connect**: Silent connection for MiniPay
- **Network switching**: Automatic Celo Sepolia setup
- **Reconnection**: Persistent wallet state across sessions
- **Signature handling**: Message signing for registration

#### Wallet State Interface
```typescript
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  signer: JsonRpcSigner | null;
  isMiniPay: boolean; // Key differentiator
}
```

### Connection Methods

#### MetaMask Connection
```typescript
const connectMetaMask = () => connectInjected(false); // Prompts user
```

#### MiniPay Connection
```typescript
const connectMiniPay = () => connectInjected(true); // Silent connect
// Auto-triggers on mount if MiniPay detected
```

### Network Configuration
```typescript
const CELO_SEPOLIA = {
  chainId: '0xAA36A7', // 11155111
  chainName: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://forno.sepolia.celo.org'],
  blockExplorerUrls: ['https://sepolia.celoscan.io'],
};
```

## Premium Service Features

### 1. Silent Authentication
- MiniPay users experience zero-friction login
- Automatic wallet connection on app launch
- No manual approval steps required

### 2. Native Token Integration
- Direct Celo token balance display
- Native MiniPay transaction support
- Seamless in-app purchases

### 3. Enhanced User Experience
- Context-aware UI (hides wallet buttons for MiniPay)
- Optimized mobile experience
- Reduced cognitive load for users

### 4. Persistent Sessions
- Automatic reconnection on app restart
- Cross-session wallet state management
- Secure localStorage-based persistence

## Switching to Premium Service

### For Existing Projects
1. **Install Dependencies**
   ```bash
   npm install @walletconnect/web3-provider ethers
   ```

2. **Implement useWallet Hook**
   - Copy the `useWallet.ts` implementation
   - Configure for your network requirements

3. **Update Components**
   - Modify login/signup screens for wallet-aware UI
   - Add conditional rendering based on `isMiniPay` state
   - Implement signature-based authentication

4. **Configure Networks**
   - Update `CELO_SEPOLIA` config for your target network
   - Add network switching logic

### For New Projects
1. **Start with Template**
   - Use the provided Atlas Brawler structure
   - Customize UI theming and branding

2. **Integrate Backend**
   - Implement signature verification endpoints
   - Add player registration/login APIs
   - Configure token balance queries

3. **Test Both Flows**
   - Test MetaMask connection flow
   - Test MiniPay auto-connection
   - Verify cross-device compatibility

## Security Considerations

### Signature-Based Authentication
- Users sign registration messages
- Server verifies signatures against addresses
- Prevents unauthorized account creation

### Network Security
- Automatic network switching to prevent mainnet accidents
- Testnet-first approach for development
- Clear network indicators in UI

### Session Management
- Secure localStorage for wallet state
- Automatic cleanup on disconnect
- Event listeners for account/network changes

## Troubleshooting

### Common Issues

1. **MiniPay Not Auto-Connecting**
   - Ensure `window.ethereum.isMiniPay` detection
   - Check for conflicting wallet extensions

2. **MetaMask Network Switching**
   - Verify RPC URLs are accessible
   - Handle user rejection gracefully

3. **Signature Failures**
   - Check message formatting
   - Verify signer is properly initialized

### Debug Mode
Enable detailed logging by adding console logs to connection methods.

## Future Enhancements

- **Multi-wallet support** (WalletConnect v2)
- **Hardware wallet integration**
- **Batch transaction support**
- **Gasless transactions** via meta-transactions

## Support

For premium integration support:
- Contact Amp Code support
- Reference this integration guide
- Provide specific error logs for debugging

---

*This guide is maintained for Atlas Brawler v1.0.0+ with React 19 and Celo Sepolia support.*
