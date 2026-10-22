import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient.js'
import { CATEGORIES, setCategories } from '../data/categories.js'

const CategoriesContext = createContext({ reload: async () => {} })

export function CategoriesProvider({ children }) {
  const [version, setVersion] = useState(0)

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const { data, error } = await supabase
      .from('categories')
      .select('slug,name,sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return

    const before = JSON.stringify(CATEGORIES)
    setCategories(data)
    if (JSON.stringify(CATEGORIES) !== before) {
      setVersion((v) => v + 1)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <CategoriesContext.Provider value={{ reload }}>
      <Fragment key={version}>{children}</Fragment>
    </CategoriesContext.Provider>
  )
}

export function useCategoriesReload() {
  return useContext(CategoriesContext).reload
}
