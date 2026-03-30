import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../shopify.server";

type ExportRow = {
  submitted_at: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  total_score: number | null;
  score_segment: string | null;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
  q6: string | null;
  q7: string | null;
  q8: string | null;
  q9: string | null;
  q10: string | null;
  q11: string | null;
  q12: string | null;
  q13: string | null;
  q14: string | null;
  q15: string | null;
};

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

export async function loader({ request }: { request: Request }) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "all";

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("quiz_submissions")
    .select(`
      submitted_at,
      firstname,
      lastname,
      email,
      phone,
      total_score,
      score_segment,
      q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15
    `)
    .eq("campaign_slug", "cercle-100-avril")
    .order("total_score", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  let rows: ExportRow[] = data ?? [];

  if (mode === "top300") {
    rows = rows.slice(0, 300);
  } else if (mode === "ultra") {
    rows = rows.filter((row) => row.score_segment === "ULTRA HIGH VALUE");
  } else if (mode === "high") {
    rows = rows.filter((row) => row.score_segment === "HIGH POTENTIAL");
  }

  const headers = [
    "submitted_at",
    "firstname",
    "lastname",
    "email",
    "phone",
    "total_score",
    "score_segment",
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
    "q11",
    "q12",
    "q13",
    "q14",
    "q15",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => csvEscape(row[key as keyof ExportRow]))
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quiz-${mode}.csv"`,
    },
  });
}