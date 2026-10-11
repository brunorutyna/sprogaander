/* ================= STORY: characters, scenes, scripts =================
   A line is [who, text, {s: simpler Danish, e: English, show: [words shown as pictures]}].
   'du' lines are the player (not voiced). {N} = player name (only in 'du' lines).
   Challenges are objects: pick / build / fix / gaps / type / listen / free.             */

const CHARS={
  fort:  {name:'',          col:'#d8d0c0', voice:{p:1.00, ls:1.02, fx:'room'}},
  hoej:  {name:'Højttaleren',col:'#9fb4c8', voice:{p:0.97, ls:1.05, fx:'radio'}},
  ilse:  {name:'Ilse',      col:'#f2c14e', voice:{p:1.14, ls:1.16, fx:'old'}},
  ravn:  {name:'Ravnen',    col:'#b9a7ff', voice:{p:0.90, ls:0.90, fx:'raven'}},
  holger:{name:'Holger',    col:'#9cc46b', voice:{p:0.80, ls:1.12, fx:'deep'}},
  jonas: {name:'Jonas',     col:'#62c7e0', voice:{p:1.07, ls:0.88, fx:'young'}},
  sif:   {name:'Sif',       col:'#ff8f6b', voice:{p:1.27, ls:0.98, fx:'warm'}},
  du:    {name:'Du',        col:'#ffffff'}
};

const SCENES={
  train:{name:'Nattoget',w:150,spawn:58,music:'night',amb:'train',art:'train',onEnter:'train_in',
    spots:[
      {id:'notes',x:84,y:66,label:'Notesbogen',run:'train_notes',hideIf:'noteDone'},
      {id:'window',x:34,y:44,label:'Vinduet',run:'train_window'},
      {id:'speaker',x:118,y:22,label:'Højttaleren',run:'train_speaker'}]},
  pier:{name:'Molen',w:300,spawn:30,music:'pier',amb:'sea',art:'pier',onEnter:'pier_in',
    actors:[{id:'ilse',x:214,face:-1,run:'pier_ilse'}],
    spots:[{id:'bench',x:96,y:70,label:'Bænken',run:'pier_bench'}],
    exits:[{x:288,to:'town',at:14,label:'Trappen op',when:'pierDone',locked:'pier_locked'}]},
  town:{name:'Halvby',w:420,spawn:14,music:'town',amb:'town',art:'town',onEnter:'town_in',
    actors:[
      {id:'ravn',x:40,face:1,perch:true,run:'town_ravn'},
      {id:'holger',x:150,face:-1,sit:true,run:'town_holger'},
      {id:'jonas',x:226,face:1,run:'town_jonas'},
      {id:'sif',x:300,face:-1,run:'town_sif',hideIf:'cafeOpen'}],
    spots:[
      {id:'s_bageri',x:72,y:40,label:'Et tomt skilt',run:'sign_bageri',hideIf:'sign_bageri'},
      {id:'s_apotek',x:112,y:40,label:'En seddel på døren',run:'sign_apotek',hideIf:'sign_apotek'},
      {id:'s_cafe_door',x:300,y:58,label:'Caféen',run:'cafe_enter',when:'cafeOpen'},
      {id:'station',x:392,y:50,label:'Den store bygning',run:'town_station'}],
    exits:[{x:4,to:'pier',at:276,label:'Ned til molen'}]},
  cafe:{name:'Caféen',w:130,spawn:14,music:'cafe',amb:'cafe',art:'cafe',onEnter:'cafe_in',
    actors:[{id:'sif',x:92,face:-1,run:'cafe_sif'}],
    spots:[{id:'record',x:46,y:52,label:'Pladespilleren',run:'cafe_record'}],
    exits:[{x:4,to:'town',at:300,label:'Ud på gaden'}]}
};

const SIGNS=['bageri','apotek','blomster','cykel','cafe'];
const signCount=()=>SIGNS.filter(s=>FL['sign_'+s]).length;

