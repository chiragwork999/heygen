# Auto Tech Shorts Studio (HeyGen + OpenAI)

Professional web app that generates realistic, interactive-style 20-30 second tech shorts daily.

## Features
- Fresh daily technology topics from NewsAPI.
- New script generated each run using OpenAI.
- Realistic talking-avatar video rendered through HeyGen.
- Professional web UI for one-click generation + preview.
- Automatic daily generation via cron.

## Requirements
- Node.js 18+
- OpenAI API key
- HeyGen API key + avatar/voice IDs
- (Optional) NewsAPI key for latest headlines

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Environment
Configure `.env` values:
- `OPENAI_API_KEY`
- `HEYGEN_API_KEY`
- `HEYGEN_AVATAR_ID`
- `HEYGEN_VOICE_ID`
- `NEWS_API_KEY` (optional)
- `DAILY_IMAGE_URL` (optional background image URL for HeyGen)

## API
### POST `/api/generate`
```json
{
  "imagePath": "public/uploads/today.jpg"
}
```
Returns generated script, HeyGen video ID, status, and hosted video URL.

## Notes
- HeyGen generation is asynchronous and may take up to a couple minutes.
- This app polls HeyGen status automatically before returning result.
