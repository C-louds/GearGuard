// src/app/api/maintenance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest,{ params }: { params: { id: string } }): Promise<Response> {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const param = await params;
    const requestId = parseInt(param.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            location: true,
          },
        },
        equipmentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        maintenanceTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            employee: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const param = await params;
    const requestId = parseInt(param.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request type requires scheduled date for PREVENTIVE
    if (body.requestType === 'PREVENTIVE' && !body.scheduledDate) {
      return NextResponse.json(
        { error: "Scheduled date is required for preventive maintenance" },
        { status: 400 }
      );
    }

    // Validate completed requests have duration
    if (body.stage === 'REPAIRED' && !body.durationHours) {
      return NextResponse.json(
        { error: "Duration is required for completed requests" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      subject: body.subject,
      description: body.description,
      requestType: body.requestType,
      stage: body.stage,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      completedDate: body.completedDate ? new Date(body.completedDate) : null,
      durationHours: body.durationHours ? parseFloat(body.durationHours) : null,
    };

    // If assignedToId is provided, update it
    if (body.assignedToId !== undefined) {
      updateData.assignedToId = body.assignedToId ? parseInt(body.assignedToId) : null;
    }

    // Auto-set completedDate if stage changed to REPAIRED
    if (body.stage === 'REPAIRED' && !body.completedDate) {
      updateData.completedDate = new Date();
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            location: true,
          },
        },
        equipmentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        maintenanceTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            employee: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

}

// DELETE - Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can delete requests
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete requests" },
        { status: 403 }
      );
    }

    const param = await params;
    const requestId = parseInt(param.id);;

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    await prisma.maintenanceRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}