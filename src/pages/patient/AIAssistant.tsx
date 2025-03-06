import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Image as ImageIcon, Mic, X, Globe } from "lucide-react";
import { generateAIResponse } from "@/utils/ai";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const LANGUAGES = [
  { code: "en-US", name: "English" },
  { code: "hi-IN", name: "हिन्दी (Hindi)" },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = selectedLang;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event);
        toast.error("Speech recognition failed. Please try again.");
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current = recognition;
    } else {
      toast.error("Your browser does not support speech recognition.");
    }
  }, [selectedLang]);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const speak = (text: string) => {
    if (!synth) {
      console.error("Speech synthesis not supported.");
      toast.error("Speech synthesis not supported.");
      return;
    }

    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onerror = (event) => {
      console.error("Speech Synthesis Error:", event);
      toast.error("Speech synthesis failed.");
    };

    synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    try {
      setIsLoading(true);

      const userMessage: Message = { role: "user", content: input };
      if (selectedImage) userMessage.image = URL.createObjectURL(selectedImage);
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setSelectedImage(null);

      const response = await generateAIResponse(input, selectedImage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);

      speak(response);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  return (
    <div className="fade-in space-y-4 p-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
        <p className="text-gray-500 mt-1">Get instant answers to your health questions</p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="p-4 border-b flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          <select
            className="border p-2 rounded-lg"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "assistant" ? "bg-green-100" : "bg-blue-100"}`}>
                  {message.role === "assistant" ? <Bot className="w-5 h-5 text-green-600" /> : <User className="w-5 h-5 text-blue-600" />}
                </div>
                <div className={`rounded-lg p-4 ${message.role === "assistant" ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white"}`}>
                  {message.image && <img src={message.image} alt="Uploaded content" className="max-w-sm rounded-lg mb-2" />}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" size="icon" onClick={handleVoiceInput} disabled={isLoading}>
            <Mic className={`w-5 h-5 ${isListening ? "text-red-500 animate-pulse" : ""}`} />
          </Button>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or speak your message..." disabled={isLoading} className="flex-1" />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            <ImageIcon className="w-5 h-5" />
          </Button>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
          <Button onClick={handleSend} disabled={(!input.trim() && !selectedImage) || isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
