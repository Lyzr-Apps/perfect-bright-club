import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED: This endpoint has been superseded by agent-integrated email sending
 *
 * The Gmail tool integration is now handled directly by the Credit Calculator agent
 * via the /api/calculate endpoint with sendEmail and recipientEmail parameters.
 *
 * Old endpoints are kept for backward compatibility but will redirect to the new flow.
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Deprecated endpoint. Use /api/calculate with sendEmail parameter instead.',
      message: 'Email sending is now integrated into the agent workflow. Pass sendEmail: true and recipientEmail to /api/calculate endpoint.',
    },
    { status: 410 } // 410 Gone - resource no longer available
  )
}

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
