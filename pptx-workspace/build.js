const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require(path.join(process.env.HOME, '.claude/skills/pptx/scripts/html2pptx'));

const slidesDir = path.join(__dirname, 'slides');
const outFile = path.join(__dirname, '..', 'TERRATEAM-CHANGES-REPORT.pptx');

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Claude Code';
  pptx.title = 'Terrateam Behavioral Changes Report';
  pptx.subject = 'Investigation of behavioral changes Jan 2025 - Feb 2026';

  // Slide 1: Title
  await html2pptx(path.join(slidesDir, 'slide01-title.html'), pptx);

  // Slide 2: Executive Summary
  await html2pptx(path.join(slidesDir, 'slide02-summary.html'), pptx);

  // Slide 3: Old Architecture
  await html2pptx(path.join(slidesDir, 'slide03-old-arch.html'), pptx);

  // Slide 4: New Architecture
  await html2pptx(path.join(slidesDir, 'slide04-new-arch.html'), pptx);

  // Slide 5: Deployment Timeline
  await html2pptx(path.join(slidesDir, 'slide05-rollout.html'), pptx);

  // Slide 6: Comparison Table
  const { slide: slide6, placeholders: ph6 } = await html2pptx(path.join(slidesDir, 'slide06-comparison.html'), pptx);
  const compTable = [
    [
      { text: 'Behavior', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 10 } },
      { text: 'Before (Old)', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 10 } },
      { text: 'After (New)', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 10 } }
    ],
    [
      { text: 'Concurrent Ops', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Sequential within installation', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Up to 20 parallel tasks with suspend/resume', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'DB Connections', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Held for entire operation', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Per-transaction, released between ops', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'Operation Order', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'FIFO within installation', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Dependency-graph ordered', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'Error Messages', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Generic errors', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Structured error types with context', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'Drift Scheduling', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Inferred from work manifests', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Explicit last_tried_at DB column', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'Status Checks', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Always created', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Skipped for disabled repos', options: { fontSize: 9, color: '27AE60' } }
    ],
    [
      { text: 'Large Runs', options: { bold: true, fontSize: 9, color: 'FFFFFF' } },
      { text: 'Slower (sequential queries)', options: { fontSize: 9, color: 'AAB7C4' } },
      { text: 'Faster (bulk loading, parallel)', options: { fontSize: 9, color: '27AE60' } }
    ]
  ];
  if (ph6.length > 0) {
    slide6.addTable(compTable, {
      ...ph6[0],
      colW: [ph6[0].w * 0.22, ph6[0].w * 0.39, ph6[0].w * 0.39],
      border: { pt: 0.5, color: '2C3E50' },
      fill: { color: '0E1A26' },
      rowH: [0.4, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
      valign: 'middle'
    });
  }

  // Slide 7: DB & Performance
  await html2pptx(path.join(slidesDir, 'slide07-db-perf.html'), pptx);

  // Slide 8: Bug Fixes
  await html2pptx(path.join(slidesDir, 'slide08-bugfixes.html'), pptx);

  // Slide 9: New Features
  await html2pptx(path.join(slidesDir, 'slide09-features.html'), pptx);

  // Slide 10: Timeline chart
  const { slide: slide10, placeholders: ph10 } = await html2pptx(path.join(slidesDir, 'slide10-timeline.html'), pptx);
  if (ph10.length > 0) {
    const timelineData = [
      [
        { text: 'Date', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 7 } },
        { text: 'Event', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 7 } },
        { text: 'Category', options: { fill: { color: '17A2B8' }, color: 'FFFFFF', bold: true, fontSize: 7 } }
      ],
      ['Oct 11', 'KV Store Phase 1 & 2', { text: 'Feature', options: { color: '27AE60', fontSize: 7 } }],
      ['Nov 4', 'Iris Stacks Screen', { text: 'Feature', options: { color: '27AE60', fontSize: 7 } }],
      ['Nov 13', 'VCS Comment Query Fix', { text: 'Bug Fix', options: { color: 'E74C3C', fontSize: 7 } }],
      ['Nov 14', 'Colored Plan Diff + Settings API', { text: 'Feature', options: { color: '27AE60', fontSize: 7 } }],
      ['Dec 2', 'YAML Anchor Merge Fix', { text: 'Bug Fix', options: { color: 'E74C3C', fontSize: 7 } }],
      ['Dec 5', 'Terragrunt Config Builder', { text: 'Feature', options: { color: '27AE60', fontSize: 7 } }],
      ['Dec 23', 'GitLab Admin Requirements', { text: 'Feature', options: { color: '27AE60', fontSize: 7 } }],
      [{ text: 'Jan 5', options: { bold: true, color: 'F39C12', fontSize: 7 } }, { text: 'EVALUATOR v2 DEPLOYED', options: { bold: true, color: 'F39C12', fontSize: 7 } }, { text: 'Deploy', options: { color: 'F39C12', fontSize: 7 } }],
      [{ text: 'Jan 5-14', options: { bold: true, color: 'E74C3C', fontSize: 7 } }, { text: '6 ROLLBACK CYCLES', options: { bold: true, color: 'E74C3C', fontSize: 7 } }, { text: 'Rollback', options: { color: 'E74C3C', fontSize: 7 } }],
      ['Jan 9', 'Connection Pool Fairness Fix', { text: 'Perf', options: { color: '17A2B8', fontSize: 7 } }],
      ['Jan 22', 'Drift Schedule Tracking in DB', { text: 'Bug Fix', options: { color: 'E74C3C', fontSize: 7 } }],
      [{ text: 'Jan 26', options: { bold: true, color: '27AE60', fontSize: 7 } }, { text: 'EVALUATOR v2 MADE DEFAULT', options: { bold: true, color: '27AE60', fontSize: 7 } }, { text: 'Stable', options: { color: '27AE60', fontSize: 7 } }],
      ['Jan 29', 'PR Base Branch Handling Fix', { text: 'Bug Fix', options: { color: 'E74C3C', fontSize: 7 } }],
      ['Feb 2', 'PostgreSQL Binary Wire Protocol', { text: 'Perf', options: { color: '17A2B8', fontSize: 7 } }],
      ['Feb 11', 'Bulk Load + Binary Format Merge', { text: 'Perf', options: { color: '17A2B8', fontSize: 7 } }]
    ];
    slide10.addTable(timelineData, {
      ...ph10[0],
      colW: [ph10[0].w * 0.15, ph10[0].w * 0.65, ph10[0].w * 0.20],
      border: { pt: 0.5, color: '2C3E50' },
      fill: { color: '0E1A26' },
      fontSize: 7,
      color: 'AAB7C4',
      valign: 'middle',
      rowH: Array(16).fill(ph10[0].h / 16.5)
    });
  }

  // Slide 11: Stats
  await html2pptx(path.join(slidesDir, 'slide11-stats.html'), pptx);

  await pptx.writeFile({ fileName: outFile });
  console.log('Presentation saved to:', outFile);
}

build().catch(e => { console.error(e); process.exit(1); });
