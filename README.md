# 💌 For Niti — Romantic Proposal Website

A cinematic, one-of-a-kind romantic proposal website built for Krutik → Niti.

## ✨ Journey

1. **Universe** — Deep starfield with twinkling stars & shooting stars
2. **Heart Constellation** — Stars drift together to form a glowing heart, "Niti" appears in starlight
3. **Envelope** — Stars implode → a glowing wax-sealed envelope materialises
4. **Love Letter** — Envelope opens, typewriter love letter appears with rose petals
5. **The Question** — "Will you be mine?" with a YES button that glows, and a NO button that *runs away*
6. **Celebration** — Heart confetti explosion on YES 🎉

---

## 🎵 Adding Background Music

1. Download any romantic piano MP3 (e.g. from [pixabay.com/music](https://pixabay.com/music/) — search "romantic piano")
2. Rename the file to **`music.mp3`**
3. Place it in this folder (`e:\Niti\music.mp3`)

The music will auto-play (muted by browsers until user interaction — tapping the envelope unlocks it).  
The **♫ button** (top-right) toggles mute/unmute.

---

## 🚀 Deploy to Vercel

**Option A — Vercel Dashboard (easiest):**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Drag & drop this entire `Niti` folder
3. Done! You'll get a shareable link like `https://niti.vercel.app`

**Option B — Vercel CLI:**
```bash
npx vercel --prod
```

---

## ✏️ Customisation

- **Letter text** — edit `LETTER` constant at the top of `script.js`
- **Colors** — edit CSS variables in `:root` block in `style.css`
- **Timing** — adjust `setTimeout` values in `script.js` (in milliseconds)
