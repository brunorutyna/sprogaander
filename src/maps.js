/* ================= WORLD + STORY DATA ================= */
const EDGE_OPEN='TTTTTTTTT::TTTTTTTTT',EDGE_SHUT='TTTTTTTTTTTTTTTTTTTT';
const wrap=rows=>rows.map(r=>'T'+r+'T');
const tl=(da,en)=>[da,en];
const NEON={bodega:'#ff5a6a',kiosk:'#7dff6a',venue:'#ffcf6a',skift:'#7dff6a'};
const SKIFT_GATE=(n,team)=>({id:'skift'+n,look:'skifter',gate:n,
  trainer:{name:'Skift-konsulenten',title:'',team,
   intro:tl('Okay, du har mærket. Men har du prøvet vores app? Den oversætter alt. Nej? Så må vi kæmpe. Det står i min kontrakt.','Okay, you have the badge. But have you tried our app? It translates everything. No? Then we have to fight. It\'s in my contract.'),
   lose:tl('Du taler for godt dansk. Jeg skifter … til dansk. Det er første gang.','You speak Danish too well. I\'m switching… to Danish. First time.')}});

/* Outdoor maps run north → south. A map's bottom opening (x 9–10) leads to the next map's top. */
const OUT=[
{id:'norrebro',name:'Nørrebro',area:1,town:true,top:false,rows:ROWS.norrebro,
 doors:[{k:'home'},{k:'house',npcs:[{x:3,y:3,d:'d',look:'e',name:'Fru Hansen',lines:[
   tl('Goddag. Er du den nye? Vi sorterer affald her i opgangen. Plast, pap, glas, metal, rest og bio.','Good day. Are you the new one? We sort rubbish in this building. Plastic, cardboard, glass, metal, residual and bio.'),
   tl('Der er eksamen på fredag. … Det var en joke. Danskere har humor. Det ser bare ikke sådan ud.','There\'s an exam on Friday. … That was a joke. Danes have humour. It just doesn\'t look like it.')]}]}],
 signs:{'13,7':tl('NØRREBRO\nCykler, kebab og meninger.','NØRREBRO\nBikes, kebab and opinions.')},
 npcs:[
  {id:'ali',x:6,y:10,d:'r',look:'c',name:'Ali',lines:[tl('Jeg har boet her i tolv år. Jeg har haft syv cykler. Seks er blevet stjålet.','I\'ve lived here for twelve years. I\'ve had seven bikes. Six were stolen.'),tl('Den syvende er grim. Derfor har jeg den stadig.','The seventh is ugly. That\'s why I still have it.')]},
  {id:'grass',x:14,y:11,d:'l',look:'g',name:'Nabo',lines:[tl('Der står noget i græsset og kigger på mig. Det er enten en ånd eller min eks.','Something is standing in the grass looking at me. It\'s either a spirit or my ex.')]},
  {id:'kurt',x:11,y:12,d:'l',look:'kurt',name:'Kombucha-Kurt',kurt:true},
  {id:'leo',x:9,y:12,d:'u',look:'teacher',hidden:true,name:'Lone'},
  {id:'kim1',x:10,y:12,d:'u',look:'kim',hidden:true,name:'Kim',
   trainer:{name:'Kim',title:'',team:[['hej1',3]],prize:60,tutorial:true,
    intro:tl('Hey! Øh … hej! Jeg er Kim. Vi går på samme hold hos Lone. Jeg kan også se ånder. Skal vi … battle? Øh, kæmpe?','Hey! Uh… hi! I\'m Kim. We\'re in the same class with Lone. I can see spirits too. Shall we… battle? Uh, fight?'),
    lose:tl('Okay, du vandt. Jeg skal på arbejde. Jeg er praktikant hos SKIFT. It\'s a startup. Øh, en virksomhed.','Okay, you won. I have to go to work. I\'m an intern at SKIFT. It\'s a startup. Uh, a company.'),
    after:tl('Vi ses i Østerbro. Eller på Slack.','See you in Østerbro. Or on Slack.')}}
 ]},
{id:'r1',name:'Assistens Kirkegård',area:1,lv:[3,5],rows:ROWS.r1,
 signs:{'5,11':tl('ASSISTENS KIRKEGÅRD\nH.C. Andersen og Søren Kierkegaard ligger her. De siger ikke så meget.','ASSISTENS CEMETERY\nH.C. Andersen and Søren Kierkegaard lie here. They don\'t say much.')},
 npcs:[
  {id:'ida',x:7,y:7,d:'r',look:'b',trainer:{name:'Ida',title:'Studerende',team:[['tal1',4]],sight:3,intro:tl('Kan du tælle til halvfems? Jeg er dansker, og jeg forstår det heller ikke.','Can you count to ninety? I\'m Danish and I don\'t understand it either.'),lose:tl('Halv-fem-sinds-tyve. Det giver ingen mening. Du vandt.','Half-five-times-twenty. It makes no sense. You won.'),after:tl('Kierkegaard ligger lige der. Han var også lidt trist.','Kierkegaard lies right there. He was a bit sad too.')}},
  {id:'ole',x:12,y:12,d:'l',look:'d',trainer:{name:'Ole',title:'Cyklist',team:[['hjem1',4],['køn1',4]],sight:3,intro:tl('Stop! Ved du, hvad "st. th." betyder? Det betyder ikke "stop, thanks".','Stop! Do you know what "st. th." means? It doesn\'t mean "stop, thanks".'),lose:tl('Stuen, til højre. Du vidste det. Fint.','Ground floor, right. You knew it. Fine.'),after:tl('Jeg bor på fjerde sal uden elevator. Mine ben er fantastiske.','I live on the fourth floor without a lift. My legs are fantastic.')}}
 ]},
{id:'osterbro',name:'Østerbro',area:1,town:true,gym:1,rows:ROWS.osterbro,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'gym',n:1},{k:'house',npcs:[{x:3,y:2,d:'d',look:'e',name:'Erik',lines:[tl('Mit telefonnummer er enoghalvtreds, firs, tolv, niogfirs. Ring ikke.','My phone number is 51 80 12 89. Don\'t call.'),tl('Danske telefonnumre siger man i par. Det er lettere, siger danskerne.','Danish phone numbers are said in pairs. It\'s easier, say the Danes.')]}]}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[12,8,6,'QUIZBAREN',NEON.venue]],
 signs:{'3,8':tl('ØSTERBRO\nBarnevogne, løbeskoe og havremælk.','ØSTERBRO\nPrams, running shoes and oat milk.')},
 npcs:[
  {id:'svensk',x:6,y:14,d:'u',look:'a',name:'Svensker',lines:[tl('Jeg kommer fra Sverige. Danskerne siger, at jeg taler godt dansk. De er bare høflige.','I\'m from Sweden. The Danes say I speak good Danish. They\'re just being polite.')]},
  {id:'quiz1',x:15,y:7,d:'d',look:'f',quiz:true,name:'Quiz-nørden'},
  Object.assign(SKIFT_GATE(1,[['spm1',8],['tal1',8]]),{x:11,y:16,d:'l'})
 ]},
{id:'r2',name:'Søerne',area:2,lv:[7,10],rows:ROWS.r2,
 signs:{'6,9':tl('SØERNE\nHer løber folk rundt. Frivilligt.','THE LAKES\nPeople run around here. Voluntarily.')},
 npcs:[
  {id:'mette',x:7,y:5,d:'d',look:'d',trainer:{name:'Mette',title:'Løber',team:[['tid1',8]],sight:3,intro:tl('Jeg løber hver dag klokken halv syv. Det er 6.30. Ja, om morgenen.','I run every day at half past six. That\'s 6:30. Yes, in the morning.'),lose:tl('Puh. Nu skal jeg have en kaffe og en smøg.','Phew. Now I need a coffee and a smoke.'),after:tl('Halv syv er 6.30. Det har ødelagt mange aftaler.','Halv syv is 6:30. It has ruined many appointments.')}},
  {id:'signe',x:13,y:13,d:'l',look:'b',trainer:{name:'Signe',title:'Mor',team:[['familie1',8],['mad1',9]],sight:3,intro:tl('Min datter hedder Alma. Min mand hedder Peter. Min hund hedder også Peter. Lang historie.','My daughter is called Alma. My husband is called Peter. My dog is also called Peter. Long story.'),lose:tl('Godt klaret. Jeg skal hente Peter. Hunden.','Well done. I have to pick up Peter. The dog.'),after:tl('Mormor er min mors mor. Farmor er min fars mor. Svigermor er et problem.','Mormor is my mum\'s mum. Farmor is my dad\'s mum. Mother-in-law is a problem.')}}
 ]},
{id:'vesterbro',name:'Vesterbro',area:2,town:true,gym:2,rows:ROWS.vesterbro,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'house',npcs:[{x:6,y:2,d:'d',look:'f',name:'Sygeplejersken',lines:[tl('Jeg er sygeplejerske. Ikke "en" sygeplejerske. Jobs har ingen artikel. Folk har problemer nok.','I\'m a nurse. Not "a" nurse. Jobs have no article. People have enough problems.')]}]},{k:'gym',n:2}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[12,8,6,'CYKLER',NEON.venue]],
 signs:{'6,15':tl('VESTERBRO\nFør: slagtere. Nu: kaffebarer, der ligner slagtere.','VESTERBRO\nBefore: butchers. Now: coffee bars that look like butchers.')},
 npcs:[
  {id:'lordag',x:3,y:14,d:'r',look:'g',name:'Kursist',lines:[tl('Om lørdagen går jeg til dansk. Om søndagen glemmer jeg det hele.','On Saturdays I go to Danish class. On Sundays I forget all of it.')]},
  {id:'halv',x:15,y:7,d:'d',look:'h',name:'Forsinket mand',lines:[tl('Klokken er halv otte. Det betyder 7.30. Jeg kom en time for sent til min første date.','It\'s "halv otte". That means 7:30. I was an hour late for my first date.')]},
  {id:'quiz2',x:4,y:7,d:'d',look:'a',quiz:true,name:'Quiz-nørden'},
  Object.assign(SKIFT_GATE(2,[['modal1',13],['inv11',13]]),{x:11,y:16,d:'l'})
 ]},
{id:'r3',name:'Kalvebod Brygge',area:3,lv:[11,14],rows:ROWS.r3,
 signs:{'3,12':tl('KALVEBOD BRYGGE\nGlas, beton og vind fra alle retninger.','KALVEBOD BRYGGE\nGlass, concrete and wind from every direction.')},
 npcs:[
  {id:'bent',x:6,y:6,d:'d',look:'e',trainer:{name:'Bjarne',title:'Lystfisker',team:[['butik1',12]],sight:2,intro:tl('Hvad køber man hos bageren? Brød. Hos fiskehandleren? Fisk. I kiosken klokken tre om natten? Fortrydelse.','What do you buy at the baker\'s? Bread. At the fishmonger\'s? Fish. At the kiosk at 3 a.m.? Regret.'),lose:tl('Fint. Jeg køber en pølse.','Fine. I\'ll buy a hot dog.'),after:tl('Et sted, hvor man køber fisk: en fiskehandler.','A place where you buy fish: a fishmonger.')}},
  {id:'anna',x:13,y:9,d:'l',look:'b',trainer:{name:'Anna',title:'Turist',team:[['kvarter1',13]],sight:3,intro:tl('Undskyld, hvor kan man købe en kaffe til under halvtreds kroner? … Nå. Ingen steder.','Excuse me, where can you buy a coffee for under fifty kroner? … Right. Nowhere.'),lose:tl('Okay. Jeg drikker vand.','Okay. I\'ll drink water.'),after:tl('Der er en café på Christianshavn. Den er hyggelig og meget dyr.','There\'s a café in Christianshavn. It\'s cosy and very expensive.')}},
  {id:'kim2',x:9,y:12,d:'u',look:'kim',trainer:{name:'Kim',title:'',team:[['hej1',12],['cykel1',12],['inv11',13]],sight:3,intro:tl('{N}! Jeg har fået en SKIFT-hættetrøje. Og ingen løn. Men det er en god oplevelse, siger Magnus.','{N}! I got a SKIFT hoodie. And no salary. But it\'s a good experience, says Magnus.'),lose:tl('Øv. Du er stadig bedre. Magnus siger, at Skift 2.0 snart er klar.','Bummer. You\'re still better. Magnus says Skift 2.0 is ready soon.'),after:tl('Jeg må ikke sige mere. Tavshedspligt. Det er et dansk ord, jeg har lært på arbejdet.','I can\'t say more. Confidentiality. It\'s a Danish word I learned at work.')}}
 ]},
{id:'christianshavn',name:'Christianshavn',area:3,town:true,gym:3,rows:ROWS.christianshavn,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'house',npcs:[{x:3,y:2,d:'d',look:'b',name:'Naboen',gift:{item:'rugbrod',n:2,flag:'aebleskiver'},lines:[tl('Velbekomme. Jeg har lavet for meget mad. Det gør jeg altid. Tag noget med.','Enjoy. I\'ve made too much food. I always do. Take some with you.')]}]},{k:'gym',n:3}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[2,10,6,'MIDDAG',NEON.venue]],
 signs:{'5,15':tl('CHRISTIANSHAVN\nKanaler, husbåde og folk, der har læst Kierkegaard.','CHRISTIANSHAVN\nCanals, houseboats and people who have read Kierkegaard.')},
 npcs:[
  {id:'kirke',x:3,y:9,d:'d',look:'g',name:'Lokal',lines:[tl('Der er et bageri, en café og en kirke i mit kvarter. Jeg bruger kun bageriet.','There\'s a bakery, a café and a church in my neighbourhood. I only use the bakery.')]},
  {id:'sidst',x:16,y:5,d:'l',look:'h',name:'Høflig kvinde',lines:[tl('Tak for sidst! … Nå nej, vi har aldrig mødt hinanden. Jeg siger det til alle. For en sikkerheds skyld.','Thanks for last time! … Oh, we\'ve never met. I say it to everyone. Just in case.')]},
  {id:'quiz3',x:15,y:9,d:'d',look:'c',quiz:true,name:'Quiz-nørden'},
  Object.assign(SKIFT_GATE(3,[['butik1',17],['hygge1',17]]),{x:11,y:16,d:'l'})
 ]},
{id:'r4',name:'Amager Fælled',area:4,lv:[15,18],rows:ROWS.r4,
 signs:{'5,10':tl('AMAGER FÆLLED\nNatur. Rigtig natur. Med myg.','AMAGER COMMONS\nNature. Real nature. With mosquitoes.')},
 npcs:[
  {id:'lis',x:7,y:5,d:'d',look:'f',trainer:{name:'Lis',title:'Fuglekigger',team:[['gaet1',16]],sight:4,intro:tl('Gæt mit job: Jeg passer på dyr, når de er syge. Og så græder jeg i bilen.','Guess my job: I look after animals when they\'re sick. And then I cry in the car.'),lose:tl('Ja. Dyrlæge.','Yes. Vet.'),after:tl('Uden artikel: Jeg er dyrlæge. Med adjektiv: Jeg er en træt dyrlæge.','Without article: I\'m a vet. With an adjective: I\'m a tired vet.')}},
  {id:'emil',x:12,y:13,d:'l',look:'c',trainer:{name:'Emil',title:'Spejder',team:[['chunk1',16],['empati1',17]],sight:3,intro:tl('Hvordan går det? … I lige måde. Sådan. Nu har vi talt sammen.','How\'s it going? … Likewise. There. Now we\'ve talked.'),lose:tl('Det kan jeg godt forstå.','I can understand that.'),after:tl('"I lige måde" redder enhver samtale. Næsten.','"Likewise" saves any conversation. Almost.')}}
 ]},
{id:'orestad',name:'Ørestad',area:4,town:true,gym:4,rows:ROWS.orestad,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'house',title:'SKIFT',npcs:[{x:5,y:2,d:'d',look:'skifter',name:'Receptionisten',lines:[tl('Velkommen til SKIFT. We are disrupting language. Øh … vi ødelægger sprog. Nej, vent.','Welcome to SKIFT. We are disrupting language. Uh… we destroy language. No, wait.'),tl('Magnus er ikke her. Han er på en podcast om sig selv.','Magnus isn\'t here. He\'s on a podcast about himself.')]}]},{k:'gym',n:4}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[2,8,6,'SKIFT',NEON.skift],[12,8,6,'BORGERSERVICE',NEON.venue]],
 signs:{'3,15':tl('ØRESTAD\nFremtiden. Den blæser.','ØRESTAD\nThe future. It\'s windy.')},
 npcs:[
  {id:'igang',x:6,y:7,d:'d',look:'d',name:'Ingeniør',lines:[tl('Jeg er i gang med at lære dansk. Det kommer an på dagen, hvor godt det går. I dag går det skidt.','I\'m in the middle of learning Danish. It depends on the day how it goes. Today it\'s going badly.')]},
  {id:'kender',x:16,y:14,d:'l',look:'a',name:'Expat',lines:[tl('Er du ny i Danmark? Det kender jeg godt. Efter fem år er det stadig nyt.','Are you new in Denmark? I know that feeling. After five years it\'s still new.')]},
  {id:'quiz4',x:15,y:7,d:'d',look:'clerk',quiz:true,topic:'kommune',name:'Kommunens maskot'},
  Object.assign(SKIFT_GATE(4,[['chunk1',21],['gaet1',21]]),{x:11,y:16,d:'l'})
 ]},
{id:'r5',name:'Langebro',area:5,lv:[19,22],rows:ROWS.r5,
 signs:{'5,11':tl('LANGEBRO\nBroen over havnen. Her har mange stået og tænkt over livet.','LANGEBRO\nThe bridge over the harbour. Many have stood here thinking about life.')},
 npcs:[
  {id:'freja',x:10,y:5,d:'l',look:'g',trainer:{name:'Freja',title:'Vinterbader',team:[['vejr1',20]],sight:1,intro:tl('Jeg badede i havnen i morges. Vandet var ni grader. Jeg kan ikke mærke mine tæer.','I swam in the harbour this morning. The water was nine degrees. I can\'t feel my toes.'),lose:tl('Brr. Nu skal jeg i sauna.','Brr. Sauna time.'),after:tl('Det er koldt, men det er godt for … noget.','It\'s cold, but it\'s good for… something.')}},
  {id:'jonas',x:13,y:13,d:'l',look:'a',trainer:{name:'Jonas',title:'Studerende',team:[['datid1',20],['konj1',21]],sight:3,intro:tl('I går læste jeg hele dagen, fordi jeg havde eksamen. Så sov jeg over mig.','Yesterday I studied all day because I had an exam. Then I overslept.'),lose:tl('Jeg dumpede også den her.','I failed this one too.'),after:tl('Læse, læste. Sove, sov. Dumpe, dumpede.','Read, read. Sleep, slept. Fail, failed.')}}
 ]},
{id:'nyhavn',name:'Nyhavn',area:5,town:true,gym:5,rows:ROWS.nyhavn,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'house',npcs:[{x:3,y:2,d:'d',look:'e',name:'Gammel sømand',lines:[tl('Da jeg var ung, sejlede jeg på et skib. Jeg så hele verden.','When I was young, I sailed on a ship. I saw the whole world.'),tl('Nu ser jeg mest fjernsyn. Det er også en slags verden.','Now I mostly watch TV. That\'s also a kind of world.')]}]},{k:'gym',n:5}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[12,12,6,'KROEN',NEON.venue]],
 signs:{'7,5':tl('NYHAVN\nSmukke huse. Dyre øl. Turister, der tager billeder af dyre øl.','NYHAVN\nPretty houses. Expensive beer. Tourists photographing expensive beer.')},
 npcs:[
  {id:'hca',x:4,y:7,d:'d',look:'f',name:'Guide',lines:[tl('H.C. Andersen boede her. Han skrev "Den grimme ælling". Den handler om at flytte til et nyt land, hvis du spørger mig.','H.C. Andersen lived here. He wrote "The Ugly Duckling". It\'s about moving to a new country, if you ask me.')]},
  {id:'vejr',x:14,y:10,d:'u',look:'h',name:'Optimist',lines:[tl('I går regnede det. I dag regner det. I morgen? Det regner nok.','Yesterday it rained. Today it\'s raining. Tomorrow? It\'ll probably rain.')]},
  {id:'quiz5',x:15,y:7,d:'d',look:'d',quiz:true,name:'Quiz-nørden'},
  Object.assign(SKIFT_GATE(5,[['datid1',25],['slang1',25]]),{x:12,y:16,d:'l'})
 ]},
{id:'r6',name:'Kongens Have',area:6,lv:[23,26],rows:ROWS.r6,
 signs:{'15,11':tl('KONGENS HAVE\nDanmarks ældste kongelige have. Kongen er her ikke.','THE KING\'S GARDEN\nDenmark\'s oldest royal garden. The king isn\'t here.'),'4,11':tl('En statue af H.C. Andersen. Han læser højt for nogen, der ikke er der. Ligesom en dansklærer i juli.','A statue of H.C. Andersen. He reads aloud to someone who isn\'t there. Like a Danish teacher in July.')},
 npcs:[
  {id:'hans',x:3,y:7,d:'r',look:'c',trainer:{name:'Hans',title:'Gartner',team:[['adj1',24]],sight:5,intro:tl('Blomsterne er smukke. Smukt eller smukke? Svarer du forkert, klipper jeg din hæk.','The flowers are beautiful. Smukt or smukke? Answer wrong and I\'ll cut your hedge.'),lose:tl('Smukke. Flertal. Din hæk er reddet.','Smukke. Plural. Your hedge is saved.'),after:tl('En smuk blomst, et smukt træ, smukke blomster.','A beautiful flower, a beautiful tree, beautiful flowers.')}},
  {id:'kim3',x:10,y:14,d:'u',look:'kim',trainer:{name:'Kim',title:'',team:[['hej2',25],['cykel2',25],['inv12',26],['vejr1',25]],sight:3,intro:tl('{N}. Jeg har sagt op hos SKIFT. På dansk. Det tog fire minutter. Skal vi kæmpe? Bare for sjov.','{N}. I quit SKIFT. In Danish. It took four minutes. Shall we fight? Just for fun.'),lose:tl('Godt. Nu er jeg klar til Prøven. Næsten.','Good. Now I\'m ready for the Exam. Almost.'),after:tl('Magnus ringede. Jeg tog den ikke. Det føltes fantastisk.','Magnus called. I didn\'t pick up. It felt amazing.')}}
 ]},
{id:'frederiksberg',name:'Frederiksberg',area:6,town:true,gym:6,rows:ROWS.frederiksberg,
 doors:[{k:'kiosk'},{k:'hygge'},{k:'gym',n:6},{k:'house',npcs:[{x:3,y:2,d:'d',look:'b',name:'Gift kvinde',lines:[tl('Jeg er punktlig. Min mand er altid forsinket. Vi har været gift i tredive år.','I\'m punctual. My husband is always late. We\'ve been married for thirty years.'),tl('Jeg har ventet i femten af dem.','I\'ve spent fifteen of them waiting.')]}]}],
 labels:[[2,2,5,'KIOSK',NEON.kiosk],[13,2,5,'BODEGA',NEON.bodega],[2,8,6,'SPEEDDATING',NEON.venue]],
 signs:{'3,15':tl('FREDERIKSBERG\nEn by inde i byen. Den er meget stolt af det.','FREDERIKSBERG\nA city inside the city. It\'s very proud of it.')},
 npcs:[
  {id:'glemsom',x:9,y:7,d:'d',look:'g',name:'Nabo',lines:[tl('Min nabo er sød, men glemsom. Han glemmer altid sine nøgler. Og sin kone.','My neighbour is sweet but forgetful. He always forgets his keys. And his wife.')]},
  {id:'ondt',x:16,y:15,d:'l',look:'h',name:'Patient',lines:[tl('Jeg har ondt i ryggen. Lægen siger, jeg skal drikke vand og gå en tur. Det siger lægen altid.','My back hurts. The doctor says I should drink water and go for a walk. The doctor always says that.')]},
  {id:'quiz6',x:16,y:7,d:'d',look:'a',quiz:true,name:'Quiz-nørden'},
  Object.assign(SKIFT_GATE(6,[['pron1',29],['poss1',29]]),{x:11,y:16,d:'l'})
 ]},
{id:'r7',name:'Strøget',area:7,lv:[27,30],rows:ROWS.r7,
 signs:{'3,13':tl('STRØGET\nEn af Europas længste gågader. Og en af de dyreste.','STRØGET\nOne of Europe\'s longest pedestrian streets. And one of the most expensive.')},
 npcs:[
  {id:'sk7a',x:7,y:3,d:'d',look:'skifter',trainer:{name:'Skift-sælgeren',title:'',team:[['chunk2',28],['hygge2',28]],sight:3,intro:tl('Hej! Har du prøvet SKIFT? Den oversætter alt. Du behøver aldrig lære dansk!','Hi! Have you tried SKIFT? It translates everything. You never need to learn Danish!'),lose:tl('Hvad?! Du svarer på dansk. Det står ikke i vores pitch deck.','What?! You answer in Danish. That\'s not in our pitch deck.'),after:tl('Måske skal jeg også lære dansk. Måske.','Maybe I should learn Danish too. Maybe.')}},
  {id:'sk7b',x:11,y:9,d:'l',look:'skifter',trainer:{name:'Skift-sælgeren',title:'',team:[['empati2',29],['kvarter2',29]],sight:2,intro:tl('Sorry, can we do this in English? It\'s more efficient.','Sorry, can we do this in English? It\'s more efficient.'),lose:tl('Okay … jeg forstår dig faktisk. Det er skræmmende.','Okay… I actually understand you. That\'s scary.'),after:tl('Jeg var bager, før jeg kom til SKIFT. Jeg savner rugbrød.','I was a baker before SKIFT. I miss rye bread.')}}
 ]},
{id:'borgergade',name:'Borgergade',area:7,town:true,bottom:false,rows:ROWS.borgergade,
 doors:[{k:'hygge'},{k:'kiosk'},{k:'final'},{k:'final'}],
 labels:[[2,2,5,'BODEGA',NEON.bodega],[13,2,5,'KIOSK',NEON.kiosk],[3,8,14,'SPROGSKOLEN Ø',NEON.venue]],
 signs:{'6,13':tl('BORGERGADE\nSprogskolen Ø. Prøven kræver seks mærker og nerver af stål.','BORGERGADE\nSprogskolen Ø. The Exam requires six badges and nerves of steel.')},
 npcs:[
  {id:'held',x:14,y:15,d:'u',look:'f',name:'Tidligere kursist',lines:[tl('Prøven er i dag. Jeg har bestået den. Det tog fire forsøg. Held og lykke.','The Exam is today. I passed it. It took four attempts. Good luck.')]},
  {id:'vagt',x:11,y:12,d:'l',look:'bent',name:'Vagten',lines:[tl('Du skal have seks mærker for at gå til Prøven. Reglerne er reglerne. Det er det, der er reglerne.','You need six badges to take the Exam. Rules are rules. That\'s what rules are.')]}
 ]}
];

