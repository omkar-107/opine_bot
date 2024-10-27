'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/outline';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { set } from 'mongoose';
import { InfinitySpin } from 'react-loader-spinner'

const baseUrl = process.env.NEXT_PUBLIC_BACKEND;

export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [finalTranscription, setFinalTranscription] = useState('');
  const [transcription, setTranscription] = useState('');
  const [ellipsis, setEllipsis] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const MAX_CHAR_LIMIT = 3000;
  const course = "Operating Systems";
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);
  const { feedbackId } = useParams();
  const [feedbackDetails, setFeedbackDetails] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getFeedbackDetails = async () => {
    const response = await fetch("/api/student/getfeedbackdetails/" + feedbackId);
    const data = await response.json();
    console.log('data', data);
    setFeedbackDetails(data);
  }

  useEffect(() => {
    getFeedbackDetails();
    setPageLoading(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startFeedbackSession();
  }, []);

  useEffect(() => {
    let ellipsisInterval;
    if (isRecording) {
      ellipsisInterval = setInterval(() => {
        setEllipsis(prev => prev.length < 3 ? prev + '.' : '');
      }, 500);
    }
    return () => clearInterval(ellipsisInterval);
  }, [isRecording]);

  // Initialize speech recognition
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


  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      const sanitizedTranscription = (finalTranscription + transcription).replace(/\s+/g, ' ').trim()
      setInput(sanitizedTranscription);
      setTranscription('');
      setFinalTranscription('');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscription('');
      setFinalTranscription('');
    }
  };



  const startFeedbackSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/start_feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course }),
      });

      if (!response.ok) {
        console.error('Failed to start feedback session:', response.status);
        throw new Error('Failed to start feedback session');
      }

      const data = await response.json();
      if (!data.chat_history || !Array.isArray(data.chat_history)) {
        console.error('Invalid chat history format:', data);
        throw new Error('Invalid response format');
      }

      // Filter out system messages when setting the chat history
      setMessages(data.chat_history
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          text: msg.content,
          sender: msg.role
        }))
      );
    } catch (error) {
      console.error('Error starting feedback session:', error);
      alert('Failed to start feedback session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const currentInput = input;
    const currentMessages = messages;
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          course,
          chat_history: currentMessages.map(msg => ({
            role: msg.sender,
            content: msg.text
          }))
        }),
      });

      if (!response.ok) {
        console.error('Failed to send message:', response.status);
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (!data.chat_history || !Array.isArray(data.chat_history)) {
        console.error('Invalid chat history format:', data);
        throw new Error('Invalid response format');
      }

      // Filter out system messages when updating the chat history
      setMessages(data.chat_history
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          text: msg.content,
          sender: msg.role
        }))
      );
      setInput('');

      if (data.is_last_question) {
        console.log('Feedback session completed');
        // Handle completion if needed
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const toggleListening = () => {
  //   if (recognition) {
  //     if (isListening) {
  //       recognition.stop();
  //     } else {
  //       recognition.start();
  //     }
  //     setIsListening(!isListening);
  //   }
  // };

  if (pageLoading) {
    return <div className='w-full h-lvh flex flex-col justify-center items-center gap-4'>
      <InfinitySpin
        visible={true}
        width="200"
        color="#4fa94d"
        ariaLabel="infinity-spin-loading"
      />
      <p>Loading feedback details...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <div className="bg-white p-6 shadow-lg text-center">
        <h1 className="text-4xl font-bold text-black">Course Feedback Bot</h1>
        <div className='w-full flex gap-4 justify-center text-slate-700 mt-2'>
          <span className="text-lg">Course: {feedbackDetails.course}</span>
          <span className="text-lg">CourseId: {feedbackDetails.forCourse}</span>
          <span className="text-lg ">Created By: {feedbackDetails.faculty}</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`inline-block p-3 rounded-lg shadow-md max-w-[80%] ${message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
                }`}
            >
              {message.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-pulse text-gray-600">Processing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {isRecording && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-md bg-white rounded-lg shadow-2xl border border-zinc-700 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-lg font-semibold mb-2 text-black">Recording{ellipsis}</h2>
          <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse mb-2"></div>
          <div className="w-full max-h-40 overflow-y-auto text-sm text-zinc-300 text-center px-4">
            <p className="mb-2 text-black">{finalTranscription}</p>
            <p className="text-blue-500">{transcription}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 shadow-lg">
        <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 shadow-md">
          <button
            className="p-2"
            onClick={handleVoiceInput}
          >{!isRecording ?
            <MicrophoneIcon
              className={`h-6 w-6 text-blue-600 `}
            /> :
            <StopIcon className={`h-6 w-6 text-red-600 `} />
            }
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your feedback here..."
            className="flex-1 py-2 px-4 text-gray-900 bg-transparent focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <span className={`text-sm ${input.length > MAX_CHAR_LIMIT ? 'text-red-500' : 'text-gray-400'
            }`}>
            {input.length} / {MAX_CHAR_LIMIT}
          </span>

          <Button
            onClick={handleSendMessage}
            disabled={input.length > MAX_CHAR_LIMIT || isLoading}
            className="py-2 px-4 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}