import { ethers } from "ethers";

// ── Contract ABIs (minimal) ──
export const MOCK_USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export const DIASPORA_POOL_ABI = [
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function poolBalance(address) view returns (uint256)",
  "function getInrEquivalent(uint256 usdtAmount) view returns (uint256)",
  "function inrPerUsdt() view returns (uint256)",
  "event Deposited(address indexed user, uint256 usdtAmount, uint256 timestamp)",
  "event Withdrawn(address indexed user, uint256 usdtAmount, uint256 inrEquivalent, uint256 timestamp)",
];

// ── Deployed contract addresses (Mumbai testnet) ──
// These will be set after `npx hardhat run scripts/deploy.js --network mumbai`
export const CONTRACT_ADDRESSES = {
  MockUSDT: import.meta.env.VITE_MOCK_USDT_ADDRESS || "",
  DiasporaPool: import.meta.env.VITE_DIASPORA_POOL_ADDRESS || "",
};

// ── Provider / Signer helpers ──
export async function getProvider() {
  if (!window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  if (!provider) return null;
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask to use Web3 features.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { signer, address, chainId: network.chainId };
}

export async function switchToMumbai() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }], // Mumbai = 80001 = 0x13881
    });
  } catch (err) {
    if (err.code === 4902) {
      // Add network
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13881",
            chainName: "Polygon Mumbai Testnet",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
            blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
          },
        ],
      });
    }
  }
}

// ── Contract getters ──
export function getMockUSDT(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.MockUSDT, MOCK_USDT_ABI, signerOrProvider);
}

export function getDiasporaPool(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.DiasporaPool, DIASPORA_POOL_ABI, signerOrProvider);
}

// ── High-level actions ──
export async function getUSDTBalance(address) {
  try {
    const provider = await getProvider();
    if (!provider || !CONTRACT_ADDRESSES.MockUSDT) return "0.00";
    const usdt = getMockUSDT(provider);
    const bal = await usdt.balanceOf(address);
    return ethers.utils.formatUnits(bal, 6);
  } catch {
    return "0.00";
  }
}

export async function depositToPool(signer, usdtAmount) {
  const usdt = getMockUSDT(signer);
  const pool = getDiasporaPool(signer);
  const amountWei = ethers.utils.parseUnits(String(usdtAmount), 6);

  // Approve pool to spend USDT
  const approveTx = await usdt.approve(CONTRACT_ADDRESSES.DiasporaPool, amountWei);
  await approveTx.wait();

  // Deposit
  const depositTx = await pool.deposit(amountWei);
  const receipt = await depositTx.wait();
  return receipt.transactionHash;
}

export async function withdrawFromPool(signer, usdtAmount) {
  const pool = getDiasporaPool(signer);
  const amountWei = ethers.utils.parseUnits(String(usdtAmount), 6);
  const tx = await pool.withdraw(amountWei);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function getPoolBalance(address) {
  try {
    const provider = await getProvider();
    if (!provider || !CONTRACT_ADDRESSES.DiasporaPool) return "0.00";
    const pool = getDiasporaPool(provider);
    const bal = await pool.poolBalance(address);
    return ethers.utils.formatUnits(bal, 6);
  } catch {
    return "0.00";
  }
}
