// 같은 과제를 조건만 바꿔 클로드 코드에 던지고, 숨은 테스트로 채점한다.
// 사용: node run.mjs [조건…] [--reps 3] [--model sonnet]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const PROMPT = fs.readFileSync(path.join(ROOT, 'PROMPT.txt'), 'utf8').trim();
const K = (f) => path.join(ROOT, 'knowledge', f);

// 조건마다 작업 폴더에 넣을 파일과 CLAUDE.md
const CONDITIONS = {
  base: { files: [], claude: null },
  onto: { files: [K('ontology.md')], claude: '도메인 지식은 ontology.md에 있다.' },
  spec: { files: [K('PRD.md'), K('SDD.md')], claude: '요구사항은 PRD.md, 설계는 SDD.md에 있다.' },
  both: { files: [K('ontology.md'), K('PRD.md'), K('SDD.md')], claude: '도메인 지식은 ontology.md, 요구사항은 PRD.md, 설계는 SDD.md에 있다.' },
  drift: { files: [K('ontology-stale.md'), K('PRD.md'), K('SDD.md')], claude: '도메인 지식은 ontology.md, 요구사항은 PRD.md, 설계는 SDD.md에 있다.', rename: { 'ontology-stale.md': 'ontology.md' } },
  check: { files: [K('PRD.md'), K('SDD.md')], claude: '요구사항은 PRD.md, 설계는 SDD.md에 있다.\n끝내기 전에 `npm test`를 돌려 모두 통과해야 한다.', tests: true },
};

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : args.splice(i, 2)[1]; };
const reps = Number(opt('--reps', 3)), model = opt('--model', 'sonnet');
const names = args.length ? args : Object.keys(CONDITIONS);
const HOME = process.env.EXP_HOME || '/private/tmp/cc-s16n/home';  // 녹화 전용 HOME — 단테 개인 설정을 읽지 않는다

for (const name of names) {
  const c = CONDITIONS[name];
  for (let r = 1; r <= reps; r++) {
    const wd = path.join('/private/tmp/onto-exp', `${name}-${r}`);
    fs.rmSync(wd, { recursive: true, force: true });
    fs.cpSync(path.join(ROOT, 'starter'), wd, { recursive: true });
    for (const f of c.files) fs.copyFileSync(f, path.join(wd, c.rename?.[path.basename(f)] || path.basename(f)));
    if (c.claude) fs.writeFileSync(path.join(wd, 'CLAUDE.md'), `# 작업 규칙\n${c.claude}\n`);
    if (c.tests) fs.cpSync(path.join(ROOT, 'check/test'), path.join(wd, 'test'), { recursive: true });
    execFileSync('git', ['init', '-q'], { cwd: wd });

    console.log(`▶ ${name} #${r}`);
    const t0 = Date.now();
    const p = spawnSync('claude', ['-p', PROMPT, '--output-format', 'json', '--model', model, '--setting-sources', 'project',
      '--permission-mode', 'acceptEdits', '--allowedTools', 'Bash(npm test:*),Bash(node:*),Read,Write,Edit,Glob,Grep'],
      { cwd: wd, env: { ...process.env, HOME }, encoding: 'utf8', maxBuffer: 64 << 20 });
    let j = {};
    try { j = JSON.parse(p.stdout); } catch { console.log(p.stdout.slice(-400), p.stderr.slice(-400)); }
    const u = j.usage || {};

    // 숨은 테스트: 작업 폴더 밖에서, 다 끝난 뒤에만
    const fare = path.join(wd, 'fare.js');
    let pass = 0, total = 28;
    if (fs.existsSync(fare)) {
      const o = spawnSync('node', ['--test', path.join(ROOT, 'oracle/fare.oracle.test.js')], { env: { ...process.env, FARE: fare }, encoding: 'utf8' });
      pass = Number((o.stdout.match(/ℹ pass (\d+)/) || [])[1] || 0);
      total = Number((o.stdout.match(/ℹ tests (\d+)/) || [])[1] || total);
    }
    const row = { condition: name, rep: r, model, pass, total, score: +(pass / total * 100).toFixed(1),
      tokens_in: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0),
      tokens_out: u.output_tokens || 0, cost_usd: j.total_cost_usd ?? null, seconds: +((Date.now() - t0) / 1000).toFixed(1), turns: j.num_turns ?? null };
    fs.mkdirSync(path.join(ROOT, 'runs'), { recursive: true });
    fs.appendFileSync(path.join(ROOT, 'runs/results.jsonl'), JSON.stringify(row) + '\n');
    fs.cpSync(wd, path.join(ROOT, 'runs', `${name}-${r}`), { recursive: true, filter: (s) => !s.includes('/.git') });
    fs.writeFileSync(path.join(ROOT, 'runs', `${name}-${r}`, 'CLAUDE-ANSWER.txt'), String(j.result ?? ''));  // 클로드의 마지막 답(충돌을 알아챘는지 등)
    console.log(`  ${pass}/${total}  in ${row.tokens_in}  out ${row.tokens_out}  ${row.seconds}s`);
  }
}
