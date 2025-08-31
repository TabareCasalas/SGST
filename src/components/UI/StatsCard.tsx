import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  description
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'gray':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'gray':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className={`border rounded-lg p-6 ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-sm mt-1 opacity-75">{description}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.isPositive ? '↗' : '↘'} {Math.abs(change.value)}%
              </span>
              <span className="text-sm opacity-75 ml-1">
                vs mes anterior
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getIconColorClasses()}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 