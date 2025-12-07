import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { node, mq135, mq2 } = body;

        // Validate required fields
        if (node === undefined || mq135 === undefined || mq2 === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: node, mq135, mq2" },
                { status: 400 }
            );
        }

        // Validate and parse numeric values
        const mq135Value = typeof mq135 === "number" ? mq135 : parseInt(String(mq135), 10);
        const mq2Value = typeof mq2 === "number" ? mq2 : parseInt(String(mq2), 10);

        if (isNaN(mq135Value) || isNaN(mq2Value)) {
            return NextResponse.json(
                { error: "mq135 and mq2 must be valid numbers" },
                { status: 400 }
            );
        }

        // Map node number to SENSOR_TYPE enum
        const sensorTypeMap: Record<number, "NODE1" | "NODE2" | "NODE3"> = {
            1: "NODE1",
            2: "NODE2",
            3: "NODE3",
        };

        const nodeNumber = typeof node === "number" ? node : parseInt(String(node), 10);
        const sensorType = sensorTypeMap[nodeNumber];
        if (!sensorType) {
            return NextResponse.json(
                { error: "Invalid node value. Must be 1, 2, or 3" },
                { status: 400 }
            );
        }

        // Log the data being sent to Prisma for debugging
        const sensorData = {
            type: sensorType,
            mq135: mq135Value,
            mq2: mq2Value,
            r1: 0,
            r2: 0,
        };
        console.log("Creating sensor with data:", JSON.stringify(sensorData, null, 2));

        // Create sensor record using Prisma
        const sensor = await prisma.sensor.create({
            data: sensorData,
        });

        return NextResponse.json(
            { message: "Status updated successfully", sensor },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error creating sensor:", error);
        console.error("Error code:", error.code);
        console.error("Error meta:", JSON.stringify(error.meta, null, 2));
        console.error("Full error:", JSON.stringify(error, null, 2));
        
        // Provide more detailed error information
        if (error.code === "P2011") {
            return NextResponse.json(
                { 
                    error: "Database constraint violation. The database schema may not match Prisma schema. Please run migrations.",
                    details: error.meta?.target || "Unknown field",
                    hint: "Run: npx prisma migrate dev"
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message, code: error.code },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const node = searchParams.get("node");

        // Build where clause
        const where: any = {};
        if (node) {
            const sensorTypeMap: Record<string, "NODE1" | "NODE2" | "NODE3"> = {
                "1": "NODE1",
                "2": "NODE2",
                "3": "NODE3",
            };
            const sensorType = sensorTypeMap[node];
            if (sensorType) {
                where.type = sensorType;
            }
        }

        // Fetch sensor data using Prisma
        const sensors = await prisma.sensor.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        });

        return NextResponse.json({ sensors }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}