import { LegalPage, legalMetadata } from "@/pages/info/legal";

export const metadata = legalMetadata("politika-konfidencialnosti");

export default function Page() {
  return <LegalPage doc="politika-konfidencialnosti" />;
}
