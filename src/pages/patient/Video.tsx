import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Phone,
  MessageSquare,
  Settings,
  Users,
  Share,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';

const VideoPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'Dr. Wilson', content: 'Hello! How are you feeling today?' },
    { sender: 'You', content: 'Hi Dr. Wilson, Im doing better than yesterday.' }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, { sender: 'You', content: message }]);
    setMessage('');

    // Simulate doctor's response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'Dr. Wilson',
        content: 'Thank you for the update. Let me know if you have any concerns.'
      }]);
    }, 1000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fade-in p-4 max-w-6xl mx-auto">
      <Card className="bg-white">
        <div className="flex h-[calc(100vh-8rem)]">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 bg-gray-900">
              {/* Doctor's Video (Mock) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 rounded-full bg-green-600 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">DW</span>
                  </div>
                  <p className="font-medium">Dr. Sarah Wilson</p>
                  <p className="text-sm text-gray-300">General Physician</p>
                </div>
              </div>

              {/* Patient's Video (Small) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-lg">You</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className={`rounded-full p-3 ${isMuted ? 'bg-red-50 text-red-600' : ''}`}
                  onClick={() => {
                    setIsMuted(!isMuted);
                    toast.success(`Microphone ${isMuted ? 'unmuted' : 'muted'}`);
                  }}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-full p-3 ${!isVideoOn ? 'bg-red-50 text-red-600' : ''}`}
                  onClick={() => {
                    setIsVideoOn(!isVideoOn);
                    toast.success(`Camera ${isVideoOn ? 'turned off' : 'turned on'}`);
                  }}
                >
                  {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  className="rounded-full p-3 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => toast.error('Call ended')}
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => toast.success('Settings opened')}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => toast.success('Participants list opened')}
                >
                  <Users className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => toast.success('Share screen started')}
                >
                  <Share className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 border-l flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender === 'You' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{msg.sender}</p>
                    <div
                      className={`rounded-lg p-2 max-w-[80%] ${
                        msg.sender === 'You'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md"
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
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoPage; 