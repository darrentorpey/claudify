import { useNavigate, useParams } from "@tanstack/react-router";
import { trpc } from "../lib/trpc-client";
import type { SpotifyRecentTrack } from "../lib/spotify";

export default function SongDetailComponent() {
	const navigate = useNavigate();
	const { trackId } = useParams({ from: "/song/$trackId" });
	
	const accessToken = typeof window !== "undefined"
		? localStorage.getItem("spotify_access_token")
		: null;

	const trackHistoryQuery = trpc.getTrackHistory.useQuery(
		{ accessToken: accessToken!, trackId },
		{ enabled: !!accessToken && !!trackId }
	);

	if (!accessToken) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
					<h2 className="text-2xl font-bold mb-4 text-red-600">Access Required</h2>
					<p className="text-gray-600 mb-4">
						Please connect your Spotify account to view song details
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	if (trackHistoryQuery.isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading song history...</p>
				</div>
			</div>
		);
	}

	if (trackHistoryQuery.error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
					<h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
					<p className="text-gray-600 mb-4">
						Failed to load song history
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
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
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
					<h2 className="text-2xl font-bold mb-4 text-gray-600">No History Found</h2>
					<p className="text-gray-600 mb-4">
						No listening history found for this song
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/" })}
						className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	const albumImage = track.album.images?.[0]?.url;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<button
					type="button"
					onClick={() => navigate({ to: "/" })}
					className="mb-6 text-green-600 hover:text-green-800 font-semibold flex items-center gap-2"
				>
					← Back to Recent Tracks
				</button>

				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex items-start space-x-6">
						{albumImage && (
							<img
								src={albumImage}
								alt={track.album.name}
								className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
							/>
						)}
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl font-bold mb-2 text-gray-900">
								{track.name}
							</h1>
							<p className="text-xl text-gray-600 mb-2">
								{track.artists.map((artist) => artist.name).join(", ")}
							</p>
							<p className="text-lg text-gray-500 mb-4">
								{track.album.name}
							</p>
							<div className="flex items-center gap-4">
								<span className="text-sm text-gray-500">
									Duration: {Math.floor(track.duration_ms / 60000)}:
									{String(
										Math.floor((track.duration_ms % 60000) / 1000),
									).padStart(2, "0")}
								</span>
								<a
									href={track.external_urls.spotify}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
								>
									Open in Spotify
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-bold mb-4 text-gray-900">
						Recent Listening History
					</h2>
					<p className="text-gray-600 mb-6">
						Last {trackHistory.length} time{trackHistory.length !== 1 ? 's' : ''} you listened to this song
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

function HistoryItem({ item, index }: { item: SpotifyRecentTrack; index: number }) {
	const playedAt = new Date(item.played_at);
	const now = new Date();
	const diffInMs = now.getTime() - playedAt.getTime();
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInHours / 24);
	
	let timeAgo = "";
	if (diffInDays > 0) {
		timeAgo = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
	} else if (diffInHours > 0) {
		timeAgo = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
	} else {
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		timeAgo = `${Math.max(1, diffInMinutes)} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
	}

	return (
		<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
			<div className="flex items-center space-x-4">
				<div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
					{index + 1}
				</div>
				<div>
					<p className="font-medium text-gray-900">
						{playedAt.toLocaleDateString()} at {playedAt.toLocaleTimeString()}
					</p>
					<p className="text-sm text-gray-600">{timeAgo}</p>
				</div>
			</div>
		</div>
	);
}