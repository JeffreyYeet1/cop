import {
  Loader2,
  Github,
  Mail,
  Google,
} from "lucide-react";

export const Icons = {
  spinner: Loader2,
  gitHub: Github,
  google: Google,
  mail: Mail,
} as const;

export const GitHubIcon = Github;
export const GoogleIcon = Google;
export const MailIcon = Mail;
export const SpinnerIcon = Loader2;

export type Icon = keyof typeof Icons; 