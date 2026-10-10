/* ================= CONTENT · bank from Kælderen (Studieskolen Modul 1–2) ================= */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
const BANK=[];let CUR=0;
function distract(arr,seed,n=3){const out=[];let k=0;while(out.length<Math.min(n,arr.length)&&k<200){const v=arr[(seed*7+k*11+3)%arr.length];if(!out.includes(v))out.push(v);k++}return out}
function add(o){o.f=CUR;o.id=hash(o.t+'|'+o.q+'|'+(o.say||'')+'|'+[].concat(o.a).join('/'));BANK.push(o)}
const M=(topic,d,q,a,w,x,e={})=>add({t:'mc',topic,d,q,a,w,x,...e});
const T=(topic,d,q,acc,x,e={})=>add({t:'type',topic,d,q,a:acc,x,...e});
const O=(topic,d,q,words,x,e={})=>add({t:'order',topic,d,q,a:words,x,fix:e.fix||0});
const L=(topic,d,say,q,a,w,x,sayAs)=>add({t:'mc',listen:true,say,sayAs,topic,d,q,a,w,x});
CUR=0;
M('hej',1,`— Hvor kommer du fra?`,`Jeg kommer fra Polen.`,[`Jeg hedder Polen.`,`Jeg kommer Polen fra.`,`Jeg er fra polsk.`],`Answer with the same verb: "Hvor kommer du fra?" → "Jeg kommer fra …". The preposition stays with its verb: komme fra et land.`,{npc:1});
M('hej',1,`Sheng kommer fra Kina. Han er …`,`kineser`,[`kinesisk`,`Kina`,`kinesere`],`Country → person → language: Kina → kineser → kinesisk.`);
M('hej',1,`Sheng taler … og engelsk.`,`kinesisk`,[`kineser`,`Kina`,`kinesere`],`Languages end in -sk: kinesisk, italiensk, polsk, dansk.`);
M('hej',1,`Laura kommer fra Italien. Hun taler …`,`italiensk`,[`italiener`,`Italien`,`italienere`],`Italien → italiener (person) → italiensk (language).`);
M('hej',2,`Daniel kommer fra Polen. Han er …`,`polak`,[`polsk`,`Polen`,`polakker`],`Polen → polak (person) → polsk (language).`);
M('hej',1,`— Hvad hedder du?`,`Jeg hedder Anna.`,[`Jeg er hedder Anna.`,`Mit navn hedder Anna.`,`Hedder jeg Anna.`],`"Hedde" is the verb for names: Jeg hedder …`,{npc:1});
M('hej',2,`"Hun bor på Vesterbrogade 57, anden sal til venstre." Hvilken sal bor hun på?`,`2. sal`,[`5. sal`,`7. sal`,`1. sal`],`anden = 2nd: første, anden, tredje, fjerde …`);
M('hej',2,`— Hvilke sprog kan han tale?`,`Han kan tale kinesisk og engelsk.`,[`Han kan taler kinesisk og engelsk.`,`Han kan at tale kinesisk og engelsk.`,`Han taler kan kinesisk og engelsk.`],`After a modal verb (kan, skal, vil, må) the next verb has no -r: kan tale. Without the modal: Han taler kinesisk.`,{npc:1});
M('adv',1,`At sove — han …`,`sover`,[`sove`,`sovet`,`sovede`],`Present tense = infinitive + r, the same for every person: jeg sover, du sover, han sover.`);
M('adv',1,`At arbejde — vi …`,`arbejder`,[`arbejde`,`arbejdes`,`arbejdede`],`Present tense: add -r. No person endings in Danish: vi arbejder, de arbejder.`);
O('adv',1,`Sheng speaks English too.`,[`Sheng`,`taler`,`også`,`engelsk.`],`Central adverbs (også, ikke, altid, aldrig, kun) go right after the verb in a main clause.`);
O('adv',2,`I don't work on Sundays.`,[`Jeg`,`arbejder`,`ikke`,`om`,`søndagen.`],`S–V–A: subject, verb, then the adverb ikke.`);
O('adv',2,`Sheng usually speaks English.`,[`Sheng`,`taler`,`som`,`regel`,`engelsk.`],`"Som regel" behaves like ikke and altid: right after the verb.`);
O('spm',1,`Where are you from?`,[`Hvor`,`kommer`,`du`,`fra?`],`Question word – verb – subject. "fra" goes to the end, unlike Italian "Di dove sei?" or Spanish "¿De dónde vienes?" (negative transfer!).`);
O('spm',2,`Does he come from Poland?`,[`Kommer`,`han`,`fra`,`Polen?`],`Yes/no questions start with the verb.`);
O('spm',2,`Where does he work?`,[`Hvor`,`arbejder`,`han?`],`Question word first, then verb, then subject.`);
M('spm',2,`"Han er 26 år." Hvad er spørgsmålet?`,`Hvor gammel er han?`,[`Hvor mange år han er?`,`Hvad gammel er han?`,`Hvor gammel han er?`],`Age: Hvor gammel er du? → Jeg er 26 (år).`);
M('spm',2,`"Mia er Daniels kone." Hvad er spørgsmålet?`,`Hvem er Mia?`,[`Hvad er Mia?`,`Hvor er Mia?`,`Hvordan er Mia?`],`Hvem = who · hvad = what · hvor = where · hvordan = how.`);
T('spm',3,`Lav et ja/nej-spørgsmål: "Han hedder Daniel."`,[`Hedder han Daniel?`],`Put the verb first: Han hedder → Hedder han …?`);
M('køn',1,`… bog`,`en bog`,[`et bog`],`bog is an n-word: en bog → bogen.`);
M('køn',1,`… hæfte`,`et hæfte`,[`en hæfte`],`hæfte is a t-word: et hæfte → hæftet.`);
M('køn',1,`… stol`,`en stol`,[`et stol`],`en stol → stolen.`);
M('køn',1,`… bord`,`et bord`,[`en bord`],`et bord → bordet.`);
T('køn',2,`en stol → "the chair"`,[`stolen`],`n-words add -en in the definite form: stol → stolen.`);
T('køn',2,`et bord → "the table"`,[`bordet`],`t-words add -et: bord → bordet.`);
T('køn',2,`en jakke → "the jacket"`,[`jakken`],`Words that end in -e only add -n: jakke → jakken.`);
T('køn',2,`et hæfte → "the notebook"`,[`hæftet`],`Ends in -e, so only -t: hæfte → hæftet.`);
T('køn',2,`en blyant → "the pencil"`,[`blyanten`],`blyant → blyanten.`);
M('køn',2,`— Hvor er bordet?`,`Det er der.`,[`Den er der.`,`Han er der.`,`Der er det.`],`The pronoun follows the gender: et bord → det, en stol → den.`,{npc:1});
M('køn',2,`— Hvor er bogen?`,`Den ligger på bordet.`,[`Det ligger på bordet.`,`Hun ligger på bordet.`,`Den ligger bordet på.`],`en bog → den. Things lie (ligger) on the table.`,{npc:1});
L('tal',1,`syvogtyve`,`Hvilket tal hører du?`,`27`,[`72`,`37`,`17`],`Danish says the ones first: syv-og-tyve = 7 + 20.`,`27`);
L('tal',2,`halvfems`,`Hvilket tal hører du?`,`90`,[`50`,`70`,`95`],`halvtreds 50 · tres 60 · halvfjerds 70 · firs 80 · halvfems 90.`,`90`);
L('tal',2,`fireoghalvfjerds`,`Hvilket tal hører du?`,`74`,[`47`,`64`,`84`],`fire-og-halvfjerds = 4 + 70.`,`74`);
L('tal',2,`treogtres`,`Hvilket tal hører du?`,`63`,[`36`,`73`,`53`],`tre-og-tres = 3 + 60.`,`63`);
L('tal',3,`enoghalvtreds, firs, tolv, niogfirs`,`Hvilket telefonnummer hører du?`,`51 80 12 89`,[`15 80 12 98`,`51 18 20 89`,`41 80 12 99`],`Danish phone numbers are read in pairs: 51 80 12 89 → enoghalvtreds, firs, tolv, niogfirs.`,`51, 80, 12, 89`);
T('tal',3,`Skriv tallet med bogstaver: 45`,[`femogfyrre`],`fem-og-fyrre: ones + og + tens, written as one word.`);

