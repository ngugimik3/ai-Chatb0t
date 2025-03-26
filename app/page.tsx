"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "react-gfm";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  X,
  MessageCircle,
  Send,
  Loader2,
  ArrowDownCircleIcon,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

import LandingSections from "@/components/LandingSections";

export default function Chat() {
  const [isChatOpen, setChatOpen] = useState(false);
  const [showChatIcon, setShowIcon] = useState(false);
  const chatIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowIcon(true);
      } else {
        setShowIcon(false);
        setChatOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 p-2 shadow-lg shadow-black/5 md:h-14 md:w-14"
          >
            <Button onClick={toggleChat} className="flex items-center justify-center">
              {!isChatOpen ? <MessageCircle className="size-12" /> : <ArrowDownCircleIcon />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
