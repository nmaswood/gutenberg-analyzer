"use server";
import { createClient } from "@/lib/supabase";
export async function fetchBook(id: string) {

  try {
    const supabase = createClient();
    const { data } = await supabase.functions.invoke("book-content", { body: { book_id: id } });
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
