import { LegalPage, legalMetadata } from "@/pages/info/legal";

export const metadata = legalMetadata("soglasie");

export default function Page() {
  return <LegalPage doc="soglasie" />;
}
