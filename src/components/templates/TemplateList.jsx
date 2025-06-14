import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Plus, Edit2, Copy, Trash2, Clock, Tag, Calendar } from 'lucide-react';
import useTemplates from '@/hooks/useTemplates';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

/**
 * Template List Component
 * Displays all available templates with filtering options
 * Allows users to select, edit, duplicate or delete templates
 */
const TemplateList = ({ onSelectTemplate, onEditTemplate, onNewTemplate }) => {
  const { templates, bodyRegions, sessionTypes, isLoading, error, deleteTemplate, duplicateTemplate } = useTemplates();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBodyRegion, setFilterBodyRegion] = useState('');
  const [filterSessionType, setFilterSessionType] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Filter templates based on search query and filters
  const filteredTemplates = templates.filter(template => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Body region filter
    const matchesBodyRegion = filterBodyRegion === '' || 
      template.bodyRegion === filterBodyRegion;
    
    // Session type filter
    const matchesSessionType = filterSessionType === '' || 
      template.sessionType === filterSessionType;
    
    return matchesSearch && matchesBodyRegion && matchesSessionType;
  });
  
  // Handle template duplication
  const handleDuplicate = async (template) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };
  
  // Handle template deletion - show confirmation first
  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplate(templateToDelete.id);
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] h-4 w-4" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-[#e9e9e7] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Body region filter */}
        <select
          className="px-4 py-2 border border-[#e9e9e7] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          value={filterBodyRegion}
          onChange={(e) => setFilterBodyRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {bodyRegions.map(region => (
            <option key={region} value={region}>
              {region.charAt(0).toUpperCase() + region.slice(1)}
            </option>
          ))}
        </select>
        
        {/* Session type filter */}
        <select
          className="px-4 py-2 border border-[#e9e9e7] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          value={filterSessionType}
          onChange={(e) => setFilterSessionType(e.target.value)}
        >
          <option value="">All Types</option>
          {sessionTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        
        {/* New Template Button */}
        <button 
          className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition flex items-center gap-2"
          onClick={onNewTemplate}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Template</span>
        </button>
      </div>
      
      {/* Templates List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent"></div>
            <p className="mt-2 text-[#4b5563]">Loading templates...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>Error loading templates: {error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 bg-white/90 rounded-lg shadow-sm border border-[#e9e9e7] text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb]/10">
              <FileText className="h-6 w-6 text-[#2563eb]" />
            </div>
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="mt-1 text-[#4b5563]">
              {searchQuery || filterBodyRegion || filterSessionType ? 
                'Try adjusting your search filters' : 
                'Create your first template to get started'}
            </p>
            {(!searchQuery && !filterBodyRegion && !filterSessionType) && (
              <button
                className="mt-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition"
                onClick={onNewTemplate}
              >
                Create Template
              </button>
            )}
          </div>
        ) : (
          filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`p-4 rounded-lg shadow-sm border hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer relative overflow-hidden ${template.isNew ? 'bg-[#dbeafe]/80 border-[#2563eb]/20' : 'bg-white/90 border-[#e9e9e7]'}`}
              onClick={() => onSelectTemplate(template)}
            >
              {/* New badge */}
              {template.isNew && (
                <div className="absolute -right-8 top-0 bg-[#2563eb] text-white px-8 py-0.5 transform rotate-45 text-xs font-medium shadow-sm">
                  New
                </div>
              )}
              
              <div className="flex items-center w-full">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mr-3 ${template.isCustom ? 'bg-[#2563eb] text-white' : template.isExample ? 'bg-amber-100 text-amber-600' : 'bg-[#2563eb]/10 text-[#2563eb]'}`}>
                  <FileText size={22} />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#111827]">{template.name}</h3>
                    
                    {/* Template type badges */}
                    {template.isDefault && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#9ca3af]/20 text-[#4b5563] text-xs">
                        Default
                      </span>
                    )}
                    {template.isCustom && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#2563eb]/10 text-[#2563eb] text-xs">
                        Custom
                      </span>
                    )}
                    {template.isExample && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-xs">
                        Example
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs mt-1.5">
                    {/* Body region */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563]">
                      <Tag size={12} />
                      {template.bodyRegion.charAt(0).toUpperCase() + template.bodyRegion.slice(1)}
                    </span>
                    
                    {/* Session type */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563]">
                      <Clock size={12} />
                      {template.sessionType.charAt(0).toUpperCase() + template.sessionType.slice(1)}
                    </span>
                    
                    {/* Creation date - only show for custom templates */}
                    {template.createdAt && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#4b5563]">
                        <Calendar size={12} />
                        {new Date(template.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 sm:mt-0 sm:ml-4 border-t sm:border-0 pt-3 sm:pt-0">
                <button
                  className="p-2 rounded-full hover:bg-[#f3f4f6] transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTemplate(template);
                  }}
                  aria-label="Edit template"
                >
                  <Edit2 size={16} className="text-[#4b5563]" />
                </button>
                
                <button
                  className="p-2 rounded-full hover:bg-[#f3f4f6] transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(template);
                  }}
                  aria-label="Duplicate template"
                >
                  <Copy size={16} className="text-[#4b5563]" />
                </button>
                
                {/* Always show delete button for custom templates, never for defaults */}
                {(template.isCustom || !template.isDefault) && (
                  <button
                    className="p-2 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(template);
                    }}
                    aria-label="Delete template"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name || ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default TemplateList;
