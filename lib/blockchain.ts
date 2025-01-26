import { ethers } from "ethers";

const DocumentRegistryABI = {
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "uploader",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "ipfsUrl",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "DocumentUpdated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "walletAddress",
          type: "address",
        },
      ],
      name: "getDocument",
      outputs: [
        {
          internalType: "string",
          name: "ipfsUrl",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "ipfsUrl",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
      ],
      name: "updateDocument",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

// OpenCampus Chain Configuration
const OPENCAMPUS_RPC_URL = "https://rpc.open-campus-codex.gelato.digital";
const CHAIN_ID = 656476;

interface DocumentResult {
  ipfsUrl: string;
  timestamp: Date;
  metadata: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class EduChainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;
  private currentTimestamp: string = "2025-01-26 00:10:51";
  private currentUser: string = "AmrendraTheCoder";

  constructor() {
    // Connect to OpenCampus Codex network
    this.provider = new ethers.JsonRpcProvider(OPENCAMPUS_RPC_URL);
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS!,
      DocumentRegistryABI.abi,
      this.provider
    );
  }

  async connectWallet() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Please install MetaMask or compatible wallet");
    }

    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: "Open Campus Codex",
                nativeCurrency: {
                  name: "EDU",
                  symbol: "EDU",
                  decimals: 18,
                },
                rpcUrls: [OPENCAMPUS_RPC_URL],
                blockExplorerUrls: ["https://opencampus-codex.blockscout.com/"],
              },
            ],
          });
        } else {
          throw error;
        }
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await provider.getSigner();
    this.contract = this.contract.connect(this.signer);

    return await this.signer.getAddress();
  }

  async updateDocument(ipfsUrl: string, metadata: string = "") {
    if (!this.signer) {
      throw new Error("Please connect wallet first");
    }

    // If no metadata provided, create default metadata
    if (!metadata) {
      metadata = JSON.stringify({
        uploadDate: this.currentTimestamp,
        uploaderName: this.currentUser,
      });
    }

    const tx = await this.contract.updateDocument(ipfsUrl, metadata);
    await tx.wait();
    return tx.hash;
  }

  async getDocument(walletAddress: string): Promise<DocumentResult> {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error("Invalid wallet address");
    }

    const doc = await this.contract.getDocument(walletAddress);
    return {
      ipfsUrl: doc[0],
      timestamp: new Date(Number(doc[1]) * 1000),
      metadata: doc[2],
    };
  }

  async getCurrentWallet(): Promise<string | null> {
    if (!this.signer) {
      return null;
    }
    return await this.signer.getAddress();
  }

  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  getCurrentTimestamp(): string {
    return this.currentTimestamp;
  }

  getCurrentUser(): string {
    return this.currentUser;
  }

  getExplorerUrl(txHash: string): string {
    return `https://opencampus-codex.blockscout.com/tx/${txHash}`;
  }
}

export const eduChainService = new EduChainService();
