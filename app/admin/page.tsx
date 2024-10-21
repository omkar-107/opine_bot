"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


import * as XLSX from 'xlsx';

// import { DataGrid } from '@mui/x-data-grid';

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
// import { div } from "framer-motion/client";
// import { ClassNames } from "@emotion/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/* -------------------- Interfaces for Schema ------------------- */
interface Student {
  username: string;
  password: string;
  branch: string;
  year: number;
  student_courses: string[];
}

interface Faculty {
  id: string;
  username: string;
  password: string;
  department: string;
  faculty_courses: string[];
}

interface Course {
  id_: string;
  title: string;
  syllabus: string;
  faculty: string[];
  feedbacks: string[];
}


/* ------------------------ Dummy Data ------------------------ */
// var courses_array: Course[] = [
//   {
//     id: "CS101",
//     title: "Computer Science Basics",
//     syllabus: "Intro to CS",
//     faculty: ["dr_watson"],
//     feedbacks: [],
//   },
//   {
//     id: "EC201",
//     title: "Electronics I",
//     syllabus: "Basics of Electronics",
//     faculty: [],
//     feedbacks: [],
//   },
// ];

// var students_array: Student[] = [
//   {
//     id: "1",
//     username: "john_doe",
//     password: "pass123",
//     branch: "CSE",
//     year: 3,
//     student_courses: ["CS101"],
//   },
//   {
//     id: "2",
//     username: "jane_smith",
//     password: "pass123",
//     branch: "ECE",
//     year: 2,
//     student_courses: [],
//   },
// ];

// var faculties_array: Faculty[] = [
//   {
//     id: "1",
//     username: "dr_watson",
//     password: "pass123",
//     department: "CSE",
//     faculty_courses: ["CS101"],
//   },
//   {
//     id: "2",
//     username: "dr_smith",
//     password: "pass123",
//     department: "ECE",
//     faculty_courses: [],
//   },
// ];

var departments_array: string[] = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
];

// Data for the pie chart (students)
const pieData = {
  labels: ['Boys', 'Girls'],
  datasets: [
    {
      data: [205, 170],
      backgroundColor: ['#4c6ef5', '#be4bdb'],
      hoverBackgroundColor: ['#364fc7', '#9c36b5'],
    },
  ],
};

// Data for the bar chart (attendance)
const barData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Total Present',
      data: [75, 80, 55, 85, 60],
      backgroundColor: '#4c6ef5',
    },
    {
      label: 'Total Absent',
      data: [25, 20, 45, 15, 40],
      backgroundColor: '#be4bdb',
    },
  ],
};

/* -------------------------- Admin Component Starts from Here -------------------------*/

