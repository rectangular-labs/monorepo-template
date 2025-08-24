import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@jsx-email/all";

export interface OtpEmailProps {
  username: string;
  otp: string;
  companyName?: string;
  companyLogo?: string;
}

export const OtpEmail = ({
  username = "there",
  otp,
  companyName = "Our App",
  companyLogo,
}: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {otp}</Preview>
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
          <Heading style={h1}>Your verification code</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            Use the following verification code to complete your sign-in:
          </Text>
          <Section style={codeSection}>
            <Text style={codeText}>{otp}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 10 minutes. If you didn't request this
            code, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            Sent by {companyName}
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

const codeSection = {
  background: "#f4f4f4",
  border: "1px solid #eee",
  borderRadius: "8px",
  margin: "32px 0",
  padding: "24px",
  textAlign: "center" as const,
};

const codeText = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
};