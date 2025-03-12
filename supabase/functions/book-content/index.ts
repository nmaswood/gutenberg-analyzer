import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { createClient } from 'jsr:@supabase/supabase-js@2'
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);


interface EbookRow {
    id: number;
    gutenberg_id: string;
    metadata: GutenbergMetadata;
    content: string;
}

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GutenbergMetadata {
    author?: string;
    title?: string;
    notes?: string[];
    summary?: string;
    language?: string;
    locClass?: string;
    subjects?: string[];
    category?: string;
    ebookNo?: string;
    releaseDate?: string;
    lastUpdated?: string;
    copyrightStatus?: string;
    downloads?: number;
    readingEase?: number;
    coverPhotoUrl?: string;
    [key: string]: string | string[] | number | undefined;
}
async function fetchEbookContent(ebookId: string | number): Promise<string> {
    const url = `https://www.gutenberg.org/files/${ebookId}/${ebookId}-0.txt`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ebook content: ${response.status} ${response.statusText}`);
    }
    return await response.text();
}
async function getEbookFromDatabase(ebookNo: string): Promise<EbookRow | null> {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('gutenberg_id', ebookNo)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw new Error(`Database query error: ${error.message}`);
    }
    return data;
}
async function insertEbookIntoDatabase(metadata: GutenbergMetadata, content: string, ebookId: string): Promise<void> {
    const { error } = await supabase
        .from('books')
        .insert([{ gutenberg_id: ebookId, metadata, content }]);

    if (error) {
        throw new Error(`Failed to insert ebook into database: ${error.message}`);
    }
}

async function scrapeGutenbergMetadata(html: string): Promise<GutenbergMetadata> {
    const metadata: GutenbergMetadata = {
        notes: [],
        subjects: []
    };

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const coverDiv = doc.querySelector('#cover img.cover-art');
    if (coverDiv) {
        metadata.coverPhotoUrl = coverDiv.getAttribute('src')?.trim();
    }
    const aboutSection = Array.from(doc.querySelectorAll('h2')).find(
        (el) => (el as Element).textContent?.includes('About this eBook')
    );

    if (!aboutSection) {
        throw new Error('Could not find metadata section(About this Ebook)');
    }

    let currentElement = (aboutSection as Element).nextElementSibling;
    while (currentElement && currentElement.tagName !== 'TABLE') {
        currentElement = currentElement.nextElementSibling;
    }

    if (!currentElement) {
        throw new Error('Could not find metadata table');
    }

    const metadataTable = currentElement;
    const rows = metadataTable.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length >= 2) {
            let key = (cells[0].textContent || '').trim();
            const value = (cells[1].textContent || '').trim();

            // Remove specific characters and normalize the key
            key = key.replace(/[\*:]/g, '').trim().toLowerCase()
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
                    index === 0 ? letter.toLowerCase() : letter.toUpperCase())
                .replace(/\s+/g, '');

            switch (key) {

                case 'locClass':
                case 'ebookNo':
                case 'releaseDate':
                case 'lastUpdated':
                case 'copyrightStatus':
                case 'summary':
                case 'author':
                    metadata[key] = value;
                    break;

                case 'note':
                    metadata.notes = metadata.notes || [];
                    metadata.notes.push(value);

                    const readingEaseMatch = value.match(/Reading ease score: ([\d.]+)/);
                    if (readingEaseMatch) {
                        metadata.readingEase = parseFloat(readingEaseMatch[1]);
                    }
                    break;

                case 'subject':
                    metadata.subjects = metadata.subjects || [];
                    metadata.subjects.push(value);
                    break;

                case 'downloads':
                    const downloadsMatch = value.match(/(\d+)/);
                    metadata[key] = downloadsMatch ? parseInt(downloadsMatch[0], 10) : 0;
                    break;

                default:
                    metadata[key] = value;
            }
        }
    });


    return metadata;
}

export async function ScrapeBookMetadata(ebookId: string | number): Promise<GutenbergMetadata> {
    const url = `https://www.gutenberg.org/ebooks/${ebookId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetching failed with status ${response.status} and ${response.statusText}`);
        }

        const html = await response.text();
        return await scrapeGutenbergMetadata(html);

    } catch (error: any) {
        throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const body = await req.json();
    const ebookId = body.book_id.toString();

    try {
        let ebook = await getEbookFromDatabase(ebookId);

        if (!ebook) {
            const metadata = await ScrapeBookMetadata(ebookId);
            const content = await fetchEbookContent(ebookId);

            await insertEbookIntoDatabase(metadata, content, ebookId);

            ebook = await getEbookFromDatabase(ebookId);
        }

        return new Response(
            JSON.stringify(ebook),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        );
    }
});
