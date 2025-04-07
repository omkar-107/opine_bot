"use client"
import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, ChevronDown, Send, Clock, ArrowLeft, RefreshCw, Copy, Check } from "lucide-react";
import { InfinitySpin } from "react-loader-spinner";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND;

// Enhanced loading indicator with smooth animation
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-6">
    <div className="px-5 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100">
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.6s" }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced message bubble with copy functionality and timestamp
const MessageBubble = memo(({ message, isUser }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format timestamp nicely
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`flex w-full mb-5 ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: `slideIn 0.4s ease-out forwards`,
      }}
    >
      {/* Avatar for assistant messages */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 shadow-md">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}

      <div
        className={`
          relative group
          max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-2xl shadow-lg
          ${isUser
            ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white"
            : "bg-white text-gray-800 border border-indigo-100"
          }
          transform transition-all duration-300 hover:shadow-xl
        `}
      >
        <p className="relative text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        {/* Interactive footer with timestamp and copy button */}
        <div className="mt-2 pt-2 flex items-center justify-between text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className={`${isUser ? "text-indigo-200" : "text-gray-400"}`}>
            {formattedTime}
          </span>

          <button
            onClick={copyToClipboard}
            className={`p-1 rounded-md ${isUser ? "hover:bg-indigo-600" : "hover:bg-gray-100"} transition-colors`}
            title="Copy message"
          >
            {copied ? (
              <Check className={`h-4 w-4 ${isUser ? "text-indigo-200" : "text-indigo-500"}`} />
            ) : (
              <Copy className={`h-4 w-4 ${isUser ? "text-indigo-200" : "text-gray-400"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Avatar for user messages */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ml-2 shadow-md">
          <span className="text-white text-xs font-bold">ME</span>
        </div>
      )}
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
  const [syllabus, setSyllabus] = useState("");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { feedbackId } = useParams();
  const [feedbackDetails, setFeedbackDetails] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getFeedbackDetails = async () => {
    try {
      const response = await fetch(
        "/api/student/getfeedbackdetails/" + feedbackId
      );
      const data = await response.json();
      setCourse(data.course);
      setSyllabus(data.syllabus);
      setFeedbackDetails(data);
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching feedback details:", error);
      // Show elegant error state
      setPageLoading(false);
    }
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

  const getAuthToken = async () => {
    try {
      const response = await fetch(`/api/auth/token`);
      if (response.ok) {
        const tokenData = await response.json();
        console.log(tokenData.token);
        return tokenData.token;
      } else {
        console.error("Error fetching token:");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    return null;
  };

  const startFeedbackSession = async () => {
    try {
      const token = await getAuthToken();

      setIsLoading(true);
      const response = await fetch(`${baseUrl}/start_feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
        body: JSON.stringify({
          course,
          feedbackId,
          syllabus,
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
      // Show elegant error toast instead of alert
      setMessages([
        {
          text: "Sorry, I couldn't start our feedback session. Please try again or return to the dashboard.",
          sender: "assistant"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const currentInput = input;
    const currentMessages = messages;
    setInput("");
    setCharCount(0);

    // Optimistically update UI
    setMessages([
      ...currentMessages,
      { text: currentInput, sender: "user" }
    ]);

    setIsLoading(true);

    try {
      const token = await getAuthToken();

      const response = await fetch(`${baseUrl}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
        body: JSON.stringify({
          message: currentInput,
          course,
          feedbackId,
          syllabus,
          chat_history: currentMessages.map((msg) => ({
            role: msg.sender,
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const updatedMessages = [
        ...currentMessages,
        { text: currentInput, sender: "user" }
      ];
      const data = await response.json();

      // Get the assistant's response from the last message in chat_history
      const assistantResponse = data.chat_history[data.chat_history.length - 1];

      // Add the assistant's response to the messages
      const finalMessages = [
        ...updatedMessages,
        {
          text: assistantResponse.content,
          sender: assistantResponse.role
        }
      ];

      // Update messages state with the complete history
      setMessages(finalMessages.filter((msg) => msg.sender !== "system"));

      if (data.is_last_question) {
        await handleLastQuestion(finalMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat instead of alert
      setMessages([
        ...currentMessages,
        { text: currentInput, sender: "user" },
        {
          text: "Sorry, I couldn't process your message. Please try again or refresh the page.",
          sender: "assistant"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the last question and summary
  const handleLastQuestion = async (currentMessages) => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();

      const res = await fetch(`${baseUrl}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
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
          .filter((msg) => msg.role !== "system" && msg.role !== "assistant")
          .map((msg) => msg.content),
        gpt_chat: summary.chat_history
          .filter((msg) => msg.role !== "system" && msg.role !== "user")
          .map((msg) => msg.content),
        completed: true,
        completedAt: new Date().toISOString()
      };

      // Add a completion message
      setMessages([
        ...currentMessages,
        {
          text: "Thank you for completing your feedback! You're being redirected to the dashboard...",
          sender: "assistant"
        }
      ]);

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

      // Add a slight delay before redirect for better UX
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

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

  // Calculate character progress percentage
  const charPercentage = (charCount / MAX_CHAR_LIMIT) * 100;
  const charLimitExceeded = charCount > MAX_CHAR_LIMIT;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
          <InfinitySpin
            visible={true}
            width="200"
            color="#6366f1"
            ariaLabel="infinity-spin-loading"
          />
        </div>
        <p className="mt-8 text-xl text-gray-700 font-medium animate-pulse">
          Preparing your feedback session...
        </p>
        <div className="mt-6 w-64 h-2 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header with Course Info */}
      <Card className="mx-3 mt-3 mb-2 shadow-xl border-none bg-white/90 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 mr-3 group"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold flex-1 text-center pr-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient">
                Course Feedback
              </span>
            </h1>
          </div>

          {/* Improved mobile layout for course info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md p-4">
            <div className="flex items-center group hover:bg-white/80 p-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                <span className="text-2xl">📚</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block">Course</span>
                <p className="text-sm sm:text-base text-indigo-800 font-semibold truncate">{feedbackDetails.course}</p>
              </div>
            </div>

            <div className="flex items-center group hover:bg-white/80 p-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                <span className="text-2xl">🔢</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block">Course ID</span>
                <p className="text-sm sm:text-base text-indigo-800 font-semibold truncate">{feedbackDetails.forCourse}</p>
              </div>
            </div>

            <div className="flex items-center group hover:bg-white/80 p-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block">Faculty</span>
                <p className="text-sm sm:text-base text-indigo-800 font-semibold truncate">{feedbackDetails.faculty}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className="flex-1 px-3 sm:px-6 py-4 overflow-y-auto scroll-smooth space-y-4"
        onScroll={handleScroll}
      >
        {/* Welcome message if no messages */}
        {messages.length === 0 && !isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center max-w-md p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Course Feedback</h3>
              <p className="text-gray-600 text-sm">
                I'm here to collect your valuable feedback about this course.
                Feel free to share your thoughts honestly - all feedback helps improve the learning experience.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isUser={message.sender === "user"}
          />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced scroll button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-4 sm:right-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 z-10 group"
        >
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-y-1 transition-transform" />
        </button>
      )}

      {/* Enhanced recording modal */}
      {isRecording && (
        <div className="fixed inset-0 bg-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 m-4 max-w-md w-full transform transition-all">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Recording{ellipsis}
            </h2>
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-red-500/40 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Mic className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-32 sm:max-h-40 overflow-y-auto shadow-inner">
              <p className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                {finalTranscription}
              </p>
              <p className="text-sm sm:text-base text-indigo-500 italic mt-2">
                {transcription}
              </p>
            </div>
            <button
              onClick={handleVoiceInput}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop Recording</span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced input area */}
      {/* Enhanced input area */}
      <Card className="mx-3 mb-3 mt-2 shadow-xl border-none bg-white/90 backdrop-blur-md">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-2">
            {/* Character limit progress bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${charLimitExceeded ? 'bg-red-500' :
                  charPercentage > 75 ? 'bg-yellow-500' : 'bg-indigo-500'
                  }`}
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mic button - aligned center */}
              <button
                onClick={handleVoiceInput}
                className={`flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg ${isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  }`}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {!isRecording ? (
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Square className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>

              {/* Textarea container */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your feedback here..."
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-50 focus:bg-white border-2 transition-all duration-300 outline-none shadow-inner text-sm resize-none h-12 sm:h-14 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${charLimitExceeded
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-transparent focus:border-indigo-300'
                    }`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* Character counter */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${charLimitExceeded
                    ? "text-red-600 bg-red-50"
                    : charCount > 0
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-400"
                    }`}>
                    {charCount} / {MAX_CHAR_LIMIT}
                  </span>
                </div>
              </div>

              {/* Send button - aligned center */}
              <Button
                onClick={handleSendMessage}
                disabled={charLimitExceeded || isLoading || input.trim() === ""}
                className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-label="Send message"
              >
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
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
      
      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 8s ease infinite;
      }

      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }

      @media (min-width: 640px) {
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 5px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `}</style>
    </div>
  );
}