/* ---- Etage 2 · Modul 1: klokken, familie, job, modalverber, inversion ---- */
CUR=1;
M('tid',1,`Klokken er 8:15 (uformelt).`,`kvart over otte`,[`kvart i otte`,`halv otte`,`kvart over syv`],`kvart over = quarter past.`);
M('tid',2,`Klokken er 7:30 (uformelt).`,`halv otte`,[`halv syv`,`kvart over syv`,`kvart i otte`],`Trap: "halv otte" = half TO eight = 7:30. Danish counts towards the next hour.`);
M('tid',2,`Klokken er 7:50 (uformelt).`,`ti minutter i otte`,[`ti minutter over otte`,`ti minutter i syv`,`halv otte`],`i = to, over = past: 7:50 = ti minutter i otte.`);
M('tid',2,`Klokken er 19:50 (formelt).`,`nitten halvtreds`,[`syv halvtreds`,`halvtreds nitten`,`nitten femogtyve`],`Formal 24-hour time just reads the numbers: 19:50 = nitten halvtreds.`);
L('tid',2,`kvart i ni`,`Hvad er klokken?`,`8:45`,[`9:15`,`9:45`,`8:15`],`kvart i ni = quarter to nine.`);
L('tid',2,`halv fire`,`Hvad er klokken?`,`3:30`,[`4:30`,`3:15`,`4:15`],`halv fire = 3:30 (half to four).`);
M('tid',1,`Måneden efter juni er …`,`juli`,[`juni`,`august`,`maj`],`januar, februar, marts, april, maj, juni, juli, august …`);
M('tid',2,`"den fjerde maj" er …`,`4. maj`,[`14. maj`,`3. maj`,`4. marts`],`fjerde = 4th: første, anden, tredje, fjerde, femte …`);
M('familie',1,`Min fars mor er min …`,`farmor`,[`mormor`,`faster`,`moster`],`far + mor = farmor (father's mother).`);
M('familie',1,`Min mors søster er min …`,`moster`,[`faster`,`mormor`,`kusine`],`mor + søster = moster. Dad's sister = faster.`);
M('familie',2,`Min fars bror er min …`,`farbror`,[`morbror`,`fætter`,`nevø`],`far + bror = farbror.`);
M('familie',2,`Min onkels datter er min …`,`kusine`,[`fætter`,`niece`,`søster`],`kusine = female cousin, fætter = male cousin.`);
M('job1',1,`Rigtigt eller forkert? "En kok laver mad."`,`Rigtigt`,[`Forkert`],`kok = cook.`);
M('job1',1,`Rigtigt eller forkert? "En økonom arbejder med biler."`,`Forkert`,[`Rigtigt`],`En økonom arbejder med økonomi og penge.`);
M('job1',1,`Rigtigt eller forkert? "En pædagog arbejder i en børnehave."`,`Rigtigt`,[`Forkert`],`pædagog = early-years educator.`);
M('job1',1,`Rigtigt eller forkert? "En webgrafiker laver hjemmesider."`,`Rigtigt`,[`Forkert`],`hjemmeside = website.`);
M('job1',2,`— Hvad laver han?`,`Han er journalist.`,[`Han er en journalist.`,`Han laver journalist.`,`Han journalist er.`],`With jobs Danish drops the article: Jeg er lærer. Hun er læge.`,{npc:1});
M('job1',2,`— Er han glad for sit arbejde?`,`Ja, men han er ikke glad for sine arbejdstider.`,[`Ja, men han er ikke glad med sine arbejdstider.`,`Ja, men han er glad ikke for sine arbejdstider.`,`Ja, men han ikke er glad for sine arbejdstider.`],`Være glad FOR noget. And ikke comes after the verb: han er ikke glad.`,{npc:1});
M('job1',2,`— Hvor længe har du arbejdet der?`,`Jeg har arbejdet der i tre måneder.`,[`Jeg har arbejdet der for tre måneder.`,`Jeg arbejder der siden tre måneder.`,`Jeg har arbejdet der om tre måneder.`],`Duration up to now: har + arbejdet + i + time.`,{npc:1});
M('job1',1,`— Hvordan kommer du på arbejde?`,`Jeg tager toget.`,[`Jeg tager på toget.`,`Jeg kommer toget med.`,`Med tog jeg kommer.`],`tage toget / bussen / metroen. Or: Jeg cykler. Jeg er på cykel.`,{npc:1});
M('modal',2,`(You ask for permission.) … jeg spørge om noget?`,`Må`,[`Skal`,`Bliver`,`Har`],`MÅ asks for or gives permission: Må jeg …? — Det må du gerne.`);
M('modal',2,`(It's the plan.) Jeg … i biografen i aften.`,`skal`,[`må`,`kan`,`gør`],`SKAL = plans or obligation. No "gå" needed: jeg skal i biografen.`);
M('modal',2,`(Jeg er syg.) Jeg … ikke komme næste gang.`,`kan`,[`har`,`er`,`bliver`],`KAN = possibility or ability.`);
M('modal',2,`— Må jeg spørge om noget?`,`Det må du gerne.`,[`Det må jeg gerne.`,`Du må det gerne.`,`Ja, jeg må.`],`Fixed reply: Det må du gerne. (Sure, go ahead.)`,{npc:1});
M('modal',3,`(You invite a friend.) … du med i biografen?`,`Vil`,[`Må`,`Har`,`Er`],`VIL = a wish or an invitation: Vil du med?`);
O('inv1',2,`On Saturdays I go to Danish class.`,[`Om`,`lørdagen`,`går`,`jeg`,`til`,`dansk.`],`The verb stays in 2nd position. When a time phrase comes first, the subject moves after the verb: Om lørdagen GÅR JEG …`,{fix:2});
O('inv1',2,`At 9 o'clock I go to Danish class.`,[`Klokken`,`9`,`går`,`jeg`,`til`,`dansk.`],`Inversion: time phrase → verb → subject.`,{fix:2});
O('inv1',3,`After work I usually do the shopping.`,[`Efter`,`arbejde`,`køber`,`jeg`,`som`,`regel`,`ind.`],`Time phrase – verb – subject – adverb: Efter arbejde køber jeg som regel ind.`,{fix:2});
O('inv1',2,`Sometimes I cook.`,[`Nogle`,`gange`,`laver`,`jeg`,`mad.`],`Nogle gange laver jeg mad = Jeg laver nogle gange mad.`,{fix:2});
O('inv1',2,`I always go to yoga on Tuesdays.`,[`Jeg`,`går`,`altid`,`til`,`yoga`,`om`,`tirsdagen.`],`om tirsdagen = on Tuesdays (every week). altid goes after the verb.`);
M('inv1',3,`(Jeg bor her stadig.) Jeg … i Danmark i to år.`,`har boet`,[`boede`,`bor boet`,`er boet`],`FØRNUTID for something that started in the past and still goes on: Jeg har boet her i to år. "boede" would mean you don't live here any more.`);
M('inv1',2,`Jeg er blevet far. Jeg … fået en datter.`,`har`,[`er`,`blev`,`bliver`],`Førnutid: har + fået. It matters now, so førnutid sounds natural.`);
M('mad',2,`På café: "Jeg vil gerne … en kop kaffe."`,`have`,[`har`,`få at`,`tage at`],`The polite order: Jeg vil gerne have …`);
M('mad',2,`Jeg kan godt lide … sofa. (en sofa)`,`den her`,[`det her`,`de her`,`dem her`],`n-word → den her · t-word → det her · plural → de her.`);
M('mad',2,`… bord er for lille. (et bord)`,`Det her`,[`Den her`,`De her`,`Dem her`],`et bord → det her.`);
M('mad',2,`… stole er dyre. (flertal)`,`De her`,[`Den her`,`Det her`,`Dem her`],`plural → de her.`);

