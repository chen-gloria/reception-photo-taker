import { APPS_SCRIPT_URL } from './config'

// ── Photo gallery ────────────────────────────────────────────
export type Photo = { id: string; name: string }

// Requires the viewer's name (whatever they typed on the welcome screen) —
// the backend just checks it's non-empty, there's no guest list to verify
// against in this app.
export async function listPhotos(guestName: string): Promise<Photo[]> {
  if (!APPS_SCRIPT_URL) return []
  try {
    const res = await fetch(
      `${APPS_SCRIPT_URL}?photos=1&name=${encodeURIComponent(guestName)}`,
    )
    const data = await res.json()
    return Array.isArray(data.photos) ? (data.photos as Photo[]) : []
  } catch {
    return []
  }
}

// A CDN-resized thumbnail served from Google's image servers — tiny + fast.
// `size` is the width in px (e.g. 400 for the grid, 1600 for the lightbox).
export function photoUrl(id: string, size: number): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${size}`
}

// Alternate thumbnail host, used as an automatic <img> fallback if the
// primary one fails to load in a given browser.
export function photoUrlAlt(id: string, size: number): string {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`
}
