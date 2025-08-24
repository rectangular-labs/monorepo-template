import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@jsx-email/all";

export interface WelcomeEmailProps {
  username: string;
  dashboardLink?: string;
  companyName?: string;
  companyLogo?: string;
}

export const WelcomeEmail = ({
  username = "there",
  dashboardLink,
  companyName = "Our App",
  companyLogo,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {companyName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          {companyLogo && (
            <Section style={logoSection}>
              <Img
                src={companyLogo}
                width="40"
                height="40"
                alt={companyName}
                style={logo}
              />
            </Section>
          )}
          <Heading style={h1}>Welcome to {companyName}!</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            Welcome to {companyName}! We're excited to have you on board.
            You're now part of our community and can start exploring all the
            features we have to offer.
          </Text>
          {dashboardLink && (
            <Section style={buttonSection}>
              <Button pX={20} pY={12} style={button} href={dashboardLink}>
                Get started
              </Button>
            </Section>
          )}
          <Text style={text}>
            If you have any questions or need help getting started, don't
            hesitate to reach out to our support team.
          </Text>
          <Text style={text}>
            Thanks for joining us, and welcome aboard!
          </Text>
          <Text style={signature}>
            Best regards,<br />
            The {companyName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoSection = {
  padding: "0 0 20px",
  textAlign: "center" as const,
};

const logo = {
  borderRadius: "8px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const signature = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
};