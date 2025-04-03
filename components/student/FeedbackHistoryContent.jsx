import { useEffect, useState } from "react";
import { BallTriangle, Bars } from "react-loader-spinner";

async function getUser() {
  try {
    let res = await fetch("/api/auth/me");
    res = await res.json();

    return {
      user: res.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error,
    };
  }
}

const FeedbackHistoryContent = () => {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("range");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const itemsPerPage = 6;

  const fetchFeedbackHistory = async () => {
    try {
      const user = await getUser();
      const response = await fetch(
        `/api/student/completedfeedbacks/${user.user.user.username}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback history");
      }

      const data = await response.json();
      setFeedbackHistory(data.feedbacks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const clearDateFilters = () => {
    setDateRange({ from: null, to: null });
    setSelectedDate(null);
  };

  const filteredFeedback = feedbackHistory.filter((item) => {
    const matchesSearch =
      item.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.for_course.toLowerCase().includes(searchQuery.toLowerCase());

    const itemDate = new Date(item.completedAt);

    let matchesDate = true;
    if (filterType === "range" && (dateRange.from || dateRange.to)) {
      matchesDate =
        (!dateRange.from || itemDate >= dateRange.from) &&
        (!dateRange.to || itemDate <= dateRange.to);
    } else if (filterType === "single" && selectedDate) {
      matchesDate = itemDate.toDateString() === selectedDate.toDateString();
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDateSelection = (date) => {
    if (filterType === "single") {
      setSelectedDate(date);
    } else {
      // Handle range selection
      if (!dateRange.from || (dateRange.from && dateRange.to)) {
        setDateRange({ from: date, to: null });
      } else {
        if (date < dateRange.from) {
          setDateRange({ from: date, to: dateRange.from });
        } else {
          setDateRange({ from: dateRange.from, to: date });
        }
      }
    }
  };

  // Simple DatePicker component
  const DatePicker = ({ onSelect, onClose, mode, selected }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (delta) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setViewDate(newDate);
    };

    const isSelected = (date) => {
      if (mode === "single" && selected) {
        return date.toDateString() === selected.toDateString();
      } else if (mode === "range") {
        return (
          (selected.from &&
            date.toDateString() === selected.from.toDateString()) ||
          (selected.to && date.toDateString() === selected.to.toDateString())
        );
      }
      return false;
    };

    const isInRange = (date) => {
      if (mode === "range" && selected.from && !selected.to && hoveredDate) {
        return (
          (date > selected.from && date < hoveredDate) ||
          (date < selected.from && date > hoveredDate)
        );
      } else if (mode === "range" && selected.from && selected.to) {
        return date > selected.from && date < selected.to;
      }
      return false;
    };

    const handleMouseEnter = (date) => {
      if (mode === "range" && selected.from && !selected.to) {
        setHoveredDate(date);
      }
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    // Previous month days
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div className="font-medium">
            {months[month]} {year}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="h-8 flex items-center justify-center">
              {date ? (
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                      ${
                        isSelected(date)
                          ? "bg-indigo-600 text-white"
                          : isInRange(date)
                          ? "bg-indigo-100 text-indigo-800"
                          : "hover:bg-gray-100"
                      }`}
                  onClick={() => onSelect(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span className="text-gray-300 text-sm">{""}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t pt-3">
          <button
            onClick={() => {
              clearDateFilters();
              onClose();
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-indigo-800 font-medium">
            Loading your feedback history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full px-2 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-indigo-800">
          Feedback History
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          Track your progress and review past feedback
        </p>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search feedbacks or courses..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    clearDateFilters();
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="single">Single Date</option>
                  <option value="range">Date Range</option>
                </select>

                <div className="relative">
                  <button
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-600"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {filterType === "range"
                      ? dateRange.from
                        ? `${dateRange.from.toLocaleDateString()} - ${
                            dateRange.to?.toLocaleDateString() || "..."
                          }`
                        : "Select dates"
                      : selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Pick a date"}
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-10">
                      <DatePicker
                        mode={filterType}
                        selected={
                          filterType === "range" ? dateRange : selectedDate
                        }
                        onSelect={handleDateSelection}
                        onClose={() => setIsDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                {(dateRange.from || selectedDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(dateRange.from || selectedDate) && (
              <div className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded-md inline-flex items-center max-w-max">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {filterType === "range"
                  ? `Showing results from ${dateRange.from?.toLocaleDateString()} to ${
                      dateRange.to?.toLocaleDateString() || "present"
                    }`
                  : `Showing results for ${selectedDate.toLocaleDateString()}`}
              </div>
            )}
          </div>

          {/* Feedback Items */}
          <div className="space-y-4">
            {paginatedFeedback.length > 0 ? (
              paginatedFeedback.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-indigo-100"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.task_title.charAt(0)}
                  </div>
                  <div className="flex-grow w-full">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {item.task_title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">
                            Course:
                          </span>{" "}
                          {item.for_course}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">
                            Instructor:
                          </span>{" "}
                          {item.faculty}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">
                            Completed:
                          </span>{" "}
                          {new Date(item.completedAt).toLocaleString(
                            undefined,
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </p>
                        <div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block">
                            {item.completed ? "Completed" : "Processing"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 space-y-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-gray-400"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p className="text-lg font-medium">No feedback found</p>
                  <p className="text-sm">
                    Try adjusting your search or date filters
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedFeedback.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>

              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackHistoryContent;
