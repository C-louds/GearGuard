import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request){
    const deps = await prisma.department.findMany();
    // console.log("==============Departments===================:"+JSON.stringify(deps));
    return NextResponse.json(deps, {status: 200});
}