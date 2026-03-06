# 🧪 Groww MF Assistant - Sample Q&A

This document showcases the assistant's ability to categorize queries as **FACTUAL** (handled via RAG with citations) vs. **ADVISORY** (rejected with educational links) or **ERROR** (when the specific fund data is unavailable).

---

### 1. Factual Query: Expense Ratio
**Q:** *What is the expense ratio of the Groww Nifty Total Market Index fund?*
- **Response Type**: `FACTUAL`
- **Assistant Answer**: "The expense ratio for the Groww Nifty Total Market Index Fund (Direct Growth) is **0.25%** as of the latest documentation. This is a competitive rate for index funds tracking the total market."
- **Citation**: [Groww Nifty Total Market Index Fund Page](https://groww.in/mutual-funds/groww-nifty-total-market-index-fund-direct-growth)

---

### 2. Factual Query: Lock-in Period
**Q:** *Does the Groww ELSS Tax Saver have a lock-in period?*
- **Response Type**: `FACTUAL`
- **Assistant Answer**: "Yes, as an Equity Linked Savings Scheme (ELSS), the Groww ELSS Tax Saver Fund has a mandatory **3-year lock-in period**. This means you cannot withdraw your units before 3 years from the date of investment."
- **Citation**: [Groww ELSS Tax Saver Fund Page](https://groww.in/mutual-funds/groww-elss-tax-saver-fund-direct-growth)

---

### 3. Factual Query: Exit Load
**Q:** *Is there any exit load for the Groww Liquid Fund?*
- **Response Type**: `FACTUAL`
- **Assistant Answer**: "The Groww Liquid Fund (Direct Plan-Growth) has a tiered exit load structure based on the number of days since investment:\n- **Day 1**: 0.0070%\n- **Day 2**: 0.0065%\n- **Day 3**: 0.0060%\n- **Day 7+**: NIL"
- **Citation**: [Groww Liquid Fund Page](https://groww.in/mutual-funds/groww-liquid-fund-direct-growth)

---

### 4. Advisory Query: Refusal Logic
**Q:** *Should I invest my 1 Lakh in the Liquid fund or the Index fund?*
- **Response Type**: `ADVISORY`
- **Assistant Answer**: "⚠️ **Disclaimer**: I am a Factual Data Assistant and cannot provide investment advice or personalized recommendations. Choosing between funds depends on your risk profile, goal, and horizon. I recommend consulting a SEBI-registered Investment Advisor or exploring Groww's educational resources."
- **Helpful Link**: [Groww Education Blog](https://groww.in/blog)

---

### 5. Out of Scope Query
**Q:** *What are the returns of Axis Bluechip Fund?*
- **Response Type**: `ERROR`
- **Assistant Answer**: "I currently only have factual data for **Groww Mutual Fund** schemes (Liquid, ELSS Tax Saver, Index, and Large Cap). I cannot provide details for Axis Bluechip Fund at this time."
- **Helpful Link**: [Groww Mutual Fund Explorer](https://groww.in/mutual-funds)

---

### 6. Disclaimer Snippet (UI Component)
The following snippet is displayed at the bottom of the assistant to maintain compliance:
> ℹ️ **Factual data assistant.** Not an investment platform or advisory service.
