import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type GermanNoun = {
    article: string;
    word: string;
    translation: string;
}

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public/data/german_nouns.txt');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        const [article, word, translation] = randomLine.split(',');

        return NextResponse.json({
            article,
            word,
            translation
        } satisfies GermanNoun);
    } catch (error) {
        console.error('Error reading flashcard:', error);
        return NextResponse.json(
            { error: 'Failed to get flashcard' },
            { status: 500 }
        );
    }
} 