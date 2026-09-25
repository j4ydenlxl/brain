// Source-backed code anatomy. This is a lightweight static reader, never an executor.
import { parseWorkflow, contextPacket } from './repo-core.mjs';
import { markupParts } from './code-explain.mjs';
const skipCalls = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'with', 'typeof', 'sizeof', 'return', 'def', 'class', 'super', 'async', 'await']);
function lineLocator(text) {
  const starts = [0];
  for (let at = text.indexOf('\n'); at >= 0; at = text.indexOf('\n', at + 1)) starts.push(at + 1);
  return {
    at(position) {
      let low = 0, high = starts.length;
      while (low < high) { const middle = (low + high) >>> 1; if (starts[middle] <= position) low = middle + 1; else high = middle; }
      return Math.max(1, low);
    },
    start(line) { return starts[Math.max(0, line - 1)] ?? text.length + (line > 1 ? 1 : 0); }
  };
}
const words = name => name.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_.$:/-]+/g, ' ').toLowerCase();
const last = name => name.split('.').at(-1);
function masked(source, python) {
  let out = '', i = 0;
  while (i < source.length) {
    const c = source[i], next = source[i + 1];
    if ((!python && c === '/' && next === '/') || (python && c === '#')) { while (i < source.length && source[i] !== '\n') { out += ' '; i++; } continue; }
    if (!python && c === '/' && next === '*') { out += '  '; i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) { out += source[i] === '\n' ? '\n' : ' '; i++; } if (i < source.length) { out += '  '; i += 2; } continue; }
    if (c === '"' || c === "'" || (!python && c === '`')) {
      const quote = python && source.slice(i, i + 3) === c.repeat(3) ? c.repeat(3) : c; out += ' '.repeat(quote.length); i += quote.length;
      while (i < source.length && source.slice(i, i + quote.length) !== quote) { if (source[i] === '\\') { out += ' '; i++; if (i < source.length) { out += source[i] === '\n' ? '\n' : ' '; i++; } } else { out += source[i] === '\n' ? '\n' : ' '; i++; } }
      if (i < source.length) { out += ' '.repeat(quote.length); i += quote.length; } continue;
    }
    out += c; i++;
  }
  return out;
}
function closing(mask, start, open = '{', close = '}') { let depth = 0; for (let i = start; i < mask.length; i++) { if (mask[i] === open) depth++; if (mask[i] === close && --depth === 0) return i + 1; } return mask.length; }
function operationKind(name) {
  const known = { 'Object.create': ['transform', 'Creates an object with shared behavior'], 'Object.setPrototypeOf': ['transform', 'Connects an object to shared behavior'], 'JSON.parse': ['transform', 'Turns JSON text into a usable value'], 'JSON.stringify': ['transform', 'Turns a value into JSON text'] };
  if (Object.hasOwn(known, name)) return known[name];
  if (/^(?:React\.)?useState$/.test(name)) return ['value', 'Creates interface state and a function that updates it'];
  if (/^(?:React\.)?useEffect$/.test(name)) return ['event', 'Schedules work after rendering when its dependencies change'];
  if (/\.(?:querySelector|querySelectorAll|getElementById)$/.test(name)) return ['input', 'Finds elements in the page'];
  if (/\.(?:createElement|append|appendChild|replaceChildren|insertBefore|remove)$/.test(name)) return ['output', 'Creates or changes elements in the page'];
  if (/^(?:res|response|reply)\.(?:setHeader|header)$/.test(name)) return ['output', 'Sets information on the outgoing response'];
  if (/^(?:fetch|axios|requests|httpx|urllib)(?:\.|$)|\.(?:fetch|request|getJSON)$/.test(name)) return ['network', 'Asks another service for data'];
  if (/(?:db|database|collection|prisma|supabase|knex|sql|cursor)\b/i.test(name) && /(?:insert|create|update|delete|save|write|execute|query)/i.test(name)) return ['storage', 'Changes or queries stored data'];
  if (/(?:db|database|collection|prisma|supabase|knex|sql|cursor)\b/i.test(name)) return ['storage', 'Works with stored data'];
  if (/(?:readFile|open|read_text|read_bytes|readdir)/.test(name)) return ['input', 'Reads a file or directory'];
  if (/(?:writeFile|write_text|write_bytes|mkdir|unlink)/.test(name)) return ['storage', 'Changes files on disk'];
  if (/\.(?:json|send|render|redirect|end)$/.test(name) && /^(?:res|response|reply|self|this)\b/.test(name)) return ['output', 'Sends a result or response'];
  if (/^(?:assert|expect)|\.(?:equal|toBe|toEqual|raises)$/.test(name)) return ['test', 'Checks an expected result'];
  if (/\.(?:on|once|addEventListener|subscribe|listen)$/.test(name)) return ['event', 'Connects a handler to an event'];
  if (/\.(?:get|post|put|patch|delete|route|use)$/.test(name) && /(?:app|router|server)/i.test(name)) return ['event', 'Registers a route or middleware'];
  if (/\.(?:map|filter|reduce|sort|flatMap|join|split|replace|parse|stringify)$/.test(name)) return ['transform', { map: 'Transforms each item in a collection', filter: 'Keeps the items that match a condition', reduce: 'Combines items into a result', sort: 'Puts items into an order', flatMap: 'Transforms items and flattens the results', join: 'Combines pieces into text', split: 'Breaks text into pieces', replace: 'Replaces matching content' }[last(name)] || 'Transforms or organizes a value'];
  if (/^(?:require|import)$/.test(name)) return ['import', 'Loads a dependency'];
  if (/^(?:console|logging|logger)\.|\.(?:log|debug|warn|error|info)$/.test(name)) return ['observe', 'Records a message for inspection'];
  return ['call', `Calls ${name}`];
}
function explain(part) {
  if (part.kind === 'type') return `Defines the ${part.typeShape?.kind || 'type'} “${part.name}”. Its fields, annotations and generic parameters form a contract used by producers and consumers.`;
  if (part.kind === 'test') return `Checks “${part.name}”. Its assertions are visible inside this part; the test has not been run here.`;
  if (part.kind === 'class') return `Defines ${part.name}, a reusable type that groups related state and behavior.`;
  if (part.kind === 'handler') return `A callback passed to ${part.callbackFor}. The surrounding code decides when it runs${part.parameters.length ? '; it receives ' + part.parameters.join(', ') : ''}. Follow its operations to see what it does after it starts.`;
  if (part.kind === 'module') return 'Sets up this file: imports dependencies, creates shared values, and connects top-level behavior.';
  if (part.kind === 'value') return `Defines ${part.name}, a named value other code can use.`;
  const kinds = new Set(part.operations.map(o => o.kind)), effects = [];
  if (kinds.has('input')) effects.push('reads input from files');
  if (kinds.has('network')) effects.push('communicates with another service');
  if (kinds.has('storage')) effects.push('works with persistent data');
  if (kinds.has('event')) effects.push('connects routes or event handlers');
  if (kinds.has('transform')) effects.push('transforms values');
  if (kinds.has('output')) effects.push('sends a response');
  if (part.guards) effects.push('checks conditions before continuing');
  return `${part.async ? 'An asynchronous' : 'A'} ${part.kind === 'method' ? 'method' : 'function'} named “${words(part.name)}”${part.parameters.length ? ` that receives ${part.parameters.slice(0, 5).join(', ')}` : ' with no named inputs detected'}.${effects.length ? ' Its source ' + effects.join(', ') + '.' : ' Follow its calls and return statements to see how it contributes.'}`;
}

