"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eduChainService } from "@/lib/blockchain";
import Header from "@/components/ui/Header";
import Link from "next/link";

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
      <Header />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Search className="text-blue-600" />
                Document Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Securely search and verify educational documents using eduID
              </p>
            </div>

            <div className="p-8">
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter eduID..."
                  value={eduId}
                  onChange={(e) => setEduId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchResult && (
                <Card className="mt-8 border-blue-100 dark:border-gray-700">
                  <CardHeader className="bg-blue-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-300">
                      <FileText />
                      Document Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Institution
                        </label>
                        <p className="text-lg font-semibold">
                          {searchResult.institution}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          Upload Date
                        </label>
                        <p className="text-lg">
                          {searchResult.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Verification Status
                        </label>
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © 2025 ResumeOnRails. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm hover:underline text-gray-600 dark:text-gray-300"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm hover:underline text-gray-600 dark:text-gray-300"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
