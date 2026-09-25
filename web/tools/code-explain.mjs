// Explanations stay tied to visible syntax; this module never runs repository code.
const lineAt = (text, at) => text.slice(0, at).split('\n').length;
const short = text => String(text).replace(/\s+/g, ' ').trim().slice(0, 240);
const roles = { __proto__: null, html:'the document', head:'page metadata and linked resources', body:'the visible page', main:'the main page content', nav:'navigation links', header:'introductory content', footer:'closing information', section:'a section of related content', article:'a self-contained item', div:'a layout container', span:'a small piece of inline content', form:'a form that collects input', input:'a field where someone enters a value', textarea:'a field for longer text', select:'a choice of values', option:'one selectable choice', button:'an action someone can activate', a:'a link to another location', img:'an image', video:'a video player', audio:'an audio player', label:'a name for an input', ul:'a list', ol:'an ordered list', li:'one item in a list', table:'tabular information', tr:'a table row', td:'a table cell', th:'a table heading', p:'a paragraph', h1:'the main heading', h2:'a section heading', h3:'a subsection heading', script:'a script resource', link:'a linked resource', meta:'document metadata', template:'a reusable markup template' };
const attributeHelp = name => /^on[A-Z]|^on:|^@/.test(name) ? 'Connects a user or browser event to a handler' : /^aria-/.test(name) ? 'Describes this element to assistive technology' : ({__proto__:null,class:'Selects CSS classes for its appearance',className:'Selects CSS classes for its appearance',id:'Gives this element a unique page identifier',href:'Sets the destination of this link',src:'Sets the resource to load',type:'Chooses the kind of control or resource',value:'Supplies the value shown by this control',placeholder:'Shows a hint before a value is entered',disabled:'Controls whether this element can be used',required:'Requires a value before form submission',name:'Names the value submitted by this control',style:'Sets visual properties directly',key:'Identifies this item when a list changes',role:'Declares the accessibility role',alt:'Describes an image when it cannot be seen',title:'Provides additional descriptive text',action:'Sets where the form is submitted',method:'Sets how the form sends its values'})[name] || 'Supplies a setting or input to this element';

