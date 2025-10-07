import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SimpleLayout } from '../components/SimpleLayout'
import { Button } from '../components/Button'
import termsContent from './TermsAndConditions.md?raw'

export default function TermsAndConditionsPage() {
  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {termsContent}
          </ReactMarkdown>
        </div>
      </div>
    </SimpleLayout>
  )
}
