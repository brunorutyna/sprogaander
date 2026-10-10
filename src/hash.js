/* stable ids for audio files */
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)}
function lineId(who,text){return fnv(who+'|'+text)}
function wordId(w){return fnv('w|'+w.toLowerCase())}
