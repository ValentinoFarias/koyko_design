import { redirect } from 'next/navigation';
import { CASE_STUDIES } from '../../data/caseStudies';

// /casestudies-v2 with no project — redirect server-side to the first study.
// Matches the v1 /casestudies behavior.
export default function Page() {
  redirect(`/casestudies-v2/${CASE_STUDIES[0].id}`);
}
