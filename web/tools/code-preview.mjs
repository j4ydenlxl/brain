const esc = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function highlightCode(text) {
  const pattern=/(\/\/.*$|#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|export|default|const|let|var|function|class|return|if|else|for|while|async|await|def|try|catch|except|raise|with|as|public|private|static|void|interface|type|enum|fn|pub|use|struct|impl|package|func|select|switch|case|new|null|true|false|None|True|False)\b|\b\d+(?:\.\d+)?\b)/g;
  let html='',last=0;
  for(const m of text.matchAll(pattern)){html+=esc(text.slice(last,m.index));const kind=/^\/\/|^#/.test(m[0])?'comment':/^["'`]/.test(m[0])?'string':/^\d/.test(m[0])?'number':'keyword';html+=`<span class="cm-token-${kind}">${esc(m[0])}</span>`;last=m.index+m[0].length;}
  return html+esc(text.slice(last));
}

export function sourceWindow(source, startLine=1, endLine=null, focusLine=startLine, maximum=160) {
  const lines=source.replaceAll('\r\n','\n').split('\n'), first=Math.max(1,Math.min(startLine,lines.length)), last=Math.max(first,Math.min(endLine||lines.length,lines.length));
  const focus=Math.max(first,Math.min(focusLine,last)), start=Math.max(first,Math.min(focus-20,last-maximum+1)), end=Math.min(last,start+maximum-1);
  return {start,end,total:lines.length,first,last,limited:start>first||end<last,source:lines.slice(start-1,end).join('\n'),html:lines.slice(start-1,end).map((text,i)=>`<div class="cm-code-line ${start+i===focus?'is-current':''}" data-code-row="${start+i}"><button data-code-line="${start+i}" aria-label="Explain source line ${start+i}">${start+i}</button><code>${highlightCode(text)||' '}</code></div>`).join('')};
}
