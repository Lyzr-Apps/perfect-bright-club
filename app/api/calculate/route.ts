import { NextRequest, NextResponse } from 'next/server'

const AGENT_ID = '694263a24f5531c6f3c7055a'
const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/'
const LYZR_API_KEY = process.env.LYZR_API_KEY

interface CalculateRequest {
  problemStatement: string
  sessionsPerMonth: number
  queriesPerSession: number
  modelType: string
  avgInputTokens: number
  avgOutputTokens: number
  sendEmail?: boolean
  recipientEmail?: string
}

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

// Parse agent response and extract structured data
function parseAgentResponse(rawResponse: string): CalculationResult {
  // Default values based on the problem statement
  const baselineAgents = 2
  const baselineKBs = 1
  const baselineTools = 3

  // Model pricing per 1K tokens (approximate)
  const modelPricing: { [key: string]: { input: number; output: number } } = {
    'GPT-4.1': { input: 0.03, output: 0.06 },
    'GPT-5': { input: 0.05, output: 0.1 },
    'Mini': { input: 0.0005, output: 0.0015 },
    'Nano': { input: 0.00025, output: 0.00075 },
  }

  // Try to extract values from the raw response
  const agentMatch = rawResponse.match(/(\d+)\s*agent/i)
  const kbMatch = rawResponse.match(/(\d+)\s*knowledge\s*base/i)
  const toolMatch = rawResponse.match(/(\d+)\s*tool/i)

  const agents_count = agentMatch ? parseInt(agentMatch[1]) : baselineAgents
  const knowledge_bases_count = kbMatch ? parseInt(kbMatch[1]) : baselineKBs
  const tools_required = toolMatch ? parseInt(toolMatch[1]) : baselineTools

  // Calculate costs based on input parameters
  // Note: Extract these from the request in a real scenario
  const creationCosts = (agents_count * 50 + knowledge_bases_count * 100 + tools_required * 75) * 1.2

  // Assume these values come from the actual request context
  const sessionsPerMonth = 1000
  const queriesPerSession = 5
  const avgInputTokens = 500
  const avgOutputTokens = 1000
  const modelType = 'GPT-4.1'

  const totalQueries = sessionsPerMonth * queriesPerSession
  const totalInputTokens = totalQueries * avgInputTokens
  const totalOutputTokens = totalQueries * avgOutputTokens

  const pricing = modelPricing[modelType] || modelPricing['GPT-4.1']
  const modelCosts =
    (totalInputTokens * pricing.input) / 1000 + (totalOutputTokens * pricing.output) / 1000

  const retrievalCosts = totalQueries * 0.005

  const total_monthly = creationCosts + retrievalCosts + modelCosts

  const memory_requirements =
    agents_count > 2
      ? '8GB - 16GB RAM'
      : agents_count === 2
        ? '4GB - 8GB RAM'
        : '2GB - 4GB RAM'

  const rai_requirements = agents_count > 3 ? 'Advanced RAI' : 'Standard RAI'

  return {
    agents_count,
    knowledge_bases_count,
    tools_required,
    memory_requirements,
    rai_requirements,
    cost_breakdown: {
      creation_costs: Math.round(creationCosts * 100) / 100,
      retrieval_costs: Math.round(retrievalCosts * 100) / 100,
      model_costs: Math.round(modelCosts * 100) / 100,
      total_monthly: Math.round(total_monthly * 100) / 100,
    },
    architecture_description: rawResponse,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json()
    console.log('Received calculation request:', body)

    // Validate input
    if (!body.problemStatement || !body.problemStatement.trim()) {
      return NextResponse.json(
        { success: false, error: 'Problem statement is required' },
        { status: 400 }
      )
    }

    // Build the message for the agent
    let message = `
You are a credit calculator coordinator for a Lyzr AI application system.
Based on the following problem statement and usage parameters, estimate the required architecture components and costs.

Problem Statement: ${body.problemStatement}

Usage Parameters:
- Sessions per Month: ${body.sessionsPerMonth}
- Queries per Session: ${body.queriesPerSession}
- Model Type: ${body.modelType}
- Average Input Tokens per Query: ${body.avgInputTokens}
- Average Output Tokens per Response: ${body.avgOutputTokens}

Respond with a clear analysis including:
1. Estimated number of agents needed
2. Number of knowledge bases required
3. Tools and integrations needed
4. Memory requirements
5. RAI requirements level

Format your response clearly with these sections.
`

    // If email sending is requested, add instruction to agent
    if (body.sendEmail && body.recipientEmail) {
      message += `

IMPORTANT: After providing the analysis, please use the Gmail tool to send an email to: ${body.recipientEmail}

Email Details:
- Subject: "Your Lyzr Credit Calculator Estimate"
- Include all the analysis details above in the email body
- Format it professionally with clear sections
- Add the cost breakdown and monthly/annual projections

Please send this email using the Gmail tool and confirm when sent.`
    }

    let rawResponse = ''

    // Try to call Lyzr API if key is available
    if (LYZR_API_KEY) {
      try {
        const agentResponse = await fetch(LYZR_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': LYZR_API_KEY,
          },
          body: JSON.stringify({
            user_id: `calculator-${Date.now()}`,
            agent_id: AGENT_ID,
            session_id: `session-${Date.now()}`,
            message: message,
          }),
        })

        if (agentResponse.ok) {
          const agentData = await agentResponse.json()
          rawResponse = agentData.response || agentData.message || JSON.stringify(agentData)
          console.log('Agent API response received')
        } else {
          console.log('Agent API returned', agentResponse.status, 'using fallback')
          rawResponse = generateDefaultResponse(body)
        }
      } catch (apiError) {
        console.error('Agent API error:', apiError)
        rawResponse = generateDefaultResponse(body)
      }
    } else {
      console.log('No LYZR_API_KEY configured, using fallback')
      rawResponse = generateDefaultResponse(body)
    }

    // Parse the response and extract structured data
    const calculationResult = parseAgentResponse(rawResponse)
    console.log('Parsed result:', calculationResult)

    // Override with actual parameter values for accurate cost calculation
    const modelPricing: { [key: string]: { input: number; output: number } } = {
      'GPT-4.1': { input: 0.03, output: 0.06 },
      'GPT-5': { input: 0.05, output: 0.1 },
      'Mini': { input: 0.0005, output: 0.0015 },
      'Nano': { input: 0.00025, output: 0.00075 },
    }

    const totalQueries = body.sessionsPerMonth * body.queriesPerSession
    const totalInputTokens = totalQueries * body.avgInputTokens
    const totalOutputTokens = totalQueries * body.avgOutputTokens

    const pricing = modelPricing[body.modelType] || modelPricing['GPT-4.1']
    const modelCosts =
      (totalInputTokens * pricing.input) / 1000 + (totalOutputTokens * pricing.output) / 1000

    const retrievalCosts = totalQueries * 0.005

    const creationCosts =
      (calculationResult.agents_count * 50 +
        calculationResult.knowledge_bases_count * 100 +
        calculationResult.tools_required * 75) *
      1.2

    const totalMonthly = creationCosts + retrievalCosts + modelCosts

    calculationResult.cost_breakdown = {
      creation_costs: Math.round(creationCosts * 100) / 100,
      retrieval_costs: Math.round(retrievalCosts * 100) / 100,
      model_costs: Math.round(modelCosts * 100) / 100,
      total_monthly: Math.round(totalMonthly * 100) / 100,
    }

    return NextResponse.json({
      success: true,
      data: calculationResult,
      raw_response: rawResponse,
    })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

