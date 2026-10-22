import React from 'react';
import SaasAdminDashboard from './SaasAdminDashboard';

export default function DistributorPortal({ currentUser, onSwitchTenant, activeTenantId }) {
  return (
    <div className="space-y-4 font-sans">
      <SaasAdminDashboard 
        currentUser={currentUser}
        onSwitchTenant={onSwitchTenant}
        activeTenantId={activeTenantId}
        isDistributorMode={true}
      />
    </div>
  );
}
