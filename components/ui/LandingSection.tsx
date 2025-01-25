import React from "react";
import Link from "next/link";
import { Search, Upload } from "lucide-react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingSections = () => {
  return (
    <div className="flex flex-col min-h-screen">
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-6 justify-between">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">ResumeOnRails</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="#faq">FAQ</Link>
          </nav>
        </div>
        <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 px-0 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="flex items-center space-x-2">
          <nav className="flex items-center">
            <Button asChild>
              <Link href="/signup">Connect</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
      <main className="flex-1 flex-col flex items-center justify-center">
        <section className="w-full pt-6">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Unlock the Power of Your Credentials with ResumeOnRails
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Stay ahead with a system designed to keep your
                  data accessible, updatable, and always at your fingertips.
                </p>
              </div>
              <div className="space-x-4">
                {/* <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button> */}
                <form action=""></form>
              </div>
            </div>
          </div>
        </section>
        <div className="grid md:grid-cols-2 gap-8 mt-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Search Documents</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Verify and view educational documents using eduID
                </p>
                <Link href="/search">
                  <Button className="w-auto mt-3">
                    Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Upload Documents</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect your eduChain wallet and upload new documents
                </p>
                <Link href="/connect">
                  <Button className="w-auto mt-3">
                    Upload
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 ResumeOnRails. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default LandingSections;