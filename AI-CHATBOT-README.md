# AI Chatbot for CA International Autobody

This document provides instructions for setting up and using the AI chatbot integrated into the CA International Autobody website.

## Overview

The AI chatbot is designed to assist customers by:
- Answering questions about services
- Providing information about the booking process
- Explaining insurance claims procedures
- Offering instant responses to common questions
- Providing a direct link to book appointments when appropriate

## Technology Stack

The AI chatbot is built using:
- Anthropic's Claude 3 Haiku model (cost-effective with excellent performance)
- Next.js API routes for backend functionality
- React for frontend UI
- Custom training data specific to the auto body industry
- Robust fallback system for offline operation

## Setup Instructions

### 1. Set up environment variables

Copy the `.env.local.example` file to create a new `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```

For detailed setup instructions, see [ANTHROPIC_SETUP.md](./ANTHROPIC_SETUP.md).

### 2. Install required packages

Make sure all necessary packages are installed:

```bash
npm install @anthropic-ai/sdk
```

## Customizing the Chatbot

### Training Data

The chatbot's knowledge comes from the automotive expertise and business context defined in the `/app/api/chat/route.ts` and `/app/api/chat/automotive-knowledge.ts` files. You can edit these files to:

- Update business information
- Add/modify service details
- Update the booking process
- Add new FAQ items
- Modify insurance information

After updating the training data, restart the server for changes to take effect.

### Fallback System

The chatbot includes a robust fallback system that works even when:
- The API is unavailable
- The API key is not configured
- The quota has been exceeded

The fallback system uses keyword-based matching to provide answers to common questions about:
- Business hours
- Contact information
- Services offered
- Insurance claims
- Estimates and quotes
- Paint services
- Classic car restoration

You can customize the fallback responses in the `fallbackResponses` object in `/app/api/chat/route.ts`.

### Visual Appearance

You can customize the chatbot's appearance by editing the CSS in the ChatWidget component.

## Cost Considerations

Using Claude 3 Haiku is cost-effective for this implementation:

- Approximately $0.25 per million input tokens
- Approximately $1.25 per million output tokens
- Lower token usage than competitors for the same quality of responses

You can further optimize costs by:

1. Limiting the number of previous messages sent to the API
2. Reducing the maximum token limit
3. Implementing caching for common questions

## Maintenance and Updates

To keep the chatbot functioning optimally:

1. Regularly update the training data with new services, policies, or FAQs
2. Monitor Anthropic API usage and costs
3. Review chat logs periodically to identify common questions that aren't adequately answered
4. Consider adjusting the fallback system based on common user questions

## Troubleshooting

Common issues and solutions:

1. **Chatbot doesn't appear**: Ensure the ChatWidget component is properly included in your layout.
2. **API errors**: Check that your Anthropic API key is valid and has sufficient credits.
3. **Fallback mode active**: If you're seeing "usingFallback:true" in responses, check your API key configuration.
4. **Irrelevant responses**: Update the training data to provide more context for specific topics.

## Support

For issues with the Anthropic API:
- Anthropic Documentation: https://docs.anthropic.com/
- Anthropic Support: https://support.anthropic.com/

## Future Enhancements

Consider these enhancements for future versions:

1. Add chat history persistence for returning users
2. Implement analytics to track common questions
3. Add image upload capabilities for damage assessment
4. Integrate with your booking system for direct appointment creation
5. Implement multilingual support for diverse customers 