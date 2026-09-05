export const SESSION_KEY = "open_pathway_demo_v1";
export const RULE_VERSION = "planning-demo-1.0";
export const text = (tc, en) => ({ tc, en });
const option = (id, tc, en) => ({ id, ...text(tc, en) });

export const questions = [
  {
    id: "goal",
    title: text("這一次，你想探索什麼？", "What would you like to explore?"),
    help: text(
      "選一個示例方向，作為這段規劃的起點。",
      "Choose a sample direction to begin your plan.",
    ),
    options: [
      option("learning", "學習與成長", "Learning and growth"),
      option("career", "職涯與技能", "Career and skills"),
      option("creative", "創作與個人項目", "Creative projects"),
    ],
  },
  {
    id: "stage",
    title: text("你希望從哪個階段開始？", "Where would you like to begin?"),
    help: text(
      "沒有標準答案，選最適合這次演示的選項。",
      "There is no right answer. Choose a scenario for this demo.",
    ),
    options: [
      option("explore", "還在探索可能性", "Exploring possibilities"),
      option("start", "已有方向，準備開始", "Ready to get started"),
      option("review", "已經行動，希望回顧", "Taking stock of progress"),
    ],
  },
  {
    id: "focus",
    title: text("你最想為哪件事留出空間？", "What deserves more space?"),
    help: text(
      "這一步會依照最初的方向調整。",
      "These choices adapt to your chosen direction.",
    ),
    options: [],
  },
  {
    id: "pace",
    title: text("什麼樣的節奏比較合適？", "What pace feels right?"),
    help: text(
      "以能持續的節奏，代替過度承諾。",
      "Choose a sustainable rhythm.",
    ),
    options: [
      option("gentle", "每週一次小練習", "One small practice each week"),
      option("steady", "每週兩至三次", "Two or three sessions a week"),
      option("focused", "短期集中投入", "A focused short sprint"),
    ],
  },
  {
    id: "support",
    title: text("你想如何回顧這段旅程？", "How would you like to reflect?"),
    help: text(
      "最後一步。選擇你偏好的回顧方式。",
      "One last step: choose a reflection style.",
    ),
    options: [
      option("journal", "用簡單日誌記錄", "Keep a short journal"),
      option("peer", "與同伴交流", "Reflect with a peer"),
      option("milestone", "按里程碑檢查", "Review at each milestone"),
    ],
  },
];

const focusOptions = {
  learning: [
    option("curiosity", "發現興趣", "Follow curiosity"),
    option("habit", "建立學習習慣", "Build a learning habit"),
    option("depth", "深入一個主題", "Explore a topic deeply"),
  ],
  career: [
    option("skills", "練習一項新技能", "Practice a new skill"),
    option("portfolio", "整理作品集", "Build a portfolio"),
    option("direction", "比較發展方向", "Compare possible directions"),
  ],
  creative: [
    option("idea", "把想法變成原型", "Turn an idea into a prototype"),
    option("finish", "完成一個小作品", "Finish a small project"),
    option("share", "分享與收集回饋", "Share and gather feedback"),
  ],
};

export function optionsFor(question, answers) {
  return question.id === "focus"
    ? focusOptions[answers.goal] || []
    : question.options;
}

export function sanitizeAnswers(input = {}) {
  const clean = {};
  for (const question of questions) {
    if (
      optionsFor(question, clean).some(
        (item) => item.id === input?.[question.id],
      )
    )
      clean[question.id] = input[question.id];
  }
  return clean;
}

export function makePlan(input) {
  const answers = sanitizeAnswers(input);
  if (Object.keys(answers).length !== questions.length) return null;
  const firstSteps = {
    learning: text(
      "選一個好奇的問題，花二十分鐘探索，再記下一個新發現。",
      "Pick one question, explore it for twenty minutes, and write down one discovery.",
    ),
    career: text(
      "選一項技能，用一個小練習展示它，並記錄你學到的東西。",
      "Choose one skill, demonstrate it in a small exercise, and document what you learned.",
    ),
    creative: text(
      "把想法縮成一個可以完成的小作品，先做第一版。",
      "Reduce your idea to one small, finishable project and make a first version.",
    ),
  };
  return { answers, version: RULE_VERSION, nextStep: firstSteps[answers.goal] };
}

export function resumeStep(input) {
  const clean = sanitizeAnswers(input);
  const missing = questions.findIndex((question) => !clean[question.id]);
  return missing < 0 ? questions.length - 1 : missing;
}

