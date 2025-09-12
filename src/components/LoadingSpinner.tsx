import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
};