import { useEffect, useState } from 'react'
import Gallery from './Gallery'
import PhotoUploader from './PhotoUploader'
import { EVENT_TITLE, COUPLE_NAMES, SHOW_GALLERY } from './config'

const STORAGE_KEY = 'rpt.guest'

export default function App() {
  // ── tiny hash router so #gallery opens the photo wall ──
  const [route, setRoute] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [name, setName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {
      /* ignore */
    }
    setName(trimmed)
  }

  const handleSwitch = () => {
    localStorage.removeItem(STORAGE_KEY)
    setName(null)
    setInput('')
  }

  if (route === '#gallery') return <Gallery guestName={name} />

  // ── Welcome / name-entry screen ────────────────────────────
  if (!name) {
    return (
      <div className="page">
        <div className="card welcome fade-in">
          <p className="eyebrow">Welcome</p>
          <h1 className="title">{EVENT_TITLE}</h1>
          {COUPLE_NAMES && <p className="couple">{COUPLE_NAMES}</p>}
          <p className="subtitle">
            Enter your name so we know whose photos are whose, then take or
            share a photo.
          </p>
          <form onSubmit={handleSubmit} className="name-form">
            <input
              className="name-input"
              type="text"
              placeholder="Your name"
              value={input}
              autoFocus
              autoComplete="name"
              onChange={(e) => setInput(e.target.value)}
              aria-label="Your name"
            />
            <button className="btn" type="submit" disabled={!input.trim()}>
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Photo screen ─────────────────────────────────────────────
  return (
    <div className="page">
      <div className="card result fade-in">
        <p className="eyebrow">Welcome, {name.split(' ')[0]}</p>
        <h1 className="title">Share a Photo</h1>
        <p className="subtitle">Snap or pick a photo to add it to the wall.</p>

        <div className="upload">
          <PhotoUploader guestName={name} />
        </div>

        {SHOW_GALLERY && (
          <a className="btn btn-ghost gallery-btn" href="#gallery">
            📸 View the Photo Wall
          </a>
        )}

        <button className="link-btn" onClick={handleSwitch}>
          Not you? Switch name
        </button>
      </div>
    </div>
  )
}
