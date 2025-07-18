# 🚀 QF Contract Deployment Guide

## Overview

This guide will walk you through deploying your QF contract to the POP Network and integrating it with your React application.

## Prerequisites

- ✅ QF contract code compiled and ready
- ✅ Admin wallet connected: `5G9G6KPc1h2f2npsRBj4Y97JVvJSGHKuuLnhJCCdHVH8der1`
- ✅ POP tokens for deployment and gas fees
- ✅ Contract metadata generated (`.papi/contracts/qf_funding.json`)

## Step 1: Deploy Contract to POP Network

### Option A: Using cargo-contract CLI

```bash
# Navigate to your contract directory
cd contracts/

# Build the contract (if not already done)
cargo contract build --release

# Deploy to POP Network
cargo contract instantiate \
  --constructor new \
  --args 1000000000000000000 \
  --suri "//Alice" \
  --url wss://rpc1.paseo.popnetwork.xyz \
  --execute
```

### Option B: Using Contracts UI

1. Go to [Contracts UI](https://contracts-ui.substrate.io/)
2. Connect to POP Network: `wss://rpc1.paseo.popnetwork.xyz`
3. Upload your contract file: `contracts/qf_funding.contract`
4. Instantiate with constructor args:
   - `min_contribution_unscaled`: `1000000000000000000` (1 POP minimum)
5. Copy the deployed contract address

## Step 2: Update Application Configuration

### 2.1 Initialize Contract in Your App

Add this to your main app component or where you want to initialize QF functionality:

```typescript
import { initializeQfContract } from './services/qfContractService'

// Replace with your deployed contract address
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE'

// Initialize when app starts
useEffect(() => {
  const init = async () => {
    try {
      await initializeQfContract(CONTRACT_ADDRESS)
      console.log('QF Contract initialized successfully')
    } catch (error) {
      console.error('Failed to initialize QF contract:', error)
    }
  }
  
  init()
}, [])
```

### 2.2 Add Admin Route

Update your routing to include the admin dashboard:

```typescript
// In your Router setup
import { AdminDashboard } from './components/admin'

<Route 
  path="/admin" 
  element={<AdminDashboard contractAddress={CONTRACT_ADDRESS} />} 
/>
```

### 2.3 Update ActiveRounds Component

The ActiveRounds component now needs contract initialization:

```typescript
// In CityApp.tsx or wherever ActiveRounds is used
import { useQfContract } from '../hooks/useQfContract'

const { initializeContract } = useQfContract()

useEffect(() => {
  initializeContract(CONTRACT_ADDRESS)
}, [])
```

## Step 3: Admin Setup Flow

### 3.1 Access Admin Dashboard

1. Connect your admin wallet: `5G9G6KPc1h2f2npsRBj4Y97JVvJSGHKuuLnhJCCdHVH8der1`
2. Navigate to `/admin`
3. Verify you see the admin interface

### 3.2 Add Projects

1. Go to **Projects** tab
2. Add project wallet addresses:
   ```
   Example addresses:
   5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
   5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y
   5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy
   ```
3. Click **Add Project** for each
4. Note the project IDs returned

### 3.3 Create Funding Round

1. Go to **Rounds** tab
2. Set parameters:
   - **Matching Pool**: `100` (POP tokens)
   - **Duration**: `168` (hours = 1 week)
   - **Eligible Projects**: Select the projects you just added
3. Click **Create Round**
4. Note the round ID returned

## Step 4: Test User Flow

### 4.1 Test Contribution Flow

1. Connect a different wallet (not admin)
2. Go to main QF rounds page
3. You should see your active round
4. Click on projects and test contributions
5. Verify QF calculations update in real-time

### 4.2 Test Admin Functions

1. Go back to admin dashboard
2. Test **Distribute Funds** when round is complete
3. Verify funds are distributed to project wallets

## Step 5: Production Deployment

### 5.1 Environment Variables

Create production environment variables:

```env
VITE_QF_CONTRACT_ADDRESS=your_deployed_address
VITE_ADMIN_ADDRESS=5G9G6KPc1h2f2npsRBj4Y97JVvJSGHKuuLnhJCCdHVH8der1
VITE_POP_NETWORK_URL=wss://rpc1.paseo.popnetwork.xyz
```

### 5.2 Update Service Configuration

```typescript
// In qfContractService.ts
const CONTRACT_ADDRESS = import.meta.env.VITE_QF_CONTRACT_ADDRESS || ''
const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '5G9G6KPc1h2f2npsRBj4Y97JVvJSGHKuuLnhJCCdHVH8der1'
const WS_PROVIDER_URL = import.meta.env.VITE_POP_NETWORK_URL || 'wss://rpc1.paseo.popnetwork.xyz'
```

### 5.3 Build and Deploy

```bash
# Test build
pnpm build

# Deploy to your hosting platform
pnpm deploy  # or your deployment command
```

## Step 6: Monitoring and Maintenance

### 6.1 Contract Events

Monitor contract events for:
- New contributions
- Round creation/completion
- Fund distributions
- Error transactions

### 6.2 Admin Tasks

Regular admin tasks:
- Create new funding rounds
- Add new projects
- Distribute funds at round completion
- Monitor contract balance

### 6.3 User Support

Common user issues:
- Wallet connection problems
- Insufficient balance for contributions
- Network connectivity issues
- Transaction failures

## Troubleshooting

### Contract Initialization Fails

```typescript
// Check if contract address is correct
console.log('Contract address:', CONTRACT_ADDRESS)

// Verify network connection
console.log('Network URL:', WS_PROVIDER_URL)

// Check contract compatibility
const isCompatible = await contract.isCompatible()
console.log('Contract compatible:', isCompatible)
```

### Transaction Failures

1. **Insufficient Balance**: Ensure wallet has enough POP tokens
2. **Gas Estimation**: Increase gas limits if needed
3. **Network Issues**: Check POP network status
4. **Contract State**: Verify round is active and project exists

### Admin Access Issues

1. **Wrong Account**: Verify exact admin address match
2. **Network Mismatch**: Ensure connected to POP network
3. **Wallet Extension**: Try different wallet extensions

## Success Checklist

- [ ] Contract deployed successfully
- [ ] Contract address updated in app
- [ ] Admin can access dashboard
- [ ] Projects can be added
- [ ] Rounds can be created
- [ ] Users can contribute
- [ ] QF calculations work
- [ ] Funds can be distributed
- [ ] Production deployment complete

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify wallet connection and network
3. Test with small amounts first
4. Monitor transaction status on block explorer
5. Refer to contract documentation for method details

## Next Steps

After successful deployment:

1. **Create Documentation**: User guides for contributors
2. **Marketing**: Announce your QF platform
3. **Analytics**: Track usage and funding metrics
4. **Improvements**: Gather feedback and iterate
5. **Scale**: Add more cities/regions

Your QF platform is now ready for production! 🎉 