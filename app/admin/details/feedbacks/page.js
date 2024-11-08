import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownRight, ArrowUpRight, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import FeedbackSummaryCard from "../../feedback_page.jsx";

const FeedbackDashboard = () => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackTasks();
    if (selectedTask) {
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
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchFeedbackDetails = async () => {
    setIsLoading(true);
    try {
      const courseId = feedbackTasks.find(
        (task) => task._id === selectedTask
      ).course_id;
      const response = await fetch("/api/admin/feedbacktask/getdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbacktaskId: selectedTask,
          courseId: courseId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch feedback details");
      }
      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error("Failed to fetch feedback details:", error);
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
      console.log("Feedback summary:", data);
      setFeedbackSummary(data);
    } catch (error) {
      console.error("Failed to fetch feedback summary:", error);
      setError(error.message);
    }
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    if (!showDetails) {
      fetchFeedbackDetails();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!feedbackData) {
    return (
      <div className="flex flex-col items-center justify-start h-screen w-full gap-4 bg-slate-100">
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
              <Button
                disabled={!selectedTask}
                onClick={handleViewDetails}
                variant={showDetails ? "destructive" : "primary"}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
        <Button
          disabled={!selectedTask}
          onClick={handleViewDetails}
          variant={showDetails ? "destructive" : "primary"}
        >
          {showDetails ? "Hide Details" : "View Details"}
        </Button>
      </div>
      {showDetails && (
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
              <TabsList className="border-b">
                <TabsTrigger value="completed">
                  Completed{" "}
                  <span className="text-sm text-gray-500">
                    ({feedbackData.studentsWhoGaveFeedback.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notCompleted">
                  Not Completed{" "}
                  <span className="text-sm text-gray-500">
                    ({feedbackData.studentsWhoDidNotGiveFeedback.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="Ratings">Ratings</TabsTrigger>
                <TabsTrigger value="Summary">Summary</TabsTrigger>
              </TabsList>
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
                      {feedbackData.studentsWhoGaveFeedback.map((student) => (
                        <tr key={student._id}>
                          <td className="p-2 border">{student.username}</td>
                          <td className="p-2 border">{student.email}</td>
                          <td className="p-2 border">{student.branch}</td>
                          <td className="p-2 border">{student.year}</td>
                          <td className="p-2 border">{student.semester}</td>
                        </tr>
                      ))}
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
                      {feedbackData.studentsWhoDidNotGiveFeedback.map(
                        (student) => (
                          <tr key={student._id}>
                            <td className="p-2 border">{student.username}</td>
                            <td className="p-2 border">{student.email}</td>
                            <td className="p-2 border">{student.branch}</td>
                            <td className="p-2 border">{student.year}</td>
                            <td className="p-2 border">{student.semester}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="Ratings">
                <FeedbackSummaryCard
                  feedbackSummary={feedbackSummary}
                  positiveCount={feedbackData.studentsWhoGaveFeedback.length}
                  negativeCount={feedbackData.studentsWhoDidNotGiveFeedback.length}
                  totalStudents={
                    feedbackData.studentsWhoGaveFeedback.length +
                    feedbackData.studentsWhoDidNotGiveFeedback.length
                  }
                />
              </TabsContent>
              <TabsContent value="Summary">
                <div className="p-4 bg-gray-100 rounded-md">
                  {/* <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Feedback Summary</h3>
                    {feedbackSummary.summaries[0].sentiment === "positive" ? (
                      <div className="flex items-center text-green-500">
                        <ArrowUpRight size={16} className="mr-1" />
                        Positive
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500">
                        <ArrowDownRight size={16} className="mr-1" />
                        Negative
                      </div>
                    )}
                  </div> */}
                  <p>{feedbackSummary.summaries[0].summary.message}</p>
                  {/* <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Feedback Breakdown</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span>Positive Feedback</span>
                      </div>
                      <Progress
                        value={(feedbackData.studentsWhoGaveFeedback.length /
                          (feedbackData.studentsWhoGaveFeedback.length +
                            feedbackData.studentsWhoDidNotGiveFeedback.length)) *
                          100}
                        className="w-32"
                      />
                      <span>{((feedbackData.studentsWhoGaveFeedback.length /
                        (feedbackData.studentsWhoGaveFeedback.length +
                          feedbackData.studentsWhoDidNotGiveFeedback.length)) *
                        100).toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span>Negative Feedback</span>
                      </div>
                      <Progress
                        value={(feedbackData.studentsWhoDidNotGiveFeedback.length /
                          (feedbackData.studentsWhoGaveFeedback.length +
                            feedbackData.studentsWhoDidNotGiveFeedback.length)) *
                          100}
                        className="w-32"
                      />
                      <span>{((feedbackData.studentsWhoDidNotGiveFeedback.length /
                        (feedbackData.studentsWhoGaveFeedback.length +
                          feedbackData.studentsWhoDidNotGiveFeedback.length)) *
                        100).toFixed(2)}%</span>
                    </div>
                  </div> */}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;