import { useEffect, useState } from "react";
import {
  BlockStack,
  Card,
  InlineGrid,
  List,
  Page,
  Text,
} from "@shopify/polaris";

type SummaryResponse = {
  total: number;
  avgScore: number;
  segments: {
    ULTRA_HIGH_VALUE: number;
    HIGH_POTENTIAL: number;
    MOYEN: number;
    FAIBLE: number;
  };
  topQ1: { label: string; value: number }[];
  topQ2: { label: string; value: number }[];
  topQ8: { label: string; value: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/app/api/summary")
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      })
      .catch((error) => {
        console.error("Failed to load summary:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Page title="Mood Quiz Analytics">
      <BlockStack gap="500">
        <InlineGrid columns={{ xs: 1, md: 4 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Candidatures
              </Text>
              <Text as="p" variant="heading2xl">
                {loading ? "…" : data?.total ?? 0}
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Score moyen
              </Text>
              <Text as="p" variant="heading2xl">
                {loading ? "…" : data?.avgScore ?? 0}
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Ultra high value
              </Text>
              <Text as="p" variant="heading2xl">
                {loading ? "…" : data?.segments?.ULTRA_HIGH_VALUE ?? 0}
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                High potential
              </Text>
              <Text as="p" variant="heading2xl">
                {loading ? "…" : data?.segments?.HIGH_POTENTIAL ?? 0}
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Répartition des segments
            </Text>
            <Text as="p">
              ULTRA HIGH VALUE: {loading ? "…" : data?.segments?.ULTRA_HIGH_VALUE ?? 0}
            </Text>
            <Text as="p">
              HIGH POTENTIAL: {loading ? "…" : data?.segments?.HIGH_POTENTIAL ?? 0}
            </Text>
            <Text as="p">
              MOYEN: {loading ? "…" : data?.segments?.MOYEN ?? 0}
            </Text>
            <Text as="p">
              FAIBLE: {loading ? "…" : data?.segments?.FAIBLE ?? 0}
            </Text>
          </BlockStack>
        </Card>

        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Top réponses Q1
              </Text>
              <List>
                {(data?.topQ1 ?? []).map((item) => (
                  <List.Item key={item.label}>
                    {item.label} — {item.value}
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Top réponses Q2
              </Text>
              <List>
                {(data?.topQ2 ?? []).map((item) => (
                  <List.Item key={item.label}>
                    {item.label} — {item.value}
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Top réponses Q8
              </Text>
              <List>
                {(data?.topQ8 ?? []).map((item) => (
                  <List.Item key={item.label}>
                    {item.label} — {item.value}
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}