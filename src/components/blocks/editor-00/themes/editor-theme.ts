import type { EditorThemeClasses } from 'lexical'

export const editorTheme: EditorThemeClasses = {
  paragraph: 'my-2',
  heading: {
    h1: 'text-3xl font-bold my-4',
    h2: 'text-2xl font-bold my-3',
    h3: 'text-xl font-bold my-2',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    'text-xs': 'text-xs',
    'text-sm': 'text-sm',
    'text-base': 'text-base',
    'text-lg': 'text-lg',
    'text-xl': 'text-xl',
  },
  list: {
    ul: 'list-disc list-inside my-2 ml-2',
    ol: 'list-decimal list-inside my-2 ml-2',
    listitem: 'my-1',
  },
} 