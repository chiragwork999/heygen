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
- PORT=3000
 or
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_news_api_key
RUN_SCHEDULE=0 8 * * *
HEYGEN_API_KEY=your_heygen_api_key
HEYGEN_AVATAR_ID=your_heygen_avatar_id
HEYGEN_VOICE_ID=your_heygen_voice_id
HEYGEN_BASE_URL=https://api.heygen.com
DAILY_IMAGE_URL=https://your-cdn.com/today.jpg

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
