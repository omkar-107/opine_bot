"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/outline";
import { InfinitySpin } from "react-loader-spinner";
import { useParams } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND;

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
    console.log("data", data);
    setFeedbackDetails(data);
  };

  useEffect(() => {
    getFeedbackDetails();
    setPageLoading(false);
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

  // Initialize speech recognition
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

  const startFeedbackSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/start_feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course }),
      });

      if (!response.ok) {
        console.error("Failed to start feedback session:", response.status);
        throw new Error("Failed to start feedback session");
      }

      const data = await response.json();
      if (!data.chat_history || !Array.isArray(data.chat_history)) {
        console.error("Invalid chat history format:", data);
        throw new Error("Invalid response format");
      }

      // Filter out system messages when setting the chat history
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

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const currentInput = input;
    const currentMessages = messages;
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          course,
          chat_history: currentMessages.map((msg) => ({
            role: msg.sender,
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        console.error("Failed to send message:", response.status);
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      if (!data.chat_history || !Array.isArray(data.chat_history)) {
        console.error("Invalid chat history format:", data);
        throw new Error("Invalid response format");
      }

      // Filter out system messages when updating the chat history
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
        setIsLoading(true);
        console.log("Feedback session completed");
        console.log("Feedback data:", data);
        let res = await fetch(`${baseUrl}/summarize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course,
            chat_history: currentMessages.map((msg) => ({
              role: msg.sender,
              content: msg.text,
            })),
          }),
        });

        if (!res.ok) {
          console.error("Failed to summarize feedback:", response.status);
          throw new Error("Failed to summarize feedback");
        }

        res = await res.json();

        let feedbackData = feedbackDetails;
        feedbackData.summary = res.summary;
        feedbackData.user_chat = res.chat_history
          .filter((msg) => msg.role !== "system" && msg.role !== "user")
          .map((msg) => msg.content);
        feedbackData.gpt_chat = res.chat_history
          .filter((msg) => msg.role !== "system" && msg.role !== "assistant")
          .map((msg) => msg.content);

        console.log("feedbackData in client", feedbackData);

        const response = await fetch(
          "/api/student/getfeedbackdetails/" + feedbackId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              course,
              feedbackData,
            }),
          }
        );
        console.log("successfully submitted");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
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
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };


  const MessageBubble = ({ message, index }) => {
    const isUser = message.sender === "user";
    return (
      <div
        className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
        style={{
          animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
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
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="mx-3 mt-3 mb-2 shadow-xl border-none bg-white/80 backdrop-blur-md">
        <CardContent className="p-4">
          <h1 className="text-2xl font-bold text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
              Course Feedback Bot
            </span>
          </h1>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {[
              { label: "Course", value: feedbackDetails.course },
              { label: "CourseId", value: feedbackDetails.forCourse },
              { label: "Faculty", value: feedbackDetails.faculty },
            ].map((item) => (
              <div
                key={item.label}
                className="px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <span className="text-xs text-gray-500 block text-center">
                  {item.label}
                </span>
                <span className="text-sm text-blue-800 font-semibold block text-center">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div
        ref={chatContainerRef}
        className="flex-1 px-3 py-2 overflow-y-auto scroll-smooth space-y-3"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} index={index} />
        ))}

        {isLoading && (
          <div className="flex justify-center items-center py-2">
            <div className="px-4 py-2 bg-white rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      {isRecording && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 m-3 max-w-md w-full transform transition-all">
            <h2 className="text-xl font-semibold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Recording{ellipsis}
            </h2>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-red-500/40 rounded-full animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <MicrophoneIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              <p className="text-sm text-gray-800 font-medium text-center leading-relaxed">
                {finalTranscription}
              </p>
              <p className="text-sm text-blue-500 italic text-center">
                {transcription}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="mx-3 mb-3 mt-2 shadow-xl border-none bg-white/80 backdrop-blur-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isRecording
                  ? "bg-gradient-to-br from-red-400 to-red-600 text-white"
                  : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
              }`}
            >
              {!isRecording ? (
                <MicrophoneIcon className="h-5 w-5" />
              ) : (
                <StopIcon className="h-5 w-5" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your feedback here..."
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-blue-300 transition-all duration-300 outline-none shadow-inner text-sm"
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              Send
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

const MessageBubble = ({ message, index }) => {
  const isUser = message.sender === "user";
  return (
    <div
      className={`flex w-full mb-2 ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
        opacity: 0,
      }}
    >
      <div
        className={`
          relative group
          max-w-[80%] p-3 rounded-xl shadow-md
          ${
            isUser
              ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
              : "bg-white text-gray-800 border border-gray-100"
          }
          transform transition-all duration-300 hover:scale-[1.01]
          before:absolute before:inset-0 before:rounded-xl
          ${
            isUser
              ? "before:bg-gradient-to-br before:from-blue-400 before:to-blue-600"
              : "before:bg-gradient-to-br before:from-gray-50 before:to-white"
          }
          before:opacity-0 before:transition-opacity before:duration-300
          group-hover:before:opacity-100
        `}
      >
        <p className="relative text-sm whitespace-pre-wrap">
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
};
