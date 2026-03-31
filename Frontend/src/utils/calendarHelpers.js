
export function gCalUrl(title, date, details) {
  const d = (date || "").replace(/-/g, "");
  if (!d) return "#";
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${d}/${d}`,
    details: details || "",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function buildGCalUrl(company, step) {
  const d = (step.date || "").replace(/-/g, "");
  if (!d) return "#";
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${company} — ${step.step}`,
    dates: `${d}/${d}`,
    details: `Company: ${company}\nStep: ${step.step}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function buildTimeline(opp) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { step: "Applied",           date: today,                          done: true },
    { step: "Shortlisted",       date: opp.shortlistDate || null,      done: false },
    { step: "Online Assessment", date: opp.oaDate || null,             done: false },
    { step: "OA Result",         date: opp.oaResultDate || null,       done: false },
    { step: "Interview",         date: opp.interviewDate || null,      done: false },
    { step: "Interview Result",  date: opp.interviewResultDate || null,done: false },
    { step: "Final Decision",    date: opp.finalResultDate || null,    done: false },
  ];
}
