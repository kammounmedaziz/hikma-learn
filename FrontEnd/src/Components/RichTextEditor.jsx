// src/components/RichTextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';

// Custom FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Curated font options (accessible, including dyslexia-friendly)
const fontOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'OpenDyslexic', value: 'OpenDyslexic, sans-serif' },
  { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
];

// WCAG-compliant color palette
const colorOptions = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Gray', value: '#333333' },
  { label: 'Blue', value: '#1e40af' },
  { label: 'Red', value: '#b91c1c' },
];

// Font size options
const sizeOptions = [
  { label: '12px', value: '12px' },
  { label: '16px', value: '16px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
];

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] }, // H1, H2 only
      }),
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      Color.configure({ types: ['textStyle'] }),
      FontSize.configure({ types: ['textStyle'] }), // Use embedded FontSize extension
    ],
    content: content || '<p>Enter text</p>', // Wrap plain text in <p> tags
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html); // Empty editor returns empty string
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-600 rounded bg-gray-800 rich-text-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-600 bg-gray-900">
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || ''}
          className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          aria-label="Select font type"
        >
          <option value="">Default Font</option>
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontSize || ''}
          className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          aria-label="Select font size"
        >
          <option value="">Default Size</option>
          {sizeOptions.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          value={editor.getAttributes('textStyle').color || ''}
          className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          aria-label="Select text color"
        >
          <option value="">Default Color</option>
          {colorOptions.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle bold"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle italic"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('underline') ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle underline"
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Align left"
        >
          ←
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Align center"
        >
          ↔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Align right"
        >
          →
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle bullet list"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle numbered list"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          aria-label="Toggle heading 2"
        >
          H2
        </button>
      </div>
      <EditorContent editor={editor} className="p-2 text-white min-h-[150px] ProseMirror" />
    </div>
  );
};

export default RichTextEditor;