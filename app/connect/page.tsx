"use client";

import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  UserCircle,
  FileText,
  Shield,
  Rocket,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Current timestamp and user
const CURRENT_TIMESTAMP = "2025-01-26 00:35:37";
const CURRENT_USER = "AmrendraTheCoder";

// Smart Contract Configuration
const CONTRACT_ADDRESS = "0xa396430cf2f0b78107ed786c8156c6de492eec3c";
const CONTRACT_ABI = [
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
];

interface DocumentEvent {
  uploader: string;
  ipfsUrl: string;
  timestamp: bigint;
}

export default function ConnectPage() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const setupContractListeners = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // Remove any existing listeners first
        if (contract) {
          contract.removeAllListeners();
        }

        // Listen for DocumentUpdated events
        contractInstance.on(
          "DocumentUpdated",
          (uploader: string, ipfsUrl: string, timestamp: bigint) => {
            const event: DocumentEvent = {
              uploader,
              ipfsUrl,
              timestamp,
            };
            console.log("Document Updated Event:", {
              ...event,
              formattedTimestamp: new Date(
                Number(timestamp) * 1000
              ).toISOString(),
              currentTime: CURRENT_TIMESTAMP,
            });
          }
        );

        setContract(contractInstance);
      } catch (error) {
        console.log("Error setting up contract listeners:", error);
      }
    };

    setupContractListeners();

    // Cleanup function
    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [walletAddress, contract]);

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.chainId.toString());

      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);
      setConnected(true);

      // Initialize contract after connecting
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to wallet. Please try again.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed.");
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size exceeds 10MB limit.");
        setSelectedFile(null);
        return;
      }

      setUploadError(null);
      setSelectedFile(file);
    }
  };

  const uploadToIPFSAndBlockchain = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file.");
      return;
    }

    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!PINATA_JWT) {
      setUploadError("Pinata JWT is not configured.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Prepare metadata
      const metadata = {
        name: `${walletAddress}_${selectedFile.name}`,
        keyvalues: {
          walletAddress: walletAddress,
          uploadDate: CURRENT_TIMESTAMP,
          uploaderName: CURRENT_USER,
        },
      };

      formData.append("pinataMetadata", JSON.stringify(metadata));
      formData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 1,
        })
      );

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      // Prepare metadata for blockchain
      const blockchainMetadata = JSON.stringify({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadDate: CURRENT_TIMESTAMP,
        uploaderName: CURRENT_USER,
      });

      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const tx = await contract.updateDocument(ipfsUrl, blockchainMetadata);
      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);

      console.log("Upload successful:", {
        ipfsHash,
        transactionHash: receipt.hash,
        walletAddress,
      });

      alert(
        `Document uploaded successfully!\n\nIPFS Hash: ${ipfsHash}\nTransaction Hash: ${receipt.hash}`
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.error || error.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b shadow-md">
        <div className="container mx-auto flex items-center justify-between p-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          {!connected ? (
            <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Connect Your Wallet
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect your digital wallet to upload and verify documents on
                  the blockchain.
                </p>
                <Button
                  onClick={handleConnect}
                  size="lg"
                  className="w-full group"
                >
                  <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                    Connected Wallet
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Wallet Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                        {walletAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                    Upload Document
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                        Document Upload
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="application/pdf"
                        className="hidden"
                      />
                      <div
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                        onClick={triggerFileInput}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                          {selectedFile ? (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedFile.name}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Drag and drop or click to upload
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                PDF files only (max 10MB)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="mt-4 text-red-500 text-sm text-center">
                        {uploadError}
                      </div>
                    )}

                    <Button
                      onClick={uploadToIPFSAndBlockchain}
                      disabled={!selectedFile || uploading}
                      className="w-full mt-4 group"
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4 group-disabled:animate-pulse" />
                          Upload Document
                        </>
                      )}
                    </Button>

                    {transactionHash && (
                      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Transaction Hash:
                        </p>
                        <a
                          href={`https://etherscan.io/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                        >
                          {transactionHash}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Your document has been successfully uploaded to IPFS
                          and verified on the blockchain.
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                      You will need to approve the transaction in MetaMask to
                      complete the upload.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Document Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
