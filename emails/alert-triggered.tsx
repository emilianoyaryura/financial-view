import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AlertTriggeredEmailProps {
  ticker: string;
  condition: "above" | "below";
  targetPrice: number;
  currentPrice: number;
  currency: string;
}

export function AlertTriggeredEmail({
  ticker = "AAPL",
  condition = "above",
  targetPrice = 200,
  currentPrice = 205.5,
  currency = "USD",
}: AlertTriggeredEmailProps) {
  const formattedTarget = `$${targetPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

  const formattedCurrent = `$${currentPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

  return (
    <Html>
      <Head />
      <Preview>
        {ticker} is now {condition} {formattedTarget}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Price Alert Triggered</Heading>
          <Hr style={hr} />

          <Section style={section}>
            <Text style={tickerText}>{ticker}</Text>
            <Text style={conditionText}>
              Price went{" "}
              <span
                style={{
                  color: condition === "above" ? "#22c55e" : "#ef4444",
                  fontWeight: 600,
                }}
              >
                {condition}
              </span>{" "}
              your target
            </Text>
          </Section>

          <Section style={priceSection}>
            <table style={priceTable} cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={priceLabel}>Current price</td>
                  <td style={priceValue}>{formattedCurrent}</td>
                </tr>
                <tr>
                  <td style={priceLabel}>Target price</td>
                  <td style={priceValue}>{formattedTarget}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            StockAR — Portfolio tracking for Argentine investors
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AlertTriggeredEmail;

const body: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: "#141414",
  border: "1px solid #262626",
  borderRadius: "12px",
  margin: "40px auto",
  padding: "32px",
  maxWidth: "420px",
};

const heading: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "18px",
  fontWeight: 600,
  margin: "0 0 16px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#262626",
  margin: "20px 0",
};

const section: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "8px 0",
};

const tickerText: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "28px",
  fontWeight: 700,
  fontFamily: "monospace",
  margin: "0 0 4px 0",
};

const conditionText: React.CSSProperties = {
  color: "#a3a3a3",
  fontSize: "14px",
  margin: "0",
};

const priceSection: React.CSSProperties = {
  padding: "12px 0",
};

const priceTable: React.CSSProperties = {
  width: "100%",
};

const priceLabel: React.CSSProperties = {
  color: "#a3a3a3",
  fontSize: "13px",
  padding: "6px 0",
};

const priceValue: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "14px",
  fontFamily: "monospace",
  fontWeight: 500,
  textAlign: "right" as const,
  padding: "6px 0",
};

const footer: React.CSSProperties = {
  color: "#525252",
  fontSize: "11px",
  textAlign: "center" as const,
  margin: 0,
};
