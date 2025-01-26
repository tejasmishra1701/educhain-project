"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Rocket,
  Download,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Contract, BrowserProvider, isAddress } from "ethers";

// Contract Configuration
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

interface DocumentResult {
  ipfsUrl: string;
  timestamp: Date;
  metadata: string;
  documentUrl?: string;
}

interface WindowWithEthereum extends Window {
  ethereum?: any;
}

export default function SearchPage() {
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [searchResult, setSearchResult] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // Current timestamp and user
  const currentTimestamp = "2025-01-26 00:00:33";
  const currentUser = "AmrendraTheCoder";

  const initializeProvider = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        (window as WindowWithEthereum).ethereum
      ) {
        const web3Provider = new BrowserProvider(
          (window as WindowWithEthereum).ethereum
        );
        await (window as WindowWithEthereum).ethereum.request({
          method: "eth_requestAccounts",
        });
        const signer = await web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(signer);
        setConnected(true);
        return { provider: web3Provider, signer };
      } else {
        throw new Error("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.error("Error initializing provider:", error);
      setConnected(false);
      throw error;
    }
  };

  useEffect(() => {
    initializeProvider().catch((error) => {
      console.error("Failed to initialize provider:", error);
      setError(
        "Failed to connect to wallet. Please make sure MetaMask is installed and connected."
      );
    });
  }, []);

  const handleSearch = async () => {
    if (!searchAddress || !isAddress(searchAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    if (!connected) {
      try {
        await initializeProvider();
      } catch (error) {
        setError("Please connect your wallet to continue");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSearchResult(null);

    try {
      let currentSigner = signer;
      if (!currentSigner) {
        const { signer: newSigner } = await initializeProvider();
        currentSigner = newSigner;
      }

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentSigner
      );

      try {
        const result = await contract.getDocument(searchAddress);

        if (!result || !result[0]) {
          throw new Error("No document found for this address");
        }

        const formattedResult: DocumentResult = {
          ipfsUrl: result[0],
          timestamp: new Date(Number(result[1]) * 1000),
          metadata: result[2],
          documentUrl: result[0]
            ? `https://gateway.pinata.cloud/ipfs/${result[0].replace(
                "https://gateway.pinata.cloud/ipfs/",
                ""
              )}`
            : undefined,
        };

        setSearchResult(formattedResult);
      } catch (contractError: any) {
        console.error("Contract call error:", contractError);
        setError(contractError.message || "Failed to fetch document data");
      }
    } catch (error: any) {
      console.error("Error searching document:", error);
      setError(error.message || "An error occurred while searching");
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
            Document Verification
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentUser} • {currentTimestamp} UTC
            </div>
            {!connected && (
              <Button
                onClick={() => initializeProvider()}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-6">
              Search Documents
            </h1>

            <div className="space-y-4">
              <Input
                placeholder="Enter Ethereum Address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full"
              />

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={loading || !searchAddress}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Searching...
                  </div>
                ) : (
                  "Search Document"
                )}
              </Button>
            </div>

            {searchResult && (
              <div className="mt-8 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Upload Time
                        </label>
                        <p className="mt-1 font-semibold">
                          {searchResult.timestamp.toLocaleString()} UTC
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          IPFS URL
                        </label>
                        <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded break-all">
                          {searchResult.ipfsUrl}
                        </p>
                      </div>

                      {searchResult.metadata && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Document Metadata
                          </label>
                          <pre className="mt-1 bg-gray-100 p-3 rounded text-sm overflow-auto">
                            {searchResult.metadata}
                          </pre>
                        </div>
                      )}

                      {searchResult.documentUrl && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">Document Preview</h3>
                          <div className="aspect-[3/4] w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                            <iframe
                              src={searchResult.documentUrl}
                              className="w-full h-full"
                              title="Document Preview"
                            />
                          </div>
                          <div className="flex justify-center gap-4">
                            <Button
                              onClick={() =>
                                window.open(searchResult.documentUrl)
                              }
                              className="flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              View Document
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Document Verification Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
