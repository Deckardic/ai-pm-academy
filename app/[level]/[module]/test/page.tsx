import {
  generateModuleQuizMetadata,
  generateModuleQuizParams,
  ModuleQuizPage,
} from "@/pages/course/module-quiz";

export const generateStaticParams = generateModuleQuizParams;
export const generateMetadata = generateModuleQuizMetadata;
export default ModuleQuizPage;
