import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  content: string;
  timestamp: string;
  doctorName?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'doctor',
    content: 'Hello! How can I help you today?',
    timestamp: '10:00 AM',
    doctorName: 'Dr. Sarah Wilson'
  },
  {
    id: '2',
    sender: 'user',
    content: 'Hi Dr. Wilson, I have been experiencing headaches for the past few days.',
    timestamp: '10:02 AM'
  },
  {
    id: '3',
    sender: 'doctor',
    content: 'I understand. Can you describe the nature of your headaches? Are they constant or intermittent?',
    timestamp: '10:05 AM',
    doctorName: 'Dr. Sarah Wilson'
  }
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate doctor's response after 1 second
    setTimeout(() => {
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        content: 'Thank you for sharing that information. Let me review it and get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctorName: 'Dr. Sarah Wilson'
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 1000);
  };

  return (
    <div className="fade-in p-4 max-w-4xl mx-auto">
      <Card className="bg-white h-[calc(100vh-8rem)]">
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Dr. Sarah Wilson</h2>
                <p className="text-sm text-gray-500">General Physician</p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
                <Clock className="w-4 h-4" />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.doctorName && (
                    <p className="text-xs font-medium mb-1">
                      {message.doctorName}
                    </p>
                  )}
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;