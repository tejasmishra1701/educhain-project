"use client";

import React, { useState } from "react";
import {
  Search,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Rocket,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eduChainService } from "@/lib/blockchain";

export default function SearchPage() {
  const [eduId, setEduId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await eduChainService.getDocument(eduId);
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching eduID:", error);
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
            ResumeOnRails
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost">Features</Button>
            <Button>Search</Button>
          </nav>
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
                Document Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Securely search and verify educational documents using eduID
              </p>

              <div className="space-y-4">
                <Input
                  placeholder="Enter eduID..."
                  value={eduId}
                  onChange={(e) => setEduId(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="w-full group"
                >
                  <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  {loading ? "Searching..." : "Search Document"}
                </Button>
              </div>

              {searchResult && (
                <Card className="mt-8 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                      Document Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Institution
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {searchResult.institution}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Upload Date
                          </p>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {searchResult.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Verification Status
                          </p>
                          <Badge
                            variant={
                              searchResult.verified ? "success" : "warning"
                            }
                            className="mt-2"
                          >
                            {searchResult.verified
                              ? "Verified"
                              : "Pending Verification"}
                          </Badge>
                        </div>
                        <Button
                          onClick={() =>
                            window.open(
                              `https://ipfs.io/ipfs/${searchResult.ipfsUrl}`
                            )
                          }
                          className="w-full mt-4"
                        >
                          View Document
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            ©️ 2025 ResumeOnRails. All rights reserved.
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
