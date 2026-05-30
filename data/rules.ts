export type Rulebook = {
  slug: string;
  eyebrow: string;
  title: string;
  division: string;
  ageRange: string;
  summary: string;
  pdfHref: string;
  accent: string;
  rounds: string[];
  gear: {
    weaponRounds: string[];
    manoYMano: string[];
  };
  allowed: string[];
  prohibited: string[];
  safety: string[];
  compliance: string[];
};

export const rulebooks: Rulebook[] = [
  {
    slug: "official-rules",
    eyebrow: "Master Rulebook",
    title: "Official Rules & Equipment Guidelines",
    division: "Official Competition Framework",
    ageRange: "Primary adult rule structure",
    summary:
      "The core Juego Todo ruleset covering equipment, three-round match progression, allowed actions, prohibited actions, youth modifiers, compliance, and no-contest handling.",
    pdfHref: "/rules/juego-todo-official-rules.pdf",
    accent: "from-red-700 via-zinc-950 to-black",
    rounds: [
      "Round 1: Doble Baston with two official Arnis sticks.",
      "Round 2: Solo Baston with one stick and limited empty-hand body strikes.",
      "Round 3: Mano y Mano with unarmed FMA striking and BJJ grappling.",
      "Three 2-minute rounds with 1-minute rest and equipment transition periods.",
    ],
    gear: {
      weaponRounds: [
        "Grilled headgear, red/blue MMA gloves, groin guard, hand wraps, breast plate, arm guards, shin guards.",
        "MMA shorts or compression shorts only.",
        "Rash guard or sports bra mandatory for female fighters.",
      ],
      manoYMano: [
        "Red/blue MMA gloves, groin guard, hand wraps, mouth guard, MMA shorts or compression shorts.",
        "Rash guard or sports bra mandatory for female fighters.",
      ],
    },
    allowed: [
      "Doble Baston: body and leg kicks/knees, takedowns, sweeps, throws, and stick disarms.",
      "Solo Baston: body punches/elbows, body and leg kicks/knees, takedowns, standing submissions, stick chokes, and disarms.",
      "Mano y Mano: punches and kicks to head/body, elbows and knees to body, takedowns, sweeps, grappling transitions, FMA and BJJ submissions.",
    ],
    prohibited: [
      "No head strikes during Doble or Solo Baston rounds.",
      "No butt-end strikes, thrusting strikes, rabbit punches, ground-and-pound, suplexes, or spine/back-of-head attacks.",
      "No elbows or knees to the head in Mano y Mano.",
      "No groin attacks, oblique kicks, headbutts, eye gouging, biting, hair pulling, throat attacks, small joint manipulation, cage grabbing, stomps, or spikes.",
    ],
    safety: [
      "Youth modifiers prohibit all head strikes for fighters 17 and below.",
      "Dropped-stick athletes in Solo Baston may only use kicks and knees to legal targets until the stick is recovered.",
      "A 1-point deduction may apply if a fighter ends the round without possession of the stick.",
    ],
    compliance: [
      "Technical warnings and point deductions.",
      "Disqualification from the bout.",
      "Expulsion from the tournament premises.",
      "No Contest can be avoided after the midpoint of Round 2 by using judges' scorecards.",
    ],
  },
  {
    slug: "professional-rules",
    eyebrow: "Pro Division",
    title: "Professional Rules & Equipment Guidelines",
    division: "Professional Men & Women",
    ageRange: "Professional athletes",
    summary:
      "The professional rulebook defines the elite competition format, pro bout durations, weapon-round safety controls, Mano y Mano fouls, and corporate disciplinary standards.",
    pdfHref: "/rules/juego-todo-professional-rules.pdf",
    accent: "from-yellow-900 via-red-950 to-black",
    rounds: [
      "Round 1: Doble Baston weapon configuration.",
      "Round 2: Solo Baston with limited auxiliary empty-hand strikes.",
      "Round 3: Mano y Mano integrating FMA striking and BJJ ground structures.",
      "Men: 3x5 standard bouts, 5x5 championship bouts. Women: 3x3 standard bouts, 3x5 championship bouts.",
    ],
    gear: {
      weaponRounds: [
        "Base gear: groin guard for male fighters, hand wraps, and MMA shorts or compression shorts.",
        "Weapon rounds add grilled headgear, hand gloves, breastplate, arm guards, and shin guards.",
      ],
      manoYMano: [
        "Mouth guard added for Round 3 alongside the professional base equipment layout.",
      ],
    },
    allowed: [
      "Professional transition across Doble Baston, Solo Baston, and Mano y Mano.",
      "Full pro fight timing with 1-minute rest between rounds.",
      "Mano y Mano permits full-contact unarmed combat within the stated foul restrictions.",
    ],
    prohibited: [
      "General fouls: low blows, holding and hitting, rabbit punches, headbutts, shoulder strikes, eye attacks, stalling, faking knockdowns, open-glove attacks, abusive conduct, cage grabbing, and corner misconduct.",
      "Weapon fouls: no head targeting, two-handed single-stick strikes, intentional weapon drops, ignored disarm commands, thrusting, butt-end strikes, or illegal weapon zones.",
      "Mano y Mano fouls: no elbows/knees to head, soccer kicks, strikes to grounded opponents, biological fouls, throat attacks, small joint manipulation, or groin attacks.",
    ],
    safety: [
      "Weapon drops result in automatic 1-point deduction.",
      "Low-blow recovery can extend up to five minutes.",
      "Corners must maintain professional decorum at all times.",
    ],
    compliance: [
      "Point deductions per infraction.",
      "Immediate disqualification.",
      "Removal from event premises.",
      "Severe or repeated non-compliance can trigger a permanent corporate ban.",
    ],
  },
  {
    slug: "adult-amateur-rules",
    eyebrow: "Adult Amateur",
    title: "Adult Amateur Rules & Equipment Guidelines",
    division: "18 Years & Above",
    ageRange: "18+ amateur competitors",
    summary:
      "The adult amateur rulebook preserves the full three-round Juego Todo format while shortening bout duration and emphasizing controlled progression through weapon and unarmed phases.",
    pdfHref: "/rules/juego-todo-adult-amateur-rules.pdf",
    accent: "from-red-800 via-black to-zinc-900",
    rounds: [
      "Round 1: Doble Baston with two official Arnis sticks.",
      "Round 2: Solo Baston with one Arnis stick and body-only auxiliary strikes.",
      "Round 3: Mano y Mano with weaponless FMA and BJJ.",
      "Three 2-minute rounds with 1-minute rest periods.",
    ],
    gear: {
      weaponRounds: [
        "Grilled headgear, red/blue MMA gloves, groin guard, hand wraps, breast plate, arm guards, shin guards.",
        "MMA shorts or compression shorts only.",
        "Rash guard or sports bra mandatory for female fighters.",
      ],
      manoYMano: [
        "Red/blue MMA gloves, groin guard, hand wraps, mouth guard, MMA shorts or compression shorts.",
        "Rash guard or sports bra mandatory for female fighters.",
      ],
    },
    allowed: [
      "Doble Baston: body/leg kicks and knees, takedowns, sweeps, throws, and disarms.",
      "Solo Baston: body punches/elbows, body/leg kicks and knees, takedowns, sweeps, standing submissions, stick chokes, disarms, and hand switching.",
      "Mano y Mano: punches/kicks to head and body, elbows/knees to body, takedowns, sweeps, grappling transitions, FMA and BJJ submissions.",
    ],
    prohibited: [
      "Doble Baston: no punches, elbows, head kicks/knees/elbows, oblique kicks, butt-end strikes, thrusting, stick chokes, spine attacks, ground-and-pound, suplexes, or submissions.",
      "Solo Baston: no head strikes, oblique kicks, butt-end strikes, thrusting, spine attacks, ground-and-pound, suplexes, or BJJ ground submissions.",
      "Mano y Mano: no head elbows/knees, groin attacks, oblique kicks, rabbit punches, headbutts, eye gouging, fish hooking, biting, hair pulling, throat attacks, small-joint manipulation, cage grabbing, grounded head strikes, heel hooks, pile driving, 12-6 elbows, stomps, spikes, or excessive jumping takedowns.",
    ],
    safety: [
      "Youth modifiers under this banner prohibit all head strikes for fighters 17 and below.",
      "Disarmed Solo Baston fighters cannot punch or elbow until the stick is recovered.",
      "A 1-point deduction may apply if the stick is not possessed at the final sound.",
    ],
    compliance: [
      "Technical warning or point deduction.",
      "Disqualification from the match.",
      "Expulsion from the tournament premises.",
      "After the midpoint of Round 2, accidental stoppages can be decided by judges' scorecards.",
    ],
  },
  {
    slug: "kids-official-rules",
    eyebrow: "Kids Division",
    title: "Kids Official Rules & Equipment Guidelines",
    division: "Kids Division",
    ageRange: "5-11 years old",
    summary:
      "The kids rulebook adapts Juego Todo into a youth-safe format with padded foam sticks, strict head-target restrictions, shorter rounds, protective gear, and controlled grappling.",
    pdfHref: "/rules/juego-todo-kids-official-rules.pdf",
    accent: "from-red-600 via-zinc-950 to-slate-950",
    rounds: [
      "Round 1: Doble Baston with designated padded foam sticks.",
      "Round 2: Solo Baston with one padded foam stick and controlled body-only empty-hand strikes.",
      "Round 3: Mano y Mano with body-only FMA striking and basic BJJ mechanics.",
      "Three 2-minute rounds with 1-minute safe gear transition periods.",
    ],
    gear: {
      weaponRounds: [
        "Taekwondo-style headgear, preferably XS or Small.",
        "Red/blue MMA gloves, groin guard, hand wraps, breast plate, arm guards, shin guards.",
        "MMA shorts or compression shorts only, with rash guard or sports bra required for female athletes.",
      ],
      manoYMano: [
        "Boxing headgear, red/blue MMA gloves, groin guard, hand wraps, mouth guard, breast plate, arm guards, shin guards.",
        "MMA shorts or compression shorts only, with rash guard or sports bra required for female athletes.",
      ],
    },
    allowed: [
      "Doble Baston: kicks and knees to the body, plus stick disarms.",
      "Solo Baston: controlled body punches/elbows while maintaining control of the stick, plus body kicks/knees.",
      "Mano y Mano: punches and kicks to the body, takedowns, sweeps, clean hip throws, and controlled ground submissions.",
    ],
    prohibited: [
      "No head strikes of any kind across all rounds.",
      "Doble Baston: no punches, elbows, takedowns, sweeps, submissions, joint manipulation, or ground fighting.",
      "Solo Baston: no takedowns, sweeps, throws, submissions, or ground grappling if the stick is lost.",
      "Mano y Mano: no dangerous slams, high-amplitude lifts, spiking, groin attacks, small joint manipulation, eye gouging, or biting.",
    ],
    safety: [
      "Head-target restriction is absolute for the entire 5-11 division.",
      "Ages 5 and below receive zero-tolerance handling for deliberate or uncontrolled contact near the head or neck.",
      "Padded foam weapons and protective gear are central to the youth format.",
    ],
    compliance: [
      "Official point deductions.",
      "Disqualification from the tournament match.",
      "Expulsion from tournament grounds.",
      "No Contest can be bypassed after the halfway point of Round 2 by calculating judges' scorecards.",
    ],
  },
  {
    slug: "minors-rules-guidelines",
    eyebrow: "Minors Division",
    title: "Minors Rules & Equipment Guidelines",
    division: "Minors Division",
    ageRange: "12-17 years old",
    summary:
      "The minors rulebook bridges youth safety and amateur structure, preserving the three-round format while restricting head strikes for fighters 17 and below.",
    pdfHref: "/rules/juego-todo-minors-rules-guidelines.pdf",
    accent: "from-zinc-900 via-red-950 to-black",
    rounds: [
      "Round 1: Doble Baston.",
      "Round 2: Solo Baston with limited hand strikes.",
      "Round 3: Mano y Mano with FMA and BJJ integration.",
      "Three 2-minute rounds with 1-minute rest periods.",
    ],
    gear: {
      weaponRounds: [
        "Grilled headgear, preferably XS or Small.",
        "Red/blue MMA gloves, groin guard, hand wraps, MMA shorts or compression shorts, breast plate, rash guard or sports bra for female fighters, arm guards, and shin guards.",
      ],
      manoYMano: [
        "Boxing headgear, red/blue MMA gloves, groin guard, hand wraps, mouth guard, MMA shorts or compression shorts, breast plate, rash guard or sports bra for female fighters, arm guards, and shin guards.",
      ],
    },
    allowed: [
      "Doble Baston: body kicks/knees, takedowns, sweeps, and stick disarms.",
      "Solo Baston: body kicks/knees, takedowns, sweeps, disarms, body elbows, punches while holding the stick, stick chokes, standing submissions, and hand switching.",
      "Mano y Mano: FMA/BJJ integration, punches and kicks to legal targets, elbows/knees to body, takedowns, sweeps, and submissions.",
    ],
    prohibited: [
      "No strikes to the head for fighters 17 and below.",
      "No oblique kicks, butt-end strikes, thrusting strikes, spine/back-of-head attacks, ground-and-pound, suplexes, or excessive-force jumping takedowns.",
      "No punches or elbows if the stick is lost in Solo Baston.",
      "No headbutts, eye gouging, fish hooking, biting, spitting, hair pulling, throat attacks, small joint manipulation, cage grabbing, grounded head knees, heel hooks, 12-6 elbows, soccer kicks, stomps, spikes, or fingers in wounds/orifices.",
    ],
    safety: [
      "The 12-17 division uses youth-sized headgear where appropriate.",
      "All head strikes are prohibited for 17-and-below fighters.",
      "Mano y Mano requires boxing headgear, mouth guard, arm guards, shin guards, groin guard, and breast plate.",
    ],
    compliance: [
      "Point deductions.",
      "Disqualification.",
      "Removal from the event.",
      "If a no-contest scenario occurs beyond half of Round 2, judges determine the winner by scorecards.",
    ],
  },
];

export function getRulebook(slug: string) {
  return rulebooks.find((rulebook) => rulebook.slug === slug);
}
