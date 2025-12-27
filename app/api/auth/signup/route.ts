import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// make sure right details are there
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentId: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zod validaton
    const validatedData = signupSchema.parse(body);

    const existingUser = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Add to the db
    const employee = await prisma.employee.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        departmentId: validatedData.departmentId || null,
        role: "USER", // Default role: user Implement later for that... role assignment
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: employee,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}