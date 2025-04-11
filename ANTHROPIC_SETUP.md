# Setting Up Anthropic Claude API for CA International Autobody Chatbot

This guide will help you set up the Anthropic Claude API for the chatbot on the CA International Autobody website.

## Step 1: Create an Anthropic Account

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up for an account
3. Verify your email address

## Step 2: Create an API Key

1. Once logged in, navigate to the API Keys section
2. Click "Create Key"
3. Give it a name like "CA Autobody Chatbot"
4. Copy the API key (it will only be shown once)

## Step 3: Add the API Key to Your Environment

1. Open the `.env.local` file in the root of this project
2. Find the `ANTHROPIC_API_KEY` variable
3. Replace `your_anthropic_api_key_here` with your actual API key:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

4. Save the file

## Step 4: Restart the Development Server

1. Stop the current development server (if running)
2. Start it again with:

```
npm run dev
```

## Step 5: Test the Integration

1. Navigate to your local development site
2. Try out the chatbot with some questions about automotive repair
3. Verify that Claude is responding correctly

## Troubleshooting

If you encounter issues:

- Make sure your API key is correct and properly formatted
- Check that you have sufficient credits/quota on your Anthropic account
- Look for error messages in the server console
- Refer to the official Anthropic documentation: [https://docs.anthropic.com/](https://docs.anthropic.com/)

## Pricing Considerations

Claude's API is priced based on tokens (similar to OpenAI). As of 2024:

- Claude 3 Haiku: ~$0.25/million input tokens, ~$1.25/million output tokens
- Lower volume than competitors for the same quality of responses
- Visit [https://www.anthropic.com/pricing](https://www.anthropic.com/pricing) for the latest pricing information 