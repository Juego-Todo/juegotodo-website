export type OrgMember = {
  role: string;
  name: string;
};

export type OrgSubsection = {
  title: string;
  members: OrgMember[];
};

export type OrgSection = {
  id: string;
  title: string;
  accent: string;
  members?: OrgMember[];
  subsections?: OrgSubsection[];
};

export const organizationalStructureTitle = "JTGC Organizational Structure";

export const organizationalStructureIntro =
  "The Juego Todo Grand Council (JTGC) governs league operations, athlete safety, regional command, arena standards, and the platform's global expansion.";

export const orgSections: OrgSection[] = [
  {
    id: "supreme-grand-council",
    title: "Supreme Grand Councils",
    accent: "from-[#FF1010] via-[#990000] to-black",
    members: [
      { role: "Founder", name: "Ferdinand Munsayac" },
      { role: "Co-Founder", name: "Rommel Villanueva" },
      { role: "President", name: "Raysaldo Biagtan" },
      { role: "Vice President", name: "Rene Casino" },
      { role: "Chief Administrative Officer", name: "Perla Mae Tagacay" },
      { role: "Chief of Combat Operations & Secretary General", name: "Rodrigo Celones Jr." },
    ],
  },
  {
    id: "grand-council-of-elders",
    title: "Grand Council of Elders",
    accent: "from-yellow-700 via-red-950 to-black",
    members: [
      { role: "Grand Master", name: "GM Rene Casino" },
      { role: "Grand Master", name: "GM Ronaldo Baxafra" },
      { role: "Grand Master", name: "GM Noel Nada" },
      { role: "Senior Master", name: "Senior Master Jhun Tolleno" },
      { role: "Master", name: "Master Antonio Cerillo" },
      { role: "Maestra", name: "Maestra Jemn Baxafra" },
      { role: "Master", name: "Master Red Dilla (UI)" },
    ],
  },
  {
    id: "military-consultants",
    title: "JT Military Consultants",
    accent: "from-zinc-800 via-red-950 to-black",
    members: [
      { role: "Consultant", name: "Ferdinand Munsayac" },
      { role: "Consultant", name: "Rodrigo Celones Jr." },
      { role: "Consultant", name: "GM Richard Gialogo" },
    ],
  },
  {
    id: "jt-advisers",
    title: "JT Advisers",
    accent: "from-red-900 via-zinc-950 to-black",
    members: [
      { role: "Security Team & Cage Crew Advisor", name: "Alberto Gaufo" },
      { role: "JT Fight Rules & Regulations", name: "Alfredo Melendres" },
      { role: "JT Social Media Strategist", name: "Master Red Dilla" },
    ],
  },
  {
    id: "regional-directors",
    title: "Regional and National Directors",
    accent: "from-red-800 via-black to-zinc-950",
    members: [
      { role: "Luzon Commander", name: "GM Harold Durado" },
      { role: "Visayas Commander", name: "GM Alberto Dacayana" },
      { role: "Mindanao Commander", name: "Master Orlando Bautista" },
    ],
  },
  {
    id: "training-department",
    title: "Juego Todo Training Department",
    accent: "from-orange-900 via-red-950 to-black",
    members: [
      { role: "Department Head", name: "Ferdinand Munsayac" },
      { role: "MTS", name: "Rodrigo Celones Jr." },
      { role: "Instructor", name: "GM Richard Gialogo" },
      { role: "Instructor", name: "Alfredo Melendres" },
    ],
  },
  {
    id: "master-instructors",
    title: "Juego Todo Master Instructors",
    accent: "from-red-950 via-zinc-900 to-black",
    members: [
      { role: "Master Instructor", name: "Master Bobby Picardal" },
      { role: "Master Instructor", name: "Master Joel Bagain" },
      { role: "Master Instructor", name: "Master Frederic Beleno" },
      { role: "Master Instructor", name: "Master Jonah Geronimo" },
      { role: "Master Instructor", name: "Master Red Dilla (UI)" },
    ],
  },
  {
    id: "arena-operations",
    title: "Arena Operations",
    accent: "from-black via-red-950 to-zinc-950",
    subsections: [
      {
        title: "Master of the Arena",
        members: [{ role: "Master of the Arena", name: "Rodrigo Celones Jr." }],
      },
      {
        title: "Grand Ambassador",
        members: [{ role: "Grand Ambassador", name: "Rodrigo Celones Jr." }],
      },
      {
        title: "Regional Ambassadors",
        members: [
          { role: "Luzon", name: "Maestra Leigh Domalsin" },
          { role: "Visayas", name: "GM Alberto Dacayana" },
          { role: "Mindanao", name: "Master Orlando Bautista" },
        ],
      },
      {
        title: "JT Head Officials",
        members: [{ role: "Head Official", name: "Juggler Marquez" }],
      },
      {
        title: "JT Head Referee Officials",
        members: [{ role: "Head Referee Official", name: "Juvanie Bacus" }],
      },
      {
        title: "JT Head Judges",
        members: [{ role: "Head Judge", name: "Alfredo Melendres" }],
      },
      {
        title: "JT Events Assistants",
        members: [
          { role: "Events Assistant", name: "Elrey Salmorin" },
          { role: "Events Assistant", name: "Art Tesion" },
          { role: "Events Assistant", name: "Harold Durado" },
        ],
      },
    ],
  },
  {
    id: "creative-technical",
    title: "Creative & Technical Department",
    accent: "from-purple-950 via-red-950 to-black",
    members: [
      { role: "Social Media Manager", name: "Perla Mae Tagacay" },
      { role: "Master of Visual Command And Sponsors", name: "Kiran Aames" },
      { role: "Matchmaker & Head of Marketing", name: "Andrew Mabutas" },
      { role: "Assistant Matchmaker", name: "GM Baxafra" },
      { role: "Graphic Artist", name: "Viandra Benitez" },
      { role: "IT Systems", name: "Aaron Untal" },
    ],
  },
  {
    id: "administrative-division",
    title: "Administrative Division",
    accent: "from-zinc-900 via-red-900 to-black",
    members: [
      { role: "Grand Secretary", name: "Janisse Bogtong" },
      { role: "Public Information Officer", name: "Perla Mae Tagacay" },
    ],
  },
];
