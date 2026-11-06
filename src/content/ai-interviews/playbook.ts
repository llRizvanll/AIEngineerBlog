import type { Lesson } from "./types";

export const PLAYBOOK: Lesson[] = [
  {
    slug: "baseline",
    title: "Start with an honest baseline",
    stop: "Baseline",
    question: "Where do you actually stand today, with no help?",
    minutes: 10,
    plain: [
      "People tend to start by collecting resources. They'd do better to start with a test. Without a baseline you study what you enjoy, and you can't tell whether you're improving.",
      "Do one timed attempt per round, with AI off. It'll be uncomfortable, and that's the point: you want to find the gaps now, while you have time to fix them.",
      "Then use AI as a strict grader. It's far less shy about your weak spots than a friend would be, as long as you ask it to be.",
    ],
    words: [
      ["Baseline", "Your score before training, on a real task, unaided."],
      ["Competency", "One thing being scored. The common four are problem solving, code quality, verification and communication."],
      ["Rubric", "The list of what earns each score, written before you start."],
    ],
    story: [
      "Day 1. Meera spends 3 hours on four timed attempts. She'd assumed coding was her strength. Her scores: coding 2, RAG 1, evals 1, behavioural 4. The coding score surprises her, because she'd never had to work without an assistant open. That fact alone is worth the three hours.",
    ],
    canDo: ["Run a baseline for your own loop", "Score yourself using a rubric", "Have AI grade you strictly"],
    steps: [
      ["List your rounds", "From your recruiter, or the map in the rounds path."],
      ["Do one timed attempt per round, AI off", "Use the drills in the rounds path. Record yourself if you can."],
      ["Score each from 1 to 5", "1: stuck. 3: finished with gaps. 5: you'd hire yourself."],
      ["Have AI grade your work", "Then compare. Where it disagrees with you, look closely."],
      ["Write it down", "These numbers feed tomorrow's plan."],
    ],
    idea: [],
    prompts: [
      {
        title: "Strict grader",
        note: "Paste your problem, your work and your transcript.",
        text: "Act as a strict interviewer at a company with a high bar. Grade my attempt below, 1 to 5, on: problem solving, code quality, verification, communication.\nFor each, quote the evidence from my work. If you don't have evidence, say so, and score lower. Don't be encouraging, and don't rewrite my solution. End with the single change that would raise my score most.\n\n[problem]\n[my work]\n[transcript]",
      },
    ],
    code: [],
    failures: [
      ["Skipping it because you know you're not ready", "That's why it's useful."],
      ["Keeping AI open 'just in case'", "It measures you with AI, which isn't the baseline. You need both numbers in the end, but start with this one."],
      ["Believing a kind grader", "Models tend to flatter. Ask for evidence and strictness, and treat any score as a rough guide."],
    ],
    check: [
      ["Why have AI off for the baseline?", "Some rounds won't allow AI, and you need to see what you can do alone. Otherwise you can't tell your skill from the tool's."],
      ["Should you trust an AI's score?", "As a rough guide only. It's useful for finding gaps and quoting evidence, but it can flatter, so check it with people where you can."],
    ],
    drill: { title: "Do the baseline", minutes: 180, steps: ["Pick your rounds.", "Do one timed attempt for each, with AI off.", "Score them, then have AI grade them.", "Save the numbers for the next lesson."] },
    sources: ["karuha"],
    next: "Next: turn those numbers into a daily plan.",
  },
  {
    slug: "daily-loop",
    title: "The daily loop and your plan",
    stop: "The plan",
    question: "What should each day look like, and how do you use AI across it?",
    minutes: 15,
    plain: [
      "A good day of preparation has four parts: recall what you learned before, learn one thing, practise it under time pressure, and log what went wrong.",
      "AI fits differently in each part. It quizzes you during recall, explains during learning, stays out of the way while you practise except for hints, then grades you and helps write cards at the end.",
      "The plan itself is simple arithmetic. Your time goes where a round counts most and you score lowest. Some weeks you'll be surprised by what it says.",
    ],
    words: [
      ["Recall", "Producing an answer from memory, which is what strengthens it. Rereading doesn't do this."],
      ["Spaced review", "Seeing a card again just as you're starting to forget it."],
      ["Mock", "A full, timed round with no pauses, as close to the real thing as you can get."],
    ],
    story: [
      "Meera enters her scores with 21 days to go. The plan gives RAG and evals the most days, with coding next, and only a little to behavioural, which she was tempted to polish because it's comfortable. Every fourth training day is a full mock. The final five days have AI off.",
    ],
    canDo: ["Generate a plan from your scores", "Run the four-part day", "Adjust the plan after each mock"],
    steps: [
      ["Recall (15 minutes)", "Do your due cards from the revise page. No notes."],
      ["Learn (30 minutes)", "One lesson, or one concept. Ask AI to explain it, then explain it back to the AI and have it find the holes."],
      ["Practise (60 minutes)", "One timed task. Hint ladder only."],
      ["Review (15 minutes)", "Have AI grade your work. Add your misses to the ledger and make cards."],
      ["Update the plan weekly", "New scores change the numbers."],
    ],
    idea: [
      ["Short on time?", ["Thirty minutes a day still works: 10 minutes of cards, 20 minutes on one drill. Doing that every day beats one huge weekend. If you have under 5 days, skip planning and drill your weakest round."]],
      ["Explain it back", ["The strongest learning prompt is reversed. You explain a concept, and the AI asks about whatever you got wrong or left out. It shows you what you don't know far faster than reading does."]],
    ],
    prompts: [
      {
        title: "Explain it back",
        note: "Use this during the learning block.",
        text: "I'll explain [concept] to you as if you were a junior engineer. Don't correct me while I'm explaining. When I'm finished, ask me 3 questions about what I got wrong, left vague or skipped. Then tell me what a senior interviewer would still want to hear.",
      },
      {
        title: "Mock interviewer",
        note: "Answer as if it's real. Don't pause the clock.",
        text: "You are interviewing me for [role] at a company like [type of company]. This round is [round]. It lasts [minutes] minutes.\nAsk one question at a time, and keep replies short. Probe weak answers rather than moving on. Don't teach me or give answers during the round. When I say 'end', score me 1 to 5 on problem solving, code quality, verification and communication, quoting my words as evidence.",
      },
    ],
    code: ["ai-plan-split", "ai-plan-plan"],
    failures: [
      ["Practising only what's comfortable", "That's why the plan is arithmetic: it doesn't care what you enjoy."],
      ["Endless reading", "If a day had no timed practice, it barely counts."],
      ["Never updating the plan", "Your scores should change. If they don't, change the method."],
    ],
    check: [
      ["Why start with recall, not new material?", "Producing answers from memory is what makes them stick, and doing it first shows what's fading."],
      ["Why does a low score on a low-weight round get less time?", "The plan weighs both. A weak round that hardly matters still gets something, but a weak round that matters gets more."],
    ],
    drill: { title: "Make your plan", minutes: 15, steps: ["Write each round with its weight and your baseline score.", "Work out the days, by hand or with the code here.", "Put the mocks and AI-off days on a calendar.", "Do tomorrow's recall tonight, to set it up."] },
    sources: ["karuha", "epps"],
    next: "Next: the step most people skip. Checking that it's you who improved, and not just the tool.",
  },
  {
    slug: "ai-off",
    title: "The AI-off test",
    stop: "AI-off test",
    question: "How do you know the skill is yours, and that you're ready?",
    minutes: 10,
    plain: [
      "Practising with AI creates a risk: you feel fluent because you recognise good answers, though you can't produce them. It's called the illusion of knowing, and it shows up at the worst moment.",
      "The fix is simple, and it matches what one candidate described in a write-up about their Meta preparation: spend the last stretch without AI to check that the skills transferred.",
      "Then use a clear rule to decide you're ready, because nerves won't tell you. Three AI-off mocks, a decent average, no very weak skill, and a small gap between your scores with and without AI.",
    ],
    words: [
      ["Transfer", "Being able to do something in a new setting, without the support you learned it with."],
      ["Illusion of knowing", "Mistaking familiarity for ability. Rereading and watching solutions both cause it."],
      ["AI gap", "Your average score with AI, minus your average without it."],
    ],
    story: [
      "Day 17. Meera's AI-on mocks average 4.4, and her AI-off average is 3.3. The gate reports a gap of 1.1, with verification the weakest. She'd been letting the assistant suggest her test cases. For the next three days she writes every test herself first. By day 20 her AI-off average is 3.8, and the gap is 0.4. The gate says she's ready, and this time she believes it.",
    ],
    canDo: ["Run AI-off mocks", "Read your AI gap", "Decide from evidence that you're ready"],
    steps: [
      ["Turn AI off for the final quarter", "Close it fully, except during rounds that allow it, which you'll still rehearse with it."],
      ["Do at least three full mocks", "With a person if you can, as a human reacts differently."],
      ["Run the gate", "Or work it out by hand."],
      ["Fix what it finds", "Go back to the weakest skill, and don't redo the whole course."],
      ["Rest the day before", "Cards only."],
    ],
    idea: [
      ["If the round allows AI", ["You still want both skills. Rehearse the AI-allowed round with the assistant too, in the same conditions you'll have on the day, and keep a stretch of AI-off practice for the fundamentals. Reports say the assistant in the room may be less helpful than the one you're used to."]],
    ],
    code: ["ai-gate"],
    failures: [
      ["Only mocking with AI", "You'll have no idea how you do without it until the day you find out."],
      ["Only mocking with AI as the interviewer", "People interrupt, react and change direction. Do at least one with a person."],
      ["Waiting until you feel ready", "That feeling may never come, or it may be wrong. Use the numbers."],
    ],
    check: [
      ["What does a big AI gap tell you?", "The tool is doing work you can't yet do yourself. Find which skill has the biggest gap and practise it without help."],
      ["Why three mocks rather than one?", "A single good day could be luck. Three in a row is much better evidence."],
    ],
    drill: { title: "One full AI-off mock", minutes: 60, steps: ["Book a person if you can, or use the mock prompt once with typing only.", "Do the full round, with no help of any kind.", "Score all four competencies.", "Compare with your latest AI-on score."] },
    rubric: ["Completed three AI-off mocks", "AI-off average of at least 3.5", "No competency below 3", "AI gap of 0.5 or less"],
    sources: ["karuha", "hello"],
    next: "That's the plan. The final path is our own pick: build your own AI mock interviewer, and use it as your best interview story.",
  },
];
