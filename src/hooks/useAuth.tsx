import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import type { BusinessMember, Business, Profile } from '@/types/database'

interface AuthState {
  loading: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  // The business this user is tied to, and their membership row in it.
  // For an owner this is the business they own; for an employee it's the
  // business they were invited into.
  business: Business | null
  membership: BusinessMember | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [membership, setMembership] = useState<BusinessMember | null>(null)

  async function loadUserContext(userId: string) {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(profileData ?? null)

    // Try owner path first: does this user own a business?
    const { data: ownedBusiness } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()

    if (ownedBusiness) {
      setBusiness(ownedBusiness)
      const { data: ownerMembership } = await supabase
        .from('business_members')
        .select('*')
        .eq('business_id', ownedBusiness.id)
        .eq('user_id', userId)
        .maybeSingle()
      setMembership(ownerMembership ?? null)
      return
    }

    // Otherwise: is this user an employee member of some business?
    const { data: memberRow } = await supabase
      .from('business_members')
      .select('*, businesses(*)')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle()

    if (memberRow) {
      setMembership(memberRow as unknown as BusinessMember)
      const biz = (memberRow as any).businesses as Business
      setBusiness(biz ?? null)
    } else {
      setBusiness(null)
      setMembership(null)
    }
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    if (data.session?.user) {
      await loadUserContext(data.session.user.id)
    } else {
      setProfile(null)
      setBusiness(null)
      setMembership(null)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await refresh()
      if (mounted) setLoading(false)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        await loadUserContext(newSession.user.id)
      } else {
        setProfile(null)
        setBusiness(null)
        setMembership(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value: AuthState = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    business,
    membership,
    refresh,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
