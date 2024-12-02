import Flashcard from '@/components/Flashcard';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          German Articles Flashcards
        </h1>
        <Flashcard />
      </div>
    </main>
  );
}