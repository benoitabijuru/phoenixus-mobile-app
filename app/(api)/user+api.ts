// app/(api)/user+api.ts
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, firstName, lastName, email, clerkId } = body;

    // Insert user with clerk_id
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          clerk_id: clerkId,
          username: username,
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Error creating user:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}