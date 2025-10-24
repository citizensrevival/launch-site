import { useId, useState } from 'react'

import { Button } from './Button'
import { useTheme } from './contexts/ThemeContext'
import { useAppSelector, useAppDispatch } from './store/hooks'
import { setEmailSubscribed } from './store/slices/sessionSlice'
import { LeadsPublic } from './lib/LeadsPublic'
import { EnvironmentConfigProvider } from './lib/supabase'
import { Icon } from '@mdi/react'
import { mdiCheck } from '@mdi/js'

export function SignUpForm() {
  let id = useId()
  const theme = useTheme()
  const colorTheme = theme?.colorTheme || 'purple'
  const dispatch = useAppDispatch()
  const emailSubscribed = useAppSelector((state) => state.session.emailSubscribed)
  
  // Form state
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Get theme-specific colors for focus ring
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          focusRing: 'peer-focus:ring-emerald-300/15',
          focusBorder: 'peer-focus:ring-emerald-300'
        }
      case 'blue':
        return {
          focusRing: 'peer-focus:ring-blue-300/15',
          focusBorder: 'peer-focus:ring-blue-300'
        }
      case 'amber':
        return {
          focusRing: 'peer-focus:ring-amber-300/15',
          focusBorder: 'peer-focus:ring-amber-300'
        }
      case 'rose':
        return {
          focusRing: 'peer-focus:ring-rose-300/15',
          focusBorder: 'peer-focus:ring-rose-300'
        }
      default: // purple
        return {
          focusRing: 'peer-focus:ring-purple-300/15',
          focusBorder: 'peer-focus:ring-purple-300'
        }
    }
  }

  const themeColors = getThemeColors(colorTheme)
  
  // Check if user has already subscribed to email
  const isEmailSubscribed = emailSubscribed
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Please enter your email address')
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      // Initialize LeadsPublic with environment config
      const configProvider = new EnvironmentConfigProvider()
      const leadsPublic = new LeadsPublic(configProvider)
      
      // Create lead with email subscription
      const result = await leadsPublic.createLead({
        lead_kind: 'subscriber',
        email: email.trim(),
        source_path: window.location.pathname,
        meta: {
          subscription_type: 'email_updates',
          subscribed_at: new Date().toISOString()
        }
      })
      
      if (result.success) {
        // Update Redux state to mark as subscribed
        dispatch(setEmailSubscribed(true))
        setSubmitStatus('success')
        setEmail('')
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error?.message || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
      console.error('Email subscription error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      {isEmailSubscribed ? (
        <div className="relative isolate flex items-center justify-center pr-1">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
            <div className="flex-shrink-0">
              <Icon path={mdiCheck} className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">You're subscribed for updates!</p>
              <p className="text-gray-300">Keep an eye on your inbox.</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {submitStatus === 'success' && (
            <div className="relative isolate flex items-center justify-center pr-1 mb-4">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">Successfully subscribed!</p>
                  <p className="text-gray-300">You'll receive updates about the event.</p>
                </div>
              </div>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="relative isolate flex items-center justify-center pr-1 mb-4">
              <div className="flex items-center space-x-3 bg-red-500/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-red-500/20">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-red-300 font-medium">Subscription failed</p>
                  <p className="text-red-200">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative isolate flex items-center pr-1">
            <label htmlFor={id} className="sr-only">
              Email address
            </label>
            <input
              required
              type="email"
              autoComplete="email"
              name="email"
              id={id}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              disabled={isSubmitting}
              className="peer w-0 flex-auto bg-transparent px-4 py-2.5 text-base text-white placeholder:text-gray-500 focus:outline-hidden sm:text-[0.8125rem]/6 disabled:opacity-50"
            />
            <Button type="submit" arrow disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Stay Informed'}
            </Button>
            <div className={`absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 ${themeColors.focusRing}`} />
            <div className={`absolute inset-0 -z-10 rounded-lg bg-white/2.5 ring-1 ring-white/15 transition ${themeColors.focusBorder}`} />
          </form>
        </div>
      )}
    </div>
  )
}
