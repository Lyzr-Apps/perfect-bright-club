# Gmail Integration - Quick Reference

## User View

### Button Location
Bottom right of results section, next to "Copy JSON" and "Export PDF"

### Button Appearance
- Color: Purple (indigo-600)
- Icon: Mail icon (FiMail)
- Label: "Send Email"
- Enabled: When results are displayed

### Click Flow
Button → Modal Opens → Email Input → Validate → Send → Confirmation → Auto-close

## For Developers

### Frontend Code Location
File: `/app/project/app/page.tsx`
- Lines: Function `handleSendEmail()` at line 126
- State: `showEmailModal`, `emailAddress`, `isSendingEmail`, `emailStatus`
- Component: Email modal at line 533

### Backend Code Location
File: `/app/project/app/api/gmail/route.ts`
- Endpoint: `POST /api/gmail`
- Validation: Email format, required fields
- Integration: Lyzr API at `https://agent-prod.studio.lyzr.ai/v3/inference/chat/`

### API Call Format
```javascript
const response = await fetch('/api/gmail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: '694263a24f5531c6f3c7055a',
    recipientEmail: 'user@example.com',
    subjectLine: 'Your Lyzr Credit Calculator Estimate',
    bodyContent: emailBody,
    calculationData: results
  })
})
```

## For Designers

### Modal Specifications
- Overlay: Fixed position, black 50% opacity
- Dialog: Max-width 448px (md), full on mobile
- Colors: slate-800 (background), indigo-600 (action)
- Border: 1px solid slate-700
- Rounded: xl (border-radius: 0.75rem)

### Form Fields
- Label: "Email Address"
- Input: type="email", placeholder
- Error display: Red text (red-400)
- Success display: Green text (green-400)

### Button States
- Default: bg-indigo-600 hover:bg-indigo-700
- Disabled: opacity-50
- Loading: Shows spinner with "Sending..."

## For QA

### Test Cases
1. Valid email → Success message → Modal closes
2. Empty field → Validation error → Stays open
3. Invalid format → Validation error → Stays open
4. Network error → Error message → Stays open for retry
5. Keyboard: Tab, Enter, Escape all work
6. Mobile: Responsive on small screens

### Success Indicators
- Email received with all calculation data
- Subject: "Your Lyzr Credit Calculator Estimate"
- Body: Formatted with all results
- Recipient email shown in success message

## Configuration

### Environment
Required: `LYZR_API_KEY=your_api_key` in `.env.local`

### No Additional Setup
- OAuth: Handled by Lyzr automatically
- Database: No changes needed
- Dependencies: No new npm packages
- Build: Standard Next.js build

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Modal won't open | Check browser console, refresh page |
| "Email not sent" | Verify internet connection |
| Email not received | Check spam folder, verify address |
| API key error | Add LYZR_API_KEY to .env.local, restart |
| Mobile layout broken | Clear browser cache, check viewport |

## File Locations

### Frontend
`/app/project/app/page.tsx` (740 lines)

### Backend
`/app/project/app/api/gmail/route.ts` (149 lines)

### Documentation
- `README_GMAIL.md` - Main overview
- `GMAIL_INTEGRATION.md` - Technical docs
- `GMAIL_FEATURE_GUIDE.md` - User guide
- `IMPLEMENTATION_SUMMARY.md` - Details
- `FEATURE_CHECKLIST.md` - Completion status
- `QUICK_REFERENCE.md` - This file

## Status

**Implementation**: Complete ✅
**Testing**: Ready ✅
**Documentation**: Complete ✅
**Deployment**: Ready for Production ✅

## Key Stats

- Lines of frontend code: ~100 (new)
- Lines of backend code: 149
- New API endpoints: 1
- New npm dependencies: 0
- Database migrations: 0
- Config changes: 0

## Support

For issues, check:
1. Browser console (F12)
2. Server logs (npm run dev output)
3. `.env.local` configuration
4. Documentation files in project root

---

**Last Updated**: 2024-12-17
**Status**: Production Ready
