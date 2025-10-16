import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { setSelectedSite, setLoading, setError } from '../store/slices/siteSlice'
import { createClient } from '@supabase/supabase-js'

interface SiteContextType {
  site: any | null
  loading: boolean
  error: string | null
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

interface SiteProviderProps {
  children: ReactNode
  slug: string
}

export function SiteProvider({ children, slug }: SiteProviderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedSite, loading, error } = useSelector((state: RootState) => state.site)

  useEffect(() => {
    const fetchSite = async () => {
      if (!slug) return

      dispatch(setLoading(true))
      
      try {
        // Create Supabase client
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration missing')
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Fetch site by slug
        const { data, error: fetchError } = await supabase
          .from('site')
          .select('*')
          .eq('slug', slug)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          dispatch(setSelectedSite(data))
        } else {
          dispatch(setError(`Site with slug '${slug}' not found`))
        }
      } catch (err) {
        console.error('Error fetching site:', err)
        dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch site'))
      }
    }

    fetchSite()
  }, [slug, dispatch])

  const value: SiteContextType = {
    site: selectedSite,
    loading,
    error
  }

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}
