'use client';

// CaseStudies — /casestudies route
//
// Navigated to from the portfolio section when a project logo is clicked.
// KoykoStudies holds all the case study content.

import KoykoNavbar from '../components/KoykoNavbar';
import KoykoStudies from '../components/KoykoStudies';
import KoykoFooter from '../components/KoykoFooter';

function CaseStudies() {
  return (
    <div className="koyko-page">
      <KoykoNavbar />
      <KoykoStudies />
      <KoykoFooter />
    </div>
  );
}

export default CaseStudies;
