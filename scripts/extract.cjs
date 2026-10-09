const fs=require('fs');
const lines=fs.readFileSync('/workspace/baan/routes.pretty.js','utf8').split('\n');
const seg=(a,b)=>lines.slice(a-1,b).join('\n');
// vocab te: lines 138-349 ; scenes S: 358-1084 ; tone/letter data 1364-1664
let src = 'const x=(e,t)=>({male:e,female:t});\nconst te' + seg(138,349).replace(/^\s*te/,'').replace(/\],\s*$/,']') + ';\nconst S' + seg(358,1084).replace(/^var S/,'') + '\n';
let t2 = seg(1364,1665).replace(/^var I/,'const I').replace(/\],\s*z = 0;\s*$/,'];');
t2 = t2.replace(/\],\n  Ne = /,'];\nconst Ne = ').replace(/\],\n  Pe = /,'];\nconst Pe = ').replace(/\],\n  L = /,'];\nconst L = ').replace(/\},\n  \};?\nfunction Fe[\s\S]*?\nvar R = /, '},\n};\nconst R = ').replace(/\],\n  Ie = /,'];\nconst Ie = ');
src += t2 + '\nmodule.exports={te,S,I,Ne,Pe,L,R,Ie};';
fs.writeFileSync('/tmp/baan-data.cjs',src);
const d=require('/tmp/baan-data.cjs');
fs.writeFileSync('/tmp/baan-data.json',JSON.stringify(d,null,2));
console.log(Object.fromEntries(Object.entries(d).map(([k,v])=>[k,Array.isArray(v)?v.length:Object.keys(v).length])));
