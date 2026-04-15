const qualificationQuestions = [
  {
    key: "name",
    question: "Great — I can help with that. First, what’s your name?",
    validate: (value) => value.trim().length >= 2,
  },
  {
    key: "company",
    question: "Thanks. What’s your company or business name?",
    validate: (value) => value.trim().length >= 2,
  },
  {
    key: "website",
    question: "What’s your website address? If you don’t have one yet, just say 'none'.",
    validate: (value) => value.trim().length >= 2,
  },
  {
    key: "goal",
    question:
      "What would you like your Virtual Avatar to do for your business? For example: greet visitors, answer FAQs, qualify leads, or guide people to enquire.",
    validate: (value) => value.trim().length >= 5,
  },
  {
    key: "placement",
    question:
      "Where would you like to use it? For example: homepage, landing page, product page, WhatsApp campaign, or social media.",
    validate: (value) => value.trim().length >= 3,
  },
  {
    key: "timeline",
    question:
      "When are you hoping to get this live? For example: ASAP, this month, or just exploring.",
    validate: (value) => value.trim().length >= 3,
  },
  {
    key: "email",
    question: "What’s the best email address for us to contact you on?",
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  {
    key: "phone",
    question:
      "You can also leave your phone or WhatsApp number if you’d like, or type 'skip'.",
    validate: (value) =>
      value.trim().toLowerCase() === "skip" || value.trim().length >= 3,
  },
];

const yesResponses = ["yes", "yeah", "yep", "sure", "ok", "okay", "please", "go ahead", "let's do it", "lets do it"];
const noResponses = ["no", "no thanks", "not now", "later", "maybe later"];

export function createQualificationState() {
  return {
    active: false,
    invited: false,
    currentIndex: 0,
    answers: {},
    completed: false,
  };
}

export function startQualificationFlow(session) {
  session.qualification = session.qualification || createQualificationState();
  session.qualification.active = true;
  session.qualification.invited = false;
  session.qualification.currentIndex = 0;
  session.qualification.answers = {};
  session.qualification.completed = false;

  return qualificationQuestions[0].question;
}

export function markQualificationInvited(session) {
  session.qualification = session.qualification || createQualificationState();
  session.qualification.invited = true;
}

export function clearQualificationInvite(session) {
  session.qualification = session.qualification || createQualificationState();
  session.qualification.invited = false;
}

export function isQualificationActive(session) {
  return !!session?.qualification?.active && !session?.qualification?.completed;
}

export function isQualificationInvited(session) {
  return !!session?.qualification?.invited && !session?.qualification?.active;
}

export function isYesResponse(userMessage) {
  const text = userMessage.trim().toLowerCase();
  return yesResponses.includes(text);
}

export function isNoResponse(userMessage) {
  const text = userMessage.trim().toLowerCase();
  return noResponses.includes(text);
}

export function handleQualificationReply(session, userMessage) {
  const flow = session.qualification;

  if (!flow || !flow.active || flow.completed) {
    return null;
  }

  const currentQuestion = qualificationQuestions[flow.currentIndex];
  const value = userMessage.trim();

  if (!currentQuestion.validate(value)) {
    if (currentQuestion.key === "email") {
      return "That doesn’t look like a valid email address. Please enter your best email so we can contact you.";
    }

    return "Sorry, I didn’t quite get that. " + currentQuestion.question;
  }

  flow.answers[currentQuestion.key] = value;
  flow.currentIndex += 1;

  if (flow.currentIndex >= qualificationQuestions.length) {
    flow.active = false;
    flow.completed = true;

    return {
      done: true,
      answers: flow.answers,
      message:
        "Thanks — that gives us a clear picture of what you need. We’ll review your requirements and recommend the best setup for your business.",
    };
  }

  return qualificationQuestions[flow.currentIndex].question;
}

export function shouldOfferQualification(userMessage) {
  const text = userMessage.toLowerCase();

  const interestPhrases = [
    "i'm interested",
    "interested",
    "tell me more",
    "how does it work",
    "how can i use this",
    "can this work for my business",
    "for my website",
    "can you build",
    "want this",
    "need this",
    "demo",
    "quote",
    "pricing",
    "how much",
    "get started",
    "book a call",
  ];

  return interestPhrases.some((phrase) => text.includes(phrase));
}