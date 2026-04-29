'use client';

// CaseStudies — /casestudies/[id] route
//
// Receives the project id from the dynamic route and passes it down.
// KoykoStudies reads the id to decide which study to show.

import KoykoNavbar from '../components/KoykoNavbar';
import KoykoStudies from '../components/KoykoStudies';
import KoykoFooter from '../components/KoykoFooter';

function CaseStudies({ projectId }) {
  return (
    <div className="koyko-page">
      <KoykoNavbar />
      <KoykoStudies projectId={projectId} />
      <KoykoFooter />
    </div>
  );
}

export default CaseStudies;
