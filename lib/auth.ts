import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials);

          // Find user
          const employee = await prisma.employee.findUnique({
            where: { email },
            include: {
              department: true,
              technician: {
                include: {
                  maintenanceTeam: true,
                },
              },
            },
          });

          if (!employee) {
            throw new Error("Invalid credentials");
          }

          // Check if user is active
          if (!employee.isActive) {
            throw new Error("Account is deactivated");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            employee.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Return user object
          return {
            id: employee.id.toString(),
            name: employee.name,
            email: employee.email,
            role: employee.role,
            departmentId: employee.departmentId,
            departmentName: employee.department?.name,
            isTechnician: !!employee.technician,
            technicianId: employee.technician?.id,
            maintenanceTeamId: employee.technician?.maintenanceTeamId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.departmentName = user.departmentName;
        token.isTechnician = user.isTechnician;
        token.technicianId = user.technicianId;
        token.maintenanceTeamId = user.maintenanceTeamId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as number;
        session.user.departmentName = token.departmentName as string;
        session.user.isTechnician = token.isTechnician as boolean;
        session.user.technicianId = token.technicianId as number;
        session.user.maintenanceTeamId = token.maintenanceTeamId as number;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});