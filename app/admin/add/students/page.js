"use client";
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { AlertCircle, CheckCircle, Clock, Loader2, Upload, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    UPLOADED: 'uploaded',
    FAILED: 'failed'
};

const Page = () => {
    const [students, setStudents] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const storedStudents = sessionStorage.getItem('uploadedStudents');
        if (storedStudents) {
            try {
                setStudents(JSON.parse(storedStudents));
            } catch (error) {
                console.error('Error parsing stored students:', error);
                sessionStorage.removeItem('uploadedStudents');
            }
        }
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            sessionStorage.setItem('uploadedStudents', JSON.stringify(students));
        }
    }, [students]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            const studentsWithStatus = jsonData.map(student => ({
                ...student,
                uploadStatus: STATUS.PENDING
            }));
            setStudents(studentsWithStatus);
            sessionStorage.setItem('uploadedStudents', JSON.stringify(studentsWithStatus));
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const uploadStudent = async (student) => {
        try {
            const data = {
                email: student.Email,
                username: String(student.Username),
                password: String(student.Password),
                branch: student.Branch,
                year: student.Year,
                student_courses: [],
                semester: student.Semester
            }
            const response = await fetch('/api/admin/student/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Send the data
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error uploading student:', error);
            return false;
        }
    };

    const updateStudentStatus = (index, status) => {
        setStudents(prevStudents => {
            const updatedStudents = [...prevStudents];
            updatedStudents[index] = {
                ...updatedStudents[index],
                uploadStatus: status
            };
            return updatedStudents;
        });
    };

    const handleSubmit = async () => {
        setIsUploading(true);
        const pendingStudents = students.filter(
            student => student.uploadStatus === STATUS.PENDING ||
                student.uploadStatus === STATUS.FAILED
        );

        let processed = 0;

        for (let i = 0; i < students.length; i++) {
            if (students[i].uploadStatus === STATUS.UPLOADED) {
                continue; // Skip already uploaded students
            }

            updateStudentStatus(i, STATUS.PROCESSING);

            const success = await uploadStudent(students[i]);
            updateStudentStatus(i, success ? STATUS.UPLOADED : STATUS.FAILED);

            processed++;
            setProgress((processed / pendingStudents.length) * 100);
        }

        setIsUploading(false);
    };

    const handleRetry = async (index) => {
        updateStudentStatus(index, STATUS.PROCESSING);
        const success = await uploadStudent(students[index]);
        updateStudentStatus(index, success ? STATUS.UPLOADED : STATUS.FAILED);
    };

    const handleClear = () => {
        setStudents([]);
        setProgress(0);
        sessionStorage.removeItem('uploadedStudents');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case STATUS.PENDING:
                return <Clock className="h-4 w-4 text-gray-500" />;
            case STATUS.PROCESSING:
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case STATUS.UPLOADED:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case STATUS.FAILED:
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getProgressStats = () => {
        const total = students.length;
        const uploaded = students.filter(s => s.uploadStatus === STATUS.UPLOADED).length;
        const failed = students.filter(s => s.uploadStatus === STATUS.FAILED).length;
        const pending = total - uploaded - failed;
        return { total, uploaded, failed, pending };
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <Card className="bg-white shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Student Data Upload</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center
                            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileUpload}
                            accept=".xlsx, .xls"
                            className="hidden"
                            disabled={isUploading}
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center gap-2"
                        >
                            <Upload className="w-10 h-10 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                                Drop your Excel file here, or <span className="text-blue-500">browse</span>
                            </span>
                            <span className="text-xs text-gray-500">
                                Supports: .xlsx, .xls
                            </span>
                        </label>
                    </div>

                    {students.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {isUploading && (
                                <div className="space-y-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-sm text-gray-600 text-right">
                                        {Math.round(progress)}% Complete
                                    </p>
                                </div>
                            )}

                            <Alert variant="info" className="bg-blue-50 border-blue-200">
                                <AlertDescription>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Uploaded: {getProgressStats().uploaded}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span>Failed: {getProgressStats().failed}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span>Pending: {getProgressStats().pending}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Total: {getProgressStats().total}</span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                {Object.keys(students[0])
                                                    .filter(key => key !== 'uploadStatus')
                                                    .map((header, index) => (
                                                        <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            {header}
                                                        </th>
                                                    ))}
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.map((student, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    {Object.entries(student)
                                                        .filter(([key]) => key !== 'uploadStatus')
                                                        .map(([key, value], idx) => (
                                                            <td key={idx} className="px-4 py-2 text-sm text-gray-900">
                                                                {value}
                                                            </td>
                                                        ))}
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(student.uploadStatus)}
                                                            <span className="text-sm capitalize">{student.uploadStatus}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {student.uploadStatus === STATUS.FAILED && (
                                                            <button
                                                                onClick={() => handleRetry(index)}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                                                disabled={isUploading}
                                                            >
                                                                Retry
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={handleClear}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={isUploading}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Clear Data
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Students
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;