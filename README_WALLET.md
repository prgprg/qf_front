# Polkadot Wallet Integration Guide

## 🛠️ **Setup Requirements**

### **1. Install Talisman Wallet**
- Download from: https://www.talisman.xyz/
- Available for Chrome, Firefox, and Brave browsers
- Alternative: Polkadot.js extension

### **2. Create/Import Account**
- Create a new account or import existing seed phrase
- Make sure you have at least one account available

### **3. Network Configuration**
The application connects to **Asset Hub Westend** testnet:
- **Network**: Asset Hub Westend
- **Endpoint**: `wss://asset-hub-westend-rpc.polkadot.io`
- **Chain Type**: Testnet
- **SS58 Format**: 42

## 🚀 **Using the Application**

### **Wallet Connection Flow**
1. Navigate to any city page (e.g., `/cities/aachen`)
2. Click "Connect Wallet" in the top-right corner
3. Grant permission to the "Sustained QF Platform"
4. Select your account from the dropdown
5. View network status and account details

### **Features Available**
- **Account Selection**: Switch between multiple accounts
- **Network Status**: View current network information
- **Real-time Connection**: Automatic reconnection handling
- **Persistent Sessions**: Account selection saved across sessions

### **Contract Integration**
The wallet is configured for:
- **Smart Contract Calls**: Ready for ink! contract interaction
- **Transaction Signing**: Polkadot.js injector integration
- **Balance Queries**: Asset Hub native token support
- **QF Contributions**: Prepared for quadratic funding transactions

## 🔧 **Technical Details**

### **Architecture**
```
PolkadotProvider (Context)
├── API Connection (Asset Hub Westend)
├── Wallet Management (Talisman/Polkadot.js)
├── Account Selection
└── Error Handling
```

### **Key Components**
- `PolkadotContext`: Global state management
- `WalletConnection`: UI component for wallet interaction
- `usePolkadot`: React hook for accessing wallet state

### **Available Methods**
```typescript
const {
  isWalletConnected,
  selectedAccount,
  connectWallet,
  disconnectWallet,
  api, // Polkadot API instance
  injector // For signing transactions
} = usePolkadot()
```

## 🧪 **Testing the Integration**

1. **Connection Test**:
   - Click "Connect Wallet"
   - Should show Talisman accounts
   - Network indicator should show "Asset Hub Westend"

2. **Account Switching**:
   - Select different accounts from dropdown
   - Account should persist after page refresh

3. **Network Status**:
   - Click network indicator to view chain details
   - Should show correct SS58 format and chain type

## 🔗 **Next Steps for Contract Integration**

### **Smart Contract Deployment**
```bash
# Deploy your ink! contract to Asset Hub Westend
cargo contract build
cargo contract instantiate --constructor new --args 1000000000000
```

### **Contract Interaction Example**
```typescript
// Example contribution transaction
const contribute = async (projectId: number, amount: number) => {
  const { api, injector, selectedAccount } = usePolkadot()
  
  if (!api || !injector || !selectedAccount) return
  
  const tx = api.tx.contracts.call(
    contractAddress,
    0, // value
    gasLimit,
    'contribute',
    [projectId, amount]
  )
  
  await tx.signAndSend(
    selectedAccount.address,
    { signer: injector.signer },
    (result) => {
      // Handle transaction result
    }
  )
}
```

## 🎯 **Ready for Hackathon Demo**

The wallet integration provides:
- ✅ Professional UI/UX
- ✅ Real Polkadot network connection  
- ✅ Multi-account support
- ✅ Error handling and loading states
- ✅ Persistent user sessions
- ✅ Ready for smart contract calls

Your QF platform now has enterprise-grade Web3 wallet integration! 🚀 