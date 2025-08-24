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

export interface UserInviteEmailProps {
  inviterName: string;
  inviteeEmail: string;
  teamName: string;
  inviteLink: string;
  companyName?: string;
  companyLogo?: string;
}

export const UserInviteEmail = ({
  inviterName,
  inviteeEmail,
  teamName,
  inviteLink,
  companyName = "Our App",
  companyLogo,
}: UserInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName}</Preview>
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
          <Heading style={h1}>You've been invited to {teamName}</Heading>
          <Text style={text}>Hi there,</Text>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{teamName}</strong> on {companyName}.
          </Text>
          <Section style={buttonSection}>
            <Button pX={20} pY={12} style={button} href={inviteLink}>
              Accept invitation
            </Button>
          </Section>
          <Text style={text}>
            This invitation was sent to <strong>{inviteeEmail}</strong>. If you
            were not expecting this invitation, you can ignore this email.
          </Text>
          <Text style={text}>
            If you already have an account with {companyName}, clicking the
            button above will add you to the team. If you don't have an account,
            you'll be able to create one.
          </Text>
          <Text style={footer}>
            This invitation will expire in 7 days.
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

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "20px 0 0",
};