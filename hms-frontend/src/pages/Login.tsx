import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import frontpageImg from '../assets/frontpage.jpg';
import { KeyRound, Mail, User, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import medicoreLogo from '../assets/medicoreLogo.jpg';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, userId, username: user, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('username', user);
      localStorage.setItem('role', role);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErr('');
    setResetMsg('');
    setResetLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        username: resetUsername,
        email: resetEmail,
        newPassword: newPassword,
      });

      setResetMsg(res.data?.message || 'Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMsg('');
        setResetUsername('');
        setResetEmail('');
        setNewPassword('');
      }, 2000);
    } catch (err: any) {
      setResetErr(err.response?.data?.message || 'Failed to reset password. Please check your credentials.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden">
        <img
          src={frontpageImg}
          alt="Hospital Facility"
          className="absolute inset-0 w-full h-full object-cover opacity-55 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091524] via-[#091524]/70 to-transparent pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md shadow-lg flex items-center justify-center p-1">
            <img
              src={medicoreLogo}
              alt="MediCore Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">MediCore</span>
            <span className="text-[11px] font-medium text-sky-400 tracking-wider uppercase block">Hospital Central Management</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-4 my-auto py-10">

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One record, <br />
            <span className="text-sky-400">every department.</span>
          </h1>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
            Unifying patients, admissions, doctor rosters, diagnostic pathology, and pharmacy billing into a single synchronized hospital engine.
          </p>
        </div>
      </div>

      {/* Right Sign-in Form Viewport */}
      <div className="w-full lg:w-1/2 xl:w-2/5 h-full flex flex-col justify-between p-8 sm:p-14 lg:p-16 bg-[#f8fafc] overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-lg">+</div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">MediCore</span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Enter your credentials to access your hospital portal.
            </p>
          </div>

          {error && (
            <div className="mt-5 p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-400" size={17} />
                <input
                  type="text"
                  required
                  placeholder="e.g. dr_sarath"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetErr('');
                    setResetMsg('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium hover:underline transition cursor-pointer"
                >
                  Reset password
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={17} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Hospital Portal'
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400 pt-6">
          © {new Date().getFullYear()} MediCore Health Systems • All Rights Reserved
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <KeyRound className="text-sky-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
            </div>
            <p className="text-xs text-slate-500">
              Provide your username and registered account email to configure a new password.
            </p>

            {resetMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>{resetMsg}</span>
              </div>
            )}

            {resetErr && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {resetErr}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="text"
                    required
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="e.g. dr_sarath"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Registered Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. sarath.perera@medicore.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};