import { atom } from 'nanostores'
import type { Episode } from '../utils/feed'

export const $currentEpisode = atom<Episode | null>(null)
export const $episodeList = atom<Episode[]>([])
