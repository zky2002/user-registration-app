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

  // Registration and Login router
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

    login: publicProcedure
      .input(
        z.object({
          phoneNumber: z.string().regex(/^1[3-9]\d{9}$/, "Invalid phone number"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Check if phone number exists
          const existing = await db.getRegistrationByPhoneNumber(input.phoneNumber);
          if (!existing) {
            throw new Error("Phone number not found");
          }

          return {
            success: true,
            message: "Login successful",
            username: existing.username,
            registrationId: existing.id,
          };
        } catch (error) {
          console.error("[Login] Error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Login failed"
          );
        }
      }),

    // Save face data
    saveFace: publicProcedure
      .input(
        z.object({
          phoneNumber: z.string().regex(/^1[3-9]\d{9}$/),
          username: z.string(),
          boundingBox: z.object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
          }),
          photoUri: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Get registration record
          const registration = await db.getRegistrationByPhoneNumber(input.phoneNumber);
          if (!registration) {
            throw new Error("Registration not found");
          }

          // Save face features (storing bounding box as JSON)
          const faceFeatures = JSON.stringify({
            boundingBox: input.boundingBox,
            timestamp: new Date().toISOString(),
          });

          await db.updateRegistrationFace(registration.id, {
            faceFeatures,
            faceRegistered: true,
          });

          return {
            success: true,
            message: "Face data saved successfully",
            registrationId: registration.id,
          };
        } catch (error) {
          console.error("[SaveFace] Error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Failed to save face data"
          );
        }
      }),

    // Get face data
    getFace: publicProcedure
      .input(
        z.object({
          phoneNumber: z.string().regex(/^1[3-9]\d{9}$/),
        })
      )
      .query(async ({ input }) => {
        try {
          const registration = await db.getRegistrationByPhoneNumber(input.phoneNumber);
          if (!registration) {
            return {
              success: false,
              registered: false,
              boundingBox: null,
            };
          }

          if (!registration.faceRegistered || !registration.faceFeatures) {
            return {
              success: true,
              registered: false,
              boundingBox: null,
            };
          }

          const faceData = JSON.parse(registration.faceFeatures);
          return {
            success: true,
            registered: true,
            boundingBox: faceData.boundingBox,
          };
        } catch (error) {
          console.error("[GetFace] Error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Failed to get face data"
          );
        }
      }),

    // Search user by username
    searchUser: publicProcedure
      .input(
        z.object({
          username: z.string().min(2).max(20),
        })
      )
      .query(async ({ input }) => {
        try {
          const registration = await db.getRegistrationByUsername(input.username);
          if (!registration) {
            return {
              success: false,
              found: false,
              faceRegistered: false,
            };
          }

          return {
            success: true,
            found: true,
            username: registration.username,
            faceRegistered: registration.faceRegistered || false,
          };
        } catch (error) {
          console.error("[SearchUser] Error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Failed to search user"
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
