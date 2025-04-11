// Chatbot testing script
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Test case scenarios
const testCases = [
  {
    id: 1,
    name: "Location inquiry",
    message: "Where are you located?",
    checkFor: ["1330 Egbert Avenue", "San Francisco", "CA 94124"]
  },
  {
    id: 2,
    name: "Phone number inquiry",
    message: "What's your phone number?",
    checkFor: ["(415) 447-4001"]
  },
  {
    id: 3,
    name: "Service we offer - Exotic cars",
    message: "Do you guys work on exotic cars?",
    checkFor: ["Yes", "exotic", "book an appointment"]
  },
  {
    id: 4,
    name: "Service we don't offer",
    message: "Do you offer motorcycle repair?",
    checkFor: ["sorry", "don't", "services we do offer", "table"]
  },
  {
    id: 5,
    name: "Checking for duplicate booking prompts",
    message: "I need my bumper fixed, can you guys paint it too?",
    checkAgainst: ["Would you like to schedule.*Would you like to book", "Would you like to book.*Would you like to schedule"]
  },
  {
    id: 6,
    name: "VIN inquiry",
    message: "My VIN is WBAWL73549P371949, can you tell me about my car?",
    checkFor: ["BMW", "7 Series", "identified", "Dark Graphite Metallic", "color", "appointment"]
  },
  {
    id: 7,
    name: "Repair service",
    message: "Can you fix my bumper?",
    checkFor: ["Yes", "bumper", "technicians", "appointment"]
  },
  {
    id: 8,
    name: "Asking for services list",
    message: "What services do you offer?",
    checkFor: ["services we offer", "table", "collision", "paint"]
  }
];

// Test function
async function testChatbot() {
  console.log("🤖 Starting Chatbot Tests\n");
  let passedTests = 0;

  for (const test of testCases) {
    process.stdout.write(`Testing #${test.id}: ${test.name}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: test.message }],
          sessionId: `test-${test.id}`
        }),
      });

      const data = await response.json();
      const botResponse = data.message;
      
      // Log for debugging
      fs.writeFileSync(
        path.join(__dirname, `test-response-${test.id}.txt`), 
        `Test: ${test.name}\nMessage: ${test.message}\n\nResponse:\n${botResponse}`
      );

      // Check test criteria
      let passed = true;
      let failReason = '';

      if (test.checkFor) {
        // All items in checkFor array should be in the response
        for (const term of test.checkFor) {
          if (!botResponse.toLowerCase().includes(term.toLowerCase())) {
            passed = false;
            failReason = `Missing expected term: "${term}"`;
            break;
          }
        }
      }
      
      if (test.checkAgainst) {
        // None of the patterns in checkAgainst should match
        for (const pattern of test.checkAgainst) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(botResponse)) {
            passed = false;
            failReason = `Matched against pattern that should not exist: "${pattern}"`;
            break;
          }
        }
      }

      if (passed) {
        console.log(" ✅ PASS");
        passedTests++;
      } else {
        console.log(` ❌ FAIL (${failReason})`);
        console.log(`    Response: "${botResponse.substring(0, 100)}..."`);
      }
    } catch (error) {
      console.log(` ❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n🏁 Tests completed: ${passedTests}/${testCases.length} passed`);
}

// Wait for server to be fully running, then start tests
console.log("Waiting for server to be ready...");
setTimeout(() => {
  testChatbot();
}, 3000); 