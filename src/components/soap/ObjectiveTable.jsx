/**
 * Objective Table Component
 * Interactive table for objective SOAP data (tests, measurements, observations)
 * Inline editing with glassmorphism styling following design system
 * Clean, Google Docs-style table editing experience
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, Check } from 'lucide-react';

const ObjectiveTable = ({ 
  data = { headers: [], rows: [] }, 
  onChange, 
  onFocus, 
  onBlur,
  className = '' 
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const inputRef = useRef(null);

  // Default structure if no data provided
  const defaultData = {
    headers: ['Test/Measurement', 'Result', 'Notes'],
    rows: [],
    allowAddRows: true,
    commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', '1+', '2+', '3+']
  };

  const tableData = { ...defaultData, ...data };

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellEdit = (rowIndex, columnKey, newValue) => {
    const updatedRows = [...tableData.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnKey]: newValue
    };

    onChange({
      ...tableData,
      rows: updatedRows
    });
  };

  const handleAddRow = (templateRow = {}) => {
    const newRow = {
      test: templateRow.test || '',
      result: templateRow.result || '',
      notes: templateRow.notes || '',
      ...templateRow
    };

    onChange({
      ...tableData,
      rows: [...tableData.rows, newRow]
    });

    setShowAddRow(false);
  };

  const handleRemoveRow = (rowIndex) => {
    const updatedRows = tableData.rows.filter((_, index) => index !== rowIndex);
    onChange({
      ...tableData,
      rows: updatedRows
    });
  };

  const handleKeyDown = (e, rowIndex, columnKey) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingCell(null);
      
      // Move to next row or add new row if at end
      if (rowIndex === tableData.rows.length - 1) {
        handleAddRow();
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Move to next cell
      const columns = ['test', 'result', 'notes'];
      const currentColumnIndex = columns.indexOf(columnKey);
      const nextColumnIndex = (currentColumnIndex + 1) % columns.length;
      const nextRowIndex = nextColumnIndex === 0 ? rowIndex + 1 : rowIndex;
      
      if (nextRowIndex < tableData.rows.length) {
        setEditingCell(`${nextRowIndex}-${columns[nextColumnIndex]}`);
      }
    }
  };

  const ResultDropdown = ({ value, onChange, rowIndex }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 bg-white/20 backdrop-blur-8 border border-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-between"
        >
          <span className={value ? 'text-grey-900' : 'text-grey-500'}>
            {value || 'Select result...'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-20 border border-white/30 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
            >
              {tableData.commonResults.map((result) => (
                <button
                  key={result}
                  onClick={() => {
                    onChange(result);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-light/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {result}
                </button>
              ))}
              <div className="border-t border-grey-200 mt-1 pt-1">
                <button
                  onClick={() => {
                    setEditingCell(`${rowIndex}-result`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-blue-primary hover:bg-blue-light/50 transition-colors rounded-b-lg"
                >
                  Custom result...
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CellContent = ({ row, rowIndex, columnKey, value }) => {
    const cellId = `${rowIndex}-${columnKey}`;
    const isEditing = editingCell === cellId;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => handleCellEdit(rowIndex, columnKey, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => handleKeyDown(e, rowIndex, columnKey)}
          className="w-full px-3 py-2 bg-white/30 backdrop-blur-8 border border-blue-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-primary/20"
          placeholder={`Enter ${columnKey}...`}
        />
      );
    }

    if (columnKey === 'result' && tableData.commonResults) {
      return (
        <ResultDropdown
          value={value}
          onChange={(newValue) => handleCellEdit(rowIndex, columnKey, newValue)}
          rowIndex={rowIndex}
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell(cellId)}
        className="w-full px-3 py-2 min-h-[40px] cursor-text hover:bg-white/20 rounded-lg transition-colors flex items-center"
      >
        <span className={value ? 'text-grey-900' : 'text-grey-500'}>
          {value || `Enter ${columnKey}...`}
        </span>
      </div>
    );
  };

  return (
    <div className={`objective-table ${className}`}>
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 mb-3 px-4 py-2">
        <div className="col-span-4 text-sm font-medium text-grey-700">
          {tableData.headers[0] || 'Test/Measurement'}
        </div>
        <div className="col-span-3 text-sm font-medium text-grey-700">
          {tableData.headers[1] || 'Result'}
        </div>
        <div className="col-span-4 text-sm font-medium text-grey-700">
          {tableData.headers[2] || 'Notes'}
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Table Rows */}
      <div className="space-y-2">
        <AnimatePresence>
          {tableData.rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-12 gap-4 p-4 bg-white/15 backdrop-blur-8 border border-white/20 rounded-xl hover:bg-white/25 transition-colors group"
            >
              <div className="col-span-4">
                <CellContent
                  row={row}
                  rowIndex={rowIndex}
                  columnKey="test"
                  value={row.test}
                />
              </div>
              <div className="col-span-3">
                <CellContent
                  row={row}
                  rowIndex={rowIndex}
                  columnKey="result"
                  value={row.result}
                />
              </div>
              <div className="col-span-4">
                <CellContent
                  row={row}
                  rowIndex={rowIndex}
                  columnKey="notes"
                  value={row.notes}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  onClick={() => handleRemoveRow(rowIndex)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-grey-400 hover:text-red-500 transition-all duration-200"
                  title="Remove row"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Row Section */}
      {tableData.allowAddRows && (
        <div className="mt-4">
          <AnimatePresence>
            {!showAddRow ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAddRow(true)}
                className="flex items-center gap-2 px-4 py-3 text-blue-primary hover:text-blue-dark bg-blue-light/20 hover:bg-blue-light/30 backdrop-blur-8 border border-blue-primary/20 rounded-xl transition-colors w-full"
              >
                <Plus className="w-4 h-4" />
                Add test or measurement
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/25 backdrop-blur-16 border border-white/30 rounded-xl p-4"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Test name..."
                      className="w-full px-3 py-2 bg-white/30 backdrop-blur-8 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddRow({ test: e.target.value });
                        } else if (e.key === 'Escape') {
                          setShowAddRow(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="col-span-7 flex items-center gap-2">
                    <button
                      onClick={() => handleAddRow()}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddRow(false)}
                      className="px-3 py-2 text-grey-600 hover:text-grey-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {tableData.rows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-grey-500 mb-4">No tests or measurements recorded</div>
          <button
            onClick={() => handleAddRow()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add first test
          </button>
        </div>
      )}
    </div>
  );
};

export default ObjectiveTable;
