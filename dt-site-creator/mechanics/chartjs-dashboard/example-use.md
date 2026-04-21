# Chart.js Dashboard — Past Use

## eco-dashboard
- **File:** `components/RevenueChart.tsx`, `components/CashflowChart.tsx`
- **Context:** Wastewater treatment plant financials. Line charts for revenue, bar charts for plant utilization by site. Each has a "Last updated" timestamp pulled from the source Supabase row.

## elitez-csuite
- **File:** `js/gmail-volume-chart.js`
- **Context:** 7-day Gmail volume per priority tier. Uses Chart.js with the same flex-safe wrapper pattern.

## market-tracker
- **File:** (Plotly equivalent, but pattern transfers)
- **Context:** CAPM beta chart, DCF sensitivity heatmap. Plotly is used there but any new Chart.js panel should follow this mechanic's pattern.
