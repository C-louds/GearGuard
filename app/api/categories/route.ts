import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request, { params }) {
  try {
    if (params?.id) {
      const category = await prisma.equipmentCategory.findUnique({
        where: { id: parseInt(params.id) }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    const categories = await prisma.equipmentCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.equipmentCategory.create({
      data: { name: name.trim() }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
