"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically load ChatWidget with client-side only rendering
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidgetLoader() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ChatWidget />;
} 