function generateDefaultResponse(params: CalculateRequest): string {
  let response = `Based on the problem statement: "${params.problemStatement}"\n\n`

  // Heuristics for component estimation
  const hasKnowledgeBase = params.problemStatement.toLowerCase().includes('knowledge')
    ? 2
    : 1
  const hasMultipleFeatures = params.problemStatement.toLowerCase().split(' ').length > 5 ? 1 : 0
  const agents = 2 + hasMultipleFeatures

  response += `Architecture Analysis:\n`
  response += `- Required Agents: ${agents} agent(s)\n`
  response += `- Knowledge Bases: ${hasKnowledgeBase} knowledge base(s)\n`
  response += `- Required Tools: 3-4 integration tools\n\n`

  response += `Requirements:\n`
  response += `- Memory: ${agents > 2 ? '8GB - 16GB' : '4GB - 8GB'} RAM\n`
  response += `- RAI Level: ${agents > 3 ? 'Advanced' : 'Standard'}\n\n`

  response += `Cost Components:\n`
  const totalQueries = params.sessionsPerMonth * params.queriesPerSession
  response += `- Total Monthly Queries: ${totalQueries.toLocaleString()}\n`
  response += `- Model Type: ${params.modelType}\n`
  response += `- Token Usage: ${params.avgInputTokens} input, ${params.avgOutputTokens} output per query\n`

  return response
}
