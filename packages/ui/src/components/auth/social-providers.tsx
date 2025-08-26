import {
  AppleIcon,
  DiscordIcon,
  DropboxIcon,
  FacebookIcon,
  GitHubIcon,
  GitLabIcon,
  GoogleIcon,
  HuggingFaceIcon,
  KickIcon,
  LinearIcon,
  LinkedInIcon,
  MicrosoftIcon,
  NotionIcon,
  RedditIcon,
  RobloxIcon,
  SlackIcon,
  SpotifyIcon,
  TikTokIcon,
  TwitchIcon,
  VKIcon,
  XIcon,
  ZoomIcon,
} from "../icon";

export const socialProviders: SocialProvider[] = [
  {
    provider: "apple",
    name: "Apple",
    icon: AppleIcon,
    method: "social",
  },
  {
    provider: "discord",
    name: "Discord",
    icon: DiscordIcon,
    method: "social",
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    icon: DropboxIcon,
    method: "social",
  },
  {
    provider: "facebook",
    name: "Facebook",
    icon: FacebookIcon,
    method: "social",
  },
  {
    provider: "github",
    name: "GitHub",
    icon: GitHubIcon,
    method: "social",
  },
  {
    provider: "gitlab",
    name: "GitLab",
    icon: GitLabIcon,
    method: "social",
  },
  {
    provider: "google",
    name: "Google",
    icon: GoogleIcon,
    method: "social",
  },
  {
    provider: "huggingface",
    name: "Hugging Face",
    icon: HuggingFaceIcon,
    method: "social",
  },
  {
    provider: "kick",
    name: "Kick",
    icon: KickIcon,
    method: "social",
  },
  {
    provider: "linear",
    name: "Linear",
    icon: LinearIcon,
    method: "social",
  },
  {
    provider: "linkedin",
    name: "LinkedIn",
    icon: LinkedInIcon,
    method: "social",
  },
  {
    provider: "microsoft",
    name: "Microsoft",
    icon: MicrosoftIcon,
    method: "social",
  },
  {
    provider: "notion",
    name: "Notion",
    icon: NotionIcon,
    method: "social",
  },
  {
    provider: "reddit",
    name: "Reddit",
    icon: RedditIcon,
    method: "social",
  },
  {
    provider: "roblox",
    name: "Roblox",
    icon: RobloxIcon,
    method: "social",
  },
  {
    provider: "slack",
    name: "Slack",
    icon: SlackIcon,
    method: "social",
  },
  {
    provider: "spotify",
    name: "Spotify",
    icon: SpotifyIcon,
    method: "social",
  },
  {
    provider: "tiktok",
    name: "TikTok",
    icon: TikTokIcon,
    method: "social",
  },
  {
    provider: "twitch",
    name: "Twitch",
    icon: TwitchIcon,
    method: "social",
  },
  {
    provider: "vk",
    name: "VK",
    icon: VKIcon,
    method: "social",
  },
  {
    provider: "twitter",
    name: "X",
    icon: XIcon,
    method: "social",
  },
  {
    provider: "zoom",
    name: "Zoom",
    icon: ZoomIcon,
    method: "social",
  },
];

export type SocialProvider = {
  provider: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  method: "social" | "generic";
};
