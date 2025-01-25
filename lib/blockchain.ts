import { ethers } from 'ethers';

const DocumentRegistryABI = {
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "eduId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ipfsUrl",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "institution",
          "type": "string"
        }
      ],
      "name": "DocumentUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "eduId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "institution",
          "type": "string"
        }
      ],
      "name": "DocumentVerified",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "eduId",
          "type": "string"
        }
      ],
      "name": "getDocument",
      "outputs": [
        {
          "internalType": "string",
          "name": "ipfsUrl",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "verified",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "institution",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "eduId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "ipfsUrl",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "institution",
          "type": "string"
        }
      ],
      "name": "updateDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "eduId",
          "type": "string"
        }
      ],
      "name": "verifyDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class EduChainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Connect to eduChain network
    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_EDUCHAIN_RPC_URL);
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS!,
      DocumentRegistryABI.abi,
      this.provider
    );
  }

  async connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Please install MetaMask or compatible wallet');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await provider.getSigner();
    this.contract = this.contract.connect(this.signer);
  }

  async updateDocument(eduId: string, ipfsUrl: string, institution: string) {
    if (!this.signer) {
      throw new Error('Please connect wallet first');
    }

    const tx = await this.contract.updateDocument(eduId, ipfsUrl, institution);
    await tx.wait();
    return tx.hash;
  }

  async getDocument(eduId: string) {
    const doc = await this.contract.getDocument(eduId);
    return {
      ipfsUrl: doc[0],
      timestamp: new Date(doc[1].toNumber() * 1000),
      verified: doc[2],
      institution: doc[3]
    };
  }
}

export const eduChainService = new EduChainService();