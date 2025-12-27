import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request){
    const employees = await prisma.employee.findMany();
    // console.log("==============Employees===================:"+JSON.stringify(employees));
    return NextResponse.json(employees, {status: 200});
}