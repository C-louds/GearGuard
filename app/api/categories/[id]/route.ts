import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function PUT(request, { params }) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.equipmentCategory.update({
      where: { id: parseInt(params.id) },
      data: { name: name.trim() }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await prisma.equipmentCategory.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete category - it is being used by equipment' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}