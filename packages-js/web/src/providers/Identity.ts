import { createSignal } from 'solid-js'
import { LSKeys } from '../utils/localStorage'

interface KnownUser {
  type: 'known'
  id: string
  token: string
  name: string
}
interface UnknownUser {
  type: 'unknown'
}
type User = KnownUser | UnknownUser

const [token, setToken] = createSignal<string | null>(
  localStorage.getItem(LSKeys.ID_TOKEN)
)
