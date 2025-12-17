# Gmail Integration for Lyzr Credit Calculator

This document describes the Gmail tool integration that allows users to send their credit calculation results via email.

## Overview

The Lyzr Credit Calculator now includes a Gmail integration that leverages Lyzr's native Gmail tool capabilities. Users can email their cost estimates and architecture recommendations directly from the calculator.

## Features

- **Send Results via Email**: Users can enter an email address and send their complete calculation results
- **Professional Email Format**: Results are formatted with all relevant details including:
  - Architecture overview (agents, knowledge bases, tools)
  - Cost breakdown (creation, retrieval, model costs)
  - Monthly and annual projections
  - Input parameters used for calculation
- **Security**: All sensitive data is handled server-side; API keys are never exposed to the client
- **OAuth Integration**: Gmail access is handled automatically through Lyzr's OAuth system - no additional setup needed

## Architecture

### Frontend Components

**Send Email Button**
- Located in the action buttons section alongside "Copy JSON" and "Export PDF"
- Styled with indigo background to match the primary action theme
- Opens an email modal when clicked

**Email Modal**
- Allows users to enter their email address
- Real-time validation of email format
- Status messages showing success/error feedback
- Clean, accessible design with proper focus states

### Backend API

**Endpoint**: `POST /api/gmail`

**Request Body**:
```json
{
  "agentId": "694263a24f5531c6f3c7055a",
  "recipientEmail": "user@example.com",
  "subjectLine": "Your Lyzr Credit Calculator Estimate",
  "bodyContent": "...",
  "calculationData": { }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "response": "...",
  "recipient": "user@example.com",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

## Integration with Lyzr Agents

The Gmail integration works through the Credit Calculator Coordinator agent by:

1. Accepting the calculation results from the frontend
2. Building a formatted email message with all details
3. Passing the message to the Lyzr agent API
4. The agent uses Lyzr's native Gmail tool to send the email
5. Returning confirmation of successful sending

### Agent Configuration

The integration uses the existing agent that already has Gmail tool access configured:
- **Agent ID**: `694263a24f5531c6f3c7055a` (Credit Calculator Coordinator)
- **Tool Access**: Gmail is pre-configured in the agent setup
- **OAuth Handling**: Lyzr handles all OAuth authentication automatically

## Security Considerations

1. **Server-Side API Key**: The LYZR_API_KEY is stored in environment variables and never exposed to the client
2. **Email Validation**: Server-side validation of email addresses prevents injection attacks
3. **Secure Transport**: All communication uses HTTPS
4. **No Data Storage**: Email content is not stored; only the API call is made in real-time

## Error Handling

The Gmail API includes comprehensive error handling:

- **Missing API Key**: Returns 500 status with clear message if LYZR_API_KEY is not configured
- **Invalid Email Format**: Returns 400 status for malformed email addresses
- **Missing Required Fields**: Returns 400 status if any required field is missing
- **API Failures**: Gracefully handles Lyzr API errors and returns error details to the user

## User Flow

1. User generates a credit calculation
2. Results are displayed with action buttons
3. User clicks "Send Email" button
4. Modal dialog appears asking for email address
5. User enters email address (with real-time validation)
6. User clicks "Send" button
7. Loading state shows "Sending..."
8. Success message displays with recipient email
9. Modal closes automatically after 2 seconds

## Email Format

The email includes:

**Subject**: Your Lyzr Credit Calculator Estimate

**Body**:
```
Dear User,

Here is your Lyzr Credit Calculator Cost Estimate:

ARCHITECTURE OVERVIEW:
- Agents Required: [number]
- Knowledge Bases: [number]
- Integration Tools: [number]
- Memory Requirements: [requirement]
- RAI Requirements: [level]

COST BREAKDOWN:
- Creation Costs: $[amount]
- Retrieval Costs: $[amount]
- Model Costs: $[amount]

MONTHLY TOTAL: $[total]
ANNUAL PROJECTION: $[annual]

INPUT PARAMETERS:
- Problem Statement: [statement]
- Sessions per Month: [number]
- Queries per Session: [number]
- Model Type: [model]
- Average Input Tokens: [number]
- Average Output Tokens: [number]

Best regards,
Lyzr Credit Calculator
```

## Troubleshooting

### "LYZR_API_KEY not configured"

Ensure that:
1. The `.env.local` file exists in the project root
2. It contains: `LYZR_API_KEY=your_actual_api_key`
3. The server has been restarted after adding the environment variable

### Email Send Failed

Possible causes:
1. Network connectivity issue
2. Invalid email address format
3. Gmail tool not properly configured in the agent
4. Lyzr API service temporary unavailability

Check the browser console and server logs for detailed error messages.

### Email Not Received

If the email was marked as sent but not received:
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. Check if Gmail filters are blocking the sender

## Future Enhancements

Potential improvements for the Gmail integration:

1. **Email Templates**: Use HTML formatted email templates
2. **Attachment Support**: Attach PDF or JSON files to emails
3. **Email History**: Store and display email sending history
4. **Scheduled Sends**: Allow users to schedule emails for later
5. **Multiple Recipients**: Support sending to multiple email addresses
6. **Email Customization**: Allow users to customize email subject and content

## Dependencies

- Lyzr Agent API (for agent communication)
- Lyzr Gmail Tool (pre-configured in the agent)
- React Icons (for UI icons)
- Next.js (for API routes)

## Testing

To test the Gmail integration:

1. Ensure a valid LYZR_API_KEY is configured
2. Generate a credit calculation result
3. Click "Send Email" button
4. Enter a test email address
5. Click "Send" and verify the email is received

## Support

For issues or questions about the Gmail integration, check:
1. Environment variables are correctly configured
2. Server logs for detailed error messages
3. Lyzr documentation for agent and tool configuration
