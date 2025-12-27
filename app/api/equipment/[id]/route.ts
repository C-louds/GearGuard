import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const param = await params;
    const equipmentId = parseInt(param.id);

    if (isNaN(equipmentId)) {
      return NextResponse.json(
        { error: 'Invalid equipment ID' },
        { status: 400 }
      );
    }


    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        category: true,
        department: true,
        assignedEmployee: true,
        defaultTechnician: true,
        maintenanceTeam: true
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const param = await params;
    const equipmentId = parseInt(param.id);

    if (isNaN(equipmentId)) {
      return NextResponse.json(
        { error: 'Invalid equipment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.serialNumber) {
      return NextResponse.json(
        { error: 'Name and serial number are required' },
        { status: 400 }
      );
    }

    // Update equipment in database
    const updatedEquipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: body.name,
        serialNumber: body.serialNumber,
        location: body.location,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiryDate: body.warrantyExpiryDate ? new Date(body.warrantyExpiryDate) : null,
        status: body.status,
        notes: body.notes,
        // Include other updatable fields as needed
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Delete equipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const param = await params;
    const equipmentId = parseInt(param.id);

    if (isNaN(equipmentId)) {
      return NextResponse.json(
        { error: 'Invalid equipment ID' },
        { status: 400 }
      );
    }

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Delete equipment
    await prisma.equipment.delete({
      where: { id: equipmentId }
    });

    return NextResponse.json(
      { message: 'Equipment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
