import { useNavigate, useParams } from "@tanstack/react-router";
import type { SpotifyRecentTrack } from "../lib/spotify";
import { trpc } from "../lib/trpc-client";
import { ThemeController } from "./ThemeController";

export default function SongDetailComponent() {
	const navigate = useNavigate();
	const { trackId } = useParams({ from: "/song/$trackId" });

	const accessToken =
		typeof window !== "undefined"
			? localStorage.getItem("spotify_access_token")
			: null;

	const trackHistoryQuery = trpc.getTrackHistory.useQuery(
		{ accessToken: accessToken!, trackId },
		{ enabled: !!accessToken && !!trackId },
	);

	if (!accessToken) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="p-8 rounded-lg max-w-md w-full text-center bg-white shadow-theme-md">
					<h2 className="text-2xl font-bold mb-4 text-error">
						Access Required
					</h2>
					<p className="mb-4 text-secondary">
						Please connect your Spotify account to view song details
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity bg-accent-primary text-accent-text"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	if (trackHistoryQuery.isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-primary mx-auto mb-4"></div>
					<p className="text-secondary">Loading song history...</p>
				</div>
			</div>
		);
	}

	if (trackHistoryQuery.error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="p-8 rounded-lg max-w-md w-full text-center bg-white shadow-theme-md">
					<h2 className="text-2xl font-bold mb-4 text-error">Error</h2>
					<p className="mb-4 text-secondary">Failed to load song history</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity bg-text-tertiary text-bg-primary"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	const trackHistory = trackHistoryQuery.data || [];
	const track = trackHistory[0]?.track;

	if (!track) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="p-8 rounded-lg max-w-md w-full text-center bg-white shadow-theme-md">
					<h2 className="text-2xl font-bold mb-4 text-secondary">
						No History Found
					</h2>
					<p className="mb-4 text-secondary">
						No listening history found for this song
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity bg-text-tertiary text-bg-primary"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	const albumImage = track.album.images?.[0]?.url;

	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-6">
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity text-accent-primary"
					>
						← Back to Recent Tracks
					</button>
					<ThemeController />
				</div>

				<div className="rounded-lg p-6 mb-6 bg-white shadow-theme-md">
					<div className="flex items-start space-x-6">
						{albumImage && (
							<img
								src={albumImage}
								alt={track.album.name}
								className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
							/>
						)}
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl font-bold mb-2 text-primary">
								{track.name}
							</h1>
							<p className="text-xl mb-2 text-secondary">
								{track.artists.map((artist) => artist.name).join(", ")}
							</p>
							<p className="text-lg mb-4 text-secondary">{track.album.name}</p>
							<div className="flex items-center gap-4">
								<span className="text-sm text-secondary">
									Duration: {Math.floor(track.duration_ms / 60000)}:
									{String(
										Math.floor((track.duration_ms % 60000) / 1000),
									).padStart(2, "0")}
								</span>
								<a
									href={track.external_urls.spotify}
									target="_blank"
									rel="noopener noreferrer"
									className="font-bold py-2 px-4 rounded text-sm transition-opacity hover:opacity-80 bg-accent-primary text-accent"
								>
									Open in Spotify
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="rounded-lg p-6 bg-white shadow-theme-md">
					<h2 className="text-2xl font-bold mb-4 text-primary">
						Recent Listening History
					</h2>
					<p className="mb-6 text-secondary">
						Last {trackHistory.length} time
						{trackHistory.length !== 1 ? "s" : ""} you listened to this song
					</p>

					<div className="space-y-4">
						{trackHistory.map((item: SpotifyRecentTrack, index: number) => (
							<HistoryItem
								key={`${item.played_at}-${index}`}
								item={item}
								index={index}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function HistoryItem({
	item,
	index,
}: {
	item: SpotifyRecentTrack;
	index: number;
}) {
	const playedAt = new Date(item.played_at);
	const now = new Date();
	const diffInMs = now.getTime() - playedAt.getTime();
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInHours / 24);

	let timeAgo = "";
	if (diffInDays > 0) {
		timeAgo = `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
	} else if (diffInHours > 0) {
		timeAgo = `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
	} else {
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		timeAgo = `${Math.max(1, diffInMinutes)} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
	}

	return (
		<div className="flex items-center justify-between p-4 rounded-lg transition-colors hover:opacity-95 bg-white">
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm bg-accent-primary/20 text-accent-primary">
					{index + 1}
				</div>
				<div>
					<p className="font-medium text-primary">
						{playedAt.toLocaleDateString()} at {playedAt.toLocaleTimeString()}
					</p>
					<p className="text-sm text-secondary">{timeAgo}</p>
				</div>
			</div>
		</div>
	);
}
