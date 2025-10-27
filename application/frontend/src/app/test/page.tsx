'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TestPage() {
  const [status, setStatus] = useState('Testing...');
  const [backendStatus, setBackendStatus] = useState('Not tested');

  useEffect(() => {
    // Test backend connection
    api
      .get('/health')
      .then(() => {
        setBackendStatus('✅ Backend connected');
        setStatus('✅ All systems working');
      })
      .catch((error) => {
        setBackendStatus('❌ Backend connection failed');
        setStatus('❌ Backend not available');
        console.error('Backend test failed:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">System Status</h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Frontend:</span>
            <span className="text-green-600">✅ Running</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Backend:</span>
            <span
              className={
                backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'
              }
            >
              {backendStatus}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Overall:</span>
            <span
              className={
                status.includes('✅') ? 'text-green-600' : 'text-red-600'
              }
            >
              {status}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