/* ---- Etage 3 · Modul 2: butikker og kvarteret ---- */
CUR=2;
const SHOPS=[
 ['grønthandler','en','grønthandleren',`Et sted, hvor man køber frugt, salat, tomater osv.`],
 ['legeplads','en','legepladsen',`Et sted, hvor børn kan lege udendørs, ofte med rutsjebaner og gynger.`],
 ['kirke','en','kirken',`Et sted, hvor de kristne går hen for at bede.`],
 ['børnehave','en','børnehaven',`Et sted, hvor de små bliver passet, mens forældrene er på arbejde.`],
 ['blomsterhandler','en','blomsterhandleren',`Et sted, hvor man kan købe planter og blomster.`],
 ['sandwichbar','en','sandwichbaren',`Et sted, hvor man kan købe sandwich og andre små, hurtige måltider.`],
 ['bageri','et','bageriet',`Et sted, hvor man kan købe brød og kager.`],
 ['skobutik','en','skobutikken',`Et sted, hvor man køber sneakers, støvler og sandaler.`],
 ['hotel','et','hotellet',`Et sted, hvor folk kan bo kortvarigt, når de er på ferie eller forretningsrejse.`],
 ['station','en','stationen',`Et sted, hvor man kan tage tog eller bus.`],
 ['bank','en','banken',`Et sted, hvor man kan opbevare penge og få hjælp med sin privatøkonomi.`],
 ['café','en','caféen',`Et sted, hvor man kan købe kaffe og kager og slappe af.`],
 ['cykelhandler','en','cykelhandleren',`Et sted, hvor man kan købe cykler eller få hjælp til reparation.`],
 ['pizzeria','et','pizzeriaet',`Et sted, hvor man kan købe en populær, rund italiensk ret.`],
 ['slagter','en','slagteren',`Et sted, hvor man kan købe kød, f.eks. bøf, kylling eller svinekød.`],
 ['restaurant','en','restauranten',`Et sted, hvor man kan spise et måltid, der er lavet af en kok.`],
 ['svømmehal','en','svømmehallen',`Et sted, hvor man kan svømme i en indendørs pool.`],
 ['apotek','et','apoteket',`Et sted, hvor man kan købe medicin og andre sundhedsprodukter.`],
 ['indkøbscenter','et','indkøbscentret',`Et sted med mange butikker, hvor man kan købe tøj, mad, bøger og andre varer.`]
];
SHOPS.forEach(([w,g,def,desc],i)=>{
  const others=SHOPS.filter(s=>s[0]!==w).map(s=>s[0]);
  M('butik',1,desc,w,distract(others,i),`${g} ${w} → ${def}. "Et sted, hvor man …" is a great pattern for explaining any word you've forgotten.`);
});
['bageri','skobutik','hotel','svømmehal','apotek','station','café','indkøbscenter','grønthandler','slagter'].forEach((w,i)=>{
  const s=SHOPS.find(x=>x[0]===w);
  T('butik',i<5?3:2,`${s[1]} ${w} → bestemt form ("the …")`,w==='indkøbscenter'?['indkøbscentret','indkøbscenteret']:[s[2]],
    w==='skobutik'?`Short vowel + consonant: the k doubles → skobutikken.`:w==='hotel'||w==='svømmehal'?`The final l doubles: ${s[2]}.`:w==='indkøbscenter'?`Both indkøbscentret and indkøbscenteret are correct.`:`${s[1]==='et'?'t-word → -et':'n-word → -en'}: ${s[2]}.`);
});
[['Et sted, hvor man kan købe brød og kager.','bageri'],['Et sted, hvor man kan købe medicin.','apotek'],['Et sted, hvor man kan tage tog eller bus.','station'],['Et sted, hvor børn kan lege udendørs.','legeplads'],['Et sted, hvor man kan svømme indendørs.','svømmehal']].forEach(([q,w])=>{
  const s=SHOPS.find(x=>x[0]===w);
  T('butik',3,`Hvad hedder stedet? ${q}`,[w,s[1]+' '+w,s[2]],`${s[1]} ${w}.`);
});
M('kvarter',2,`— Hvad er der i dit kvarter?`,`Der er et bageri og to caféer.`,[`Det er et bageri og to caféer.`,`Der har et bageri og to caféer.`,`Er der et bageri og to caféer.`],`"Der er" = there is / there are. "Det er" = it is.`,{npc:1});
M('kvarter',2,`Jeg er træt … trafikken.`,`af`,[`på`,`med`,`for`],`at være træt af noget = to be tired of something.`);
M('kvarter',2,`… yndlingssted i København er Kongens Have. (et sted)`,`Mit`,[`Min`,`Mine`,`Sit`],`sted is a t-word: mit sted, mit yndlingssted.`);
M('kvarter',2,`— Hvor ligger apoteket?`,`Det ligger ved siden af banken.`,[`Den ligger ved siden af banken.`,`Det ligger ved siden banken.`,`Han ligger ved siden af banken.`],`et apotek → det. "ved siden af" = next to.`,{npc:1});
O('kvarter',3,`I like that there are many cafés.`,[`Jeg`,`kan`,`godt`,`lide,`,`at`,`der`,`er`,`mange`,`caféer.`],`"kan godt lide" = like. After "at" a new clause follows: at der er …`);
M('kvarter',2,`Vælg den korrekte sætning om dit kvarter.`,`Der er for meget støj om natten.`,[`Der er for mange støj om natten.`,`Det er for meget støj om natten.`,`Der har for meget støj om natten.`],`støj can't be counted: for meget støj. Countable: for mange biler.`);
M('kvarter',2,`— Bor du tæt på en station?`,`Ja, stationen ligger kun fem minutter herfra.`,[`Ja, stationen ligger fem minutter kun herfra.`,`Ja, stationen kun ligger fem minutter herfra.`,`Ja, station ligger kun fem minutter herfra.`],`kun goes right after the verb in a main clause.`,{npc:1});
M('kvarter',1,`Hvor køber man medicin?`,`på apoteket`,[`i bageriet`,`hos slagteren`,`i svømmehallen`],`på apoteket · i bageriet · hos slagteren.`);
M('kvarter',2,`Hvor køber man kød?`,`hos slagteren`,[`på slagteren`,`i slagteren`,`til slagteren`],`Shops named after the person who works there take "hos": hos slagteren, hos bageren, hos frisøren.`);
M('kvarter',2,`— Hvad kan du godt lide ved dit kvarter?`,`Jeg kan godt lide, at der er mange grønne områder.`,[`Jeg kan lide godt, at der er mange grønne områder.`,`Jeg godt kan lide, at der er mange grønne områder.`,`Jeg kan godt lide, at det er mange grønne områder.`],`kan godt lide: godt sits between kan and lide. And "der er" for "there are".`,{npc:1});

