import { z } from "zod";

const SpotifyTrackSchema = z.object({
	id: z.string(),
	name: z.string(),
	artists: z.array(
		z.object({
			name: z.string(),
		}),
	),
	album: z.object({
		name: z.string(),
		images: z.array(
			z.object({
				url: z.string(),
				height: z.number().optional(),
				width: z.number().optional(),
			}),
		),
	}),
	external_urls: z.object({
		spotify: z.string(),
	}),
	duration_ms: z.number(),
});

const SpotifyRecentTracksResponseSchema = z.object({
	items: z.array(
		z.object({
			track: SpotifyTrackSchema,
			played_at: z.string(),
		}),
	),
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
export type SpotifyRecentTrack = {
	track: SpotifyTrack;
	played_at: string;
};

export type SpotifyTokenResponse = {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
};

export class SpotifyAPI {
	private clientId: string;
	private clientSecret: string;
	private redirectUri: string;

	constructor() {
		this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
		this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
		this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";
	}

	getAuthURL(): string {
		const scopes = "user-read-recently-played";
		const params = new URLSearchParams({
			response_type: "code",
			client_id: this.clientId,
			scope: scopes,
			redirect_uri: this.redirectUri,
		});

		return `https://accounts.spotify.com/authorize?${params.toString()}`;
	}

	async getAccessToken(code: string): Promise<SpotifyTokenResponse> {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				redirect_uri: this.redirectUri,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(
				`Failed to get access token: ${response.status} - ${error}`,
			);
		}

		const data = await response.json();
		return {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			expires_in: data.expires_in,
			token_type: data.token_type,
		};
	}

	async refreshAccessToken(
		refreshToken: string,
	): Promise<SpotifyTokenResponse> {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(
				`Failed to refresh access token: ${response.status} - ${error}`,
			);
		}

		const data = await response.json();
		return {
			access_token: data.access_token,
			refresh_token: data.refresh_token || refreshToken, // Keep original if new one not provided
			expires_in: data.expires_in,
			token_type: data.token_type,
		};
	}

	async getRecentTracks(
		accessToken: string,
		limit = 50,
	): Promise<SpotifyRecentTrack[]> {
		const url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`;
		console.log("🔗 Making request to:", url);

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log("📡 Spotify API response status:", response.status);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("❌ Spotify API error response:", errorBody);
			throw new Error(`Spotify API error: ${response.status} - ${errorBody}`);
		}

		const data = await response.json();
		console.log("✅ Spotify API response received, parsing...");

		try {
			const parsed = SpotifyRecentTracksResponseSchema.parse(data);
			console.log(`🎵 Successfully parsed ${parsed.items.length} tracks`);
			return parsed.items;
		} catch (parseError) {
			console.error("❌ Error parsing Spotify response:", parseError);
			console.error("Raw response data:", JSON.stringify(data, null, 2));
			throw new Error(
				`Failed to parse Spotify response: ${(parseError as Error).message}`,
			);
		}
	}

	async getTrackHistory(
		accessToken: string,
		trackId: string,
	): Promise<SpotifyRecentTrack[]> {
		const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;
		console.log("🔗 Making request to:", url, "for track:", trackId);

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log("📡 Spotify API response status:", response.status);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("❌ Spotify API error response:", errorBody);
			throw new Error(`Spotify API error: ${response.status} - ${errorBody}`);
		}

		const data = await response.json();
		console.log("✅ Spotify API response received, filtering for track...");

		try {
			const parsed = SpotifyRecentTracksResponseSchema.parse(data);
			const filteredTracks = parsed.items.filter(
				(item) => item.track.id === trackId,
			);
			console.log(
				`🎵 Found ${filteredTracks.length} instances of track ${trackId}`,
			);
			return filteredTracks.slice(0, 5); // Return last 5 instances
		} catch (parseError) {
			console.error("❌ Error parsing Spotify response:", parseError);
			console.error("Raw response data:", JSON.stringify(data, null, 2));
			throw new Error(
				`Failed to parse Spotify response: ${(parseError as Error).message}`,
			);
		}
	}
}

export const spotifyAPI = new SpotifyAPI();
