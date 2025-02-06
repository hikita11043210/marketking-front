import { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CodeNode } from '@lexical/code'

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  LinkNode,
  QuoteNode,
  CodeNode
]