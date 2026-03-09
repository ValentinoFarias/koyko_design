import React from 'react';
import Navbar from '../components/Navbar';

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="container py-5" id="home" style={{ marginTop: '4.5rem' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 text-center"></div>
            <h1>Welcome to the Home Page</h1>
        </div>
      </main>
    </>
  );
}

export default HomePage;
