import { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    Book,
    Calendar,
    ChevronRight,
    Users
} from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
        <Bars
          height="80"
          width="80"
          color="#7b61ff"
          ariaLabel="loading-indicator"
          wrapperClass="flex justify-center"
          visible={true}
        />
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
};


const DashboardContent = ({ userobj, loadingParent }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  // const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchFeedbackTasks = async () => {
      // if (isFirstRender.current) {
      //   isFirstRender.current = false;
      //   return;
      // }
      try {
        const response = await fetch(
          `/api/faculty/gettasks/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setFeedbackTasks(data);
          console.log("Fetched feedback tasks:", data);
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
  }, [userobj]);

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to your Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Here's an overview of your activities and updates
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          Feedback Tasks
        </h2>

        {feedbackTasks.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[500px] md:max-h-[600px] pr-1 sm:pr-2">
            {feedbackTasks.map((task, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-3 sm:space-y-4 w-full sm:w-auto">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pr-2">
                            {task.title}
                          </h3>
                          <div className="mt-2 space-y-1 sm:space-y-2">
                            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                              <Book className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">
                                Course ID: {task.course_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">
                                Created by: {task.created_by}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={task.active ? "success" : "destructive"}
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm ${
                            task.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {task.active ? "Active" : "Closed"}
                        </Badge>
                      </div>

                      <Button
                        onClick={() =>
                          window.open(
                            `${window.location.origin}/faculty/feedbacktask/${task._id}`,
                            "_blank"
                          )
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto mt-3 sm:mt-0 justify-center sm:justify-start"
                      >
                        View Feedback
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 sm:p-12 text-center text-gray-500">
              <p className="text-sm sm:text-base">
                No outstanding feedback tasks available at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default DashboardContent;