/* ---- Etage 4 · Modul 2: job, chunks, empati, Mark ---- */
CUR=3;
const JOBS=[
 [`Passer blomster og planter i haven.`,'gartner'],[`Hjælper kunder med at finde tøj.`,'ekspedient',['butiksassistent']],
 [`Sætter lamper og stikkontakter op.`,'elektriker'],[`Laver kaffe og cappuccino.`,'barista'],
 [`Svarer på telefonen og skriver e-mails.`,'sekretær'],[`Slukker ild og redder mennesker.`,'brandmand'],
 [`Kører ambulance og hjælper syge personer.`,'ambulancechauffør',['falck-redder','ambulanceredder']],
 [`Sælger blomster og passer butikken.`,'blomsterhandler'],[`Tegner huse og bygninger.`,'arkitekt'],
 [`Reparerer computere.`,'IT-tekniker',['it-tekniker']],[`Forklarer matematik.`,'lærer'],
 [`Tager billeder til bryllupper og fester.`,'fotograf'],[`Dyrker vin og arbejder på marken.`,'landmand'],
 [`Klipper hår.`,'frisør'],[`Bringer post og pakker.`,'postbud'],[`Hjælper syge dyr.`,'dyrlæge'],
 [`Skriver artikler og laver interviews.`,'journalist'],[`Bygger vægge med mursten.`,'murer'],
 [`Hjælper passagerer i et fly.`,'stewardesse',['steward']],[`Laver møbler af træ.`,'tømrer',['snedker']],
 [`Undersøger patienter og giver medicin.`,'læge']
];
JOBS.forEach(([desc,job],i)=>{
  const others=JOBS.filter(j=>j[1]!==job).map(j=>j[1]);
  M('gaet',1,`Gæt jobbet: "${desc}"`,job,distract(others,i),`Han/hun er ${job}. Remember: no article with jobs.`);
});
JOBS.filter(j=>['frisør','læge','postbud','gartner','fotograf','murer','dyrlæge','landmand','lærer','tømrer'].includes(j[1])).forEach(([desc,job,alt])=>{
  T('gaet',3,`Skriv jobbet: "${desc}"`,[job,...(alt||[])],`${job}${alt?' (also: '+alt.join(', ')+')':''}.`);
});
M('chunk',2,`— Hvad laver du for tiden?`,`Jeg er i gang med en uddannelse.`,[`Jeg er i gang af en uddannelse.`,`Jeg er på gang med en uddannelse.`,`Jeg går i gang en uddannelse.`],`Chunk: "være i gang med" = be busy with / in the middle of. Learn it as one block.`,{npc:1});
M('chunk',2,`— Cykler du på arbejde?`,`Det kommer an på vejret.`,[`Det kommer på vejret.`,`Det kommer an vejret.`,`Det afhænger an på vejret.`],`Chunk: "det kommer an på …" = it depends on …`,{npc:1});
M('chunk',2,`— Hvilket job kunne du godt tænke dig?`,`Jeg kunne godt tænke mig at være fotograf.`,[`Jeg kunne godt tænke at være fotograf.`,`Jeg kunne tænke mig godt fotograf.`,`Jeg godt kunne tænke mig at være fotograf.`],`Chunk: "jeg kunne godt tænke mig at …" = I would like to …`,{npc:1});
O('chunk',3,`I would like to be a nurse.`,[`Jeg`,`kunne`,`godt`,`tænke`,`mig`,`at`,`være`,`sygeplejerske.`],`Jeg kunne godt tænke mig + at + infinitive.`);
O('chunk',3,`…because I like taking pictures.`,[`Jeg`,`vil`,`være`,`fotograf,`,`fordi`,`jeg`,`godt`,`kan`,`lide`,`at`,`tage`,`billeder.`],`After fordi (a subordinate clause) the adverb comes BEFORE the verb: fordi jeg godt kan lide … (S–A–V).`,{fix:4});
M('chunk',3,`Jeg vil være sygeplejerske, fordi …`,`jeg godt kan lide at arbejde med mennesker.`,[`kan jeg godt lide at arbejde med mennesker.`,`godt jeg kan lide at arbejde med mennesker.`,`jeg kan lide godt at arbejde med mennesker.`],`Subordinate clause = S–A–V: fordi jeg GODT KAN … (In speech you'll also hear "fordi jeg kan godt lide", but the written rule is S–A–V.)`);
M('empati',1,`— God weekend!`,`I lige måde!`,[`Det kender jeg godt.`,`Hvor spændende!`,`Det kommer an på.`],`"I lige måde" = same to you.`,{npc:1});
M('empati',2,`— Jeg er så træt. Jeg har arbejdet hele weekenden.`,`Det kan jeg godt forstå.`,[`I lige måde.`,`Hvor spændende!`,`Det kommer an på.`],`"Det kan jeg godt forstå" shows empathy: I can understand that.`,{npc:1});
M('empati',1,`— Jeg skal til Japan i næste uge!`,`Hvor spændende!`,[`Det kan jeg godt forstå.`,`I lige måde.`,`Det kender jeg godt.`],`"Hvor spændende! / Det lyder spændende" shows interest.`,{npc:1});
M('empati',2,`— Det er svært at finde en lejlighed i København.`,`Det kender jeg godt.`,[`I lige måde.`,`Hvor spændende!`,`Det lyder spændende.`],`"Det kender jeg godt" = I know that feeling, I've been there.`,{npc:1});
M('empati',2,`Du har fortalt om dit arbejde. Nu vil du høre om din kollegas. Hvad siger du?`,`Hvad med dig?`,[`Hvordan dig?`,`Og du hvad?`,`Hvad om dig?`],`"Hvad med dig?" = what about you? It keeps the conversation going both ways.`);
M('empati',2,`— Husk, jeg har fri om fredagen.`,`Nåh ja, det er rigtigt.`,[`I lige måde!`,`Hvor spændende!`,`Det kommer an på.`],`"Nåh ja" = oh right — you remember something.`,{npc:1});
L('mark',2,`Mark er uddannet kok og kommer fra USA. Nu er han i Danmark, for han er gift med en dansker.`,`Hvorfor er Mark i Danmark?`,`Han er gift med en dansker.`,[`Han arbejder som kok i USA.`,`Han studerer dansk på universitetet.`,`Hans chef bor i Danmark.`],`"for" = because, joining two main clauses: …, for han er gift med en dansker.`);
L('mark',2,`Først arbejdede han tre måneder som rengøringsassistent. Lønnen var ok, men han kunne ikke lide at vaske gulv.`,`Hvad kunne Mark ikke lide?`,`At vaske gulv.`,[`Lønnen.`,`At lave mad.`,`Sine kolleger.`],`kunne ikke lide = didn't like (past of "kan godt lide").`);
L('mark',2,`Bagefter arbejdede han i en kantine. Her havde han gode arbejdstider. Men arbejdet var lidt kedeligt, og han stoppede efter ti måneder.`,`Hvorfor stoppede Mark i kantinen?`,`Arbejdet var lidt kedeligt.`,[`Lønnen var dårlig.`,`Han havde dårlige arbejdstider.`,`Han talte ikke dansk.`],`kedeligt = boring.`);
L('mark',3,`Mark taler dansk med kollegerne på arbejdet hver dag. Men Marks chef vil ikke tale dansk med Mark. Han skifter altid til engelsk.`,`Hvad er problemet med chefen?`,`Han skifter altid til engelsk.`,[`Han taler for hurtigt.`,`Han betaler en lav løn.`,`Han kan ikke lide kollegerne.`],`skifte til = switch to. (You'll meet this boss at the bottom of the cellar.)`);
L('mark',2,`Mark vil måske stoppe om et halvt år. Han drømmer om at åbne en lille café sammen med nogle venner.`,`Hvad drømmer Mark om?`,`At åbne en lille café.`,[`At blive chef på restauranten.`,`At flytte tilbage til USA.`,`At arbejde i en kantine.`],`drømme om at + infinitive. "om et halvt år" = in half a year (future).`);
L('mark',3,`Han har kun lidt problemer med udtale, især med y, u, r og l.`,`Hvad har Mark problemer med?`,`Udtale af y, u, r og l.`,[`At forstå sine kolleger.`,`Grammatik og ordstilling.`,`At skrive e-mails.`],`udtale = pronunciation. Listening and repeating out loud is how you fix it.`);

