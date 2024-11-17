"use client";

import { useRef } from "react";
import TopSection from "@/components/generate/TopSection";
import Generate from "@/components/generate/Generate";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center">
      <TopSection scrollRef={scrollRef} />
      <div className="w-[calc(100%-6rem)] h-[2px] bg-transparent"></div>
      <Generate scrollRef={scrollRef} />
    </div>
  );
}
