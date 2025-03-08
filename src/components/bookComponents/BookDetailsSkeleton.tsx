// components/BookDetailsSkeleton.tsx
import React from "react";

const BookDetailsSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Title Skeleton */}
    <div className="h-8 bg-gray-300 rounded w-1/3"></div>

    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
      {/* Book Cover Skeleton */}
      <div className="w-[200px] h-[300px] bg-gray-300 rounded-lg shadow-lg"></div>

      {/* Metadata Skeleton */}
      <div className="flex-grow space-y-2">
        <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <tbody>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <th className="py-3 px-6 w-1/4 bg-gray-200">
                    <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                  </th>
                  <td className="py-3 px-6">
                    <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Analyze Button Skeleton */}
    <div className="w-32 h-10 bg-gray-300 rounded"></div>

    {/* Book Details Content Skeleton */}
    <div className="space-y-2">
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
  </div>
);

export default BookDetailsSkeleton;
