# Claudify - Spotify Listening History

A React application with Express backend that displays your last 100 songs listened to on Spotify.

## Tech Stack

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Express** - Backend API server
- **TypeScript** - Type safety
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Data fetching and caching
- **TanStack Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Spotify Web API** - Music data

## Features

- 🎵 View your last 100 played tracks from Spotify
- 🔗 Click any song to open it in Spotify
- 📱 Responsive design
- 🔐 Secure Spotify OAuth integration
- ⚡ Fast loading with React Query caching

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd claudify
npm install
```

### 2. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3001/api/callback` to Redirect URIs
4. Copy your Client ID and Client Secret

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your Spotify credentials:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/callback
```

### 4. Run the Application

```bash
npm run dev
```

This starts both the Express API server (port 3001) and Vite dev server (usually port 5173).
Visit the client URL shown in your terminal and connect your Spotify account!

## Development

- `npm run dev` - Start both API server and client dev server
- `npm run dev:server` - Start API server only (port 3001)
- `npm run dev:client` - Start client dev server only (usually port 5173)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript checks

## How it Works

1. **Authentication**: Uses Spotify's OAuth 2.0 flow
2. **API Integration**: Express server with tRPC endpoints fetch data from Spotify Web API
3. **UI**: React components display tracks with album art, artist info, and Spotify links
4. **Caching**: React Query caches API responses for better performance

## Project Structure

```
src/
├── lib/
│   ├── spotify.ts          # Spotify API client
│   ├── trpc.ts            # tRPC setup
│   └── trpc-client.tsx    # Client-side tRPC config
├── routes/
│   ├── __root.tsx         # Root layout
│   └── index.tsx          # Main page
├── server/
│   └── router.ts          # tRPC router definition
├── main.tsx               # React app entry point
└── index.css              # Tailwind styles
server.ts                  # Express API server
```

## License

MIT