import { useEffect, useState } from "react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

type SubmissionRow = {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  total_score: number | null;
  score_segment: string | null;
  selected: boolean;
  q12: string | null;
  q15: string | null;
};

type SubmissionsResponse = {
  rows: SubmissionRow[];
};

function truncate(text: string | null | undefined, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ResponsesPage() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  function loadRows() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (segment) params.set("segment", segment);
    if (selectedFilter) params.set("selected", selectedFilter);

    setLoading(true);

    fetch(`/app/api/submissions?${params.toString()}`)
      .then((response) => response.json())
      .then((json: SubmissionsResponse) => {
        setRows(json.rows || []);
      })
      .catch((error) => {
        console.error("Failed to load submissions:", error);
        setRows([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadRows();
  }, [search, segment, selectedFilter]);

  async function toggleSelection(id: string, selected: boolean) {
    try {
      const response = await fetch("/app/api/selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          selected: !selected,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error(json);
        return;
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, selected: !selected } : row,
        ),
      );
    } catch (error) {
      console.error("Failed to update selection:", error);
    }
  }

  const selectedCount = rows.filter((row) => row.selected).length;

  return (
    <Page title="Réponses du quiz">
      <BlockStack gap="400">
        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h3" variant="headingMd">
              {selectedFilter === "true"
                ? `${selectedCount} sélectionnées`
                : `${selectedCount} sélectionnées dans la vue courante`}
            </Text>
            <Text as="p" tone="subdued">
              Objectif : 100
            </Text>
          </InlineStack>
        </Card>

        <Card>
          <InlineStack gap="300" wrap>
            <div style={{ minWidth: 280 }}>
              <TextField
                label="Recherche"
                labelHidden
                autoComplete="off"
                placeholder="Email, prénom, nom"
                value={search}
                onChange={setSearch}
              />
            </div>

            <div style={{ minWidth: 240 }}>
              <Select
                label="Segment"
                labelHidden
                options={[
                  { label: "Tous les segments", value: "" },
                  { label: "ULTRA HIGH VALUE", value: "ULTRA HIGH VALUE" },
                  { label: "HIGH POTENTIAL", value: "HIGH POTENTIAL" },
                  { label: "MOYEN", value: "MOYEN" },
                  { label: "FAIBLE", value: "FAIBLE" },
                ]}
                value={segment}
                onChange={setSegment}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <Select
                label="Sélection"
                labelHidden
                options={[
                  { label: "Toutes", value: "" },
                  { label: "Sélectionnées", value: "true" },
                ]}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
            </div>
          </InlineStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Candidatures
            </Text>

            {loading ? (
              <Text as="p" tone="subdued">
                Chargement…
              </Text>
            ) : rows.length === 0 ? (
              <Text as="p" tone="subdued">
                Aucune réponse trouvée.
              </Text>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: "1250px",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e1e3e5" }}>
                      <th style={thStyle}>Prénom</th>
                      <th style={thStyle}>Nom</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Score</th>
                      <th style={thStyle}>Segment</th>
                      <th style={thStyle}>Sélection</th>
                      <th style={thStyle}>Action</th>
                      <th style={thStyle}>Q12</th>
                      <th style={thStyle}>Q15</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={`${row.id}-${index}`}
                        style={{ borderBottom: "1px solid #f1f2f3" }}
                      >
                        <td style={tdStyle}>{row.firstname || ""}</td>
                        <td style={tdStyle}>{row.lastname || ""}</td>
                        <td style={tdStyle}>{row.email || ""}</td>
                        <td style={tdStyle}>{row.total_score ?? 0}</td>
                        <td style={tdStyle}>{row.score_segment || ""}</td>
                        <td style={tdStyle}>
                          {row.selected ? (
                            <Badge tone="success">Sélectionnée</Badge>
                          ) : (
                            <Badge>TBD</Badge>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <Button
                            size="micro"
                            onClick={() => toggleSelection(row.id, row.selected)}
                          >
                            {row.selected ? "Retirer" : "Sélectionner"}
                          </Button>
                        </td>
                        <td style={tdStyle} title={row.q12 || ""}>
                          {truncate(row.q12, 140)}
                        </td>
                        <td style={tdStyle} title={row.q15 || ""}>
                          {truncate(row.q15, 140)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "top",
  lineHeight: 1.5,
};