"use client";
import { bookMetadata } from "@/types/metadata.type";
import Image from "next/image";
import { useState, useEffect } from "react";
import AnalysisResult from "@/components/AnalysisResult";

function BookMetadata({ id, bookMetadata }: { bookMetadata: bookMetadata; id: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const metadataKeys = bookMetadata ? Object.keys(bookMetadata) : [];

  useEffect(() => {
    if (!id || !bookMetadata) return;

    const cacheData = {
      id,
      title: bookMetadata["title"],
      coverPhotoUrl: bookMetadata["coverPhotoUrl"],
    };
    const recentBooks = localStorage.getItem("recent-books");

    if (!recentBooks) {
      localStorage.setItem("recent-books", JSON.stringify([cacheData]));
    } else {
      const newRecentBookList = [cacheData, ...JSON.parse(recentBooks)];
      const uniqueBooks = newRecentBookList.filter(
        (book, index, self) => index === self.findIndex((b) => b.id === book.id)
      );
      localStorage.setItem("recent-books", JSON.stringify(uniqueBooks));
    }
  }, [id, bookMetadata]);

  if (!id || !bookMetadata || metadataKeys.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {bookMetadata["coverPhotoUrl"] && (
          <div className="flex-shrink-0">
            <Image
              src={bookMetadata["coverPhotoUrl"] || "/assets/images/book.png"}
              alt="book-cover"
              width={200}
              height={300}
              loading="eager"
              className="rounded-lg shadow-lg"
            />
          </div>
        )}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-4 text-blue-500">
            {bookMetadata["title"] || "Book Title"}
          </h1>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <tbody>
              {metadataKeys.map((key) => {
                if (key === "title" || key === "coverPhotoUrl") return null;
                return (
                  <tr className="border-b border-gray-200" key={key}>
                    <th className="py-3 px-6 text-gray-700 text-left">{key}</th>
                    <td className="py-3 px-6 text-gray-900">{bookMetadata[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Analyze Text
          </button>
          {isDialogOpen && (
            <AnalysisResult text={id} onClose={() => setIsDialogOpen(false)} />
          )}
        </div>
      </div>
    </section>
  );
}

export default BookMetadata;
