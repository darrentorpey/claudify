import { z } from "zod";
import { spotifyAPI } from "../lib/spotify";
import { publicProcedure, router } from "../lib/trpc";

export const appRouter = router({
	getAuthUrl: publicProcedure.query(() => {
		return spotifyAPI.getAuthURL();
	}),

	getRecentTracks: publicProcedure
		.input(z.object({ accessToken: z.string() }))
		.query(async ({ input }) => {
			try {
				console.log(
					"🎵 Fetching recent tracks with token:",
					`${input.accessToken.substring(0, 20)}...`,
				);
				return await spotifyAPI.getRecentTracks(input.accessToken);
			} catch (error) {
				console.error("🔥 Error fetching recent tracks:");
				console.error("- Error message:", (error as Error).message);
				console.error("- Error details:", error);
				console.error(
					"- Access token (first 20 chars):",
					`${input.accessToken.substring(0, 20)}...`,
				);
				throw new Error(
					`Failed to fetch recent tracks: ${(error as Error).message}`,
				);
			}
		}),

	exchangeCodeForToken: publicProcedure
		.input(z.object({ code: z.string() }))
		.mutation(async ({ input }) => {
			try {
				return await spotifyAPI.getAccessToken(input.code);
			} catch (error) {
				console.error("🔥 Error exchanging code for token:", error);
				throw new Error(
					`Failed to exchange code for token: ${(error as Error).message}`,
				);
			}
		}),

	refreshToken: publicProcedure
		.input(z.object({ refreshToken: z.string() }))
		.mutation(async ({ input }) => {
			try {
				return await spotifyAPI.refreshAccessToken(input.refreshToken);
			} catch (error) {
				console.error("🔥 Error refreshing token:", error);
				throw new Error(`Failed to refresh token: ${(error as Error).message}`);
			}
		}),

	getTrackHistory: publicProcedure
		.input(
			z.object({
				accessToken: z.string(),
				trackId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			try {
				console.log(
					"🎵 Fetching track history for:",
					input.trackId,
					"with token:",
					`${input.accessToken.substring(0, 20)}...`,
				);
				return await spotifyAPI.getTrackHistory(
					input.accessToken,
					input.trackId,
				);
			} catch (error) {
				console.error("🔥 Error fetching track history:");
				console.error("- Error message:", (error as Error).message);
				console.error("- Error details:", error);
				throw new Error(
					`Failed to fetch track history: ${(error as Error).message}`,
				);
			}
		}),
});

export type AppRouter = typeof appRouter;
