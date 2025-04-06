"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch, Skeleton } from '@/components/ui/body';
import { Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import CircularGroup from '@/components/ui/circularGroup';
import SentimentBarChart from '@/components/ui/sentimentBarChart';
import TimeSeriesLineChart from '@/components/ui/timeSeriesLineChart';

const Toaster = dynamic(
    () => import('@/components/ui/toaster').then(mod => mod.Toaster),
    { ssr: false }
);

const FeedbackTaskPage = () => {
    const { taskid } = useParams();
    const [taskDetails, setTaskDetails] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [summaries, setSummaries] = useState([]);
    const [showAllSummaries, setShowAllSummaries] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedbackTask, setFeedbackTask] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            if (!taskid) {
                setError("No task ID provided");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch task details with error handling
                const response = await fetch(`/api/faculty/gettaskdetails/${taskid}`);
                const contentType = response.headers.get("content-type");

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                // Check if response is JSON
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Invalid response format from server");
                }

                const responseData = await response.json();

                if (!responseData) {
                    throw new Error("No task data received");
                }

                setTaskDetails(responseData);
                setFeedbackTask(responseData); // Optional if you need it separately
                setIsActive(responseData.active);

                // Fetch summaries with error handling
                try {
                    const summariesResponse = await fetch(`/api/faculty/getsummary/${taskid}`);
                    if (summariesResponse.ok) {
                        const summariesData = await summariesResponse.json();
                        setSummaries(Array.isArray(summariesData) ? summariesData : []);
                    } else {
                        console.warn('Failed to fetch summaries:', summariesResponse.status);
                        setSummaries([]);
                    }
                } catch (summaryError) {
                    console.error('Error fetching summaries:', summaryError);
                    setSummaries([]);
                }

            } catch (error) {
                console.error("Error in fetchTaskDetails:", error);
                setError(error.message || "An unexpected error occurred");
                toast({
                    title: "Error",
                    description: error.message || "Failed to load task details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [taskid]);

    useEffect(() => {
        if (taskDetails?.createdAt) {
            setFormattedDate(new Date(taskDetails.createdAt).toLocaleString());
        }
    }, [taskDetails]);

    const handleActiveChange = async () => {
        if (isStatusChanging) return;

        setIsStatusChanging(true);
        try {
            const newActiveStatus = !isActive;
            const response = await fetch('/api/faculty/updatetaskstatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskid, status: newActiveStatus })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update task status: ${response.status}`);
            }

            setIsActive(newActiveStatus);
            toast({
                title: "Success",
                description: `Task is now ${newActiveStatus ? 'Active' : 'Inactive'}`,
                variant: "success"
            });
        } catch (error) {
            console.error("Error updating task status:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update task status",
                variant: "destructive"
            });
            // Revert the switch state
            setIsActive(isActive);
        } finally {
            setIsStatusChanging(false);
        }
    };

    return (
        <>
            <Toaster />
            <div className="container mx-auto p-6 max-w-4xl">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Error Loading Task</AlertTitle>
                        <AlertDescription>
                            {error}
                            <div className="mt-2 text-sm">
                                <strong>Debug Info:</strong>
                                <br />
                                Task ID: {taskid || 'Not provided'}
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : taskDetails ? (
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-extrabold text-blue-700">Feedback Task Dashboard</h1>
                            <p className="text-gray-500 mt-2">Comprehensive insights for informed teaching</p>
                        </div>

                        <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl">
                            <CardHeader className="pb-2 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold text-gray-800">{taskDetails.title}</CardTitle>
                                    <Badge
                                        variant={isActive ? "success" : "secondary"}
                                        className={`px-3 py-1 rounded-full text-sm ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm text-gray-700">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-5 w-5 text-indigo-500" />
                                        <span className="text-base font-semibold text-gray-600">Course ID:</span>
                                        <span className="text-gray-800">{taskDetails.course_id}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-indigo-500" />
                                        <span className="text-base font-semibold text-gray-600">Created By:</span>
                                        <span className="text-gray-800">{taskDetails.created_by}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-indigo-500" />
                                        <span className="text-base font-semibold text-gray-600">Created At:</span>
                                        <span className="text-gray-800">{formattedDate}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="h-5 w-5 text-indigo-500" />
                                        <span className="text-base font-semibold text-gray-600">Task Status:</span>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={handleActiveChange}
                                            disabled={isStatusChanging}
                                            aria-label="Toggle task status"
                                            className={`transition-all duration-300 ${isActive
                                                    ? 'bg-green-500 data-[state=checked]:bg-green-500'
                                                    : 'bg-red-500 data-[state=unchecked]:bg-red-500'
                                                }`}
                                        />
                                        {isStatusChanging && <Skeleton className="h-4 w-12 ml-2" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {taskDetails.final_summary?.sentiment_data &&
                            taskDetails.final_summary.sentiment_data.length > 0 && (
                                <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="pb-2 border-b border-gray-100">
                                        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                            Sentiment Overview
                                        </CardTitle>
                                        <p className="text-sm text-gray-500">Visual breakdown of student sentiments</p>
                                    </CardHeader>

                                    <CardContent>
                                        <div>
                                            <CircularGroup sentimentData={taskDetails.final_summary.sentiment_data} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}



                        {taskDetails.final_summary ? (
                            <>
                                <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="pb-2 border-b border-gray-100">
                                        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">

                                            Final Summary
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="pt-0 space-y-5">
                                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                            <h4 className="text-sm text-yellow-800 font-medium">Average Rating</h4>
                                            <p className="text-3xl font-bold text-yellow-600 mt-1">
                                                {taskDetails.final_summary.average_rating ?? 'Not available'}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                                            <h4 className="text-sm text-gray-700 font-semibold">Summary</h4>
                                            <p className="text-base font-medium text-gray-800 leading-relaxed mt-1">
                                                {taskDetails.final_summary.message ?? 'No summary available yet.'}
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
                                        {(taskDetails.final_summary.insights ?? []).length > 0 ? (
                                            <ul className="space-y-4 pl-2">
                                                {taskDetails.final_summary.insights.map((insight, index) => (
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




                                <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="pb-2 border-b border-gray-100">
                                        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">

                                            Sentiment & Time-Series Graphs

                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {taskDetails.final_summary?.sentiment_data &&
                                            taskDetails.final_summary.sentiment_data.length > 0 ? (
                                            <>
                                                <div className="mb-4">
                                                    <SentimentBarChart data={taskDetails.final_summary.sentiment_data} />
                                                </div>
                                                <div className="mb-4">
                                                    <TimeSeriesLineChart data={taskDetails.final_summary.sentiment_data} />
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">No sentiment data available for visualization.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-xl">Feedback Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500">No feedback summaries have been added yet.</p>
                                </CardContent>
                            </Card>
                        )}

                        <Button
                            variant="outline"
                            className="mb-6 px-6 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 transition-all duration-200 rounded-lg shadow-sm"
                            onClick={() => setShowAllSummaries((prev) => !prev)}
                        >
                            {showAllSummaries ? "Hide" : "View"} All Feedback Summaries
                        </Button>

                        {/* Then modify the summaries section */}
                        <div className={showAllSummaries ? "block" : "hidden"}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Feedback Summaries</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {summaries.filter((item) => item?.summary?.message).length > 0 ? (
                                        <ul className="list-none list-inside">
                                            {summaries
                                                .filter((item) => item?.summary?.message)
                                                .map((item) => (
                                                    <li key={item._id || `summary-${Math.random()}`} className="mt-4 bg-gray-100 shadow-lg p-4 rounded-md flex flex-col gap-2">
                                                        <h4 className="text-lg font-semibold">
                                                            Rating: {item?.summary?.rating ?? 'N/A'}
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            Summary: {item?.summary?.message}
                                                        </p>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-500">No feedback summaries available yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <Alert>
                        <AlertTitle>No Data Available</AlertTitle>
                        <AlertDescription>
                            No task details were found for the provided ID.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>

    );
};

export default FeedbackTaskPage;