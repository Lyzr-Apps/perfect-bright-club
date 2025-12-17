'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FiChevronDown,
  FiChevronUp,
  FiZap,
  FiDatabase,
  FiTool,
  FiCpu,
  FiDownload,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiLoader,
} from 'react-icons/fi'

// Type definitions
interface CalculationResult {
  agents_count: number
  knowledge_bases_count: number
  tools_required: number
  memory_requirements: string
  rai_requirements: string
  cost_breakdown: {
    creation_costs: number
    retrieval_costs: number
    model_costs: number
    total_monthly: number
  }
  architecture_description: string
}

interface ApiResponse {
  success: boolean
  data?: CalculationResult
  error?: string
  raw_response?: string
}

// Main Page Component
export default function HomePage() {
  const [problemStatement, setProblemStatement] = useState(
    'Customer support chatbot with FAQ knowledge base'
  )
  const [sessionsPerMonth, setSessionsPerMonth] = useState(1000)
  const [queriesPerSession, setQueriesPerSession] = useState(5)
  const [modelType, setModelType] = useState('GPT-4.1')
  const [avgInputTokens, setAvgInputTokens] = useState(500)
  const [avgOutputTokens, setAvgOutputTokens] = useState(1000)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + 'px'
    }
  }, [problemStatement])

  const handleCalculate = async () => {
    if (!problemStatement.trim()) {
      alert('Please enter a problem statement')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemStatement,
          sessionsPerMonth,
          queriesPerSession,
          modelType,
          avgInputTokens,
          avgOutputTokens,
        }),
      })

      const data: ApiResponse = await response.json()

      if (data.success && data.data) {
        setResults(data.data)
      } else {
        alert('Error calculating credits: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error calculating credits: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyJSON = () => {
    const json = JSON.stringify(results, null, 2)
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => {
    if (!results) return
    alert('PDF export feature coming soon')
  }

  const monthlyTotal = results?.cost_breakdown.total_monthly ?? 0
  const annualTotal = monthlyTotal * 12

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center">
              <FiZap className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">Lyzr Credit Calculator</h1>
          </div>
          <p className="text-slate-400">Estimate your AI application costs and architecture requirements</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Problem Statement Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Problem Statement</h2>
              <label className="block text-sm text-slate-300 mb-2">Describe your use case</label>
              <textarea
                ref={textareaRef}
                value={problemStatement}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    setProblemStatement(e.target.value)
                  }
                }}
                placeholder="Customer support chatbot with FAQ knowledge base"
                className="w-full min-h-24 px-4 py-3 bg-slate-700 text-white placeholder-slate-500 rounded-lg border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-400">
                  {problemStatement.length} / 2000 characters
                </span>
              </div>
            </div>

            {/* Usage Assumptions Panel */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700 transition-colors"
              >
                <h2 className="text-xl font-semibold text-white">Usage Assumptions</h2>
                {isCollapsed ? (
                  <FiChevronDown className="text-slate-400 text-xl" />
                ) : (
                  <FiChevronUp className="text-slate-400 text-xl" />
                )}
              </button>

              {!isCollapsed && (
                <div className="px-6 py-4 space-y-6 border-t border-slate-700">
                  {/* Sessions Per Month */}
                  <InputField
                    label="Sessions per Month"
                    value={sessionsPerMonth}
                    onChange={setSessionsPerMonth}
                    min={100}
                    max={10000}
                    step={100}
                    tooltip="Total number of user sessions per month"
                  />

                  {/* Queries Per Session */}
                  <InputField
                    label="Queries per Session"
                    value={queriesPerSession}
                    onChange={setQueriesPerSession}
                    min={1}
                    max={50}
                    step={1}
                    tooltip="Average number of queries per session"
                  />

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Model Type
                    </label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option>GPT-4.1</option>
                      <option>GPT-5</option>
                      <option>Mini</option>
                      <option>Nano</option>
                    </select>
                  </div>

                  {/* Average Input Tokens */}
                  <InputField
                    label="Average Input Tokens"
                    value={avgInputTokens}
                    onChange={setAvgInputTokens}
                    min={100}
                    max={5000}
                    step={100}
                    tooltip="Average number of input tokens per query"
                  />

                  {/* Average Output Tokens */}
                  <InputField
                    label="Average Output Tokens"
                    value={avgOutputTokens}
                    onChange={setAvgOutputTokens}
                    min={100}
                    max={5000}
                    step={100}
                    tooltip="Average number of output tokens per response"
                  />
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Credits'
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {isLoading ? (
              <SkeletonLoader />
            ) : results ? (
              <>
                {/* Architecture Results Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Architecture Overview</h2>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <ArchitectureMetric
                      icon={<FiCpu className="text-2xl text-indigo-400" />}
                      label="Agents"
                      value={results.agents_count}
                    />
                    <ArchitectureMetric
                      icon={<FiDatabase className="text-2xl text-green-400" />}
                      label="Knowledge Bases"
                      value={results.knowledge_bases_count}
                    />
                    <ArchitectureMetric
                      icon={<FiTool className="text-2xl text-amber-400" />}
                      label="Tools"
                      value={results.tools_required}
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Memory Requirements:</span>
                      <span className="text-white font-medium">{results.memory_requirements}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">RAI Requirements:</span>
                      <span className="text-white font-medium">{results.rai_requirements}</span>
                    </div>
                  </div>

                  {/* Simple Flow Diagram */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-4">Architecture Flow</p>
                    <div className="flex items-center justify-between">
                      <FlowBox label="Input" />
                      <div className="flex-1 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 mx-2" />
                      <FlowBox label="Processing" />
                      <div className="flex-1 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 mx-2" />
                      <FlowBox label="Output" />
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                    <h2 className="text-xl font-semibold text-white">Cost Breakdown</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700 sticky top-0">
                        <tr className="border-b border-slate-600">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                            Component
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-3 text-sm text-slate-300">Creation Costs</td>
                          <td className="px-6 py-3 text-right text-sm text-white font-medium">
                            ${results.cost_breakdown.creation_costs.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-700 hover:bg-slate-700/50 bg-slate-700/20">
                          <td className="px-6 py-3 text-sm text-slate-300">Retrieval Costs</td>
                          <td className="px-6 py-3 text-right text-sm text-white font-medium">
                            ${results.cost_breakdown.retrieval_costs.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-3 text-sm text-slate-300">Model Costs</td>
                          <td className="px-6 py-3 text-right text-sm text-white font-medium">
                            ${results.cost_breakdown.model_costs.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-indigo-950/50 border-t-2 border-indigo-600">
                          <td className="px-6 py-4 text-sm font-semibold text-indigo-100">
                            Monthly Total
                          </td>
                          <td className="px-6 py-4 text-right text-lg font-bold text-indigo-300">
                            ${monthlyTotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-slate-700/30">
                          <td className="px-6 py-3 text-sm text-slate-400">Annual Projection</td>
                          <td className="px-6 py-3 text-right text-sm font-semibold text-green-400">
                            ${annualTotal.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assumptions Summary */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Calculation Basis</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <AssumptionItem label="Model" value={modelType} />
                    <AssumptionItem label="Sessions/Month" value={sessionsPerMonth.toLocaleString()} />
                    <AssumptionItem label="Queries/Session" value={queriesPerSession.toString()} />
                    <AssumptionItem label="Input Tokens" value={avgInputTokens.toLocaleString()} />
                    <AssumptionItem label="Output Tokens" value={avgOutputTokens.toLocaleString()} />
                    <AssumptionItem
                      label="Total Monthly Queries"
                      value={(sessionsPerMonth * queriesPerSession).toLocaleString()}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCalculate}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Recalculate
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDownload />
                    Export PDF
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <FiCheck />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy />
                        Copy JSON
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 shadow-xl flex items-center justify-center min-h-96">
                <div className="text-center">
                  <FiAlertCircle className="mx-auto text-4xl text-slate-500 mb-4" />
                  <p className="text-slate-400">
                    Enter your problem statement and click "Calculate Credits" to see results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Input Field Component
function InputField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  tooltip: string
}) {
  const [localValue, setLocalValue] = useState(value.toString())

  useEffect(() => {
    setLocalValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setLocalValue(v)
    if (v && !isNaN(Number(v))) {
      const num = Math.max(min, Math.min(max, Number(v)))
      onChange(num)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    onChange(num)
    setLocalValue(num.toString())
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-slate-300">{label}</label>
        <div className="group relative cursor-help">
          <FiAlertCircle className="text-slate-500 text-sm" />
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
          </div>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2"
      />
      <input
        type="number"
        value={localValue}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
      />
    </div>
  )
}

// Architecture Metric Component
function ArchitectureMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

// Flow Box Component
function FlowBox({ label }: { label: string }) {
  return (
    <div className="bg-slate-700 border border-indigo-500 rounded px-3 py-2 text-xs font-medium text-slate-200 flex-shrink-0">
      {label}
    </div>
  )
}

// Assumption Item Component
function AssumptionItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/30 rounded p-3 border border-slate-600">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  )
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-slate-700 border border-slate-700 rounded-xl p-6 h-48" />
      <div className="bg-slate-700 border border-slate-700 rounded-xl p-6 h-64" />
      <div className="bg-slate-700 border border-slate-700 rounded-xl p-6 h-40" />
      <div className="bg-slate-700 border border-slate-700 rounded-xl p-6 h-32" />
    </div>
  )
}
