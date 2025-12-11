import React, { useState, useEffect } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.user && !auth.loading) {
      const role = auth.user.role;
      switch (role) {
        case 'superadmin':
          navigate('/superadmin', { replace: true });
          break;
        case 'tpo':
          navigate('/tpo', { replace: true });
          break;
        case 'instructor':
          navigate('/instructor', { replace: true });
          break;
        case 'student':
          navigate('/student', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [auth.user, auth.loading, navigate]);

  function validate() {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const result = await auth.login(email, password);
      if (result && result.user) {
        // Save done in AuthContext; navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-1">Sign in to your account to continue</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

      <FormInput
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="student@college.edu"
        error={errors.email}
        required
      />

      <FormInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Enter your password"
        error={errors.password}
        required
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>


    </form>
  );
}

