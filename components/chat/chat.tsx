'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { subscribeToChannel, getUserCount } from '@/services/pusher-service'
import { User } from 'lucide-react'

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      const userCount = getUserCount();
      const newUsername = `코린몬 ${userCount + 1}`;
      setUsername(newUsername);
      localStorage.setItem('chatUsername', newUsername);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializePusher = async () => {
      try {
        unsubscribe = subscribeToChannel('chat-channel', 'new-message', (data: Message) => {
          setMessages(prev => [...prev, data]);
        });
      } catch (error) {
        console.error('Failed to initialize Pusher:', error);
      }
    };

    initializePusher();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      let currentUsername = username.trim();
      if (!currentUsername) {
        const userCount = getUserCount();
        currentUsername = `코린몬 ${userCount + 1}`;
        setUsername(currentUsername);
        localStorage.setItem('chatUsername', currentUsername);
      }
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        sender: currentUsername,
        timestamp: Date.now(),
      };

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessage),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <Card className="h-[400px] flex flex-col relative">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center space-x-4">
          <CardTitle className="text-left whitespace-nowrap text-sm">실시간 채팅</CardTitle>
          <div className="relative flex-grow">
            <Input
              className="pl-6 pr-2 py-0.5 text-xs"
              placeholder="닉네임 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => {
                const newUsername = e.target.value.trim() || `코린몬 ${getUserCount() + 1}`;
                setUsername(newUsername);
                localStorage.setItem('chatUsername', newUsername);
              }}
            />
            <span className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <User className="h-3 w-3" />
            </span>
          </div>
          <Button variant="outline" size="xs" onClick={handleResetChat} className="whitespace-nowrap text-xs px-2 py-1">
            채팅 초기화
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0" ref={scrollAreaRef}>
        <ScrollArea className="h-full p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.sender === username ? 'order-2' : 'order-1'}`}>
                <div className={`p-2 rounded-lg text-xs ${message.sender === username ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  {message.sender !== username && (
                    <div className="font-bold text-sm mb-1">{message.sender}</div>
                  )}
                  <div>{message.text}</div>
                </div>
                <div className={`text-[10px] text-gray-500 mt-1 ${message.sender === username ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>전송</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

