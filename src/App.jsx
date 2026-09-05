import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Plant,
  BookOpen,
  Path,
  List,
  X,
  ShieldCheck,
  Download,
  ArrowUpRight,
} from "@phosphor-icons/react";
import {
  getInitialSiteLanguage,
  localizedPath,
  setSiteLanguagePreference,
  SITE_LANGUAGE_KEY,
} from "./siteLanguage.js";
import {
  questions,
  optionsFor,
  sanitizeAnswers,
  makePlan,
  resumeStep,
  readinessQuestions,
  readinessResult,
  readSession,
  writeSession,
  SESSION_KEY,
  knowledge,
  text,
} from "./model.js";

const routes = [
  ["/assessment", "探索評估", "Explore"],
  ["/readiness", "準備度自查", "Readiness"],
  ["/qa", "知識手冊", "Field notes"],
  ["/staff", "演示工作台", "Workspace"],
];
const dimensionLabels = [
  text("方向", "Direction"),
  text("時間", "Time"),
  text("工具", "Tools"),
  text("回饋", "Feedback"),
  text("心態", "Mindset"),
];
const stageLabels = [
  text("探索方向", "Find a direction"),
  text("建立節奏", "Build a rhythm"),
  text("開始實踐", "Make a start"),
  text("回顧調整", "Reflect and refine"),
];

