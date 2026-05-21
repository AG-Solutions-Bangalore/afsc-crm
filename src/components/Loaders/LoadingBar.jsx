import React from "react";

const LoadingBars = () => {
  return (
    <div className="w-full flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

        {/* Text */}
        <p className="text-sm text-gray-500 font-medium">Loading clients...</p>
      </div>
    </div>
  );
};

export default LoadingBars;
