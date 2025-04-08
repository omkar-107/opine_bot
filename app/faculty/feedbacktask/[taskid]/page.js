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
import { useRouter } from 'next/navigation';
import { RefreshCcw } from "lucide-react";
import { MutatingDots } from 'react-loader-spinner';


const Toaster = dynamic(
    () => import('@/components/ui/toaster').then(mod => mod.Toaster),
    { ssr: false }
);

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="h-64 w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
                {/* <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> */}
                <MutatingDots
                    visible={true}
                    height="100"
                    width="100"
                    color="#1d4ed8"
                    secondaryColor="#1d4ed8"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
};

const FeedbackTaskPage = () => {
    const { taskid } = useParams();
    const router = useRouter();

    const [taskDetails, setTaskDetails] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [summaries, setSummaries] = useState([]);
    const [showAllSummaries, setShowAllSummaries] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);


    const fetchTaskData = async () => {
        if (!taskid) {
            setError("No task ID provided");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/faculty/gettaskdetails/${taskid}`);
            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format from server");
            }

            const responseData = await response.json();

            if (!responseData) {
                throw new Error("No task data received");
            }

            setTaskDetails(responseData);
            setIsActive(responseData.active);

            // Summaries
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
            console.error("Error in fetchTaskData:", error);
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


    useEffect(() => {
        fetchTaskData();
    }, [taskid]);

    useEffect(() => {
        if (taskDetails?.createdAt) {
            setFormattedDate(new Date(taskDetails.createdAt).toLocaleString());
        }
    }, [taskDetails]);

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

    const handleGenerateSummary = async () => {
        console.log("Starting summary regeneration");
        setLoading(true);
        const token = await getAuthToken();

        try {
            // First try the API call
            const baseurl = process.env.NEXT_PUBLIC_BACKEND;
            const response = await fetch(`${baseurl}/api/summarize-feedbacks/${taskid}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "Access-Control-Allow-Origin": "*",
                    },
                    credentials: "include",
                }
            );

            console.log("API response received");

            // Try to parse the JSON only if the response is OK
            if (response.ok) {
                const data = await response.json();
                console.log("API data:", data);
            }

            // Show success toast regardless
            console.log("Showing success toast");
            toast({
                title: 'Success',
                description: 'Regenerating summary and refreshing...',
            });

            await fetchTaskData();

        } catch (error) {
            // Log the error but continue with the page reload
            console.error("Error in API call:", error);
            // Still show a toast to inform the user

            toast({
                title: 'Note',
                description: 'Refreshing page to get latest data...',
            });
        } finally {

            console.log("About to reload the page");
            setLoading(false);
        }
    };

    const handleActiveChange = async () => {
        if (isStatusChanging) return;

        setIsStatusChanging(true);
        try {
            const newActiveStatus = !isActive;
            const response = await fetch('/api/faculty/updatetaskstatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskid, status: newActiveStatus }),
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
            setIsActive(isActive); // rollback
        } finally {
            setIsStatusChanging(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <LoadingSpinner message="Hey hold on please..." />
            </div>
        );
    }

    return (
        <>
            <Toaster />
            <div className="flex justify-end mb-4">
            </div>

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

                        {taskDetails?.final_summary?.sentiment_data &&
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



                        {taskDetails?.final_summary ? (
                            <>
                                <Card className="mb-6 bg-white shadow-lg border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="pb-2 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                                Final Summary
                                            </CardTitle>
                                            <Button
                                                onClick={handleGenerateSummary}
                                                disabled={loading}
                                                className={`group flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300
    border-2 border-gray-900 bg-transparent
    ${loading
                                                        ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                                                        : 'border-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110'}
  `}
                                            >
                                                <RefreshCcw className={`w-4 h-4 ${loading ? '' : 'text-purple-600 group-hover:brightness-110'} transition-transform duration-300 group-hover:rotate-90`} />
                                                {loading ? "Regenerating..." : "Regenerate"}
                                            </Button>

                                        </div>
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
                                    <div className='flex flex-wrap items-center justify-center gap-4'>
                                        <p className="text-gray-500">No feedback summaries have been added yet.</p>
                                        <Button
                                            onClick={handleGenerateSummary}
                                            disabled={loading}
                                            className={`group flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 border-2 border-gray-900 bg-transparent
    ${loading
                                                    ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                                                    : 'border-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110'}
  `}
                                        >
                                            <RefreshCcw className={`w-4 h-4 ${loading ? '' : 'text-purple-600 group-hover:brightness-110'} transition-transform duration-300 group-hover:rotate-90`} />
                                            {loading ? "Regenerating..." : "Regenerate"}
                                        </Button>
                                    </div>
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