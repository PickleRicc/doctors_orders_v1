/**
 * Objective Table Component
 * Interactive table for objective SOAP data (tests, measurements, observations)
 * Supports both flat rows (backward compatible) and categorized rows
 * Categories: Observation, Palpation, ROM, Strength, Special Tests, Functional
 * Inline editing with glassmorphism styling following design system
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, Check } from 'lucide-react';

const ObjectiveTable = memo(({ 
  data = { headers: [], rows: [], categories: [] }, 
  onChange, 
  onFocus, 
  onBlur,
  className = '' 
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const inputRef = useRef(null);

  // Default structure if no data provided
  const defaultData = {
    headers: ['Test/Measurement', 'Result', 'Notes'],
    rows: [],
    categories: null, // If null, use flat structure (backward compatible)
    allowAddRows: true,
    commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', '1+', '2+', '3+']
  };

  const tableData = { ...defaultData, ...data };
  const hasCategories = tableData.categories && Array.isArray(tableData.categories);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end of text instead of selecting
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [editingCell]);

  // Save changes when editing cell changes or component unmounts
  const saveEditingValue = (categoryIndex, rowIndex, columnKey, value) => {
    if (hasCategories && categoryIndex !== null) {
      const updatedCategories = [...tableData.categories];
      const updatedRows = [...updatedCategories[categoryIndex].rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        [columnKey]: value
      };
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        rows: updatedRows
      };
      onChange({
        ...tableData,
        categories: updatedCategories
      });
    } else {
      const updatedRows = [...tableData.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        [columnKey]: value
      };
      onChange({
        ...tableData,
        rows: updatedRows
      });
    }
  };

  // This function is no longer needed - we use saveEditingValue instead
  // Keeping for dropdown compatibility
  const handleCellEdit = (categoryIndex, rowIndex, columnKey, newValue) => {
    saveEditingValue(categoryIndex, rowIndex, columnKey, newValue);
  };

  const handleAddRow = (categoryIndex = null) => {
    const newRow = { test: '', result: '', notes: '' };

    if (hasCategories && categoryIndex !== null) {
      // Add to specific category
      const updatedCategories = [...tableData.categories];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        rows: [...updatedCategories[categoryIndex].rows, newRow]
      };

      onChange({
        ...tableData,
        categories: updatedCategories
      });
    } else {
      // Add to flat rows
      onChange({
        ...tableData,
        rows: [...tableData.rows, newRow]
      });
    }

    setShowAddRow(false);
  };

  const handleRemoveRow = (categoryIndex, rowIndex) => {
    if (hasCategories && categoryIndex !== null) {
      const updatedCategories = [...tableData.categories];
      const updatedRows = updatedCategories[categoryIndex].rows.filter((_, i) => i !== rowIndex);
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        rows: updatedRows
      };

      onChange({
        ...tableData,
        categories: updatedCategories
      });
    } else {
      const updatedRows = tableData.rows.filter((_, i) => i !== rowIndex);
      onChange({
        ...tableData,
        rows: updatedRows
      });
    }
  };

  const handleKeyDown = (e, categoryIndex, rowIndex, columnKey) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setEditingCell(null);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const ResultDropdown = ({ value, onChange, categoryIndex, rowIndex }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownId = `dropdown-${categoryIndex}-${rowIndex}`;
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-white/20 dark:border-white/10 rounded-lg hover:bg-white/30 dark:hover:bg-[#2a2a2a] transition-colors flex items-center justify-between"
        >
          <span className={value ? 'text-grey-900 dark:text-grey-100' : 'text-grey-500 dark:text-grey-400'}>
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
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto transition-colors"
            >
              {tableData.commonResults.map((result) => (
                <button
                  key={result}
                  onClick={() => {
                    onChange(result);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-grey-900 dark:text-grey-100 hover:bg-blue-light/50 dark:hover:bg-blue-primary/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {result}
                </button>
              ))}
              <div className="border-t border-grey-200 dark:border-white/10 mt-1 pt-1">
                <button
                  onClick={() => {
                    setEditingCell(`${rowIndex}-result`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-blue-primary dark:text-blue-primary hover:bg-blue-light/50 dark:hover:bg-blue-primary/20 transition-colors rounded-b-lg"
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

  const CellContent = ({ row, categoryIndex, rowIndex, columnKey, value }) => {
    const cellId = `${categoryIndex}-${rowIndex}-${columnKey}`;
    const isEditing = editingCell === cellId;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => {
            // Save the value
            saveEditingValue(categoryIndex, rowIndex, columnKey, editingValue);
            setEditingCell(null);
            setEditingValue('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              saveEditingValue(categoryIndex, rowIndex, columnKey, editingValue);
              setEditingCell(null);
              setEditingValue('');
            } else if (e.key === 'Escape') {
              setEditingCell(null);
              setEditingValue('');
            }
          }}
          autoFocus
          className="w-full px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-blue-primary/50 dark:border-blue-primary/30 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary/20 dark:focus:ring-blue-primary/30"
          placeholder={`Enter ${columnKey}...`}
        />
      );
    }

    if (columnKey === 'result' && tableData.commonResults) {
      return (
        <ResultDropdown
          value={value}
          onChange={(newValue) => handleCellEdit(categoryIndex, rowIndex, 'result', newValue)}
          categoryIndex={categoryIndex}
          rowIndex={rowIndex}
        />
      );
    }

    return (
      <div
        onClick={() => {
          setEditingCell(cellId);
          setEditingValue(value || '');
        }}
        className="w-full px-3 py-2 min-h-[40px] cursor-text hover:bg-white/20 dark:hover:bg-[#1f1f1f] rounded-lg transition-colors flex items-center"
      >
        <span className={value ? 'text-grey-900 dark:text-grey-100' : 'text-grey-500 dark:text-grey-400'}>
          {value || `Enter ${columnKey}...`}
        </span>
      </div>
    );
  };

  return (
    <div className={`objective-table ${className}`}>
      {/* Table Header - Hidden on mobile, shown on desktop */}
      <div className="hidden md:grid grid-cols-12 gap-4 mb-3 px-4 py-2">
        <div className="col-span-4 text-sm font-medium text-grey-700 dark:text-grey-300">
          {tableData.headers[0] || 'Test/Measurement'}
        </div>
        <div className="col-span-3 text-sm font-medium text-grey-700 dark:text-grey-300">
          {tableData.headers[1] || 'Result'}
        </div>
        <div className="col-span-4 text-sm font-medium text-grey-700 dark:text-grey-300">
          {tableData.headers[2] || 'Notes'}
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Categorized or Flat Rows */}
      {hasCategories ? (
        <div className="space-y-6">
          {tableData.categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-grey-800 dark:text-grey-200 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-primary dark:bg-blue-primary rounded-full" />
                  {category.name}
                </h4>
                {tableData.allowAddRows && (
                  <button
                    onClick={() => handleAddRow(categoryIndex)}
                    className="text-sm text-blue-primary hover:text-blue-dark font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Test
                  </button>
                )}
              </div>

              {/* Category Rows */}
              <div className="space-y-2">
                <AnimatePresence>
                  {category.rows.map((row, rowIndex) => (
                    <motion.div
                      key={rowIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-[#1a1a1a] border border-white/20 dark:border-white/10 rounded-xl hover:bg-white/25 dark:hover:bg-[#1f1f1f] transition-colors group"
                    >
                      {/* Mobile Layout - Stacked */}
                      <div className="md:hidden p-4 space-y-3">
                        <div>
                          <div className="text-xs font-medium text-grey-600 dark:text-grey-400 mb-1">{tableData.headers[0] || 'Test/Measurement'}</div>
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="test"
                            value={row.test}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-grey-600 mb-1">{tableData.headers[1] || 'Result'}</div>
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="result"
                            value={row.result}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-grey-600 mb-1">{tableData.headers[2] || 'Notes'}</div>
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="notes"
                            value={row.notes}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveRow(categoryIndex, rowIndex)}
                            className="p-2 text-grey-400 dark:text-grey-500 hover:text-red-500 transition-colors"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Desktop Layout - Grid */}
                      <div className="hidden md:grid grid-cols-12 gap-4 p-4">
                        <div className="col-span-4">
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="test"
                            value={row.test}
                          />
                        </div>
                        <div className="col-span-3">
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="result"
                            value={row.result}
                          />
                        </div>
                        <div className="col-span-4">
                          <CellContent
                            row={row}
                            categoryIndex={categoryIndex}
                            rowIndex={rowIndex}
                            columnKey="notes"
                            value={row.notes}
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveRow(categoryIndex, rowIndex)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-grey-400 dark:text-grey-500 hover:text-red-500 transition-all duration-200"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {category.rows.length === 0 && (
                  <div className="text-center py-4 text-grey-500 dark:text-grey-400 text-sm italic">
                    No tests added yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Rows (Backward Compatible) */
        <div className="space-y-2">
          <AnimatePresence>
            {tableData.rows.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#1a1a1a] border border-white/20 dark:border-white/10 rounded-xl hover:bg-white/25 dark:hover:bg-[#1f1f1f] transition-colors group"
              >
                {/* Mobile Layout - Stacked */}
                <div className="md:hidden p-4 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-grey-600 mb-1">{tableData.headers[0] || 'Test/Measurement'}</div>
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="test"
                      value={row.test}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-grey-600 mb-1">{tableData.headers[1] || 'Result'}</div>
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="result"
                      value={row.result}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-grey-600 mb-1">{tableData.headers[2] || 'Notes'}</div>
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="notes"
                      value={row.notes}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveRow(null, rowIndex)}
                      className="p-2 text-grey-400 dark:text-grey-500 hover:text-red-500 transition-colors"
                      title="Remove row"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Desktop Layout - Grid */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-4">
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="test"
                      value={row.test}
                    />
                  </div>
                  <div className="col-span-3">
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="result"
                      value={row.result}
                    />
                  </div>
                  <div className="col-span-4">
                    <CellContent
                      row={row}
                      categoryIndex={null}
                      rowIndex={rowIndex}
                      columnKey="notes"
                      value={row.notes}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveRow(null, rowIndex)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-grey-400 hover:text-red-500 transition-all duration-200"
                      title="Remove row"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Row Section (Only for flat structure) */}
      {!hasCategories && tableData.allowAddRows && (
        <div className="mt-4">
          <AnimatePresence>
            {!showAddRow ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAddRow(true)}
                className="flex items-center gap-2 px-4 py-3 text-blue-primary dark:text-blue-primary hover:text-blue-dark dark:hover:text-blue-primary bg-blue-light/20 dark:bg-blue-primary/10 hover:bg-blue-light/30 dark:hover:bg-blue-primary/20 border border-blue-primary/20 dark:border-blue-primary/30 rounded-xl transition-colors w-full"
              >
                <Plus className="w-4 h-4" />
                Add test or measurement
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-[#1a1a1a] border border-white/30 dark:border-white/10 rounded-xl p-4 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Test name..."
                      className="w-full px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-white/20 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary/20 dark:focus:ring-blue-primary/30"
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
                      className="px-3 py-2 text-grey-600 dark:text-grey-400 hover:text-grey-800 dark:hover:text-grey-200 transition-colors"
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
          <div className="text-grey-500 dark:text-grey-400 mb-4">No tests or measurements recorded</div>
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
});

export default ObjectiveTable;
