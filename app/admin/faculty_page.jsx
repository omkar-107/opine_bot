import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Search,
  UserCircle2,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  School,
  Menu,
} from "lucide-react";

const ENGINEERING_BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
];

const FacultyDashboard = () => {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFaculty, setNewFaculty] = useState({
    username: "",
    password: "",
    department: "",
  });
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddFacultyDialogOpen, setIsAddFacultyDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/course/get");
      const courses_backend = await response.json();
      console.log("Fetched courses:", courses_backend);
      setCourses(courses_backend);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  // Fetch faculties from backend
  const fetchFaculties = async () => {
    try {
      const response = await fetch("/api/admin/faculty/get");
      const faculties_backend = await response.json();
      console.log("Fetched faculties:", faculties_backend);
      setFaculties(faculties_backend);
    } catch (error) {
      console.error("Failed to fetch faculties:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  // Add new faculty
  const handleAddFaculty = async () => {
    try {
      const response = await fetch("/api/admin/faculty/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFaculty),
      });

      if (response.ok) {
        console.log("Faculty added successfully");
        fetchFaculties(); // Refresh faculty list
        setNewFaculty({ username: "", password: "", department: "" });
        setIsAddFacultyDialogOpen(false);
      } else {
        console.log("Failed to add faculty");
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
    }
  };

  // Assign course to faculty
  const handleAssignCourse = async () => {
    if (selectedFaculty && selectedCourse) {
      try {
        const response = await fetch("/api/admin/course/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseid_: selectedCourse.id_,
            facultyId: selectedFaculty.username,
          }),
        });

        if (response.ok) {
          console.log("Course assigned successfully");
          fetchFaculties(); // Refresh faculty list
          setSelectedFaculty(null);
          setSelectedCourse(null);
          setIsAssignDialogOpen(false);
        } else {
          console.log("Failed to assign course to faculty");
        }
      } catch (error) {
        console.error("Error assigning course:", error);
      }
    }
  };

  const filteredFaculties = faculties.filter(
    (faculty) =>
      faculty.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faculty.faculty_courses || []).some((course) =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 md:gap-0">
            <div className="flex gap-3 md:gap-4 items-center">
              <div className="bg-blue-600 p-3 md:p-4 rounded-xl">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Faculty Management
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Oversee and manage faculty members and course assignments
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 md:gap-6 w-full md:w-auto">
              <div className="bg-blue-50 rounded-xl p-3 md:p-4 flex-1 md:flex-auto">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Faculty</p>
                    <p className="text-lg md:text-xl font-bold text-blue-600">
                      {faculties.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 md:p-4 flex-1 md:flex-auto">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Courses</p>
                    <p className="text-lg md:text-xl font-bold text-indigo-600">
                      {courses.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Add Section */}
          <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              <Input
                className="pl-10 md:pl-12 h-10 md:h-12 text-base md:text-lg rounded-xl border-2 focus:border-blue-500"
                placeholder="Search by name, department, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog
              open={isAddFacultyDialogOpen}
              onOpenChange={setIsAddFacultyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="h-10 md:h-12 px-4 md:px-6 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 whitespace-nowrap">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Add New Faculty</span>
                  <span className="md:hidden">Add Faculty</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl mx-4 md:mx-0">
                <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <DialogTitle className="text-lg md:text-xl font-semibold text-white">
                    Add New Faculty
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <Input
                    placeholder="Username"
                    className="rounded-xl border-2 focus:border-blue-500"
                    value={newFaculty.username}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, username: e.target.value })
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="rounded-xl border-2 focus:border-blue-500"
                    value={newFaculty.password}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, password: e.target.value })
                    }
                  />
                  <Select
                    onValueChange={(value) =>
                      setNewFaculty({ ...newFaculty, department: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-2 focus:border-blue-500">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGINEERING_BRANCHES.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddFaculty}
                    disabled={
                      !newFaculty.username ||
                      !newFaculty.department ||
                      !newFaculty.password
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-2 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Add Faculty
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Faculty List */}
        <Card className="rounded-2xl shadow-lg overflow-hidden border-0">
          <CardContent className="p-0">
            {/* Header - hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-600">
              <div className="col-span-2">FACULTY MEMBER</div>
              <div>DEPARTMENT</div>
              <div className="col-span-2">COURSES</div>
              <div className="text-right">ACTIONS</div>
            </div>

            <div className="divide-y">
              {filteredFaculties.map((faculty) => (
                <div
                  key={faculty.username}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 p-4 items-center hover:bg-blue-50 transition-colors duration-200"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <UserCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {faculty.username}
                          </div>
                          {faculty.email && (
                            <div className="text-sm text-gray-500">
                              {faculty.email}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Dialog
                        open={
                          isAssignDialogOpen &&
                          selectedFaculty?.username === faculty.username
                        }
                        onOpenChange={(open) => {
                          setIsAssignDialogOpen(open);
                          if (!open) setSelectedCourse(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-2 h-8"
                            onClick={() => setSelectedFaculty(faculty)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl mx-4 md:mx-0">
                          <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <DialogTitle className="text-lg md:text-xl font-semibold text-white">
                              Assign Course to {faculty.username}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                            <Select
                              onValueChange={(value) => {
                                const course = courses.find(
                                  (c) => c.id_ === value
                                );
                                setSelectedCourse(course);
                              }}
                            >
                              <SelectTrigger className="rounded-xl border-2 focus:border-blue-500">
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                              <SelectContent>
                                {courses
                                  .filter(
                                    (course) =>
                                      !(faculty.faculty_courses || []).includes(
                                        course.id_
                                      )
                                  )
                                  .map((course) => (
                                    <SelectItem
                                      key={course.id_}
                                      value={course.id_}
                                    >
                                      {course.id_} - {course.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleAssignCourse}
                              disabled={!selectedCourse}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-2 hover:from-blue-700 hover:to-indigo-700"
                            >
                              Assign Course
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{faculty.department}</span>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">COURSES:</div>
                      <div className="flex flex-wrap gap-2">
                        {(faculty.faculty_courses || []).length > 0 ? (
                          (faculty.faculty_courses || []).map((course) => (
                            <span
                              key={course}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <School className="w-3 h-3" />
                              {course}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No courses assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:block md:col-span-2 md:flex md:items-center md:gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <UserCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {faculty.username}
                      </div>
                      {faculty.email && (
                        <div className="text-sm text-gray-500">
                          {faculty.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex md:items-center md:gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{faculty.department}</span>
                  </div>
                  <div className="hidden md:block md:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {(faculty.faculty_courses || []).length > 0 ? (
                        (faculty.faculty_courses || []).map((course) => (
                          <span
                            key={course}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            <School className="w-4 h-4" />
                            {course}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No courses assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex md:justify-end">
                    <Dialog
                      open={
                        isAssignDialogOpen &&
                        selectedFaculty?.username === faculty.username
                      }
                      onOpenChange={(open) => {
                        setIsAssignDialogOpen(open);
                        if (!open) setSelectedCourse(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => setSelectedFaculty(faculty)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
                        <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                          <DialogTitle className="text-xl font-semibold text-white">
                            Assign Course to {faculty.username}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                          <Select
                            onValueChange={(value) => {
                              const course = courses.find(
                                (c) => c.id_ === value
                              );
                              setSelectedCourse(course);
                            }}
                          >
                            <SelectTrigger className="rounded-xl border-2 focus:border-blue-500">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses
                                .filter(
                                  (course) =>
                                    !(faculty.faculty_courses || []).includes(
                                      course.id_
                                    )
                                )
                                .map((course) => (
                                  <SelectItem
                                    key={course.id_}
                                    value={course.id_}
                                  >
                                    {course.id_} - {course.title}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleAssignCourse}
                            disabled={!selectedCourse}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-2 hover:from-blue-700 hover:to-indigo-700"
                          >
                            Assign Course
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {filteredFaculties.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No faculty members found matching your search criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;