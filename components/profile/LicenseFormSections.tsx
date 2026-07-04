"use client";

import { Field, FormGroup, SelectField, TextAreaField } from "@/components/profile/license-form-fields";
import {
  getCouncilPositionOptions,
  hasVisibleRoleSections,
  isCoachProgram,
  isGrandCouncilMemberProgram,
  isGrandCouncilOfficerProgram,
  isSeniorCoachProgram,
  showClubInformationSection,
  showCoachingCertificationsSection,
  showCoachingExperienceSection,
  showCouncilPositionSection,
  showFightInformationSection,
  showFighterCoachSection,
  showFighterExperienceSection,
  showJudgeExperienceSection,
  showMedicalSection,
  showOfficerOrganizationSection,
  showOrganizationSection,
  showPhysicalDetailsSection,
  showProfessionalExpertiseSection,
  showRefereeExperienceSection,
  showStaffPositionSection,
  showTrainerSection,
  type LicenseFormContext,
} from "@/data/license-form-config";
import {
  bloodTypeOptions,
  civilStatusOptions,
  coachLevelOptions,
  fighterDominantHandOptions,
  fighterMedicalOptions,
  fighterStanceOptions,
  fighterWeightDivisionOptions,
  grandCouncilMemberCouncilPositions,
  grandCouncilOfficerPositions,
  judgeLevelOptions,
  philippineRegions,
  refereeLevelOptions,
  refereeRulesetOptions,
  seniorCoachRankOptions,
  staffDepartmentOptions,
  suffixOptions,
  trainerDisciplineOptions,
  type LicenseApplicationInput,
  type LicenseRestrictionCode,
} from "@/data/license-applications";

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

type SectionProps = {
  form: LicenseApplicationInput;
  ctx: LicenseFormContext;
  updateField: <K extends keyof LicenseApplicationInput>(key: K, value: LicenseApplicationInput[K]) => void;
  updateBackgroundField: (fieldId: string, value: string) => void;
  toggleCheckboxField: (fieldId: string, checked: boolean) => void;
};

export function PersonalInformationSection({ form, updateField }: Pick<SectionProps, "form" | "updateField">) {
  return (
    <FormGroup
      columns={3}
      description="Enter your legal name and personal details exactly as they should appear on your license."
      title="Personal Information"
    >
      <Field label="First Name" onChange={(value) => updateField("firstName", value)} required value={form.firstName} />
      <Field label="Middle Name" onChange={(value) => updateField("middleName", value)} placeholder="Optional" value={form.middleName} />
      <Field label="Last Name" onChange={(value) => updateField("lastName", value)} required value={form.lastName} />
      <SelectField label="Suffix" onChange={(value) => updateField("suffix", value)} options={["", ...suffixOptions]} placeholder="Optional" value={form.suffix} />
      <SelectField label="Gender" onChange={(value) => updateField("gender", value)} options={genderOptions} required value={form.gender} />
      <Field label="Date of Birth" onChange={(value) => updateField("dateOfBirth", value)} required type="date" value={form.dateOfBirth} />
      <Field label="Nationality" onChange={(value) => updateField("nationality", value)} required value={form.nationality} />
      <SelectField label="Blood Type" onChange={(value) => updateField("bloodType", value)} options={bloodTypeOptions} value={form.bloodType} />
      <SelectField label="Civil Status" onChange={(value) => updateField("civilStatus", value)} options={["", ...civilStatusOptions]} placeholder="Optional" value={form.civilStatus} />
    </FormGroup>
  );
}

export function ContactSection({ form, updateField }: Pick<SectionProps, "form" | "updateField">) {
  return (
    <FormGroup description="We will use these details for application updates and official correspondence." title="Contact">
      <Field label="Email Address" onChange={(value) => updateField("contactEmail", value)} required type="email" value={form.contactEmail} />
      <Field label="Mobile Number" onChange={(value) => updateField("mobileNumber", value)} required type="tel" value={form.mobileNumber} />
    </FormGroup>
  );
}

