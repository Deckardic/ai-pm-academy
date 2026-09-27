import { generateLessonMetadata, generateLessonParams, LessonPage } from "@/pages/course/lesson";

export const generateStaticParams = generateLessonParams;
export const generateMetadata = generateLessonMetadata;
export default LessonPage;
