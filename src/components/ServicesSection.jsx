import React from 'react';

const SERVICES = [
  {
    id: 1,
    title: 'Product & UI Design',
    description: 'From wireframes to high-fidelity prototypes with a focus on clarity and usability.',
  },
  {
    id: 2,
    title: 'Front-end Development',
    description: 'Accessible, performant interfaces built with modern React, CSS and animation tooling.',
  },
  {
    id: 3,
    title: 'Design Systems',
    description: 'Token-driven systems and component libraries that scale across platforms.',
  },
];

function ServicesSection() {
  return (
    <section id="services" className="section section-services" aria-labelledby="services-heading">
      <div className="section__inner">
        <header className="section__header">
          <h2 id="services-heading" className="section__title">
            Services
          </h2>
          <p className="section__lead">Ways we can collaborate on your next project.</p>
        </header>

        <div className="services-grid">
          {SERVICES.map((service) => (
            <article key={service.id} className="service-card">
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__description">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