const identifiers = expression => [...new Set(String(expression || '').match(/\b[A-Za-z_$][\w$]*\b/g) || [])].filter(name => !/^(?:const|let|var|return|yield|throw|raise|if|else|for|while|switch|case|break|continue|await|async|function|def|class|new|true|false|null|undefined|None|True|False|this|self)$/.test(name));
function enrichPart(part, source, mask, python, file, lineAt = lineLocator(source).at) {
  const controls = [], base = source.slice(part.bodyStart, part.end), baseMask = mask.slice(part.bodyStart, part.end);
  for (const m of baseMask.matchAll(/\b(if|else\s+if|else|switch|case|for|while|try|catch|except|finally)\b([^\n{:]*)/g)) {
    const absolute = part.bodyStart + m.index, line = lineAt(absolute), before = baseMask.slice(0, m.index), depth = python ? (source.split('\n')[line - 1]?.match(/^\s*/)?.[0].length || 0) : Math.max(0, (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length);
    controls.push({ id: `${part.id}:block:${absolute}`, owner: part.id, kind: /for|while/.test(m[1]) ? 'loop' : /try|catch|except|finally/.test(m[1]) ? 'error' : 'branch', label: m[1].replace(/\s+/g, ' '), line, endLine: part.endLine, depth, expression: source.slice(absolute, absolute + m[0].length).trim(), statements: [] });
  }
  const root = { id: `${part.id}:block:root`, owner: part.id, kind: 'entry', label: 'entry', line: part.line, endLine: part.endLine, depth: -1, statements: [] };
  for (let i = 0; i < controls.length; i++) {
    const block = controls[i], next = controls.slice(i + 1).find(item => item.depth <= block.depth);
    block.endLine = Math.max(block.line, Math.min(part.endLine, (next?.line || part.endLine + 1) - 1));
    block.parent = controls.slice(0, i).reverse().find(item => item.depth < block.depth && item.endLine >= block.line)?.id || root.id;
  }
  const blocks = [root, ...controls];
  const definitions = new Map((part.parameterDetails || []).map(param => [param.name, part.id])), flows = [];
  for (const operation of part.operations) {
    const block = controls.filter(item => operation.line >= item.line && operation.line <= item.endLine).sort((a, b) => b.depth - a.depth || b.line - a.line)[0] || root;
    operation.block = block.id; block.statements.push(operation.id);
    operation.await = /\bawait\b/.test(operation.expression || '');
    const names = identifiers(operation.expression), writes = operation.kind === 'value' ? [operation.name] : [];
    const reads = names.filter(name => !writes.includes(name) && name !== operation.name.split('.').at(-1));
    operation.reads = reads; operation.writes = writes;
    for (const name of reads) if (definitions.has(name)) flows.push({ id: `${definitions.get(name)}>${operation.id}:value:${name}`, from: definitions.get(name), to: operation.id, owner: part.id, kind: 'value', value: name, line: operation.line, evidence: `${part.path}:${operation.line}` });
    for (const name of writes) definitions.set(name, operation.id);
  }
  part.blocks = blocks; part.valueFlows = flows;
  const text = source.slice(part.start, part.end), lenses = new Set(['structure']);
  if (part.guards || controls.some(block => block.kind === 'error') || part.operations.some(op => ['guard'].includes(op.kind))) lenses.add('errors');
  if (part.async || part.operations.some(op => op.await || op.kind === 'event')) lenses.add('async');
  if (part.operations.some(op => op.kind === 'network')) lenses.add('network');
  if (part.operations.some(op => ['input','output','storage'].includes(op.kind))) lenses.add('io');
  if (/(?:readFile|writeFile|readdir|mkdir|unlink|open\(|read_text|write_text)/.test(text)) lenses.add('filesystem');
  if ((file.env || []).some(item => item.line >= part.line && item.line <= part.endLine) || ['config','schema'].includes(part.kind)) lenses.add('config');
  if (part.operations.some(op => op.kind === 'observe')) lenses.add('logging');
  if (/\b(?:eval|exec|spawn|child_process|crypto|password|token|secret|authorize|authenticate|cors|sanitize|escape|deserialize)\b/i.test(text)) lenses.add('security');
  if (file.history?.churn) lenses.add('churn');
  part.lenses = [...lenses];
}

function structuredParts(file, source) {
  const lines = source.split('\n'), lineAt = lineLocator(source).at; let serial = 0;
  const part = (name, kind, line, endLine, summary, operations = []) => {
    const idName = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 180);
    const id = `${file.path}::${kind}:${idName}:${line}:${serial++}`;
    return { id, path: file.path, system: file.system, name, kind, line, endLine, start: lines.slice(0, line - 1).join('\n').length, bodyStart: 0, end: source.length, parameters: [], async: false, operations: operations.map((o, i) => ({ ...o, owner: id, id: id + ':op:' + i })), returns: [], guards: 0, children: [], summary };
  };
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(file.path)) {
    const w = parseWorkflow(file.path, source);
    return [{...part('Workflow trigger', 'trigger', 1, Math.max(1,(w.jobs[0]?.line||lines.length+1)-1), w.triggers.length ? `Starts this workflow when the configured events occur: ${w.triggers.join(', ')}. Filters and conditions in the source can limit when it runs.` : 'The workflow event declaration is available in its source; no simple trigger was resolved.'), triggers:w.triggers}, ...w.jobs.map((j, i) => ({ ...part(j.id, 'job', j.line, (w.jobs[i + 1]?.line || lines.length + 1) - 1, `${j.summary} Uses ${j.runner}. ${j.condition ? 'Condition: ' + j.condition + '. ' : ''}These are declared automation steps; nothing runs in this workbench.`, j.steps.map(s => ({ name: s.name || s.uses || 'Run command', kind: 'automation', label: s.uses ? 'Runs a reusable action' : 'Runs a configured command', expression: s.run || s.uses, line: s.line }))), parameters: w.triggers, needs: j.needs }))];
  }
  if (file.language === 'JSON') {
    try {
      const value = JSON.parse(source), entries = value && typeof value === 'object' ? Object.entries(value) : [['value', value]];
      return entries.map(([key, value]) => {
        const line = lineAt(Math.max(0, source.indexOf(JSON.stringify(key)))), nested = value && typeof value === 'object' ? Object.entries(value) : [[key, value]];
        const known = { scripts: 'Defines the commands available for developing, testing and publishing this project.', dependencies: 'Lists libraries this project needs when it runs.', devDependencies: 'Lists tools used to build, develop or test this project.', compilerOptions: 'Configures how TypeScript checks and compiles this code.', exports: 'Declares which entry points other packages can import.', paths: 'Maps shorthand import names to source paths.' };
        return part(key, 'config', line, lines.length, Object.hasOwn(known,key) ? known[key] : `Defines the “${key}” setting in this configuration file.`, nested.map(([name, data]) => ({ name, kind: 'value', label: ['dependencies', 'devDependencies'].includes(key) ? 'Required package and version range' : 'Configuration value', expression: JSON.stringify({ [name]: data }, null, 2).slice(0, 4000), line: Math.max(line, lineAt(Math.max(0, source.indexOf(JSON.stringify(name), source.indexOf(JSON.stringify(key)))))) })));
      });
    } catch { return [part('Configuration', 'config', 1, lines.length, 'This file could not be parsed as standard JSON. Inspect its source; comments or another JSON dialect may be present.')]; }
  }
  if (file.language === 'Dockerfile') {
    const starts = lines.flatMap((text, i) => /^FROM\s/i.test(text) ? [i] : []); if (!starts.length) starts.push(0);
    return starts.map((start, i) => { const end = starts[i + 1] ?? lines.length, instructions = lines.slice(start, end).flatMap((text, n) => { const m = /^(FROM|RUN|COPY|ADD|ENV|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ARG|USER|HEALTHCHECK|LABEL)\s+(.+)$/i.exec(text); return m ? [{ name: m[1], kind: 'automation', label: 'Container build or runtime instruction', expression: text, line: start + n + 1 }] : []; }); return part(lines[start] || 'Container definition', 'job', start + 1, end, 'Defines a container stage. Instructions are displayed in source order; this workbench does not build or run it.', instructions); });
  }
  if (['YAML', 'TOML', 'Text'].includes(file.language) && /\.(?:ya?ml|toml|ini)$/.test(file.path)) {
    const starts = lines.flatMap((text, i) => /^[\w.-]+\s*:|^\[[^\]]+\]/.test(text) ? [i] : []); if (!starts.length) starts.push(0);
    return starts.map((start, i) => { const end = starts[i + 1] ?? lines.length; return part(lines[start].replace(/:\s*$/, '') || 'Configuration', 'config', start + 1, end, 'A configuration section that declares settings or structured data. Its exact values and source are available below.', lines.slice(start + 1, end).flatMap((text, n) => { const m = /^\s*([\w.-]+)\s*[:=]\s*(.*)/.exec(text); return m ? [{ name: m[1], kind: 'value', label: 'Declared configuration value', expression: text.trim(), line: start + n + 2 }] : []; })); });
  }
  if (file.language === 'SQL') {
    return [...source.matchAll(/(?:^|;)\s*([\s\S]*?)(?=;|$)/g)].filter(m => m[1].trim()).map((m, i) => { const definition = /\bCREATE\s+(?:TABLE|VIEW|INDEX|FUNCTION)\s+(?:IF\s+NOT\s+EXISTS\s+)?([\w."`]+)/i.exec(m[1]), line = lineAt(m.index); return part(definition?.[1] || `SQL statement ${i + 1}`, definition ? 'schema' : 'query', line, lineAt(m.index + m[0].length), definition ? 'Declares a database object. Read its columns, constraints and source before changing the data shape.' : 'A database statement. Its source specifies the data operation; it is never run here.', [{ name: m[1].trim().split(/\s/)[0], kind: 'storage', label: 'Declared SQL operation', expression: m[1].trim(), line }]); });
  }
  if (['CSS', 'SCSS'].includes(file.language)) {
    const commentMask = source.replace(/\/\*[\s\S]*?\*\//g, value => value.replace(/[^\r\n]/g, ' '));
    return [...commentMask.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => {
      const rawSelector = source.slice(m.index, m.index + m[1].length), selector = rawSelector.trim().replace(/\s+/g, ' '), bodyStart = m.index + m[1].length + 1, body = source.slice(bodyStart, bodyStart + m[2].length), line = lineAt(m.index + Math.max(0, rawSelector.search(/\S/)));
      return part(selector.slice(0, 180), 'style', line, lineAt(m.index + m[0].length), 'Styles the interface elements matched by this selector. Each declaration controls a visual property.', [...body.matchAll(/([\w-]+)\s*:\s*([^;]+);?/g)].map(d => ({ name: d[1], kind: 'value', label: 'Visual style property', expression: `${d[1]}: ${d[2]}`, line: lineAt(bodyStart + d.index) })));
    }).filter(item => item.name);
  }
  if (!['Markdown','MDX'].includes(file.language) && !/\.(?:txt|md)$/i.test(file.path) && !/(?:^|\/)(?:README|LICENSE)(?:\.|$)/i.test(file.path)) return sourceSections(file,source);
  const headings = file.language === 'Markdown' || file.language === 'MDX' ? lines.flatMap((text, i) => /^#{1,3}\s/.test(text) ? [i] : []) : [];
  if (!headings.length) headings.push(0);
  return headings.map((start, i) => part(lines[start].replace(/^#+\s*/, '').slice(0, 80) || file.path.split('/').at(-1), 'document', start + 1, headings[i + 1] ?? lines.length, 'Source content from this file. Open the exact section to read its instructions, structure or documentation.'));
}

function sourceSections(file, source, operations=[]) {
  const lines=source.split('\n'), sections=[]; let offset=0;
  for(let start=0;start<lines.length;start+=28){const end=Math.min(lines.length,start+28), id=`${file.path}::section:${start+1}`, length=lines.slice(start,end).join('\n').length;
    sections.push({id,path:file.path,system:file.system,name:`Source L${start+1}–${end}`,kind:'section',line:start+1,endLine:end,start:offset,bodyStart:offset,end:offset+length,parameters:[],returns:[],children:[],guards:0,operations:operations.filter(o=>o.line>start&&o.line<=end).map(o=>({...o,owner:id})),summary:'A consecutive section of this file. Its source is available in full; the static reader has not resolved a named function or structural declaration for this syntax.'});offset+=length+1;}
  return sections;
}

export function dissectFile(file, source) {
  if (file.language === 'HTML') { const elements=markupParts(file,source); return elements.length?elements:structuredParts(file,source); }
  if (!/^(?:JavaScript|TypeScript|Python|Go|Rust|Java|Kotlin|C#|C|C\+\+|Ruby|PHP|Swift|Scala|Elixir|Vue|Svelte|Shell|PowerShell)$/.test(file.language)) return structuredParts(file, source);
  const python = /\.pyi?$/.test(file.path), js = /\.[cm]?[jt]sx?$|\.(?:vue|svelte)$/.test(file.path), mask = masked(source, python), parts = [], seen = new Set(), occupiedBodies = new Set(), sourceLines = source.split('\n'), locations = lineLocator(source), lineAt = locations.at;
  const add = (name, kind, start, bodyStart, end, parameters = '', isAsync = false) => {
    if (skipCalls.has(name) || seen.has(bodyStart + ':' + kind)) return;
    seen.add(bodyStart + ':' + kind);
    const parameterDetails = parameters.split(',').map(value => value.trim()).filter(Boolean).slice(0, 12).map(value => { const clean = value.replace(/^\.\.\./, ''), match = /^([\w$]+)\s*(?:\??:\s*([^=]+))?(?:=\s*(.+))?$/.exec(clean); return { name: match?.[1] || clean.split(/[=:]/)[0].trim(), type: match?.[2]?.trim() || null, default: match?.[3]?.trim() || null }; });
    const line = lineAt(start), p = { id: file.path + '::' + kind + ':' + name + ':' + line + ':' + start, path: file.path, system: file.system, name, kind, line, endLine: lineAt(Math.max(start, end - 1)), start, bodyStart, end, parameters: parameterDetails.map(item => item.name), parameterDetails, async: isAsync, operations: [], returns: [], guards: 0, children: [], summary: '' };
    parts.push(p); occupiedBodies.add(bodyStart); return p;
  };
  if (python) {
    const lines = mask.split('\n'), offsets = []; let position = 0; lines.forEach(l => { offsets.push(position); position += l.length + 1; });
    for (const m of mask.matchAll(/^(\s*)(async\s+)?(def|class)\s+(\w+)\s*(?:\(([^)]*)\))?[^\n]*:/gm)) {
      const start = m.index + m[1].lastIndexOf('\n') + 1, line = lineAt(start) - 1, indent = lines[line].match(/^\s*/)[0].length; let endLine = lineAt(m.index + m[0].length);
      while (endLine < lines.length && (!lines[endLine].trim() || lines[endLine].trim().startsWith('#') || lines[endLine].match(/^\s*/)[0].length > indent)) endLine++;
      add(m[4], m[3] === 'class' ? 'class' : m[4].startsWith('test_') ? 'test' : indent ? 'method' : 'function', offsets[line], m.index + m[0].length, offsets[endLine] ?? source.length, m[5] || '', !!m[2]);
    }
  } else {
    const declarations = [
      { regex: /\b(async\s+)?function\s+([\w$]+)\s*\(([^)]*)\)\s*(?::[^={;]+)?\s*\{/g, kind: 'function', name: 2, params: 3 },
      { regex: /\b(?:const|let|var)\s+([\w$]+)\s*=\s*(async\s+)?(?:function\s*\(([^)]*)\)|\(([^)]*)\)\s*(?::[^={\n]+)?=>|([\w$]+)\s*=>)\s*\{/g, kind: 'function', name: 1, params: 3 },
      { regex: /\b([\w$]+(?:\.[\w$]+)+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)\s*\{/g, kind: 'method', name: 1, params: 3 },
      { regex: /\bclass\s+([\w$]+)[^{;\n]*\{/g, kind: 'class', name: 1 },
      { regex: /(?:^|\n)[ \t]*(?:(?:public|private|protected|static|override|async|get|set)\s+)*([\w$]+)\s*\(([^)\n]*)\)\s*(?::[^={;]+)?\s*\{/g, kind: 'method', name: 1, params: 2 }
    ];
    if (file.language === 'Go') declarations.push({ regex: /\bfunc\s+(?:\([^)]*\)\s*)?(\w+)\s*\(([^)]*)\)[^{;]*\{/g, kind: 'function', name: 1, params: 2 });
    if (file.language === 'Rust') declarations.push({ regex: /\bfn\s+(\w+)(?:<[^>]+>)?\s*\(([^)]*)\)[^{;]*\{/g, kind: 'function', name: 1, params: 2 });
    if (file.language === 'Kotlin') declarations.push({ regex: /\bfun\s+(\w+)\s*\(([^)]*)\)[^{;]*\{/g, kind: 'function', name: 1, params: 2 });
    if (/^(?:Java|C#|C|C\+\+)$/.test(file.language)) declarations.push({ regex: /(?:^|\n)[ \t]*(?:(?:public|private|protected|static|final|virtual|async|override)\s+)*[\w<>?\[\],*]+\s+(\w+)\s*\(([^)]*)\)[^{;\n]*\{/g, kind: 'method', name: 1, params: 2 });
    for (const { regex, kind, name, params } of declarations) for (const m of mask.matchAll(regex)) { const brace = m.index + m[0].lastIndexOf('{'); if (occupiedBodies.has(brace + 1)) continue; add(m[name], kind, m.index + (m[0].startsWith('\n') ? 1 : 0), brace + 1, closing(mask, brace), params ? m[params] || m[4] || m[5] || '' : '', /\basync\b/.test(m[0])); }
    if (js) {
      for (const m of source.matchAll(/\b([\w$]+(?:\.[\w$]+)*)\s*\([^;{}\n]*?(?:async\s+)?(?:function\s*\(([^)]*)\)|\(([^)]*)\)\s*=>)\s*\{/g)) {
        if (/^(?:test|it)(?:\.|$)/.test(m[1])) continue;
        if (!mask.slice(m.index, m.index + m[1].length).trim()) continue;
        const brace = m.index + m[0].lastIndexOf('{'); if (occupiedBodies.has(brace + 1)) continue;
        const arg = m[0].match(/\(\s*['"]([^'"]+)['"]/)?.[1], name = m[1] + (arg ? ' ' + arg : '') + ' callback';
        const p = add(name, 'handler', m.index, brace + 1, closing(mask, brace), m[2] || m[3] || '', /\basync\b/.test(m[0])); if (p) { p.callbackFor = m[1]; p.registrationLine = lineAt(m.index); }
      }
      for (const m of source.matchAll(/\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(\s*['"`]([^'"`\n]+)['"`][^\n]*?=>\s*\{/g)) { const brace = m.index + m[0].lastIndexOf('{'); if (mask.slice(m.index, m.index + 4).trim()) add(m[1], 'test', m.index, brace + 1, closing(mask, brace)); }
      for (const m of mask.matchAll(/\b(?:export\s+)?(?:const|let|var)\s+([\w$]+)\s*=\s*(async\s+)?(?:\(([^)\n]*)\)|([\w$]+))\s*=>\s*(?!\s*\{)([^;\n]+)/g)) {
        if (!parts.some(p => m.index >= p.start && m.index < p.end)) { const start = m.index + m[0].indexOf('=>') + 2, expression = mask.slice(start).trimStart(), offset = mask.slice(start).length - expression.length, end = expression.startsWith('(') ? closing(mask, start + offset, '(', ')') : m.index + m[0].length; add(m[1], 'function', m.index, start, end, m[3] || m[4], !!m[2]); }
      }
    }
  }
  const parentFor = containmentLookup(parts, part => part.start, part => part.end);
  for (const p of parts) {
    const parent = parentFor(p.start, p.end, p);
    if (parent) { p.parent = parent.id; parent.children.push(p.id); }
  }
  const setup = add('File setup', 'module', 0, 0, source.length);
  let findOwner = containmentLookup(parts.filter(part => part !== setup), part => part.bodyStart, part => part.end);
  const ownerAt = position => findOwner(position, position + 1) || setup;
  for (const m of mask.matchAll(/\b([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)\s*\(/g)) {
    const name = m[1].replace(/\s/g, ''), position = m.index; if (skipCalls.has(name)) continue;
    if (parts.some(p => p !== setup && p.kind !== 'handler' && position >= p.start && position < p.bodyStart)) continue;
    const owner = ownerAt(position), [kind, label] = operationKind(name), end = Math.min(closing(mask, mask.indexOf('(', position), '(', ')'), source.indexOf('\n', position) < 0 ? source.length : source.indexOf('\n', position));
    const argument = source.slice(mask.indexOf('(', position) + 1, end).match(/^\s*(['"`])([^'"`\n]{1,100})\1/)?.[2];
    const argumentsText = mask.slice(mask.indexOf('(', position) + 1, end - 1), references = /\.(?:map|filter|reduce|forEach|sort|then|catch|on|once|use|get|post|route|addEventListener)$/.test(name) ? argumentsText.split(',').map(x => x.trim()).filter(x => /^[\w$]+(?:\.[\w$]+)*$/.test(x)) : [];
    owner.operations.push({ id: owner.id + ':op:' + position, owner: owner.id, name, kind, label, line: lineAt(position), offset: position, argument: argument || null, references, expression: source.slice(Math.max(owner.bodyStart, position - (/\bawait\s*$/.test(mask.slice(Math.max(owner.bodyStart, position - 20), position)) ? 6 : 0)), Math.min(end, position + 180)).trim() });
  }
  for (const m of mask.matchAll(/\b(return|yield|throw|raise|if)\b([^\n;]*)/g)) {
    const owner = ownerAt(m.index);
    if (m[1] === 'if') { owner.guards++; owner.operations.push({ id: owner.id + ':decision:' + m.index, owner: owner.id, name: 'if', kind: 'decision', label: 'Chooses a path based on a condition', line: lineAt(m.index), expression: source.slice(m.index, m.index + m[0].length).trim() }); }
    else if (m[1] === 'return' || m[1] === 'yield') { owner.returns.push({ line: lineAt(m.index), expression: source.slice(m.index, Math.min(source.length, m.index + m[0].length)).trim() }); owner.operations.push({ id: owner.id + ':return:' + m.index, owner: owner.id, name: m[1], kind: 'result', label: m[1] === 'return' ? 'Gives a value back to its caller' : 'Produces the next value', line: lineAt(m.index), expression: source.slice(m.index, m.index + m[0].length).trim() }); }
    else owner.operations.push({ id: owner.id + ':op:' + m.index, owner: owner.id, name: m[1], kind: 'guard', label: 'Stops this path with an error', line: lineAt(m.index), expression: source.slice(m.index, m.index + m[0].length).trim() });
  }
  for (const m of mask.matchAll(/\b(for|while|catch|except)\b([^\n{]*)/g)) { const owner = ownerAt(m.index); owner.operations.push({ id: owner.id + ':control:' + m.index, owner: owner.id, name: m[1], kind: /for|while/.test(m[1]) ? 'loop' : 'guard', label: /for|while/.test(m[1]) ? 'Repeats the work inside this loop' : 'Handles an error from the preceding work', line: lineAt(m.index), expression: source.slice(m.index, m.index + m[0].length).trim() }); }
  for (const m of mask.matchAll(python ? /^[ \t]*([\w]+)(?:[ \t]*:[^=\n]+)?[ \t]*=(?!=)([^\n]*)/gm : /\b(?:const|let|var)\s+([\w$]+)\s*=(?!=)([^\n;]*)/g)) {
    if (parts.some(p => p !== setup && m.index >= p.start && m.index < p.bodyStart)) continue;
    const owner = ownerAt(m.index); owner.operations.push({ id: owner.id + ':value:' + m.index, owner: owner.id, name: m[1], kind: 'value', label: `Creates a value named ${m[1]}`, line: lineAt(m.index), expression: source.slice(m.index, Math.min(m.index + m[0].length, m.index + 180)).trim() });
  }
  // Give static type contracts their own inspectable part and wire them later to producers/consumers.
  for (const fact of file.types || []) if (!parts.some(part => part.name === fact.name && part.line === fact.line)) {
    const start = locations.start(fact.line), lineText = sourceLines[fact.line - 1] || '';
    const typed = add(fact.name, 'type', start, start, Math.min(source.length, start + lineText.length)); if (typed) typed.typeShape = fact;
  }
  // Give declarations without callable bodies their own inspectable part.
  for (const symbol of file.symbols || []) if (!parts.some(p => p !== setup && (p.name === symbol.name || p.line === symbol.line))) {
    const lineText = sourceLines[symbol.line - 1] || '';
    if (symbol.exported && !/^\s*(?:import|from)\b/.test(lineText)) { const position = locations.start(symbol.line); add(symbol.name, 'value', position, position, position + lineText.length); }
  }
  parts.forEach(p => {
    p.operations.sort((a, b) => a.line - b.line || (a.offset || 0) - (b.offset || 0)); enrichPart(p, source, mask, python, file, lineAt); p.summary = explain(p);
    const before = source.slice(Math.max(0, p.start - 3000), p.start), commentStart = before.lastIndexOf('/**'), commentEnd = before.lastIndexOf('*/');
    if (commentStart >= 0 && commentEnd > commentStart && /^[\s\w$.=]*$/.test(before.slice(commentEnd + 2)) && before.slice(commentEnd + 2).length < 80) p.doc = before.slice(commentStart + 3, commentEnd).split('\n').map(l => l.replace(/^\s*\* ?/, '').trim()).filter(l => !l.startsWith('@')).join('\n').trim().slice(0, 1500);
    if (python) { const doc = /^\s*(?:"""([\s\S]*?)"""|'''([\s\S]*?)''')/.exec(source.slice(p.bodyStart, p.end)); if (doc) p.doc = (doc[1] || doc[2]).trim().slice(0, 1500); }
    if (js && /(?:return|=>)\s*\(?\s*</.test(source.slice(p.start, p.end))) p.summary += ' Its source also defines interface elements in JSX.';
  });
  const result=parts.filter(p => p !== setup || p.operations.length || parts.length === 1);
  if(result.length===1 && result[0]===setup && !js && !python) return sourceSections(file,source,setup.operations);
  if (/\.(?:jsx|tsx|vue|svelte)$/.test(file.path)) {
    findOwner = containmentLookup(parts.filter(part => part !== setup), part => part.bodyStart, part => part.end);
    const elements=markupParts(file,source);
    for(const p of elements) if(!p.parent) {const owner=ownerAt(p.start);if(owner&&owner!==setup){p.parent=owner.id;owner.children.push(p.id);}}
    result.push(...elements);
  }
  return result.sort((a, b) => a.line - b.line || a.kind.localeCompare(b.kind));
}

const appendIndex = (map, key, value) => { const values = map.get(key); if (values) values.push(value); else map.set(key, [value]); };

// Exact reverse reachability with one result per strongly connected component. A
// bounded bitset fast path shares ancestor work across the DAG; very large graphs
// use a memory-bounded traversal while still reusing the result for cycle members.
function reverseReachability(parts, edges, incoming, outgoing) {
  const ids = parts.map(part => part.id), visited = new Set(), finished = [];
  for (const root of ids) {
    if (visited.has(root)) continue;
    visited.add(root);
    const stack = [[root, 0]];
    while (stack.length) {
      const frame = stack[stack.length - 1], targets = outgoing.get(frame[0]) || [];
      if (frame[1] < targets.length) {
        const next = targets[frame[1]++];
        if (!visited.has(next)) { visited.add(next); stack.push([next, 0]); }
      } else { finished.push(frame[0]); stack.pop(); }
    }
  }
  const componentOf = new Map(), components = [];
  for (let at = finished.length - 1; at >= 0; at--) {
    const root = finished[at]; if (componentOf.has(root)) continue;
    const component = components.length, members = [], stack = [root]; componentOf.set(root, component);
    while (stack.length) {
      const id = stack.pop(); members.push(id);
      for (const next of incoming.get(id) || []) if (!componentOf.has(next)) { componentOf.set(next, component); stack.push(next); }
    }
    components.push(members);
  }
  const componentIncoming = components.map(() => new Set()), componentOutgoing = components.map(() => new Set()), cyclic = components.map(members => members.length > 1);
  for (const edge of edges) {
    const from = componentOf.get(edge.from), to = componentOf.get(edge.to);
    if (from == null || to == null) continue;
    if (from === to) { if (edge.from === edge.to) cyclic[to] = true; continue; }
    componentIncoming[to].add(from); componentOutgoing[from].add(to);
  }
  const indegree = componentIncoming.map(values => values.size), queue = [];
  for (let i = 0; i < indegree.length; i++) if (!indegree[i]) queue.push(i);
  const order = [];
  for (let head = 0; head < queue.length; head++) {
    const component = queue[head]; order.push(component);
    for (const next of componentOutgoing[component]) if (--indegree[next] === 0) queue.push(next);
  }
  const counts = new Uint32Array(components.length), words = Math.ceil(components.length / 32), bitsetBytes = components.length * words * 4;
  if (bitsetBytes <= 64 * 1024 * 1024) {
    const ancestors = components.map(() => new Uint32Array(words));
    for (const component of order) {
      const result = ancestors[component];
      for (const before of componentIncoming[component]) {
        const inherited = ancestors[before];
        for (let word = 0; word < words; word++) result[word] |= inherited[word];
        result[before >>> 5] |= 1 << (before & 31);
      }
      if (cyclic[component]) result[component >>> 5] |= 1 << (component & 31);
    }
    for (let component = 0; component < components.length; component++) {
      let count = 0;
      for (let word = 0; word < words; word++) {
        let bits = ancestors[component][word] >>> 0;
        while (bits) { const bit = 31 - Math.clz32(bits & -bits), target = word * 32 + bit; if (target < components.length) count += components[target].length; bits = (bits & (bits - 1)) >>> 0; }
      }
      counts[component] = count;
    }
  } else {
    const marks = new Uint32Array(components.length), work = [], maxStamp = 0xffffffff; let stamp = 0;
    for (let component = 0; component < components.length; component++) {
      if (++stamp === maxStamp) { marks.fill(0); stamp = 1; }
      work.length = 0; let head = 0, count = 0;
      for (const before of componentIncoming[component]) { marks[before] = stamp; work.push(before); }
      if (cyclic[component] && marks[component] !== stamp) { marks[component] = stamp; work.push(component); }
      while (head < work.length) {
        const current = work[head++]; count += components[current].length;
        for (const before of componentIncoming[current]) if (marks[before] !== stamp) { marks[before] = stamp; work.push(before); }
      }
      counts[component] = count;
    }
  }
  const result = new Map();
  for (let component = 0; component < components.length; component++) for (const id of components[component]) result.set(id, counts[component]);
  return result;
}

function containmentLookup(values, startOf, endOf) {
  const order = new Map(values.map((value, index) => [value, index])), sorted = [...values].sort((a, b) => startOf(a) - startOf(b) || order.get(a) - order.get(b)), maximumEnd = [];
  for (let index = 0, maximum = -1; index < sorted.length; index++) { maximum = Math.max(maximum, endOf(sorted[index])); maximumEnd.push(maximum); }
  return (start, requiredEnd, excluded = null) => {
    let low = 0, high = sorted.length;
    while (low < high) { const middle = (low + high) >>> 1; if (startOf(sorted[middle]) <= start) low = middle + 1; else high = middle; }
    let best = null, bestSpan = Infinity, bestOrder = Infinity;
    for (let index = low - 1; index >= 0; index--) {
      if (maximumEnd[index] < requiredEnd) break;
      const candidate = sorted[index]; if (candidate === excluded || endOf(candidate) < requiredEnd) continue;
      const span = candidate.end - candidate.start, candidateOrder = order.get(candidate);
      if (span < bestSpan || (span === bestSpan && candidateOrder < bestOrder)) { best = candidate; bestSpan = span; bestOrder = candidateOrder; }
    }
    return best;
  };
}

export function buildCodeAnatomy(snapshot, scope = '') {
  const files = snapshot.files.filter(f => (!scope || f.system === scope) && f.readable), parts = files.filter(f => f.analyzed).flatMap(f => {const source=snapshot.contents[f.path]||'', found=dissectFile(f,source);return found.length?found:sourceSections(f,source);});
  const byId = new Map(parts.map(p => [p.id, p])), byFile = new Map(files.map(f => [f.path, []])), fileByPath = new Map(files.map(file => [file.path, file])), partOrder = new Map(), edges = [], unresolved = [];
  for (let index = 0; index < parts.length; index++) { const part = parts[index]; partOrder.set(part.id, index); if (!byFile.has(part.path)) byFile.set(part.path, []); byFile.get(part.path).push(part); }
  const nameByFile = new Map(), handlerByFile = new Map();
  for (const [path, owned] of byFile) {
    const names = new Map(), handlers = new Map();
    for (const part of owned) {
      if (part.kind !== 'module') appendIndex(names, part.name, part);
      if (part.kind === 'handler') { const key = `${part.callbackFor}\u0000${part.registrationLine}`; if (!handlers.has(key)) handlers.set(key, part); }
    }
    nameByFile.set(path, names); handlerByFile.set(path, handlers);
  }
  const referencesByFile = new Map();
  for (const edge of snapshot.edges) appendIndex(referencesByFile, edge.from, edge.to);
  const namedTargets = (path, name, allowLeaf) => {
    const names = nameByFile.get(path), exact = names?.get(name) || [], leaf = last(name);
    if (!allowLeaf || leaf === name) return exact;
    const short = names?.get(leaf) || [];
    if (!exact.length) return short; if (!short.length) return exact;
    return [...exact, ...short].sort((a, b) => partOrder.get(a.id) - partOrder.get(b.id));
  };
  const operations = parts.flatMap(p => p.operations), keys = new Set();
  for (const p of parts) for (const op of p.operations) {
    if (p.kind === 'element' || ['import', 'decision', 'result', 'value', 'guard', 'loop'].includes(op.kind)) continue;
    const local = namedTargets(p.path, op.name, !op.name.includes('.') || /^(?:this|self)\./.test(op.name));
    const registered = handlerByFile.get(p.path)?.get(`${op.name}\u0000${op.line}`);
    let target = registered || (local.length === 1 ? local[0] : null);
    if (!target) {
      const candidates = (referencesByFile.get(p.path) || []).flatMap(path => namedTargets(path, op.name, true));
      if (candidates.length === 1) target = candidates[0];
    }
    if (target && target.id !== p.id) {
      op.target = target.id;
      const key = p.id + '>' + target.id;
      if (!keys.has(key)) { keys.add(key); edges.push({ id: key, from: p.id, to: target.id, kind: 'call', line: op.line, path: p.path, operation: op.id, evidence: `${p.path}:${op.line}`, label: op.name }); }
    } else if (op.kind === 'call') unresolved.push(op);
    for (const reference of op.references || []) {
      const candidates = namedTargets(p.path, reference, false);
      if (candidates.length !== 1 || candidates[0].id === p.id) continue;
      const t = candidates[0], key = p.id + '>' + t.id;
      if (!keys.has(key)) { keys.add(key); edges.push({ id: key, from: p.id, to: t.id, kind: 'callback', line: op.line, path: p.path, operation: op.id, evidence: `${p.path}:${op.line}`, label: reference + ' callback' }); }
    }
  }
  const fileEdges = snapshot.edges.filter(e => byFile.has(e.from) && byFile.has(e.to));
  const link=(from,to,kind,line,label,operation=null)=>{const id=from+'>'+to+':'+kind;if(!keys.has(id)){keys.add(id);const p=byId.get(from);edges.push({id,from,to,kind,line,path:p.path,operation,evidence:p.path+':'+line,label});}};
  const elements = parts.filter(part => part.kind === 'element'), availableCache = new Map();
  const availableFor = path => {
    if (availableCache.has(path)) return availableCache.get(path);
    const paths = new Set([path, ...(referencesByFile.get(path) || [])]), available = [...paths].flatMap(candidate => byFile.get(candidate) || []).filter(part => part.kind !== 'element').sort((a, b) => partOrder.get(a.id) - partOrder.get(b.id)), byName = new Map(), styles = [];
    for (const part of available) { appendIndex(byName, part.name, part); if (part.kind === 'style') styles.push(part); }
    const indexed = { byName, styles }; availableCache.set(path, indexed); return indexed;
  };
  for(const p of elements) {
    if(p.parent&&byId.has(p.parent))link(p.parent,p.id,'contains',p.line,'Contains '+p.name);
    const available=availableFor(p.path), component=available.byName.get(p.tag)||[];if(component.length===1)link(p.id,component[0].id,'component',p.line,'Uses '+p.tag);
    for(const op of p.operations.filter(o=>o.reference)){const targets=available.byName.get(op.reference)||[];if(targets.length===1){op.target=targets[0].id;link(p.id,targets[0].id,'event',op.line,op.name+' → '+op.reference,op.id);}}
    const selectors=p.operations.flatMap(o=>o.name==='id'?['#'+o.value]:['class','className'].includes(o.name)&&!o.value.startsWith('{')?o.value.split(/\s+/).map(x=>'.'+x):[]);
    for(const style of available.styles)if(style.name.split(',').some(s=>selectors.includes(s.trim())))link(p.id,style.id,'style',p.line,'Styled by '+style.name);
  }
  for(const trigger of parts.filter(p=>p.kind==='trigger'))for(const job of (byFile.get(trigger.path)||[]).filter(p=>p.kind==='job'&&!p.needs?.length))link(trigger.id,job.id,'starts',job.line,'Starts '+job.name);
  for (const p of parts.filter(p => p.kind === 'job' && p.needs)) for (const needed of p.needs) { const before = (byFile.get(p.path) || []).find(t => t.kind === 'job' && t.name === needed); if (before) edges.push({ id: before.id + '>' + p.id, from: before.id, to: p.id, kind: 'needs', line: p.line, path: p.path, operation: before.operations.at(-1)?.id, evidence: `${p.path}:${p.line}`, label: needed + ' → ' + p.name }); }
  const dataEdges = parts.flatMap(part => part.valueFlows || []), typeParts = parts.filter(part => part.kind === 'type'), typeByName = new Map(typeParts.map(part => [part.name, part]));
  for (const part of parts.filter(part => part.kind !== 'type')) for (const parameter of part.parameterDetails || []) {
    const names = String(parameter.type || '').match(/\b[A-Za-z_$][\w$]*\b/g) || [];
    for (const name of names) { const type = typeByName.get(name); if (type && type.id !== part.id) dataEdges.push({ id: `${type.id}>${part.id}:type:${parameter.name}`, from: type.id, to: part.id, kind: 'type', value: parameter.name, line: part.line, evidence: `${part.path}:${part.line}` }); }
  }
  const incoming = new Map(parts.map(part => [part.id, []])), outgoing = new Map(parts.map(part => [part.id, []]));
  for (const edge of edges) { incoming.get(edge.to)?.push(edge.from); outgoing.get(edge.from)?.push(edge.to); }
  const blast = reverseReachability(parts, edges, incoming, outgoing);
  for (const part of parts) part.metrics = { fanIn: incoming.get(part.id)?.length || 0, fanOut: outgoing.get(part.id)?.length || 0, depth: (() => { let depth = 0, at = part; while (at.parent && byId.has(at.parent)) { depth++; at = byId.get(at.parent); } return depth; })(), cyclomatic: 1 + (part.blocks || []).filter(block => ['branch','loop','error'].includes(block.kind)).length, lines: Math.max(1, part.endLine - part.line + 1), operations: part.operations.length, blastRadius: blast.get(part.id) || 0, churn: fileByPath.get(part.path)?.history?.churn || 0 };
  const systemMetrics = (snapshot.orthogonality || []).filter(item => !scope || item.system === scope);
  return { repository: snapshot.repository, scope: scope || 'All systems', files, parts, byId, byFile, sources: snapshot.contents, operations, blocks: parts.flatMap(part => part.blocks || []), edges, dataEdges, fileEdges, unresolved, systems: snapshot.systems.filter(s => !scope || s.id === scope), systemMetrics, runtime: snapshot.runtime || {}, dependencies: snapshot.dependencies || [], coverage: { files: files.length, analyzed: files.filter(f => f.analyzed).length, parts: parts.length, operations: operations.length, blocks: parts.reduce((sum, part) => sum + (part.blocks?.length || 0), 0), valueFlows: dataEdges.filter(edge => edge.kind === 'value').length, typeLinks: dataEdges.filter(edge => edge.kind === 'type').length, calls: edges.length } };
}

export function focusedCodePacket(snapshot, paths, focus = {}, budget = 12000) {
  const contents = { ...snapshot.contents }, entries = Object.entries(focus).filter(([path]) => paths.includes(path) && typeof contents[path] === 'string').slice(0, 8);
  const focusParts = entries.map(([path, value]) => { const lines = contents[path].split('\n'), startLine = Math.max(1, Number(value.line) || 1), endLine = Math.min(lines.length, Number(value.endLine) || startLine); contents[path] = lines.slice(startLine - 1, endLine).join('\n'); return { path, name: String(value.name).slice(0, 150), startLine, endLine, note: 'Included source starts at startLine in the original file.' }; });
  const overhead = Math.ceil(JSON.stringify(focusParts, null, 2).length / 4) + 70;
  const packet = contextPacket({ ...snapshot, contents }, paths, Math.max(1000, budget - overhead));
  packet.focus = focusParts; packet.tokenEstimate.budget = budget;
  const size = () => Math.ceil(JSON.stringify(packet, null, 2).length / 4);
  while (size() > budget && packet.files.some(f => f.source?.length)) { const file = packet.files.find(f => f.source?.length); file.source = file.source.slice(0, Math.max(0, file.source.length - (size() - budget) * 4 - 80)); file.truncated = true; }
  packet.tokenEstimate.total = size(); packet.tokenEstimate.total = size(); return packet;
}
