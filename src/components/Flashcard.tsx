'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"

interface Flashcard {
    article: string;
    word: string;
    translation: string;
    imageUrl?: string;
}

export default function Flashcard() {
    const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
    const [loading, setLoading] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('correctAnswers');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    const { toast } = useToast();

    const fetchImage = async (word: string) => {
        try {
            const response = await fetch(`/api/images?q=${encodeURIComponent(word)}`);
            const data = await response.json();
            if (response.ok && data.hits.length > 0) {
                return data.hits[0].webformatURL;
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }
        return null;
    };

    const fetchNewCard = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/flashcard');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            const imageUrl = await fetchImage(data.word);
            setCurrentCard({ ...data, imageUrl });
        } catch (error) {
            console.error('Error fetching flashcard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewCard();
    }, []);

    const handleAnswer = (selectedArticle: string) => {
        if (!currentCard || hasAnswered) return;

        if (selectedArticle === currentCard.article) {
            const newCorrectAnswers = new Set(correctAnswers).add(currentCard.word);
            setCorrectAnswers(newCorrectAnswers);
            localStorage.setItem('correctAnswers', JSON.stringify([...newCorrectAnswers]));

            setFeedbackMessage(`Correct! "${selectedArticle} ${currentCard.word}" is right!`);
        } else {
            setFeedbackMessage(`Incorrect ❌ The correct article is "${currentCard.article} ${currentCard.word}"`);
        }

        setHasAnswered(true);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset your progress?')) {
            localStorage.removeItem('correctAnswers');
            setCorrectAnswers(new Set());
        }
    };

    const handleNext = () => {
        setFeedbackMessage(null);
        setHasAnswered(false);
        fetchNewCard();
    };

    if (loading || !currentCard) {
        return (
            <Card className="w-[95%] max-w-2xl mx-auto my-4 shadow-lg">
                <CardContent className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-[95%] max-w-2xl mx-auto my-4 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-center text-xl sm:text-2xl">
                    German Article Practice
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="text-center space-y-3">
                    {currentCard?.imageUrl && (
                        <div className="relative w-full h-[200px] sm:h-[300px] rounded-lg overflow-hidden">
                            <Image
                                src={currentCard.imageUrl}
                                alt={currentCard.word}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 800px, 700px"
                                priority
                            />
                        </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold mt-4">{currentCard?.word}</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">{currentCard?.translation}</p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-4">
                    <Button
                        onClick={() => handleAnswer('der')}
                        className="w-24 sm:w-32 bg-blue-500 hover:bg-blue-600"
                        disabled={hasAnswered}
                    >
                        der
                    </Button>
                    <Button
                        onClick={() => handleAnswer('die')}
                        className="w-24 sm:w-32 bg-pink-500 hover:bg-pink-600"
                        disabled={hasAnswered}
                    >
                        die
                    </Button>
                    <Button
                        onClick={() => handleAnswer('das')}
                        className="w-24 sm:w-32 bg-green-500 hover:bg-green-600"
                        disabled={hasAnswered}
                    >
                        das
                    </Button>
                </div>

                {feedbackMessage && (
                    <div className="text-center mt-4 text-sm sm:text-lg font-medium">
                        {feedbackMessage}
                    </div>
                )}

                {hasAnswered && (
                    <div className="flex justify-center mt-4">
                        <Button
                            onClick={handleNext}
                            className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                        >
                            Next Word
                        </Button>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-3 pb-6">
                <p className="text-sm text-muted-foreground">
                    Correct answers: {correctAnswers.size}
                </p>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                >
                    Reset Progress
                </Button>
            </CardFooter>
        </Card>
    );
} 