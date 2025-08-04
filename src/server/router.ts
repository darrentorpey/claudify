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
				console.error("- Error message:", error.message);
				console.error("- Error details:", error);
				console.error(
					"- Access token (first 20 chars):",
					`${input.accessToken.substring(0, 20)}...`,
				);
				throw new Error(`Failed to fetch recent tracks: ${error.message}`);
			}
		}),

	exchangeCodeForToken: publicProcedure
		.input(z.object({ code: z.string() }))
		.mutation(async ({ input }) => {
			try {
				return await spotifyAPI.getAccessToken(input.code);
			} catch (error) {
				console.error("🔥 Error exchanging code for token:", error);
				throw new Error(`Failed to exchange code for token: ${error.message}`);
			}
		}),
});

export type AppRouter = typeof appRouter;
