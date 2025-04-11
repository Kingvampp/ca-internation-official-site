import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Simple endpoint to test if our Anthropic API key is working
export async function GET() {
  // Always log this for debugging
  console.log('API test route called');
  
  try {
    // Check SKIP_API_TEST first, before any other operations
    if (process.env.SKIP_API_TEST === 'true') {
      console.log('✅ Skipping API test as SKIP_API_TEST=true');
      return NextResponse.json({
        success: true,
        message: 'API test skipped based on environment configuration',
      });
    }

    console.log('Testing Anthropic API connection...');
    
    // Check if API key exists and log partial key for debugging
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.log('WARNING: Anthropic API key is missing or empty!');
      return NextResponse.json({
        success: false,
        error: 'API key is not configured in .env.local file'
      }, { status: 500 });
    }
    
    console.log(`Using Anthropic API key starting with: ${apiKey.substring(0, 15)}...`);

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Make a simple API call
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      messages: [
        {
          role: 'user',
          content: 'Say "API connection successful" in one short sentence.',
        },
      ],
      max_tokens: 20,
      system: 'You are a helpful assistant.'
    });

    const content = response.content[0];
    const message = 'text' in content ? content.text : "No text response";

    return NextResponse.json({
      success: true,
      message: 'Anthropic API connection successful',
      response: message,
    });
    
  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 