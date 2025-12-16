import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Registration router
  registration: router({
    register: publicProcedure
      .input(
        z.object({
          phoneNumber: z.string().regex(/^1[3-9]\d{9}$/, "Invalid phone number"),
          username: z.string().min(2).max(20),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Check if phone number already registered
          const existing = await db.getRegistrationByPhoneNumber(input.phoneNumber);
          if (existing) {
            throw new Error("Phone number already registered");
          }

          // Create registration record
          await db.createRegistration({
            phoneNumber: input.phoneNumber,
            username: input.username,
          });

          return {
            success: true,
            message: "Registration successful",
          };
        } catch (error) {
          console.error("[Registration] Error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Registration failed"
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
