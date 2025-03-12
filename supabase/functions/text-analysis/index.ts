import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { GoogleAIFileManager } from "npm:@google/generative-ai/server";
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const apiKey = Deno.env.get("GOOGLE_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

serve(async (req) => {
  try {
    const { bookId } = await req.json();
    if (!bookId) {
      console.error("Invalid input. 'bookId' is required.");
      return new Response(
        JSON.stringify({ error: "Invalid input. 'bookId' is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("books")
      .select("content")
      .eq("gutenberg_id", bookId)
      .single();
    if (error) {
      return new Response(
        JSON.stringify({ error: "Book not found or database error." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const text = data.content;

    const filePath = "/tmp/book_content.txt";
    const writeResult = await Deno.writeTextFile(filePath, text);
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: "text/plain",
      displayName: `Book_${bookId}`,
    });

    let file = await fileManager.getFile(uploadResult.file.name);

    while (file.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      file = await fileManager.getFile(uploadResult.file.name);
    }
    if (file.state === "FAILED") {
      throw new Error("File processing failed.");
      console.log("file", file);
    }
    
    const TwoShot=`
    Text: "Romeo and Juliet is a tragedy written by William Shakespeare early in his career about two young star-crossed lovers whose deaths ultimately reconcile their feuding families. It was among Shakespeare's most popular plays during his lifetime and, along with Hamlet, is one of his most frequently performed plays. Today, the title characters are regarded as archetypal young lovers."
    
    Output:
    {
      "key_characters": [
        {
          "name": "Romeo",
          "description": "A young man of the Montague family, who falls in love with Juliet."
        },
        {
          "name": "Juliet",
          "description": "Daughter of Capulet, who falls in love with Romeo."
        }
      ],
      "language": [
        {
          "language": "English",
          "confidence": 0.99
        }
      ],
      "genre": [
        {
          "genre": "Tragedy",
          "confidence": 0.95
        },
        {
          "genre": "Play",
          "confidence": 0.90
        }
      ],
      "sentiment": [
        {
          "sentiment": "Tragic",
          "confidence": 0.95
        }
      ],
      "plot_summary": "Romeo and Juliet is a tragedy about two young lovers from feuding families whose deaths ultimately reconcile their families. The play explores themes of love, fate, and the consequences of family conflict.",
      "themes": [
        {
          "theme": "Love",
          "confidence": 0.95
        },
        {
          "theme": "Fate",
          "confidence": 0.90
        },
        {
          "theme": "Family Conflict",
          "confidence": 0.85
        }
      ],
      "notable_quotes": [
        "A pair of star-crossed lovers take their life.",
        "O Romeo, Romeo, wherefore art thou Romeo?"
      ],
      "notable_events": [
        "Romeo and Juliet meet and fall in love.",
        "They secretly marry.",
        "Romeo kills Tybalt and is banished.",
        "Juliet fakes her death.",
        "Romeo, believing Juliet is dead, takes his own life.",
        "Juliet awakens, finds Romeo dead, and kills herself."
      ],
      "notable_observations": [
        "The play is one of Shakespeare's most frequently performed works.",
        "The title characters are often regarded as archetypal young lovers."
      ]
    }`
    
   const OneShot=`
    Text: "Hamlet is a tragedy by William Shakespeare, believed to have been written between 1599 and 1601. The play is set in Denmark and tells the story of Prince Hamlet, who seeks revenge against his uncle, Claudius, who has murdered Hamlet's father, taken the throne, and married Hamlet's mother."
    
    Output:
    {
      "key_characters": [
        {
          "name": "Hamlet",
          "description": "Prince of Denmark, who seeks revenge for his father's murder."
        },
        {
          "name": "Claudius",
          "description": "Hamlet's uncle, who murders Hamlet's father and takes the throne."
        },
        {
          "name": "Gertrude",
          "description": "Hamlet's mother and queen of Denmark."
        },
        {
          "name": "Ophelia",
          "description": "Hamlet's love interest, who descends into madness."
        }
      ],
      "language": [
        {
          "language": "English",
          "confidence": 0.99
        }
      ],
      "genre": [
        {
          "genre": "Tragedy",
          "confidence": 0.95
        },
        {
          "genre": "Play",
          "confidence": 0.90
        }
      ],
      "sentiment": [
        {
          "sentiment": "Tragic",
          "confidence": 0.95
        }
      ],
      "plot_summary": "Hamlet is a tragedy set in Denmark, where Prince Hamlet seeks revenge against his uncle Claudius for murdering his father, taking the throne, and marrying his mother. The play explores themes of revenge, madness, and moral corruption.",
      "themes": [
        {
          "theme": "Revenge",
          "confidence": 0.95
        },
        {
          "theme": "Madness",
          "confidence": 0.90
        },
        {
          "theme": "Moral Corruption",
          "confidence": 0.85
        }
      ],
      "notable_quotes": [
        "To be, or not to be: that is the question.",
        "Something is rotten in the state of Denmark."
      ],
      "notable_events": [
        "The ghost of Hamlet's father reveals the truth about his death.",
        "Hamlet stages a play to confirm Claudius's guilt.",
        "Hamlet accidentally kills Polonius.",
        "Ophelia descends into madness and drowns.",
        "A duel between Hamlet and Laertes leads to multiple deaths, including Hamlet's and Claudius's."
      ],
      "notable_observations": [
        "Hamlet is one of Shakespeare's longest plays.",
        "The play is renowned for its exploration of existential themes."
      ]
    }`
    
    const prompt = [
      `Analyze the following text and provide the results in JSON format with the following fields:
      - key_characters: array of key characters identified with name and description,
      - language: detected language (array of objects with language and confidence),
      - genre: detected genre (array of objects with genre and confidence),
      - sentiment: overall sentiment (array of objects with sentiment and confidence),
      - plot_summary: summary of the plot (string of text with plot summary minimum 300 characters),
      - themes: identified themes (array of objects with theme and confidence),
      - notable_quotes: any notable quotes (array of strings of quotes),
      - notable_events: any notable events (array of strings of events),
      - notable_observations: any other notable observations (array of strings of observations)
        output should look like below example which can be parsed as JSON:
       Examples: ${TwoShot} ${OneShot}
`,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ];

    const result = await model.generateContent(prompt);

    if (!result.response) {
      return new Response(
        JSON.stringify({ error: "No response from Gemini model." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const analysis = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(analysis), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
