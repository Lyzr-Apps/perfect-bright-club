import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/gmail
 * Send credit calculation results via Gmail
 *
 * SECURITY:
 * - API key stored server-side only (never exposed to client)
 * - Gmail integration handled through Lyzr's secure tool system
 *
 * USAGE:
 * Send calculation results to user's Gmail account
 *
 * @example
 * const response = await fetch('/api/gmail', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     agentId: "...",
 *     recipientEmail: "user@example.com",
 *     subjectLine: "Credit Calculation Results",
 *     bodyContent: "...",
 *     calculationData: { ... }
 *   })
 * })
 */

const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/'
const LYZR_API_KEY = process.env.LYZR_API_KEY

interface GmailRequest {
  agentId: string
  recipientEmail: string
  subjectLine: string
  bodyContent: string
  calculationData?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Check API key is configured
    if (!LYZR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'LYZR_API_KEY not configured in .env.local',
        },
        { status: 500 }
      )
    }

    const body: GmailRequest = await request.json()

    // Validate required fields
    if (!body.agentId || !body.recipientEmail || !body.subjectLine || !body.bodyContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: agentId, recipientEmail, subjectLine, and bodyContent are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Build the message that will trigger the Gmail tool
    const message = `Please send an email using Gmail with the following details:

To: ${body.recipientEmail}
Subject: ${body.subjectLine}

Body:
${body.bodyContent}

${body.calculationData ? `\nCalculation Data:\n${JSON.stringify(body.calculationData, null, 2)}` : ''}

Use the Gmail integration tool to send this email. Confirm when the email has been sent successfully.`

    // Call Lyzr API with agent that has Gmail integration
    const response = await fetch(LYZR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LYZR_API_KEY,
      },
      body: JSON.stringify({
        user_id: `gmail-user-${Date.now()}`,
        agent_id: body.agentId,
        session_id: `gmail-session-${Date.now()}`,
        message: message,
      }),
    })

    if (response.ok) {
      const data = await response.json()

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        response: data.response,
        recipient: body.recipientEmail,
        timestamp: new Date().toISOString(),
      })
    } else {
      const errorText = await response.text()
      console.error('Gmail API error:', response.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send email. Status: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Gmail API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
