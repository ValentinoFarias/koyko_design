// Dynamic route: /casestudies-v2/kumo-ramen, /casestudies-v2/nerdecks, etc.
import CaseStudiesV2 from '../../../views/CaseStudiesV2';

export default function Page({ params }) {
  return <CaseStudiesV2 projectId={params.id} />;
}
