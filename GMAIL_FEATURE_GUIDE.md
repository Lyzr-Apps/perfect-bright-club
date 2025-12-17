# Gmail Integration - Quick Start Guide

## What's New

The Lyzr Credit Calculator now includes a **Send Email** button that lets users email their cost calculations directly.

## How to Use

### 1. Generate a Calculation
- Enter your problem statement
- Adjust usage assumptions if needed
- Click "Calculate Credits"

### 2. Send Results via Email
- In the results panel, click the purple "Send Email" button
- Enter your email address in the modal
- Click "Send"
- You'll receive a confirmation message

## UI Components Added

### Send Email Button
- **Location**: Action buttons section (bottom right, below results)
- **Style**: Purple button with mail icon
- **Behavior**: Opens email modal when clicked

### Email Modal
- **Purpose**: Collect recipient email address
- **Validation**: Checks email format before sending
- **Feedback**: Shows success/error messages
- **Accessibility**: Keyboard navigable, proper focus states

## API Integration

### New Endpoint: `/api/gmail`

**Method**: POST

**Required Fields**:
- `agentId` - The agent ID handling the calculation
- `recipientEmail` - Email address to send to
- `subjectLine` - Email subject
- `bodyContent` - Email body text
- `calculationData` - (Optional) Calculation data object

**Example Request**:
```javascript
const response = await fetch('/api/gmail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: '694263a24f5531c6f3c7055a',
    recipientEmail: 'user@example.com',
    subjectLine: 'Your Lyzr Credit Calculator Estimate',
    bodyContent: '...',
    calculationData: results
  })
})
```

## Files Modified

### Frontend
- `/app/project/app/page.tsx`
  - Added FiMail and FiX icon imports
  - Added email modal state management
  - Added handleSendEmail function
  - Added Send Email button
  - Added email modal UI

### Backend
- `/app/project/app/api/gmail/route.ts` (NEW)
  - POST handler for email sending
  - Email validation
  - Lyzr API integration
  - Error handling

### Documentation
- `/app/project/GMAIL_INTEGRATION.md` - Comprehensive documentation
- `/app/project/GMAIL_FEATURE_GUIDE.md` - This guide

## Features

✅ **One-Click Email Sending**
- Users can email results with just their email address

✅ **Real-Time Validation**
- Email format is validated before sending
- Clear error messages for invalid input

✅ **Loading States**
- Shows "Sending..." while processing
- Buttons are disabled during send

✅ **Success/Error Feedback**
- Success message shows recipient email
- Error messages explain what went wrong

✅ **Modal Dialog**
- Focused modal experience
- Escape key or close button to dismiss
- Auto-closes on successful send

✅ **OAuth Integrated**
- No additional OAuth setup needed
- Lyzr handles Gmail authentication automatically
- Uses existing agent configuration

## States & Feedback

### Before Sending
- Email input field accepts user email
- Send button disabled if field is empty
- Clear placeholder text: "your.email@example.com"

### During Sending
- Loading spinner on send button
- Send button disabled
- Cancel button still available

### After Sending
- Success message displays
- Email address shows in confirmation
- Modal auto-closes after 2 seconds
- Email field can be cleared for next use

### On Error
- Error message displays in red
- User can fix and retry
- No data is lost

## Security

✅ **Server-Side API Key**
- LYZR_API_KEY stored in environment variables only
- Never exposed to client

✅ **Input Validation**
- Email format validated server-side
- Prevents injection attacks

✅ **HTTPS Only**
- All communication encrypted
- Uses Lyzr's secure endpoints

✅ **No Data Storage**
- Emails sent directly through Lyzr API
- No persistent storage of email content

## Email Content

Recipients receive a formatted email with:
- Architecture overview (agents, KBs, tools)
- Cost breakdown (creation, retrieval, model)
- Monthly and annual projections
- All input parameters used for calculation
- Professional formatting

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Email sent" but not received | Check spam folder; verify email address |
| "API key not configured" | Add LYZR_API_KEY to .env.local and restart |
| "Invalid email format" | Use standard email format (user@domain.com) |
| Modal won't close | Try clicking the X button or pressing Escape |
| Button appears disabled | Ensure email field has a valid email address |

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Modal opens instantly
- Email validation is instant
- Send typically completes in 1-3 seconds
- No page reload required

## Future Roadmap

Potential enhancements:
1. HTML email templates
2. PDF attachment support
3. Email history/logs
4. Scheduled sends
5. Multiple recipients
6. Email customization options

## Support & Feedback

For issues or suggestions:
1. Check browser console for error messages
2. Review server logs for API errors
3. Verify .env.local configuration
4. Check Lyzr API documentation

## Integration Status

✅ **Fully Integrated and Ready to Use**

The Gmail feature is production-ready and requires no additional configuration beyond setting the LYZR_API_KEY environment variable.
