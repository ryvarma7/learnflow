const { Groq } = require('groq-sdk');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('GROQ_API_KEY is not set');
}

const ai = new Groq({ apiKey });

async function testModel() {
  console.log("Testing llama-3.3-70b-versatile on Groq...");
  try {
    const response = await ai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that returns ONLY valid JSON." },
        { role: "user", content: "Generate a simple JSON object with a 'status' field set to 'success' and a 'message' field saying 'Groq is working!'" }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    console.log("Response received:");
    console.log(JSON.stringify(response.choices[0].message.content, null, 2));
    
    // Verify if it's valid JSON
    const parsed = JSON.parse(response.choices[0].message.content);
    if (parsed.status === "success") {
      console.log("\n✅ Test Passed: Model returned valid JSON and correct content.");
    } else {
      console.log("\n❌ Test Failed: Unexpected content.");
    }
  } catch (error) {
    console.error("\n❌ Test Failed with error:");
    console.error(error);
  }
}

testModel();
