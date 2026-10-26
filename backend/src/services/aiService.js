const { OpenAI } = require('openai');
const { futureCost, calculateGoal, roundRupee } = require('../utils/calculations');
const FinancialDetails = require('../models/FinancialDetails');
const FinancialGoal = require('../models/FinancialGoal');
const Expense = require('../models/Expense');

let openaiClient = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('YOUR_OPENAI_API_KEY') || apiKey.trim() === '') {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      timeout: 15000,
    });
  }
  return openaiClient;
}

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(roundRupee(value));

/**
 * Detect and perform programmatic inflation and future goal calculations.
 */
function tryProgrammaticCalculation(message) {
  const text = message.toLowerCase();

  // Check if message is asking for a calculation or future cost
  const isCalcQuery =
    text.includes('cost') ||
    text.includes('inflation') ||
    text.includes('calculate') ||
    text.includes('future') ||
    text.includes('worth') ||
    text.includes('after') ||
    text.includes('years') ||
    text.includes('target');

  if (!isCalcQuery) return null;

  // Extract amount / cost
  let currentCost = null;

  // Check for lakh / cr formats: e.g. "5 lakh", "5,00,000", "500000"
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?)/i);
  const crMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)/i);
  const rawNumMatch = text.match(/(?:₹|rs\.?|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,10})/i);

  if (lakhMatch) {
    currentCost = parseFloat(lakhMatch[1]) * 100000;
  } else if (crMatch) {
    currentCost = parseFloat(crMatch[1]) * 10000000;
  } else if (rawNumMatch) {
    currentCost = parseFloat(rawNumMatch[1].replace(/,/g, ''));
  }

  // Extract years: e.g. "5 years", "in 5 years", "after 10 years", "five years"
  let years = null;
  const wordYears = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    fifteen: 15, twenty: 20, twentyfive: 25, thirty: 30,
  };
  const numYearMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (numYearMatch) {
    years = parseFloat(numYearMatch[1]);
  } else {
    for (const [w, val] of Object.entries(wordYears)) {
      if (new RegExp(`\\b${w}\\s*(?:years?|yrs?)\\b`, 'i').test(text)) {
        years = val;
        break;
      }
    }
  }

  // Extract inflation rate: e.g. "6%", "6 percent", "at 6% annual inflation"
  let inflationRate = 6.0; // default standard assumption
  let rateExplicit = false;
  const rateMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/i);
  if (rateMatch) {
    inflationRate = parseFloat(rateMatch[1]);
    rateExplicit = true;
  }

  // If both cost and years are identified, calculate programmatic projection
  if (currentCost && years && currentCost > 0 && years > 0) {
    const projectedFuture = futureCost(currentCost, inflationRate, years);
    const increase = Math.max(0, projectedFuture - currentCost);
    const pctIncrease = ((increase / currentCost) * 100).toFixed(1);
    const months = Math.round(years * 12);
    const requiredMonthly = Math.round(projectedFuture / months);

    let goalLabel = 'Financial Goal';
    if (text.includes('education')) goalLabel = 'Higher Education';
    else if (text.includes('house') || text.includes('home')) goalLabel = 'Dream House';
    else if (text.includes('car') || text.includes('vehicle')) goalLabel = 'Vehicle Purchase';
    else if (text.includes('medical')) goalLabel = 'Medical Reserve';
    else if (text.includes('retirement')) goalLabel = 'Retirement Fund';

    const formattedReply = [
      `### 📊 Inflation-Adjusted Goal Calculation: ${goalLabel}`,
      '',
      `- **Current Cost Today:** ${formatINR(currentCost)}`,
      `- **Assumed Annual Inflation Rate:** ${inflationRate}% ${rateExplicit ? '(as specified)' : '(standard assumed planning benchmark)'}`,
      `- **Time Horizon:** ${years} Years (${months} months)`,
      '',
      '#### Calculation Formula:',
      '$$\\text{Future Cost} = \\text{Current Cost} \\times (1 + \\text{Inflation Rate})^{\\text{Years}}$$',
      `$$\\text{Future Cost} = ${formatINR(currentCost)} \\times (1 + ${(inflationRate / 100).toFixed(2)})^{${years}} = **${formatINR(projectedFuture)}**$$`,
      '',
      `- **Estimated Future Cost:** **${formatINR(projectedFuture)}**`,
      `- **Estimated Cost Increase due to Inflation:** ${formatINR(increase)} (+${pctIncrease}%)`,
      `- **Approximate Monthly Savings Required (0% return):** ${formatINR(requiredMonthly)} / month`,
      '',
      `> ℹ️ **Planning Note:** This calculation is an estimate based on an assumed ${inflationRate}% annual inflation rate. Actual inflation rates may vary over time.`,
    ].join('\n');

    return {
      reply: formattedReply,
      calculation: {
        currentCost,
        years,
        inflationRate,
        futureCost: projectedFuture,
        increase,
        requiredMonthly,
      },
    };
  }

  return null;
}

/**
 * Retrieve authorized user financial context safely without leaking credentials.
 */