/* ---- Etage 5 · Modul 2: datid, inversion, konjunktioner, tidsudtryk ---- */
CUR=4;
const DATID=[['lave','lavede',2],['arbejde','arbejdede',2],['danse','dansede',2],['flytte','flyttede',2],['bo','boede',2],['købe','købte',1],['spise','spiste',1],['tale','talte',2],['begynde','begyndte',2],['læse','læste',2],['gå','gik',2],['have','havde',2],['drikke','drak',2],['tage','tog',2],['være','var',1],['komme','kom',2],['se','så',2],['sidde','sad',3],['blive','blev',3],['sove','sov',3],['få','fik',2],['sige','sagde',3],['gøre','gjorde',3],['give','gav',3],['mødes','mødtes',3]];
DATID.forEach(([inf,past,d])=>{
  const g=past.endsWith('ede')?`-ede group: ${inf} → ${past}.`:(past.endsWith('te')&&past.length>3&&inf!=='mødes')?`-te group: ${inf} → ${past}.`:inf==='mødes'?`Verbs ending in -s keep it: mødes → mødtes, skændes → skændtes.`:`Irregular: ${inf} → ${past}. Learn it by heart.`;
  T('datid',d,`Datid · at ${inf} → i går ${inf==='mødes'?'… vi':'… jeg'}`,[past],g);
});
M('datid',1,`I går … jeg morgenmad kl. 7.`,`spiste`,[`spisede`,`spist`,`spiser`],`spise → spiste (-te group).`);
M('datid',2,`— Hvad lavede du i går?`,`Jeg spiste morgenmad og drak en kop kaffe.`,[`Jeg spiser morgenmad og drikker en kop kaffe.`,`Jeg spisede morgenmad og drikkede en kop kaffe.`,`Jeg har spise morgenmad og drak en kop kaffe.`],`Datid for finished events: spiste, drak (irregular).`,{npc:1});
M('datid',2,`Bagefter … vi til møde.`,`var`,[`er`,`varede`,`været`],`være → var.`);
M('datid',2,`Kl. 20 … jeg hjem.`,`gik`,[`gåede`,`gået`,`går`],`gå → gik (irregular).`);
O('inv2',2,`When I lived in Italy, I watched football every Sunday.`,[`Da`,`jeg`,`boede`,`i`,`Italien,`,`så`,`jeg`,`fodbold`,`hver`,`søndag.`],`The da-clause takes position 1, so the verb (så = saw) comes next and then the subject: …, SÅ JEG fodbold.`,{fix:5});
O('inv2',2,`When I lived in Chile, I played tennis.`,[`Da`,`jeg`,`boede`,`i`,`Chile,`,`gik`,`jeg`,`til`,`tennis.`],`Inversion after a subordinate clause: Da …, GIK JEG …`,{fix:5});
O('inv2',3,`When I lived in France, I lived with my parents.`,[`Da`,`jeg`,`boede`,`i`,`Frankrig,`,`boede`,`jeg`,`sammen`,`med`,`mine`,`forældre.`],`…, boede jeg sammen med …`,{fix:5});
M('inv2',2,`Da jeg boede i Chile, …`,`læste jeg jura på universitetet.`,[`jeg læste jura på universitetet.`,`læste jura jeg på universitetet.`,`jeg jura læste på universitetet.`],`The sentence starts with a da-clause, so: verb, then subject.`);
M('inv2',2,`Hvilken sætning er korrekt?`,`Jeg gik til tennis, da jeg boede i Chile.`,[`Gik jeg til tennis, da jeg boede i Chile.`,`Jeg gik til tennis, da boede jeg i Chile.`,`Jeg til tennis gik, da jeg boede i Chile.`],`Main clause first → normal order, no inversion. Inside the da-clause: subject, verb.`);
M('konj',2,`Jeg var tidligt oppe, men …`,`jeg er ikke træt.`,[`er jeg ikke træt.`,`jeg ikke er træt.`,`ikke jeg er træt.`],`og / men / så / for / eller join two main clauses → normal S–V–A order.`);
M('konj',3,`Jeg er træt, fordi …`,`jeg altid arbejder om lørdagen.`,[`arbejder jeg altid om lørdagen.`,`altid jeg arbejder om lørdagen.`,`jeg arbejder om lørdagen altid.`],`fordi, da, når, hvis, selvom start a subordinate clause → S–A–V: jeg ALTID arbejder.`);
M('konj',2,`Jeg er ret træt, … jeg sov kun fire timer i nat.`,`for`,[`for at`,`på grund af`,`selvom`],`"for" = because, joining two main clauses. "for at" = in order to. "på grund af" + noun.`);
M('konj',2,`Jeg blev hjemme … regnen.`,`på grund af`,[`fordi`,`for at`,`selvom`],`på grund af + noun · fordi + clause · for at + infinitive.`);
M('konj',2,`Jeg blev hjemme, … det regnede.`,`fordi`,[`på grund af`,`for at`,`selvom`],`fordi + a full clause (subject + verb).`);
M('konj',2,`Jeg går til dansk … lære sproget.`,`for at`,[`fordi`,`på grund af`,`selvom`],`for at + infinitive = in order to.`);
M('konj',3,`Jeg går en tur, … det regner.`,`selvom`,[`fordi`,`for at`,`på grund af`],`selvom = even though.`);
M('tidsudtryk',2,`Hun flyttede hertil … et halvt år siden.`,`for`,[`i`,`om`,`på`],`FOR … SIDEN = ago.`);
M('tidsudtryk',2,`Min kontrakt udløber … et år.`,`om`,[`for`,`i`,`siden`],`OM + time = in (the future): om et år.`);
M('tidsudtryk',2,`… vinteren regner det meget i Danmark.`,`Om`,[`I`,`For`,`Siden`],`OM + season or day = regularly: om vinteren, om lørdagen.`);
M('tidsudtryk',2,`Han har boet her … en måned.`,`i`,[`om`,`for`,`siden`],`I + duration: i en måned, i to år.`);
M('tidsudtryk',2,`— Hvornår flyttede Nicola til København?`,`For et halvt år siden.`,[`I et halvt år.`,`Om et halvt år.`,`Et halvt år for.`],`Hvornår? (when) in the past → for … siden.`,{npc:1});
M('tidsudtryk',2,`— Hvor længe har Lucas boet her?`,`I en måneds tid.`,[`For en måned siden.`,`Om en måned.`,`Siden en måned.`],`Hvor længe? (how long) → i + duration.`,{npc:1});
M('tidsudtryk',2,`— Hvornår skal Kendra tilbage til Canada?`,`Om et års tid.`,[`For et år siden.`,`I et år.`,`Siden et år.`],`A point in the future → om.`,{npc:1});
M('tidsudtryk',1,`"Jeg har gået til dansk i tre måneder." Går jeg stadig til dansk?`,`Ja`,[`Nej`],`Førnutid + i + duration = it started in the past and still goes on.`);
O('historie',2,`Sæt historien i rækkefølge`,[`De mødtes til en fest.`,`De dansede, så kyssede de.`,`De begyndte at date.`,`De flyttede sammen.`,`De blev gift.`],`A story in datid: mødtes, dansede, kyssede, begyndte, flyttede, blev.`);
O('historie',3,`Sæt dagen i rækkefølge`,[`Jeg spiste morgenmad.`,`Jeg tog af sted.`,`Jeg underviste fra kl. 9 til 11.30.`,`Jeg spiste frokost med et par kolleger.`,`Vi drak en øl efter arbejde.`],`Linking words help a story: først, så, bagefter, til sidst.`);
L('historie',2,`Jeg tog af sted og underviste fra kl. 9 til kl. 11.30. Jeg spiste frokost sammen med et par kolleger.`,`Hvornår underviste han?`,`Fra 9 til 11.30.`,[`Fra 11.30 til 13.`,`Om aftenen.`,`Efter frokost.`],`underviste = taught (past of undervise).`);
M('historie',3,`De … om penge, men de blev sammen.`,`skændtes`,[`skændes`,`skændede`,`skændtede`],`skændes (to argue) → skændtes. Verbs ending in -s keep the -s: mødes → mødtes.`);

/* ---- Etage 6 · Modul 2: adjektiver, pronominer, sin/hans ---- */
CUR=5;
M('adj',2,`"Min kollega hilser kun på mig en gang imellem." Hun er …`,`lunefuld`,[`glemsom`,`forstående`,`punktlig`],`lunefuld = moody, unpredictable.`);
M('adj',2,`"Min ven kommer altid for sent, og han glemmer vores aftaler." Han er …`,`glemsom`,[`lunefuld`,`empatisk`,`hjælpsom`],`glemsom = forgetful (glemme = to forget).`);
M('adj',2,`"Min chef er meget lyttende og forstår mine problemer." Hun er …`,`forstående`,[`irriterende`,`glemsom`,`lunefuld`],`forstående = understanding. Also: sød og empatisk.`);
M('adj',1,`"Han hjælper altid sine kolleger." Han er …`,`hjælpsom`,[`doven`,`nervøs`,`glemsom`],`hjælpsom = helpful (hjælpe = to help).`);
M('adj',1,`"Hun kommer aldrig for sent." Hun er …`,`punktlig`,[`glemsom`,`forvirret`,`lunefuld`],`punktlig = punctual.`);
M('adj',2,`"Han ved ikke, hvor han er, eller hvad han skal." Han er …`,`forvirret`,[`punktlig`,`sød`,`stille`],`forvirret = confused.`);
M('adj',2,`"Hun stiller mange spørgsmål om alt." Hun er …`,`nysgerrig`,[`doven`,`punktlig`,`stille`],`nysgerrig = curious.`);
M('adj',2,`Hun er sød. Mine kolleger er …`,`søde`,[`sød`,`sødt`,`sødte`],`Plural adjectives add -e: sød → søde.`);
M('adj',3,`Det er et … barn. (sød)`,`sødt`,[`sød`,`søde`,`søder`],`With a t-word in the indefinite form the adjective gets -t: et sødt barn.`);
T('adj',3,`Han er glemsom. Mine venner er …`,[`glemsomme`],`Plural -e, and the m doubles: glemsom → glemsomme.`);
M('pron',1,`— Kender du Mark? — Ja, jeg kender … godt.`,`ham`,[`han`,`hans`,`den`],`Object form: han → ham.`);
M('pron',1,`— Har du set Laura? — Nej, jeg har ikke set …`,`hende`,[`hun`,`hendes`,`den`],`hun → hende.`);
M('pron',2,`— Hvor er bogen? — Jeg kan ikke finde …`,`den`,[`det`,`ham`,`dem`],`en bog → den.`);
M('pron',2,`— Kan du lide bordet? — Ja, jeg kan godt lide …`,`det`,[`den`,`dem`,`ham`],`et bord → det.`);
M('pron',2,`— Hvor er mine nøgler? — Du har glemt … derhjemme.`,`dem`,[`de`,`den`,`deres`],`Plural object: de → dem.`);
M('pron',2,`— Ringer du til mig i aften? — Ja, jeg ringer til …`,`dig`,[`du`,`din`,`mig`],`du → dig.`);
M('pron',2,`Vi ses i morgen. Læreren venter på …`,`os`,[`vi`,`vores`,`dem`],`vi → os.`);
M('poss',2,`Mark taler dansk med … kolleger.`,`sine`,[`hans`,`sin`,`hendes`],`SIN/SIT/SINE point back to the subject (Mark). "hans kolleger" would mean another man's colleagues.`);
M('poss',2,`Biase er glad for … chef og … kolleger.`,`sin chef og sine kolleger`,[`hans chef og hans kolleger`,`sin chef og sin kolleger`,`sine chef og sine kolleger`],`sin + singular n-word, sine + plural — both point back to Biase.`);
M('poss',3,`Det er Marks chef. … chef vil ikke tale dansk.`,`Hans`,[`Sin`,`Sine`,`Hendes`],`"sin" can never be part of the subject. In the subject use hans / hendes.`);
M('poss',1,`… hus ligger i Valby. (et hus)`,`Mit`,[`Min`,`Mine`,`Sit`],`min + n-word · mit + t-word · mine + plural.`);
M('poss',1,`… venner bor i Aarhus.`,`Mine`,[`Min`,`Mit`,`Sine`],`plural → mine.`);
M('adj',2,`"Hun siger altid, hvad hun mener." Hun er …`,`ærlig`,[`doven`,`glemsom`,`forvirret`],`ærlig = honest.`);
M('adj',2,`"Han siger næsten ingenting i timen." Han er …`,`stille`,[`sjov`,`nysgerrig`,`lunefuld`],`stille = quiet.`);
M('adj',1,`"Alle griner, når hun fortæller historier." Hun er …`,`sjov`,[`stille`,`glemsom`,`punktlig`],`sjov = funny.`);
M('adj',3,`Min chef er empatisk. Mine chefer er …`,`empatiske`,[`empatisk`,`empatiskt`,`empatiskee`],`Plural -e: empatisk → empatiske. Adjectives in -isk never take -t: et empatisk menneske.`);
M('pron',2,`— Har du hilst på de nye kolleger? — Ja, jeg mødte … i går.`,`dem`,[`de`,`deres`,`dig`],`de → dem (object form).`);
M('poss',2,`Jeg bor sammen med … kæreste. (en kæreste)`,`min`,[`mit`,`mine`,`sin`],`n-word → min. "sin" is only used when the subject is han/hun/den/det/de.`);
M('poss',3,`Laura og Daniel? Jeg kender ikke … adresse.`,`deres`,[`sin`,`dem`,`hendes`],`deres = their. Not "sin": the subject is "jeg".`);
M('poss',2,`Laura bor sammen med … mand.`,`sin`,[`hendes`,`sit`,`sine`],`Points back to Laura (the subject) → sin mand.`);

