// KoykoProcess — view for the /process route
// Standalone page — no navbar or footer (shared directly with prospective clients).

'use client';

import KoykoProcessPage from '../components/KoykoProcessPage';

export default function KoykoProcess() {
  return (
    <div className="koyko-process-page">
      <KoykoProcessPage />
    </div>
  );
}
