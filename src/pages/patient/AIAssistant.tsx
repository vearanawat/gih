import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { generateAIResponse } from '@/utils/ai';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI health assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    try {
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: input,
      };

      if (selectedImage) {
        userMessage.image = URL.createObjectURL(selectedImage);
      }

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      clearImage();

      // Get AI response
      const response = await generateAIResponse(input, selectedImage);

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response from AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fade-in space-y-4 p-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
        <p className="text-gray-500 mt-1">Get instant answers to your health questions</p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-green-600" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.role === 'assistant' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded content"
                      className="max-w-sm rounded-lg mb-2"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          {selectedImage && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>{selectedImage.name}</span>
              <button
                onClick={clearImage}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant; 