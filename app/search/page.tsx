"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Rocket,
  Upload,
  FileIcon,
  Download,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ethers, Contract, BrowserProvider } from "ethers";

// OpenCampus Contract Configuration
const CONTRACT_ADDRESS = "0xa396430cf2f0b78107ed786c8156c6de492eec3c";
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "string", name: "eid", type: "string" }],
    name: "getProfile",
    outputs: [
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "verified", type: "bool" },
      { internalType: "string", name: "transactionHash", type: "string" }
    ],
    stateMutability: "view",
    type: "function",
  }
];

interface ProfileResult {
  ipfsHash: string;
  timestamp: Date;
  verified: boolean;
  transactionHash: string;
  documentUrl?: string;
}

export default function SearchPage() {
  const [eid, setEid] = useState<string>("");
  const [searchResult, setSearchResult] = useState<ProfileResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);

  // Updated timestamp and user
  const currentTimestamp = "2025-01-25 22:02:46";
  const currentUser = "AmrendraTheCoder";

  const initializeProvider = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setProvider(provider);
        setSigner(signer);
      }
    } catch (error) {
      console.error("Error initializing provider:", error);
      setError(
        "Failed to connect to wallet. Please make sure MetaMask is installed and connected."
      );
    }
  };

  useEffect(() => {
    initializeProvider();
  }, []);

  const handleSearch = async () => {
    if (!eid) {
      setError("Please enter an OpenCampus Profile ID");
      return;
    }

    setLoading(true);
    setError("");
    setSearchResult(null);

    try {
      if (!signer) {
        await initializeProvider();
        if (!signer) {
          throw new Error("Please connect your wallet to continue");
        }
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      console.log("Searching for Profile ID:", eid);

      const result = await contract.getProfile(eid);
      console.log("Raw contract result:", result);

      if (!result || !result[0]) {
        throw new Error("No profile found for this ID");
      }

      // Format the result
      const formattedResult: ProfileResult = {
        ipfsHash: result[0],
        timestamp: new Date(Number(result[1]) * 1000),
        verified: Boolean(result[2]),
        transactionHash: result[3],
        documentUrl: `https://gateway.pinata.cloud/ipfs/${result[0]}`,
      };

      console.log("Formatted result:", formattedResult);
      setSearchResult(formattedResult);
    } catch (error: any) {
      console.error("Error searching profile:", error);
      if (error.message.includes("BAD_DATA")) {
        setError("Invalid Profile ID or profile not found");
      } else if (error.message.includes("user rejected")) {
        setError("Transaction rejected. Please try again.");
      } else {
        setError(error.message || "An error occurred while searching");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6 justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl text-gray-900 dark:text-white">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            OpenCampus Profile Verification
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentUser} • {currentTimestamp} UTC
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <section className="w-full max-w-4xl space-y-6">
          <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                Profile Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Enter your OpenCampus Profile ID to verify your credentials
              </p>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter Profile ID..."
                    value={eid}
                    onChange={(e) => setEid(e.target.value)}
                    className="w-full"
                  />
                  {error && (
                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading || !eid}
                  size="lg"
                  className="w-full group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Verify Profile
                    </>
                  )}
                </Button>
              </div>

              {searchResult && (
                <div className="mt-8 space-y-6">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="space-y-6">
                      {/* Verification Status */}
                      <div className="flex items-center justify-center">
                        <Badge
                          variant={
                            searchResult.verified ? "default" : "destructive"
                          }
                          className="text-lg px-4 py-2"
                        >
                          {searchResult.verified ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" />
                              Verified Profile
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5" />
                              Pending Verification
                            </div>
                          )}
                        </Badge>
                      </div>

                      {/* Profile Details */}
                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Profile ID
                          </label>
                          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {eid}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Verification Time
                          </label>
                          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {searchResult.timestamp.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            IPFS Hash
                          </label>
                          <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                            {searchResult.ipfsHash}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Transaction Hash
                          </label>
                          <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                            {searchResult.transactionHash}
                          </p>
                        </div>
                      </div>

                      {/* Document Preview */}
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Document Preview
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                          <div className="aspect-[3/4] w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {searchResult.documentUrl && (
                              <iframe
                                src={searchResult.documentUrl}
                                className="w-full h-full"
                                title="Document Preview"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={() =>
                              window.open(searchResult.documentUrl)
                            }
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Full Document
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `${searchResult.documentUrl}?download=true`
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 OpenCampus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}