import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName = "",
  itemType = "item",
  loading = false
}) {
  if (!isOpen) return null;

  const getInitial = (name) => {
    if (!name) return itemType?.charAt(0)?.toUpperCase() || 'I';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-sm transform transition-all">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 rounded-t-xl border-b border-red-100/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
                <FiAlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-700">{title}</h3>
                <p className="text-xs text-red-600/80">This action cannot be undone</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {getInitial(itemName)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{itemName || `Unnamed ${itemType}`}</p>
                <p className="text-xs text-gray-500">{itemType} will be permanently deleted</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Deleting...
                  </div>
                ) : (
                  `Delete ${itemType}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 