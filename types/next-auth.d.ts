// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    departmentId?: number;
    departmentName?: string;
    isTechnician?: boolean;
    technicianId?: number;
    maintenanceTeamId?: number;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      departmentId?: number;
      departmentName?: string;
      isTechnician?: boolean;
      technicianId?: number;
      maintenanceTeamId?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    departmentId?: number;
    departmentName?: string;
    isTechnician?: boolean;
    technicianId?: number;
    maintenanceTeamId?: number;
  }
}