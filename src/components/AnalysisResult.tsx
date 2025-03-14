"use client";

import { useState, useEffect } from "react";
import { analyzeText } from "@/app/actions/AnalyzeText";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AnalysisResult({ text, onClose }: { text: string; onClose: () => void }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAnalysis() {
      if (!text) return;

      setLoading(true);
      const result = await analyzeText(text);
      setAnalysis(result);
      setLoading(false);
    }

    fetchAnalysis();
  }, [text]);

  const renderConfidence = (confidence: number) => (
    <Progress value={confidence * 100} className="w-24" />
  );

  const renderList = (items: any[], renderItem: (item: any) => JSX.Element) => (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            📊 Text Analysis Results
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of the provided text, including key characters, language, genres,
            sentiments, plot summary, themes, notable quotes, events, and observations.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        ) : analysis ? (
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notables">Notables</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-3">
                <p>
                  <strong>🌍 Language:</strong>{" "}
                  {analysis.language
                    ?.map(
                      (lang: any) =>
                        `${lang.language} (${(lang.confidence * 100).toFixed(
                          2
                        )}%)`
                    )
                    .join(", ") || "Unknown"}
                </p>
                <p>
                  <strong>📖 Plot Summary:</strong>{" "}
                  {analysis.plot_summary || "N/A"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="characters">
              {renderList(analysis.key_characters || [], (character) => (
                <div>
                  <strong>{character.name}:</strong> {character.description}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-3">
                <div>
                  <strong>📚 Genres:</strong>
                  {renderList(analysis.genre || [], (genre) => (
                    <div className="flex items-center space-x-2">
                      <Badge>{genre.genre}</Badge>
                      {renderConfidence(genre.confidence)}
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <strong>😊 Sentiments:</strong>
                  {renderList(analysis.sentiment || [], (sentiment) => (
                    <div className="flex items-center space-x-2">
                      <Badge>{sentiment.sentiment}</Badge>
                      {renderConfidence(sentiment.confidence)}
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <strong>🎨 Themes:</strong>
                  {renderList(analysis.themes || [], (theme) => (
                    <div className="flex items-center space-x-2">
                      <Badge>{theme.theme}</Badge>
                      {renderConfidence(theme.confidence)}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notables">
              <div className="space-y-3">
                <div>
                  <strong>💬 Notable Quotes:</strong>
                  {renderList(analysis.notable_quotes || [], (quote) => (
                    <div>{quote}</div>
                  ))}
                </div>

                <Separator />

                <div>
                  <strong>📅 Notable Events:</strong>
                  {renderList(analysis.notable_events || [], (event) => (
                    <div>{event}</div>
                  ))}
                </div>

                <Separator />

                <div>
                  <strong>🔍 Notable Observations:</strong>
                  {renderList(analysis.notable_observations || [], (observation) => (
                    <div>{observation}</div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-muted-foreground">No analysis available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
