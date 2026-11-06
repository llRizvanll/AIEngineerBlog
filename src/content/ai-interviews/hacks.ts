import type { Lesson } from "./types";

export const HACKS: Lesson[] = [
  {
    slug: "hint-ladder",
    title: "Never ask AI for the answer",
    stop: "The hint ladder",
    question: "How do you get unstuck with AI and still learn the problem?",
    minutes: 15,
    plain: [
      "Pasting a problem into a chatbot gives you a clean solution in ten seconds. Reading it feels like learning. Then the same problem comes back a week later and your mind goes blank.",
      "The reason is simple. Interviews test recall under pressure, and you only build recall by struggling to produce the answer yourself. Reading skips that struggle.",
      "So give the AI one job: hand over the smallest possible hint, and only after you've made a real attempt. Think of a ladder where each step gives away a little more, and you have to try again to reach the next one.",
    ],
    words: [
      ["Hint ladder", "A fixed order of help: a question first, then a nudge, then the technique's name, then pseudocode for one step."],
      ["Attempt", "What you tried and where it broke, written down. It's the price of the next hint."],
      ["System prompt", "Instructions that set the rules for a whole conversation. Here, the rule is: don't give me the solution."],
    ],
    story: [
      "Meera is our example candidate, and she's made up. She has an interview loop in 21 days: an AI-allowed coding round, an LLM screen, a RAG design round and an evals round. Every lesson in these paths follows her preparation.",
      "On day two, Meera gets stuck on a sliding window problem. Her first instinct is to ask for the answer. Instead, she writes two sentences about what she tried, and asks for one question that shows where her reasoning breaks. The question is about what happens when the window shrinks, and she finds the bug herself.",
    ],
    canDo: ["Set up a chat that won't give you the solution", "Climb the ladder one step at a time", "Say when to stop and read a real solution"],
    steps: [
      ["Try for 15 minutes first", "Paul Epps suggests about this long before asking. The number isn't magic, but it forces a real attempt."],
      ["Write your attempt down", "Two sentences: what you tried, and what went wrong. Often this alone unblocks you."],
      ["Ask for level 1", "A single question that exposes the flaw, with no hint."],
      ["Try again before climbing", "Change something first. A repeat of the same attempt earns nothing."],
      ["Stop at level 4", "If pseudocode for one step doesn't help, read a full solution. Then rebuild it tomorrow from memory."],
    ],
    idea: [
      ["Why the rule lives in code", ["Rules you hold in your head get dropped when you're tired. The small function below enforces them: no attempt, no hint. You can paste its prompt into any assistant, or wire it into the coach you build in the last path."]],
    ],
    prompts: [
      {
        title: "The ground rules",
        note: "Paste this at the start of a practice chat.",
        text: "You are coaching me through a coding interview problem.\nNever write the solution, corrected code, or solution pseudocode.\nAsk one question at a time.\nGive more revealing help only when I ask for the next level, and only after I describe a new attempt.\nDon't tell me I'm right unless I've explained why.",
      },
      {
        title: "Attack my approach",
        note: "Use this after you pick an approach, before you code.",
        text: "Here is my approach to the problem: [approach].\nAsk the one question most likely to expose a flaw in it. Don't give your own answer. Wait for my reply, then ask the next one.",
      },
    ],
    code: ["ai-hint-climb", "ai-hint-prompt"],
    failures: [
      ["Asking for 'just a small hint' repeatedly", "Five small hints add up to the solution. Each one must follow a new attempt."],
      ["The AI ignores your rules", "Long chats drift. Start a fresh chat for each problem and paste the ground rules again."],
      ["Never reading a solution", "Staying stuck for hours teaches nothing either. Level 4 has a clear exit."],
    ],
    check: [
      ["Why does reading an AI solution feel like learning when it isn't?", "Understanding a solution you're reading is much easier than producing one from nothing. Interviews test producing it, and only struggling to recall builds that."],
      ["What earns the next hint?", "A new attempt: you changed something and can say what broke. Asking again doesn't count."],
      ["When should you read the full solution?", "After the last level still leaves you stuck. Then close it and rebuild the solution from memory the next day."],
    ],
    drill: { title: "One problem, four rungs at most", minutes: 30, steps: ["Pick a medium problem you haven't seen.", "Try it for 15 minutes with no help.", "Use the ground rules prompt and climb only as far as you need.", "Write down which level you needed. Lower is better next time."] },
    sources: ["epps"],
    next: "Next: the hack that trains the skill AI rounds depend on most, which is reading code and spotting what's wrong.",
  },
  {
    slug: "plant-bugs",
    title: "Make AI plant bugs in good code",
    stop: "Bug planting",
    question: "How do you get faster at spotting mistakes in code you didn't write?",
    minutes: 15,
    plain: [
      "When AI writes the code, your job moves from typing to reviewing. Canva says it scores finding and fixing problems in AI-generated code. Most people have never practised that on purpose.",
      "This drill is simple. Take code you know works, change a few small things so it's wrong, and find the changes. Because you know exactly what was planted, you get an honest score.",
    ],
    words: [
      ["Mutation", "A tiny change to working code, such as turning <= into <. Mutation testing uses the same idea to check whether tests catch bugs."],
      ["False alarm", "A line you flagged that was actually fine. Too many waste time in a real round."],
      ["Seed", "A number that makes random choices repeatable, so the same seed plants the same bugs."],
    ],
    story: [
      "Meera can write code quickly, but she reads it slowly. She runs the planter on her own binary search with a seed of 42, and gets three bugs. She finds two in nine minutes and misses the third, a changed boundary. A week later, she finds all three in four minutes.",
    ],
    canDo: ["Plant bugs with a script or a prompt", "Review code against a checklist", "Track found, missed and false alarms"],
    steps: [
      ["Pick code you trust", "Your own solutions, or code with passing tests."],
      ["Plant three bugs", "Use the script here, or the prompt for harder logic bugs."],
      ["Set a timer and read", "Don't run anything. Read for boundaries, empty input, and wrong conditions."],
      ["Say each bug out loud", "Say what breaks and which input proves it."],
      ["Score it", "Compare against the planted list, then run the tests to confirm."],
    ],
    idea: [
      ["Script or prompt?", ["The script makes small syntax-level changes, which build speed. An AI prompt can plant subtle logic bugs, such as a cache that never refreshes. Use both, but keep the answer key hidden until you've finished."]],
    ],
    prompts: [
      {
        title: "Plant logic bugs",
        note: "Keep the answers in a separate message, or ask for them after your attempt.",
        text: "Here is working code:\n[code]\nMake a copy with 3 realistic bugs of the kind AI assistants often write: a missed edge case, a wrong assumption about input, and one performance trap. Keep it plausible, with no comments that give it away. Show only the changed code. List the bugs only when I say 'answers'.",
      },
    ],
    code: ["ai-plant", "ai-plant-score"],
    failures: [
      ["Running it right away", "Tests find the bug for you. Read first, then run."],
      ["Only planting easy bugs", "Mix in the prompt version, or you'll only get good at spotting syntax-level slips."],
    ],
    check: [
      ["Why use a seed?", "The same seed plants the same bugs, so you can repeat a drill and measure progress, and check your answers later."],
      ["What should you look at first when reading unfamiliar code?", "Boundaries, empty input, conditions, and anything that changes state. Most planted and real bugs live there."],
    ],
    drill: { title: "Three bugs against the clock", minutes: 15, steps: ["Plant 3 bugs in code you wrote this week.", "Read with no running for up to 10 minutes.", "Write down the line and the input that breaks it.", "Score it: found, missed, false alarms."] },
    rubric: ["Found all three", "No more than one false alarm", "Named an input that proves each bug"],
    sources: ["canva", "coditioning"],
    next: "Next: the hack that fixes how you sound, using a recording and a small script.",
  },
  {
    slug: "talk-track",
    title: "Measure how you sound",
    stop: "Talk track",
    question: "How do you know whether you explain things well under pressure?",
    minutes: 12,
    plain: [
      "Many people can solve a problem silently and then fall apart when they have to talk through it. Interviewers can only score what they hear.",
      "Recording yourself is unpleasant, and it's the fastest way to improve. Transcription tools now give you text with timestamps, which means you can measure things that were once only a feeling: long silences, filler words, and how often you give a reason.",
      "Coditioning's guide describes the same balance from the other side: weak candidates go silent for long stretches, or talk constantly without adding insight.",
    ],
    words: [
      ["Transcript segment", "A piece of text with a start and end time. Most speech-to-text tools can export these."],
      ["Reason word", "A word that signals why: because, so that, instead of, the risk is. A rough but useful marker."],
      ["Monologue", "A long stretch of talking with no pause for the interviewer to step in."],
    ],
    story: [
      "Meera records a 30-minute mock and runs the script. It reports 2 silences over 20 seconds, and just 0.4 reason words per minute. She'd been describing every line and explaining no decisions. For her next mock, she adds one rule: say why at every decision.",
    ],
    canDo: ["Record and transcribe a practice round", "Read the numbers and pick one thing to fix", "Think silently without losing the interviewer"],
    steps: [
      ["Record one timed round", "Use your phone. Speak as if someone were there."],
      ["Transcribe with timestamps", "Any speech-to-text tool that exports segments will do."],
      ["Run the numbers", "Look at silences, reasons, fillers, and the longest monologue."],
      ["Pick one fix", "Change one habit per round, or you won't be able to tell what helped."],
      ["Ask AI to grade the transcript", "Numbers show patterns, and a reader can tell you what was unclear."],
    ],
    idea: [
      ["Treat the numbers as prompts", ["The limits in this script are starting points that we picked, and no study backs them. Use them to spot your own patterns and compare one week with the next."]],
    ],
    prompts: [
      {
        title: "Grade my explanation",
        note: "Paste the transcript. Remove anything private first.",
        text: "Below is a transcript of me solving a coding problem out loud. Act as a strict interviewer. Don't comment on the code's correctness.\nFind: 1) moments where I said what I did but not why, 2) claims I didn't back up, 3) places where you'd have lost track. Quote my exact words for each. Finish with the one habit to change first.\n\n[transcript]",
      },
    ],
    code: ["ai-talk", "ai-talk-advice"],
    failures: [
      ["Fixing everything at once", "You'll sound stiff. One habit per round."],
      ["Talking to fill silence", "Silence is fine when you've announced it: 'Give me a minute to check the edge cases.'"],
      ["Reciting memorised phrases", "Interviewers notice. Reason words should come from reasons you actually have."],
    ],
    check: [
      ["What's the difference between narration and a reason?", "Narration says what you're doing: 'now I loop over the list.' A reason says why: 'I loop once because the input is sorted, so I don't need a nested loop.'"],
      ["How do you think quietly without losing the interviewer?", "Say what you're about to check and for how long, then go quiet. Report back when you're done."],
    ],
    drill: { title: "Record one round", minutes: 35, steps: ["Solve one problem out loud for 25 minutes and record it.", "Transcribe it, and run the numbers or read it through.", "Write down one habit to change.", "Do a 5-minute redo of the worst stretch."] },
    sources: ["coditioning", "karuha"],
    next: "Next: read the job post the way an interviewer wrote it, then let your resume get cross-examined.",
  },
  {
    slug: "cross-examine",
    title: "Reverse the job post, then cross-examine your resume",
    stop: "Cross-examination",
    question: "How do you find out what they'll ask, and whether your own stories hold up?",
    minutes: 15,
    plain: [
      "A job post is a list of what the team worries about. Count what it mentions and you get a rough map of where the questions will come from.",
      "Your resume is the other source. Anything on it is fair game, and follow-ups go deep. An interviewer at Kapwing described a candidate with a polished, keyword-heavy resume who was fluent at first, then couldn't explain why a load spike happened, or what data a claimed feature handled.",
      "Here's the rule that matters: use AI to pressure-test your real experience, and never to invent experience. If you can't defend a line through five follow-ups, fix your understanding or remove the line.",
    ],
    words: [
      ["Demand", "How often a skill shows up in the post. A rough signal, not a fact."],
      ["Priority", "Demand multiplied by how weak you are at it. That's what you study first."],
      ["Follow-up ladder", "Why, how, what broke, what would you change, what would it cost? Interviewers walk down it."],
    ],
    story: [
      "Meera's job post mentions retrieval four times, evals three times and agents once. She'd planned to spend the week on agents. The numbers move RAG to the top. Then she pastes one resume line about a search feature into a cross-examination prompt, and by the third question she can't say what recall it reached. She goes and finds out.",
    ],
    canDo: ["Turn a job post into a study order", "Survive five follow-ups on any resume line", "Spot resume lines to fix or remove"],
    steps: [
      ["Paste the post into the mapper", "Or ask AI to list the skills, with quotes from the post."],
      ["Score yourself from 1 to 5", "Be honest. A later mock will correct you anyway."],
      ["Study by priority", "Demand times weakness tells you where a day pays off most."],
      ["Cross-examine each resume line", "One line at a time, up to five follow-ups."],
      ["Fix the gaps with facts", "Look up the real numbers from your work. Don't let AI supply any."],
    ],
    idea: [
      ["Don't let AI write your story", ["A model will happily produce a stronger-sounding story, with invented numbers. That's how a candidate ends up silent at the follow-up. Ask it for questions, and keep the answers yours."]],
    ],
    prompts: [
      {
        title: "Cross-examine one line",
        note: "Run this for every line you'd be nervous about.",
        text: "You are a skeptical senior engineer interviewing me. Here is one line from my resume:\n[line]\nAsk one follow-up at a time. Go deeper with each: why that approach, how it worked, what broke, what you measured, what you'd change. Don't help me or suggest answers. After 5 questions, list exactly where my answers got vague.",
      },
      {
        title: "Read the job post like the hiring manager",
        note: "Ask for quotes, so you can check that it didn't make things up.",
        text: "Here is a job post:\n[post]\nList the skills it really cares about, ranked. For each, quote the words that show it and write the two interview questions most likely to test it. Say which skills are only implied. Don't guess the company's process.",
      },
    ],
    code: ["ai-job-map", "ai-job-gaps"],
    failures: [
      ["Treating the map as the truth", "It's a count of words. Ask your recruiter what the rounds are, too."],
      ["Keeping a line you can't defend", "A confident line followed by silence does more damage than leaving the line out."],
    ],
    check: [
      ["Why multiply demand by weakness?", "A skill you've mastered needs no time however often it's mentioned, and one the job never mentions isn't worth much either. The product points to where a day pays off."],
      ["What should you never ask AI to do to your resume?", "Add experience or numbers you don't have. You'll be asked about them."],
    ],
    drill: { title: "One line, five follow-ups", minutes: 15, steps: ["Pick the resume line you're least sure about.", "Run the cross-examination prompt, answering out loud.", "Write down where you got vague.", "Find the real facts and answer again."] },
    sources: ["kapwing"],
    next: "Next: the habit that ties the other hacks together. Every miss gets written down.",
  },
  {
    slug: "mistake-ledger",
    title: "Turn every miss into a card",
    stop: "Mistake ledger",
    question: "How do you stop making the same mistake in every mock?",
    minutes: 10,
    plain: [
      "Most people practise until they feel tired, without tracking what went wrong. So tomorrow's session is the same as today's, and the same mistakes come back.",
      "A ledger fixes that. Each miss gets one row: the topic, the cause, a question, and an answer. The cause matters most. 'Failed two sum' tells you nothing, while 'didn't test empty input' describes a habit you can change.",
      "AI helps twice here. It can read your mock and name the cause, and it can turn a miss into a clean flashcard. Spaced review then brings the card back just as you're about to forget.",
    ],
    words: [
      ["Cause", "The habit behind the miss, in a few words: off by one, skipped clarifying, no test before moving on."],
      ["Spaced repetition", "Reviewing at growing gaps, such as 1, 3 and 7 days. The revise page on this site does it for you."],
      ["Half-life", "How long a miss takes to lose half its weight. Here, 7 days: old misses matter less unless they come back."],
    ],
    story: [
      "After a week, Meera's ledger has 19 rows. The topics are all over the place, but one cause shows up six times: 'accepted AI output without running it'. That's the most useful thing she's learned all week, and no list of topics would have shown it.",
    ],
    canDo: ["Log a miss with a real cause", "Find your weakest topic and your most repeated habit", "Export misses as flashcards"],
    steps: [
      ["Log straight after each session", "Two minutes, while you still remember."],
      ["Name the cause, not the problem", "Ask AI if you can't tell: 'What habit caused this?'"],
      ["Write one question per miss", "One fact per card. Long cards don't get remembered."],
      ["Start each day from the ledger", "Practise your weakest topic first."],
      ["Review the causes weekly", "A repeated cause gets a rule, such as 'run it before I accept it'."],
    ],
    idea: [
      ["Spreadsheet first", ["A spreadsheet with four columns is enough. The code below shows what's worth calculating once you have rows: recent misses count more, and repeated causes stand out."]],
    ],
    prompts: [
      {
        title: "Turn a miss into a card",
        note: "Check the answer yourself before you save it.",
        text: "I got this wrong in practice:\n[problem and what I did]\nReply with: 1) the habit that caused it, in under 6 words, 2) one flashcard question that tests the idea, not this exact problem, 3) an answer of at most 2 sentences. If you're unsure of a fact, say so.",
      },
    ],
    code: ["ai-ledger-weakest", "ai-ledger-anki"],
    failures: [
      ["Saving cards you never checked", "Models make confident errors. Check each card before it goes in your deck."],
      ["Too many cards", "A 300-card backlog gets abandoned. Add only what you actually missed."],
    ],
    check: [
      ["Why log the cause separately from the topic?", "Topics change every day, while habits repeat across topics. Fixing one habit improves every round."],
      ["Why make old misses count less?", "If you stopped repeating a mistake, it's probably fixed. Recent misses show your weakness today."],
    ],
    drill: { title: "Start your ledger", minutes: 10, steps: ["Open a spreadsheet with topic, cause, question, answer.", "Add your last three misses.", "Add your first card to the revise deck, or to Anki.", "Write the one rule your most common cause suggests."] },
    sources: ["karuha"],
    next: "Next: where the line sits, and why the most viral hack of all is the one to avoid.",
  },
  {
    slug: "the-line",
    title: "The hacks that get you rejected",
    stop: "Where the line is",
    question: "Which uses of AI are fair, and how do you find out for your interview?",
    minutes: 8,
    plain: [
      "The most viral hack online is a hidden app that listens to a live interview and feeds you answers on screen. Interview Coder and Cluely became famous for it. We don't teach these tools, and we suggest you stay away from them. Here's why, in practical terms.",
      "First, the rule. Reporting describes Amazon asking candidates to confirm they won't use unauthorised tools, and disqualification when they're caught. Rules vary and change: Google was reported as disallowing AI in February 2026, then in May as planning a pilot of one AI-allowed round. What matters is what your interview allows.",
      "Second, it often fails anyway. Coding platforms check for copying and similarity, some firms are bringing rounds back on site, and follow-up questions expose answers you don't own. Even if you pass, you've got a job you may not be able to do.",
      "The good news: more companies now invite AI into the room. Every skill in these paths works there openly, and you can practise them anywhere.",
    ],
    words: [
      ["AI-allowed round", "A round where the company provides or permits an assistant. You're expected to use it, and you're scored on how."],
      ["Unauthorised tool", "Any help the company hasn't allowed for that round, even if another round permits it."],
      ["Disclosure", "Telling the company what you're using. If it's allowed, there's nothing to hide."],
    ],
    story: [
      "A friend sends Meera a link to a hidden overlay. She asks her recruiter one question instead: 'What tools can I use in each round?' The answer: an assistant in round two, nothing in round one. She now knows exactly what to practise for each, and has nothing to hide in either.",
    ],
    canDo: ["Tell fair preparation from live cheating", "Ask your recruiter about tools", "Use AI freely where it's allowed"],
    steps: [
      ["Ask before the interview", "It's a normal question, and recruiters answer it often."],
      ["Treat each round separately", "One AI-allowed round doesn't cover the others."],
      ["If unsure, don't", "Or ask. A short email is cheap."],
      ["Prepare with AI as much as you like", "Nobody restricts how you practise."],
    ],
    idea: [],
    table: {
      title: "Where each use sits",
      note: "A general guide. Your company's stated rules come first.",
      head: ["Use", "Fair?", "Why"],
      rows: [
        ["Mock interviews, hints, flashcards", "Yes", "This is practice, and it happens before the interview."],
        ["Polishing your resume's wording", "Yes", "As long as every claim is true and you can defend it."],
        ["The assistant in an AI-allowed round", "Yes", "It's offered, and you're scored on using it well."],
        ["Take-home with AI", "Check", "Many allow it and ask you to say how. Read the instructions."],
        ["Hidden overlay in a no-AI round", "No", "It breaks the rules, and can get you disqualified."],
        ["Someone else's answers in your ear", "No", "Same rule. A person or a model makes no difference."],
        ["Inventing experience", "No", "It's dishonest, and follow-ups usually expose it."],
      ],
    },
    prompts: [
      {
        title: "Ask your recruiter",
        note: "Send this as it is, and adjust the details.",
        text: "Hi [name], thanks for the details on my interview loop. Could you tell me which tools I can use in each round? In particular, whether AI assistants are allowed, and if a round provides one, which one. I want to prepare the right way for each.",
      },
    ],
    code: [],
    failures: [
      ["Assuming one company's rule applies to all", "Canva expects AI in a round. Others forbid it. Ask."],
      ["Thinking only of getting caught", "The bigger cost is arriving at a job, or a final on-site round, with skills you never built."],
    ],
    check: [
      ["Is using AI to prepare cheating?", "No. How you practise is up to you. The rules cover what happens during the assessment."],
      ["What do you do when the rules aren't clear?", "Ask the recruiter before the round. If you can't ask, assume no help is allowed."],
    ],
    drill: { title: "Know your rules", minutes: 5, steps: ["List each round in your next loop.", "Write what's allowed in each, or 'unknown'.", "Send the recruiter message for any unknowns."] },
    sources: ["builtin", "cnbc", "google", "canva"],
    next: "That's the hacks path. Next, the rounds themselves: what each one tests, and how to practise it.",
  },
];
