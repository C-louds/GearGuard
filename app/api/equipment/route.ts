import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const equipmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  serialNumber: z.string().min(2, "Serial Number must be at least 2 characters"),
  categoryId: z.number(),
  departmentId: z.number(),
  maintenanceTeamId: z.number(),
  defaultTechnicianId: z.number().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  purchaseDate: z.string(), 
  warrantyExpiryDate: z.string(),
});

export async function GET(req: Request) {

    const equipments = await prisma.equipment.findMany({
    });  
    console.log(JSON.stringify(equipments));
    return new NextResponse(JSON.stringify(equipments), { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const data = equipmentSchema.parse(body)

    // Create record
    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        purchaseDate: new Date(data.purchaseDate),
        warrantyExpiryDate: new Date(data.warrantyExpiryDate),
      },
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
