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

// Contract and Chain Configuration
const CONTRACT_ADDRESS = "0xC277D4e853968170CA36b49C2d20F9d00b538229";
const OPENCAMPUS_RPC_URL = "https://open-campus-codex-sepolia.drpc.org";
const CHAIN_ID = 656476;
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
  const [networkError, setNetworkError] = useState<boolean>(false);

  const initializeProvider = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        (window as WindowWithEthereum).ethereum
      ) {
        await (window as WindowWithEthereum).ethereum.request({
          method: "eth_requestAccounts",
        });

        // Check and switch network if needed
        const chainId = await (window as WindowWithEthereum).ethereum.request({
          method: "eth_chainId",
        });

        if (parseInt(chainId, 16) !== CHAIN_ID) {
          try {
            await (window as WindowWithEthereum).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await (window as WindowWithEthereum).ethereum.request({
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
                    blockExplorerUrls: [
                      "https://opencampus-codex.blockscout.com/",
                    ],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        const web3Provider = new BrowserProvider(
          (window as WindowWithEthereum).ethereum
        );
        const signer = await web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(signer);
        setConnected(true);
        setNetworkError(false);
        return { provider: web3Provider, signer };
      } else {
        throw new Error("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.error("Error initializing provider:", error);
      setConnected(false);
      setNetworkError(true);
      throw error;
    }
  };

  useEffect(() => {
    initializeProvider().catch((error) => {
      console.error("Failed to initialize provider:", error);
      setError(
        "Failed to connect to wallet. Please make sure MetaMask is installed and connected to Open Campus Codex network."
      );
    });
  }, []);

  const formatMetadata = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return metadata;
    }
  };

  const handleSearch = async () => {
    if (!searchAddress || !isAddress(searchAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    setError("");
    setSearchResult(null);

    if (!provider) {
      await initializeProvider();
    }

    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log(contract);
    const res = await contract.getDocument(searchAddress);
    console.log("3", res);
    const [ipfsUrl, timestamp, metadata] = res;

    if (!ipfsUrl) {
      setError("No document found for this address");
      return;
    }

    const documentUrl = `https://ipfs.io/ipfs/${ipfsUrl.replace(
      "ipfs://",
      ""
    )}`;

    setSearchResult({
      ipfsUrl,
      timestamp: new Date(Number(timestamp) * 1000),
      metadata,
      documentUrl,
    });

    setLoading(false);
  };

  const isContractRevertError = (error: any): boolean => {
    return (
      error.code === "CALL_EXCEPTION" ||
      error.code === "BAD_DATA" ||
      (error.data && error.data.startsWith("0x"))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6 justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl text-gray-900 dark:text-white">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            EduVault
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Document Search Portal
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Search for documents by entering an EDU Chain wallet address
            </p>

            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter EDU-Chain Wallet Address (0x...)"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
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
                disabled={loading || !searchAddress}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <Search className="w-4 h-4" />
                    <span>Search Document</span>
                  </div>
                )}
              </Button>
            </div>

            {searchResult && (
              <div className="mt-8 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="space-y-6">
                    {/* Upload Time */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Upload Time
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {searchResult.timestamp.toLocaleString()} UTC
                        </p>
                      </div>
                    </div>

                    {/* IPFS URL */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        IPFS URL
                      </label>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded break-all flex-1">
                            {`https://ipfs.io/ipfs/${searchResult.ipfsUrl}`}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://ipfs.io/ipfs/${searchResult.ipfsUrl}`
                              );
                            }}
                            className="shrink-0"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    {searchResult.metadata && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Document Metadata
                        </label>
                        <div className="mt-1">
                          <pre className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto whitespace-pre-wrap">
                            {formatMetadata(searchResult.metadata)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Document Preview */}
                    {searchResult.documentUrl && (
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Document Preview
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-[40rem]">
                          <div className="w-full h-full mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <embed
                              src={`https://drive.google.com/viewerng/
viewer?embedded=true&url=${searchResult.documentUrl}`}
                              // src={searchResult.documentUrl}
                              className="w-full h-full"
                              title="Document Preview"
                              sandbox="allow-cross-origin allow-scripts"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center gap-4">
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
                    )}
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
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-gray-500">
              © 2025 EduVault.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
