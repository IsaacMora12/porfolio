import {  AiOutlineDocker, AiOutlinePython,  } from 'react-icons/ai';
import { PiFileCssThin, PiFileHtmlThin } from 'react-icons/pi';
import { RiJavascriptLine, RiReactjsFill, RiTailwindCssLine } from 'react-icons/ri';
import { TbBrandTypescript } from 'react-icons/tb';


const technologies = [
  {
    name: "Python",
    logo: <AiOutlinePython color='#37ff14 ' size={32}/>
  },
  {
    name: "HTML",
    logo: <PiFileHtmlThin  stroke='#37ff14' size={32}/>
  },
  {
    name: "CSS",
    logo: <PiFileCssThin  stroke='#37ff14' size={32}/>
  },
  {
    name: "TailwindCSS",
    logo : <RiTailwindCssLine stroke='#37ff14' size={32}/>
  },
  {
    name: "JavaScript",
    logo: <RiJavascriptLine stroke='#37ff14' size={32}/>
  },
  {
    name: "TypeScript",
    logo: <TbBrandTypescript stroke='#37ff14' size={32}/>

  },
  {
    name: "React",
    logo: <RiReactjsFill stroke='#37ff14' size={32}/>
  },
  {
    name: "Docker",
    logo: <AiOutlineDocker stroke='#37ff14' size={32}/>
  }
];

export const Technologies = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {technologies.map((tech) => (
        <div key={tech.name} className="hologram-levitate p-2 relative">
          <div className="scan-lines"></div>
          <div className="interference"></div>
          <div className="glow"></div>
          <div className="relative z-10">
            {tech.logo}
          </div>
        </div>
      ))}
    </div>
  );
};