function browserStorage(kind) {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function download(data, filename) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ExportButton({ data, filename, label, t }) {
  const dialog = useRef(null);
  return (
    <>
      <button
        className="button secondary"
        onClick={() => dialog.current.showModal()}
      >
        <Download size={18} />
        {label}
      </button>
      <dialog
        className="export-dialog"
        ref={dialog}
        aria-label={t("匯出 JSON", "Export JSON")}
      >
        <h2>{t("你的演示資料", "Your demo data")}</h2>
        <p>
          {t(
            "下載 JSON，或直接選取並複製下方內容。部分內嵌瀏覽器會阻擋檔案下載。",
            "Download the JSON, or select and copy the content below. Some embedded browsers block file downloads.",
          )}
        </p>
        <textarea
          aria-label="JSON"
          readOnly
          value={JSON.stringify(data, null, 2)}
          onFocus={(event) => event.target.select()}
        />
        <div className="action-row">
          <button className="button" onClick={() => download(data, filename)}>
            <Download size={18} />
            {t("下載 JSON", "Download JSON")}
          </button>
          <button
            className="button secondary"
            onClick={() => dialog.current.close()}
          >
            {t("關閉", "Close")}
          </button>
        </div>
      </dialog>
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState(() =>
    getInitialSiteLanguage({ storage: browserStorage("localStorage") }),
  );
  const [menu, setMenu] = useState(false);
  const [session, setSession] = useState(() =>
    readSession(browserStorage("sessionStorage")),
  );
  const [notice, setNotice] = useState("");
  const [epoch, setEpoch] = useState(0);
  const rawPath = window.location.pathname.replace(/\/$/, "") || "/";
  const path = rawPath === "/renewal-check" ? "/readiness" : rawPath;
  const t = (tc, en) => (lang === "tc" ? tc : en);
  const pick = (value) => value[lang];
  const href = (route) => localizedPath(route, lang);
  const update = (patch) => {
    const next = { ...session, ...patch };
    setSession(next);
    if (!writeSession(browserStorage("sessionStorage"), next))
      setNotice(
        t(
          "瀏覽器儲存不可用；資料只在本頁記憶體內保留。",
          "Browser storage is unavailable; changes last only on this page.",
        ),
      );
  };
  const clear = () => {
    let cleared = true;
    for (const [kind, key] of [
      ["sessionStorage", SESSION_KEY],
      ["localStorage", SITE_LANGUAGE_KEY],
    ]) {
      try {
        const storage = browserStorage(kind);
        if (storage) storage.removeItem(key);
      } catch {
        cleared = false;
      }
    }
    setSession({ draft: {}, savedPlan: null, readiness: null, status: "new" });
    setEpoch((value) => value + 1);
    setNotice(
      cleared
        ? t(
            "本機演示資料與儲存的語言偏好已清除。",
            "Local demo data and the saved language preference have been cleared.",
          )
        : t(
            "本頁已重設；瀏覽器拒絕刪除儲存，請在網站設定中清除資料。",
            "This page was reset; storage deletion was blocked. Clear site data in your browser settings.",
          ),
    );
  };
  useEffect(() => {
    const label = routes.find(([route]) => route === path)?.[
      lang === "tc" ? 1 : 2
    ];
    document.title = `${label || t("把下一步，留給可能", "Make room for what comes next")} | Open Pathway`;
    document.documentElement.lang = lang === "tc" ? "zh-Hant" : "en";
  }, [lang, path]);
  const context = { t, pick, href, lang, session, update };
  return (
    <>
      <a className="skip-link" href="#main">
        {t("跳至主要內容", "Skip to content")}
      </a>
      <div className="demo-bar">
        <span className="status-dot" />
        {t(
          "獨立開源作品 · 虛構情境 · 所有操作僅在本機演示",
          "INDEPENDENT OPEN-SOURCE DEMO · FICTIONAL SCENARIOS · LOCAL ONLY",
        )}
      </div>
      <header className="site-header">
        <a className="brand" href={href("/")} aria-label="Open Pathway home">
          <Compass size={34} weight="thin" />
          <span>
            OPEN PATHWAY
            <small>{t("留白，讓可能發生", "ROOM FOR POSSIBILITY")}</small>
          </span>
        </a>
        <nav
          className={menu ? "navigation is-open" : "navigation"}
          aria-label={t("主要導覽", "Main navigation")}
        >
          {routes.map(([route, tc, en]) => (
            <a
              key={route}
              href={href(route)}
              aria-current={path === route ? "page" : undefined}
            >
              {t(tc, en)}
              {route === "/staff" && <ArrowUpRight size={14} />}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="language"
            onClick={() => {
              const next = lang === "tc" ? "en" : "tc";
              setLang(next);
              setSiteLanguagePreference(next, {
                storage: browserStorage("localStorage"),
              });
            }}
            aria-label="Switch language"
          >
            {lang === "tc" ? "EN" : "繁"}
          </button>
          <button
            className="menu-button"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={t("切換選單", "Toggle menu")}
          >
            {menu ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </header>
      <main id="main" key={epoch}>
        {path === "/" ? (
          <Home {...context} />
        ) : path === "/assessment" ? (
          <Assessment {...context} />
        ) : ["/readiness", "/renewal-check"].includes(path) ? (
          <Readiness {...context} />
        ) : path === "/qa" ? (
          <Knowledge {...context} />
        ) : path === "/staff" ? (
          <Workspace {...context} />
        ) : (
          <section className="page-wrap">
            <p className="eyebrow">404</p>
            <h1>{t("這條路徑還未開放", "This path is not here yet")}</h1>
            <a className="button" href={href("/")}>
              {t("回到首頁", "Return home")}
            </a>
          </section>
        )}
      </main>
      <footer>
        <div>
          <a className="footer-brand" href={href("/")}>
            OPEN PATHWAY
          </a>
          <p>
            {t(
              "一份關於探索、選擇與成長的開源作品。",
              "An open-source study in exploration, choice, and growth.",
            )}
          </p>
        </div>
        <div className="footer-links">
          <a href={href("/qa#privacy")}>
            {t("資料與私隱", "Data and privacy")}
          </a>
          <button onClick={clear}>
            {t("清除演示資料", "Clear demo data")}
          </button>
          <span>© 2026 Open Pathway contributors · MIT</span>
        </div>
      </footer>
      <div className="notice" role="status">
        {notice && (
          <>
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label={t("關閉通知", "Dismiss notice")}
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>
    </>
  );
}

function Home({ t, pick, href }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> A FIELD GUIDE TO YOUR NEXT CHAPTER
          </p>
          <h1>
            {t(
              <>
                把下一步，
                <br />
                留給<span className="accent">可能。</span>
              </>,
              <>
                Make room
                <br />
                for{" "}
                <em>
                  what comes
                  <br />
                  next.
                </em>
              </>,
            )}
          </h1>
          <p className="hero-description">
            {t(
              "不用一次想清楚整段旅程。從一個問題、一份小計劃開始，慢慢找到屬於自己的方向。",
              "You don't need to map the whole journey. Begin with a question, a small plan, and a little room to find your own direction.",
            )}
          </p>
          <div className="hero-actions">
            <a className="button" href={href("/assessment")}>
              {t("探索我的下一步", "Explore my next step")}
              <ArrowRight size={19} />
            </a>
            <a className="text-link" href="#approach">
              {t("了解這份作品", "Meet the project")}
              <ArrowDown />
            </a>
          </div>
          <div className="hero-facts">
            <span>01 — {t("選擇方向", "CHOOSE")}</span>
            <span>02 — {t("建立計劃", "PLAN")}</span>
            <span>03 — {t("回顧成長", "REFLECT")}</span>
          </div>
        </div>
        <figure className="hero-art">
          <img
            src="/images/pathway.svg"
            alt={t(
              "原創幾何插畫：一扇拱門通向蜿蜒的小徑",
              "Original geometric illustration of an archway opening onto a winding path",
            )}
            fetchPriority="high"
          />
          <figcaption>
            <span>THE ART OF BEGINNING</span>
            <span>VOL. 01 / OPEN PATHWAY</span>
          </figcaption>
        </figure>
      </section>
      <section className="intro-strip">
        <span>SMALL STEPS. WIDER HORIZONS.</span>
        <p>
          {t(
            "讓複雜的選擇，成為可以開始的小事。",
            "Make a complex choice small enough to begin.",
          )}
        </p>
        <Compass size={40} weight="thin" />
      </section>
      <section className="section" id="approach">
        <div className="section-heading">
          <p className="eyebrow">01 / THE APPROACH</p>
          <h2>
            {t(
              "先理解自己，再選擇方向。",
              "Understand first. Choose with intention.",
            )}
          </h2>
          <p>
            {t(
              "Open Pathway 是獨立的前端作品，以虛構規劃情境探索清晰、友善的數位體驗。你可以完整走過問卷、閱讀結果，再到工作台回顧。",
              "Open Pathway is an independent frontend project exploring thoughtful digital experiences through fictional planning scenarios. Walk through a questionnaire, read your results, and reflect in a local workspace.",
            )}
          </p>
        </div>
        <div className="principles">
          {[
            [
              Compass,
              "從好奇開始",
              "Begin with curiosity",
              "將大問題拆成容易回答的小問題。",
              "Turn a big question into smaller, approachable choices.",
            ],
            [
              Plant,
              "為成長留白",
              "Leave room to grow",
              "依照選擇調整下一步，保留改變方向的自由。",
              "Adapt the next step to your choices, with room to change your mind.",
            ],
            [
              ShieldCheck,
              "讓資料留在身邊",
              "Keep your data close",
              "只有預設選項，沒有姓名、聯絡資料或上傳文件。",
              "Preset choices only, without names, contact details, or uploads.",
            ],
          ].map(([Icon, tc, en, descTc, descEn], i) => (
            <article key={en}>
              <span className="index">0{i + 1}</span>
              <Icon size={34} weight="thin" />
              <h3>{t(tc, en)}</h3>
              <p>{t(descTc, descEn)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="journey section">
        <div className="section-heading">
          <p className="eyebrow">02 / A CONTINUOUS JOURNEY</p>
          <h2>
            {t("不是一次答案，是持續的對話。", "A continuing conversation.")}
          </h2>
        </div>
        <div className="journey-steps">
          {stageLabels.map((label, i) => (
            <article key={i}>
              <span>0{i + 1}</span>
              <h3>{pick(label)}</h3>
              <p>
                {t(
                  [
                    "選擇值得你探索的問題。",
                    "找到生活容得下的步調。",
                    "完成一件可以看見的小事。",
                    "記下發現，調整下一步。",
                  ][i],
                  [
                    "Choose a question worth exploring.",
                    "Find a pace that fits your life.",
                    "Finish one small, visible thing.",
                    "Notice, learn, and adjust.",
                  ][i],
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="feature section">
        <div className="feature-art" aria-hidden="true">
          <Path size={100} weight="thin" />
          <span>
            YOUR NEXT
            <br />
            <em>CHAPTER</em>
          </span>
          <small>A LITTLE CLARITY GOES A LONG WAY</small>
        </div>
        <div>
          <p className="eyebrow">03 / FROM QUESTIONS TO CLARITY</p>
          <h2>
            {t(
              "五個問題，\n一個可以開始的方向。",
              "Five questions.\nOne place to begin.",
            )}
          </h2>
          <p>
            {t(
              "依照你的方向提供不同選項，將答案整理成透明、可解釋的起步計劃。隨時返回修改，或在這個分頁接續草稿。",
              "Adaptive choices lead to a transparent first-step plan. Revisit an answer at any time, or resume your draft in this tab.",
            )}
          </p>
          <a className="button" href={href("/assessment")}>
            {t("開始探索", "Start exploring")}
            <ArrowRight size={18} />
          </a>
          <a className="text-link block" href={href("/readiness")}>
            {t(
              "已有方向？檢查準備度",
              "Have a direction? Check your readiness",
            )}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="quote-section">
        <p className="eyebrow">A NOTE TO THE EXPLORER</p>
        <blockquote>
          {t(
            "「不必看見整條路，\n也可以開始走第一步。」",
            "“You can take a first step\nwithout seeing the whole path.”",
          )}
        </blockquote>
        <p>{t("— 本項目的創作理念", "— A guiding thought for this project")}</p>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">04 / FIELD NOTES</p>
          <h2>
            {t("把疑問放下來，慢慢讀。", "A little space for your questions.")}
          </h2>
        </div>
        <div className="notes-grid">
          {knowledge.slice(0, 3).map((note, i) => (
            <a key={note.id} href={href(`/qa#${note.id}`)}>
              <BookOpen size={28} weight="thin" />
              <small>FIELD NOTE / 0{i + 1}</small>
              <h3>{pick(note.q)}</h3>
              <span>
                {t("閱讀手冊", "Read the note")}
                <ArrowUpRight size={20} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="end-cta">
        <p className="eyebrow">THE NEXT STEP IS YOURS</p>
        <h2>{t("從今天的一點好奇開始。", "Begin with a little curiosity.")}</h2>
        <a className="button light" href={href("/assessment")}>
          {t("打開我的新篇章", "Open my next chapter")}
          <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}

function ArrowDown() {
  return <span aria-hidden="true">↓</span>;
}

function Assessment({ t, pick, href, session, update }) {
  const [step, setStep] = useState(() => resumeStep(session.draft));
  const [complete, setComplete] = useState(false);
  const [saved, setSaved] = useState(false);
  const heading = useRef(null);
  const question = questions[step];
  const plan = makePlan(session.draft);
  const move = (next) => {
    setStep(next);
    setTimeout(() => heading.current?.focus(), 0);
  };
  if (complete && plan)
    return (
      <section className="page-wrap narrow">
        <p className="eyebrow">YOUR NEXT CHAPTER / DEMO REPORT</p>
        <h1>{t("你的起步計劃", "Your first-step plan")}</h1>
        <p className="page-intro">
          {t(
            "這不是能力評分，而是一份由你的選擇整理出的行動筆記。",
            "A practical note based on your choices, rather than a capability score.",
          )}
        </p>
        <article className="result-card">
          <span className="tag">
            {t("建議的第一步", "SUGGESTED FIRST STEP")}
          </span>
          <h2>{pick(plan.nextStep)}</h2>
          <p>
            {t("因為你選擇了：", "Because you chose: ")}
            {pick(questions[0].options.find((o) => o.id === plan.answers.goal))}
          </p>
        </article>
        <dl className="answer-list">
          {questions.map((q) => (
            <div key={q.id}>
              <dt>{pick(q.title)}</dt>
              <dd>
                {pick(
                  optionsFor(q, plan.answers).find(
                    (o) => o.id === plan.answers[q.id],
                  ),
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="small-note">
          {t("規則版本", "Rule version")}: {plan.version} ·{" "}
          {t(
            "教學演示，非專業建議",
            "Educational demo, not professional advice",
          )}
        </p>
        <div className="action-row">
          <button
            className="button"
            onClick={() => {
              update({ savedPlan: plan, status: "new" });
              setSaved(true);
            }}
          >
            {saved ? <Check size={18} /> : <ArrowRight size={18} />}
            {saved
              ? t("已加入本機工作台", "Added to local workspace")
              : t("加入本機工作台", "Add to local workspace")}
          </button>
          <ExportButton
            data={{ demo: true, ...plan }}
            filename="open-pathway-plan.json"
            label={t("匯出計劃", "Export plan")}
            t={t}
          />
        </div>
        <div className="action-row">
          <button
            className="text-link"
            onClick={() => {
              setComplete(false);
              setSaved(false);
              move(0);
            }}
          >
            {t("修改答案", "Edit answers")}
          </button>
          <a className="text-link" href={href("/staff")}>
            {t("前往工作台", "Open workspace")}
            <ArrowUpRight size={18} />
          </a>
          <a className="text-link" href={href("/readiness")}>
            {t("檢查準備度", "Check readiness")}
          </a>
        </div>
      </section>
    );
  return (
    <section className="page-wrap narrow">
      <p className="eyebrow">
        EXPLORATION / {String(step + 1).padStart(2, "0")} OF 05
      </p>
      <div
        className="progress-track"
        aria-label={t("評估進度", "Assessment progress")}
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={0}
        aria-valuemax={5}
      >
        <span style={{ width: `${(step + 1) * 20}%` }} />
      </div>
      <h1 ref={heading} tabIndex={-1}>
        {pick(question.title)}
      </h1>
      <p className="page-intro">{pick(question.help)}</p>
      <fieldset className="options">
        <legend className="sr-only">{pick(question.title)}</legend>
        {optionsFor(question, session.draft).map((option, i) => (
          <label
            key={option.id}
            className={
              session.draft[question.id] === option.id
                ? "option selected"
                : "option"
            }
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={session.draft[question.id] === option.id}
              onChange={() =>
                update({
                  draft: sanitizeAnswers({
                    ...session.draft,
                    [question.id]: option.id,
                  }),
                })
              }
            />
            <span className="option-index">0{i + 1}</span>
            <span>{pick(option)}</span>
            <Check className="selection-check" size={20} />
          </label>
        ))}
      </fieldset>
      <div className="action-row split">
        <button
          className="text-link"
          disabled={step === 0}
          onClick={() => move(step - 1)}
        >
          <ArrowLeft size={18} />
          {t("上一步", "Back")}
        </button>
        <button
          className="button"
          disabled={!session.draft[question.id]}
          onClick={() => (step === 4 ? setComplete(true) : move(step + 1))}
        >
          {step === 4
            ? t("查看起步計劃", "See my plan")
            : t("下一步", "Continue")}
          <ArrowRight size={18} />
        </button>
      </div>
      <p className="privacy-note">
        <ShieldCheck size={18} />
        {t(
          "草稿只保存於這個分頁。請使用演示選項，無需提供個人資料。",
          "Drafts stay in this tab. Use demo choices; no personal information is needed.",
        )}
      </p>
    </section>
  );
}

function Readiness({ t, pick, href, session, update }) {
  const [answers, setAnswers] = useState(
    session.readiness || Array(8).fill(null),
  );
  const [show, setShow] = useState(Boolean(session.readiness));
  const result = readinessResult(answers);
  const choices = [
    text("還沒開始", "Not yet"),
    text("部分準備", "Partly ready"),
    text("準備好了", "Ready"),
  ];
  return (
    <section className="page-wrap">
      <p className="eyebrow">READINESS / A MOMENT TO REFLECT</p>
      <h1>{t("為下一步，整理好行囊。", "Get ready for your next step.")}</h1>
      <p className="page-intro">
        {t(
          "八個小問題，從五個面向看見準備狀態。這是簡單的規劃練習，沒有資格或專業判定。",
          "Eight prompts, five perspectives. A simple planning exercise with no eligibility or professional judgments.",
        )}
      </p>
      {show && result ? (
        <>
          <div className="readiness-result">
            <div className="score">
              <span>
                {result.score}
                <small>/100</small>
              </span>
              <p>{t("本次演示準備度", "Demo readiness score")}</p>
            </div>
            <div className="dimension-list">
              {result.dimensions.map((value, i) => (
                <div key={i}>
                  <span>{pick(dimensionLabels[i])}</span>
                  <meter min={0} max={100} value={value}>
                    {value}%
                  </meter>
                  <b>{value}%</b>
                </div>
              ))}
            </div>
          </div>
          <h2>{t("可以再準備的小事", "A little more preparation")}</h2>
          <ul className="gap-list">
            {result.gaps.length ? (
              result.gaps.map((i) => (
                <li key={i}>{pick(readinessQuestions[i])}</li>
              ))
            ) : (
              <li>
                {t(
                  "這個演示情境已完成所有準備項目。試著執行第一步，再回來回顧。",
                  "This demo scenario covers every preparation item. Try the first step, then return to reflect.",
                )}
              </li>
            )}
          </ul>
          <div className="action-row">
            <button className="button secondary" onClick={() => setShow(false)}>
              {t("重新調整", "Revise choices")}
            </button>
            <a className="button" href={href("/staff")}>
              {t("前往本機工作台", "Open local workspace")}
              <ArrowRight size={18} />
            </a>
          </div>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (result) {
              update({ readiness: answers });
              setShow(true);
              window.scrollTo({ top: 0, behavior: "instant" });
            }
          }}
        >
          <div className="readiness-questions">
            {readinessQuestions.map((q, i) => (
              <fieldset key={i}>
                <legend>
                  <span>0{i + 1}</span>
                  {pick(q)}
                </legend>
                <div>
                  {choices.map((choice, value) => (
                    <label
                      key={value}
                      className={answers[i] === value ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name={`readiness-${i}`}
                        required
                        checked={answers[i] === value}
                        onChange={() =>
                          setAnswers((current) =>
                            current.map((a, index) =>
                              index === i ? value : a,
                            ),
                          )
                        }
                      />
                      {pick(choice)}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <button className="button" disabled={!result}>
            {t("查看準備度", "View readiness")}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </section>
  );
}

function Knowledge({ t, pick }) {
  const [selected, setSelected] = useState(
    () =>
      knowledge.find((item) => `#${item.id}` === window.location.hash)?.id ||
      "start",
  );
  const current = knowledge.find((item) => item.id === selected);
  return (
    <section className="page-wrap">
      <p className="eyebrow">FIELD NOTES / KNOWLEDGE DESK</p>
      <h1>{t("讓每一個疑問，都有落腳處。", "A place for your questions.")}</h1>
      <p className="page-intro">
        {t(
          "選擇一個問題，閱讀本項目的編寫筆記。這是固定內容問答，沒有生成式 AI 或外部訊息傳送。",
          "Choose a question to read a project note. These are curated answers, without generative AI or external messaging.",
        )}
      </p>
      <div className="knowledge-layout">
        <nav aria-label={t("手冊問題", "Field note questions")}>
          {knowledge.map((item) => (
            <button
              key={item.id}
              aria-pressed={selected === item.id}
              onClick={() => {
                setSelected(item.id);
                window.history.replaceState(
                  null,
                  "",
                  `${window.location.pathname}${window.location.search}#${item.id}`,
                );
              }}
            >
              {pick(item.q)}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </nav>
        <article aria-live="polite">
          <BookOpen size={38} weight="thin" />
          <p className="eyebrow">PROJECT NOTE / {current.id.toUpperCase()}</p>
          <h2>{pick(current.q)}</h2>
          <p>{pick(current.a)}</p>
          <small>
            {t(
              "來源：本項目規則與資料設計 · 版本 1.0",
              "Source: project rules and data design · Version 1.0",
            )}
          </small>
        </article>
      </div>
    </section>
  );
}

function Workspace({ t, pick, href, session, update }) {
  const [filter, setFilter] = useState("all");
  const [sampleStatus, setSampleStatus] = useState("reviewing");
  const statuses = [
    ["new", "待探索", "New"],
    ["reviewing", "回顧中", "Reviewing"],
    ["done", "已完成", "Done"],
  ];
  const rows = [
    {
      id: "DEMO-001",
      title: text("每週閱讀小計劃", "A weekly reading practice"),
      type: text("內建虛構示例", "Fictional built-in example"),
      status: sampleStatus,
    },
    ...(session.savedPlan
      ? [
          {
            id: "LOCAL-PLAN",
            title: text("我的起步計劃", "My first-step plan"),
            type: text("本機演示結果", "Local demo result"),
            status: session.status,
          },
        ]
      : []),
    ...(session.readiness
      ? [
          {
            id: "LOCAL-CHECK",
            title: text("我的準備度", "My readiness"),
            type: text("本機演示結果", "Local demo result"),
            status: "done",
            score: readinessResult(session.readiness).score,
          },
        ]
      : []),
  ];
  const visible = rows.filter(
    (row) => filter === "all" || row.status === filter,
  );
  return (
    <section className="page-wrap">
      <p className="eyebrow">WORKSPACE / LOCAL DEMO</p>
      <div className="workspace-heading">
        <div>
          <h1>
            {t("每一步，都值得被看見。", "Every step is worth noticing.")}
          </h1>
          <p className="page-intro">
            {t(
              "這裡只有虛構示例與你的本機演示結果，無需帳號。",
              "Fictional examples and your local demo results. No account required.",
            )}
          </p>
        </div>
        <ExportButton
          data={{
            demo: true,
            records: rows,
            plan: session.savedPlan,
            readiness: session.readiness,
          }}
          filename="open-pathway-workspace.json"
          label={t("匯出演示資料", "Export demo data")}
          t={t}
        />
      </div>
      <div className="stats">
        {[
          [rows.length, "全部項目", "Total items"],
          [
            rows.filter((r) => r.status === "reviewing").length,
            "回顧中",
            "In review",
          ],
          [
            session.readiness
              ? `${readinessResult(session.readiness).score}%`
              : "—",
            "本機準備度",
            "Local readiness",
          ],
        ].map(([value, tc, en]) => (
          <article key={en}>
            <span>{t(tc, en)}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <label className="filter">
        {t("篩選狀態", "Filter status")}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t("全部狀態", "All statuses")}</option>
          {statuses.map(([id, tc, en]) => (
            <option key={id} value={id}>
              {t(tc, en)}
            </option>
          ))}
        </select>
      </label>
      <div className="records">
        {visible.length ? (
          visible.map((row) => (
            <article key={row.id}>
              <div>
                <small>
                  {row.id} · {pick(row.type)}
                </small>
                <h3>{pick(row.title)}</h3>
                {row.score !== undefined && <p>{row.score}/100</p>}
              </div>
              {row.id === "LOCAL-CHECK" ? (
                <span className="tag">{t("已完成", "Done")}</span>
              ) : (
                <label className="record-status">
                  <span className="sr-only">
                    {row.id} {t("狀態", "status")}
                  </span>
                  <select
                    value={row.status}
                    onChange={(e) =>
                      row.id === "DEMO-001"
                        ? setSampleStatus(e.target.value)
                        : update({ status: e.target.value })
                    }
                  >
                    {statuses.map(([id, tc, en]) => (
                      <option key={id} value={id}>
                        {t(tc, en)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </article>
          ))
        ) : (
          <p className="empty-state">
            {t("目前沒有符合此狀態的項目。", "No items match this status.")}
          </p>
        )}
      </div>
      <p className="small-note">
        {t(
          "內建示例的狀態只在本頁保留；本機結果的狀態保存在此分頁會話。",
          "The built-in example resets on reload; local result status is saved for this tab session.",
        )}
      </p>
      {!session.savedPlan && (
        <a className="text-link" href={href("/assessment")}>
          {t(
            "完成一次評估，加入自己的演示計劃",
            "Complete an assessment to add your own demo plan",
          )}
          <ArrowRight size={18} />
        </a>
      )}
    </section>
  );
}
