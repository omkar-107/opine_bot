"use client"
import React, { useState, useEffect, useRef, memo, useMemo,useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, ChevronDown, Send, Clock } from "lucide-react";
import { InfinitySpin } from "react-loader-spinner";
import { useParams } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND;

const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-4">
    <div className="px-4 py-2 bg-white/90 backdrop-blur-lg rounded-full shadow-lg">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);


const MessageBubble = memo(({ message, isUser }) => {
  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: `slideIn 0.3s ease-out 0.1s both`,
        opacity: 0,
      }}
    >
      <div
        className={`
          relative group
          max-w-[80%] p-4 rounded-2xl shadow-lg
          ${
            isUser
              ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
              : "bg-white text-gray-800 border border-gray-100"
          }
          transform transition-all duration-300 hover:scale-[1.02]
          before:absolute before:inset-0 before:rounded-2xl
          ${
            isUser
              ? "before:bg-gradient-to-br before:from-blue-400 before:to-blue-600"
              : "before:bg-gradient-to-br before:from-gray-50 before:to-white"
          }
          before:opacity-0 before:transition-opacity before:duration-300
          group-hover:before:opacity-100
        `}
      >
        <p className="relative text-sm md:text-base whitespace-pre-wrap">
          {message.text}
        </p>
        <div className="absolute bottom-0 right-0 transform translate-y-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-gray-400">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
});

export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalTranscription, setFinalTranscription] = useState("");
  const [transcription, setTranscription] = useState("");
  const [ellipsis, setEllipsis] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const MAX_CHAR_LIMIT = 3000;
  const [course, setCourse] = useState("");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { feedbackId } = useParams();
  const [feedbackDetails, setFeedbackDetails] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getFeedbackDetails = async () => {
    const response = await fetch(
      "/api/student/getfeedbackdetails/" + feedbackId
    );
    const data = await response.json();
    setCourse(data.course);
    setFeedbackDetails(data);
    setPageLoading(false);
  };

  useEffect(() => {
    getFeedbackDetails();
  }, []);

  useEffect(() => {
    if (course) {
      startFeedbackSession();
    }
  }, [course]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let ellipsisInterval;
    if (isRecording) {
      ellipsisInterval = setInterval(() => {
        setEllipsis((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
    }
    return () => clearInterval(ellipsisInterval);
  }, [isRecording]);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event) => {
        clearTimeout(transcriptionTimeoutRef.current);
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        setFinalTranscription((prev) => prev + finalTranscript);
        setTranscription(interimTranscript);
        transcriptionTimeoutRef.current = setTimeout(() => {
          setTranscription("");
        }, 1000);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event);
      };
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, []);

  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      const sanitizedTranscription = (finalTranscription + transcription)
        .replace(/\s+/g, " ")
        .trim();
      setInput(sanitizedTranscription);
      setTranscription("");
      setFinalTranscription("");
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscription("");
      setFinalTranscription("");
    }
  };

 // First, let's modify the startFeedbackSession function to include session tracking
