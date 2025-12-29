'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Heading2,
    Heading3,
    Quote,
    Undo,
    Redo,
    Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useCallback, useRef } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

const MenuButton = ({
    onClick,
    isActive,
    children,
    title
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
            'p-2 rounded hover:bg-neutral-100 transition-colors',
            isActive && 'bg-neutral-200 text-brand-600'
        )}
    >
        {children}
    </button>
);

interface MenuBarProps {
    editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-neutral-50">
            <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </MenuButton>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </MenuButton>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote className="h-4 w-4" />
            </MenuButton>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            <MenuButton
                onClick={setLink}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <LinkIcon className="h-4 w-4" />
            </MenuButton>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </MenuButton>
        </div>
    );
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start typing...',
    className,
    minHeight = '200px'
}: RichTextEditorProps) {
    const isInternalChange = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-600 underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            isInternalChange.current = true;
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none prose-headings:text-neutral-900 prose-h2:text-lg prose-h2:font-bold prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-1 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600 prose-a:text-brand-600 prose-a:underline',
                style: `min-height: ${minHeight}`,
            },
        },
        immediatelyRender: false,
    });

    // Update content when prop changes externally (not from internal edits)
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (editor && content !== undefined) {
            const currentContent = editor.getHTML();
            // Only update if content is genuinely different (ignoring empty states)
            if (content !== currentContent && !(content === '' && currentContent === '<p></p>')) {
                editor.commands.setContent(content || '');
            }
        }
    }, [content, editor]);

    return (
        <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
            <MenuBar editor={editor} />
            <div className="p-4">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default RichTextEditor;
