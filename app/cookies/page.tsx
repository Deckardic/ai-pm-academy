import { LegalPage, legalMetadata } from "@/pages/info/legal";

export const metadata = legalMetadata("cookies");

export default function Page() {
  return <LegalPage doc="cookies" />;
}