const SCRIPTS={
/* ---------------------------------------------------------------- PROLOG: nattoget */
train_in:[
  {once:'train_in'},
  ['fort','Det er sent. Toget kører gennem mørket.',{s:'Det er nat. Du sidder i et tog.',se:'It is night. You are sitting on a train.',e:'It is late. The train is running through the dark.',show:['tog']}],
  ['fort','Du er på vej hjem fra dansktimen. I din taske er der en notesbog.',{s:'Du har haft dansk. Nu kører du hjem.',se:'You have had Danish class. Now you are going home.',e:'You are on your way home from Danish class. In your bag there is a notebook.',show:['notesbog']}],
  ['fort','Du skal skrive en tekst til næste gang: »Mit liv før Danmark«. Den er næsten færdig.',{s:'Du skal skrive en tekst om dit liv. Du er næsten færdig.',se:'You have to write a text about your life. You are almost done.',e:'You have to write a text for next time: "My life before Denmark". It is almost finished.'}],
  ['fort','Næsten.',{e:'Almost.'}],
  {hint:'Tryk på notesbogen på bordet.'}
],
train_window:[
  ['fort','Udenfor er der kun mørke. Og dit eget ansigt i ruden. Det ser træt ud.',{s:'Det er mørkt udenfor. Du kan se dig selv i vinduet.',se:'It is dark outside. You can see yourself in the window.',e:'Outside there is only darkness. And your own face in the window. It looks tired.'}]
],
train_speaker:[
  {if:'noteDone',then:[['fort','Højttaleren er stille nu.',{e:'The speaker is quiet now.'}]],
   else:[['fort','En lille højttaler i loftet. Den siger ingenting. Endnu.',{e:'A small speaker in the ceiling. It says nothing. Yet.'}]]}
],
train_notes:[
  ['fort','Du åbner notesbogen. Din lærer har skrevet små kommentarer med rødt.',{s:'Der er røde kommentarer i din tekst.',se:'There are red comments in your text.',e:'You open the notebook. Your teacher has written small comments in red.',show:['notesbog']}],
  ['fort','Den første sætning. Ved siden af står der: »ordstilling«.',{e:'The first sentence. Next to it is written: "word order".'}],
  {fix:{id:'t1',broken:'Før jeg kom til Danmark, jeg boede i mange byer.',words:'Før jeg kom til Danmark , boede jeg i mange byer .',alt:['Jeg boede i mange byer, før jeg kom til Danmark.'],extra:['bor'],
    why:'Sætningen starter med en ledsætning: »Før jeg kom til Danmark«. Derefter kommer verbet først: »boede jeg«.',e:'The sentence starts with a subordinate clause, so the main clause starts with the verb (inversion).'}},
  ['fort','Næste sætning. Her står der: »tid?«',{e:'Next sentence. Here it says: "time?"'}],
  {fix:{id:'t2',broken:'Jeg har boet her for to år siden.',opts:['Jeg har boet her i to år.','Jeg har boet her siden to år.','Jeg har boet her for to år.'],a:0,
    why:'Hvor længe? → i + en periode: »i to år«. »For … siden« er et tidspunkt: »Jeg kom for to år siden.«',e:'How long → "i" + a period. "for … siden" means "ago".'}},
  ['fort','Og den sidste. I margenen står der bare: »datid!!«',{e:'And the last one. In the margin it just says: "past tense!!"'}],
  {gaps:{id:'t3',text:'Jeg [kendte|kende|kendede] ikke landet, og jeg [kunne|kunde|kan] ikke tale sproget.',
    why:'kende → kendte. kan → kunne. Begge er datid.',e:'Past tense: kende → kendte, kan → kunne.'}},
  ['fort','Sådan. Teksten er færdig. Du lukker notesbogen.',{e:'There. The text is finished. You close the notebook.'}],
  {set:'noteDone'},{wait:700},
  {chime:1},
  ['hoej','Næste station: Mellemrum. Mellemrum.',{e:'Next station: Mellemrum. ("Mellemrum" means "the space in between".)'}],
  ['fort','Mellemrum? Du har aldrig hørt om en station, der hedder Mellemrum.',{e:'Mellemrum? You have never heard of a station called Mellemrum.'}],
  {listen:{id:'t4',line:['hoej','Toget holder ikke her. Toget holder aldrig her. Stå af nu.',{e:'The train does not stop here. The train never stops here. Get off now.'}],
    q:'Hvad siger højttaleren?',opts:['Toget holder ikke, men du skal stå af.','Toget holder her i ti minutter.','Du skal købe en ny billet.'],a:0}},
  ['fort','Lyset bliver blødt og hvidt. Du er så træt.',{s:'Du bliver meget træt.',se:'You get very tired.',e:'The light turns soft and white. You are so tired.'}],
  {go:'pier',fade:'white'}
],

/* ---------------------------------------------------------------- MOLEN */
pier_in:[
  {once:'pier_in'},
  ['fort','Du vågner. Toget er væk.',{e:'You wake up. The train is gone.'}],
  ['fort','Du står på en lang mole. Havet er helt stille, og himlen er lilla.',{s:'Du står ved vandet. Alt er stille.',se:'You are standing by the water. Everything is quiet.',e:'You are standing on a long pier. The sea is completely still, and the sky is purple.',show:['mole','hav']}],
  ['fort','For enden af molen står en kvinde ved en lille båd.',{e:'At the end of the pier a woman is standing by a small boat.',show:['båd']}],
  {hint:'Gå hen til kvinden. Tryk på hende.'}
],
pier_bench:[
  ['fort','På bænken står der: »MELLEMRUM. Næste afgang: —«. Bare en streg.',{e:'On the bench it says: "MELLEMRUM. Next departure: —". Just a dash.'}]
],
pier_locked:[
  ['fort','Der er en trappe op til en by. Men du har ikke talt med kvinden endnu.',{e:'There are stairs up to a town. But you have not talked to the woman yet.'}]
],
pier_ilse:[
  {if:'pierDone',then:[
    ['ilse','Byen er den vej. Op ad trappen. Jeg går ingen steder.',{e:'The town is that way. Up the stairs. I am not going anywhere.'}]],
   else:[{run:'pier_story'}]}
],
pier_story:[
  ['ilse','Nå. Så kom der endelig en.',{s:'Endelig kommer der en person.',se:'Finally a person comes.',e:'Well. So someone finally came.'}],
  ['ilse','Jeg hedder Ilse. Jeg sejler færgen. Eller … jeg sejlede færgen.',{s:'Mit navn er Ilse. Det er min båd.',se:'My name is Ilse. That is my boat.',e:'My name is Ilse. I sail the ferry. Or … I used to sail the ferry.',show:['færge']}],
  ['du','Hej. Jeg hedder {N}. Hvor er jeg?'],
  ['ilse','Du er i Mellemrum. Det er stedet mellem to steder.',{s:'Du er et sted mellem to andre steder.',se:'You are in a place between two other places.',e:'You are in Mellemrum. It is the place between two places.'}],
  ['ilse','Folk kommer hertil, når de er på vej fra ét sprog til et andet.',{s:'Folk kommer her, når de lærer et nyt sprog.',se:'People come here when they learn a new language.',e:'People come here when they are on their way from one language to another.'}],
  ['ilse','Det sker tit. Især i toget. Især om aftenen.',{e:'It happens often. Especially on the train. Especially in the evening.'}],
  ['du','Hvordan kommer jeg hjem?'],
  ['ilse','Med færgen. Men færgen sejler kun, når den kender passageren.',{s:'Færgen sejler kun, når den ved, hvem du er.',se:'The ferry only sails when it knows who you are.',e:'By ferry. But the ferry only sails when it knows the passenger.'}],
  ['ilse','Så du må fortælle din historie. På dansk. Det er reglen. Jeg har ikke lavet den.',{e:'So you have to tell your story. In Danish. That is the rule. I did not make it.'}],
  ['ilse','Hver gang du siger noget rigtigt, tænder jeg en lanterne.',{s:'Når du svarer rigtigt, får du lys.',se:'When you answer correctly, you get light.',e:'Every time you say something right, I light a lantern.',show:['lanterne']}],
  ['ilse','Lad os starte. Hvornår kom du til Danmark?',{e:'Let us start. When did you come to Denmark?'}],
  {pick:{id:'p1',opts:['Jeg kom til Danmark for to år siden.','Jeg kom til Danmark siden to år.','Jeg kom til Danmark i to år siden.'],a:0,lamp:1,
    why:'Hvornår? → for + tid + siden. Det er et tidspunkt i fortiden.',e:'When → "for … siden" = ago.'}},
  ['ilse','Hm. To år. Det er ingenting. Jeg har stået her i fyrre år.',{e:'Hm. Two years. That is nothing. I have stood here for forty years.'}],
  ['ilse','Hvor boede du, før du kom til Danmark?',{e:'Where did you live before you came to Denmark?'}],
  {build:{id:'p2',words:'Før jeg kom til Danmark , boede jeg i en anden by .',alt:['Jeg boede i en anden by, før jeg kom til Danmark.'],extra:['bor','et'],lamp:2,
    why:'Ledsætningen står først (»Før jeg kom til Danmark«). Så kommer verbet før subjektet: »boede jeg«.',e:'Subordinate clause first → verb before subject.'}},
  ['ilse','Og hvad lavede du der? Arbejdede du?',{e:'And what did you do there? Did you work?'}],
  {gaps:{id:'p3',text:'Ja, jeg [arbejdede|arbejdte|arbejder] på et kontor, og om aftenen [læste|læsede|læser] jeg engelsk.',lamp:3,
    why:'arbejde → arbejdede. læse → læste. Og efter »om aftenen« kommer verbet før »jeg«.',e:'Past tense forms, and inversion after "om aftenen".'}},
  ['ilse','Et kontor. Spændende.',{e:'An office. Exciting.'}],
  ['fort','Det lyder ikke, som om hun synes, det er spændende.',{e:'It does not sound like she thinks it is exciting.'}],
  ['ilse','Du sagde også noget i toget. Jeg hører alt herfra. Det lød sådan her:',{e:'You also said something on the train. I hear everything from here. It sounded like this:'}],
  ['ilse','»Bagefter jeg fik en job.«',{e:'"Afterwards I got a job." (with two mistakes)'}],
  {fix:{id:'p4',broken:'Bagefter jeg fik en job.',words:'Bagefter fik jeg et job .',alt:['Jeg fik et job bagefter.'],extra:['en'],lamp:4,
    why:'»Bagefter« står først, så kommer verbet: »fik jeg«. Og det hedder »et job« (et-ord).',e:'"Bagefter" first → inversion. "job" is an et-word.'}},
  ['ilse','Bedre. Meget bedre.',{e:'Better. Much better.'}],
  ['ilse','Hvor længe har du lært dansk?',{e:'How long have you been learning Danish?'}],
  {pick:{id:'p5',opts:['Jeg har lært dansk i et års tid.','Jeg har lært dansk for et år.','Jeg lærte dansk siden et år.'],a:0,lamp:5,
    why:'Hvor længe? → i + en periode. »i et års tid« betyder cirka et år.',e:'How long → "i" + a period. "i et års tid" = about a year.'}},
  ['ilse','Nu skal du lytte. Jeg siger det kun én gang. Måske to.',{e:'Now you must listen. I will only say it once. Maybe twice.'}],
  {listen:{id:'p6',line:['ilse','Da jeg var ung, sejlede jeg til alle øerne. Om vinteren var havet frosset til, så jeg gik over isen.',{e:'When I was young, I sailed to all the islands. In winter the sea was frozen, so I walked across the ice.'}],
    q:'Hvad gjorde Ilse om vinteren?',opts:['Hun gik over isen.','Hun sejlede til øerne.','Hun blev hjemme.'],a:0,lamp:6}},
  ['ilse','Det er sandt, forresten. Jeg overdriver aldrig.',{e:'That is true, by the way. I never exaggerate.'}],
  ['fort','Alle lanternerne lyser nu. Molen er fuld af varmt lys.',{e:'All the lanterns are lit now. The pier is full of warm light.'}],
  ['ilse','Godt. Færgen kender dig nu. Lidt.',{e:'Good. The ferry knows you now. A little.'}],
  ['ilse','Men den sejler ikke i aften. Der er støj på vandet.',{s:'Den sejler ikke i dag. Vandet er ikke stille nok.',se:'It is not sailing today. The water is not calm enough.',e:'But it will not sail tonight. There is noise on the water.'}],
  ['du','Støj? Jeg kan ikke høre noget.'],
  ['ilse','Nej. Det er den slags støj.',{e:'No. It is that kind of noise.'}],
  ['ilse','Gå op i byen. Den hedder Halvby. Folk i byen har glemt mange ord, og skiltene er tomme.',{s:'Der er en by. Folk har glemt ord. Der står ingenting på skiltene.',se:'There is a town. People have forgotten words. The signs say nothing.',e:'Go up into the town. It is called Halvby. People in the town have forgotten many words, and the signs are empty.',show:['by','skilt']}],
  ['ilse','Måske kan du hjælpe dem. Måske ikke. Det kommer an på dig.',{e:'Maybe you can help them. Maybe not. It depends on you.'}],
  {set:'pierDone'},
  {hint:'Trappen op til byen er åben nu. Gå til højre.'}
],

/* ---------------------------------------------------------------- HALVBY */
town_in:[
  {once:'town_in'},
  ['fort','Halvby. Husene er skæve og lidt for høje. Alle skilte er tomme.',{s:'Du er i en by. Husene er mærkelige. Der står ingenting på skiltene.',se:'You are in a town. The houses are strange. The signs say nothing.',e:'Halvby. The houses are crooked and a bit too tall. All the signs are empty.',show:['hus','skilt']}],
  {run:'town_ravn_intro'}
],
town_ravn_intro:[
  ['ravn','Krah. Ny her?',{e:'Caw. New here?'}],
  ['ravn','Selvfølgelig er du ny her. Alle er nye her.',{e:'Of course you are new here. Everyone is new here.'}],
  ['ravn','Jeg er Ravnen. Jeg ved alt. Næsten alt.',{e:'I am the Raven. I know everything. Almost everything.',show:['fugl']}],
  ['ravn','Se skiltene. Der står ingenting. Folk har glemt, hvad stederne hedder.',{e:'Look at the signs. They say nothing. People have forgotten what the places are called.'}],
  ['ravn','Hvis du kan sige, hvad et sted er, kommer navnet tilbage. Sådan virker det her.',{s:'Sig, hvad stedet er. Så kommer navnet tilbage.',se:'Say what the place is. Then the name comes back.',e:'If you can say what a place is, the name comes back. That is how it works here.'}],
  ['ravn','Spørg ikke hvorfor. Jeg er en fugl.',{e:'Do not ask why. I am a bird.'}],
  {hint:'Find de tomme skilte. Tal med folk på gaden.'}
],
town_ravn:[
  {if:()=>signCount()>=5&&!FL.ravnFix,then:[{run:'ravn_fix'}],
   else:[{if:()=>signCount()>=5,then:[
      ['ravn','Caféen er åben. Sif venter. Hun venter altid på nogen.',{e:'The café is open. Sif is waiting. She is always waiting for someone.'}]],
    else:[
      ['ravn','Du mangler stadig nogle skilte. Jeg tæller. Det er det, jeg laver.',{e:'You are still missing some signs. I am counting. That is what I do.'}],
      {if:'sign_bageri',else:[['ravn','Prøv skiltet ved siden af mig. Det dufter af noget.',{e:'Try the sign next to me. It smells of something.'}]]}]}]}
],
ravn_fix:[
  ['ravn','Fem skilte. Ikke dårligt. Også jeg er imponeret.',{e:'Five signs. Not bad. Also I am impressed. (word order mistake!)'}],
  ['fort','Ravnen lyder stolt. Men sætningen lyder forkert.',{e:'The raven sounds proud. But the sentence sounds wrong.'}],
  {fix:{id:'r1',broken:'Også jeg er imponeret.',words:'Jeg er også imponeret .',extra:['også jeg'],
    why:'»Også« står efter verbet, ligesom »ikke«: »Jeg er også …« (S – V – A).',e:'"også" is a central adverb: it goes after the verb, like "ikke".'}},
  ['ravn','Krah. Ja. Det var det, jeg mente. Jeg tester dig bare.',{e:'Caw. Yes. That is what I meant. I was just testing you.'}],
  {set:'ravnFix'},{hint:'Caféen er åben. Gå ind til Sif.'}
],
sign_bageri:[
  ['ravn','Det skilt? Lyt. Jeg beskriver stedet. Kun én gang.',{e:'That sign? Listen. I describe the place. Only once.'}],
  {listen:{id:'s1',line:['ravn','Et sted, hvor man kan købe brød og kager. Det dufter godt om morgenen.',{e:'A place where you can buy bread and cakes. It smells good in the morning.'}],
    q:'Hvad er det for et sted?',opts:['et bageri','et apotek','en slagter','en skobutik'],a:0}},
  {sign:'bageri'},
  ['fort','Skiltet lyser: BAGERI. I vinduet er der pludselig brød og kager.',{e:'The sign lights up: BAKERY. Suddenly there is bread and cake in the window.',show:['brød','kage']}],
  {run:'sign_check'}
],
sign_apotek:[
  ['fort','På døren hænger der en seddel: »Et sted, hvor man kan købe medicin og andre sundhedsprodukter.«',{s:'Her køber man medicin.',se:'Here you buy medicine.',e:'A note hangs on the door: "A place where you can buy medicine and other health products."',show:['medicin']}],
  {type:{id:'s2',q:'Hvad hedder stedet?',a:['apotek','et apotek','apoteket'],hint:'a _ _ _ _ _ _',
    why:'Et apotek er et sted, hvor man køber medicin.',e:'pharmacy'}},
  {sign:'apotek'},
  ['fort','APOTEK. Over døren begynder en lille grøn lampe at lyse.',{e:'PHARMACY. Above the door a small green lamp begins to glow.'}],
  {run:'sign_check'}
],
town_holger:[
  {if:'sign_blomster',then:[
    ['holger','Jeg har boet i Halvby i tolv år. Der er et bageri, og nu er der også en blomsterhandler.',{e:'I have lived in Halvby for twelve years. There is a bakery, and now there is also a florist.'}],
    ['holger','Jeg kan godt lide, at der er stille her. Men jeg er træt af ravnen. Den taler hele tiden.',{e:'I like that it is quiet here. But I am tired of the raven. It talks all the time.'}],
    ['ravn','Det hørte jeg.',{e:'I heard that.'}]],
   else:[{run:'holger_story'}]}
],
holger_story:[
  ['holger','Goddag. Jeg sidder her hver dag. Jeg kan godt lide blomster.',{e:'Good day. I sit here every day. I like flowers.',show:['blomst']}],
  ['holger','Men jeg kan ikke huske, hvad butikken hedder. Den, hvor man kan købe planter og blomster.',{s:'Hvad hedder butikken med blomster?',se:'What is the shop with flowers called?',e:'But I cannot remember what the shop is called. The one where you can buy plants and flowers.'}],
  {pick:{id:'s3',opts:['en blomsterhandler','en blomsterslagter','en blomsterbager'],a:0,
    react:[null,[['holger','En blomsterslagter? Nej. Det lyder forfærdeligt.',{e:'A flower butcher? No. That sounds terrible.'}]],[['holger','En blomsterbager? Jeg vil ikke spise mine blomster.',{e:'A flower baker? I do not want to eat my flowers.'}]]],
    why:'En handler sælger noget: en blomsterhandler, en cykelhandler, en grønthandler.',e:'"-handler" = someone who sells something.'}},
  {sign:'blomster'},
  ['holger','Blomsterhandler! Ja. Tak. Nu kan jeg huske det.',{e:'Florist! Yes. Thanks. Now I remember.'}],
  ['holger','Jeg har boet i Halvby i tolv år. Der er et bageri, og nu er der også en blomsterhandler.',{e:'I have lived in Halvby for twelve years. There is a bakery, and now there is also a florist.'}],
  ['holger','Jeg kan godt lide, at der er stille her. Men jeg er træt af ravnen. Den taler hele tiden.',{e:'I like that it is quiet here. But I am tired of the raven. It talks all the time.'}],
  ['ravn','Det hørte jeg.',{e:'I heard that.'}],
  {run:'sign_check'}
],
town_jonas:[
  {if:'sign_cykel',then:[
    ['jonas','Jeg cykler på arbejde hver dag. Altså, det kommer an på vejret.',{e:'I cycle to work every day. Well, it depends on the weather.'}]],
   else:[{run:'jonas_story'}]}
],
jonas_story:[
  ['jonas','Hej. Min cykel er i stykker. Kæden er røget af.',{s:'Min cykel virker ikke.',se:'My bike does not work.',e:'Hi. My bike is broken. The chain has come off.',show:['cykel']}],
  ['jonas','Hvor kan jeg få hjælp? Jeg kan ikke huske, hvad stedet hedder.',{e:'Where can I get help? I cannot remember what the place is called.'}],
  {build:{id:'s4',words:'Du kan gå til cykelhandleren .',extra:['cykelhandler','går'],
    why:'Vi taler om et bestemt sted, så det er bestemt form: »cykelhandleren«. Efter »kan« kommer navneform: »gå«.',e:'Definite form ("the bike shop"), and the infinitive after "kan".'}},
  {sign:'cykel'},
  ['jonas','Cykelhandleren! Selvfølgelig. Tak. Butikken ligger lige her.',{e:'The bike shop! Of course. Thanks. The shop is right here.'}],
  ['jonas','Jeg cykler på arbejde hver dag. Altså, det kommer an på vejret.',{e:'I cycle to work every day. Well, it depends on the weather.'}],
  {run:'sign_check'}
],
town_sif:[
  {if:'sign_cafe',then:[{run:'cafe_enter'}],else:[{run:'sif_story'}]}
],
sif_story:[
  ['sif','Hej! Kan du hjælpe mig? Jeg ved godt, hvad min café er. Men skiltet er tomt.',{e:'Hi! Can you help me? I know what my café is. But the sign is empty.'}],
  ['sif','Jeg hedder Sif, forresten.',{e:'I am Sif, by the way.'}],
  ['sif','Skiltet vil have en forklaring. Ikke bare et ord. Kan du forklare, hvad en café er?',{s:'Forklar, hvad en café er.',se:'Explain what a café is.',e:'The sign wants an explanation. Not just a word. Can you explain what a café is?'}],
  {build:{id:'s5',words:'En café er et sted , hvor man kan drikke kaffe og slappe af .',alt:['En café er et sted, hvor man kan slappe af og drikke kaffe.'],extra:['kan'],
    why:'I en ledsætning (»hvor …«) står subjektet før verbet: »hvor man kan …«',e:'In a subordinate clause the subject comes before the verb: "hvor man kan".'}},
  {sign:'cafe'},
  ['sif','Perfekt. Kom indenfor. Kaffen er gratis for folk, der kan forklare ting.',{e:'Perfect. Come inside. Coffee is free for people who can explain things.',show:['kaffe']}],
  {set:'cafeOpen'},
  {run:'sign_check'}
],
sign_check:[
  {if:()=>signCount()>=5&&!FL.allSigns,then:[
    {set:'allSigns'},{hint:'Alle skilte lyser. Ravnen vil sige noget.'},
    ['fort','Alle skiltene på gaden lyser nu. Halvby ser lidt mere hel ud.',{e:'All the signs on the street are lit now. Halvby looks a little more whole.'}],
    ['ravn','Krah! Kom her. Jeg har noget at sige.',{e:'Caw! Come here. I have something to say.'}]],
   else:[{if:()=>!FL.allSigns,then:[{hint:()=>`${signCount()} af 5 skilte lyser.`}]}]}
],
town_station:[
  {if:'allSigns',then:[
    ['fort','For enden af gaden er der en stor bygning med et ur uden visere. Skiltet er tomt, og døren er låst.',{e:'At the end of the street there is a big building with a clock without hands. The sign is empty, and the door is locked.',show:['ur']}],
    ['ravn','Det sted kan ingen huske. Heller ikke jeg. Og jeg kan huske alt.',{e:'Nobody can remember that place. Not even me. And I remember everything.'}]],
   else:[['fort','En stor, mørk bygning. Den virker meget langt væk, selvom den er tæt på.',{e:'A big, dark building. It seems very far away, even though it is close.'}]]}
],
cafe_enter:[{go:'cafe'}],

/* ---------------------------------------------------------------- CAFÉEN */
cafe_in:[{once:'cafe_in'},['fort','Caféen er varm. Det dufter af kaffe, og der spiller en gammel plade.',{e:'The café is warm. It smells of coffee, and an old record is playing.',show:['kaffe','musik']}]],
cafe_record:[['fort','Pladen hedder »Hverdagsting«. Den har ingen sange. Kun en lang, rolig lyd.',{e:'The record is called "Everyday things". It has no songs. Only one long, calm sound.'}]],
cafe_sif:[
  {if:'ch1Done',then:[
    ['sif','Bliv bare siddende. Jeg spiller lidt senere.',{e:'Just stay seated. I will play a bit later.'}]],
   else:[{run:'cafe_story'}]}
],
cafe_story:[
  ['sif','Velkommen indenfor. Sæt dig bare.',{e:'Welcome inside. Just sit down.'}],
  ['sif','Hvad laver du egentlig her i Halvby?',{e:'What are you actually doing here in Halvby?'}],
  {build:{id:'c1',words:'Jeg er i gang med at finde vejen hjem .',extra:['finder','på'],
    why:'»Jeg er i gang med at …« + navneform: man laver noget lige nu. Lær det som én enhed (en chunk).',e:'"være i gang med at" + infinitive = be in the middle of doing something.'}},
  ['sif','Det kan jeg godt forstå. Det prøvede jeg også engang.',{e:'I can understand that. I also tried that once.'}],
  ['sif','Jeg har boet her i tre år. Eller tre dage. Tiden er lidt mærkelig her.',{e:'I have lived here for three years. Or three days. Time is a bit strange here.'}],
  ['sif','Jeg savner min familie. De bor langt væk.',{e:'I miss my family. They live far away.',show:['familie']}],
  {pick:{id:'c2',opts:['Det kan jeg godt forstå.','I lige måde.','Hvor spændende!'],a:0,
    react:[null,[['sif','I lige måde? Savner du også min familie?',{e:'Likewise? Do you also miss my family?'}]],[['sif','Spændende? Okay. Tak.',{e:'Exciting? Okay. Thanks.'}]]],
    why:'»Det kan jeg godt forstå« viser empati. »I lige måde« siger man, når nogen ønsker dig noget godt (»God weekend!« – »I lige måde!«).',e:'"Det kan jeg godt forstå" shows empathy. "I lige måde" = "likewise", a reply to a wish.'}},
  ['sif','Tak. Du er sød.',{e:'Thanks. You are kind.'}],
  ['sif','Jeg spiller musik om aftenen her i caféen. Hvad med dig? Hvad laver du i din fritid?',{e:'I play music here in the café in the evening. What about you? What do you do in your free time?'}],
  {free:{id:'c3',q:'Svar Sif. Skriv eller sig en sætning om din fritid.',hint:'I min fritid … (husk: verbet på plads 2)',check:'fritid',model:'I min fritid læser jeg bøger og går ture.'}},
  ['sif','Det lyder rigtig hyggeligt.',{e:'That sounds really nice.'}],
  ['sif','Fortæl om dit kvarter derhjemme. Hvad er der?',{e:'Tell me about your neighbourhood back home. What is there?'}],
  {build:{id:'c4',words:'I mit kvarter er der en park og mange caféer .',alt:['Der er en park og mange caféer i mit kvarter.', 'I mit kvarter er der mange caféer og en park.'],extra:['min','der er'],
    why:'»I mit kvarter« står først, så kommer verbet: »er der«. Kvarter er et et-ord: »mit kvarter«.',e:'Inversion after "I mit kvarter", and "kvarter" is an et-word (mit).'}},
  ['sif','Og hvad er du træt af?',{e:'And what are you tired of?'}],
  {free:{id:'c5',q:'Hvad er du træt af i dit kvarter?',hint:'Jeg er træt af …',check:'traet',model:'Jeg er træt af støjen fra vejen.'}},
  ['sif','Det kender jeg godt.',{e:'I know that feeling.'}],
  ['sif','Du kom med toget, ikke? Det gjorde jeg også.',{e:'You came by train, right? So did I.',show:['tog']}],
  ['sif','Har Ilse sagt noget om støjen?',{e:'Has Ilse said anything about the noise?'}],
  ['du','Hun sagde, at færgen ikke sejler, når der er støj på vandet.'],
  ['sif','Ja. Det siger hun altid. Men ingen ved, hvor støjen kommer fra.',{e:'Yes. She always says that. But nobody knows where the noise comes from.'}],
  ['sif','Bliv her i aften. Jeg spiller. Måske lærer du et par nye ord.',{e:'Stay here tonight. I am playing. Maybe you will learn a few new words.'}],
  {set:'ch1Done'},{hint:'Kapitel 2 er på vej. Øv dine fejl i notesbogen.'},
  {chapterEnd:1}
]
};
