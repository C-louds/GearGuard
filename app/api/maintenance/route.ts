import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export async function GET(req: Request) {

    const maintanenceRequets = await prisma.maintenanceRequest.findMany({
    });  
    console.log(JSON.stringify(maintanenceRequets));
    return new NextResponse(JSON.stringify(maintanenceRequets), { status: 200 });
}

export async function POST(req: Request) {
    return new Response("I'll add later maybe ");
}



export async function PUT(req: Request) {
    return new Response("I'll add later maybe ");
}

export async function DELETE(req: Request) {
    return new Response("I'll add later maybe ");

}