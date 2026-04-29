import { redirect } from 'next/navigation';
import { CASE_STUDIES } from '../../data/caseStudies';

// /casestudies with no project — redirect to the first study in the list.
// This runs on the server so it happens before the page renders.
export default function Page() {
  redirect(`/casestudies/${CASE_STUDIES[0].id}`);
}
