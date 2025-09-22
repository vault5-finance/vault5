import React, { useState } from 'react';

const Eye = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const EyeOff = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.66 20.66 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.66 20.66 0 0 1-3.17 4.12M1 1l22 22" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export default function PasswordInput({ value, onChange, name = 'password', placeholder = 'Enter password', className = '', ...rest }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white pr-10 ${className}`}
        autoComplete="new-password"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}