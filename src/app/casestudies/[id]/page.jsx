// Dynamic route: /casestudies/kumo-ramen, /casestudies/nerdecks, etc.
// Next.js passes the URL segment as params.id — we forward it to the view.
import CaseStudies from '../../../views/CaseStudies';

export default function Page({ params }) {
  return <CaseStudies projectId={params.id} />;
}
