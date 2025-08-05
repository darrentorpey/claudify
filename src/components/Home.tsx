import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { SpotifyRecentTrack } from "../lib/spotify";
import { trpc } from "../lib/trpc-client";

export default function HomeComponent() {
	const [code, setCode] = useState<string | null>(null);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const codeParam = urlParams.get("code");
		if (codeParam) {
			setCode(codeParam);
		}
	}, []);

	const [accessToken, setAccessToken] = useState<string | null>(
		typeof window !== "undefined"
			? localStorage.getItem("spotify_access_token")
			: null,
	);
	const [refreshToken, setRefreshToken] = useState<string | null>(
		typeof window !== "undefined"
			? localStorage.getItem("spotify_refresh_token")
			: null,
	);

	const authUrlQuery = trpc.getAuthUrl.useQuery();
	const exchangeCodeMutation = trpc.exchangeCodeForToken.useMutation();
	const refreshTokenMutation = trpc.refreshToken.useMutation();
	const recentTracksQuery = trpc.getRecentTracks.useQuery(
		{ accessToken: accessToken || "" },
		{ enabled: !!accessToken },
	);

	useEffect(() => {
		if (code && !accessToken && !exchangeCodeMutation.isPending) {
			exchangeCodeMutation.mutate(
				{ code },
				{
					onSuccess: (tokenResponse) => {
						setAccessToken(tokenResponse.access_token);
						localStorage.setItem(
							"spotify_access_token",
							tokenResponse.access_token,
						);

						if (tokenResponse.refresh_token) {
							setRefreshToken(tokenResponse.refresh_token);
							localStorage.setItem(
								"spotify_refresh_token",
								tokenResponse.refresh_token,
							);
						}

						// Clear the code from URL
						window.history.replaceState({}, document.title, "/");
						setCode(null); // Clear the code state to prevent re-triggering
					},
					onError: (error) => {
						console.error("Failed to exchange code:", error);
						setCode(null); // Clear the code state even on error
					},
				},
			);
		}
	}, [code, accessToken]);

	// Handle token refresh on 401 errors
	useEffect(() => {
		if (
			recentTracksQuery.error &&
			refreshToken &&
			!refreshTokenMutation.isPending
		) {
			const errorMessage = recentTracksQuery.error.message;
			// Check if it's a 401 error (token expired) and we haven't already tried refreshing
			if (
				(errorMessage.includes("401") ||
					errorMessage.includes("unauthorized")) &&
				!refreshTokenMutation.isError
			) {
				console.log("🔄 Access token expired, attempting refresh...");
				refreshTokenMutation.mutate(
					{ refreshToken },
					{
						onSuccess: (newTokenResponse) => {
							console.log("✅ Token refreshed successfully");
							setAccessToken(newTokenResponse.access_token);
							localStorage.setItem(
								"spotify_access_token",
								newTokenResponse.access_token,
							);

							if (newTokenResponse.refresh_token) {
								setRefreshToken(newTokenResponse.refresh_token);
								localStorage.setItem(
									"spotify_refresh_token",
									newTokenResponse.refresh_token,
								);
							}
						},
						onError: (error) => {
							console.error("❌ Failed to refresh token:", error);
							// Clear tokens and force re-authentication
							localStorage.removeItem("spotify_access_token");
							localStorage.removeItem("spotify_refresh_token");
							setAccessToken(null);
							setRefreshToken(null);
						},
					},
				);
			}
		}
	}, [recentTracksQuery.error, refreshToken]);

	if (!accessToken) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
					<h1 className="text-3xl font-bold mb-6 text-gray-900">
						Connect to Spotify
					</h1>
					<p className="text-gray-600 mb-6">
						Connect your Spotify account to view your last 50 listened tracks
					</p>
					{authUrlQuery.data && (
						<a
							href={authUrlQuery.data}
							className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg inline-block transition-colors"
						>
							Connect Spotify
						</a>
					)}
					{exchangeCodeMutation.isPending && (
						<div className="mt-4 text-gray-600">Connecting...</div>
					)}
				</div>
			</div>
		);
	}

	if (recentTracksQuery.isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your listening history...</p>
				</div>
			</div>
		);
	}

	if (recentTracksQuery.error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
					<h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
					<p className="text-gray-600 mb-4">
						Failed to load your listening history
					</p>
					<button
						type="button"
						onClick={() => {
							localStorage.removeItem("spotify_access_token");
							localStorage.removeItem("spotify_refresh_token");
							setAccessToken(null);
							setRefreshToken(null);
						}}
						className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
					>
						Reconnect
					</button>
				</div>
			</div>
		);
	}

	const tracks = recentTracksQuery.data || [];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h1 className="text-3xl font-bold mb-2 text-gray-900">
						Your Recent Listening History
					</h1>
					<p className="text-gray-600">
						Your last {tracks.length} tracks from Spotify
					</p>
					<button
						type="button"
						onClick={() => {
							localStorage.removeItem("spotify_access_token");
							localStorage.removeItem("spotify_refresh_token");
							setAccessToken(null);
							setRefreshToken(null);
						}}
						className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
					>
						Disconnect
					</button>
				</div>

				<div className="grid gap-4">
					{tracks.map((item: SpotifyRecentTrack, index: number) => (
						<TrackCard
							key={`${item.track.id}-${item.played_at}-${index}`}
							track={item}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function TrackCard({ track }: { track: SpotifyRecentTrack }) {
	const albumImage = track.track.album.images?.[0]?.url;
	const playedAt = new Date(track.played_at).toLocaleString();

	return (
		<div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
			<div className="flex items-center space-x-4">
				{albumImage && (
					<img
						src={albumImage}
						alt={track.track.album.name}
						className="w-16 h-16 rounded-md object-cover"
					/>
				)}
				<div className="flex-1 min-w-0">
					<Link
						to="/song/$trackId"
						params={{ trackId: track.track.id }}
						className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors truncate block"
					>
						{track.track.name}
					</Link>
					<p className="text-gray-600 truncate">
						{track.track.artists.map((artist) => artist.name).join(", ")}
					</p>
					<p className="text-sm text-gray-500 truncate">
						{track.track.album.name}
					</p>
					<p className="text-xs text-gray-400 mt-1">
						Played at {playedAt} •
						<a
							href={track.track.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							className="text-green-600 hover:text-green-800 ml-1"
						>
							Open in Spotify
						</a>
					</p>
				</div>
				<div className="text-sm text-gray-500">
					{Math.floor(track.track.duration_ms / 60000)}:
					{String(
						Math.floor((track.track.duration_ms % 60000) / 1000),
					).padStart(2, "0")}
				</div>
			</div>
		</div>
	);
}