export default function page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('')


  const [newFaculty, setNewFaculty] = useState({
    username: "",
    password: "",
    department: "",
  });

  const [newCourse, setNewCourse] = useState({
    id_: "",
    title: "",
    syllabus: "",
  });

  const [newStudent, setNewStudent] = useState<Student>({
    username: "",
    password: "",
    branch: "",
    year: 1,
    student_courses: [],
  });

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [facultySearch, setFacultySearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [facultySuggestions, setFacultySuggestions] = useState<Faculty[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<Course[]>([]);
  const [logoutActive, setLogoutActive] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedTab, setSelectedTab] = useState<string>(""); // Specify state type
  const router = useRouter(); // Initialize useRouter
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);



  /* ------------------------- Handler Functions ------------------------- */

  {/* Function to Export Data to Excel */ }
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      students.map((student) => ({
        Username: student.username,
        Branch: student.branch,
        Year: student.year,
        Courses: student.student_courses.join(", "),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Export the file
    XLSX.writeFile(wb, "students_data.xlsx");
  };
  // 

  //@add-new-course
  const addCourse = async () => {
    //post request to backend for adding course
    const response = await fetch("/api/admin/course/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });
    console.log("Course added successfully", response);
    setNewCourse({ id_: "", title: "", syllabus: "" });

    if (response.ok) {
      fetchCourses(); //refresh courses
    } else {
      console.log("Failed to add course");
    }
  };

  //@add-new-faculty
  const addFaculty = async () => {
    const response = await fetch("/api/admin/faculty/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newFaculty),
    });
    console.log("Faculty added successfully", response);

    setNewFaculty({ username: "", password: "", department: "" });

    if (response.ok) {
      fetchFaculties(); //refresh faculties
    } else {
      console.log("Failed to add faculty");
    }
  };

  //@assign-course-to-faculty
  const assignCourseToFaculty = async () => {
    if (selectedFaculty && selectedCourse) {
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
        fetchFaculties();
      } else {
        console.log("Failed to assign course to faculty");
      }
      setSelectedFaculty(null);
      setSelectedCourse(null);
      setFacultySearch("");
      setCourseSearch("");
    }
  };

  //@add-new-student
  const addStudent = async () => {
    const response = await fetch("/api/admin/student/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });
    console.log("Student added successfully", response);
    if (response.ok) {
      fetchStudents(); //refresh students
    } else {
      console.log("Failed to add student");
    }
    setNewStudent({
      username: "",
      password: "",
      branch: "",
      year: 1,
      student_courses: [],
    });
  };



  /* ------------------------- UseEffect Functions ------------------------- */

  //get courses from backend and set it to courses state
  const fetchCourses = async () => {
    const response = await fetch("/api/admin/course/get");
    const courses_backend = await response.json();
    console.log(courses_backend);
    setCourses(courses_backend);
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  //get faculties from backend and set it to faculties state
  const fetchFaculties = async () => {
    const response = await fetch("/api/admin/faculty/get");
    const faculties_backend = await response.json();
    console.log(faculties_backend);
    setFaculties(faculties_backend);
  };
  useEffect(() => {
    fetchFaculties();
  }, []);

  //get students from backend and set it to students state
  const fetchStudents = async () => {
    const response = await fetch("/api/admin/student/getall");
    const students_backend = await response.json();
    console.log(students_backend);
    setStudents(students_backend);
  };
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filteredFaculty = faculties
      .filter(
        (faculty) =>
          faculty.username
            .toLowerCase()
            .includes(facultySearch.toLowerCase()) ||
          faculty.department.toLowerCase().includes(facultySearch.toLowerCase())
      )
      .slice(0, 5);
    setFacultySuggestions(filteredFaculty);
  }, [facultySearch, faculties]);

  useEffect(() => {
    const filteredCourses = courses
      .filter(
        (course) =>
          course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.id_.toLowerCase().includes(courseSearch.toLowerCase())
      )
      .slice(0, 5);
    setCourseSuggestions(filteredCourses);
  }, [courseSearch, courses]);





  const chartOptions = {
    responsive: true, // Ensure the chart is responsive
    maintainAspectRatio: false, // Allow resizing
  };



  const handleTabClick = (tabName: string) => { // Specify tabName type
    setSelectedTab(tabName);
    router.push(`/${tabName}`); // Navigate to the corresponding route
  };


  async function handleLogout() {
    setLogoutActive(false);
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/");
    } else {
      console.error("Failed to logout");
    }
  }

  const filteredStudents = students.filter((student) =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const deleteStudent = (username: string) => {
    setStudents(students.filter((student) => student.username !== username));
  };


  /* ------------------------- Dashboard Constants ------------------------- */

  const totalCourses = courses.length;
  const totalStudents = students.length;
  const totalFaculty = faculties.length;
  const totalEnrollments = students.reduce(
    (sum, student) => sum + student.student_courses.length,
    0
  );

  const DashboardContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="p-6 bg-gray-50 w-full h-full">
          {/* General Information Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoCard title="Total Courses" value={totalCourses} />
            <InfoCard title="Total Students" value={totalStudents} />
            <InfoCard title="Total Faculty" value={totalFaculty} />
            <InfoCard title="Total Enrollments" value={totalEnrollments} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            {/* Pie Chart (Students distribution) */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col" style={{ minHeight: '350px', width: '300px', height: '300px' }}>
              <h2 className="text-lg font-semibold mb-4 text-center">Students</h2>
              <div className="flex-grow w-full">
                <Pie data={pieData} />
              </div>
            </div>

            {/* Teacher List */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col" style={{ minHeight: '350px', width: '450px', height: '300px' }}>
              <h2 className="text-lg font-semibold mb-4 text-center">Teacher List</h2>
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Class</th>
                    <th className="px-4 py-2">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Morris Jhonson', class: 'Class 6', subject: 'English' },
                    { name: 'Jane Cooper', class: 'Class 5', subject: 'Music' },
                    { name: 'Esther Howard', class: 'Class 8', subject: 'Arts' },
                    { name: 'Wade Warren', class: 'Class 7', subject: 'Physics' },
                    { name: 'Jenny Wilson', class: 'Class 9', subject: 'Chemistry' },
                  ].map((teacher, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{teacher.name}</td>
                      <td className="border px-4 py-2">{teacher.class}</td>
                      <td className="border px-4 py-2">{teacher.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Bar Chart */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col col-span-2" style={{ minHeight: '350px' }}>
              <h2 className="text-lg font-semibold mb-4 text-center">Attendance</h2>
              <div className="flex-grow w-full">
                <Bar data={barData} />
              </div>
            </div>

          </div>
        </div>
   

    </div >
    //     </div >
    //   </div >

    // </div >
  );

  const StudentContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Student Management</h2>
     <div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Students</h1>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200 rounded-md px-4 py-2"
              onClick={() => setShowCreateStudentDialog(true)}
            >
              + Add Student
            </Button>
          </div>

          {/* Search Bar */}
          <Input
            placeholder="Search..."
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Student Table */}
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Username</th>
                <th className="border border-gray-300 p-2 text-left">Branch</th>
                <th className="border border-gray-300 p-2 text-left">Year</th>
                <th className="border border-gray-300 p-2 text-left">Courses</th>
                {/* <th className="border border-gray-300 p-2 text-left">A</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.username} className="border-t">
                  <td className="p-2">{student.username}</td>
                  <td className="p-2">{student.branch}</td>
                  <td className="p-2">{student.year}</td>
                  <td className="p-2">{student.student_courses.join(', ')}</td>
                  <td className="p-2">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteStudent(student.username)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Students */}
          <p className="text-gray-600">Total: {filteredStudents.length}</p>

          {/* Create Student Dialog */}
          {showCreateStudentDialog && (
            <Dialog open={showCreateStudentDialog} onOpenChange={setShowCreateStudentDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Add New Student</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Inputs for Adding Student */}
                  <Input
                    required
                    placeholder="Username"
                    className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={newStudent.username}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, username: e.target.value })
                    }
                  />
                  <Input
                    required
                    type="password"
                    placeholder="Password"
                    className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, password: e.target.value })
                    }
                  />
                  <Select
                    onValueChange={(value) =>
                      setNewStudent({ ...newStudent, branch: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments_array.map((dept, index) => (
                        <SelectItem key={index} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(value) =>
                      setNewStudent({ ...newStudent, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                    <SelectTrigger>
                      <SelectValue placeholder="Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id_} value={course.id_.toString()}>
                          {course.id_}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {newStudent.student_courses.length > 0 && (
                    <div className="gap-1">
                      <p className="font-semibold">Selected Courses:</p>
                      <ul className="flex flex-wrap gap-2">
                        {newStudent.student_courses.map((course) => (
                          <li key={course} className="bg-blue-200 text-blue-800 rounded-md p-1">
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={addStudent}
                    disabled={
                      !newStudent.username || !newStudent.password || !newStudent.branch || !newStudent.year
                    }
                    className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200 rounded-md p-2"
                  >
                    Add Student
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      
      </div>
    </div>
  );

  const FacultyContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Faculty Dashboard</h2>
        <Card>
          <CardHeader>
            <CardTitle>Faculty Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add New Faculty</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Faculty</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Username"
                      value={newFaculty.username}
                      onChange={(e) =>
                        setNewFaculty({
                          ...newFaculty,
                          username: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newFaculty.password}
                      onChange={(e) =>
                        setNewFaculty({
                          ...newFaculty,
                          password: e.target.value,
                        })
                      }
                    />

                    <Select
                      onValueChange={(value) =>
                        setNewFaculty({
                          ...newFaculty,
                          department: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments_array.map((dept, index) => (
                          <SelectItem key={index} value={dept.toString()}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={addFaculty}
                      disabled={
                        newFaculty.username === "" ||
                        newFaculty.password === "" ||
                        newFaculty.department === ""
                      }
                    >
                      Add Faculty
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-2">
                <Input
                  placeholder="Search Faculty"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                />
                {facultySuggestions.length > 0 && (
                  <ul className="bg-white border rounded-md shadow-sm">
                    {facultySuggestions.map((faculty) => (
                      <li
                        key={faculty.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedFaculty(faculty);
                          setFacultySearch(faculty.username);
                        }}
                      >
                        {faculty.username} - {faculty.department}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Search Course"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
                {courseSuggestions.length > 0 && (
                  <ul className="bg-white border rounded-md shadow-sm">
                    {courseSuggestions.map((course) => (
                      <li
                        key={course.id_}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedCourse(course);
                          setCourseSearch(course.title);
                        }}
                      >
                        {course.title} ({course.id_})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedCourse && selectedFaculty ? (
                <div className="flex gap-4">
                  <p>
                    <i>
                      <b>{selectedCourse.title}</b>
                    </i>{" "}
                    course is being assigned to the{" "}
                    <i>
                      <b>{selectedFaculty.username}</b>
                    </i>{" "}
                    faculty
                  </p>
                  <p
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedFaculty(null);
                      setSelectedCourse(null);
                      setFacultySearch("");
                      setCourseSearch("");
                    }}
                  >
                    <u>Click Here to Dismiss</u>
                  </p>
                </div>
              ) : null}
              <Button
                onClick={assignCourseToFaculty}
                disabled={!selectedFaculty || !selectedCourse}
              >
                Assign Course
              </Button>
              <div>
                <h3 className="text-lg font-semibold mb-2">Faculty List</h3>
                <ul className="space-y-2">
                  {faculties.map((faculty) => (
                    <li key={faculty.id} className="bg-gray-100 p-2 rounded">
                      <span className="font-medium">{faculty.username}</span>{" "}
                      ({faculty.department}) - Courses:{" "}
                      {faculty.faculty_courses.join(", ") || "None"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      
    </div>
  );

  const CourseContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Dashboard</h2>
     
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add course form */}
              <div className="flex space-y-4 flex-col">
                <Input
                  placeholder="Course ID"
                  value={newCourse.id_}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, id_: e.target.value })
                  }
                  className="mb-2 w-1/2"
                />
                <Input
                  placeholder="Course Title"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="mb-2 w-1/2"
                />
                <Textarea
                  placeholder="Enter Syllabus Text"
                  value={newCourse.syllabus}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, syllabus: e.target.value })
                  }
                  className="mb-2 w-1/2"
                />
                <div className="flex items-center gap-4 w-1/2">
                  <Label htmlFor="context">Context</Label>
                  <Input id="context" type="file" />
                </div>
                <Button
                  onClick={addCourse}
                  className="w-1/4"
                  disabled={
                    !newCourse.id_ || !newCourse.title || !newCourse.syllabus
                  }
                >
                  Add Course
                  
                </Button>
              </div>

              {/* List of courses in table format */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Existing Courses</h3>
                <table className="min-w-full table-auto bg-white rounded-md shadow-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Course ID</th>
                      <th className="px-4 py-2">Course Title</th>
                      <th className="px-4 py-2">Syllabus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id_} className="border-b">
                        <td className="px-4 py-2">{course.id_}</td>
                        <td className="px-4 py-2">{course.title}</td>
                        <td className="px-4 py-2">{course.syllabus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
   
    </div>
  );

  const tabs = [
    {
      name: "Dashboard",
      component: <DashboardContent />
    },
    {
      name: "Courses",
      component: <CourseContent />
    },
    {
      name: "Faculty",
      component: <FacultyContent />
    },
    {
      name: "Students",
      component: <StudentContent />
    },
  ];


  return (
    <div className="flex h-screen">
    {/* Sidebar */}
    <div className="w-64 bg-[#14171f] text-white flex flex-col justify-between items-center fixed h-full">
      <div className="flex flex-col justify-center gap-2">
        <h2 className="text-2xl font-bold p-4">Admin Dashboard</h2>
        <div className="flex flex-col justify-center items-center mt-2 mb-8">
          <div className="h-[1px] w-[90%] bg-white mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          {/* <h3>{userobj ? userobj.username : USERNAME}</h3> */}
          {/* <h5>Student</h5> */}
          <div className="h-[0.5px] w-[90%] bg-white mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </div>
        <nav className="flex flex-col justify-center items-center">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center w-[80%] text-left px-2 py-2 my-2 ${
                activeTab === tab.name
                  ? "border-2 border-[#7b61ff] rounded-2xl"
                  : ""
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        disabled={!logoutActive}
        className="flex items-center w-[70%] justify-center rounded-md bg-[#7b61ff] text-left px-2 py-2 my-2"
      >
        <p className="mr-2">Logout</p>
      </button>
    </div>
  
    {/* Content Area */}
    <div className="flex-1 p-8 ml-64 overflow-auto">
      {activeTab === "Dashboard" ? (
        <DashboardContent />
      ) : activeTab === "Faculty" ? (
        <FacultyContent />
      ) : activeTab === "Courses" ? (
        <CourseContent />
      ) : activeTab === "Students" ? (
        <StudentContent />
      ) : null}
    </div>
  </div>
  );  
}


interface InfoCardProps {
  title: string;
  value: string | number;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => (

  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);
