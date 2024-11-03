"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch, Skeleton } from "@/components/ui/body";
import { Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast"; 

const FeedbackTaskPage = () => {
    const { taskid } = useParams();
    const [taskDetails, setTaskDetails] = useState(null);
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [isStatusChanging, setIsStatusChanging] = useState(false);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(`/api/faculty/gettaskdetails/${taskid}`);
                const summaries = await fetch(`/api/faculty/getsummary/${taskid}`);
                if (response.ok) {
                    const data = await response.json();
                    setTaskDetails(data);
                    setIsActive(data.active);
                    const summariesData = await summaries.json();
                    setSummaries(summariesData);
                } else {
                    throw new Error("Failed to fetch task details");
                }
            } catch (error) {
                console.error("Error:", error);
                toast({
                    title: "Error",
                    description: "Failed to load task details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [taskid]);

    const handleActiveChange = async () => {
        if (isStatusChanging) return;

        setIsStatusChanging(true);
        try {
            const newActiveStatus = !isActive;
            const response = await fetch(`/api/faculty/updatetaskstatus/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskid, status: newActiveStatus })
            });

            if (response.ok) {
                setIsActive(newActiveStatus);
                
                toast({
                    title: "Task Status Updated",
                    description: `Task is now ${newActiveStatus ? 'Active' : 'Inactive'}`,
                    variant: "success"
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update task status");
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            
            toast({
                title: "Error",
                description: error.message || "Failed to update task status",
                variant: "destructive"
            });

            setIsActive(isActive);
        } finally {
            setIsStatusChanging(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-4">
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
        );
    }

    if (!taskDetails) {
        return (
            <Alert variant="destructive" className="m-6">
                <AlertDescription>
                    Task not found. Please check the task ID and try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Feedback Task Details</h1>
                <p className="text-gray-500 mt-2">View and manage feedback task information</p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{taskDetails.title}</CardTitle>
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Course ID:</span>
                            <span>{taskDetails.course_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Created By:</span>
                            <span>{taskDetails.created_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Created At:</span>
                            <span>{new Date(taskDetails.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Task Status:</span>
                            <Switch
                                checked={isActive}
                                onCheckedChange={handleActiveChange}
                                disabled={isStatusChanging}
                                aria-label="Toggle task status"
                                className={`
                                    ${isActive 
                                        ? 'bg-green-500 data-[state=checked]:bg-green-500' 
                                        : 'bg-red-500 data-[state=unchecked]:bg-red-500'}
                                `}
                            />
                            {isStatusChanging && (
                                <Skeleton className="h-4 w-12 ml-2" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <CardTitle>Feedback Summaries</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {summaries.length > 0 ? (
                        <ul className="list-none list-inside">
                            {summaries.map((item) => (
                                <li key={item._id}
                                    className="mt-4 bg-gray-100 shadow-lg p-4 rounded-md flex flex-col gap-2">
                                    <h4 className="text-lg font-semibold">Rating: {item.summary.rating}</h4>
                                    <p className="text-gray-600">Summary: {item.summary.message}</p>
                                </li>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No feedback summaries available yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FeedbackTaskPage;