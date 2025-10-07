import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SimpleLayout } from '../components/SimpleLayout'
import { Button } from '../components/Button'
import privacyPolicyContent from './PrivacyPolicy.md?raw'

export default function PrivacyPolicyPage() {
  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>
        <div className="prose prose-lg max-w-none prose-gray">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {privacyPolicyContent}
          </ReactMarkdown>
        </div>
      </div>
    </SimpleLayout>
  )
}
