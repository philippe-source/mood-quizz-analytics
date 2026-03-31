import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../shopify.server";

type SubmissionSummaryRow = {
  total_score: number | null;
  score_segment: string | null;
  q1: string | null;
  q2: string | null;
  q8: string | null;
  selected: boolean | null;
  submitted_at: string;
};

type TopItem = {
  label: string;
  value: number;
};

function countBy(rows: SubmissionSummaryRow[], key: "q1" | "q2" | "q8"): TopItem[] {
  const map: Record<string, number> = {};

  rows.forEach((row) => {
    const value = row[key];
    if (!value) return;
    map[value] = (map[value] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));
}

export async function loader({ request }: { request: Request }) {
  await authenticate.admin(request);

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("quiz_submissions")
    .select("total_score, score_segment, q1, q2, q8, selected, submitted_at")
    .eq("campaign_slug", "cercle-100-avril");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows: SubmissionSummaryRow[] = data ?? [];
  const total = rows.length;

  const avgScore =
    total > 0
      ? Math.round(
          rows.reduce((sum, row) => sum + (row.total_score || 0), 0) / total,
        )
      : 0;

  const selectedCount = rows.filter((row) => row.selected === true).length;

  const segments = {
    ULTRA_HIGH_VALUE: 0,
    HIGH_POTENTIAL: 0,
    MOYEN: 0,
    FAIBLE: 0,
  };

  rows.forEach((row) => {
    const segment = row.score_segment;
    if (segment === "ULTRA HIGH VALUE") segments.ULTRA_HIGH_VALUE += 1;
    else if (segment === "HIGH POTENTIAL") segments.HIGH_POTENTIAL += 1;
    else if (segment === "MOYEN") segments.MOYEN += 1;
    else segments.FAIBLE += 1;
  });

  return Response.json({
    total,
    avgScore,
    selectedCount,
    remainingTo100: Math.max(100 - selectedCount, 0),
    segments,
    topQ1: countBy(rows, "q1"),
    topQ2: countBy(rows, "q2"),
    topQ8: countBy(rows, "q8"),
  });
}