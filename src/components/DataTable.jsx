import React, { forwardRef, useImperativeHandle } from 'react';
import { FiEdit, FiTrash2, FiEye, FiLoader, FiAlertTriangle } from 'react-icons/fi';

const DataTable = forwardRef(({ 
  data = [],
  columns = [],
  loading = false,
  error = '',
  emptyState = {},
  actions = [],
  onRetry,
  searchTerm = '',
  filters = {},
  onRefresh
}, ref) => {

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: onRefresh
  }));

  // Filter and search data based on columns configuration
  const filteredData = data.filter(item => {
    // Search filter - check all searchable columns
    const matchesSearch = !searchTerm || columns.some(column => {
      if (column.searchable && item[column.key]) {
        const value = column.render ? column.render(item) : item[column.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });

    // Apply custom filters
    const matchesFilters = Object.keys(filters).every(filterKey => {
      if (!filters[filterKey]) return true;
      
      // Handle nested object properties (like district._id)
      const getValue = (obj, path) => {
        return path.split('.').reduce((curr, key) => curr?.[key], obj);
      };
      
      const itemValue = getValue(item, filterKey);
      return itemValue === filters[filterKey];
    });

    return matchesSearch && matchesFilters;
  });

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <FiLoader className="animate-spin text-4xl text-[#5041BC] mx-auto mb-4" />
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 text-red-500 flex flex-col items-center gap-4">
        <FiAlertTriangle className="text-4xl" />
        <span>{error}</span>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-[#5041BC] text-white rounded-lg hover:bg-[#6C63FF] transition-colors">
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[180px] w-full">
        <div className="text-center max-w-xs w-full mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          {emptyState.icon && <div className="text-4xl mx-auto mb-2">{emptyState.icon}</div>}
          <h3 className="text-base font-semibold mb-1">{emptyState.title || 'No data found'}</h3>
          <p className="text-sm">{emptyState.description || 'Data will appear here once available.'}</p>
        </div>
      </div>
    );
  }

  // No filtered results
  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[180px] w-full">
        <div className="text-center max-w-xs w-full mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          {emptyState.icon && <div className="text-3xl mx-auto mb-2">{emptyState.icon}</div>}
          <h3 className="text-base font-semibold mb-1">No items match your criteria</h3>
        <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Render action buttons
  const renderActions = (item) => {
    return (
      <div className="flex items-center justify-center gap-1">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={() => action.onClick(item)}
              className={`p-1.5 text-gray-400 rounded-lg transition-all duration-200 ${action.className || 'hover:bg-gray-100/50'}`}
              title={action.title}
            >
              <IconComponent className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  };

  // Render cell content based on column configuration
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    
    // Handle nested properties
    const getValue = (obj, path) => {
      return path.split('.').reduce((curr, key) => curr?.[key], obj);
    };
    
    const value = getValue(item, column.key);
    
    // Apply column-specific formatting
    if (column.type === 'badge') {
      const displayValue = value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${column.getBadgeClass ? column.getBadgeClass(value) : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
          {displayValue}
        </span>
      );
    }
    
    if (column.type === 'date') {
      return (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }) : 'N/A'}
        </span>
      );
    }
    
    if (column.type === 'avatar') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold text-sm">
            {value?.charAt(0)?.toUpperCase() || column.fallback || 'X'}
          </div>
          <div className="font-semibold text-gray-900 text-sm">{value}</div>
        </div>
      );
    }
    
    return <span className="text-sm text-gray-600">{value || 'N/A'}</span>;
  };

  return (
    <div>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className={`px-4 py-3 font-semibold ${column.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th scope="col" className="px-4 py-3 font-semibold text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((item, index) => (
              <tr 
                key={item._id || index} 
                className="transform transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:shadow-md hover:bg-white rounded-xl"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3 ${column.align === 'center' ? 'text-center' : ''}`}>
                    {renderCell(item, column)}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-3">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible on mobile only */}
      <div className="lg:hidden space-y-3">
        {filteredData.map((item, index) => (
          <div key={item._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Mobile card header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Find the main title column (usually first avatar or title column) */}
                {(() => {
                  const titleColumn = columns.find(col => col.type === 'avatar') || columns[0];
                  const titleValue = titleColumn.key.split('.').reduce((curr, key) => curr?.[key], item);
                  return (
                    <div className="w-10 h-10 rounded-full bg-[#5041BC] flex items-center justify-center text-white font-semibold">
                      {titleValue?.charAt(0)?.toUpperCase() || 'X'}
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {(() => {
                      const titleColumn = columns.find(col => col.type === 'avatar') || columns[0];
                      return titleColumn.key.split('.').reduce((curr, key) => curr?.[key], item) || 'Unknown';
                    })()}
                  </h3>
                  {/* Show secondary info if available */}
                  {columns.length > 1 && (
                    <p className="text-xs text-gray-500">
                      {renderCell(item, columns[1])}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons for mobile */}
              {actions.length > 0 && (
                <div className="flex items-center gap-1">
                  {actions.map((action, actionIndex) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(item)}
                        className={`p-2 text-gray-400 rounded-lg transition-colors ${action.mobileClassName || 'hover:bg-gray-100'}`}
                        title={action.title}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile card details - show remaining columns */}
            {columns.length > 2 && (
              <div className="grid grid-cols-2 gap-3">
                {columns.slice(2).map((column, colIndex) => (
                  <div key={colIndex}>
                    <span className="text-xs text-gray-500 font-medium">{column.label}</span>
                    <div className="mt-1">
                      {renderCell(item, column)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default DataTable; 