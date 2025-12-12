import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { celo } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId from WalletConnect Cloud
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE'

// 2. Create wagmiConfig
const metadata = {
  name: 'Atlas Brawler',
  description: 'Play-to-Earn Skateboarding Game on Celo',
  url: 'https://atlasbrawler-js-frontend.onrender.com',
  icons: ['https://atlasbrawler-js-frontend.onrender.com/assets/atlas_brawler_logo_component.png']
}

const chains = [celo] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#FFF600',
    '--w3m-accent': '#FFF600',
  },
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // MiniPay
  ],
  enableOnramp: false,
})

export const queryClient = new QueryClient()
