import {
  generateTermMetadata,
  generateTermParams,
  GlossaryTermPage,
} from "@/pages/library/glossary-term";

export const generateStaticParams = generateTermParams;
export const generateMetadata = generateTermMetadata;
export default GlossaryTermPage;
