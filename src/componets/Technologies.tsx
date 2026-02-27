import {  AiOutlineDocker, AiOutlinePython,  } from 'react-icons/ai';
import { PiFileCssThin, PiFileHtmlThin } from 'react-icons/pi';
import { RiJavascriptLine, RiReactjsFill, RiTailwindCssLine } from 'react-icons/ri';
import { TbBrandTypescript } from 'react-icons/tb';
import { useState } from 'react';
import  DropdownSelect, { type DropdownOption } from './DropDown';



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
    name: "Tailwind CSS",
    logo : <RiTailwindCssLine stroke='#37ff14' size={32}/>
  },
  {
    name: "Java Script",
    logo: <RiJavascriptLine stroke='#37ff14' size={32}/>
  },
  {
    name: "Type Script",
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
 const [viewMode, setViewMode] = useState<string>('both');
 const options: DropdownOption[] = [
    { label: 'Logos', value: 'logo' },
    { label: 'Names', value: 'name' },
    { label: 'Both', value: 'both' },
  ];
  return (
    <div className="flex flex-col gap-4">
      
      <div className="flex  items-center mb-4">
         <h2 className="text-xl font-bold glitch mr-5">Technologies</h2>
  <DropdownSelect 
        options={options}
        value={viewMode}
        onChange={(val) => setViewMode(val)}
      />
      </div>
      <div className="flex flex-wrap gap-4 ">
        {technologies.map((tech) => (
          <div key={tech.name} className={`hologram-levitate p-2 relative ${ viewMode === 'both' ? 'h-20 w-15' : ''}  `}>
            <div className="scan-lines"></div>
            <div className="interference"></div>
            <div className="glow"></div>
            <div className="relative z-10 flex flex-col items-center gap-1">
              {(viewMode === 'logo' || viewMode === 'both') && tech.logo}
              {(viewMode === 'name' || viewMode === 'both') && (
                <span className="text-xs text-oldgreen text-center">{tech.name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
