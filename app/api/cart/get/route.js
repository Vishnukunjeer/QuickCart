import { connectDB } from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/user";

export async function GET(request) {
    try {
        // Simulate fetching cart data
        const { userId } = getAuth(request);

        await connectDB();
        const user = await User.findOne({ id: userId });
        const {cartItems} = user;

        return NextResponse.json({ success: true, cartItems});
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}