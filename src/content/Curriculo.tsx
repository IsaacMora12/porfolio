import React from 'react';
import { Technologies } from '../componets/Technologies';


export const CurriculumComponent = () => {

    return(
      <div className="window-content p-8">
      <header className="mb-12">
        <div className="flex flex-col">
          <div>
            <h1 className="text-2xl font-bold mb-2 glitch" data-text="Isaac Mora Codex">Isaac Mora's Codex</h1>
            <p className="text-lg mb-2 glitch" data-text="Desarrollador Web Frontend con conocimientos en backend">Frontend Web Developer with knowledge in backend and Devops</p>
            <p className="text-sm glitch" data-text="Creando experiencias web únicas y funcionales">Creating unique and functional web experiences</p>
          </div>
        </div>
      </header>

      <section className="mb-8 glitch" data-text="sobre-mi">
        <h2 className="text-xl font-bold mb-4 glitch">Technologies</h2>
        <div className="flex flex-wrap gap-4">
          <Technologies />
        </div>
      </section>

      <section className="mb-8 glitch" data-text="about-me">
        <h2 className="text-xl font-bold mb-4 glitch">About Me</h2>
        <p className="text-sm leading-relaxed glitch">
          I am a web developer passionate about creating innovative solutions.
          With experience in frontend, backend, and Devops, I enjoy facing challenges
          and learning new technologies to improve my skills.
        </p>
      </section>

      <section className="mb-8 glitch" data-text="experience">
        <h2 className="text-xl font-bold mb-4 glitch">Experience</h2>
        <div className="mb-4 glitch">
          <h3 className="text-lg font-bold glitch">Junior Web Developer</h3>
          <p className="text-sm glitch"> Datawavelabs • 2023 - Present</p>
          <p className="text-sm glitch">Full Stack Developer specialized in developing web applications using React and Django. My responsibilities include:
          </p>
          <ul className="ml-2 glitch">
            <li className="text-sm glitch pl-3">- Development of reusable and scalable front-end components.</li>
            <li className="text-sm glitch pl-3">- Design and development of RESTful back-ends using Django.</li>
            <li className="text-sm glitch pl-3">- Integration of external APIs.</li>
            <li className="text-sm glitch pl-3">- Creation of CI/CD pipelines with GitHub Actions.</li>
            <li className="text-sm glitch pl-3">- Data analysis and creation of visualizations.</li>
          </ul>
        </div>
      </section>

      <footer className="text-center glitch" data-text="footer">
        <h2 className="text-xl font-bold mb-4 glitch">Contact</h2>
        <p className="text-sm mb-2 glitch">Isaacmora12@gmail.com</p>
        <div className="flex justify-center space-x-4">
          <a href="https://github.com/IsaacMora12" className="text-[#39ff14] hover:text-[#39ff14] transition-colors duration-300 glitch" data-text="github">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
    ) 
};
CurriculumComponent.metadata = {
  title: "Curriculum",
  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>

};


export default CurriculumComponent;