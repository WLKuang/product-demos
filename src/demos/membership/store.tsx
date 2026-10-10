import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { addYears, generateMembers, iso, status, tierPrice, today, type Member } from './data'

type State = { members: Member[]; selectedId: string | null }

type Action =
  | { type: 'remind'; ids: string[] }
  | { type: 'renew'; id: string }
  | { type: 'note'; id: string; text: string }
  | { type: 'select'; id: string | null }

function update(members: Member[], ids: string[], fn: (m: Member) => Member) {
  return members.map((m) => (ids.includes(m.id) ? fn(m) : m))
}

function reducer(state: State, action: Action): State {
  const now = iso(today())
  switch (action.type) {
    case 'remind':
      return {
        ...state,
        members: update(state.members, action.ids, (m) => ({
          ...m,
          reminderSentAt: now,
          history: [{ date: now, text: status(m) === 'Lapsed' ? 'Win-back email sent' : 'Renewal reminder sent' }, ...m.history],
        })),
      }
    case 'renew':
      return {
        ...state,
        members: update(state.members, [action.id], (m) => {
          // Early renewals extend from the current renewal date; lapsed members restart from today.
          const from = status(m) === 'Lapsed' ? today() : new Date(m.renewalDate + 'T00:00:00')
          return {
            ...m,
            renewalDate: iso(addYears(from, 1)),
            renewedAt: now,
            reminderSentAt: undefined,
            history: [{ date: now, text: `Renewed ${m.tier} membership · £${tierPrice[m.tier]}` }, ...m.history],
          }
        }),
      }
    case 'note':
      return {
        ...state,
        members: update(state.members, [action.id], (m) => ({ ...m, notes: [{ date: now, text: action.text }, ...m.notes] })),
      }
    case 'select':
      return { ...state, selectedId: action.id }
  }
}

type Store = State & {
  remind: (ids: string[]) => void
  renew: (id: string) => void
  addNote: (id: string, text: string) => void
  select: (id: string | null) => void
  selected: Member | null
}

const Ctx = createContext<Store | null>(null)

export function MembershipStore({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ members: generateMembers(), selectedId: null }))

  const store = useMemo<Store>(
    () => ({
      ...state,
      remind: (ids) => dispatch({ type: 'remind', ids }),
      renew: (id) => dispatch({ type: 'renew', id }),
      addNote: (id, text) => dispatch({ type: 'note', id, text }),
      select: (id) => dispatch({ type: 'select', id }),
      selected: state.members.find((m) => m.id === state.selectedId) ?? null,
    }),
    [state],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useMembership() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useMembership must be used inside MembershipStore')
  return store
}
