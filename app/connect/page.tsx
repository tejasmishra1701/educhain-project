"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { eduChainService } from "@/lib/blockchain";
import { create } from 'ipfs-http-client';

export default function ConnectPage() {
  const [connected, setConnected] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [institution, setInstitution] = useState("");

  const handleConnect = async () => {
    try {
      await eduChainService.connectWallet();
      // Mock eduID data for demonstration
      setUserData({
        name: "John Doe",
        id: "edu-123456789",
      });
      setConnected(true);
    } catch (error) {
      console.error("Error connecting to eduChain:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadToIPFS = async () => {
    if (!selectedFile || !institution) return;

    try {
      setUploading(true);
      
      // Connect to IPFS
      const ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https'
      });

      // Upload file to IPFS
      const file = await selectedFile.arrayBuffer();
      const result = await ipfs.add(file);
      
      // Update document on eduChain
      await eduChainService.updateDocument(
        userData.id,  
        result.path,
        institution
      );
      
      setUploading(false);
      // Show success message
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        {!connected ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl">Connect with eduChain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Connect your wallet to manage your documents securely on eduChain
              </p>
              <Button onClick={handleConnect} size="lg">
                <Link className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-lg">{userData?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">eduID</label>
                    <p className="text-lg">{userData?.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Institution Name"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                  />
                  <Button
                    onClick={uploadToIPFS}
                    disabled={!selectedFile || !institution || uploading}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload to IPFS"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}