export const readinessQuestions = [
  text(
    "我能用一句話說明這次的目標。",
    "I can describe my goal in one sentence.",
  ),
  text("我已選出一個可以先做的小步驟。", "I have chosen one small first step."),
  text(
    "我知道這週可以投入多少時間。",
    "I know how much time I can offer this week.",
  ),
  text("我已準備好開始所需的工具。", "I have the tools I need to begin."),
  text("我知道可以向誰尋求回饋。", "I know where to ask for feedback."),
  text("我為回顧安排了一個時間。", "I have set aside time to reflect."),
  text(
    "我接受第一次嘗試可能不完美。",
    "I accept that my first attempt may be imperfect.",
  ),
  text("我知道可以按情況調整計劃。", "I know I can adjust my plan."),
];

export function readinessResult(answers) {
  if (
    !Array.isArray(answers) ||
    answers.length !== 8 ||
    !answers.every((a) => [0, 1, 2].includes(a))
  )
    return null;
  const dimensions = [[0, 1], [2], [3], [4, 5], [6, 7]].map((indices) =>
    Math.round(
      (indices.reduce((sum, i) => sum + answers[i], 0) / (indices.length * 2)) *
        100,
    ),
  );
  return {
    dimensions,
    score: Math.round((answers.reduce((sum, a) => sum + a, 0) / 16) * 100),
    gaps: answers.flatMap((answer, index) => (answer < 2 ? [index] : [])),
  };
}

export function readSession(storage) {
  try {
    const raw = JSON.parse(storage.getItem(SESSION_KEY));
    return {
      draft: sanitizeAnswers(raw?.draft),
      savedPlan: makePlan(raw?.savedPlan?.answers),
      readiness: readinessResult(raw?.readiness) ? raw.readiness : null,
      status: ["new", "reviewing", "done"].includes(raw?.status)
        ? raw.status
        : "new",
    };
  } catch {
    return { draft: {}, savedPlan: null, readiness: null, status: "new" };
  }
}

export function writeSession(storage, data) {
  try {
    // Re-validate before persisting. Arbitrary fields and personal data are never serialized.
    const safe = {
      draft: sanitizeAnswers(data.draft),
      savedPlan: makePlan(data.savedPlan?.answers),
      readiness: readinessResult(data.readiness) ? data.readiness : null,
      status: ["new", "reviewing", "done"].includes(data.status)
        ? data.status
        : "new",
    };
    storage.setItem(SESSION_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

export const knowledge = [
  {
    id: "start",
    q: text(
      "不知道從哪裡開始，怎麼辦？",
      "What if I don't know where to start?",
    ),
    a: text(
      "先選一個你願意探索的方向，再把它縮成二十分鐘內可以做的事情。完成一次小嘗試後，記錄你想繼續和想調整的部分。",
      "Choose a direction you are curious about, then reduce it to a twenty-minute action. After trying it, note what you would keep and what you would change.",
    ),
  },
  {
    id: "result",
    q: text("報告是怎樣產生的？", "How is the report generated?"),
    a: text(
      "這是透明的本機規則示例：你的方向決定起步建議，其他選項組成回顧清單。沒有 AI 呼叫、能力診斷、申請資格判定或成功率預測。",
      "This is a transparent local rules demo: your direction selects a first-step suggestion, and your other choices form a reflection checklist. It makes no AI calls, diagnoses, eligibility decisions, or success predictions.",
    ),
  },
  {
    id: "privacy",
    q: text("我的答案保存在哪裡？", "Where are my answers stored?"),
    a: text(
      "只在這個分頁的 sessionStorage 中保存預設選項代碼。重新整理可接續，瀏覽器一般會在分頁工作階段結束時移除；還原分頁可能還原資料，請用頁尾「清除演示資料」明確刪除。語言偏好另外保存在 localStorage。",
      "Only preset option codes are saved in this tab's sessionStorage. Refresh resumes your draft. Browsers normally clear it when the tab session ends, but restoring tabs may restore storage: use Clear demo data in the footer to explicitly remove it. Your language preference is stored separately in localStorage.",
    ),
  },
  {
    id: "check",
    q: text("準備度分數代表什麼？", "What does the readiness score mean?"),
    a: text(
      "每題「準備好了」得兩分、「部分準備」得一分、「還沒開始」得零分，再換算為百分比。它只方便你看見待準備事項，並不是經過驗證的心理或專業評估量表。",
      "Ready scores two points, Partly ready scores one, and Not yet scores zero; the total is converted to a percentage. It highlights preparation tasks and is not a validated psychological or professional assessment.",
    ),
  },
  {
    id: "workspace",
    q: text(
      "工作台會聯絡真實顧問嗎？",
      "Does the workspace contact an adviser?",
    ),
    a: text(
      "不會。工作台展示虛構的項目編號，以及你選擇儲存的本機演示結果。更改狀態和匯出只在本機運作，沒有郵件、訊息或雲端資料庫。",
      "No. The workspace shows fictional project IDs and local demo results you choose to save. Status changes and exports stay local; there is no email, messaging, or cloud database.",
    ),
  },
];
