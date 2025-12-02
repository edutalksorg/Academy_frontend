import React, { useState, useEffect } from 'react';
import FormInput from '../../components/FormInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch colleges for dropdown
    async function fetchColleges() {
      try {
        const res = await api.get('/colleges');
        if (res.data && res.data.data) {
          setColleges(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      }
    }
    fetchColleges();
  }, []);

  function validate() {
    const e = {};
    if (!name) e.name = 'Name is required';
    else if (name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if ((role === 'tpo' || role === 'instructor') && !collegeId) {
      e.collegeId = 'College selection is required for TPO and Instructor roles';
    }
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        collegeId: collegeId || undefined
      };
      const res = await auth.register(payload);

      if (res && res.success) {
        setMessageType('success');
        if (role === 'student') {
          setMessage('Registration successful! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setMessage('Registration submitted! Your account is pending approval by SuperAdmin. You will be notified once approved.');
        }
      } else {
        setMessageType('error');
        setMessage(res?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setMessageType('error');
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor (requires approval)' },
    { value: 'tpo', label: 'TPO - Training & Placement Officer (requires approval)' },
  ];

  const collegeOptions = colleges.map(c => ({
    value: c.id.toString(),
    label: c.name
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-1">Join the College Placement Platform</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg border ${messageType === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {message}
        </div>
      )}

      <FormInput
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        error={errors.name}
        required
      />

      <FormInput
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="john.doe@college.edu"
        error={errors.email}
        required
      />

      <FormInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Minimum 6 characters"
        error={errors.password}
        required
      />

      <Select
        label="Role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={roleOptions}
        required
      />

      {(role === 'tpo' || role === 'instructor') && (
        <Select
          label="College"
          name="collegeId"
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
          options={collegeOptions}
          placeholder="Select your college"
          error={errors.collegeId}
          required
        />
      )}

      {role === 'student' && (
        <Select
          label="College (Optional)"
          name="collegeId"
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
          options={collegeOptions}
          placeholder="Select your college"
        />
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Create Account
      </Button>

      {(role === 'tpo' || role === 'instructor') && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <strong>Note:</strong> {role === 'tpo' ? 'TPO' : 'Instructor'} accounts require approval from SuperAdmin before you can access the platform.
        </div>
      )}
    </form>
  );
}

