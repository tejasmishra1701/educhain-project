"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LandingSections from "@/components/ui/LandingSection";
import { Search, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <LandingSections />
    // <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    //   <div className="max-w-6xl mx-auto px-4 py-16">
    //     <div className="text-center mb-12">
    //       <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
    //         eduChain Document Verification
    //       </h1>
    //       <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
    //         Securely store and verify educational documents using blockchain technology and IPFS
    //       </p>
    //     </div>

        // <div className="grid md:grid-cols-2 gap-8 mt-12">
        //   <Card className="hover:shadow-lg transition-shadow">
        //     <CardContent className="p-6">
        //       <div className="text-center space-y-4">
        //         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        //           <Search className="w-8 h-8 text-primary" />
        //         </div>
        //         <h2 className="text-2xl font-semibold">Search Documents</h2>
        //         <p className="text-gray-600 dark:text-gray-300">
        //           Verify and view educational documents using eduID
        //         </p>
        //         <Link href="/search">
        //           <Button className="w-full">
        //             Search Documents
        //           </Button>
        //         </Link>
        //       </div>
        //     </CardContent>
        //   </Card>

        //   <Card className="hover:shadow-lg transition-shadow">
        //     <CardContent className="p-6">
        //       <div className="text-center space-y-4">
        //         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        //           <Upload className="w-8 h-8 text-primary" />
        //         </div>
        //         <h2 className="text-2xl font-semibold">Upload Documents</h2>
        //         <p className="text-gray-600 dark:text-gray-300">
        //           Connect your eduChain wallet and upload new documents
        //         </p>
        //         <Link href="/connect">
        //           <Button className="w-full">
        //             Connect & Upload
        //           </Button>
        //         </Link>
        //       </div>
        //     </CardContent>
        //   </Card>
        // </div>
    //   </div>
    // </div>
  );
}