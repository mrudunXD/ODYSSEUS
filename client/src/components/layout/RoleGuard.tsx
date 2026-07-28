import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../utils/rolePermissions';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 card-shadow text-center max-w-md mx-auto my-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-base text-[#1A1A1A]">Access Restricted (RBAC)</h3>
        <p className="text-xs text-[#6B7280]">
          Your current role (<strong>{user?.role || 'Guest'}</strong>) does not have permission to view or manage this feature.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
