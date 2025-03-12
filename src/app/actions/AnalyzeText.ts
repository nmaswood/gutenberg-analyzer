"use server";
import { createClient } from "@/lib/supabase";

export async function analyzeText(text: string) {
  const supabase = createClient();
  if (!text) {
    return { error: "Text input is required" };
  }

  try {
    const { data } = await supabase.functions.invoke("text-analysis", { body: { bookId: text } });
    return data;
  } catch (error: unknown) {
    console.error("Text Analysis Error:", error);
    
    let errorMessage = "An unknown error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { error: errorMessage };
  }
}
