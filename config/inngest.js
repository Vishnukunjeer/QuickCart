import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user"
import Order from "@/models/Order";


export const inngest = new Inngest({
  id: "quickcart-next"
});

//Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction({
  id:"sync-user-from-clerk"
},
{event: "clerk/user.created"},
async({event})=>{
  const { id,first_name, last_name, email_addresses, image_url } = event.data;
  const userData = {
    id:id,
    email: email_addresses[0].email_address,
    name: first_name + " " + last_name,
    imageUrl: image_url,
  };
  await connectDB();
  await User.create(userData)
}
)

//Inngest Function to update user data in the database
export const syncUserUpdation = inngest.createFunction({
  id:"update-user-from-clerk"
},
{event: "clerk/user.updated"},
async({event})=>{
  const { id,first_name, last_name, email_addresses, image_url } = event.data;
  const userData = {
    id:id,
    email: email_addresses[0].email_address,
    name: first_name + " " + last_name,
    imageUrl: image_url,
  };
  await connectDB();
  await User.findOneAndUpdate(id,userData)
})

//Inngest Function to delete user data from the database
export const syncUserDeletion = inngest.createFunction({
  id:"delete-user-from-clerk"
},
{event: "clerk/user.deleted"},
async({event})=>{
  const { id } = event.data;
  await connectDB();
  await User.findOneAndDelete(id)})

//Inngest Function to create user order in database
export const createUserOrder = inngest.createFunction({
  id: "create-user-order",
  batchEvents:{
    maxSize:5,
    timeout:'5s'
  }
},
{event: "order/created"},
async ({events}) => {
  const orders = events.map((event)=>{
    return{
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address,
      date: event.data.date,
    }
  })
  await connectDB();
  await Order.insertMany(orders);

  return { success: true, processed: orders.length };
})
