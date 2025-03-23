import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { BallTriangle, Bars } from "react-loader-spinner";

const LoadingSpinner = ({ type = "bars", message = "Loading..." }) => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {type === "bars" ? (
          <Bars
            height="80"
            width="80"
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        ) : (
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const DashboardContent = ({ userobj }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchFeedbackTasks = async () => {
      try {
        const response = await fetch(
          `/api/student/gettasks/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setFeedbackTasks(data);
        } else {
          console.error("Error fetching feedback tasks:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackTasks();
  }, [userobj.username]);

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  const handleFeedbackButton = async ({ _id, course_id, created_by }) => {
    const response = await fetch(`/api/student/myfeedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: _id,
        given_by: userobj.username,
        for_course: course_id,
        faculty: created_by,
      }),
    });
    const data = await response.json();
    console.log(data.feedbackId);

    if (response.ok) {
      window.open(
        `${window.location.origin}/chat/` + data.feedbackId,
        "_blank"
      );
    } else {
      alert("Error opening feedback page. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-xl p-4 md:p-8 mb-4 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="mt-2 md:mt-4 text-gray-600 text-sm sm:text-base md:text-lg">
            Welcome to your dashboard! Here, you will see an overview of your
            activities and updates.
          </p>
        </div>

        <div className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-xl p-4 md:p-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-6">
            Outstanding Feedbacks
          </h3>

          {feedbackTasks.length > 0 ? (
            <div className="space-y-3 md:space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[40vh] md:max-h-[30rem] pr-1 md:pr-2">
              {feedbackTasks.map((task, index) => (
                <Card
                  key={index}
                  className={`transform transition-all duration-300 ease-in-out ${
                    hoveredCard === index ? "scale-[1.02]" : ""
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                            {task.title}
                          </h4>
                          {task.active ? (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="mt-1 md:mt-2 space-y-1">
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            Course ID:{" "}
                            <span className="font-semibold">
                              {task.course_id}
                            </span>
                          </p>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            Created by:{" "}
                            <span className="font-semibold">
                              {task.created_by}
                            </span>
                          </p>
                        </div>

                        <div className="mt-2 md:mt-3">
                          <span
                            className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                              task.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {task.active ? "Active" : "Closed"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (task.active) {
                            handleFeedbackButton({
                              _id: task._id,
                              course_id: task.course_id,
                              created_by: task.created_by,
                            });
                          }
                        }}
                        className={`mt-2 sm:mt-0 w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 md:py-3 rounded-md md:rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
                          task.active
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {task.active ? "Complete feedback" : "View feedback"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-12">
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                No outstanding feedback tasks available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