async function getUserFinancialContext(user) {
  if (!user || !user._id) return null;
  try {
    const [details, goals, expenses] = await Promise.all([
      FinancialDetails.findOne({ userId: user._id }),
      FinancialGoal.find({ userId: user._id }),
      Expense.find({ userId: user._id }),
    ]);

    const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalGoalTargets = goals.reduce((sum, g) => sum + (Number(g.futureCost) || 0), 0);

    return {
      name: user.name,
      monthlyIncome: details ? details.monthlyIncome : null,
      monthlyExpenses: details ? details.monthlyExpenses : null,
      currentSavings: details ? details.currentSavings : null,
      totalTrackedExpenses: totalExpense,
      goalsCount: goals.length,
      goalsList: goals.map((g) => ({ name: g.goalName, futureCost: g.futureCost, targetDate: g.targetDate })),
      totalGoalTargets,
    };
  } catch (err) {
    console.error('[AI Service] Error loading user context:', err.message);
    return null;
  }
}

/**
 * Curated knowledge base for common financial-planning queries.
 */
function getKnowledgeResponse(message) {
  const q = message.toLowerCase().trim();

  if (q.includes('how does inflation affect my savings') || (q.includes('inflation') && q.includes('affect') && q.includes('savings'))) {
    return [
      '### How Inflation Affects Your Savings',
      '',
      'Inflation represents the general increase in prices and fall in the purchasing value of money over time.',
      '',
      '1. **Erosion of Purchasing Power:** If your savings grow at 3% in a regular bank account while inflation is at 6%, your "real return" is -3%. You lose purchasing power every year.',
      '2. **The "Silent Tax":** A basket of goods costing ₹1,00,000 today will cost approximately ₹1,79,085 in 10 years at a 6% annual inflation rate.',
      '3. **Importance of Beating Inflation:** To protect your wealth, you must invest in inflation-beating instruments (such as equity mutual funds, index funds, or sovereign gold bonds) for long-term goals.',
      '',
      '💡 *Tip: Use the InflationWise Inflation Calculator to test how different inflation rates affect your specific goals.*',
    ].join('\n');
  }

  if (q.includes('explain inflation in simple words') || q.includes('what is inflation')) {
    return [
      '### Inflation Explained in Simple Words',
      '',
      'Imagine you have **₹100** today, and a cup of coffee costs **₹100**. You can buy exactly 1 cup.',
      '',
      'If inflation is **6% per year**, that same cup of coffee will cost **₹106** next year. But if your ₹100 remained in your drawer, you can no longer afford the whole cup.',
      '',
      'In short: **Inflation is the invisible force that makes things more expensive over time, making each Rupee buy less than it did before.**',
      '',
      'To beat inflation, your savings must grow faster than the inflation rate.',
    ].join('\n');
  }

  if (q.includes('how can i plan my monthly expenses') || q.includes('plan my monthly expenses') || q.includes('budgeting')) {
    return [
      '### How to Plan Your Monthly Expenses (The 50/30/20 Rule)',
      '',
      'A proven framework for managing your income and expenses is the **50/30/20 Rule**:',
      '',
      '- **50% for Needs (Essentials):** Rent, groceries, electricity, water, health insurance, and loan minimum payments.',
      '- **30% for Wants (Lifestyle):** Dining out, entertainment, shopping, vacations, and subscriptions.',
      '- **20% for Savings & Investments:** Emergency fund contributions, retirement accounts, and inflation-aligned financial goals.',
      '',
      '**Action Steps in InflationWise:**',
      '1. Record your income under **Financial Details**.',
      '2. Log your daily/monthly expenses in the **Expenses** tab.',
      '3. Review the **Reports** tab to identify categories where you can reduce unnecessary spending.',
    ].join('\n');
  }

  if (q.includes('how do i calculate the future cost of a financial goal') || q.includes('calculate the future cost')) {
    return [
      '### Calculating the Future Cost of a Financial Goal',
      '',
      'To find out how much a goal will cost in the future, use the compound inflation formula:',
      '',
      '$$\\text{Future Cost} = \\text{Current Cost} \\times (1 + r)^n$$',
      '',
      '- **Current Cost ($P$):** What the goal costs at today\'s prices.',
      '- **Inflation Rate ($r$):** The expected annual inflation rate (e.g. 0.06 for 6%).',
      '- **Number of Years ($n$):** The number of years until you need the money.',
      '',
      '**Example:**',
      'A college education costing ₹5,00,000 today, needed in 5 years at 6% annual inflation:',
      '$$\\text{Future Cost} = 5,00,000 \\times (1 + 0.06)^5 = 5,00,000 \\times 1.338226 = ₹6,69,113$$',
      '',
      'You can also try asking me: *"My education goal costs ₹5,00,000 today. How much will it cost after 5 years at 6% inflation?"*',
    ].join('\n');
  }

  if (q.includes('emergency fund')) {
    return [
      '### Building an Emergency Fund',
      '',
      '- **Target Amount:** 3 to 6 months of mandatory living expenses (rent, groceries, utilities, EMIs).',
      '- **Where to keep it:** In high-liquidity, low-risk accounts such as a high-yield savings account or liquid mutual funds.',
      '- **Rule:** Never invest your emergency fund in volatile equity markets or long-term lock-in instruments.',
    ].join('\n');
  }

  return null;
}

