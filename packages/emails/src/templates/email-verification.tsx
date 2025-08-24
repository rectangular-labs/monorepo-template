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

export interface EmailVerificationProps {
  username: string;
  verificationLink: string;
  companyName?: string;
  companyLogo?: string;
}

export const EmailVerificationEmail = ({
  username = "there",
  verificationLink,
  companyName = "Our App",
  companyLogo,
}: EmailVerificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Please verify your email address</Preview>
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
          <Heading style={h1}>Please verify your email</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            Thanks for signing up for {companyName}! To complete your
            registration, please verify your email address by clicking the
            button below:
          </Text>
          <Section style={buttonSection}>
            <Button pX={20} pY={12} style={button} href={verificationLink}>
              Verify email address
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:{" "}
            <Link href={verificationLink} style={link}>
              {verificationLink}
            </Link>
          </Text>
          <Text style={text}>
            This verification link will expire in 24 hours. If you didn't create
            an account with {companyName}, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            Need help? Contact our support team.
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
  backgroundColor: "#3b82f6",
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