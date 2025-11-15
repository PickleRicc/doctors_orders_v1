/**
 * WYSIWYG Editor Component
 * Clean, minimal rich text editor for SOAP note sections
 * Uses TipTap editor with glassmorphism styling
 * Follows design system with floating toolbar and smooth interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Type
} from 'lucide-react';

const WYSIWYGEditor = ({ 
  content = '', 
  placeholder = 'Start typing...', 
  onChange, 
  onFocus, 
  onBlur,
  className = '' 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    onFocus: () => {
      setIsFocused(true);
      setShowToolbar(true);
      onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      // Delay hiding toolbar to allow toolbar clicks
      setTimeout(() => setShowToolbar(false), 200);
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[120px] p-4',
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const ToolbarButton = ({ onClick, isActive, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-primary text-white shadow-md' 
          : 'bg-white/25 dark:bg-[#1f1f1f] border border-white/20 dark:border-white/10 hover:bg-white/35 dark:hover:bg-[#2a2a2a]'
        }
      `}
      title={label}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-grey-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`wysiwyg-editor relative ${className}`} ref={editorRef}>
      {/* Floating Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute -top-16 left-0 z-20 flex items-center gap-1 bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg transition-colors"
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={Bold}
              label="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={Italic}
              label="Italic"
            />
            
            <div className="w-px h-6 bg-grey-300 dark:bg-white/10 mx-2" />
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={List}
              label="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={ListOrdered}
              label="Numbered List"
            />
            
            <div className="w-px h-6 bg-grey-300 dark:bg-white/10 mx-2" />
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={Quote}
              label="Quote"
            />
            
            <div className="w-px h-6 bg-grey-300 dark:bg-white/10 mx-2" />
            
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              isActive={false}
              icon={Undo}
              label="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              isActive={false}
              icon={Redo}
              label="Redo"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Content */}
      <div 
          className={`
          editor-content transition-all duration-300 rounded-lg
          ${isFocused 
            ? 'ring-2 ring-blue-primary/20 dark:ring-blue-primary/30 bg-white/30 dark:bg-[#1f1f1f]' 
            : 'bg-white/10 dark:bg-[#1f1f1f]/50 hover:bg-white/20 dark:hover:bg-[#1f1f1f]'
          }
        `}
      >
        <EditorContent 
          editor={editor} 
          className="min-h-[120px]"
        />
      </div>

      {/* Character Count (if content exists) */}
      {content && content.length > 50 && (
        <div className="absolute bottom-2 right-3 text-xs text-grey-500 dark:text-grey-400">
          {editor.storage.characterCount?.characters() || content.length} characters
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .wysiwyg-editor .ProseMirror {
          outline: none;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #111827;
        }

        .dark .wysiwyg-editor .ProseMirror {
          color: #e5e5e5;
        }

        .wysiwyg-editor .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        .dark .wysiwyg-editor .ProseMirror.is-editor-empty:first-child::before {
          color: #6a6a6a;
        }

        .wysiwyg-editor .ProseMirror p {
          margin: 0.75rem 0;
        }

        .wysiwyg-editor .ProseMirror p:first-child {
          margin-top: 0;
        }

        .wysiwyg-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        .wysiwyg-editor .ProseMirror ul,
        .wysiwyg-editor .ProseMirror ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .wysiwyg-editor .ProseMirror li {
          margin: 0.25rem 0;
        }

        .wysiwyg-editor .ProseMirror blockquote {
          border-left: 3px solid #2563eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .dark .wysiwyg-editor .ProseMirror blockquote {
          border-left-color: var(--blue-primary);
          color: #9a9a9a;
        }

        .wysiwyg-editor .ProseMirror strong {
          font-weight: 600;
          color: #111827;
        }

        .dark .wysiwyg-editor .ProseMirror strong {
          color: #e5e5e5;
        }

        .wysiwyg-editor .ProseMirror em {
          font-style: italic;
          color: #374151;
        }

        .dark .wysiwyg-editor .ProseMirror em {
          color: #9a9a9a;
        }

        .wysiwyg-editor .ProseMirror h1,
        .wysiwyg-editor .ProseMirror h2,
        .wysiwyg-editor .ProseMirror h3 {
          font-weight: 600;
          color: #111827;
          margin: 1rem 0 0.5rem 0;
        }

        .dark .wysiwyg-editor .ProseMirror h1,
        .dark .wysiwyg-editor .ProseMirror h2,
        .dark .wysiwyg-editor .ProseMirror h3 {
          color: #e5e5e5;
        }

        .wysiwyg-editor .ProseMirror h1 {
          font-size: 1.5rem;
        }

        .wysiwyg-editor .ProseMirror h2 {
          font-size: 1.25rem;
        }

        .wysiwyg-editor .ProseMirror h3 {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
};

export default WYSIWYGEditor;