export function AddressSection({ form, updateField }: Pick<SectionProps, "form" | "updateField">) {
  return (
    <FormGroup description="Provide your current residential address." title="Address">
      <Field label="Country" onChange={(value) => updateField("addressCountry", value)} required value={form.addressCountry} />
      <Field label="Province" onChange={(value) => updateField("addressProvince", value)} required value={form.addressProvince} />
      <Field label="City/Municipality" onChange={(value) => updateField("addressCity", value)} required value={form.addressCity} />
      <Field label="Barangay" onChange={(value) => updateField("addressBarangay", value)} required value={form.addressBarangay} />
      <Field label="ZIP Code" onChange={(value) => updateField("addressZip", value)} required value={form.addressZip} />
    </FormGroup>
  );
}

export function EmergencyContactSection({ form, updateField }: Pick<SectionProps, "form" | "updateField">) {
  return (
    <FormGroup description="Provide someone we can contact in case of emergency." title="Emergency Contact">
      <Field label="Contact Name" onChange={(value) => updateField("emergencyContactName", value)} required value={form.emergencyContactName} />
      <Field label="Relationship" onChange={(value) => updateField("emergencyContactRelationship", value)} placeholder="e.g. Spouse, Parent" required value={form.emergencyContactRelationship} />
      <Field label="Mobile Number" onChange={(value) => updateField("emergencyContactPhone", value)} required type="tel" value={form.emergencyContactPhone} />
      <Field className="sm:col-span-2" label="Address" onChange={(value) => updateField("emergencyContactAddress", value)} required value={form.emergencyContactAddress} />
    </FormGroup>
  );
}

