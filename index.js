const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const { OpenAI } = require("openai");
const analyticsRoute = require("./routes/analytics");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const api = new OpenAI({
  baseURL: "https://api.aimlapi.com/v1",
  apiKey: "0af05d4086f34ac4bd66047cd2e6c6fe",
});

app.use("/analytics", analyticsRoute);
app.post("/process-prompt", async (req, res) => {
  const userInput = req.body.input;
  console.log(userInput);

  // Modify the prompt as needed
  const modifiedPrompt = `User said: ${userInput}`;
  console.log(modifiedPrompt);

  // Send the modified prompt to Vicuna AI
  try {
    const response = await fetch(
      "https://api.aimlapi.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer 0af05d4086f34ac4bd66047cd2e6c6fe",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-2-13b-chat-hf",
          messages: [
            {
              role: "system",
              content: modifiedPrompt,
              name: "text",
            },
          ],
          max_tokens: 1,
          stop: "text",
          stream: true,
          stream_options: {
            include_usage: true,
          },
          n: 1,
          seed: 1,
          top_p: 1,
          top_k: 1,
          temperature: 1,
          repetition_penalty: 1,
          logprobs: true,
          echo: true,
          min_p: 1,
          presence_penalty: 1,
          frequency_penalty: 1,
          logit_bias: {
            ANY_ADDITIONAL_PROPERTY: 1,
          },
          tools: [
            {
              type: "function",
              function: {
                description: "text",
                name: "text",
                parameters: null,
              },
            },
          ],
          tool_choice: "none",
          response_format: {
            type: "text",
          },
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    const result = await api.chat.completions.create({
      model: "lmsys/vicuna-13b-v1.5",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant who knows everything.",
        },
        {
          role: "user",
          content: modifiedPrompt,
        },
      ],
    });

    const message = result.choices[0].message.content;
    console.log(`Assistant: ${message}`);

    // Send the Vicuna AI response back to the frontend
    console.log(result.choices[0].message.content);
    // res.json({ response: vicunaResponse.data });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error communicating with Vicuna AI" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
