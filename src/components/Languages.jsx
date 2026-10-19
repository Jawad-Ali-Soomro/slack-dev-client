import {
  FaJs,
  FaReact,
  FaPython,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
} from "react-icons/fa";

import { SiTypescript, SiMongodb, SiCplusplus } from "react-icons/si";

const icons = {
  JavaScript: FaJs,
  TypeScript: SiTypescript,
  Python: FaPython,
  HTML: FaHtml5,
  CSS: FaCss3Alt,
  React: FaReact,
  "Node.js": FaNodeJs,
  MongoDB: SiMongodb,
  "C++": SiCplusplus,
};

const LanguageIcon = ({ language, className = "text-sm" }) => {
  const Icon = icons[language];

  if (!Icon) return null;

  return <Icon className={`${className} icon`} />;
};

export default LanguageIcon;
