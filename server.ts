import dotenv from "dotenv";

dotenv.config();

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { appRouter } from "./src/server/router";

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from Vite dev server
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Handle preflight requests
app.use((req, res, next) => {
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
});

// Request logging middleware for development
app.use((req, res, next) => {
	console.log(`📍 ${req.method} ${req.url}`);
	next();
});

app.use(
	"/api/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext: () => ({}),
	}),
);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
	console.error('🔥 Server Error:', err.message);
	console.error('Stack:', err.stack);
	console.error('Request URL:', req.url);
	console.error('Request Method:', req.method);
	res.status(500).json({
		error: 'Internal Server Error',
		message: err.message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
});

// Handle Spotify OAuth callback
app.get("/api/callback", (req, res) => {
	console.log(req.query);
	const { code } = req.query;

	if (!code) {
		return res.status(400).send("No authorization code provided");
	}

	// Redirect to frontend with the code
	res.redirect(`http://localhost:5173/?code=${code}`);
});

app.listen(port, () => {
	console.log('🚀 Server started successfully!');
	console.log(`📡 API server: http://localhost:${port}`);
	console.log(`🎵 Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Loaded' : '❌ Missing'}`);
	console.log(`🔄 Redirect URI: ${process.env.SPOTIFY_REDIRECT_URI}`);
	console.log('📝 Available endpoints:');
	console.log('  - GET  /api/trpc/getAuthUrl');
	console.log('  - POST /api/trpc/exchangeCodeForToken');
	console.log('  - POST /api/trpc/getRecentTracks');
	console.log('  - GET  /api/callback (Spotify OAuth)');
	console.log('---');
});