/* ---- floors ---- */

/* ================= NEW · Copenhagen life (one topic per district) ================= */
CUR=6;
/* hjem · Østerbro */
M('hjem',1,`— Hvor bor du?`,`Jeg bor på Nørrebro.`,[`Jeg bor i Nørrebro.`,`Jeg bo på Nørrebro.`,`Jeg bor Nørrebro.`],`Copenhagen districts take "på": på Nørrebro, på Vesterbro, på Amager, på Frederiksberg, på Christianshavn. But: i Valby, i Indre By, i København.`,{npc:1});
M('hjem',1,`Hvor laver man mad?`,`i køkkenet`,[`i soveværelset`,`på badeværelset`,`på altanen`],`et køkken → køkkenet. "I køkkenet" = in the kitchen.`);
M('hjem',1,`Hvor sover man?`,`i soveværelset`,[`i stuen`,`i køkkenet`,`i entréen`],`sove + værelse = soveværelse. Danish glues words together.`);
M('hjem',2,`Hvor tager man et bad?`,`på badeværelset`,[`i køkkenet`,`på altanen`,`i stuen`],`Note the preposition: på badeværelset, på toilettet, but i køkkenet and i stuen.`);
M('hjem',3,`Adressen er "Nørrebrogade 12, st. th." Hvor bor personen?`,`i stueetagen, til højre`,[`på første sal, til højre`,`i stueetagen, til venstre`,`på tredje sal, til venstre`],`st. = stuen (ground floor) · th. = til højre · tv. = til venstre. "2. tv." = 2nd floor, left door.`);
M('hjem',1,`Jeg … i en lejlighed med min kæreste.`,`bor`,[`bo`,`boet`,`boer`],`Present tense: infinitive + r → bo → bor.`);
O('hjem',1,`We have a balcony.`,[`Vi`,`har`,`en`,`altan.`],`en altan → altanen. S–V–O, just like English.`);
O('hjem',2,`There is no elevator in the building.`,[`Der`,`er`,`ingen`,`elevator`,`i`,`opgangen.`],`ingen = no / not any. En opgang = the stairwell of a Copenhagen building.`);
T('hjem',2,`en lejlighed → "the apartment"`,[`lejligheden`],`n-word: lejlighed → lejligheden.`);
T('hjem',2,`et værelse → "the room"`,[`værelset`],`Ends in -e: just add -t → værelset.`);
M('hjem',2,`Udlejeren skriver: "Husk at betale … den første i måneden."`,`husleje`,[`depositum`,`udlejer`,`opgang`],`husleje = rent · depositum = deposit · udlejer = landlord.`);
/* cykel · Vesterbro */
M('cykel',1,`Du vil til Nørreport. Hvad siger du?`,`Undskyld, hvordan kommer jeg til Nørreport?`,[`Undskyld, hvordan går jeg Nørreport?`,`Undskyld, hvor er til Nørreport?`,`Undskyld, hvordan kommer jeg Nørreport til?`],`"Hvordan kommer jeg til …?" = How do I get to …?`);
M('cykel',1,`I bussen skal man tjekke ind med sit …`,`rejsekort`,[`kørekort`,`pas`,`cykelhjelm`],`Rejsekort: tjek ind og tjek ud. Kørekort = driving licence.`);
M('cykel',2,`"Drej til venstre ved lyskrydset." Hvad skal du gøre?`,`Turn left at the traffic lights`,[`Turn right at the traffic lights`,`Go straight past the lights`,`Stop at the left crossing`],`dreje = turn · til venstre / til højre · ligeud = straight on · et lyskryds = junction with lights.`,{ea:1});
M('cykel',2,`Hvornår … bussen?`,`kører`,[`løber`,`cykler`,`flyver`],`Vehicles "køre": bussen kører, toget kører.`);
O('cykel',1,`I cycle to work.`,[`Jeg`,`cykler`,`på`,`arbejde.`],`cykle is a verb: jeg cykler. På arbejde = to/at work.`);
O('cykel',2,`Tomorrow I'll take the metro.`,[`I morgen`,`tager`,`jeg`,`metroen.`],`Time first → verb → subject: I morgen TAGER JEG …`);
T('cykel',2,`en cykel → "the bike"`,[`cyklen`],`cykel → cyklen: the e drops (like en onkel → onklen).`);
M('cykel',2,`Toget er … Det kommer ti minutter for sent.`,`forsinket`,[`aflyst`,`tidligt`,`gratis`],`forsinket = delayed · aflyst = cancelled.`);
L('cykel',2,`Næste station: Nørreport.`,`Hvad hører du i metroen?`,`Next station: Nørreport`,[`Last stop: Nørreport`,`Change trains at Nørreport`,`Nørreport is closed`],`Næste station = next station · endestation = last stop · skift = change.`);
M('cykel',1,`En cykelsti er til …`,`cykler`,[`biler`,`tog`,`både`],`en cykelsti = a bike lane. København er fuld af dem.`);
/* hygge · Christianshavn */
M('hygge',1,`Efter maden siger gæsten til værten:`,`Tak for mad!`,[`Velbekomme!`,`Skål!`,`Tillykke!`],`Tak for mad = thanks for the meal. The host answers: Velbekomme!`);
M('hygge',1,`Gæsten siger "Tak for mad". Værten svarer:`,`Velbekomme!`,[`Tak for mad!`,`Undskyld!`,`Godt nytår!`],`Velbekomme = you're welcome / enjoy (after a meal).`);
M('hygge',2,`Du møder en ven, du så sidste weekend. Du siger:`,`Tak for sidst!`,[`Tak for mad!`,`Velbekomme!`,`God bedring!`],`Tak for sidst = thanks for last time. Danes say it the next time they meet you.`);
M('hygge',1,`Din ven har fødselsdag. Du siger:`,`Tillykke med fødselsdagen!`,[`Godt nytår!`,`God bedring!`,`Velbekomme!`],`tillykke = congratulations.`);
M('hygge',2,`Din kollega er syg. Du skriver:`,`God bedring!`,[`Tillykke!`,`Tak for sidst!`,`Skål!`],`God bedring = get well soon.`);
O('hygge',2,`It's cosy here.`,[`Det`,`er`,`hyggeligt`,`her.`],`Neutral "det" takes the t-form: det er hyggeligt.`);
M('hygge',1,`Hvad betyder "Skål!"?`,`Cheers!`,[`Bless you!`,`Enjoy your meal!`,`See you!`],`Skål! Look people in the eyes when you say it.`,{ea:1});
M('hygge',2,`Hvornår spiser man æbleskiver med gløgg?`,`i december`,[`i juli`,`til morgenmad hver dag`,`til påske`],`Æbleskiver og gløgg = classic julehygge in December.`);
T('hygge',3,`Vi skal … os i aften. (We'll have a cosy time tonight.)`,[`hygge`],`hygge is also a verb: at hygge sig. Vi skal hygge os!`);
M('hygge',1,`Nogen nyser. Du siger:`,`Prosit!`,[`Skål!`,`Velbekomme!`,`Tillykke!`],`Prosit = bless you.`);
/* kommune · Ørestad */
M('kommune',1,`Dit personnummer i Danmark hedder et …`,`CPR-nummer`,[`MitID`,`pas`,`rejsekort`],`CPR-nummer = personal ID number. MitID = your digital login.`);
M('kommune',2,`På det gule sundhedskort kan du se navnet på din …`,`læge`,[`chef`,`udlejer`,`lærer`],`The yellow card shows your CPR number and your doctor (din læge).`);
M('kommune',2,`Du skal tale med Borgerservice. Hvad siger du?`,`Jeg vil gerne bestille en tid.`,[`Jeg vil gerne bestille et bord.`,`Jeg vil gerne købe en tid.`,`Jeg vil gerne bestiller en tid.`],`bestille tid = book an appointment. After vil: no -r → bestille.`);
O('kommune',2,`I would like to book an appointment.`,[`Jeg`,`vil`,`gerne`,`bestille`,`en`,`tid.`],`vil gerne + infinitive = would like to.`);
M('kommune',1,`"Træk et nummer og vent." Hvad gør du?`,`Take a queue ticket and wait`,[`Call a number and wait`,`Pay and leave`,`Fill in a form`],`trække et nummer = take a queue number.`,{ea:1});
M('kommune',2,`Hvad betyder "Udfyld skemaet"?`,`Fill in the form`,[`Sign the contract`,`Print the letter`,`Send the e-mail`],`et skema = a form · udfylde = fill in · underskrive = sign.`,{ea:1});
T('kommune',2,`et skema → "the form"`,[`skemaet`],`t-word → -et: skemaet.`);
M('kommune',2,`Breve fra kommunen kommer i din …`,`digitale postkasse`,[`avis`,`kalender`,`telefonbog`],`Official letters arrive digitally (Digital Post / e-Boks).`);
O('kommune',3,`Can you speak a bit slower?`,[`Kan`,`du`,`tale`,`lidt`,`langsommere?`],`Yes/no question: verb first. langsom → langsommere.`);
M('kommune',1,`Du forstår ikke. Hvad siger du?`,`Undskyld, kan du sige det igen?`,[`Undskyld, kan du sige igen det?`,`Undskyld, kan du siger det igen?`,`Undskyld, du kan sige det igen?`],`Modal + infinitive (kan sige); the object "det" comes before "igen".`,{npc:1});
/* vejr · Nyhavn */
M('vejr',1,`Tag en paraply med! Det …`,`regner`,[`er varmt`,`er solskinsvejr`,`er tørt`],`Weather verbs use "det": det regner, det blæser, det sner.`);
M('vejr',1,`— Hvordan er vejret?`,`Det blæser meget.`,[`Det blæse meget.`,`Den blæser meget.`,`Det er blæser meget.`],`det + verb in present: det blæser.`,{npc:1});
L('vejr',2,`I morgen bliver det seksten grader og overskyet.`,`Hvordan bliver vejret i morgen?`,`16°, cloudy`,[`60°, sunny`,`6°, cloudy`,`16°, rainy`],`seksten = 16 · tres = 60 · overskyet = cloudy.`);
M('vejr',2,`Om vinteren er det … i Danmark.`,`koldt og mørkt`,[`kold og mørk`,`kolde og mørke`,`koldt og mørk`],`After "det er" adjectives take -t: det er koldt, det er mørkt.`);
O('vejr',2,`In summer it is light until 10 pm.`,[`Om`,`sommeren`,`er`,`det`,`lyst`,`til`,`klokken`,`22.`],`Time phrase first → verb → subject: Om sommeren ER DET …`,{fix:2});
T('vejr',2,`en sol → "the sun"`,[`solen`],`n-word → -en.`);
M('vejr',2,`Hvad betyder "spredte byger"?`,`scattered showers`,[`strong winds`,`thick fog`,`heavy snow`],`en byge = a shower. Danish forecasts love "spredte byger".`,{ea:1});
M('vejr',3,`Hvilken sætning er rigtig?`,`Det har regnet hele dagen.`,[`Det har regnede hele dagen.`,`Det er regnet hele dagen.`,`Det har regne hele dagen.`],`har + past participle: har regnet.`);
M('vejr',1,`Det er minus fem grader. Det er …`,`koldt`,[`varmt`,`vådt`,`blæsende`],`minus fem = −5°. koldt ↔ varmt.`);
/* krop · Frederiksberg */
M('krop',1,`Jeg har ondt i …`,`hovedet`,[`hoved`,`et hoved`,`hovedets`],`have ondt i + definite form: ondt i hovedet, ondt i maven, ondt i ryggen.`);
M('krop',2,`Hvad betyder "Jeg har feber"?`,`I have a fever`,[`I have a cold`,`I am tired`,`I feel better`],`feber = fever · forkølet = having a cold · træt = tired.`,{ea:1});
M('krop',2,`Du ringer til arbejdet: "Jeg kommer ikke i dag, jeg er …"`,`syg`,[`sygt`,`syge`,`sygen`],`Jeg er syg. Melde sig syg = call in sick.`);
O('krop',2,`I have a stomach ache.`,[`Jeg`,`har`,`ondt`,`i`,`maven.`],`ondt i maven = stomach ache.`);
T('krop',2,`en tand → "the tooth"`,[`tanden`],`n-word → -en. Plural: tænder.`);
M('krop',2,`Hvor køber man medicin?`,`på apoteket`,[`i apoteket`,`på apotek`,`hos apoteket`],`på apoteket, på biblioteket, på posthuset.`);
M('krop',3,`Lægen spørger: "Hvor længe har du haft ondt?" Du svarer:`,`I tre dage.`,[`For tre dage siden.`,`Om tre dage.`,`På tre dage.`],`i + period = duration. For … siden = ago. Om = in the future.`);
L('krop',2,`Tag to piller tre gange om dagen.`,`Hvad siger lægen?`,`2 pills, 3 times a day`,[`3 pills, 2 times a day`,`2 pills a day for 3 days`,`3 pills before bed`],`gange om dagen = times a day.`);
M('krop',1,`Hej, jeg vil gerne … en tid hos lægen.`,`bestille`,[`købe`,`tage`,`lave`],`bestille tid = book an appointment.`);
M('krop',2,`— Hvordan har du det?`,`Jeg har det bedre, tak.`,[`Jeg er det bedre, tak.`,`Jeg har bedre det, tak.`,`Jeg har det godt bedre, tak.`],`Hvordan har du det? → Jeg har det godt / bedre / skidt.`,{npc:1});

