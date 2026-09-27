import {
  AssignmentPage,
  generateAssignmentMetadata,
  generateAssignmentParams,
} from "@/pages/course/assignment";

export const generateStaticParams = generateAssignmentParams;
export const generateMetadata = generateAssignmentMetadata;
export default AssignmentPage;
