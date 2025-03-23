'use client';
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownRight, ArrowUpRight, XCircle, Search, Filter, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/body.jsx";
import FeedbackSummaryCard from "../../feedback_page.jsx";

const FeedbackDashboard = () => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [error, setError] = useState(null);

  // Filtering and searching
  const [threshold, setThreshold] = useState(0);
  const [filterType, setFilterType] = useState("above");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeedbackTasks();
  }, []);

  useEffect(() => {
    if (selectedTask && showDetails) {
      fetchFeedbackDetails();
      fetchFeedbackSummary();
    }
  }, [selectedTask, showDetails]);

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
      setError("Failed to fetch feedback tasks. Please try again later.");
    }
  };

  const fetchFeedbackDetails = async () => {
    setIsLoading(true);
    try {
      const task = feedbackTasks.find((task) => task._id === selectedTask);
      if (!task) {
        throw new Error("Task not found");
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
      setError(error.message || "Failed to fetch feedback details");
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
      setError(error.message || "Failed to fetch feedback summary");
    }
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Filter students based on search query
  const filterStudentsBySearch = (students) => {
    if (!searchQuery) return students;
    
    return students.filter(student => 
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const filteredCompletedStudents = feedbackData ? filterStudentsBySearch(feedbackData.studentsWhoGaveFeedback) : [];
  const filteredNotCompletedStudents = feedbackData ? filterStudentsBySearch(feedbackData.studentsWhoDidNotGiveFeedback) : [];

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Get color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 4) return "bg-green-100 text-green-800";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen w-full gap-4 bg-slate-100 p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Feedback Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => {
                  setError(null);
                  fetchFeedbackTasks();
                }}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full gap-4 bg-slate-100 p-4">
      <Card className="w-full max-w-7xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-3xl">Feedback Dashboard</CardTitle>
          <CardDescription className="text-center">
            Track and analyze student feedback for your courses
          </CardDescription>
        </CardHeader>
        
        {!showDetails && (
          <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <div className="w-full md:w-3/4">
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Feedback Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTasks.length > 0 ? (
                      feedbackTasks.map((task) => (
                        <SelectItem key={task._id} value={task._id}>
                          {task.course_id} - {task.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        No feedback tasks available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={!selectedTask}
                onClick={handleViewDetails}
                variant="default"
                className="w-full md:w-auto"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {showDetails && (
        <Card className="w-full max-w-7xl">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
              <div>
                <CardTitle>
                  {feedbackTasks.find(task => task._id === selectedTask)?.title || "Feedback Details"}
                </CardTitle>
                <CardDescription>
                  Course: {feedbackTasks.find(task => task._id === selectedTask)?.course_id || "N/A"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                  size="sm"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Participation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {feedbackData?.studentsWhoGaveFeedback.length || 0}/{
                              (feedbackData?.studentsWhoGaveFeedback.length || 0) + 
                              (feedbackData?.studentsWhoDidNotGiveFeedback.length || 0)
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">Students completed</p>
                        </div>
                        <div className="h-14 w-14 rounded-full flex items-center justify-center bg-green-100">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <Progress 
                        value={
                          ((feedbackData?.studentsWhoGaveFeedback.length || 0) / 
                          ((feedbackData?.studentsWhoGaveFeedback.length || 0) + 
                          (feedbackData?.studentsWhoDidNotGiveFeedback.length || 0))) * 100
                        } 
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {feedbackSummary ? 
                              (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length || 0).toFixed(1) : 
                              "N/A"
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">Out of 10</p>
                        </div>
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                          feedbackSummary && summaries.length ?
                            (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length >= 4) ? 
                              "bg-green-100" : 
                              (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length >= 3) ? 
                                "bg-yellow-100" : 
                                "bg-red-100"
                            : "bg-gray-100"
                        }`}>
                          <div className={`text-xl font-bold ${
                            feedbackSummary && summaries.length ?
                              (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length >= 4) ? 
                                "text-green-600" : 
                                (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length >= 3) ? 
                                  "text-yellow-600" : 
                                  "text-red-600"
                              : "text-gray-600"
                          }`}>
                            {feedbackSummary && summaries.length ? 
                              (summaries.reduce((acc, curr) => acc + curr.summary.rating, 0) / summaries.length || 0).toFixed(1) : 
                              "N/A"
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Feedback Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{summaries.length}</p>
                          <p className="text-sm text-muted-foreground">Total submissions</p>
                        </div>
                        <div className="h-14 w-14 rounded-full flex items-center justify-center bg-blue-100">
                          <p className="text-xl font-bold text-blue-600">{summaries.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
       <TabsList className="w-full flex overflow-x-auto mb-4">
  <TabsTrigger value="completed" className="flex-1 min-w-[120px]">Completed</TabsTrigger>
  <TabsTrigger value="notCompleted" className="flex-1 min-w-[120px]">Not Completed</TabsTrigger>
  {/* <TabsTrigger value="Ratings">Ratings</TabsTrigger> */}
  <TabsTrigger value="Summary" className="flex-1 min-w-[120px]">Summary</TabsTrigger>
</TabsList>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full"
                      />
                    </div>
                  </div>

                  <TabsContent value="completed">
                    {filteredCompletedStudents.length > 0 ? (
                      <Table>
                        <TableCaption>
                          List of students who have completed feedback.
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">User</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Semester</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCompletedStudents.map((student) => (
                            <TableRow key={student._id}>
                              <TableCell>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{student.username}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.branch}</TableCell>
                              <TableCell>{student.year}</TableCell>
                              <TableCell>{student.semester}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <CheckCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          {searchQuery ? "No students match your search criteria" : "No students have completed feedback yet"}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notCompleted">
                    {filteredNotCompletedStudents.length > 0 ? (
                      <Table>
                        <TableCaption>
                          List of students who have not completed feedback.
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">User</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Semester</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNotCompletedStudents.map((student) => (
                            <TableRow key={student._id}>
                              <TableCell>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{student.username}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.branch}</TableCell>
                              <TableCell>{student.year}</TableCell>
                              <TableCell>{student.semester}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <CheckCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          {searchQuery ? "No students match your search criteria" : "All students have completed their feedback!"}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* <TabsContent value="Ratings"> */}
                    {/* <FeedbackSummaryCard
                      feedbackSummary={feedbackSummary}
                      positiveCount={feedbackData.studentsWhoGaveFeedback.length}
                      negativeCount={feedbackData.studentsWhoDidNotGiveFeedback.length}
                      totalStudents={
                        feedbackData.studentsWhoGaveFeedback.length +
                        feedbackData.studentsWhoDidNotGiveFeedback.length
                      }
                    /> */}
                  {/* </TabsContent> */}

                  <TabsContent value="Summary">
                    <div className="space-y-4">
                      <Card className="border-none shadow-none">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Filter by rating:</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                              <Input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                                className="w-full sm:w-32"
                                placeholder="Rating threshold"
                              />
                              <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-full sm:w-40">
                                  <SelectValue placeholder="Filter type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="above">Above Threshold</SelectItem>
                                  <SelectItem value="below">Below Threshold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 gap-4">
                        {filteredSummaries.length > 0 ? (
                          filteredSummaries.map((summary) => (
                            <Card key={summary._id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge
                                    className={getRatingColor(summary.summary.rating)}
                                  >
                                    Rating: {summary.summary.rating}/10
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={
                                      summary.summary.rating >= 4
                                        ? "border-green-500 text-green-700"
                                        : summary.summary.rating >= 3
                                        ? "border-yellow-500 text-yellow-700"
                                        : "border-red-500 text-red-700"
                                    }
                                  >
                                    {summary.summary.rating >= 4
                                      ? "Positive"
                                      : summary.summary.rating >= 3
                                      ? "Neutral"
                                      : "Needs Improvement"}
                                  </Badge>
                                </div>
                                <p className="text-gray-700 whitespace-pre-line mt-2">{summary.summary.message}</p>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <AlertCircle className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500">
                              No feedback found matching your filter criteria
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackDashboard;