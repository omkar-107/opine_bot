"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InfinitySpin } from 'react-loader-spinner'

const FeedbackTaskPage = () => {
    const { taskid } = useParams();
    const [taskDetails, setTaskDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Fetch task details from backend using taskid
        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(`/api/faculty/gettaskdetails/${taskid}`);
                if (response.ok) {
                    const data = await response.json();
                    setTaskDetails(data);
                    setIsActive(data.active);
                } else {
                    console.error("Error fetching task details:", response.statusText);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [taskid]);

    const handleActiveChange = async () => {
        // Toggle active status and update backend if needed
        try {
            const newActiveStatus = !isActive;
            // Update on the server
            const response = await fetch(`/api/faculty/updatetaskstatus/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskid, status: newActiveStatus })
            });

            if (response.ok) {
                setIsActive(newActiveStatus); // Update local state if successful
            } else {
                console.error("Error updating active status:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (loading) {
        return <div className='w-full h-lvh flex flex-col justify-center items-center gap-4'>
            <InfinitySpin
                visible={true}
                width="200"
                color="#4fa94d"
                ariaLabel="infinity-spin-loading"
            />
            <p>Loading task details...</p>
        </div>;
    }

    if (!taskDetails) {
        return <div>Task not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Feedback Task Details</h1>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">{taskDetails.title}</h2>
                <div className="mb-2">
                    <strong>Course ID:</strong> {taskDetails.course_id}
                </div>
                <div className="mb-2">
                    <strong>Created By:</strong> {taskDetails.created_by}
                </div>
                <div className="mb-2 flex items-center">
                    <strong className="mr-2">Active:</strong>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => { handleActiveChange(); alert('state changed') }}
                        className="h-4 w-4"
                    />
                </div>
                <div className="mb-2">
                    <strong>Created At:</strong> {new Date(taskDetails.createdAt).toLocaleString()}
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Feedbacks</h3>
                    {taskDetails.feedbacks.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {taskDetails.feedbacks.map((feedback, index) => (
                                <li key={index} className="ml-4">{feedback}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No feedbacks available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackTaskPage;
