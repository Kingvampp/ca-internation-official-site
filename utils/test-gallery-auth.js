/**
 * Test script for gallery authentication and blur area saving
 */

// Test gallery authentication and blur area saving
async function testGalleryAuth() {
  console.log('Testing gallery authentication and blur area saving...');
  
  try {
    // Fetch a gallery item
    console.log('Fetching gallery item...');
    const response = await fetch('/api/gallery?id=blue-accord-repair');
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery item: ${response.status}`);
    }
    
    const item = await response.json();
    console.log(`Successfully fetched gallery item: ${item.id}`);
    
    // Add a test blur area
    console.log('Adding a test blur area...');
    const testBlurAreas = {
      '/images/gallery-page/blue-accord-repair/main-blue-accord.jpg': [
        {
          x: 100,
          y: 100,
          width: 50,
          height: 30,
          rotation: 0,
          blurAmount: 8,
          debug_timestamp: Date.now()
        }
      ]
    };
    
    // Update the item with the test blur area
    item.blurAreas = testBlurAreas;
    item.updatedAt = Date.now();
    
    // Save the item
    console.log('Saving gallery item with test blur area...');
    const saveResponse = await fetch('/api/gallery', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(item),
    });
    
    const saveResponseText = await saveResponse.text();
    console.log(`Save response status: ${saveResponse.status}`);
    console.log(`Save response: ${saveResponseText}`);
    
    let saveResult;
    try {
      saveResult = JSON.parse(saveResponseText);
    } catch (e) {
      saveResult = { error: 'Failed to parse response' };
    }
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save gallery item: ${saveResponse.status} - ${saveResult.error || 'Unknown error'}`);
    }
    
    console.log('Gallery item saved successfully!');
    console.log('Test completed successfully!');
    return { 
      success: true, 
      message: 'Gallery authentication and blur area saving test passed!',
      details: saveResult
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { 
      success: false, 
      message: `Test failed: ${error.message}`,
      error
    };
  }
}

// Export the test function
window.testGalleryAuth = testGalleryAuth;

// Auto-run the test if run from browser console
if (typeof window !== 'undefined') {
  console.log('Gallery authentication test script loaded. Run testGalleryAuth() to test.');
}

export { testGalleryAuth }; 