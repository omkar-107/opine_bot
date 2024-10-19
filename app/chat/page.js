'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon } from '@heroicons/react/outline'; // Import icons from Heroicons
import { motion } from 'framer-motion'; // Import Framer Motion

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [recognition, setRecognition] = useState(null); // State to hold recognition instance
  const [isListening, setIsListening] = useState(false); // State to track if listening
  const MAX_CHAR_LIMIT = 3000; // Set the maximum character limit

  // Use useEffect to initialize the recognition on the client side
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false; // Stop after one phrase
      recognitionInstance.interimResults = false; // No intermediate results

      // Set up recognition event handlers
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Recognized speech:", transcript); // Log recognized speech to the console
        setInput(transcript); // Set the input to the recognized text
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert(`Error occurred in speech recognition: ${event.error}`); // Alerting the user
      };

      // Set up end event to toggle listening state
      recognitionInstance.onend = () => {
        console.log('Speech recognition service disconnected');
        setIsListening(false); // Update listening state
      };

      setRecognition(recognitionInstance); // Store the recognition instance
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const handleBotMessage = (message) => {
    setMessages((prev) => [...prev, { text: message, sender: 'bot' }]);
    setCurrentQuestion(message);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const nextQuestion = getNextQuestion(currentQuestion, input);
      handleBotMessage(nextQuestion);
      setIsLoading(false);
    }, 1000);
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop(); // Stop speech recognition
      } else {
        recognition.start(); // Start speech recognition
      }
      setIsListening(!isListening); // Toggle listening state
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <div className="bg-white p-6 shadow-lg text-center">
        <h1 className="text-4xl font-bold text-black">OpineBot</h1>
      </div>

      <div className="flex-1 p-4">
        {/* Display message history */}
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`inline-block p-3 rounded-lg shadow-md ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {message.text}
            </div>
          </motion.div>
        ))}
        {isLoading && <div className="text-center py-2">Loading...</div>}
      </div>

      <div className="bg-white p-6 shadow-lg">
        {/* Input and Button Section */}
        <div className="mt-6 flex items-center space-x-2 border border-gray-300 rounded-full p-2 shadow-md">
          <button 
            className="p-2" 
            onClick={toggleListening} // Toggle listening on button click
          >
            <MicrophoneIcon className={`h-6 w-6 ${isListening ? 'text-blue-600' : 'text-gray-400'}`} />
          </button>

          {/* Chat Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Summarize the latest"
            className="flex-1 py-2 px-4 text-gray-900 bg-transparent focus:outline-none"
          />

          {/* Character Count */}
          <span className={`text-sm ${input.length > MAX_CHAR_LIMIT ? 'text-red-500' : 'text-gray-400'}`}>
            {input.length} / {MAX_CHAR_LIMIT}
          </span>

          {/* Send Button */}
          <Button onClick={handleSendMessage} disabled={input.length > MAX_CHAR_LIMIT} className="py-2 px-4 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
            Send
          </Button>
        </div>
       
      </div>
    </div>
  );
}
