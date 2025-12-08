import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import axiosClient from '../../api/axiosClient';

import { useAuth } from '../../contexts/AuthContext';

export default function ManageStudents() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', rollNumber: '' });
    const [bulkData, setBulkData] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', 'bulk'
    const [uploadResult, setUploadResult] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    useEffect(() => {
        console.log('Current User:', user);
        fetchStudents();
    }, [search, user]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/tpo/allowed-students', { params: { q: search } });
            setStudents(res.data.data.rows);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSingle = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/tpo/allowed-students', {
                students: [newStudent]
            });
            alert('Student added successfully');
            setNewStudent({ name: '', email: '', rollNumber: '' });
            fetchStudents();
            setActiveTab('list');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add student');
        }
    };

    const handleBulkUpload = async () => {
        try {
            // Parse CSV/Text data
            // Format: Name, Email, RollNumber (one per line)
            const lines = bulkData.split('\n').filter(line => line.trim());
            const parsedStudents = lines.map(line => {
                const [name, email, rollNumber] = line.split(',').map(s => s.trim());
                return { name, email, rollNumber };
            });

            const res = await axiosClient.post('/tpo/allowed-students', {
                students: parsedStudents
            });

            setUploadResult(res.data.data);
            setBulkData('');
            fetchStudents();
        } catch (err) {
            console.error('Upload failed:', err);
            // axiosClient returns response.data directly on error
            const msg = err.message || err.response?.data?.message || 'Failed to upload students';
            alert(msg);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        setSelectedFileName(file.name);

        if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log('Parsed CSV:', results.data);
                    const parsedStudents = results.data.map(row => ({
                        name: row.Name || row.name || '',
                        email: row.Email || row.email || '',
                        rollNumber: row.RollNumber || row['Roll Number'] || row.rollNumber || ''
                    })).filter(s => s.name && s.email && s.rollNumber);

                    if (parsedStudents.length === 0) {
                        alert('No valid student data found in CSV. Please ensure columns are: Name, Email, RollNumber');
                        return;
                    }

                    // Show preview instead of uploading immediately
                    setPreviewData(parsedStudents);
                    setUploadResult(null);
                },
                error: (error) => {
                    console.error('CSV Parse Error:', error);
                    alert('Failed to parse CSV file');
                }
            });
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Get first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    console.log('Parsed Excel - Raw Data:', jsonData);
                    console.log('First row keys:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');

                    const parsedStudents = jsonData.map((row, index) => {
                        // Get all keys from the row
                        const keys = Object.keys(row);

                        // Try multiple column name variations for name
                        let name = row.Name || row.name || row.NAME ||
                            row['Student Name'] || row['student name'] ||
                            row.StudentName || row.studentName || '';

                        // If still empty, try to find the first string column that's not email or roll
                        if (!name) {
                            const nameKey = keys.find(k =>
                                !k.toLowerCase().includes('email') &&
                                !k.toLowerCase().includes('roll') &&
                                row[k] && typeof row[k] === 'string'
                            );
                            name = nameKey ? row[nameKey] : '';
                        }

                        const email = row.Email || row.email || row.EMAIL || '';
                        const rollNumber = String(
                            row.RollNumber ||
                            row.rollNumber ||
                            row.ROLLNUMBER ||
                            row['Roll Number'] ||
                            row['roll number'] ||
                            row.RollNo ||
                            row.rollNo ||
                            ''
                        ).trim();

                        console.log(`Row ${index + 1}:`, {
                            rawRow: row,
                            extracted: { name, email, rollNumber },
                            isValid: !!(name && email && rollNumber)
                        });

                        return { name, email, rollNumber };
                    }).filter(s => s.name && s.email && s.rollNumber);

                    console.log('Filtered students:', parsedStudents);

                    if (parsedStudents.length === 0) {
                        const sampleRow = jsonData[0] || {};
                        const availableColumns = Object.keys(sampleRow).join(', ');
                        alert(`No valid student data found in Excel file.\n\nFound columns: ${availableColumns}\n\nRequired columns: Name, Email, RollNumber`);
                        return;
                    }

                    // Show preview instead of uploading immediately
                    setPreviewData(parsedStudents);
                    setUploadResult(null);
                } catch (error) {
                    console.error('Excel Parse Error:', error);
                    alert('Failed to parse Excel file');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Please upload a CSV or Excel (.xlsx, .xls) file');
        }
    };

    const uploadParsedStudents = async (students) => {
        try {
            const res = await axiosClient.post('/tpo/allowed-students', { students });
            setUploadResult(res.data.data);
            fetchStudents();
            alert(`Successfully uploaded ${res.data.data.added} students!`);
        } catch (err) {
            console.error('Upload failed:', err);
            const msg = err.message || 'Failed to upload students';
            alert(msg);
        }
    };

    const handleConfirmUpload = async () => {
        if (!previewData || previewData.length === 0) {
            alert('No data to upload');
            return;
        }

        await uploadParsedStudents(previewData);
        setPreviewData(null);
        setSelectedFileName('');
    };

    const handleCancelPreview = () => {
        setPreviewData(null);
        setSelectedFileName('');
        setUploadResult(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Allowed Students</h1>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'list' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('list')}
                    >
                        Student List
                    </Button>
                    <Button
                        variant={activeTab === 'add' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('add')}
                    >
                        Add Single
                    </Button>
                    <Button
                        variant={activeTab === 'bulk' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('bulk')}
                    >
                        Bulk Upload
                    </Button>
                </div>
            </div>

            {activeTab === 'list' && (
                <Card>
                    <div className="mb-4">
                        <FormInput
                            placeholder="Search by name, email, or roll number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.isRegistered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {student.isRegistered ? 'Registered' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                No students found. Add some students to allow them to register.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'add' && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Add Single Student</h2>
                    <form onSubmit={handleAddSingle} className="space-y-4 max-w-md">
                        <FormInput
                            label="Full Name"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Email Address"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Roll Number"
                            value={newStudent.rollNumber}
                            onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                            required
                        />
                        <Button type="submit" variant="primary">Add Student</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'bulk' && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Bulk Upload Students</h2>

                    {/* File Upload Option */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">📁 Upload CSV or Excel File</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Upload a CSV or Excel file (.xlsx, .xls) with columns: <strong>Name, Email, RollNumber</strong>
                        </p>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700 cursor-pointer"
                        />
                        {selectedFileName && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: <strong>{selectedFileName}</strong>
                            </p>
                        )}
                    </div>

                    {/* Preview Table */}
                    {previewData && previewData.length > 0 && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-green-900">
                                    📋 Preview: {previewData.length} students found
                                </h3>
                                <div className="flex gap-2">
                                    <Button onClick={handleCancelPreview} variant="secondary">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleConfirmUpload} variant="primary">
                                        ✓ Confirm & Upload
                                    </Button>
                                </div>
                            </div>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {previewData.map((student, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{student.email}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{student.rollNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Manual Text Input Option */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">✍️ Or Enter Manually</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Enter student details, one per line. Format: <strong>Name, Email, RollNumber</strong>
                        </p>
                        <textarea
                            className="w-full h-48 p-4 border rounded-lg font-mono text-sm"
                            placeholder="John Doe, john@example.com, 12345&#10;Jane Smith, jane@example.com, 67890"
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                        />
                        <div className="mt-3">
                            <Button onClick={handleBulkUpload} variant="primary">Upload from Text</Button>
                        </div>
                    </div>

                    {uploadResult && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold mb-2">Upload Results:</h3>
                            <p className="text-green-600">Successfully added: {uploadResult.added}</p>
                            <p className="text-red-600">Failed: {uploadResult.failed}</p>
                            {uploadResult.errors.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-semibold text-red-600">Errors:</p>
                                    <ul className="list-disc list-inside text-sm text-red-500">
                                        {uploadResult.errors.map((err, idx) => (
                                            <li key={idx}>
                                                {err.student.email} - {err.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
