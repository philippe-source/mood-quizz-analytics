import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../shopify.server";

type SubmissionRow = {
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  total_score: number | null;
  score_segment: string | null;
  q12: string | null;
  q15: string | null;
  submitted_at: string;
};

export async function loader({ request }: { request: Request }) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const segment = url.searchParams.get("segment")?.trim() || "";

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let query = supabase
    .from("quiz_submissions")
    .select("firstname, lastname, email, total_score, score_segment, q12, q15, submitted_at")
    .eq("campaign_slug", "cercle-100-avril")
    .order("submitted_at", { ascending: false });

  if (segment) {
    query = query.eq("score_segment", segment);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let rows: SubmissionRow[] = data ?? [];

  if (search) {
    rows = rows.filter((row) => {
      return (
        row.email?.toLowerCase().includes(search) ||
        row.firstname?.toLowerCase().includes(search) ||
        row.lastname?.toLowerCase().includes(search)
      );
    });
  }

  return Response.json({ rows });
}