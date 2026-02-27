import React, { useState, useRef, useEffect } from 'react';

// Definimos la estructura de cada opción
export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  options: DropdownOption[];
  value: string;
}

// Extendemos con props opcionales para mayor flexibilidad
interface DropdownSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;       // Estilos para el contenedor relative
  buttonClassName?: string; // Estilos extra para el botón principal
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  className = "", 
  buttonClassName = "" 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Encontrar la etiqueta actual para mostrarla en el botón
  const currentOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-black text-oldgreen text-xs p-2 rounded hover:bg-oldgreen/25 transition-colors ${
          isOpen ? 'ring-2 ring-oldgreen bg-oldgreen/25' : ''
        } ${buttonClassName}`}
      >
        {currentOption ? currentOption.label : 'Select...'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-black/5 backdrop-blur-sm rounded z-50 min-w-full shadow-lg border border-oldgreen/10 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="block w-full px-3 py-2 text-xs text-left hover:bg-oldgreen/25 text-oldgreen transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;