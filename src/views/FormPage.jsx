// FormPage — standalone onboarding form page sent to new clients
// Route: /form
// No navbar or footer — this page is shared directly as a link.

'use client';

import KoykoOnboardingForm from '../components/KoykoOnboardingForm';

export default function FormPage() {
  return (
    <div className="koyko-onboarding-page">
      <KoykoOnboardingForm />
    </div>
  );
}
