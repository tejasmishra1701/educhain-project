"use client";

import { useState, useRef } from "react";
import { ethers } from "ethers";
import { PinataSDK } from "pinata-web3";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  UserCircle,
  FileText,
  Shield,
  Rocket,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// Smart Contract Configuration
const CONTRACT_ADDRESS = "0xa396430cf2f0b78107ed786c8156c6de492eec3c"; // Replace with actual contract address
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "eduId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsUrl",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "institution",
        type: "string",
      },
    ],
    name: "DocumentUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "eduId",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsUrl",
        type: "string",
      },
      {
        internalType: "string",
        name: "institution",
        type: "string",
      },
    ],
    name: "updateDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function ConnectPage() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [eduId, setEduId] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Current UTC timestamp and user information
  const currentTimestamp = "2025-01-25 19:34:48";
  const currentUser = "AmrendraTheCoder";

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);
      setConnected(true);
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
    if (!selectedFile || !eduId) {
      setUploadError("Please select a file and enter your Education ID.");
      return;
    }

    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
      setUploadError(
        "Invalid contract address configuration. Please contact support."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Initialize PinataSDK
      const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
        pinataGateway: "gateway.pinata.cloud",
      });

      // Create metadata
      const metadata = {
        name: selectedFile.name,
        keyvalues: {
          uploadedBy: walletAddress,
          uploadDate: currentTimestamp,
          userName: currentUser,
          eduId: eduId,
        },
      };

      // Upload file to IPFS
      const result = await pinata.upload.file(selectedFile, { metadata });
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      // Connect to smart contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      console.log("Contract Address:", CONTRACT_ADDRESS);
      console.log("Wallet Address:", walletAddress);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Update document in blockchain
      const tx = await contract.updateDocument(
        eduId,
        ipfsUrl,
        currentUser // Using currentUser as institution
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);

      // Reset upload state
      setUploading(false);
      alert(
        `Document successfully uploaded! Transaction Hash: ${receipt.hash}`
      );
    } catch (error: any) {
      console.error("Error during upload:", error);

      let errorMessage = "Upload failed";
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        errorMessage =
          "Transaction was rejected in MetaMask. Please approve the transaction to continue.";
      } else if (error.message?.includes("invalid address")) {
        errorMessage =
          "Invalid contract address. Please check the contract deployment.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setUploadError(errorMessage);
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b shadow-md">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentUser} • {currentTimestamp} UTC
          </div>
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
                  Connect your digital wallet to manage and verify your
                  educational credentials on the blockchain.
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
                    Wallet Information
                  </h2>
                  <div className="space-y-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Wallet Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                        Education ID
                      </label>
                      <Input
                        placeholder="Enter your Education ID"
                        value={eduId}
                        onChange={(e) => setEduId(e.target.value)}
                        className="w-full mb-4"
                      />
                    </div>
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
                      disabled={!selectedFile || !eduId || uploading}
                      className="w-full mt-4 group"
                    >
                      <Upload className="mr-2 h-4 w-4 group-disabled:animate-pulse" />
                      {uploading ? "Uploading..." : "Upload Document"}
                    </Button>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      You will need to approve the transaction in MetaMask to
                      complete the upload.
                    </p>

                    {transactionHash && (
                      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">
                          Transaction Hash:
                        </p>
                        <a
                          href={`https://etherscan.io/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline break-all"
                        >
                          {transactionHash}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © 2025 ResumeOnRails. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
