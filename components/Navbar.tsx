"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="absolute start-0 end-0 top-0 flex justify-between items-center px-16 py-4">
      <Link href="/">
        <Image
          className="w-12 md:w-16 h-auto"
          src="/logo.svg"
          alt="Logo"
          width={64}
          height={64}
        />
      </Link>
      <nav className="hidden md:flex gap-8 bg-transparent px-12 rounded-full text-lg">
        {/* <Link
          className={`p-4 hover:text-primary duration-100 ${
            pathname === "/" ? "underline" : ""
          }`}
          href="/"
        >
          Générer
        </Link> */}
        <Link
          className="p-4 hover:text-primary duration-100"
          href="https://buymeacoffee.com/antoinefavereau"
          target="_blank"
        >
          Nous soutenir
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
