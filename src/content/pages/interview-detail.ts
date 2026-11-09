/* Section titles, intros and part leads for the interview case page. Edit the text here; the page only lays it out. */

export const INTERVIEW_DETAIL_COPY = {
  parts: {
    basics: {
      lead: "Start with the product and the ideas it depends on. If these are clear, the design that follows will feel obvious rather than memorised.",
    },
    question: {
      lead: "Now read the question closely. Agree on what you are building, ask what is unclear, and work out the numbers before you draw anything.",
    },
    detail: {
      lead: "The design itself, from the big picture down to the code: components first, then one request end to end, then the parts interviewers push hardest on.",
    },
    qa: {
      lead: "The questions that come after the design, with model answers. Answer each one out loud before opening it.",
    },
    more: {
      lead: "What turns a good answer into a strong one: the decisions you rejected, how the system fails, and the signals of seniority.",
    },
  },
  sections: {
    "simple.x": {
      title: "Product in plain words",
      intro: "Who uses it, what a normal day looks like, and why it is harder than it seems.",
    },
    "concepts.x": {
      title: "Key concepts",
      intro: "The building blocks this design uses. Each one appears again in the answer.",
    },
    "brief.x": {
      title: "Brief and scope",
      intro: "The question exactly as the interviewer asks it, and what they want to learn from your answer.",
    },
    "clarify.x": {
      title: "Clarify the problem",
      prompt: "Before drawing anything, list the questions you would ask the interviewer.",
      intro: "The first five minutes. Each answer removes a guess from your design.",
    },
    "estimate.x": {
      title: "Estimate the scale",
      prompt: "Write down the numbers that will drive the design.",
      intro: "Say the arithmetic out loud. What matters is the order of magnitude and what it forces you to do.",
    },
    "arch.x": {
      title: "Architecture",
      prompt: "Sketch the components and arrows, then compare.",
    },
    "flow.x": {
      title: "Key flow, step by step",
      prompt: "Narrate one request end to end.",
    },
    "fe.x": {
      title: "Front end",
      prompt: "Sketch the screens, the client layers and every UI state the user can see.",
    },
    "api.x": {
      title: "Data model and APIs",
      prompt: "Write the schema or contract you would put on the board.",
      intro: "The tables and contracts that make the design concrete.",
    },
    "walk.x": {
      title: "Tested code, explained",
      intro: "The core of this design as working code, with what each part does and why.",
    },
    "deep.x": {
      title: "Hard parts, in depth",
      prompt: "Pick two areas the interviewer will push on and explain them.",
      intro: "Where interviewers spend the second half of the round.",
    },
    "follow.x": {
      title: "Follow-up questions",
      intro: "What the interviewer asks once the main design is on the board.",
      title2: "Front-end follow-ups",
      intro2: "Questions aimed at the client: rendering, state and devices.",
    },
    "crit.x": {
      title: "Incidents, probes and traps",
      intro: "Realistic production incidents and pointed probes, grouped by topic.",
    },
    "trade.x": {
      title: "Trade-offs and decisions",
      prompt: "State each decision, the alternative you rejected and why.",
      intro: "Every choice has a cost. Naming it is what interviewers listen for.",
    },
    "fail.x": {
      title: "Failure modes",
      prompt: "List what breaks and how the system degrades.",
      intro: "What breaks in production, and how the design keeps working when it does.",
      title2: "Performance and accessibility",
      intro2: "The client-side details that separate a demo from a product.",
    },
    "level.x": {
      title: "Senior versus principal",
      intro: "The same design, answered at two levels. Use the rubric to score yourself.",
    },
    "board.x": {
      title: "Whiteboard",
      intro: "Draw the design here, in this order. It stays in this browser.",
    },
  },
};