/**
 * Primary AI response handler combining programmatic calculations,
 * authorized financial data, knowledge bases, and OpenAI API.
 */
async function getAIResponse(message, options = {}) {
  const { user = null, history = [] } = options;

  // 1. Check for programmatic calculation requests first
  const calcResult = tryProgrammaticCalculation(message);
  if (calcResult) {
    return {
      reply: calcResult.reply,
      calculation: calcResult.calculation,
      source: 'calculation-engine',
    };
  }

  // 2. Check for personal financial data questions if authenticated
  const textLower = message.toLowerCase();
  if (user && (textLower.includes('my goal') || textLower.includes('my expense') || textLower.includes('my income') || textLower.includes('my savings') || textLower.includes('my details'))) {
    const ctx = await getUserFinancialContext(user);
    if (ctx) {
      if (textLower.includes('goal')) {
        if (!ctx.goalsCount) {
          return {
            reply: `Hello ${ctx.name}! You haven't created any financial goals yet. You can create your first goal in the **Financial Goals** section to start tracking future inflation-adjusted costs.`,
            source: 'personal-data',
          };
        }
        const goalList = ctx.goalsList.map((g) => `- **${g.name}:** ${formatINR(g.futureCost)}`).join('\n');
        return {
          reply: `Hello ${ctx.name}! You currently have **${ctx.goalsCount} active financial goal(s)** with a total projected target of **${formatINR(ctx.totalGoalTargets)}**:\n\n${goalList}\n\nKeep up your systematic savings to achieve these targets!`,
          source: 'personal-data',
        };
      }
      if (textLower.includes('income') || textLower.includes('saving') || textLower.includes('expense')) {
        return {
          reply: `Hello ${ctx.name}! Here is a summary of your financial plan:\n- **Monthly Income:** ${ctx.monthlyIncome ? formatINR(ctx.monthlyIncome) : 'Not configured'}\n- **Monthly Expenses:** ${ctx.monthlyExpenses ? formatINR(ctx.monthlyExpenses) : 'Not configured'}\n- **Current Savings:** ${ctx.currentSavings ? formatINR(ctx.currentSavings) : 'Not configured'}\n- **Total Tracked Expenses:** ${formatINR(ctx.totalTrackedExpenses)}\n- **Active Financial Goals:** ${ctx.goalsCount}`,
          source: 'personal-data',
        };
      }
    }
  }

  // 3. Check curated financial knowledge responses
  const knowledge = getKnowledgeResponse(message);
  if (knowledge) {
    return {
      reply: knowledge,
      source: 'knowledge-base',
    };
  }

  // 4. If live OpenAI client is available, query OpenAI API
  const client = getClient();
  if (client) {
    try {
      const systemPrompt = `You are "InflationWise AI Assistant", a smart companion for inflation-based financial planning.
Tagline: "Your Smart Companion for Inflation-Based Financial Planning".
Guidelines:
- Explain financial concepts clearly and concisely in simple language.
- Format all currencies in Indian Rupees (INR / ₹) where applicable.
- Emphasize the impact of inflation on savings and future goals.
- Remind users that all future projections are estimates based on assumed rates.
- Do not invent current official rates (CPI inflation, RBI repo rates) without citing that real-time live web search is not connected.
- Never ask for or expose passwords, PINs, or sensitive credentials.
- Keep responses friendly, structured, and easy to read.`;

      const messages = [
        { role: 'system', content: systemPrompt },
      ];

      // Add last few turns of conversation history if available
      if (Array.isArray(history)) {
        history.slice(-6).forEach((h) => {
          if (h.role && h.text) {
            messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text });
          }
        });
      }

      messages.push({ role: 'user', content: message });

      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) {
        return { reply, source: 'openai' };
      }
    } catch (err) {
      console.error('[AI Service] OpenAI API request failed:', err.message);
      // Fall through to helpful fallback response
    }
  }

  // 5. Informative fallback when OpenAI key is not configured or fails
  const fallback = [
    '### InflationWise AI Assistant',
    '',
    'I am your smart companion for inflation-based financial planning. Here are ways I can assist you right now:',
    '',
    '1. **Perform Exact Inflation Calculations:** Ask me questions like:',
    '   *"My education goal costs ₹5,00,000 today. How much will it cost after 5 years at 6% annual inflation?"*',
    '2. **Explain Financial Planning Concepts:** Ask about purchasing power, the 50/30/20 budgeting rule, or emergency funds.',
    '3. **Personalized Financial Guidance:** If you are logged in, ask *"What are my goals?"* or *"What is my monthly savings plan?"*',
    '',
    '> ⚙️ *Configuration Note: To enable open-ended generative AI conversations, configure your `OPENAI_API_KEY` in `backend/.env` (e.g. `OPENAI_API_KEY=sk-...` and optional `OPENAI_MODEL=gpt-4o-mini`).*',
  ].join('\n');

  return {
    reply: fallback,
    source: 'assistant-fallback',
  };
}

module.exports = {
  getAIResponse,
  tryProgrammaticCalculation,
};
