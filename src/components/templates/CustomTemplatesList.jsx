/**
 * Custom Templates List Component
 * Displays and manages user's custom SOAP note templates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Star, Copy, Search, 
  FileText, Calendar, TrendingUp 
} from 'lucide-react';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import TemplateBuilder from './TemplateBuilder';

export default function CustomTemplatesList() {
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    duplicateTemplate,
    getTemplate
  } = useCustomTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.body_region?.toLowerCase().includes(query)
    );
  });

  // Handle create/edit
  const handleSaveTemplate = async (templateData) => {
    console.log('📝 CustomTemplatesList: Saving template data:', templateData);
    
    let result;
    if (editingTemplate) {
      console.log('Updating template:', editingTemplate.id);
      result = await updateTemplate(editingTemplate.id, templateData);
    } else {
      console.log('Creating new template');
      result = await createTemplate(templateData);
    }

    console.log('Save result:', result);
    
    if (result.success) {
      console.log('✅ Template saved successfully!');
      setIsBuilderOpen(false);
      setEditingTemplate(null);
    } else {
      console.error('❌ Failed to save template:', result.error);
      alert(`Failed to save template: ${result.error}`);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      setDeletingId(id);
      await deleteTemplate(id);
      setDeletingId(null);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (id) => {
    const result = await duplicateTemplate(id);
    if (result.success) {
      // Optionally open for editing
      setEditingTemplate(result.template);
      setIsBuilderOpen(true);
    }
  };

  // Handle edit
  const handleEdit = async (template) => {
    console.log('✏️ Edit clicked for template:', template);
    console.log('Template config from list:', template.template_config);
    
    // Fetch full template with config if not already present
    if (!template.template_config || Object.keys(template.template_config).length === 0) {
      console.log('⚠️ Template config missing, fetching full template...');
      const fullTemplate = await getTemplate(template.id);
      console.log('📄 Full template fetched:', fullTemplate);
      setEditingTemplate(fullTemplate);
    } else {
      setEditingTemplate(template);
    }
    
    setIsBuilderOpen(true);
  };

  // Handle new template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsBuilderOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Show template builder
  if (isBuilderOpen) {
    return (
      <TemplateBuilder
        initialTemplate={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setIsBuilderOpen(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-grey-900 dark:text-grey-100 mb-2">
            My Templates
          </h1>
          <p className="text-grey-600 dark:text-grey-400">
            Create and manage your custom SOAP note templates
          </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-blue-primary"
            />
          </div>

          {/* Create New Button */}
          <button
            onClick={handleNewTemplate}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create New Template
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div 
              className="w-12 h-12 border-4 border-blue-primary border-t-transparent rounded-full animate-spin mb-4"
            />
            <p className="text-grey-500 dark:text-grey-400">Loading templates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-24 h-24 bg-grey-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-grey-400" />
            </div>
            <h3 className="text-xl font-semibold text-grey-900 dark:text-grey-100 mb-2">
              No Custom Templates Yet
            </h3>
            <p className="text-grey-600 dark:text-grey-400 text-center mb-6 max-w-md">
              Create your first custom template to streamline your documentation workflow
            </p>
            <button
              onClick={handleNewTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Template
            </button>
          </motion.div>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-100">
                          {template.name}
                        </h3>
                        {template.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-grey-600 dark:text-grey-400 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFavorite(template.id, template.is_favorite)}
                      className="p-2 hover:bg-grey-100 dark:hover:bg-[#0f0f0f] rounded-lg transition-colors"
                      title={template.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          template.is_favorite 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-grey-400'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    {template.body_region && (
                      <div className="flex items-center gap-2 text-sm text-grey-600 dark:text-grey-400">
                        <FileText className="w-4 h-4" />
                        <span className="capitalize">
                          {template.body_region.replace('-', '/')}
                          {template.session_type && ` • ${template.session_type}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-grey-600 dark:text-grey-400">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(template.created_at)}</span>
                    </div>
                    {template.usage_count > 0 && (
                      <div className="flex items-center gap-2 text-sm text-grey-600 dark:text-grey-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Used {template.usage_count} times</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-grey-200 dark:border-white/10">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-grey-100 dark:bg-[#0f0f0f] text-grey-700 dark:text-grey-300 rounded-lg hover:bg-grey-200 dark:hover:bg-[#1f1f1f] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-grey-100 dark:bg-[#0f0f0f] text-grey-700 dark:text-grey-300 rounded-lg hover:bg-grey-200 dark:hover:bg-[#1f1f1f] transition-colors"
                      title="Duplicate template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deletingId === template.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      title="Delete template"
                    >
                      {deletingId === template.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No Search Results */}
        {!loading && templates.length > 0 && filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-grey-400 mb-4" />
            <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-100 mb-2">
              No templates match your search
            </h3>
            <p className="text-grey-600 dark:text-grey-400">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

