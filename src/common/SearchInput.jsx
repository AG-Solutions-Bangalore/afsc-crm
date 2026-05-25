import React from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div
      className={`search-input flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm shadow-sm transition-all duration-200 ${className}`}
    >
      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
      />

      {value && (
        <button
          onClick={onClear}
          className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
