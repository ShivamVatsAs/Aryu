import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.GEMINI_API_KEY;

const allowedOrigins = [
  'http://localhost:5173',
  'https://<your-app-name>.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  }
}));
app.use(express.json());

let genAI;
let model;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error("Failed to initialize Gemini AI Client:", error);
  }
} else {
    console.warn('Warning: GEMINI_API_KEY environment variable is not set. API calls will fail.');
}

app.get('/api/generate-message', async (req, res) => {
  if (!genAI || !model) {
    return res.status(500).json({ error: "Backend AI service not configured." });
  }

  const daysTogether = req.query.days;

  if (daysTogether === undefined || isNaN(parseInt(daysTogether))) {
    return res.status(400).json({ error: "Valid 'days' query parameter is required." });
  }

  try {
    const girlfriendName = "Arya";

    const promptTask = `
My girlfriend's name is ${girlfriendName}. We have been together for ${daysTogether} days.
Please write a short, heartfelt, and romantic message for her (about 2-4 sentences).
The message should:
1.  Lovingly praise ${girlfriendName}'s beauty (you can be descriptive and poetic, e.g., her radiant smile, sparkling eyes, captivating presence, how her beauty brightens my world, etc.).
2.  Affectionately mention our ${daysTogether} days together, emphasizing how wonderful this journey has been and how each day with her is special.
3.  Express my deep love and appreciation for her, and how much she means to me.

Make the tone very loving, personal, and a little poetic. It should sound like it's coming directly from me, Shrey.
`;

    const fullPrompt = promptTask;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;

     if (!response) {
        throw new Error("Empty response object from AI model generation.");
    }

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        let blockReason = "Blocked or empty content";
        if (response.promptFeedback?.blockReason) {
            blockReason = response.promptFeedback.blockReason;
        } else if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
             blockReason = `Generation stopped: ${candidate.finishReason}`;
        }
        return res.status(400).json({ error: `Message generation failed: ${blockReason}` });
    }

    const aiResponseText = response.text();
    res.status(200).json({ message: aiResponseText });

  } catch (error) {
    let errorMessage = "Failed to process request due to an internal server error.";
    let statusCode = 500;

    if (error.message?.includes("GoogleGenerativeAI")) {
         errorMessage = error.message || "AI service request failed.";
         statusCode = error.status || 502;
    }
    res.status(statusCode).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  // console.log(`[dev:backend] Backend server listening locally on http://localhost:${port}`);
});

export default app;
