import React from 'react';

const ProgressBar = ({ progress, color = 'blue', label = '' }) => {
  const percentage = Math.min(progress, 100);
  const bgColor = color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full transition-all duration-300 ease-in-out ${bgColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="flex justify-between text-sm mt-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;