/* ================= TOPICS ================= */
const TYPES={ORD:{n:'ORD',full:'Ordstilling',c:'#e07a3a'},VERB:{n:'VERB',full:'Verber',c:'#cf4a5e'},NAVN:{n:'NAVN',full:'Navneord',c:'#4f9a48'},
  BØJ:{n:'BØJ',full:'Bøjning',c:'#8f58c0'},SNAK:{n:'SNAK',full:'Samtale',c:'#c99a1c'},TID:{n:'TID',full:'Tid og tal',c:'#3f78cf'}};
const TYPE_CYCLE=['ORD','VERB','NAVN','BØJ','SNAK','TID']; // each beats the next
function typeMult(a,d){const i=TYPE_CYCLE.indexOf(a),j=TYPE_CYCLE.indexOf(d);if((i+1)%6===j)return 1.5;if((j+1)%6===i)return .67;return 1}
/* topic: [type, gym area, name, da description, en description] */
const TOPICS={
 hej:['SNAK',1,'Hilsner','Den første samtale: navn, land og sprog.','First conversations: name, country, language.'],
 adv:['ORD',1,'Adverbier','Ikke, også og altid står lige efter verbet.','ikke / også / altid go right after the verb.'],
 spm:['ORD',1,'Spørgsmål','Spørgeord, så verbum, så subjekt.','Question word, then verb, then subject.'],
 køn:['BØJ',1,'En og et','En stol, stolen. Et bord, bordet.','n-words and t-words, and the definite ending.'],
 tal:['TID',1,'Tal','Halvtreds, tres, halvfjerds … og telefonnumre.','Numbers, the Danish way, and phone numbers.'],
 hjem:['NAVN',1,'Hjemmet','Lejlighed, værelser og adresser.','Your apartment, rooms and addresses.'],
 tid:['TID',2,'Klokken','Halv otte er 7.30!','Telling the time. halv otte = 7:30.'],
 familie:['NAVN',2,'Familie','Mormor, farfar, søskende.','Family words.'],
 job1:['SNAK',2,'Arbejde','Hvad laver du? Han er journalist.','Talking about work. No article before jobs.'],
 modal:['VERB',2,'Modalverber','Skal, kan, må, vil + navnemåde.','Modal verbs + infinitive.'],
 inv1:['ORD',2,'Inversion','Om lørdagen går jeg til dansk.','Inversion: the verb stays in position 2.'],
 mad:['NAVN',2,'Mad','Morgenmad, frokost og aftensmad.','Food and meals.'],
 cykel:['VERB',2,'Transport','Cykel, bus, metro og Rejsekort.','Getting around Copenhagen.'],
 butik:['NAVN',3,'Butikker','Et sted, hvor man kan købe …','Shops, and explaining a word you forgot.'],
 kvarter:['SNAK',3,'Kvarteret','Der er et bageri. Det er hyggeligt.','Your neighbourhood. der er vs det er.'],
 hygge:['SNAK',3,'Hygge','Tak for mad, skål og tak for sidst.','Social phrases Danes use every day.'],
 gaet:['NAVN',4,'Gæt jobbet','Hvem laver hvad?','Guess the job from a description.'],
 chunk:['SNAK',4,'Chunks','Det kommer an på … Jeg er i gang med …','Ready-made chunks of Danish.'],
 empati:['SNAK',4,'Empati','Det kan jeg godt forstå. Hvad med dig?','Showing empathy in a conversation.'],
 mark:['VERB',4,'Marks historie','Lyt til Mark, kokken fra USA.','Listening: Mark the chef\'s story.'],
 kommune:['NAVN',4,'Kommunen','CPR-nummer, Borgerservice og skemaer.','Dealing with the kommune.'],
 datid:['VERB',5,'Datid','Lavede, købte, gik.','Past tense.'],
 inv2:['ORD',5,'Da-sætninger','Da jeg boede i Italien, så jeg fodbold.','Da-clauses take position 1.'],
 konj:['ORD',5,'Fordi og men','Fordi jeg altid arbejder. Men jeg er ikke træt.','Conjunctions and word order.'],
 tidsudtryk:['TID',5,'Tidsudtryk','For et år siden, om et år, i et år.','ago / in / for.'],
 historie:['TID',5,'Historier','Først, så, bagefter.','Telling a story in order.'],
 vejr:['TID',5,'Vejret','Det regner, det blæser.','Weather talk.'],
 adj:['BØJ',6,'Adjektiver','Sød, sødt, søde.','Adjective endings and personality words.'],
 pron:['BØJ',6,'Pronomener','Ham, hende, den, det, dem.','Object pronouns.'],
 poss:['BØJ',6,'Sin og hans','Sin peger tilbage på subjektet.','sin/sit/sine vs hans/hendes.'],
 krop:['NAVN',6,'Hos lægen','Jeg har ondt i hovedet.','Body, illness and the doctor.']
};
for(const k in TOPICS){const n=BANK.filter(i=>i.topic===k).length;if(!n)console.warn('empty topic',k)}

