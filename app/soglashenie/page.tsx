import { LegalPage, legalMetadata } from "@/pages/info/legal";

export const metadata = legalMetadata("soglashenie");

export default function Page() {
  return <LegalPage doc="soglashenie" />;
}
