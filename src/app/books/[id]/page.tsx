import { fetchBook } from "../../actions/FetchBook";
import BookMetadata from "@/components/bookComponents/BookMetadata";
import BookContent from "@/components/bookComponents/BookContent";
import { notFound } from "next/navigation";
export default async function BookDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await fetchBook(id);
  if (!data) {
    console.error("Error fetching book", id);
    return notFound();
  }

  return (
    <div className="mx-autmo space-y-4 p-4">
      <BookMetadata id={id} bookMetadata={data.metadata} />
      <h1 className="text-xl font-bold">Book Details</h1>
      <BookContent content={data.content} />
    </div>
  );
}
