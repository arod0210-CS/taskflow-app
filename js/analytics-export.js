export function buildAnalyticsExport(summary, appVersion = "unknown") {
  return {
    format: "taskflow-analytics",
    schemaVersion: 1,
    appVersion,
    generatedAt: new Date().toISOString(),
    range: summary.range,
    overview: summary.overview,
    taskTrends: summary.taskTrends,
    breakdowns: summary.breakdowns,
    habits: summary.habits,
    focus: summary.focus,
    projects: summary.projects,
    heatmap: summary.heatmap,
    insights: summary.insights,
    limitations: summary.limitations
  };
}

export function downloadAnalyticsJson(summary, appVersion = "unknown") {
  const payload = buildAnalyticsExport(summary, appVersion);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `taskflow-analytics-${summary.range.start}-${summary.range.end}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
