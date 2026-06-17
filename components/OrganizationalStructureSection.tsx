"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Crown,
  Megaphone,
  Shield,
  Swords,
  Target,
  Users,
} from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { orgSections, type OrgSection } from "@/data/organizational-structure";

const sectionIcons: Record<string, typeof Crown> = {
  "supreme-grand-council": Crown,
  "grand-council-of-elders": Shield,
  "military-consultants": Target,
  "jt-advisers": Swords,
  "regional-directors": Building2,
  "training-department": Users,
  "master-instructors": Swords,
  "arena-operations": Shield,
  "creative-technical": Megaphone,
  "administrative-division": Building2,
};

export function OrganizationalStructureSection() {
  const supremeCouncil = orgSections[0];

  return (
    <MotionSection className="mx-auto max-w-7xl space-y-8 pb-14 sm:space-y-10 sm:pb-20">
      {supremeCouncil ? (
        <div className="glass-panel animated-border overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/80">
          <div className={`bg-gradient-to-r ${supremeCouncil.accent} px-5 py-4 sm:px-6`}>
            <div className="flex items-center gap-3">
              <Crown className="text-yellow-200" size={22} aria-hidden />
              <h2 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                {supremeCouncil.title}
              </h2>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {supremeCouncil.members?.map((member, index) => (
              <motion.div
                className="rounded-2xl border border-white/[0.08] bg-black/35 p-4 transition hover:border-[#FF1010]/30"
                initial={{ opacity: 0, y: 12 }}
                key={`${member.role}-${member.name}`}
                transition={{ delay: index * 0.04, duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">
                  {member.role}
                </p>
                <p className="mt-2 text-base font-bold text-white sm:text-lg">{member.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {orgSections.slice(1).map((section, index) => (
          <OrgSectionCard index={index} key={section.id} section={section} />
        ))}
      </div>
    </MotionSection>
  );
}

function OrgSectionCard({ section, index }: { section: OrgSection; index: number }) {
  const Icon = sectionIcons[section.id] ?? Shield;
  const isWide = section.subsections && section.subsections.length > 3;

  return (
    <motion.article
      className={`glass-panel group overflow-hidden rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/75 ${
        isWide ? "md:col-span-2 xl:col-span-3" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.55 }}
      viewport={{ once: true, margin: "-40px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className={`bg-gradient-to-r ${section.accent} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <Icon className="text-red-100" size={18} aria-hidden />
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white sm:text-base">
            {section.title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        {section.members ? (
          <ul className="space-y-3">
            {section.members.map((member) => (
              <li
                className="grid gap-1 border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_1.1fr]"
                key={`${member.role}-${member.name}`}
              >
                <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {member.role}
                </span>
                <span className="text-sm font-semibold text-white">{member.name}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {section.subsections ? (
          <div className={`grid gap-4 ${isWide ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
            {section.subsections.map((subsection) => (
              <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-4" key={subsection.title}>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                  {subsection.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {subsection.members.map((member) => (
                    <li className="text-sm text-zinc-300" key={`${member.role}-${member.name}`}>
                      {subsection.members.length > 1 && member.role !== member.name ? (
                        <>
                          <span className="text-zinc-500">{member.role}: </span>
                          {member.name}
                        </>
                      ) : (
                        member.name
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
