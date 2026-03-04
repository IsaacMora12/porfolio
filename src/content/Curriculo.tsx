import { Technologies } from '../componets/Technologies';


export const CurriculumComponent = () => {

    return(
      <div className="window-content p-8">
      <header className="mb-12">
        <div className="flex flex-col">
          <div>
            <h1 className="text-2xl font-bold mb-2 glitch" data-text="Isaac Andrés Mora Rodríguez">Isaac Andrés Mora Rodríguez</h1>
            <p className="text-lg mb-2 glitch" data-text="Fullstack Developer | React & TypeScript | Django (Python) | DevOps">Fullstack Developer | React & TypeScript | Django (Python) | DevOps</p>
            <p className="text-sm glitch" data-text="San José, Costa Rica | isaacmora12@gmail.com">San José, Costa Rica |   <a href="mailto:isaacmora12@gmail.com" className="text-[#39ff14] hover:underline text-sm glitch" target="_blank" rel="noopener noreferrer">isaacmora12@gmail.com</a>
             </p>
            <div className="flex gap-4 mt-2">
              <a href="https://portfolio.isaacmora.com" className="text-[#39ff14] hover:underline text-sm glitch" target="_blank" rel="noopener noreferrer">Portfolio</a>
              <span className="text-sm glitch">|</span>
              <a href="https://linkedin.com/in/isaac-mora" className="text-[#39ff14] hover:underline text-sm glitch" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <span className="text-sm glitch">|</span>
              <a href="https://github.com/IsaacMora12" className="text-[#39ff14] hover:underline text-sm glitch" target="_blank" rel="noopener noreferrer">Github</a>
            </div>
            <div className="mt-4">
              <a
                href="/IsaacMora.pdf"
                download="Isaac_Mora_Fullstack_Developer_CV.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors duration-300 text-sm glitch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download CV (PDF)
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-8 glitch" data-text="professional-summary">
        <h2 className="text-xl font-bold mb-4 glitch">Professional Summary</h2>
        <p className="text-sm leading-relaxed glitch">
          Fullstack Developer and dedicated self-learner, specialized in building scalable web applications. 
          Expert at integrating high-quality frontends (React/TS) with robust backend architectures (Django). 
          With knowledge in infrastructure and DevOps, with courses in Docker, Kubernetes and Azure.
        </p>
      </section>

      <section className="mb-8 glitch" data-text="technologies">
        <div className="flex flex-wrap gap-4">
          <Technologies />
        </div>
      </section>


      <section className="mb-8 glitch" data-text="technical-skills">
        <h2 className="text-xl font-bold mb-4 glitch">Technical Skills</h2>
        <div className="space-y-2">
          <p className="text-sm glitch"><span className="font-bold">Frontend:</span> React, TypeScript, TanStack Query, Tailwind CSS, HTML, CSS.</p>
          <p className="text-sm glitch"><span className="font-bold">Backend:</span> Python, Django, Django REST Framework, PostgreSQL.</p>
          <p className="text-sm glitch"><span className="font-bold">Infrastructure & DevOps:</span> Linux (Ubuntu), Docker, Azure, AWS, GitHub Actions, Kamal, CI/CD.</p>
          <p className="text-sm glitch"><span className="font-bold">Languages:</span> Spanish (Native), English (Intermediate).</p>
        </div>
      </section>

      <section className="mb-8 glitch" data-text="education-certifications">
        <h2 className="text-xl font-bold mb-4 glitch">Education & Certifications</h2>
        <ul className="space-y-1">
          <li className="text-sm glitch pl-3">• DevOps Bootcamp with Azure: 12-week intensive training (+30 hours).</li>
          <li className="text-sm glitch pl-3">• Kubernetes Track: Specialized 9-week program.</li>
          <li className="text-sm glitch pl-3">• Professional DevOps Track: 9-week comprehensive learning path.</li>
          <li className="text-sm glitch pl-3">• Professional Docker Course.</li>
          <li className="text-sm glitch pl-3">• GitHub Actions Course.</li>
          <li className="text-sm glitch pl-3">• Other certifications: VS Code & GitHub Copilot, Introduction to DevOps.</li>
        </ul>
      </section>

      <section className="mb-8 glitch" data-text="experience">
        <h2 className="text-xl font-bold mb-4 glitch">Professional Experience</h2>
        <div className="mb-4 glitch">
          <h3 className="text-lg font-bold glitch">Datawave Labs | Full-stack Developer</h3>
          <p className="text-sm glitch mb-2">May 2023 – Present</p>
          <ul className="ml-2 glitch space-y-1">
            <li className="text-sm glitch pl-3">• Developing dynamic web applications using React and Django stacks.</li>
            <li className="text-sm glitch pl-3">• Integration of external APIs.</li>
            <li className="text-sm glitch pl-3">• Design and development of RESTful back-ends using Django.</li>
            <li className="text-sm glitch pl-3">• Data analysis and creation of visualizations.</li>
            <li className="text-sm glitch pl-3">• Development of reusable and scalable front-end components.</li>
            <li className="text-sm glitch pl-3">• Implementing automated workflows and container management to streamline deployments.</li>
            <li className="text-sm glitch pl-3">• Optimizing website loading times for the user.</li>
            <li className="text-sm glitch pl-3">• Optimization of build times and improvement of developer experience.</li>
            <li className="text-sm glitch pl-3">• Creating maintainable and scalable code.</li>
          </ul>
        </div>
      </section>

      <footer className="text-center glitch" data-text="footer">
        <h2 className="text-xl font-bold mb-4 glitch">Contact</h2>
        <a href="mailto:isaacmora12@gmail.com" className="text-sm mb-2 glitch" target="_blank" rel="noopener noreferrer">isaacmora12@gmail.com</a>
        <div className="flex justify-center space-x-4">
          <a href="https://github.com/IsaacMora12" className="text-[#39ff14] hover:text-[#39ff14] transition-colors duration-300 glitch" data-text="github" target="_blank" rel="noopener noreferrer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a href="https://linkedin.com/in/isaac-andrés-mora-rodríguez-aba953232" className="text-[#39ff14] hover:text-[#39ff14] transition-colors duration-300 glitch" data-text="linkedin" target="_blank" rel="noopener noreferrer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.785-1.75-1.75s.784-1.75 1.75-1.75 1.75.785 1.75 1.75-.784 1.75-1.75 1.75 zm13.5 11.268h-3v-5.604c0-1.337-.026-3.062-1.868-3.062-1.868 0-2.154 1.459-2.154 2.965v5.701h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.562 2.839-1.562 3.039 0 3.603 2.001 3.603 4.599v5.596z" />
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
