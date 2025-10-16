import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SimpleLayout } from '../../shell/SimpleLayout'
import { Button } from '../../shell/Button'
import { useAnalytics } from '../../shell/contexts/AnalyticsContext'
import { supabase } from '../../shell/lib/supabase'
import { useAppDispatch } from '../../shell/store/hooks'
import { clearGetInvolvedSubmissions, setEmailSubscribed } from '../../shell/store/slices/sessionSlice'

interface LeadType {
  id: string
  label: string
  description: string
}

const LEAD_TYPES: LeadType[] = [
  {
    id: 'subscriber',
    label: 'Newsletter & Updates',
    description: 'Stay informed about community events, news, and important announcements'
  },
  {
    id: 'vendor',
    label: 'Vendor Opportunities',
    description: 'Information about vendor applications, market events, and business opportunities'
  },
  {
    id: 'sponsor',
    label: 'Sponsorship Opportunities',
    description: 'Details about sponsorship packages, events, and partnership opportunities'
  },
  {
    id: 'volunteer',
    label: 'Volunteer Opportunities',
    description: 'Updates about volunteer positions, community service events, and ways to help'
  }
]

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { trackEvent } = useAnalytics()
  const dispatch = useAppDispatch()

  // Handle deep link with email parameter
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTypes.length === LEAD_TYPES.length) {
      setSelectedTypes([])
    } else {
      setSelectedTypes(LEAD_TYPES.map(type => type.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (selectedTypes.length === 0) {
      setError('Please select at least one type of communication to unsubscribe from')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Track unsubscribe event (don't fail if analytics is down)
      try {
        await trackEvent('unsubscribe_attempt', 'form_submit', {
          email: email,
          unsubscribed_types: selectedTypes,
          source_path: window.location.pathname
        })
      } catch (analyticsError) {
        console.warn('Analytics tracking failed, continuing with unsubscribe:', analyticsError)
      }

      // Insert unsubscribe record
      const { error: insertError } = await supabase
        .from('unsubscribes')
        .insert({
          email: email.trim(),
          unsubscribed_lead_types: selectedTypes,
          source_path: window.location.pathname,
          user_agent: navigator.userAgent,
          ip_address: null // We'll let Supabase handle IP tracking
        })

      if (insertError) {
        throw insertError
      }

      // Clear Redux state and local storage for unsubscribed lead types
      const unsubscribedTypes = selectedTypes
      
      // Clear get involved submissions for unsubscribed types
      if (unsubscribedTypes.includes('vendor') || unsubscribedTypes.includes('sponsor') || unsubscribedTypes.includes('volunteer')) {
        dispatch(clearGetInvolvedSubmissions())
      }
      
      // Clear email subscription if unsubscribing from subscriber type
      if (unsubscribedTypes.includes('subscriber')) {
        dispatch(setEmailSubscribed(false))
      }

      // Track successful unsubscribe (don't fail if analytics is down)
      try {
        await trackEvent('unsubscribe_success', 'form_complete', {
          email: email,
          unsubscribed_types: selectedTypes
        })
      } catch (analyticsError) {
        console.warn('Analytics tracking failed, but unsubscribe was successful:', analyticsError)
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Unsubscribe error:', err)
      setError('Failed to process your unsubscribe request. Please try again.')
      
      // Track error event (don't fail if analytics is down)
      try {
        await trackEvent('unsubscribe_error', 'form_error', {
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      } catch (analyticsError) {
        console.warn('Analytics tracking failed for error event:', analyticsError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <SimpleLayout>
        <div className="max-w-4xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">
          <div className="mb-8">
            <Button to="/" arrow={false}>
              ← Back to Home
            </Button>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-green-800">Unsubscribe Successful</h1>
            </div>
            <p className="text-green-700">
              You have been successfully unsubscribed from the selected communication types. 
              You will no longer receive emails for: <strong>{selectedTypes.map(type => 
                LEAD_TYPES.find(t => t.id === type)?.label
              ).join(', ')}</strong>.
            </p>
            <p className="text-green-600 text-sm mt-2">
              Your previous form submissions for these types have been cleared from our system. 
              If you change your mind, you can always re-subscribe by visiting our website and filling out the "Get Involved" form.
            </p>
          </div>
        </div>
      </SimpleLayout>
    )
  }

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Unsubscribe from Communications</h1>
            <p className="text-gray-600 text-lg">
              We're sorry to see you go! Please let us know which types of communications you'd like to stop receiving.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Lead Type Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Communications to Unsubscribe From
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-500 font-medium"
                >
                  {selectedTypes.length === LEAD_TYPES.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="space-y-3">
                {LEAD_TYPES.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={type.id}
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeToggle(type.id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={type.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {type.label}
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || selectedTypes.length === 0}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Unsubscribe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SimpleLayout>
  )
}
