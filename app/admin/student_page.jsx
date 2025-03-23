import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, X, Search, BookOpen, GraduationCap, School, Menu } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert_dialog";
import { useToast } from "@/components/ui/use-toaster";

const ENGINEERING_BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
];

const StudentContent = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    email: "",
    username: "",
    password: "",
    branch: "",
    year: 1,
    student_courses: [],
    semester: 1,
  });
  
  // New state for course dialog
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [selectedStudentCourses, setSelectedStudentCourses] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/student/getall");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again later.",
        variant: "destructive",
      });
      console.error("Error fetching students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/course/get");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again later.",
        variant: "destructive",
      });
      console.error("Error fetching courses:", error);
    }
  };

  const deleteStudent = async (username) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/student/delete/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      await fetchStudents();

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      setShowDeleteDialog(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async () => {
    setIsLoading(true);
    try {
      if (
        !newStudent.email ||
        !newStudent.username ||
        !newStudent.password ||
        !newStudent.branch ||
        !newStudent.year ||
        !newStudent.semester
      ) {
        throw new Error("Please fill in all required fields");
      }

      const studentData = {
        email: newStudent.email,
        username: newStudent.username,
        password: newStudent.password,
        branch: newStudent.branch,
        year: parseInt(newStudent.year),
        student_courses: newStudent.student_courses,
        semester: parseInt(newStudent.semester),
      };

      const response = await fetch("/api/admin/student/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add student");
      }

      await fetchStudents();

      setShowCreateStudentDialog(false);
      setNewStudent({
        email: "",
        username: "",
        password: "",
        branch: "",
        year: 1,
        student_courses: [],
        semester: 1,
      });

      toast({
        title: "Success",
        description: "Student added successfully",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle showing all courses
  const handleShowAllCourses = (student) => {
    setSelectedStudentCourses(student.student_courses || []);
    setSelectedStudentName(student.username);
    setShowCoursesDialog(true);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white rounded-xl sm:rounded-2xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 md:p-3 rounded-lg md:rounded-xl">
                <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="text-gray-500 text-sm md:text-base">Manage and track student records</p>
              </div>
            </div>
            <button 
              className="md:hidden bg-gray-100 p-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          <div className={`flex flex-col w-full md:w-auto md:flex-row items-center gap-3 md:gap-4 ${mobileMenuOpen ? 'mt-4' : 'hidden md:flex'}`}>
            <div className="relative w-full">
              <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-9 md:pl-10 w-full md:w-64 lg:w-80 border-2 focus:border-blue-500 rounded-lg md:rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 transition-all duration-200 text-sm md:text-base flex-1 md:flex-auto"
                onClick={() => setShowCreateStudentDialog(true)}
                disabled={isLoading}
              >
                <span className="mr-1 md:mr-2">+</span> Add Student
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 transition-all duration-200 text-sm md:text-base flex-1 md:flex-auto"
                onClick={() =>
                  window.open(
                    `${window.location.origin}/admin/add/students`,
                    "_blank"
                  )
                }
                disabled={isLoading}
              >
                <span className="mr-1 md:mr-2">+</span> Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6">
          <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-blue-100 p-2 md:p-3 rounded-lg md:rounded-xl">
                <User className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm md:text-base">Total Students</p>
                <p className="text-lg md:text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-indigo-100 p-2 md:p-3 rounded-lg md:rounded-xl">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm md:text-base">Total Courses</p>
                <p className="text-lg md:text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-purple-100 p-2 md:p-3 rounded-lg md:rounded-xl">
                <School className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm md:text-base">Departments</p>
                <p className="text-lg md:text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 md:py-16">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
                  <p className="text-gray-500 text-base md:text-lg">No students found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                      <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.username} className="hover:bg-gray-50">
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900">{student.username}</div>
                              <div className="text-xs md:text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-900">{student.branch}</div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-900">Year {student.year}</div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-900">Sem {student.semester}</div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.student_courses?.length > 0 ? 
                              student.student_courses.slice(0, 2).map((course) => (
                                <span
                                  key={course}
                                  className="bg-blue-50 text-blue-700 px-1 md:px-2 py-1 rounded-md md:rounded-lg text-xs font-medium"
                                >
                                  {course}
                                </span>
                              )) : 
                              <span className="text-xs md:text-sm text-gray-500">No courses</span>
                            }
                            {student.student_courses?.length > 2 && (
                              <button
                                onClick={() => handleShowAllCourses(student)}
                                className="bg-gray-50 text-gray-700 px-1 md:px-2 py-1 rounded-md md:rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                              >
                                {/* +{student.student_courses.length - 2} */}
                                ...
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            disabled={isLoading}
                          >
                            <X size={16} className="md:w-5 md:h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Student Dialog */}
      <Dialog
        open={showCreateStudentDialog}
        onOpenChange={setShowCreateStudentDialog}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl md:rounded-2xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <DialogTitle className="text-lg md:text-xl font-semibold text-white">
              Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            <div className="space-y-3 md:space-y-4">
              <Input
                required
                placeholder="Email"
                className="rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
              />
              <Input
                required
                placeholder="Username"
                className="rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm"
                value={newStudent.username}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, username: e.target.value })
                }
              />
              <Input
                required
                type="password"
                placeholder="Password"
                className="rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm"
                value={newStudent.password}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, password: e.target.value })
                }
              />

              <Select
                value={newStudent.branch}
                onValueChange={(value) =>
                  setNewStudent({ ...newStudent, branch: value })
                }
              >
                <SelectTrigger className="w-full rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERING_BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch} className="text-sm">
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={newStudent.year.toString()}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, year: parseInt(value) })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-sm">
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={newStudent.semester.toString()}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, semester: parseInt(value) })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()} className="text-sm">
                        Sem {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select
                onValueChange={(value) => {
                  if (!newStudent.student_courses.includes(value)) {
                    setNewStudent({
                      ...newStudent,
                      student_courses: [...newStudent.student_courses, value],
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-lg md:rounded-xl border-2 focus:border-blue-500 text-sm">
                  <SelectValue placeholder="Select Courses" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id_} value={course.id_} className="text-sm">
                      {course.id_}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {newStudent.student_courses.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700 text-sm">Selected Courses:</p>
                  <div className="flex flex-wrap gap-2">
                    {newStudent.student_courses.map((course) => (
                      <span
                        key={course}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        {course}
                        <button
                          onClick={() =>
                            setNewStudent({
                              ...newStudent,
                              student_courses:
                                newStudent.student_courses.filter(
                                  (c) => c !== course
                                ),
                            })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={addStudent}
              disabled={
                isLoading ||
                !newStudent.email ||
                !newStudent.username ||
                !newStudent.password ||
                !newStudent.branch ||
                !newStudent.year ||
                !newStudent.semester
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl py-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm md:text-base"
            >
              {isLoading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl md:rounded-2xl p-0 overflow-hidden w-[95vw] sm:w-auto">
          <AlertDialogHeader className="p-4 md:p-6 bg-red-50">
            <AlertDialogTitle className="text-lg md:text-xl font-semibold text-red-600">
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm md:text-base">
              Are you sure you want to delete {studentToDelete?.username}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-4 md:p-6 flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
              className="rounded-lg md:rounded-xl w-full sm:w-auto text-sm md:text-base mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-lg md:rounded-xl w-full sm:w-auto text-sm md:text-base"
              onClick={() => {
                if (studentToDelete?.username) {
                  deleteStudent(studentToDelete.username);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* All Courses Dialog */}
      <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl md:rounded-2xl w-[95vw] sm:w-auto">
          <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <DialogTitle className="text-lg md:text-xl font-semibold text-white">
              {selectedStudentName}'s Courses
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-6">
            {selectedStudentCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No courses assigned</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedStudentCourses.map((course) => (
                  <div
                    key={course}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between"
                  >
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => setShowCoursesDialog(false)}
              className="w-full mt-4 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg md:rounded-xl py-2 transition-all duration-200 text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentContent;