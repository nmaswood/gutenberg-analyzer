"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  const [bookId, setBookId] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!bookId) return;
    router.push(`/books/${bookId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Project Gutenberg Book Explorer</h1>
      <Input
        type="text"
        placeholder="Enter Book ID (e.g., 1787)"
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        className="w-64"
      />
      <Button onClick={handleSearch}>Fetch Book</Button>
      <Link href="/recently-visited">
        <p className="text-primary">Recently Visited</p>
      </Link>
    </div>
  );
}
