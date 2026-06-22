import { store } from "@/store/github.store"
import { clearGithubData } from "@/services/github.slice"

export function clearGithubStorage() {
  store.dispatch(clearGithubData())
}
