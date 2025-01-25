"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eduChainService } from "@/lib/blockchain";

export default function SearchPage() {
  const [eduId, setEduId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async () => {
    try {
      const result = await eduChainService.getDocument(eduId);
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching eduID:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Search by eduID
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter an eduID to find associated documents and information
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Enter eduID..."
            value={eduId}
            onChange={(e) => setEduId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {searchResult && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Institution</label>
                  <p className="text-lg">{searchResult.institution}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Date</label>
                  <p className="text-lg">
                    {searchResult.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Verification Status</label>
                  <p className="text-lg">
                    {searchResult.verified ? "Verified" : "Pending Verification"}
                  </p>
                </div>
                <div>
                  <Button
                    onClick={() => window.open(`https://ipfs.io/ipfs/${searchResult.ipfsUrl}`)}
                    className="w-full"
                  >
                    View Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}