'use client'

import { useState } from 'react'
import { generateArticle } from '@/app/actions/generateArticle'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Copy, Check } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useClipboard } from 'use-clipboard-copy'
import { Article } from '@/types/article'
import { cn } from "@/lib/utils"

// Types
type AIModel = 'anthropic' | 'openai'

// Constants
const TONE_CATEGORIES = [
  {
    name: 'Formal',
    tones: [
      { id: 'formal', label: 'Formal', description: 'Suitable for academic, scientific, or business articles' },
      { id: 'professional', label: 'Professional/Official', description: 'Serious tone suitable for corporate or official communication' },
      { id: 'analytical', label: 'Analytical', description: 'Delves deeply into data, trends, or issues' },
    ]
  },
  {
    name: 'Creative',
    tones: [
      { id: 'informal', label: 'Informal', description: 'Casual and conversational' },
      { id: 'descriptive', label: 'Descriptive', description: 'Explains something in detail, creating vivid imagery' },
      { id: 'narrative', label: 'Narrative', description: 'Tells a story with a clear structure' },
      { id: 'humorous', label: 'Humorous', description: 'Light-hearted and entertaining' },
    ]
  },
  {
    name: 'Persuasive',
    tones: [
      { id: 'persuasive', label: 'Persuasive', description: 'Aims to convince the reader' },
      { id: 'inspirational', label: 'Inspirational/Motivational', description: 'Aims to uplift and inspire the audience' },
      { id: 'provocative', label: 'Provocative', description: 'Designed to spark discussion or controversy' },
    ]
  },
  {
    name: 'Informative',
    tones: [
      { id: 'informative', label: 'Informative', description: 'Focuses on delivering facts without personal opinions' },
      { id: 'skeptical', label: 'Skeptical/Critical', description: 'Questions or critiques ideas, policies, or technology' },
      { id: 'visionary', label: 'Visionary', description: 'Looks toward the future, focusing on innovation and big ideas' },
    ]
  },
  {
    name: 'Emotional',
    tones: [
      { id: 'empathetic', label: 'Empathetic', description: 'Shows deep understanding and care for the audience\'s feelings' },
      { id: 'optimistic', label: 'Optimistic/Positive', description: 'Highlights the good and focuses on a hopeful outlook' },
    ]
  },
] as const

// Sub-components
const TitleInput = ({ title, setTitle }: { title: string; setTitle: (title: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="title" className="text-lg font-semibold">Article Title</Label>
    <Input
      id="title"
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter a topic like 'The Future of AI'"
      required
      className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
    />
  </div>
)

const ModelSelector = ({ model, setModel }: { model: AIModel; setModel: (model: AIModel) => void }) => (
  <div className="space-y-2">
    <Label className="text-lg font-semibold">Select AI Model</Label>
    <RadioGroup defaultValue={model} onValueChange={(value) => setModel(value as AIModel)} className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
        <RadioGroupItem value="anthropic" id="anthropic" />
        <Label htmlFor="anthropic" className="cursor-pointer">Anthropic (Claude)</Label>
      </div>
      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
        <RadioGroupItem value="openai" id="openai" />
        <Label htmlFor="openai" className="cursor-pointer">OpenAI (ChatGPT)</Label>
      </div>
    </RadioGroup>
  </div>
)

/* const ToneSelector = ({
  selectedTones,
  onToneChange,
  onSelectAll,
  onClearAll
}: {
  selectedTones: string[];
  onToneChange: (toneId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) => (
  <div>
    <Label className="text-lg font-semibold mb-2 block">Select Tones (Multiple)</Label>
    <div className="flex justify-end space-x-2 mb-2">
      <Button type="button" variant="outline" size="sm" onClick={onSelectAll}>Select All</Button>
      <Button type="button" variant="outline" size="sm" onClick={onClearAll}>Clear All</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TONE_CATEGORIES.map((category) => (
        <ToneCategory
          key={category.name}
          category={category}
          selectedTones={selectedTones}
          onToneChange={onToneChange}
        />
      ))}
    </div>
  </div>
) */

const ToneCategory = ({
  category,
  selectedTones,
  onToneChange
}: {
  category: typeof TONE_CATEGORIES[number];
  selectedTones: string[];
  onToneChange: (toneId: string) => void;
}) => (
  <Card className="tone-card hover:border-blue-500 transition-colors">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
    </CardHeader>
    <CardContent>
      {category.tones.map((tone) => (
        <TooltipProvider key={tone.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={tone.id}
                  checked={selectedTones.includes(tone.id)}
                  onCheckedChange={() => onToneChange(tone.id)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={tone.id} className="cursor-pointer flex-grow">{tone.label}</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{tone.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </CardContent>
  </Card>
)

const ArticleDisplay = ({ 
  article, 
  onCopy, 
  isCopied 
}: { 
  article: Article; 
  onCopy: () => void; 
  isCopied: boolean;
}) => (
  <Card className="mt-8">
    <CardHeader>
      <CardTitle>{article.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="prose max-w-none">
        <p>{article.introduction}</p>
        {article.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
          </div>
        ))}
        <p>{article.conclusion}</p>
      </div>
    </CardContent>
    <CardFooter>
      <Button
        onClick={onCopy}
        className="ml-auto"
        variant="outline"
        size="sm"
        aria-label="Copy article to clipboard"
      >
        {isCopied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
)

// Main component
export function ArticleForm() {
  const [title, setTitle] = useState('')
  const [model, setModel] = useState<AIModel>('anthropic')
  const [selectedTones, setSelectedTones] = useState<string[]>([])
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clipboard = useClipboard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await generateArticle(title, model, selectedTones)
      if (result.success) {
        setArticle(result.article)
        toast({
          title: "Article Generated",
          description: "Your article has been generated successfully!",
        })
      } else {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to generate article. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToneChange = (toneId: string) => {
    setSelectedTones(prev =>
      prev.includes(toneId)
        ? prev.filter(id => id !== toneId)
        : [...prev, toneId]
    )
  }

  const handleSelectAllTones = () => {
    const allTones = TONE_CATEGORIES.flatMap(category => 
      category.tones.map(tone => tone.id)
    )
    setSelectedTones(allTones)
  }

  const handleClearAllTones = () => {
    setSelectedTones([])
  }

  const handleCopyToClipboard = () => {
    if (article) {
      const articleText = `
        ${article.title}

        ${article.introduction}

        ${article.sections.map((section) => `
          ${section.heading}
          ${section.content}
        `).join('\n\n')}

        ${article.conclusion}
      `.trim()

      clipboard.copy(articleText)
      setIsCopied(true)
      toast({
        title: "Copied to Clipboard",
        description: "The article has been copied to your clipboard.",
      })
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <TitleInput title={title} setTitle={setTitle} />
        <ModelSelector model={model} setModel={setModel} />
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Select Tones (Multiple)</Label>
          <div className="flex justify-end space-x-2 mb-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAllTones}
              className="hover:bg-blue-50"
            >
              Select All
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleClearAllTones}
              className="hover:bg-blue-50"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TONE_CATEGORIES.map((category) => (
              <ToneCategory
                key={category.name}
                category={category}
                selectedTones={selectedTones}
                onToneChange={handleToneChange}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !title.trim()} 
          className={cn(
            "w-full generate-button",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Article'
          )}
        </Button>
      </form>

      {article && (
        <ArticleDisplay
          article={article}
          onCopy={handleCopyToClipboard}
          isCopied={isCopied}
        />
      )}
    </div>
  )
}

