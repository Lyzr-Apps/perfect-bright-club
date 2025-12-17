# Agent-Integrated Email via Gmail Tool

## Overview

The Lyzr Credit Calculator now uses an **agent-integrated approach** for sending emails. Instead of a separate endpoint, the Credit Calculator agent itself handles email sending through Lyzr's native Gmail tool.

## Architecture

### Previous Approach (Deprecated)
```
Frontend → /api/gmail → Agent API → Gmail Tool → User Email
```

### New Approach (Current)
```
Frontend → /api/calculate → Agent API → Gmail Tool → User Email
```

The agent now seamlessly integrates email sending as part of its workflow.

## How It Works

### Frontend Flow

1. User generates a calculation
2. User clicks "Send Email" button
3. Modal opens for email input
4. User enters email address
5. Frontend sends single request to `/api/calculate` with:
   - All calculation parameters
   - `sendEmail: true`
   - `recipientEmail: "user@example.com"`

### Backend Processing

1. API receives request with email flag
2. Constructs agent message with email instructions
3. If `sendEmail === true`, appends Gmail tool instructions to agent message
4. Sends message to Credit Calculator agent
5. Agent processes calculation AND sends email in one workflow
6. Returns both calculation results and email confirmation

### Request Format

```javascript
const response = await fetch('/api/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problemStatement: "Customer support chatbot...",
    sessionsPerMonth: 1000,
    queriesPerSession: 5,
    modelType: "GPT-4.1",
    avgInputTokens: 500,
    avgOutputTokens: 1000,
    sendEmail: true,           // NEW: Email flag
    recipientEmail: "user@example.com"  // NEW: Email address
  })
})
```

### Agent Instructions

When `sendEmail` is true, the agent receives:

```
IMPORTANT: After providing the analysis, please use the Gmail tool to send an email to: user@example.com

Email Details:
- Subject: "Your Lyzr Credit Calculator Estimate"
- Include all the analysis details above in the email body
- Format it professionally with clear sections
- Add the cost breakdown and monthly/annual projections

Please send this email using the Gmail tool and confirm when sent.
```

## Benefits

### 1. Simplified Architecture
- Single endpoint for both calculation and email
- No separate Gmail API route needed
- Cleaner frontend code
- Reduced API calls

### 2. Agent Control
- Agent manages entire workflow
- Can format email professionally
- Uses built-in Gmail tool
- Handles OAuth automatically

### 3. Better Integration
- Agent keeps context between calculation and email
- Can customize email based on analysis
- Professional formatting by agent
- Seamless user experience

### 4. Security
- API key still protected server-side
- Agent handles Gmail OAuth
- No frontend email logic
- All validation server-side

## Implementation Details

### Frontend Changes

**handleSendEmail() Function** in `/app/project/app/page.tsx`:
- Validates email format
- Calls `/api/calculate` with email parameters
- Includes all calculation data
- No separate email formatting needed
- Handles agent response with confirmation

### Backend Changes

**POST /api/calculate** in `/app/project/app/api/calculate/route.ts`:
- Accepts `sendEmail` and `recipientEmail` parameters
- Conditionally appends email instructions to agent message
- Agent processes both calculation and email
- Returns single response with both results

## API Interface

### Request
```json
{
  "problemStatement": "string",
  "sessionsPerMonth": number,
  "queriesPerSession": number,
  "modelType": "string",
  "avgInputTokens": number,
  "avgOutputTokens": number,
  "sendEmail": boolean (optional),
  "recipientEmail": "string" (optional, required if sendEmail=true)
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "agents_count": number,
    "knowledge_bases_count": number,
    "tools_required": number,
    "memory_requirements": "string",
    "rai_requirements": "string",
    "cost_breakdown": {
      "creation_costs": number,
      "retrieval_costs": number,
      "model_costs": number,
      "total_monthly": number
    },
    "architecture_description": "string"
  },
  "raw_response": "string"
}
```

## Deprecated Endpoint

**`/api/gmail`** is now deprecated (returns 410 Gone status).

Migration path:
- Old: Send to `/api/gmail` separately
- New: Include `sendEmail` in `/api/calculate` request

## Email Workflow

### What the Agent Does

1. Analyzes the problem statement
2. Generates architecture recommendations
3. Calculates costs
4. Formats professional email with:
   - Subject: "Your Lyzr Credit Calculator Estimate"
   - Architecture overview
   - Cost breakdown
   - Monthly/annual projections
5. Uses Gmail tool to send
6. Confirms delivery to user

