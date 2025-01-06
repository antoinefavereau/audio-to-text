"use client";

import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="absolute start-0 end-0 top-0 flex justify-between items-center px-8 md:px-16 py-4">
      <Link href="/">
        <Image
          className="w-14 h-auto"
          src="/logo.svg"
          alt="Logo"
          width={56}
          height={56}
        />
      </Link>
      <nav className="flex gap-8 bg-transparent px-12 rounded-full text-lg">
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
