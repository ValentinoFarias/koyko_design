import { redirect } from 'next/navigation';
import { CASE_STUDIES } from '../../data/caseStudies';

// /casestudies with no project — redirect server-side to the first study.
// Matches the v1 /casestudies behavior.
export default function Page() {
  redirect(`/casestudies/${CASE_STUDIES[0].id}`);
}
