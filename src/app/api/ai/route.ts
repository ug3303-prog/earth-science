import { NextRequest, NextResponse } from "next/server";

// Dynamic configuration mapping
const MODEL_PRIMARY_HAIKU = "claude-haiku-4-5-20251001";
const MODEL_FALLBACK_HAIKU = "claude-3-5-haiku-20241022";
const MODEL_PRIMARY_SONNET = "claude-sonnet-4-6";
const MODEL_FALLBACK_SONNET = "claude-3-5-sonnet-latest";

// Simple in-memory IP rate limiter for MVP
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests per minute

function rateLimit(ip: string): boolean {
  const now = Date.now();
  let ipData = ipCache.get(ip);
  
  if (!ipData || now > ipData.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  ipData.count++;
  if (ipData.count > RATE_LIMIT_MAX) {
    return false;
  }
  
  return true;
}

// Cleans up the markdown code block wrap from LLM response
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "");
    cleaned = cleaned.replace(/```$/, "");
  }
  return cleaned.trim();
}

// Calls Anthropic API
async function fetchAnthropic(
  prompt: string,
  model: string,
  apiKey: string,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const text = (json.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  return text;
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting check
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "요청이 너무 많습니다. 1분 후에 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  // 2. API Key verification
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Server Configuration Error: ANTHROPIC_API_KEY is not configured.");
    return NextResponse.json(
      { ok: false, error: "서버 API 키가 구성되지 않았습니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  // 3. Schema & Input Validation
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "올바르지 않은 JSON 요청 형식입니다." },
      { status: 400 }
    );
  }

  const { task, payload } = body;
  if (!task || !payload) {
    return NextResponse.json(
      { ok: false, error: "필수 파라미터(task, payload)가 누락되었습니다." },
      { status: 400 }
    );
  }

  if (task !== "grade" && task !== "classReport" && task !== "record") {
    return NextResponse.json(
      { ok: false, error: "알 수 없는 작업(task) 유형입니다. ('grade' | 'classReport' | 'record' 만 가능)" },
      { status: 400 }
    );
  }

  // Log only schema markers, omitting student names or answers for privacy.
  console.log(`[AI Proxy] Running task: ${task} for requester IP: ${ip.split(",")[0]}`);

  // 4. Build prompt based on task
  let prompt = "";
  let primaryModel = "";
  let fallbackModel = "";

  if (task === "grade") {
    const { studentGroup, unitTitle, unitActivity, studentAnswer } = payload;
    if (!studentGroup || !unitTitle || !unitActivity || studentAnswer === undefined) {
      return NextResponse.json({ ok: false, error: "탐구 채점에 필요한 payload 속성이 누락되었습니다." }, { status: 400 });
    }
    
    // Anonymized prompt: replace real name with a placeholder to keep name out of external API / log if required, 
    // but the system prompt uses `[학생] ${st.name}`. We can use a generic label like "학생" or keep it, 
    // but the prompt log itself is blocked. Let's pass a safe identifier or keep name inside the payload without logging it.
    // The instruction says: "로그에 학생 이름·서술형 답안 등 개인정보를 남기지 말 것."
    // This means we should not write it to SERVER LOGS (e.g. console.log). Passing it to Anthropic is necessary for evaluation.
    const studentName = payload.studentName || "학생";

    prompt = `너는 초등 과학 교사를 돕는 채점 조교야. 아래 '${unitTitle}' 탐구 수업(${unitActivity})에서 학생의 활동지 답안을 4개 평가 요소로 채점해줘.

[학생] ${studentName} (${studentGroup})
[활동지 답안] "${studentAnswer}"

[평가 요소]
1. 탐구수행: 측정·관측을 정확히 수행했는가
2. 데이터표현: 측정값을 표·그래프로 정리했는가
3. 해석설명: 측정 결과의 관계를 근거로 설명했는가
4. 협력태도: 모둠 협력과 시민과학 기여(GLOBE/NASA 제출)에 참여했는가

각 요소를 "잘함" / "보통" / "노력요함" 중 하나로 평가하고, 답안 내용에 근거한 한 줄 근거를 써줘. 답안이 짧거나 정보가 부족하면 낮은 단계로 평가해도 돼.
반드시 아래 JSON만 응답(마크다운·다른 말 없이):
{"탐구수행":{"level":"잘함","evidence":"근거"},"데이터표현":{"level":"보통","evidence":"근거"},"해석설명":{"level":"잘함","evidence":"근거"},"협력태도":{"level":"잘함","evidence":"근거"}}`;

    primaryModel = MODEL_PRIMARY_SONNET;
    fallbackModel = MODEL_FALLBACK_SONNET;

  } else if (task === "classReport") {
    const { className, unitTitle, unitContext, rowsText, chartDataText, obsCount, unitUnit } = payload;
    if (!className || !unitTitle || !unitContext || !rowsText || !chartDataText || obsCount === undefined || !unitUnit) {
      return NextResponse.json({ ok: false, error: "학급 리포트 생성에 필요한 payload 속성이 누락되었습니다." }, { status: 400 });
    }

    prompt = `너는 초등 과학 교사를 돕는 조교야. 아래 '${unitTitle}' 수업 데이터로 학부모·관리자 공유용 수업 리포트 초안을 작성해줘.
학급: ${className}
단원: ${unitTitle} (${unitContext})
측정값(${unitUnit}):\n${rowsText}
항목별 평균: ${chartDataText}
GLOBE/NASA 제출: ${obsCount}건
아래 JSON만 응답(마크다운 없이):
{"summary":"3~4문장 요약(존댓말)","achievements":["성과1","성과2","성과3"]}`;

    primaryModel = MODEL_PRIMARY_HAIKU;
    fallbackModel = MODEL_FALLBACK_HAIKU;

  } else if (task === "record") {
    const { unitTitle, evaluationText } = payload;
    if (!unitTitle || !evaluationText) {
      return NextResponse.json({ ok: false, error: "생기부 문구 생성에 필요한 payload 속성이 누락되었습니다." }, { status: 400 });
    }

    prompt = `아래 학생의 '${unitTitle}' 과학 수업 평가 결과를 바탕으로 생활기록부 교과 세부능력 및 특기사항 문구를 작성해줘. 학생 이름은 쓰지 말고 '~함' 체로, 1~2문장. 측정·데이터표현·해석·시민과학 참여를 자연스럽게 녹이고, 부족한 점은 성장 권장으로 부드럽게 표현해.
[평가 결과]
${evaluationText}
JSON만 응답: {"record":"문구"}`;

    primaryModel = MODEL_PRIMARY_SONNET;
    fallbackModel = MODEL_FALLBACK_SONNET;
  }

  // 5. Invoke API with 30s Timeout and Fallback Retry
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  let aiText = "";
  try {
    try {
      aiText = await fetchAnthropic(prompt, primaryModel, apiKey, controller.signal);
    } catch (err: any) {
      console.warn(`[AI Proxy] Primary model ${primaryModel} failed. Trying fallback ${fallbackModel}. Detail:`, err.message);
      aiText = await fetchAnthropic(prompt, fallbackModel, apiKey, controller.signal);
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[AI Proxy] API call timed out after 30 seconds.");
      return NextResponse.json(
        { ok: false, error: "AI 응답 시간이 초과되었습니다 (30초 제한). 다시 시도해 주세요." },
        { status: 504 }
      );
    }
    console.error("[AI Proxy] AI call failed on both models:", error.message);
    return NextResponse.json(
      { ok: false, error: "AI 호출 도중 실패했습니다. API 키나 서버 네트워크 상태를 확인해 주세요." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // 6. Clean and Parse JSON response
  try {
    const cleaned = cleanJsonResponse(aiText);
    const parsedData = JSON.parse(cleaned);
    return NextResponse.json({ ok: true, data: parsedData });
  } catch (parseError: any) {
    console.error("[AI Proxy] JSON parse failure. Raw AI Response was:", aiText);
    return NextResponse.json(
      { ok: false, error: "AI가 생성한 데이터를 규격(JSON)에 맞게 해석하는 데 실패했습니다. 다시 채점해 주세요." },
      { status: 500 }
    );
  }
}