/* ================= INTERIORS ================= */
const INT={
 home:["##########","#Yh___n_q#","#________#","#__n_____#","#________#","#q_____h_#","#___mm___#","##########"],
 hygge:["##########","#h______C#","#__KKKK__#","#________#","#n______n#","#q______q#","#___mm___#","##########"],
 kiosk:["##########","#hhhh__hh#","#____KK__#","#________#","#_hh__hh_#","#________#","#___mm___#","##########"],
 house:["##########","#hh__t_qY#","#________#","#_n______#","#______n_#","#q_______#","#___mm___#","##########"],
 gym:["##########","#I__tt__I#","#GGGGGGGG#","#GGGGGGGG#","#hhGGGGhh#","#GGGGGGGG#","#GGGGGGGG#","#hhGGGGhh#","#GGGGGGGG#","#GGGGGGGG#","#qGGGGGGq#","#GGGGGGGG#","#GGGmmGGG#","##########"],
 final:["##########","#I_tttt_I#","#GGGGGGGG#","#GGGGGGGG#","#hhhGGhhh#","#GGGGGGGG#","#GGGGGGGG#","#hhhGGhhh#","#GGGGGGGG#","#GGGGGGGG#","#hhhGGhhh#","#GGGGGGGG#","#qGGGGGGq#","#GGGmmGGG#","##########"]
};
const GYMS=[null,
 {leader:'Henning',title:'Quizmester',look:'henning',venue:'Quizbaren',town:'Østerbro',badge:'Ølbrikken',topics:['spm','adv','hej','køn','tal','hjem'],
  team:[['spm1',6],['adv1',7],['hej1',8]],
  intro:tl('Velkommen til Quizbaren. Jeg hedder Henning. Jeg har stillet spørgsmål i 41 år. Ingen har svaret rigtigt på dem alle.','Welcome to Quizbaren. I\'m Henning. I\'ve been asking questions for 41 years. Nobody has answered all of them correctly.'),
  win:tl('Du svarede rigtigt. Det har jeg det lidt svært med. Her er Ølbrikken.','You answered correctly. I find that a bit hard. Here\'s the Beer Coaster.'),
  after:[tl('Næste uge bliver quizzen på engelsk. SKIFT betaler. Jeg er for gammel til det her.','Next week the quiz will be in English. SKIFT is paying. I\'m too old for this.')],
  tr:[{name:'Laura',look:'b',team:[['køn1',6]],intro:tl('Er det en øl eller et øl? Jeg har drukket tre, så jeg er ikke sikker.','Is it "en øl" or "et øl"? I\'ve had three, so I\'m not sure.'),lose:tl('Begge dele er rigtige. Skål.','Both are correct. Cheers.')},
      {name:'Sheng',look:'c',team:[['hej1',6],['tal1',6]],intro:tl('Hej. Jeg hedder Sheng. Jeg har vundet quizzen tre gange. Jeg snød to gange.','Hi. I\'m Sheng. I\'ve won the quiz three times. I cheated twice.'),lose:tl('Du snyder ikke. Det er irriterende.','You don\'t cheat. That\'s annoying.')}]},
 {leader:'Søren',title:'Cykelsmed',look:'soren',venue:'Cykelværkstedet',town:'Vesterbro',badge:'Ventilen',topics:['tid','modal','inv1','familie','job1','mad','cykel'],
  team:[['tid1',12],['modal1',12],['inv11',14]],
  intro:tl('Hvad er klokken? Kvart over jeg-gider-ikke. Okay. Vis mig, at du kan klokken, så får du en cykel.','What time is it? Quarter past I-can\'t-be-bothered. Okay. Show me you know the time and you get a bike.'),
  win:tl('Fint. Her er Ventilen. Pump dine dæk. Pump dit dansk.','Fine. Here\'s the Valve. Pump your tyres. Pump your Danish.'),
  after:[tl('Cyklen er klar. Den er brugt. Den er grim. Den er din. Ingen vil stjæle den.','The bike is ready. It\'s used. It\'s ugly. It\'s yours. Nobody will steal it.'),tl('SKIFT har sat engelske stemmer på alle bycykler. "Turn left." Jeg kunne græde.','SKIFT has put English voices on all city bikes. "Turn left." I could cry.')],
  tr:[{name:'Inge',look:'e',team:[['familie1',11]],intro:tl('Min mormor cyklede, til hun var halvfems. Så fik hun en elcykel. Nu er hun umulig.','My grandmother cycled until she was ninety. Then she got an e-bike. Now she\'s impossible.'),lose:tl('Godt klaret, unge menneske.','Well done, young person.')},
      {name:'Adam',look:'a',team:[['job11',11],['mad1',12]],intro:tl('Jeg skal på arbejde. Jeg har været forsinket i tre år. Det er min stil.','I have to go to work. I\'ve been late for three years. It\'s my style.'),lose:tl('Nu er jeg forsinket igen. Perfekt.','Now I\'m late again. Perfect.')}]},
 {leader:'Marianne',title:'Værtinde',look:'marianne',venue:'Middagen',town:'Christianshavn',badge:'Kringlen',topics:['butik','kvarter','hygge'],
  team:[['butik1',16],['hygge1',17],['butik2',18]],
  intro:tl('Velkommen. Tag skoene af. Sæt dig. Rejs dig. Sæt dig igen. Hygge er ikke for amatører.','Welcome. Take your shoes off. Sit down. Stand up. Sit down again. Hygge is not for amateurs.'),
  win:tl('Du sagde tak for mad. Tre gange. Perfekt. Her er Kringlen.','You said thanks for the food. Three times. Perfect. Here\'s the Kringle.'),
  after:[tl('Min nevø Magnus ejer SKIFT. Han var sådan en sød dreng. Nu siger han "disrupt" og spiser ikke rugbrød.','My nephew Magnus owns SKIFT. He was such a sweet boy. Now he says "disrupt" and doesn\'t eat rye bread.')],
  tr:[{name:'Karen',look:'b',team:[['kvarter1',15]],intro:tl('Hej nabo. Hvad synes du om kvarteret? Svar ikke ærligt. Det er dansk høflighed.','Hi neighbour. What do you think of the neighbourhood? Don\'t answer honestly. It\'s Danish politeness.'),lose:tl('Det synes jeg også. Det er løgn.','I think so too. That\'s a lie.')},
      {name:'Tom',look:'d',team:[['butik1',15],['hygge1',15]],intro:tl('Skål! Man skal kigge folk i øjnene. Ellers får man syv års dårlig sex. Det siger man.','Cheers! You have to look people in the eyes. Otherwise you get seven years of bad sex. So they say.'),lose:tl('Du kiggede mig i øjnene. Tak.','You looked me in the eyes. Thanks.')}]},
 {leader:'Bent',title:'Sagsbehandler',look:'bent',venue:'Borgerservice',town:'Ørestad',badge:'CPR-nummeret',topics:['mark','chunk','gaet','empati','kommune'],
  team:[['kommune1',20],['chunk1',21],['gaet2',22]],
  intro:tl('Tag et nummer. … Nej, ikke det nummer. Et andet nummer. Velkommen til Borgerservice.','Take a number. … No, not that number. Another number. Welcome to Citizen Services.'),
  win:tl('Det er … korrekt udfyldt. Det er sket én gang før. I 1998. Her er dit CPR-nummer.','It\'s… correctly filled in. That has happened once before. In 1998. Here is your CPR number.'),
  after:[tl('Tillykke. Nu findes du officielt. Det skal fejres. Med en kop kaffe fra automaten.','Congratulations. Now you officially exist. It must be celebrated. With a coffee from the machine.')],
  tr:[{name:'Sara',look:'g',team:[['empati1',19]],intro:tl('Hvordan går det? … Det kan jeg godt forstå. Jeg har ventet i fire timer.','How are you? … I can understand that. I\'ve been waiting for four hours.'),lose:tl('Hvor spændende. Jeg venter videre.','How exciting. I\'ll keep waiting.')},
      {name:'Per',look:'f',team:[['gaet1',19],['mark1',20]],intro:tl('Hvad laver du, og hvad kunne du godt tænke dig? Jeg kunne godt tænke mig at gå hjem.','What do you do, and what would you like to do? I would like to go home.'),lose:tl('Du kunne godt blive sagsbehandler. Det er ikke et kompliment.','You could become a case worker. It\'s not a compliment.')}]},
 {leader:'Ib',title:'Kaptajn',look:'ib',venue:'Kroen',town:'Nyhavn',badge:'Ankeret',topics:['datid','tidsudtryk','inv2','konj','historie','vejr','slang'],
  team:[['tidsudtryk1',24],['slang1',25],['datid2',26]],
  intro:tl('Jeg har sejlet i halvtreds år. Jeg har set storme, pirater og en svensker, der kunne sige "rødgrød med fløde".','I\'ve sailed for fifty years. I\'ve seen storms, pirates and a Swede who could say "rødgrød med fløde".'),
  win:tl('Det var en god historie. Du fortalte den i datid. Her er Ankeret.','That was a good story. You told it in the past tense. Here\'s the Anchor.'),
  after:[tl('Sommeren 1974 talte hele København svensk i en uge. Ingen ved hvorfor. Lone var der. Spørg hende ikke.','In the summer of 1974 all of Copenhagen spoke Swedish for a week. Nobody knows why. Lone was there. Don\'t ask her.'),
   tl('Men nu: Magnus vil lancere Skift 2.0 på Sprogskolen Ø. På eksamensdagen. Han vil erstatte Prøven med en app.','But now: Magnus wants to launch Skift 2.0 at Sprogskolen Ø. On exam day. He wants to replace the Exam with an app.')],
  tr:[{name:'Poul',look:'e',team:[['inv21',23]],intro:tl('Da jeg var ung, boede jeg i Italien. Det var varmt. Så flyttede jeg hjem. Det var en fejl.','When I was young, I lived in Italy. It was warm. Then I moved home. That was a mistake.'),lose:tl('… og så vandt du. Slut.','… and then you won. The end.')},
      {name:'Ea',look:'b',team:[['historie1',23],['konj1',24]],intro:tl('For tre år siden kom jeg til Nyhavn for at drikke én øl. Jeg er her stadig.','Three years ago I came to Nyhavn to drink one beer. I\'m still here.'),lose:tl('Først tabte jeg. Så tabte jeg igen. Skål.','First I lost. Then I lost again. Cheers.')}]},
 {leader:'Bettina',title:'Datingvært',look:'bettina',venue:'Speeddating',town:'Frederiksberg',badge:'Rosen',topics:['poss','pron','adj','krop'],
  team:[['poss1',28],['pron1',29],['adj2',30]],
  intro:tl('Velkommen til speeddating. Du har tre minutter. Fortæl om dig selv. Og brug "sin" og "hans" korrekt, ellers bliver det pinligt.','Welcome to speed dating. You have three minutes. Tell me about yourself. And use "sin" and "hans" correctly, or it gets awkward.'),
  win:tl('"Han kyssede sin kone." Ikke hans kone. Du forstår det. Her er Rosen.','"He kissed his (own) wife." Not his (someone else\'s) wife. You get it. Here\'s the Rose.'),
  after:[tl('Her er to billetter til lanceringen på Sprogskolen Ø. Den ene er til dig. Den anden er til … din ræv?','Here are two tickets to the launch at Sprogskolen Ø. One is for you. The other is for… your fox?')],
  tr:[{name:'Lene',look:'g',team:[['adj1',27]],intro:tl('Beskriv din eks med tre adjektiver. Høflige adjektiver.','Describe your ex with three adjectives. Polite adjectives.'),lose:tl('"Lunefuld, glemsom og sød." Det er min eks også.','"Moody, forgetful and sweet." That\'s my ex too.')},
      {name:'Bodil',look:'e',team:[['pron1',27],['krop1',27]],intro:tl('Har du set min kat? Den er ikke min mands kat. Den er min kat. Det er vigtigt.','Have you seen my cat? It isn\'t my husband\'s cat. It\'s my cat. That\'s important.'),lose:tl('Der er den. Min kat. Ikke hans.','There it is. My cat. Not his.')}]}
];
const FINAL={
 ex:[{name:'Eksaminator Agnete',title:'',look:'e',x:3,y:11,d:'r',gateY:10,team:[['mark2',31],['historie2',31],['tal2',31]],intro:tl('Velkommen til Prøven. Første del: lytning. Sluk din telefon. Og din ræv.','Welcome to the Exam. Part one: listening. Turn off your phone. And your fox.'),lose:tl('Du lytter godt. Bedre end min mand. Gå videre.','You listen well. Better than my husband. Go on.')},
     {name:'Eksaminator Henrik',title:'',look:'f',x:6,y:8,d:'l',gateY:7,team:[['poss2',31],['inv22',32],['konj2',32]],intro:tl('Anden del: grammatik. Jeg har undervist i ordstilling i tredive år. Jeg drømmer om inversion.','Part two: grammar. I\'ve taught word order for thirty years. I dream about inversion.'),lose:tl('Fejlfri ordstilling. Jeg er rørt. Gå videre.','Flawless word order. I\'m moved. Go on.')},
     {name:'Eksaminator Birgit',title:'',look:'b',x:3,y:5,d:'r',gateY:4,team:[['hej2',32],['empati2',32],['chunk2',33]],intro:tl('Tredje del: samtale. Fortæl om dig selv. Ikke for meget. Vi er i Danmark.','Part three: conversation. Tell me about yourself. Not too much. We\'re in Denmark.'),lose:tl('Det var en god samtale. Kort. Perfekt.','That was a good conversation. Short. Perfect.')}],
 boss:{name:'Magnus',title:'',look:'magnus',x:4,y:2,d:'d',team:[['job12',33],['kommune2',33],['datid2',34],['pron2',35]],
  intro:tl('Hey! Magnus, founder af SKIFT. Love your energy. Men helt ærligt: Hvorfor lære dansk? Just Skift.','Hey! Magnus, founder of SKIFT. Love your energy. But honestly: why learn Danish? Just Skift.'),
  intro2:tl('Okay, lad os tage en hurtig battle. In English? Nej? Fint. Så på dansk. Ugh.','Okay, let\'s do a quick battle. In English? No? Fine. In Danish then. Ugh.'),
  lose:tl('Okay. Fint. Vi tager det på dansk. Min faster bliver glad.','Okay. Fine. We\'ll do it in Danish. My aunt will be happy.')}
};
const FOX_GOAL=[
 tl('Quizbaren ligger i Østerbro, syd for kirkegården. Henning venter. Han venter altid.','Quizbaren is in Østerbro, south of the cemetery. Henning is waiting. He\'s always waiting.'),
 tl('Lone siger, at man ikke er dansker uden en cykel. Cykel-Søren på Vesterbro kan hjælpe. Gå forbi Søerne.','Lone says you\'re not Danish without a bike. Søren in Vesterbro can help. Go past the Lakes.'),
 tl('Middag hos Marianne på Christianshavn. Husk at sige tak for mad. Flere gange end du tror.','Dinner at Marianne\'s in Christianshavn. Remember to say thanks for the food. More times than you think.'),
 tl('Du har stadig ikke et CPR-nummer. Uden CPR-nummer findes du ikke. Borgerservice i Ørestad. Tag madpakke med.','You still don\'t have a CPR number. Without one you don\'t exist. Citizen Services in Ørestad. Bring a packed lunch.'),
 tl('Kim skrev: "Skift 2.0 er farlig. Jeg har det skidt." Kaptajn Ib i Nyhavn ved alt om alt. Spørg ham.','Kim wrote: "Skift 2.0 is dangerous. I feel bad." Captain Ib in Nyhavn knows everything about everything. Ask him.'),
 tl('Vi skal ind til lanceringen. Bettina på Frederiksberg kender alle. Hun holder speeddating. Tag en pæn skjorte på.','We need to get into the launch. Bettina in Frederiksberg knows everyone. She runs speed dating. Wear a nice shirt.'),
 tl('Prøven er i dag. Sprogskolen Ø i Borgergade. Magnus er der også. Selvfølgelig.','The Exam is today. Sprogskolen Ø on Borgergade. Magnus is there too. Of course.')
];
const FOX_AFTER=[null,
 tl('Lone skrev en sms: "Man er ikke dansker uden en cykel." Hun bruger stadig punktum i sms\'er.','Lone texted: "You\'re not Danish without a bike." She still uses full stops in texts.'),
 tl('Lone har inviteret dig til middag hos Marianne på Christianshavn. Det er en prøve. Alt i Danmark er en prøve.','Lone has invited you to dinner at Marianne\'s in Christianshavn. It\'s a test. Everything in Denmark is a test.'),
 tl('Magnus er altså Mariannes nevø. Lille land. Næste stop: Borgerservice. Du har stadig ikke et CPR-nummer.','So Magnus is Marianne\'s nephew. Small country. Next stop: Citizen Services. You still don\'t have a CPR number.'),
 tl('Kim sendte en besked: "Skift 2.0 er farlig. Jeg har det skidt." Han stavede "skidt" rigtigt. Det er fremskridt.','Kim sent a message: "Skift 2.0 is dangerous. I feel bad." He spelled "skidt" right. That\'s progress.'),
 tl('En app i stedet for Prøven. Ånderne ville forsvinde. Vi skal ind til lanceringen. Bettina på Frederiksberg kan skaffe billetter.','An app instead of the Exam. The spirits would vanish. We need to get into the launch. Bettina in Frederiksberg can get tickets.'),
 tl('Jeg tager billetten. Jeg har en pæn hale. Borgergade, nu.','I\'ll take the ticket. I have a nice tail. Borgergade, now.')
];
const WILD_QUIPS=[
 tl('Den kigger på dig. Du kigger på den. Ingen siger noget. Meget dansk.','It looks at you. You look at it. Nobody says anything. Very Danish.'),
 tl('Den ser ud, som om den også har drukket Kurts kombucha.','It looks like it also drank Kurt\'s kombucha.'),
 tl('Den vil ikke tale engelsk. Respekt.','It refuses to speak English. Respect.'),
 tl('Den lugter svagt af røgelse.','It smells faintly of incense.')
];
