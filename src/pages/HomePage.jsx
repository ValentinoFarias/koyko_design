import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import ProjectsSection from '../components/ProjectsSection';
import ServicesSection from '../components/ServicesSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

function HomePage() {
  const [theme, setTheme] = useState('light');

  // Initialize theme from localStorage or prefers-color-scheme
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
      return;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  // Update root data attribute when theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 80;
    const rect = element.getBoundingClientRect();
    const offsetTop = rect.top + window.scrollY - headerOffset;

    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Set a descriptive document title for SEO
    document.title = 'Koyko Portfolio – Creative Developer & Designer';
  }, []);

  return (
    <div className={`app app--theme-${theme}`}>
      <Header theme={theme} onToggleTheme={toggleTheme} onNavClick={scrollToSection} />
      <main className="layout-main" aria-label="Main content">
        <Hero
          onPrimaryAction={() => scrollToSection('portfolio')}
          onSecondaryAction={() => scrollToSection('contact')}
        />
        <AboutSection />
        <ProjectsSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