export function RoleDetailsSections(props: SectionProps) {
  const { form, ctx, updateField, updateBackgroundField, toggleCheckboxField } = props;
  const answers = form.backgroundAnswers;

  return (
    <div className="space-y-4">
      {showOrganizationSection(ctx) ? (
        <FormGroup description="Tell us about your team, instructor, and club affiliation." title="Organization">
          <Field label="Fight Team" onChange={(value) => updateBackgroundField("fightTeam", value)} required value={answers.fightTeam ?? ""} />
          <Field label="Instructor" onChange={(value) => updateBackgroundField("instructor", value)} required value={answers.instructor ?? ""} />
          <Field className="sm:col-span-2" label="Club Name" onChange={(value) => updateBackgroundField("clubName", value)} required value={answers.clubName ?? ""} />
        </FormGroup>
      ) : null}

      {showCouncilPositionSection(ctx) && isGrandCouncilOfficerProgram(ctx) ? (
        <FormGroup description="Provide your appointed Grand Council position and jurisdiction." title="Council Position">
          <SelectField
            className="sm:col-span-2"
            label="Position"
            onChange={(value) => {
              const selected = grandCouncilOfficerPositions.find((option) => option.label === value);
              updateBackgroundField("officerPosition", value);
              if (selected) {
                updateField("restrictionCode", selected.code as LicenseRestrictionCode);
              }
            }}
            options={grandCouncilOfficerPositions.map((option) => option.label)}
            required
            value={answers.officerPosition ?? ""}
          />
          <SelectField label="Region" onChange={(value) => updateBackgroundField("officerRegion", value)} options={philippineRegions} required value={answers.officerRegion ?? ""} />
          <Field label="Province" onChange={(value) => updateBackgroundField("officerProvince", value)} required value={answers.officerProvince ?? ""} />
          <Field label="Appointment Date" onChange={(value) => updateBackgroundField("appointmentDate", value)} required type="date" value={answers.appointmentDate ?? ""} />
          <Field className="sm:col-span-2" label="Office" onChange={(value) => updateBackgroundField("officerOffice", value)} placeholder="e.g. Governance & Legal Office" required value={answers.officerOffice ?? ""} />
        </FormGroup>
      ) : null}

      {showOfficerOrganizationSection(ctx) ? (
        <FormGroup description="Summarize your service record and council assignment." title="Organization">
          <Field label="Years of Service" onChange={(value) => updateBackgroundField("yearsOfService", value)} placeholder="e.g. 8" required value={answers.yearsOfService ?? ""} />
          <Field label="Assigned Chapter" onChange={(value) => updateBackgroundField("assignedChapter", value)} required value={answers.assignedChapter ?? ""} />
          <Field className="sm:col-span-2" label="Committee" onChange={(value) => updateBackgroundField("committee", value)} placeholder="e.g. Rules & Ethics" required value={answers.committee ?? ""} />
        </FormGroup>
      ) : null}

      {showCouncilPositionSection(ctx) && isGrandCouncilMemberProgram(ctx) ? (
        <FormGroup description="Provide your appointed council role and service details." title="Council Position">
          <SelectField
            className="sm:col-span-2"
            label="Council Position"
            onChange={(value) => {
              const selected = grandCouncilMemberCouncilPositions.find((option) => option.label === value);
              updateBackgroundField("councilPosition", value);
              if (selected) {
                updateField("restrictionCode", selected.code as LicenseRestrictionCode);
              }
            }}
            options={getCouncilPositionOptions()}
            required
            value={answers.councilPosition ?? ""}
          />
          <Field label="Province" onChange={(value) => updateBackgroundField("councilProvince", value)} required value={answers.councilProvince ?? ""} />
          <Field label="Appointment Date" onChange={(value) => updateBackgroundField("appointmentDate", value)} required type="date" value={answers.appointmentDate ?? ""} />
          <Field className="sm:col-span-2" label="Years in Service" onChange={(value) => updateBackgroundField("yearsInService", value)} placeholder="e.g. 5" required value={answers.yearsInService ?? ""} />
        </FormGroup>
      ) : null}

      {showClubInformationSection(ctx) ? (
        <>
          <FormGroup description="Provide details about your affiliated club or gym." title="Club Information">
            <Field className="sm:col-span-2" label="Club Name" onChange={(value) => updateBackgroundField("clubName", value)} required value={answers.clubName ?? ""} />
            <Field className="sm:col-span-2" label="Club Address" onChange={(value) => updateBackgroundField("clubAddress", value)} required value={answers.clubAddress ?? ""} />
            <Field label="Province" onChange={(value) => updateBackgroundField("clubProvince", value)} required value={answers.clubProvince ?? ""} />
            <SelectField label="Region" onChange={(value) => updateBackgroundField("clubRegion", value)} options={philippineRegions} required value={answers.clubRegion ?? ""} />
            <Field label="Established Year" onChange={(value) => updateBackgroundField("establishedYear", value)} placeholder="e.g. 2018" required type="number" value={answers.establishedYear ?? ""} />
            <Field label="Number of Members" onChange={(value) => updateBackgroundField("numberOfMembers", value)} placeholder="e.g. 45" required type="number" value={answers.numberOfMembers ?? ""} />
            <Field label="Website" onChange={(value) => updateBackgroundField("website", value)} placeholder="https://" type="url" value={answers.website ?? ""} />
            <Field label="Facebook Page" onChange={(value) => updateBackgroundField("facebookPage", value)} placeholder="facebook.com/yourclub" value={answers.facebookPage ?? ""} />
          </FormGroup>
          <FormGroup description="Enter your club's business registration details." title="Business Information">
            <Field className="sm:col-span-2" label="DTI Registration" onChange={(value) => updateBackgroundField("dtiRegistration", value)} required value={answers.dtiRegistration ?? ""} />
            <Field className="sm:col-span-2" label="SEC Registration" onChange={(value) => updateBackgroundField("secRegistration", value)} placeholder="Optional" value={answers.secRegistration ?? ""} />
          </FormGroup>
        </>
      ) : null}

      {showProfessionalExpertiseSection(ctx) ? (
        <FormGroup columns={2} description="Summarize your professional advisory credentials." title="Professional Expertise">
          <Field label="Position" onChange={(value) => updateBackgroundField("adviserPosition", value)} required value={answers.adviserPosition ?? ""} />
          <Field label="Area of Expertise" onChange={(value) => updateBackgroundField("areaOfExpertise", value)} required value={answers.areaOfExpertise ?? ""} />
          <Field label="Organization" onChange={(value) => updateBackgroundField("organization", value)} required value={answers.organization ?? ""} />
          <Field label="Years Experience" onChange={(value) => updateBackgroundField("yearsExperience", value)} placeholder="e.g. 10" required type="number" value={answers.yearsExperience ?? ""} />
        </FormGroup>
      ) : null}

      {showTrainerSection(ctx) ? (
        <FormGroup columns={2} description="Provide your training background and disciplines." title="Training Experience">
          <div className="sm:col-span-2">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Training Disciplines</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trainerDisciplineOptions.map((discipline) => (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-emerald-400/30" key={discipline.id}>
                  <input checked={answers[discipline.id] === "yes"} className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/40" onChange={(event) => toggleCheckboxField(discipline.id, event.target.checked)} type="checkbox" />
                  <span className="text-sm text-white">{discipline.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Years Training" onChange={(value) => updateBackgroundField("yearsTraining", value)} placeholder="e.g. 6" required type="number" value={answers.yearsTraining ?? ""} />
          <Field label="Training Gym" onChange={(value) => updateBackgroundField("trainingGym", value)} required value={answers.trainingGym ?? ""} />
          <TextAreaField className="sm:col-span-2" label="Certifications" onChange={(value) => updateBackgroundField("certifications", value)} required value={answers.certifications ?? ""} />
        </FormGroup>
      ) : null}

      {showRefereeExperienceSection(ctx) ? (
        <>
          <FormGroup columns={2} description="Provide your officiating experience and competition levels." title="Referee Experience">
            <Field label="Years Experience" onChange={(value) => updateBackgroundField("refereeYearsExperience", value)} placeholder="e.g. 5" required type="number" value={answers.refereeYearsExperience ?? ""} />
            <div className="sm:col-span-2">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Officiating Levels</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {refereeLevelOptions.map((level) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-amber-400/30" key={level.id}>
                    <input checked={answers[level.id] === "yes"} className="h-4 w-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500/40" onChange={(event) => toggleCheckboxField(level.id, event.target.checked)} type="checkbox" />
                    <span className="text-sm text-white">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </FormGroup>
          <FormGroup columns={2} description="Select rulesets and list credentials." title="Rulesets & Credentials">
            <div className="sm:col-span-2">
              <div className="grid gap-3 sm:grid-cols-3">
                {refereeRulesetOptions.map((ruleset) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-amber-400/30" key={ruleset.id}>
                    <input checked={answers[ruleset.id] === "yes"} className="h-4 w-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500/40" onChange={(event) => toggleCheckboxField(ruleset.id, event.target.checked)} type="checkbox" />
                    <span className="text-sm text-white">{ruleset.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <TextAreaField className="sm:col-span-2" label="Certifications" onChange={(value) => updateBackgroundField("refereeCertifications", value)} required value={answers.refereeCertifications ?? ""} />
            <TextAreaField className="sm:col-span-2" label="Previous Events" onChange={(value) => updateBackgroundField("previousEvents", value)} required value={answers.previousEvents ?? ""} />
          </FormGroup>
        </>
      ) : null}

      {showJudgeExperienceSection(ctx) ? (
        <>
          <FormGroup columns={2} description="Provide your judging experience and competition levels." title="Judge Experience">
            <Field label="Years Experience" onChange={(value) => updateBackgroundField("judgeYearsExperience", value)} placeholder="e.g. 5" required type="number" value={answers.judgeYearsExperience ?? ""} />
            <div className="sm:col-span-2">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Judging Levels</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {judgeLevelOptions.map((level) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-indigo-400/30" key={level.id}>
                    <input checked={answers[level.id] === "yes"} className="h-4 w-4 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500/40" onChange={(event) => toggleCheckboxField(level.id, event.target.checked)} type="checkbox" />
                    <span className="text-sm text-white">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <TextAreaField className="sm:col-span-2" label="Certifications" onChange={(value) => updateBackgroundField("judgeCertifications", value)} required value={answers.judgeCertifications ?? ""} />
            <TextAreaField className="sm:col-span-2" label="Events Worked" onChange={(value) => updateBackgroundField("eventsWorked", value)} required value={answers.eventsWorked ?? ""} />
          </FormGroup>
        </>
      ) : null}

      {showCoachingExperienceSection(ctx) && isSeniorCoachProgram(ctx) ? (
        <FormGroup columns={2} description="Summarize your senior coaching background." title="Coaching Experience">
          <SelectField label="Highest Rank" onChange={(value) => updateBackgroundField("highestRank", value)} options={seniorCoachRankOptions} required value={answers.highestRank ?? ""} />
          <Field label="Years Coaching" onChange={(value) => updateBackgroundField("yearsCoaching", value)} placeholder="e.g. 15" required type="number" value={answers.yearsCoaching ?? ""} />
          <Field className="sm:col-span-2" label="School" onChange={(value) => updateBackgroundField("coachingSchool", value)} required value={answers.coachingSchool ?? ""} />
          <Field label="Province" onChange={(value) => updateBackgroundField("coachingProvince", value)} required value={answers.coachingProvince ?? ""} />
          <Field label="Champions Produced" onChange={(value) => updateBackgroundField("championsProduced", value)} required value={answers.championsProduced ?? ""} />
        </FormGroup>
      ) : null}

      {showCoachingExperienceSection(ctx) && isCoachProgram(ctx) ? (
        <FormGroup columns={2} description="Provide your coaching credentials and club affiliation." title="Coaching Experience">
          <SelectField label="Coaching Level" onChange={(value) => updateBackgroundField("coachingLevel", value)} options={coachLevelOptions} required value={answers.coachingLevel ?? ""} />
          <Field label="Years Coaching" onChange={(value) => updateBackgroundField("yearsCoaching", value)} placeholder="e.g. 8" required type="number" value={answers.yearsCoaching ?? ""} />
          <Field label="Main Style" onChange={(value) => updateBackgroundField("mainStyle", value)} required value={answers.mainStyle ?? ""} />
          <Field label="Club" onChange={(value) => updateBackgroundField("coachingClub", value)} required value={answers.coachingClub ?? ""} />
          <Field label="Province" onChange={(value) => updateBackgroundField("coachingProvince", value)} required value={answers.coachingProvince ?? ""} />
          <SelectField label="Region" onChange={(value) => updateBackgroundField("coachingRegion", value)} options={philippineRegions} required value={answers.coachingRegion ?? ""} />
          <Field label="Students Coached" onChange={(value) => updateBackgroundField("numberOfStudents", value)} required type="number" value={answers.numberOfStudents ?? ""} />
          <Field label="Championships Coached" onChange={(value) => updateBackgroundField("championshipsCoached", value)} required value={answers.championshipsCoached ?? ""} />
        </FormGroup>
      ) : null}

      {showCoachingExperienceSection(ctx) && ctx.restrictionCode === "JT5" && !isCoachProgram(ctx) && !isSeniorCoachProgram(ctx) ? (
        <FormGroup columns={2} description="Provide your coaching service record as a council member." title="Coaching Experience">
          <Field label="Years Coaching" onChange={(value) => updateBackgroundField("yearsCoaching", value)} placeholder="e.g. 8" required type="number" value={answers.yearsCoaching ?? ""} />
        </FormGroup>
      ) : null}

      {showCoachingCertificationsSection(ctx) && isSeniorCoachProgram(ctx) ? (
        <FormGroup title="Certifications">
          <TextAreaField className="sm:col-span-2" label="Senior Coach Certifications" onChange={(value) => updateBackgroundField("seniorCoachCertifications", value)} required value={answers.seniorCoachCertifications ?? ""} />
        </FormGroup>
      ) : null}

      {showCoachingCertificationsSection(ctx) && isCoachProgram(ctx) ? (
        <FormGroup title="Certifications">
          <TextAreaField className="sm:col-span-2" label="Certifications" onChange={(value) => updateBackgroundField("certifications", value)} required value={answers.certifications ?? ""} />
        </FormGroup>
      ) : null}

      {showCoachingCertificationsSection(ctx) && ctx.restrictionCode === "JT5" && !isCoachProgram(ctx) && !isSeniorCoachProgram(ctx) ? (
        <FormGroup title="Certifications">
          <TextAreaField className="sm:col-span-2" label="Certifications" onChange={(value) => updateBackgroundField("certifications", value)} required value={answers.certifications ?? ""} />
        </FormGroup>
      ) : null}

      {showPhysicalDetailsSection(ctx) ? (
        <FormGroup columns={2} description="Enter physical measurements for competition registration." title="Physical Details">
          <Field label="Nickname" onChange={(value) => updateBackgroundField("nickname", value)} placeholder="Fight name" required value={answers.nickname ?? ""} />
          <Field label="Height" onChange={(value) => updateBackgroundField("fighterHeight", value)} placeholder="e.g. 173 cm" required value={answers.fighterHeight ?? ""} />
          <Field label="Weight" onChange={(value) => updateBackgroundField("fighterWeight", value)} placeholder="e.g. 70 kg" required value={answers.fighterWeight ?? ""} />
          <Field label="Reach" onChange={(value) => updateBackgroundField("reach", value)} placeholder="e.g. 178 cm" required value={answers.reach ?? ""} />
          <SelectField label="Blood Type" onChange={(value) => updateField("bloodType", value)} options={bloodTypeOptions} required value={form.bloodType} />
        </FormGroup>
      ) : null}

      {showMedicalSection(ctx) ? (
        <FormGroup description="Confirm that all required medical screenings are complete and current." title="Medical Information">
          <div className="space-y-3 sm:col-span-2">
            {fighterMedicalOptions.map((item) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-red-500/30" key={item.id}>
                <input checked={answers[item.id] === "yes"} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-[#FF1010] focus:ring-[#FF1010]" onChange={(event) => toggleCheckboxField(item.id, event.target.checked)} type="checkbox" />
                <span>
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">I confirm this medical requirement is complete and valid.</span>
                </span>
              </label>
            ))}
          </div>
        </FormGroup>
      ) : null}

      {showFightInformationSection(ctx) ? (
        <FormGroup columns={2} description="Provide your competition profile and team affiliation." title="Fight Information">
          <SelectField label="Weight Class" onChange={(value) => updateBackgroundField("weightDivision", value)} options={fighterWeightDivisionOptions} required value={answers.weightDivision ?? ""} />
          <SelectField label="Stance" onChange={(value) => updateBackgroundField("stance", value)} options={fighterStanceOptions} required value={answers.stance ?? ""} />
          <SelectField label="Dominant Hand" onChange={(value) => updateBackgroundField("dominantHand", value)} options={fighterDominantHandOptions} required value={answers.dominantHand ?? ""} />
          <Field label="Fight Team" onChange={(value) => updateBackgroundField("fightTeam", value)} required value={answers.fightTeam ?? ""} />
          <Field label="Gym" onChange={(value) => updateBackgroundField("gym", value)} required value={answers.gym ?? ""} />
        </FormGroup>
      ) : null}

      {showFighterCoachSection(ctx) ? (
        <FormGroup title="Coach">
          <Field className="sm:col-span-2" label="Coach" onChange={(value) => updateBackgroundField("coachName", value)} required value={answers.coachName ?? ""} />
        </FormGroup>
      ) : null}

      {showFighterExperienceSection(ctx) ? (
        <FormGroup columns={2} description="Summarize your amateur and professional competition history." title="Experience">
          <Field label="Amateur Record" onChange={(value) => updateBackgroundField("amateurRecord", value)} placeholder="e.g. 12-2-0" required value={answers.amateurRecord ?? ""} />
          <Field label="Professional Record" onChange={(value) => updateBackgroundField("professionalRecord", value)} placeholder="e.g. 5-1-0" required value={answers.professionalRecord ?? ""} />
          <Field label="Years Training" onChange={(value) => updateBackgroundField("yearsTraining", value)} placeholder="e.g. 8" required type="number" value={answers.yearsTraining ?? ""} />
        </FormGroup>
      ) : null}

      {showStaffPositionSection(ctx) ? (
        <FormGroup columns={2} description="Provide your current JTGC staff assignment details." title="Staff Position">
          <SelectField label="Department" onChange={(value) => updateBackgroundField("staffDepartment", value)} options={staffDepartmentOptions} required value={answers.staffDepartment ?? ""} />
          <Field label="Position" onChange={(value) => updateBackgroundField("staffPosition", value)} required value={answers.staffPosition ?? ""} />
          <Field label="Office" onChange={(value) => updateBackgroundField("staffOffice", value)} required value={answers.staffOffice ?? ""} />
          <Field label="Years of Service" onChange={(value) => updateBackgroundField("staffYearsOfService", value)} placeholder="e.g. 3" required type="number" value={answers.staffYearsOfService ?? ""} />
        </FormGroup>
      ) : null}

      {!hasVisibleRoleSections(ctx) ? (
        <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
          No additional role details are required for this license type. Continue to emergency contact.
        </p>
      ) : null}
    </div>
  );
}
