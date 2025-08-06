import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { SpotifyRecentTrack } from "../lib/spotify";
import { trpc } from "../lib/trpc-client";
import { ThemeController } from "./ThemeController";

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
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="p-8 rounded-lg max-w-md w-full text-center bg-white shadow-md">
					<h1 className="text-3xl font-bold mb-6 text-primary">
						Connect to Spotify
					</h1>
					<p className="mb-6 text-secondary">
						Connect your Spotify account to view your last 50 listened tracks
					</p>
					{authUrlQuery.data && (
						<a
							href={authUrlQuery.data}
							className="font-bold py-3 px-6 rounded-lg inline-block transition-opacity hover:opacity-80 bg-accent text-white"
						>
							Connect Spotify
						</a>
					)}
					{exchangeCodeMutation.isPending && (
						<div className="mt-4 text-secondary">Connecting...</div>
					)}
				</div>
			</div>
		);
	}

	if (recentTracksQuery.isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-accent mx-auto mb-4"></div>
					<p className="text-secondary">Loading your listening history...</p>
				</div>
			</div>
		);
	}

	if (recentTracksQuery.error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="p-8 rounded-lg max-w-md w-full text-center bg-white shadow-theme-md">
					<h2 className="text-2xl font-bold mb-4 text-error">Error</h2>
					<p className="mb-4 text-secondary">
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
						className="font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity bg-text-tertiary text-bg-primary"
					>
						Reconnect
					</button>
				</div>
			</div>
		);
	}

	const tracks = recentTracksQuery.data || [];

	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-8">
				<div className="rounded-lg p-6 px-4 mb-6 shadow-theme-md">
					<div className="flex justify-between items-start">
						<div className="text-primary">
							<h1 className="text-3xl font-bold mb-2 text-current">
								Your recent listening history
							</h1>

							<p className="text-secondary">
								Your last {tracks.length} tracks from Spotify
							</p>
						</div>

						<ThemeController />
					</div>
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

			<div className="flex flex-col items-center gap-4 fixed bottom-8 right-8">
				<button
					type="button"
					onClick={() => {
						localStorage.removeItem("spotify_access_token");
						localStorage.removeItem("spotify_refresh_token");
						setAccessToken(null);
						setRefreshToken(null);
					}}
					className="font-bold py-1 px-3 rounded-lg text-sm self-end hover:opacity-80 transition-opacity bg-text-tertiary text-bg-primary"
				>
					Disconnect
				</button>
			</div>
		</div>
	);
}

function TrackCard({ track }: { track: SpotifyRecentTrack }) {
	const albumImage = track.track.album.images?.[0]?.url;
	const playedAt = new Date(track.played_at).toLocaleString();

	return (
		<div className="rounded-lg p-4 transition-shadow hover:opacity-95 bg-white shadow-theme-md border border-accent">
			<div className="flex items-center gap-4">
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
						className="text-lg font-semibold transition-colors truncate block hover:opacity-80 text-accent"
					>
						{track.track.name}
					</Link>
					<p className="truncate text-secondary">
						{track.track.artists.map((artist) => artist.name).join(", ")}
					</p>
					<p className="text-sm truncate text-primary">
						{track.track.album.name}
					</p>
					<p className="text-xs mt-1 text-secondary">
						Played at {playedAt} •
						<a
							href={track.track.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							className="ml-1 hover:opacity-80 transition-opacity text-accent-primary"
						>
							Open in Spotify
						</a>
					</p>
				</div>
				<div className="text-sm text-secondary">
					{Math.floor(track.track.duration_ms / 60000)}:
					{String(
						Math.floor((track.track.duration_ms % 60000) / 1000),
					).padStart(2, "0")}
				</div>
			</div>
		</div>
	);
}
