import React, { useState } from 'react';
import { User } from '../types';
import { store } from '../services/store';
import { Card, Button, Input, Badge } from '../components/ui';
import { User as UserIcon, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [kycUrl, setKycUrl] = useState(user.kycData || '');
  const [loading, setLoading] = useState(false);

  const handleKycSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await store.submitKYC(user.id, kycUrl);
          alert("KYC Submitted for review.");
          window.location.reload(); // Simple reload to refresh user state from prop
      } catch (e: any) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  const getKycBadge = () => {
      switch(user.kycStatus) {
          case 'verified': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1"/> Verified</Badge>;
          case 'rejected': return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
          case 'pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
          default: return <Badge variant="neutral">Not Submitted</Badge>;
      }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="md:col-span-1 text-center">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-4xl text-slate-500 mb-4 font-bold">
                    {user.name.charAt(0)}
                </div>
                <h2 className="font-bold text-lg text-slate-900">{user.name}</h2>
                <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                <div className="flex justify-center mb-4">
                    {getKycBadge()}
                </div>
                <div className="text-left bg-slate-50 p-3 rounded-lg text-sm">
                    <p className="text-xs text-slate-400 uppercase">Member Since</p>
                    <p>{new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
            </Card>

            {/* KYC & Details */}
            <div className="md:col-span-2 space-y-6">
                <Card title="Identity Verification (KYC)">
                    <div className="mb-4 text-sm text-slate-600">
                        To comply with regulations and ensure platform security, please verify your identity.
                    </div>
                    {user.kycStatus === 'verified' ? (
                        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center">
                            <Shield className="w-6 h-6 mr-3" />
                            <div>
                                <p className="font-bold">Identity Verified</p>
                                <p className="text-sm">You have full access to all platform features.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleKycSubmit} className="space-y-4">
                             {user.kycStatus === 'rejected' && (
                                 <div className="bg-red-50 text-red-800 p-3 rounded text-sm">
                                     Your previous submission was rejected. Please check your document and try again.
                                 </div>
                             )}
                             <Input 
                                label="ID Document URL"
                                placeholder="https://..."
                                value={kycUrl}
                                onChange={e => setKycUrl(e.target.value)}
                                disabled={user.kycStatus === 'pending'}
                                required
                             />
                             <p className="text-xs text-slate-400">Please upload your ID to a secure host and paste the link here.</p>
                             <Button type="submit" disabled={user.kycStatus === 'pending'} isLoading={loading}>
                                 {user.kycStatus === 'pending' ? 'Under Review' : 'Submit for Verification'}
                             </Button>
                        </form>
                    )}
                </Card>

                <Card title="Account Details">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-slate-500 text-xs uppercase mb-1">Referral Code</label>
                            <p className="font-mono bg-slate-100 p-2 rounded">{user.referralCode}</p>
                        </div>
                        <div>
                            <label className="block text-slate-500 text-xs uppercase mb-1">Role</label>
                            <p className="capitalize font-medium">{user.role}</p>
                        </div>
                        <div>
                             <label className="block text-slate-500 text-xs uppercase mb-1">Phone</label>
                             <p className="font-medium">{user.phone || 'Not Set'}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};