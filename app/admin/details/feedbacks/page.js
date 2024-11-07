"use client";
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FeedbackDashboard = () => {
    const [feedbackTasks, setFeedbackTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);
    const [activeTab, setActiveTab] = useState('completed');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchFeedbackTasks();
    }, []);

    const fetchFeedbackTasks = async () => {
        try {
            const response = await fetch('/api/admin/feedbacktask/getalltasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            setFeedbackTasks(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchFeedbackDetails = async () => {
        setIsLoading(true);
        try {
            const courseId = feedbackTasks.find((task) => task._id === selectedTask).course_id;
            const response = await fetch('/api/admin/feedbacktask/getdetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedbacktaskId: selectedTask,
                    courseId: courseId, // Replace with the actual course ID
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch feedback details');
            }
            const data = await response.json();
            setFeedbackData(data);
        } catch (error) {
            console.error('Failed to fetch feedback details:', error);
        } finally {
            setIsLoading(false);
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
                        <CardTitle className='text-center text-2xl'>Feedback Dashboard</CardTitle>
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
                            <Button disabled={!selectedTask} onClick={handleViewDetails}>
                                {showDetails ? 'Hide Details' : 'View Details'}
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
                <Button disabled={!selectedTask} onClick={handleViewDetails}>
                    {showDetails ? 'Hide Details' : 'View Details'}
                </Button>
            </div>
            {showDetails && (
                <div className="flex flex-col items-center justify-start gap-4 w-[80%] border bg-white p-4 shadow-lg rounded-xl">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
                            Loading...
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                                <TabsTrigger value="notCompleted">Not Completed</TabsTrigger>
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
                                            {feedbackData.studentsWhoDidNotGiveFeedback.map((student) => (
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
                        </Tabs>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;