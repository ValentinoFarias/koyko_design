import React, { useEffect, useState } from 'react';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'Product Design System',
    description: 'A scalable system for a SaaS platform with tokens, components, and documentation.',
    role: 'Lead Designer & Front-end',
  },
  {
    id: 2,
    title: 'Interactive Marketing Site',
    description: 'High-performance landing page with micro-interactions and scroll-driven storytelling.',
    role: 'Creative Developer',
  },
  {
    id: 3,
    title: 'Analytics Dashboard',
    description: 'Responsive data visualization dashboard for cross-platform use.',
    role: 'Front-end Engineer',
  },
];

function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async content loading
    const timeout = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section id="portfolio" className="section section-projects" aria-labelledby="projects-heading">
      <div className="section__inner">
        <header className="section__header">
          <h2 id="projects-heading" className="section__title">
            Featured Work
          </h2>
          <p className="section__lead">A selection of recent projects and collaborations.</p>
        </header>

        {isLoading ? (
          <div className="projects-skeleton" aria-busy="true" aria-live="polite">
            <div className="projects-skeleton__card" />
            <div className="projects-skeleton__card" />
            <div className="projects-skeleton__card" />
          </div>
        ) : (
          <div className="projects-grid" aria-live="polite">
            {projects.map((project) => (
              <article key={project.id} className="project-card">
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__description">{project.description}</p>
                <p className="project-card__meta">{project.role}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
