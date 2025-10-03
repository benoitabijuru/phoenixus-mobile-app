import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_KEY!, // Use service role for server-side operations
    );

    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        clerk_id: clerkId,
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ data }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}