const startFeedbackSession = async () => {
  try {
    setIsLoading(true);
    const response = await fetch(`${baseUrl}/start_feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        course,
        feedbackId, // Include feedbackId to track the session 
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start feedback session");
    }

    const data = await response.json();
    setMessages(
      data.chat_history
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          text: msg.content,
          sender: msg.role,
        }))
    );
  } catch (error) {
    console.error("Error starting feedback session:", error);
    alert("Failed to start feedback session. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

// Modify handleSendMessage to save messages
const handleSendMessage = async () => {
  if (input.trim() === "") return;

  const currentInput = input;
  const currentMessages = messages;
  setIsLoading(true);

  try {
    // Save the user's message first
    await saveFeedbackMessage({
      feedbackId,
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    });

    // Get AI response
    const response = await fetch(`${baseUrl}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: currentInput,
        course,
        feedbackId,
        chat_history: currentMessages.map((msg) => ({
          role: msg.sender,
          content: msg.text,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    
    // Save the AI's response
    await saveFeedbackMessage({
      feedbackId,
      role: 'assistant',
      content: data.chat_history[data.chat_history.length - 1].content,
      timestamp: new Date().toISOString()
    });

    setMessages(
      data.chat_history
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          text: msg.content,
          sender: msg.role,
        }))
    );
    setInput("");

    if (data.is_last_question) {
      await handleLastQuestion(currentMessages);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

// Add helper function to save individual messages
const saveFeedbackMessage = async (messageData) => {
  try {
    const response = await fetch('/api/student/savefeedbackmessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Failed to save message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Handle the last question and summary
const handleLastQuestion = async (currentMessages) => {
  setIsLoading(true);
  try {
    const res = await fetch(`${baseUrl}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course,
        feedbackId,
        chat_history: currentMessages.map((msg) => ({
          role: msg.sender,
          content: msg.text,
        })),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to summarize feedback");
    }

    const summary = await res.json();
    let feedbackData = {
      ...feedbackDetails,
      summary: summary.summary,
      user_chat: summary.chat_history
        .filter((msg) => msg.role !== "system" && msg.role !== "user")
        .map((msg) => msg.content),
      gpt_chat: summary.chat_history
        .filter((msg) => msg.role !== "system" && msg.role !== "assistant")
        .map((msg) => msg.content),
      completed: true,
      completedAt: new Date().toISOString()
    };

    // Save the complete feedback session
    await fetch(`/api/student/updatefeedback/${feedbackId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedbackData,
      }),
    });
  } catch (error) {
    console.error("Error handling last question:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  // const chatMessages = useMemo(() => {
  //   return messages.map((message, index) => (
  //     <MessageBubble
  //       key={index}
  //       message={message}
  //       isUser={message.sender === "user"}
  //     />
  //   ));
  // }, [messages]);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
          <InfinitySpin
            visible={true}
            width="200"
            color="#3b82f6"
            ariaLabel="infinity-spin-loading"
          />
        </div>
        <p className="mt-8 text-xl text-gray-600 font-medium animate-pulse">
          Loading feedback details...
        </p>
        <div className="mt-4 w-48 h-2 bg-blue-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <Card className="mx-3 mt-3 mb-2 shadow-xl border-none bg-white/90 backdrop-blur-md">
      <CardContent className="p-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Course Feedback Assistant
          </span>
        </h1>
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "Course", value: feedbackDetails.course, icon: "📚" },
            { label: "Course ID", value: feedbackDetails.forCourse, icon: "🔢" },
            { label: "Faculty", value: feedbackDetails.faculty, icon: "👨‍🏫" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-6 py-3 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span className="text-2xl block text-center mb-1">{item.icon}</span>
              <span className="text-xs text-gray-500 block text-center font-medium">
                {item.label}
              </span>
              <span className="text-sm text-indigo-800 font-semibold block text-center">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div
      ref={chatContainerRef}
      className="flex-1 px-4 py-3 overflow-y-auto scroll-smooth space-y-4"
      onScroll={handleScroll}
    >
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} isUser={message.sender === "user"} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>

    {showScrollButton && (
      <button
        onClick={scrollToBottom}
        className="fixed bottom-24 right-6 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    )}

    {isRecording && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all">
          <h2 className="text-2xl font-semibold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Recording{ellipsis}
          </h2>
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-red-500/40 rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Mic className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <p className="text-sm text-gray-800 font-medium text-center leading-relaxed">
              {finalTranscription}
            </p>
            <p className="text-sm text-indigo-500 italic text-center">
              {transcription}
            </p>
          </div>
        </div>
      </div>
    )}

    <Card className="mx-3 mb-3 mt-2 shadow-xl border-none bg-white/90 backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
            }`}
          >
            {!isRecording ? (
              <Mic className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your feedback here..."
            className="flex-1 px-5 py-3 rounded-xl bg-gray-50 focus:bg-white border-2 border-transparent focus:border-indigo-300 transition-all duration-300 outline-none shadow-inner text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <span
            className={`text-xs font-medium ${
              input.length > MAX_CHAR_LIMIT ? "text-red-500" : "text-gray-400"
            }`}
          >
            {input.length} / {MAX_CHAR_LIMIT}
          </span>

          <Button
            onClick={handleSendMessage}
            disabled={input.length > MAX_CHAR_LIMIT || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm gap-2 flex items-center"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <style jsx global>{`
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: slideIn 0.3s ease-out forwards;
      }

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `}</style>
  </div>
);
}
