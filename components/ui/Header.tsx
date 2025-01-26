import Link, { default as NextLink } from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6 justify-between">
        <div className="mr-4 hidden md:flex">
          <NextLink
            className="mr-6 flex items-center space-x-2 font-bold sm:inline-block"
            href="/"
          >
            <span>EduVault</span>
          </NextLink>
          {/* <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#faq">FAQ</Link>
            </nav> */}
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
  );
};

export default Header;
