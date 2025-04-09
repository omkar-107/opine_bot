import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {  Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Clock,
  Download,
  User,
} from "lucide-react";
import CircularGroup from '@/components/ui/circularGroup';
import { useState } from "react";

import EditQuizView from "@/components/faculty/viewquizzescomponents/EditQuizView";
import * as XLSX from "xlsx";

const QuizDetailView = ({ quiz, onBack, isMobile, isTablet, userobj }) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [quizStatus, setQuizStatus] = useState(quiz.active);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quizData, setQuizData] = useState(quiz);

  const handleToggleStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/faculty/quiz/togglestatus/${quiz._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setQuizStatus(data.active);
        alert(data.message);
      } else {
        alert(data.message || "Failed to update quiz status");
      }
    } catch (error) {
      console.error("Error toggling quiz status:", error);
      alert("An error occurred while updating quiz status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizUpdate = (updatedQuiz) => {
    setQuizData(updatedQuiz);
    setQuizStatus(updatedQuiz.active);
  };

  // Function to download responses as Excel
  const downloadResponses = () => {
    try {
      setIsDownloading(true);

      // If there are no responses, show a message and return
      if (quiz.responses.length === 0) {
        alert("No responses available to download");
        setIsDownloading(false);
        return;
      }

      // Prepare data for Excel
      const formattedResponses = quiz.responses.map((response, index) => ({
        "No.": index + 1,
        "Response ID": response.responseid,
        Email: response.email,
        "Score (%)": response.score,
        "Submitted At": new Date(response.submitted_at).toLocaleString(),
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedResponses);

      // Column width settings
      const columnWidths = [
        { wch: 5 }, // No.
        { wch: 20 }, // Response ID
        { wch: 25 }, // Email
        { wch: 10 }, // Score
        { wch: 22 }, // Submitted At
      ];

      worksheet["!cols"] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

      // Add quiz info to a new sheet
      const quizInfoData = [
        { Key: "Quiz Title", Value: quiz.title },
        { Key: "Quiz Code", Value: quiz.quiz_code },
        { Key: "Course", Value: quiz.course_name },
        { Key: "Duration", Value: `${quiz.time} minutes` },
        { Key: "Questions", Value: quiz.num_questions },
        { Key: "Created On", Value: new Date(quiz.createdAt).toLocaleString() },
        { Key: "Status", Value: quiz.active ? "Active" : "Inactive" },
        { Key: "Total Responses", Value: quiz.responses.length },
      ];

      const quizInfoSheet = XLSX.utils.json_to_sheet(quizInfoData);
      XLSX.utils.book_append_sheet(workbook, quizInfoSheet, "Quiz Info");

      // Generate filename
      const dateStr = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .substring(0, 19);
      const fileName = `${quiz.quiz_code}_responses_${dateStr}.xlsx`;

      // Create and download file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error downloading responses:", error);
      alert("An error occurred while downloading responses");
    } finally {
      setIsDownloading(false);
    }
  };

  // If in edit mode, show the EditQuizView component
  if (isEditing) {
    return (
      <EditQuizView
        quiz={quizData}
        onBack={() => {
          setIsEditing(false);
          onBack();
        }}
        isMobile={isMobile}
        isTablet={isTablet}
        userobj={userobj}
        onUpdate={handleQuizUpdate}
      />
    );
  }



  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back Button & Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-2 hover:bg-gray-100"
        >
          <ArrowLeft size={isMobile ? 14 : 16} className="mr-2" />
          Back to Quizzes
        </Button>

        {!isMobile && (
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <span
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                  onClick={onBack}
                >
                  Quizzes
                </span>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-blue-600">
                    {quiz.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        )}
      </div>
       
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <Badge
                variant={quizStatus ? "success" : "secondary"}
                className={`text-xs sm:text-sm ${
                  quizStatus
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {quizStatus ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
              Quiz Code:{" "}
              <span className="font-mono font-medium">{quiz.quiz_code}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleToggleStatus}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⟳</span>
                  Updating...
                </span>
              ) : quizStatus ? (
                "Deactivate Quiz"
              ) : (
                "Activate Quiz"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Clock size={isMobile ? 16 : 20} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Duration
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.time} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <BookOpen
                  size={isMobile ? 16 : 20}
                  className="text-purple-700"
                />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Questions
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.num_questions} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 sm:col-span-2 md:col-span-1">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <User size={isMobile ? 16 : 20} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Responses
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.responses.length} received
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Tabs Selector */}
      {isMobile && (
        <div className="mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="questions">Questions</option>
            <option value="details">Quiz Details</option>
            <option value="responses">Responses</option>
            <option value="analysis"> Quiz Analysis</option>
          </select>
        </div>
      )}

      {/* Desktop/Tablet Tabs */}
      {!isMobile && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 sm:mb-6">
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              Questions
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              Quiz Details
            </TabsTrigger>
            <TabsTrigger value="responses" className="text-xs sm:text-sm">
              Responses
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs sm:text-sm">
            Quiz Analysis
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Questions Tab Content */}
      {activeTab === "questions" && (
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50 py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Quiz Questions
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {quiz.questions.map((question, index) => (
              <div
                key={question._id}
                className="border-b border-gray-100 last:border-0"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex gap-2 sm:gap-4">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <div className="space-y-2 sm:space-y-4 flex-1">
                      <h4 className="text-sm sm:text-base font-medium text-gray-800">
                        {question.question_text}
                      </h4>

                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3 ${
                              option === question.correct_answer
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                                option === question.correct_answer
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-xs sm:text-sm ${
                                  option === question.correct_answer
                                    ? "text-green-800"
                                    : "text-gray-700"
                                }`}
                              >
                                {option}
                              </p>
                            </div>
                            {option === question.correct_answer && (
                              <CheckSquare
                                size={isMobile ? 14 : 18}
                                className="text-green-600 flex-shrink-0"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Details Tab Content */}
      {activeTab === "details" && (
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Quiz Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Course ID</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.course_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Created By</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {userobj.username}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Created On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {new Date(quiz.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    {new Date(quiz.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {quiz.syllabus && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                  Syllabus Coverage
                </h3>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    {quiz.syllabus}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Status Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Status</p>
                  <Badge
                    variant={quizStatus ? "success" : "secondary"}
                    className={`text-xs ${
                      quizStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {quizStatus ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Started On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.started_on
                      ? new Date(quiz.started_on).toLocaleString()
                      : "Not started yet"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Ended On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.ended_on
                      ? new Date(quiz.ended_on).toLocaleString()
                      : "Not ended yet"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses Tab Content */}
      {activeTab === "responses" && (
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6">
            {quiz.responses.length > 0 ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                    Student Responses ({quiz.responses.length})
                  </h3>

                  {/* Download Button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
                    onClick={downloadResponses}
                    disabled={isDownloading || quiz.responses.length === 0}
                  >
                    <Download size={isMobile ? 14 : 16} />
                    {isDownloading ? "Generating..." : "Download Excel"}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium">
                          Response ID
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium">
                          Email
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium">
                          Score
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium">
                          Submitted At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quiz.responses.map((response) => (
                        <tr key={response._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 sm:px-4 sm:py-3 font-mono text-gray-800 truncate">
                            {response.responseid}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-gray-800">
                            {response.email}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3">
                            <Badge
                              className={`${
                                response.score >= 70
                                  ? "bg-green-100 text-green-800"
                                  : response.score >= 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {response.score}%
                            </Badge>
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-gray-600">
                            {new Date(response.submitted_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-10 md:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                  <AlertTriangle
                    size={isMobile ? 16 : 24}
                    className="text-gray-400"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                  No Responses Yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  This quiz hasn't received any responses yet. Responses will
                  appear here once students complete the quiz.
                </p>

                {/* Download Button (disabled state) */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 text-gray-400 border-gray-200 mt-4 sm:mt-6 cursor-not-allowed"
                  disabled={true}
                >
                  <Download size={isMobile ? 14 : 16} />
                  Download Excel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Tab Content */}
      {activeTab === "analysis" && (
  <Card className="border-gray-200">
    <CardContent className="p-4 sm:p-6">
      {(quiz?.final_summary?.sentiment_data?.length > 0 ||
        quiz?.final_summary?.message) ? (
        <>
          {/* Sentiment Overview Card */}
          {quiz.final_summary.sentiment_data?.length > 0 && (
            <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  Sentiment Overview
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Visual breakdown of student sentiments
                </p>
              </CardHeader>

              <CardContent>
                <div>
                  <CircularGroup sentimentData={quiz.final_summary.sentiment_data} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Summary Card */}
          <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  Final Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                <p className="text-[1.1rem] font-medium text-gray-800 leading-relaxed mt-1">
                  {quiz.final_summary?.message ?? 'No summary available yet.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-2xl font-bold text-gray-900">
                                            Actionable Insights
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="pt-4">
                                        {(quiz.final_summary?.insights ?? []).length > 0 ? (
                                            <ul className="space-y-4 pl-2">
                                                {quiz.final_summary?.insights.map((insight, index) => (
                                                    <li
                                                        key={index}
                                                        className="relative flex items-start gap-3 bg-gradient-to-r from-blue-50 via-white to-white border border-blue-100 rounded-xl p-4 shadow-sm"
                                                    >
                                                        <div className="flex-shrink-0 mt-1.5">
                                                            <span className="text-blue-600 text-lg mt-1">➤</span>
                                                        </div>
                                                        <p className="text-gray-800 text-[1.1rem] leading-relaxed font-medium">
                                                            {insight}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-base">No actionable insights yet.</p>
                                        )}
                                    </CardContent>

                                </Card>
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-100 text-blue-900 px-6 py-5 rounded-xl shadow-sm mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Quiz Analysis Not Available</h3>
            <p className="text-sm leading-relaxed">
              Currently, there’s no feedback data to generate meaningful insights.
            </p>
          </div>
        </div>
      </div>
      
      )}
    </CardContent>
  </Card>
)}



    </div>
  );
};

export default QuizDetailView;