export function markupParts(file, source) {
  const nodes = [], stack = [], voids = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  // Keep offsets intact when hiding comments and script bodies from the tag scanner.
  const clean = source.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, s=>s.replace(/[^\n]/g,' '));
  const tokens = /<\/?([A-Za-z][\w.:-]*)(?:\s+(?:[^<>"'{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})*)?\s*\/?>/g;
  let rawTag = null;
  for (const m of clean.matchAll(tokens)) {
    const closing = m[0].startsWith('</'), tag = m[1];
    if (rawTag && !(closing && tag.toLowerCase() === rawTag)) continue;
    if (closing) {
      const index = stack.findLastIndex(p=>p.tag===tag);
      if(index>=0) { const p=stack[index]; p.end=m.index+m[0].length; p.endLine=lineAt(source,p.end-1); p.bodyEnd=m.index; stack.splice(index); }
      rawTag=null; continue;
    }
    // A lone TypeScript generic is not an element without a matching closing tag.
    if (/\.tsx?$/.test(file.path) && /^[A-Z]/.test(tag) && !m[0].endsWith('/>') && !clean.includes('</'+tag+'>',m.index)) continue;
    const id=file.path+'::element:'+tag+':'+m.index, line=lineAt(source,m.index), attributes=[];
    const body=m[0].slice(tag.length+1).replace(/\/?\s*>$/,'');
    for(const attr of body.matchAll(/([@:\w.-]+)(?:\s*=\s*("[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[^\s]+))?/g)) {
      const name=attr[1], expression=attr[0], value=(attr[2]||'true').replace(/^["']|["']$/g,''), event=/^on[A-Z]|^on:|^@/.test(name);
      attributes.push({id:id+':attr:'+attributes.length,owner:id,name,kind:event?'event':'value',attribute:true,label:attributeHelp(name),expression,line:lineAt(source,m.index+tag.length+1+attr.index),reference:event ? /^\{?\s*([\w$.]+)\s*\}?$/.exec(value)?.[1] : null,value});
    }
    const identifier=attributes.find(a=>a.name==='id')?.value, p={id,path:file.path,system:file.system,tag,name:'<'+tag+(identifier?' #'+identifier:'')+'>',kind:'element',line,endLine:lineAt(source,m.index+m[0].length-1),start:m.index,bodyStart:m.index+m[0].length,end:m.index+m[0].length,parameters:[],operations:attributes,returns:[],children:[],guards:0,summary:/^[A-Z]/.test(tag)?`Places the ${tag} component in the interface. Its attributes pass settings and event handlers into that component.`:`Defines ${roles[tag.toLowerCase()]||'an interface element'}. Its attributes control its content, appearance and behavior.`};
    if(stack.length){p.parent=stack.at(-1).id;stack.at(-1).children.push(id);}
    nodes.push(p);
    if(!m[0].endsWith('/>')&&!voids.has(tag.toLowerCase())) stack.push(p);
    if(['script','style'].includes(tag.toLowerCase())) rawTag=tag.toLowerCase();
  }
  for(const p of nodes) {
    if(p.bodyEnd==null) continue;
    let cursor=p.bodyStart; const own=[];
    for(const child of nodes.filter(n=>n.parent===p.id)){own.push([cursor,child.start]);cursor=child.end;}
    own.push([cursor,p.bodyEnd]);
    for(const [from,to] of own){const raw=source.slice(from,to), text=short(raw);if(!text||p.tag==='script'||p.tag==='style')continue; p.operations.push({id:p.id+':content:'+from,owner:p.id,name:text.startsWith('{')?'Dynamic content':'Visible text',kind:'output',label:text.startsWith('{')?'Displays a value produced by this expression':'Shows this text in the interface',expression:raw.trim().slice(0,1500),line:lineAt(source,from)});}
  }
  return nodes;
}

export function explainOperation(op) {
  const text=short(op.expression||''), name=op.name;
  if(op.attribute)return `${op.label}: ${text}.`;
  if(op.kind==='decision') return `Checks ${text.replace(/^if\s*\(?/,'').replace(/\)?\s*[:{]?$/,'')}. The result decides whether this branch runs.`;
  if(op.kind==='loop') return `Repeats a section of work using ${text}. The loop header determines the items or condition; inspect the body for what changes each time.`;
  if(op.kind==='result') return text==='return'?'Finishes this function without an explicit value.':`Hands ${text.replace(/^(?:return|yield)\s*/,'')} back to the code that requested it${name==='yield'?', one value at a time':''}.`;
  if(op.kind==='value'&&/^(?:const|let|var)\b|^\w+(?:\s*:[^=]+)?\s*=/.test(text)) return `Stores the result of ${text.slice(text.indexOf('=')+1).trim().replace(/;$/,'')} under the name “${name}”, so later code can use it.`;
  if(op.kind==='guard') return `${op.label}. ${text ? 'The source specifies: '+text : ''}`;
  if(op.kind==='call') return `Runs ${name}${text.includes('(')?' with '+(text.slice(text.indexOf('(')+1).replace(/\);?$/,'').trim()||'no explicit arguments'):' as written here'}. The called part determines the result and any other effects.`;
  if(op.kind==='automation') {
    if(/^actions\/checkout@/.test(text))return 'Downloads the repository into the workflow runner so later steps can read and build its code.';
    if(/^actions\/setup-node@/.test(text))return 'Prepares the requested Node.js environment for subsequent commands.';
    if(/^actions\/setup-python@/.test(text))return 'Prepares the requested Python environment for subsequent commands.';
    if(/upload-artifact@/.test(text))return 'Saves selected output files as downloadable workflow artifacts.';
    if(/download-artifact@/.test(text))return 'Restores artifacts produced by an earlier job or workflow.';
    if(/(?:npm|pnpm|yarn) (?:ci|install)/.test(text))return 'Installs the project dependencies declared by its package manifest and lockfile.';
    if(/(?:npm|pnpm|yarn) (?:run )?test|pytest|go test|cargo test/.test(text))return 'Runs the configured tests. Their results depend on an actual workflow run; this map shows the declared command.';
  }
  return `${op.label}${text?': '+text:'.'}`;
}

export function explainSourceLine(file, source, line, parts) {
  const text=source.split('\n')[line-1]||'', trim=text.trim(), containing=parts.filter(p=>p.line<=line&&p.endLine>=line).sort((a,b)=>(a.end-a.start)-(b.end-b.start)), owner=containing[0];
  const operations=parts.flatMap(p=>p.operations).filter(o=>o.line===line), explanations=operations.map(explainOperation);
  if(!explanations.length){
    if(!trim)explanations.push('A blank line separates nearby sections for readability. It performs no operation.');
    else if(/^\/\/|^#|^\/\*|^\*|^<!--/.test(trim))explanations.push('A source comment or document heading. It records information for people reading this file.');
    else if(/^(?:import|from|export .* from|use|using|#include)\b/.test(trim))explanations.push('Connects this file to another module, symbol or library. The dependency list shows any local source that was resolved.');
    else if(parts.some(p=>p.line===line))explanations.push(parts.filter(p=>p.line===line).map(p=>p.summary).join(' '));
    else if(/^[});\],]+;?$/.test(trim))explanations.push('Closes the surrounding block, expression or collection. Read it with the opening declaration and the preceding lines.');
    else if(/^else\b|^elif\b/.test(trim))explanations.push('Defines an alternative branch when an earlier condition does not match.');
    else if(/^try\b/.test(trim))explanations.push('Starts work whose errors can be handled by the following catch or except block.');
    else if(/^\w[\w.-]*\s*:/.test(trim))explanations.push('Declares a named field or setting. The value after the colon supplies its configuration or type.');
    else explanations.push(owner ? `This line belongs to ${owner.name}. Read it with the surrounding source below; the static reader does not assign a separate operation to this syntax.` : 'This source line is available in full. Its exact behavior needs the surrounding language and project context; no standalone operation was resolved.');
  }
  return {line,text,owner,operations,explanations};
}
