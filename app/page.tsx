'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Send,
  FileText,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  MessageSquare,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Plus,
  Settings,
  X,
  File,
  AlertCircle,
  BookOpen,
  Sparkles,
  Database,
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Agent and RAG configuration
const AGENT_ID = '69735b7e1b6268d7b9512d01'
const RAG_ID = '69735b69115a3970d17427d5'

// TypeScript interfaces from actual response schema
interface Source {
  document?: string
  page?: number
  excerpt?: string
  [key: string]: any
}

interface AgentResult {
  answer: string
  sources: Source[]
  confidence: number
  related_topics: any[]
  follow_up_suggestions: string[]
}

interface AgentResponse {
  status: string
  result: AgentResult
  metadata?: {
    agent_name?: string
    timestamp?: string
    documents_searched?: string
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  response?: AgentResult
  isError?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface UploadedDocument {
  id: string
  name: string
  uploadDate: Date
  pageCount?: number
  status: 'indexed' | 'processing' | 'failed'
  size?: number
}

// Main page component
export default function KnowledgeSearchPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSources, setShowSources] = useState(true)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    // Create conversation if none exists
    let convId = currentConversationId
    if (!convId) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: inputMessage.slice(0, 50),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setConversations(prev => [newConv, ...prev])
      convId = newConv.id
      setCurrentConversationId(convId)
    }

    // Add user message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 0 ? inputMessage.slice(0, 50) : conv.title,
              updatedAt: new Date(),
            }
          : conv
      )
    )

    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await callAIAgent(inputMessage, AGENT_ID, {
        session_id: convId,
      })

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      if (result.success && result.response) {
        // Parse response
        const agentResponse: AgentResponse = result.response

        assistantMessage.content = agentResponse.result?.answer || 'No answer provided'
        assistantMessage.response = agentResponse.result
        assistantMessage.isError = agentResponse.status === 'error'
      } else {
        assistantMessage.content = result.error || 'Failed to get response'
        assistantMessage.isError = true
      }

      // Add assistant message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      )
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'An error occurred while processing your request',
        timestamp: new Date(),
        isError: true,
      }

      setConversations(prev =>
        prev.map(conv =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage()
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate PDF
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file`)
        continue
      }

      // Create document entry
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        uploadDate: new Date(),
        status: 'processing',
        size: file.size,
      }

      setDocuments(prev => [newDoc, ...prev])

      try {
        // Upload to RAG knowledge base
        const formData = new FormData()
        formData.append('file', file)
        formData.append('rag_id', RAG_ID)

        const response = await fetch('/api/rag/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          setDocuments(prev =>
            prev.map(d =>
              d.id === newDoc.id
                ? { ...d, status: 'indexed' as const }
                : d
            )
          )
        } else {
          setDocuments(prev =>
            prev.map(d =>
              d.id === newDoc.id
                ? { ...d, status: 'failed' as const }
                : d
            )
          )
        }
      } catch (error) {
        setDocuments(prev =>
          prev.map(d =>
            d.id === newDoc.id
              ? { ...d, status: 'failed' as const }
              : d
          )
        )
      }

      setUploadProgress(((i + 1) / files.length) * 100)
    }

    setTimeout(() => setUploadProgress(null), 1000)
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const bgClass = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-gray-50'
  const cardBgClass = theme === 'dark' ? 'bg-[#16213e]' : 'bg-white'
  const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const accentClass = 'text-[#4361ee]'

  return (
    <div className={cn('min-h-screen', bgClass, textClass)}>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full border-r transition-all duration-300 z-10',
          borderClass,
          cardBgClass,
          sidebarCollapsed ? 'w-0' : 'w-60'
        )}
      >
        {!sidebarCollapsed && (
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4361ee] to-[#3a51d6] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">KnowledgeAI</span>
            </div>

            {/* New Chat Button */}
            <Button
              onClick={handleNewChat}
              className="w-full mb-4 bg-[#4361ee] hover:bg-[#3a51d6] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            {/* Conversation History */}
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      currentConversationId === conv.id
                        ? 'bg-[#4361ee] text-white'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{conv.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            {/* Manage Knowledge Link */}
            <Button
              onClick={() => setShowKnowledgePanel(true)}
              variant="ghost"
              className="w-full justify-start mb-2"
            >
              <Database className="w-4 h-4 mr-2" />
              Manage Knowledge
            </Button>

            {/* Theme Toggle */}
            <Button onClick={toggleTheme} variant="ghost" className="w-full justify-start">
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={cn(
          'fixed top-4 z-20 p-2 rounded-r-lg transition-all',
          cardBgClass,
          borderClass,
          'border-l-0',
          sidebarCollapsed ? 'left-0' : 'left-60'
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Main Chat Area */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-0' : 'ml-60'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
          {/* Welcome Message or Chat */}
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-[#4361ee] to-[#3a51d6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  Knowledge Search Assistant
                </h1>
                <p className={cn('text-lg mb-8', mutedTextClass)}>
                  Ask questions about your documents and get instant, accurate answers with citations
                </p>

                {/* Suggested Queries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {[
                    'What are the main topics covered in the documents?',
                    'Summarize the key findings from the research',
                    'Find information about specific terminology',
                    'Compare different sections of the documents',
                  ].map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(query)}
                      className={cn(
                        'px-4 py-3 rounded-lg text-sm text-left transition-colors border',
                        borderClass,
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      )}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-4 px-4 mb-4">
              <div className="space-y-6 py-4">
                {currentConversation.messages.map(message => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    theme={theme}
                    showSources={showSources}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-[#4361ee]" />
                    <span className={mutedTextClass}>Searching knowledge base...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className={cn('border-t pt-4', borderClass)}>
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything about your documents..."
                className={cn(
                  'pr-24 h-12 text-base',
                  theme === 'dark'
                    ? 'bg-[#16213e] border-gray-700 focus:border-[#4361ee]'
                    : 'bg-white border-gray-300 focus:border-[#4361ee]'
                )}
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd
                  className={cn(
                    'hidden sm:inline-block px-2 py-1 text-xs rounded border',
                    mutedTextClass,
                    borderClass
                  )}
                >
                  ⌘+Enter
                </kbd>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-[#4361ee] hover:bg-[#3a51d6] text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Management Panel */}
      {showKnowledgePanel && (
        <KnowledgePanel
          theme={theme}
          documents={documents}
          uploadProgress={uploadProgress}
          onClose={() => setShowKnowledgePanel(false)}
          onFileUpload={handleFileUpload}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
    </div>
  )
}

// Message Bubble Component
function MessageBubble({
  message,
  theme,
  showSources,
}: {
  message: Message
  theme: 'dark' | 'light'
  showSources: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set())

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSourceExpansion = (index: number) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#4361ee] text-white px-4 py-3 rounded-2xl rounded-tr-sm">
          {message.content}
        </div>
      </div>
    )
  }

  const cardBgClass = theme === 'dark' ? 'bg-[#16213e]' : 'bg-gray-100'
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-3">
        {/* Main Response */}
        <div className={cn('px-4 py-3 rounded-2xl rounded-tl-sm', cardBgClass)}>
          {message.isError ? (
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{message.content}</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {message.content}
            </div>
          )}

          {/* Action Buttons */}
          {!message.isError && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <ThumbsUp className="w-3 h-3 mr-1" />
                Helpful
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <ThumbsDown className="w-3 h-3 mr-1" />
                Not Helpful
              </Button>
            </div>
          )}
        </div>

        {/* Sources */}
        {showSources && message.response?.sources && message.response.sources.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <FileText className="w-3 h-3" />
              <span>Sources ({message.response.sources.length})</span>
            </div>
            {message.response.sources.map((source, idx) => (
              <SourceCard
                key={idx}
                source={source}
                index={idx}
                theme={theme}
                isExpanded={expandedSources.has(idx)}
                onToggle={() => toggleSourceExpansion(idx)}
              />
            ))}
          </div>
        )}

        {/* Confidence & Metadata */}
        {message.response && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {message.response.confidence !== undefined && (
              <Badge variant="secondary" className="font-normal">
                Confidence: {(message.response.confidence * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        )}

        {/* Follow-up Suggestions */}
        {message.response?.follow_up_suggestions && message.response.follow_up_suggestions.length > 0 && (
          <div className="space-y-2">
            <div className={cn('text-xs font-semibold', mutedTextClass)}>
              Suggested follow-ups:
            </div>
            <div className="space-y-1">
              {message.response.follow_up_suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors',
                    borderClass,
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Source Card Component
function SourceCard({
  source,
  index,
  theme,
  isExpanded,
  onToggle,
}: {
  source: Source
  index: number
  theme: 'dark' | 'light'
  isExpanded: boolean
  onToggle: () => void
}) {
  const cardBgClass = theme === 'dark' ? 'bg-[#0f1729]' : 'bg-white'
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={cn('border rounded-lg p-3', cardBgClass, borderClass)}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#4361ee] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <File className="w-3 h-3 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {source.document || 'Unknown Document'}
              </span>
              {source.page && (
                <Badge variant="outline" className="text-xs">
                  Page {source.page}
                </Badge>
              )}
            </div>
            {source.excerpt && (
              <p className={cn('text-xs', isExpanded ? '' : 'line-clamp-2')}>
                {source.excerpt}
              </p>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

// Knowledge Management Panel Component
function KnowledgePanel({
  theme,
  documents,
  uploadProgress,
  onClose,
  onFileUpload,
  onDeleteDocument,
}: {
  theme: 'dark' | 'light'
  documents: UploadedDocument[]
  uploadProgress: number | null
  onClose: () => void
  onFileUpload: (files: FileList | null) => void
  onDeleteDocument: (id: string) => void
}) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files)
    }
  }

  const bgClass = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'
  const cardBgClass = theme === 'dark' ? 'bg-[#16213e]' : 'bg-gray-50'
  const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  const totalSize = documents.reduce((acc, doc) => acc + (doc.size || 0), 0)
  const storageLimit = 1024 * 1024 * 1024 // 1GB
  const storagePercentage = (totalSize / storageLimit) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className={cn('w-full max-w-4xl max-h-[90vh] flex flex-col', bgClass, textClass)}>
        <CardHeader className={cn('border-b', borderClass)}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Knowledge Base Management</CardTitle>
              <CardDescription className={mutedTextClass}>
                Upload and manage your PDF documents
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          {/* Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors mb-6',
              dragActive ? 'border-[#4361ee] bg-[#4361ee]/10' : borderClass,
              cardBgClass
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className={cn('w-12 h-12 mx-auto mb-4', mutedTextClass)} />
            <h3 className="text-lg font-semibold mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className={cn('text-sm mb-4', mutedTextClass)}>
              Supports PDF documents only. Upload multiple files at once.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#4361ee] hover:bg-[#3a51d6] text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>

            {uploadProgress !== null && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className={cn('text-xs mt-2', mutedTextClass)}>
                  Uploading... {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Storage Indicator */}
          <div className={cn('rounded-lg p-4 mb-6', cardBgClass)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm">
                {(totalSize / 1024 / 1024).toFixed(2)} MB / {(storageLimit / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <File className="w-4 h-4" />
              Documents ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <div className={cn('text-center py-12 rounded-lg', cardBgClass)}>
                <FileText className={cn('w-12 h-12 mx-auto mb-3', mutedTextClass)} />
                <p className={mutedTextClass}>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border',
                      cardBgClass,
                      borderClass
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 flex-shrink-0 text-red-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={mutedTextClass}>
                            {doc.uploadDate.toLocaleDateString()}
                          </span>
                          {doc.size && (
                            <span className={mutedTextClass}>
                              {(doc.size / 1024).toFixed(2)} KB
                            </span>
                          )}
                          <Badge
                            variant={
                              doc.status === 'indexed'
                                ? 'default'
                                : doc.status === 'processing'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {doc.status === 'indexed' && 'Indexed'}
                            {doc.status === 'processing' && (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Processing
                              </>
                            )}
                            {doc.status === 'failed' && 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
