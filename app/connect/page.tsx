"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Link as LinkIcon,
  UserCircle,
  FileText,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { eduChainService } from "@/lib/blockchain";
import { create } from "ipfs-http-client";
import { cn } from "@/lib/utils";

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
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {!connected ? (
          <Card className="shadow-2xl">
            <CardHeader className="text-center pb-4 border-b dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <Shield className="w-16 h-16 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Connect with eduChain
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-center">
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Securely connect your wallet to manage your educational
                documents
              </p>
              <Button
                onClick={handleConnect}
                size="lg"
                className="w-full group"
              >
                <LinkIcon className="mr-2 h-5 w-5 group-hover:rotate-45 transition-transform" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center space-x-4 border-b dark:border-gray-700 pb-4">
                <UserCircle className="w-12 h-12 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your verified educational identity
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      eduID
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center space-x-4 border-b dark:border-gray-700 pb-4">
                <FileText className="w-12 h-12 text-green-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upload Document
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add your educational certificates
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                      Institution Name
                    </label>
                    <Input
                      placeholder="Enter institution name"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                      Document Upload
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="w-full file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-blue-100"
                    />
                  </div>
                  <Button
                    onClick={uploadToIPFS}
                    disabled={!selectedFile || !institution || uploading}
                    className={cn(
                      "w-full mt-4",
                      uploading && "opacity-50 cursor-not-allowed"
                    )}
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
