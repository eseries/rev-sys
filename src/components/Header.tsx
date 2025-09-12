import React from 'react';
import { Hotel, User, Settings } from 'lucide-react';

interface HeaderProps {
  currentView: 'customer' | 'admin';
  onViewChange: (view: 'customer' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Hotel className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">LuxeStay Hotels</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-1">
              <button
                onClick={() => onViewChange('customer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Book Room
              </button>
              <button
                onClick={() => onViewChange('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Admin
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};