/* ================= SPECIES ================= */
/* [id, base name, evolved name, topic] — dex numbers are assigned in order (base, evolved) */
const LINES=[
 ['hej','Hejling','Goddagon'],['adv','Ikkelus','Altidor'],['spm','Hvorling','Spørgeørn'],['køn','Enetling','Bestemtaur'],['tal','Talmus','Halvfemser'],['hjem','Stuemus','Altanbjørn'],
 ['tid','Klokkekat','Halvsyvugle'],['familie','Søskendo','Farmorfant'],['job1','Joblarve','Fuldtidsfugl'],['modal','Kanling','Skalvilmå'],['inv1','Inverrotte','Omvendor'],['mad','Rugbrødling','Smørrebrodon'],['cykel','Cykling','Ladcykelokse'],
 ['butik','Kringling','Bageribasse'],['kvarter','Naboling','Kvarterkrage'],['hygge','Gløggling','Hyggetrold'],
 ['gaet','Gætling','Jobjaguar'],['chunk','Chunkling','Talemådus'],['empati','Lyttelam','Empatiger'],['mark','Kokkeling','Mesterkok'],['kommune','Skemalus','Bureaukrabbe'],
 ['datid','Gikling','Datidsdrage'],['inv2','Daling','Dakaptajn'],['konj','Fordiflue','Fordifalk'],['tidsudtryk','Sidensnog','Tidsdrake'],['historie','Ællingeling','Eventyrsvane'],['vejr','Bygesky','Stormmåge'],
 ['adj','Sødling','Lunefuldo'],['pron','Hamhende','Demdæmon'],['poss','Sinling','Sinhansslange'],['krop','Snøftling','Febertudse']
];
const SP={};const DEX=[];
SP.ræv={id:'ræv',name:'Hyggeræven',topic:'ord',topics:['adv','spm','inv1','inv2'],type:'ORD',stage:0,evo:null,no:0,seed:777,fox:true};
DEX.push(SP.ræv);
LINES.forEach(([t,a,b],i)=>{
  const ty=TOPICS[t][0],area=TOPICS[t][1];
  const s1={id:t+'1',name:a,topic:t,topics:[t],type:ty,stage:0,evo:t+'2',evoLv:9+area*3,seed:hash(t).split('').reduce((s,c)=>s*31+c.charCodeAt(0),7)>>>0};
  const s2={id:t+'2',name:b,topic:t,topics:[t],type:ty,stage:1,evo:null,seed:s1.seed};
  SP[s1.id]=s1;SP[s2.id]=s2;s1.no=DEX.length;DEX.push(s1);s2.no=DEX.length;DEX.push(s2);
});

/* ================= GYM BOARDS (the teacher's board per topic group) ================= */
const TAVLE=[["Spørgsmål: spørgeord – verbum – subjekt. <i>Hvor kommer du fra?</i>","Ja/nej-spørgsmål: verbet først. <i>Kommer han fra Polen?</i>","Adverbier (ikke, også, altid, kun) efter verbet: <i>Sheng taler også engelsk.</i>","<i>en stol → stolen</i> · <i>et bord → bordet</i> · den/det følger kønnet.","Telefonnumre i par: <i>51 80 12 89</i> = enoghalvtreds, firs, tolv, niogfirs."],["<i>halv otte</i> = 7:30 — Danish counts towards the next hour.","Inversion: <i>Om lørdagen går jeg til dansk.</i> The verb stays in position 2.","<i>skal</i> = plan · <i>kan</i> = possibility · <i>må</i> = permission · <i>vil</i> = wish","Jobs without article: <i>Han er journalist.</i>","Førnutid for duration: <i>Jeg har boet i Danmark i to år.</i>"],["Forklar et ord: <i>Et sted, hvor man kan købe brød og kager.</i>","<i>Der er</i> et bageri (there is) ≠ <i>Det er</i> et bageri (it is).","<i>på apoteket · i bageriet · hos slagteren</i>","Talk about your kvarter: what there is, what you like, what you are <i>træt af</i>."],["Chunks: <i>jeg er i gang med …</i> · <i>det kommer an på …</i> · <i>jeg kunne godt tænke mig at …</i>","Empathy: <i>i lige måde · det kan jeg godt forstå · hvor spændende · det kender jeg godt · hvad med dig?</i>","After <i>fordi</i>: S–A–V → <i>fordi jeg godt kan lide at tage billeder</i>","Keep a list of expressions and revisit it every week."],["Datid: <i>lave → lavede</i> · <i>købe → købte</i> · <i>gå → gik</i>","<i>Da jeg boede i Italien, så jeg fodbold.</i> The da-clause is position 1 → verb, subject.","<i>fordi jeg altid arbejder</i> (S–A–V) · <i>men jeg er ikke træt</i> (S–V–A)","<i>for … siden</i> = ago · <i>om</i> = future / regularly · <i>i</i> = duration"],["<i>ham, hende, den, det, dem, dig, os</i>","<i>sin/sit/sine</i> point back to the subject: <i>Mark taler med sine kolleger.</i>","Plural adjective +e: <i>søde</i> · t-word +t: <i>et sødt barn</i>","Describe people: <i>lunefuld, glemsom, forstående, hjælpsom, punktlig</i>"]];
