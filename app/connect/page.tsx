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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface OpenCampusProfile {
  username: string;
  openCampusId: string;
  isVerified: boolean;
}

// Smart Contract Configuration
const CONTRACT_ADDRESS = "0xa396430cf2f0b78107ed786c8156c6de492eec3c";
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
  {
    inputs: [{ internalType: "string", name: "eduId", type: "string" }],
    name: "getDocument",
    outputs: [
      { internalType: "string", name: "ipfsUrl", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "verified", type: "bool" },
      { internalType: "string", name: "institution", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default function ConnectPage() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [eduId, setEduId] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [openCampusProfile, setOpenCampusProfile] = useState<OpenCampusProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Updated timestamp and user
  const currentTimestamp = "2025-01-25 21:34:15";
  const currentUser = "AmrendraTheCoder";

  useEffect(() => {
    if (walletAddress) {
      fetchOpenCampusProfile();
    }
  }, [walletAddress]);

  const fetchOpenCampusProfile = async () => {
    try {
      setLoadingProfile(true);
      // Using mock profile data instead of API call
      const mockProfile = {
        username: currentUser,
        openCampusId: `EDU${walletAddress.substring(2, 8).toUpperCase()}`,
        isVerified: true
      };
      setOpenCampusProfile(mockProfile);
      setEduId(mockProfile.openCampusId);
    } catch (error) {
      console.error("Failed to fetch OpenCampus profile:", error);
      setUploadError("Failed to fetch OpenCampus profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
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

    if (!userName.trim()) {
      setUploadError("Please enter your name.");
      return;
    }

    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!PINATA_JWT) {
      setUploadError("Pinata JWT is not configured. Please check your environment variables.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Create form data for Pinata
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);

      // Prepare metadata
      const metadata = {
        name: `${eduId}_${selectedFile.name}`,
        keyvalues: {
          uploadedBy: walletAddress,
          uploadDate: currentTimestamp,
          userName: userName,
          openCampusUsername: openCampusProfile?.username || "",
          eduId: eduId,
          isVerified: openCampusProfile?.isVerified ? "true" : "false",
        },
      };

      formData.append("pinataMetadata", JSON.stringify(metadata));
      formData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 1,
        })
      );

      // Validate the JWT token before upload
      try {
        const authResponse = await axios.get(
          "https://api.pinata.cloud/data/testAuthentication",
          {
            headers: {
              Authorization: `Bearer ${PINATA_JWT}`,
            },
          }
        );
        console.log("Auth Test Response:", authResponse.data);
      } catch (authError) {
        console.error("Authentication Error:", authError);
        throw new Error("Invalid Pinata JWT token");
      }

      // Upload to Pinata with updated headers
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

      console.log("Pinata Response:", response.data);

      if (!response.data.IpfsHash) {
        throw new Error('Failed to get IPFS hash from Pinata');
      }

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      // Connect to smart contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Update document in blockchain
      const tx = await contract.updateDocument(eduId, ipfsUrl, "OpenCampus");
      const receipt = await tx.wait();
      
      setTransactionHash(receipt.hash);
      setUploading(false);
      alert(`Document successfully uploaded! Transaction Hash: ${receipt.hash}`);

    } catch (error: any) {
      console.error("Error during upload:", error);

      let errorMessage = "Upload failed";
      if (error.response) {
        console.log("Error Response:", error.response);
        if (error.response.data && error.response.data.error) {
          errorMessage = `Pinata Error: ${error.response.data.error}`;
        } else {
          errorMessage = `Upload Error: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        errorMessage = "Transaction was rejected in MetaMask. Please approve the transaction to continue.";
      } else if (error.message?.includes("invalid address")) {
        errorMessage = "Invalid contract address. Please check the contract deployment.";
      } else {
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
                  Connect your digital wallet to manage and verify your educational
                  credentials on the blockchain.
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
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Your Name
                      </label>
                      <Input
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Wallet Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {walletAddress}
                      </p>
                    </div>
                    {loadingProfile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading OpenCampus Profile...</span>
                      </div>
                    ) : openCampusProfile ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          OpenCampus Profile
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {openCampusProfile.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {openCampusProfile.openCampusId}
                        </p>
                        {openCampusProfile.isVerified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                    ) : null}
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
                        disabled={!!openCampusProfile}
                      />
                      {openCampusProfile && (
                        <p className="text-sm text-gray-500 mt-1">
                          Using OpenCampus ID
                        </p>
                      )}
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
                        Your document has been successfully uploaded to IPFS and verified on the blockchain.
                      </p>
                    </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                      You will need to approve the transaction in MetaMask to complete the upload.
                    </p>
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