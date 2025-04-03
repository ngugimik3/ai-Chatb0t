"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageCircle, Send, X, Edit, Check, ChevronDown, ChevronUp } from "lucide-react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import LandingSections from "@/components/LandingSections";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const [isChatOpen, setChatOpen] = useState(false);
  const [showChatIcon, setShowIcon] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, error, setMessages } = useChat({
    api: "/api/gemini",
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowIcon(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, editingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startEditing = (index: number) => {
    setEditingMessageId(index);
    setEditInput(messages[index].content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditInput("");
  };

  const saveEditedMessage = (index: number) => {
    if (editInput.trim() === "") return;
    
    const updatedMessages = [...messages];
    updatedMessages[index] = { ...updatedMessages[index], content: editInput };
    setMessages(updatedMessages);
    
    setEditingMessageId(null);
    setEditInput("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />

      <AnimatePresence>
        {showChatIcon && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setChatOpen(true)}
              className="rounded-full h-14 w-14 p-3 shadow-lg bg-gray-800 hover:bg-gray-700"
            >
              <MessageCircle className="size-10 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 z-50 w-[90%] max-w-[400px] md:max-w-[500px]"
          >
            <Card className="border bg-white shadow-xl rounded-lg">
              <CardHeader className="flex items-center justify-between p-4">
                <CardTitle className="text-lg font-bold">Chat with Not3Y</CardTitle>
                <Button
                  onClick={() => setChatOpen(false)}
                  className="rounded-full h-10 w-10 p-2 bg-gray-800 hover:bg-gray-700"
                >
                  <X className="size-6 text-white" />
                </Button>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {messages.length === 0 ? (
                    <div className="w-full mt-32 text-gray-500 flex items-center justify-center">
                      No messages yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-2">
                      {messages.map((msg, index) => (
                        <div key={index} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                          <div className={`inline-block rounded-lg p-2 ${msg.role === "user" ? "bg-gray-200" : "bg-gray-100"}`}>
                            {editingMessageId === index ? (
                              <div className="flex flex-col gap-2">
                                <Input
                                  value={editInput}
                                  onChange={(e) => setEditInput(e.target.value)}
                                  className="w-full"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => saveEditedMessage(index)}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="group relative">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({ node, inline, className, children, ...props }) {
                                      return inline ? (
                                        <code className="bg-gray-200 px-1 rounded" {...props}>
                                          {children}
                                        </code>
                                      ) : (
                                        <pre className="bg-gray-800 text-white p-2 rounded">
                                          <code {...props}>{children}</code>
                                        </pre>
                                      );
                                    },
                                    ul: ({ children }) => (
                                      <ul className="list-disc ml-4 pl-2">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal ml-4 pl-2">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="pl-4 space-y-1">{children}</li>
                                    )
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                                {msg.role === "user" && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -top-3 -left-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      <DropdownMenuItem onClick={() => startEditing(index)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                      {isLoading && (
                        <div className="w-full flex items-center justify-center gap-2 mt-2">
                          <Loader2 className="animate-spin h-5 w-5 text-primary-500" />
                          <button className="underline text-sm text-red-500" onClick={stop}>
                            Abort
                          </button>
                        </div>
                      )}
                      {error && (
                        <div className="w-full flex items-center justify-center gap-2 mt-2">
                          <div>An error occurred</div>
                          <button className="underline text-sm text-red-500" onClick={reload}>
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <CardFooter>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="flex w-full items-center space-x-2 p-4"
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1"
                    placeholder="Type your message here..."
                  />
                  <Button type="submit" className="size-10 rounded-full bg-gray-800 hover:bg-gray-700" disabled={isLoading}>
                    <Send className="size-6 text-white" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}