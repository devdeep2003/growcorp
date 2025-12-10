import React, { useState } from 'react';
import { User } from '../types';
import { Button, Input, Card } from '../components/ui';
import { Briefcase } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', 
    email: '', 
    phone: '', 
    referral: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      // ---------------- LOGIN ----------------
      if (isLogin) {
        if (!formData.identifier) {
          throw new Error("Please enter your Email or Phone");
        }

        response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneorEmail: formData.identifier })
        });

      } 
      // ---------------- REGISTER ----------------
      else {
        response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            refcode: formData.referral,
          })
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Request failed");
      }

      // SUCCESS → Login or Register
      onLogin(result.data);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 flex flex-col justify-center min-h-screen">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200">
          <Briefcase className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GrowCorp Global</h1>
        <p className="text-slate-500 text-sm mt-1">Premium Corporate Investment Platform</p>
      </div>

      <Card>
        <div className="flex border-b border-slate-100 mb-6">
          <button 
            className={`flex-1 pb-3 text-sm font-medium border-b-2 ${isLogin ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Log In
          </button>
          <button 
            className={`flex-1 pb-3 text-sm font-medium border-b-2 ${!isLogin ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
              <Input 
                label="Email or Phone" 
                placeholder="Enter registered email/phone"
                value={formData.identifier}
                onChange={e => setFormData({...formData, identifier: e.target.value})}
                required
              />
          ) : (
             <>
                <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <Input label="Referral Code (Optional)" value={formData.referral} onChange={e => setFormData({...formData, referral: e.target.value})} />
             </>
          )}

          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

          <Button type="button" className="w-full mt-2" onClick={() => {
             if(isLogin) setFormData({...formData, identifier: 'partner@growcorp.in'});
          }} variant="outline" size="sm">
              Demo User
          </Button>

          <Button type="button" className="w-full mt-2" onClick={() => {
             if(isLogin) setFormData({...formData, identifier: 'admin@growcorp.in'});
          }} variant="outline" size="sm">
              Demo Admin
          </Button>

          <Button type="submit" className="w-full h-12 text-base" isLoading={loading}>
            {isLogin ? 'Access Portfolio' : 'Create Account'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
