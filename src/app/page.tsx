import { ArticleForm } from '@/components/ArticleForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-10">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          AI Article Generator
        </h1>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-6 mb-8 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg mb-3">How to use:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li className="opacity-90 hover:opacity-100 transition-opacity">Enter your article title or topic</li>
            <li className="opacity-90 hover:opacity-100 transition-opacity">Choose between Anthropic (Claude) or OpenAI (ChatGPT)</li>
            <li className="opacity-90 hover:opacity-100 transition-opacity">Select one or more tones for your article</li>
            <li className="opacity-90 hover:opacity-100 transition-opacity">Click Generate Article and wait for the magic to happen!</li>
          </ol>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <ArticleForm />
        </div>
      </div>
    </main>
  )
}

