import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    createCommand,
    LexicalCommand,
    TextNode,
} from 'lexical'
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getSelection, $isRangeSelection } from 'lexical'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List as ListIcon,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Link,
    Quote,
    Undo,
    Redo,
    Type,
} from 'lucide-react'

export const FORMAT_TEXT_SIZE_COMMAND: LexicalCommand<string> = createCommand('FORMAT_TEXT_SIZE_COMMAND')

export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()

    const formatBold = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
    }

    const formatItalic = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
    }

    const formatUnderline = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
    }

    const formatStrikethrough = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
    }

    const formatTextSize = (size: string) => {
        editor.dispatchCommand(FORMAT_TEXT_SIZE_COMMAND, size)
    }

    // Register the custom command
    editor.registerCommand(
        FORMAT_TEXT_SIZE_COMMAND,
        (size) => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach((node) => {
                    if (node instanceof TextNode) {
                        node.setFormat(node.getFormat())
                        const element = editor.getElementByKey(node.getKey())
                        if (element) {
                            // Remove existing size classes
                            element.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl')
                            // Add new size class
                            element.classList.add(size)
                        }

                    }
                })
                return true
            }
            return false
        },
        0
    )

    const insertUnorderedList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }

    const insertOrderedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }

    const formatHeading = (headingSize: HeadingTagType) => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize))
            }
        })
    }

    const formatHeading1 = () => formatHeading('h1')
    const formatHeading2 = () => formatHeading('h2')
    const formatHeading3 = () => formatHeading('h3')

    const undo = () => {
        editor.dispatchCommand(UNDO_COMMAND, undefined)
    }

    const redo = () => {
        editor.dispatchCommand(REDO_COMMAND, undefined)
    }

    return (
        <div className="flex items-center gap-1 p-2 border-b">
            <div className="flex items-center gap-1 mr-2">
                <Button type="button" variant="ghost" size="sm" onClick={undo}>
                    <Undo className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={redo}>
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-2">
                <Select onValueChange={formatTextSize}>
                    <SelectTrigger className="w-[100px] h-8">
                        <Type className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="文字サイズ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text-xs">極小</SelectItem>
                        <SelectItem value="text-sm">小</SelectItem>
                        <SelectItem value="text-base">中</SelectItem>
                        <SelectItem value="text-lg">大</SelectItem>
                        <SelectItem value="text-xl">極大</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-1 mr-2">
                <Button type="button" variant="ghost" size="sm" onClick={formatBold}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={formatItalic}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={formatUnderline}>
                    <Underline className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={formatStrikethrough}>
                    <Strikethrough className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-2">
                <Button type="button" variant="ghost" size="sm" onClick={insertUnorderedList}>
                    <ListIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={insertOrderedList}>
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={formatHeading1}>
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={formatHeading2}>
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={formatHeading3}>
                    <Heading3 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}