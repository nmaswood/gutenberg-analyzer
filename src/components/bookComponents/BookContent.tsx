"use client";
import { useState } from "react";

interface BookContentProps {
  content: string;
}

const BookContent = ({ content }: BookContentProps) => {
  const [visibleContent, setVisibleContent] = useState(content.slice(0, 1000));
  const [showMore, setShowMore] = useState(false);

  const handleToggle = () => {
    if (showMore) {
      setVisibleContent(content.slice(0, 1000));
    } else {
      setVisibleContent(content);
    }
    setShowMore(!showMore);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <pre className="whitespace-pre-wrap">{visibleContent}</pre>
      {content.length > 1000 && (
        <button
          onClick={handleToggle}
          className="mt-2 text-blue-500 hover:underline"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default BookContent;
