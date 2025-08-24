import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@jsx-email/all";

export interface MagicLinkEmailProps {
  username: string;
  magicLink: string;
  companyName?: string;
  companyLogo?: string;
}

export const MagicLinkEmail = ({
  username = "there",
  magicLink,
  companyName = "Our App",
  companyLogo,
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your magic link to sign in</Preview>
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
          <Heading style={h1}>Sign in to {companyName}</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            Click the link below to sign in to your account. This link will
            expire in 10 minutes.
          </Text>
          <Section style={buttonSection}>
            <Button pX={20} pY={12} style={button} href={magicLink}>
              Sign in
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:{" "}
            <Link href={magicLink} style={link}>
              {magicLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you didn't request this email, you can safely ignore it.
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
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const link = {
  color: "#067df7",
  textDecoration: "underline",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
};