### Email Content

The agent automatically includes:
- Complete architecture analysis
- All cost calculations
- Input parameters summary
- Professional formatting
- Clear sections and hierarchy

## Error Handling

### Validation Errors (Client-side)
- Empty email field
- Invalid email format
- Missing problem statement

### Processing Errors (Server-side)
- Missing API key
- Agent processing failure
- Gmail tool failure

### User Feedback
- Validation errors shown immediately in modal
- Processing errors shown in status message
- Success message with recipient email
- Auto-close modal on success

## Configuration

### Required
- `LYZR_API_KEY` in `.env.local` (existing)

### No Additional Setup
- Agent already configured with Gmail tool
- OAuth handled by Lyzr automatically
- No new environment variables

## Testing

### Test Scenario 1: Calculate with Email
```javascript
// Request calculation AND send email
const response = await fetch('/api/calculate', {
  method: 'POST',
  body: JSON.stringify({
    problemStatement: "E-commerce platform with AI recommendations",
    sessionsPerMonth: 5000,
    queriesPerSession: 3,
    modelType: "GPT-5",
    avgInputTokens: 750,
    avgOutputTokens: 500,
    sendEmail: true,
    recipientEmail: "admin@company.com"
  })
})

const data = await response.json()
// Should return calculation results and email confirmation
```

### Test Scenario 2: Calculate Only
```javascript
// Request calculation without email
const response = await fetch('/api/calculate', {
  method: 'POST',
  body: JSON.stringify({
    problemStatement: "Customer service bot",
    sessionsPerMonth: 1000,
    queriesPerSession: 5,
    modelType: "GPT-4.1",
    avgInputTokens: 500,
    avgOutputTokens: 1000
    // No sendEmail parameter
  })
})

const data = await response.json()
// Should return only calculation results
```

## Performance Impact

- **Calculation only**: No change
- **With email**: Agent takes additional time to format and send email (typically 1-3 seconds more)
- Single API call instead of two (reduces latency overall)
- No additional database queries

## Security Considerations

1. **API Key Protection**: Server-side only, never exposed
2. **Email Validation**: Server-side format checking
3. **Agent Handling**: OAuth managed by Lyzr automatically
4. **No Data Storage**: Email sent in real-time, no persistence
5. **HTTPS Only**: All communication encrypted

## Future Enhancements

Potential improvements:
1. **Email Templates**: Agent uses customizable HTML templates
2. **Multiple Recipients**: Support CC/BCC through agent
3. **Scheduled Sending**: Agent schedules email for later
4. **Email Tracking**: Agent reports open/click status
5. **Attachment Support**: Agent can attach PDF reports
6. **Custom Branding**: Agent uses company branding in email

## Migration Guide

If updating from the deprecated `/api/gmail` endpoint:

### Old Way (No Longer Works)
```javascript
// Step 1: Calculate
const calc = await fetch('/api/calculate', {...})
const results = await calc.json()

// Step 2: Send email separately
const email = await fetch('/api/gmail', {
  body: JSON.stringify({
    agentId: "...",
    recipientEmail: "user@email.com",
    bodyContent: "...",
    calculationData: results
  })
})
```

### New Way (Integrated)
```javascript
// One call handles both
const response = await fetch('/api/calculate', {
  body: JSON.stringify({
    // ... calculation parameters
    sendEmail: true,
    recipientEmail: "user@email.com"
  })
})
const data = await response.json()
// Both results and email confirmation included
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sent | Check API key, verify email format, check agent logs |
| Agent timeout | Agent may take longer to send email, increase timeout |
| Invalid email format | Ensure valid email@domain.com format |
| Missing API key | Add LYZR_API_KEY to .env.local, restart server |

## Code References

### Frontend
- `/app/project/app/page.tsx:126` - `handleSendEmail()` function
- `/app/project/app/page.tsx:510-516` - Send Email button
- `/app/project/app/page.tsx:533-615` - Email modal

### Backend
- `/app/project/app/api/calculate/route.ts:7-15` - Request interface with email fields
- `/app/project/app/api/calculate/route.ts:142-155` - Email instruction injection
- `/app/project/app/api/calculate/route.ts:162-174` - Agent API call

## Status

**Implementation**: Complete
**Testing**: Ready
**Documentation**: Complete
**Deployment**: Production Ready

The agent-integrated email approach is now the primary method for sending calculation results via email. It provides a cleaner, more efficient, and more secure implementation compared to separate endpoints.
