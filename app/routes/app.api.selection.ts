import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../shopify.server";

export async function action({ request }: { request: Request }) {
  await authenticate.admin(request);

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const id = String(body.id || "").trim();
  const selected = Boolean(body.selected);

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase
    .from("quiz_submissions")
    .update({ selected })
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, id, selected });
}