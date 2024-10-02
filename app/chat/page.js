'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const getNextQuestion = (currentQuestion, userResponse) => {
  switch (currentQuestion) {
  case null:
  return "How satisfied are you with your overall university experience?";
  case "How satisfied are you with your overall university experience?":
  if (userResponse.toLowerCase().includes("not satisfied") || userResponse.toLowerCase().includes("poor")) {
  return "I'm sorry to hear that. What specific areas do you think need improvement?";
  } else {
  return "That's great to hear! Which aspects of the university do you enjoy the most?";
  }
  case "I'm sorry to hear that. What specific areas do you think need improvement?":
  case "That's great to hear! Which aspects of the university do you enjoy the most?":
  return "Thank you for sharing. Do you have any suggestions for new programs or services?";
  default:
  return "Is there anything else you'd like to add to your feedback?";
  }
  };
export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [finalTranscription, setFinalTranscription] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [ellipsis, setEllipsis] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (currentQuestion === null) {
      handleBotMessage(getNextQuestion(null, ""));
    }
  }, [currentQuestion]);

  useEffect(() => {
    let ellipsisInterval;
    if (isRecording) {
      ellipsisInterval = setInterval(() => {
        setEllipsis(prev => prev.length < 3 ? prev + '.' : '');
      }, 500);
    }
    return () => clearInterval(ellipsisInterval);
  }, [isRecording]);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        clearTimeout(transcriptionTimeoutRef.current);
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setFinalTranscription(prev => prev + finalTranscript);
        setTranscription(interimTranscript);

        transcriptionTimeoutRef.current = setTimeout(() => {
          setTranscription('');
        }, 1000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event);
      };
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }
  }, []);

  const handleBotMessage = (message) => {
    setMessages((prev) => [...prev, { text: message, sender: 'bot' }]);
    setCurrentQuestion(message);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setFinalTranscription('');
    setIsLoading(true);

    setTimeout(() => {
      const nextQuestion = getNextQuestion(currentQuestion, input);
      handleBotMessage(nextQuestion);
      setIsLoading(false);
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInput(finalTranscription + transcription);
      setTranscription('');
      setFinalTranscription('');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscription('');
      setFinalTranscription('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50">
      <div className="bg-zinc-900 p-4 shadow-md">
        <h1 className="text-2xl font-bold">OpineBot</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 relative">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg shadow-md max-w-xs lg:max-w-md ${
                message.sender === 'user' 
                  ? 'bg-zinc-700 text-zinc-50' 
                  : 'bg-zinc-800 text-zinc-50 border border-zinc-700'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-500"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isRecording && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-md bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-lg font-semibold mb-2 text-zinc-50">Recording{ellipsis}</h2>
          <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse mb-2"></div>
          <div className="w-full max-h-40 overflow-y-auto text-sm text-zinc-300 text-center px-4">
            <p className="mb-2">{finalTranscription}</p>
            <p className="text-blue-500">{transcription}</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-zinc-900 shadow-md">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response here..."
            className="flex-1 bg-zinc-800 text-zinc-50 border-zinc-700 focus:ring-zinc-500"
          />
          <Button
            onClick={handleVoiceInput}
            className={`p-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
          >
            
            {isRecording ? "stop icon": "mic icon"  }
            
          </Button>
          <Button
            onClick={handleSendMessage}
            className="p-2 bg-zinc-700 hover:bg-zinc-600"
          >
          
            send icon
          </Button>
        </div>
      </div>
    </div>
  );
}