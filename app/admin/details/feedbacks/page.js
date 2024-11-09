'use client'
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FeedbackSummaryCard from "../../feedback_page.jsx";

const FeedbackDashboard = () => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [error, setError] = useState(null);

  // New state variables for filtering
  const [threshold, setThreshold] = useState(0);
  const [filterType, setFilterType] = useState("above"); // "above" or "below"

  useEffect(() => {
    fetchFeedbackTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchFeedbackDetails();
      fetchFeedbackDetails();
      fetchFeedbackSummary();
    }
  }, [selectedTask]);

  const fetchFeedbackTasks = async () => {
    try {
      const response = await fetch("/api/admin/feedbacktask/getalltasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setFeedbackTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchFeedbackDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const task = feedbackTasks.find((task) => task._id === selectedTask);
      if (!task) {
        throw new Error("Selected task not found");
      }
      const response = await fetch("/api/admin/feedbacktask/getdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbacktaskId: selectedTask,
          courseId: task.course_id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch feedback details");
      }
      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error("Failed to fetch feedback details:", error);
      setError(error.message);
      setFeedbackData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbackSummary = async () => {
    try {
      const response = await fetch(`/api/admin/feedbacktask/getsummarries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbacktaskId: selectedTask }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch feedback summary");
      }

      const data = await response.json();
      
      setFeedbackSummary(data);
    } catch (error) {
      console.error("Failed to fetch feedback summary:", error);
      setFeedbackSummary(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Safely handle feedbackSummary.summaries
  const summaries = feedbackSummary?.summaries || [];

  // Filtered feedback summaries based on threshold and filter type
  const filteredSummaries = summaries.filter((summary) => {
    if (filterType === "above") {
      return summary.summary.rating >= threshold;
    } else {
      return summary.summary.rating <= threshold;
    }
  });

  if (!feedbackData) {
    return (
      <div className="p-4 bg-gray-100 rounded-md">
        <p>{feedbackSummary.summaries[0].summary.message}</p>
      </div>
    );
  };

  const renderTableContent = (students) => {
    if (!students || students.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="p-2 border text-center">
            No data available
          </td>
        </tr>
      );
    }

    return students.map((student) => (
      <tr key={student._id}>
        <td className="p-2 border">{student.username}</td>
        <td className="p-2 border">{student.email}</td>
        <td className="p-2 border">{student.branch}</td>
        <td className="p-2 border">{student.year}</td>
        <td className="p-2 border">{student.semester}</td>
      </tr>
    ));
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!selectedTask) {
      return (
        <Card className="w-[80%] border bg-white p-4 shadow-lg rounded-xl mt-4">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Feedback Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-evenly gap-4">
              <label>Select Feedback Task to view details</label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Feedback Task" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTasks.map((task) => (
                    <SelectItem key={task._id} value={task._id}>
                      {task.course_id} - {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );
    }

    const { hasFeedback } = getFeedbackCounts();

    if (!hasFeedback && !feedbackData) {
      return <NoFeedbackMessage />;
    }

    return (
      <div className="flex flex-col items-center justify-start h-screen w-full gap-4 bg-slate-100">
        <div className="flex flex-col items-center justify-center gap-4 w-[80%] border bg-white p-2 shadow-lg mt-4 rounded-xl">
          <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
        </div>
        <div className="flex items-center justify-evenly gap-4 w-[80%] border bg-white p-4 shadow-lg rounded-xl">
          <label>Select Feedback Task to view details</label>
          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Feedback Task" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTasks.map((task) => (
                <SelectItem key={task._id} value={task._id}>
                  {task.course_id} - {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-center justify-start gap-4 w-[80%] border bg-white p-4 shadow-lg rounded-xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
              Loading...
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              {renderTabsList()}
              <TabsContent value="completed">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border text-left">Username</th>
                        <th className="p-2 border text-left">Email</th>
                        <th className="p-2 border text-left">Branch</th>
                        <th className="p-2 border text-left">Year</th>
                        <th className="p-2 border text-left">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableContent(feedbackData?.studentsWhoGaveFeedback)}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="notCompleted">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border text-left">Username</th>
                        <th className="p-2 border text-left">Email</th>
                        <th className="p-2 border text-left">Branch</th>
                        <th className="p-2 border text-left">Year</th>
                        <th className="p-2 border text-left">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableContent(feedbackData?.studentsWhoDidNotGiveFeedback)}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="Ratings">
                <FeedbackSummaryCard
                  feedbackSummary={feedbackSummary}
          

                  totalStudents={
                    (feedbackData?.studentsWhoGaveFeedback?.length || 0) +
                    (feedbackData?.studentsWhoDidNotGiveFeedback?.length || 0)
                  }
                />
              </TabsContent>
              <TabsContent value="Summary">
                <div className="p-4">
                  {/* Filter Controls */}
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) =>
                        setThreshold(parseInt(e.target.value) || 0)
                      }
                      className="p-2 border rounded-md"
                      placeholder="Enter rating threshold"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="above">Above Threshold</option>
                      <option value="below">Below Threshold</option>
                    </select>
                  </div>

                  {/* Display Feedback Summaries */}
                  {filteredSummaries.length >= 1 ? (
                    filteredSummaries.map((summary) => (
                      <div
                        key={summary._id}
                        className="p-4 bg-gray-100 rounded-md text-black m-4"
                      >
                        <div className="font-bold">
                          Rating : {summary.summary.rating}
                        </div>
                        {summary.summary.message}
                      </div>
                    ))
                  ) : (
                    <p className="p-4 bg-gray-100 rounded-md text-black m-4">
                      No feedbacks available for the selected threshold
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    );
  };

  return renderContent();
};

export default FeedbackDashboard;
