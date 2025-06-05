import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import { getAuth, User } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {

    const {userId} = getAuth(request);
    const{address,items} = await request.json();

    if(!address || items.length === 0) {
      return NextResponse.json({success:false,message: "Invalid data"});
    }

    //calculate amount using items
    const amount = await items.reduce(async(acc,items) => {
      const product = await Product.findById(items.product);
      return acc + product.price * items.quantity;
    }, 0);

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount:amount + Math.floor(amount * 0.18), //adding 18% GST
        
        date: Date.now(),
      },
    });
    
    //clear user cart

    const user = await  User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order Placed" });
   
  } catch (error) { 
    console.log(error)
    return NextResponse.json({ success: false, message: error.message });
  }
}
