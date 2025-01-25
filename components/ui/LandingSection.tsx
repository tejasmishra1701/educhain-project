import React from "react";
import Link from "next/link";
import { Search, Upload, ShieldCheck, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingSections = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6 justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl text-gray-900 dark:text-white"
          >
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            ResumeOnRails
          </Link>
          <nav className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="#features">Features</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Connect</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Secure Your Educational Journey with{" "}
              <span className="text-blue-600">ResumeOnRails</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Revolutionize your credential management with blockchain-powered
              document verification, ensuring your academic achievements are
              always accessible, verifiable, and secure.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="group">
              <Link href="/connect">
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Get Started
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mt-16 w-full max-w-4xl">
          <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Search Documents
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Instantly verify and access your educational documents using
                    your unique eduID with just a few clicks.
                  </p>
                </div>
                <Link href="/search">
                  <Button className="w-full">Search Documents</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Upload Documents
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Securely store and manage your educational credentials on
                    the blockchain with easy wallet connection.
                  </p>
                </div>
                <Link href="/connect">
                  <Button className="w-full">Upload Documents</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © 2025 ResumeOnRails. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingSections;
