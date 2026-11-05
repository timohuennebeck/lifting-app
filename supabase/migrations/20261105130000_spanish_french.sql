-- Spanish and French as app languages: profiles, legal documents and support-message translations
-- accept them, and the catalog gets Spanish and French names and instructions. This migration
-- publishes no legal text; `scripts/legal-migration.mjs` generates those rows.

alter table public.profiles drop constraint profiles_language_check;
alter table public.profiles
  add constraint profiles_language_check check (language in ('en', 'de', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr'));

alter table public.legal_documents drop constraint legal_documents_locale_check;
alter table public.legal_documents
  add constraint legal_documents_locale_check check (locale in ('en', 'de', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr'));

alter table public.ticket_message_translations drop constraint ticket_message_translations_language_check;
alter table public.ticket_message_translations
  add constraint ticket_message_translations_language_check check (language in ('en', 'de', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr'));

update public.equipment e set name = e.name || jsonb_build_object('es', v.value)
from jsonb_each($es${
 "ab-wheel": "Rueda abdominal",
 "barbell": "Barra",
 "bench": "Banco",
 "bodyweight": "Peso corporal",
 "box": "Cajón o escalón",
 "cable": "Polea",
 "decline-bench": "Banco declinado",
 "dip-bars": "Barras de fondos",
 "dumbbell": "Mancuernas",
 "ez-bar": "Barra EZ",
 "jump-rope": "Cuerda de saltar",
 "kettlebell": "Kettlebell",
 "landmine": "Landmine",
 "leg-curl-extension": "Extensión / curl de piernas",
 "machine": "Máquina",
 "platform": "Plataforma de levantamiento",
 "preacher-bench": "Banco predicador",
 "pull-up-bar": "Barra de dominadas",
 "rack": "Rack de sentadillas",
 "safety-bar": "Barra de seguridad",
 "smith-machine": "Máquina Smith",
 "trap-bar": "Barra hexagonal"
}$es$::jsonb) as v (key, value)
where e.id = v.key;

update public.exercises e
set name = e.name || jsonb_build_object('es', v.value -> 'name'),
  instructions = e.instructions || jsonb_build_object('es', v.value -> 'instructions')
from jsonb_each($es${
 "ab-crunch-machine": {
  "name": "Máquina de crunch abdominal",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las almohadillas apoyen en el pecho o los hombros. Sujeta las asas y fija los pies."
   },
   {
    "title": "Crunch",
    "text": "Enrolla el torso hacia delante y abajo contrayendo los abdominales. No tires con los brazos ni empujes con las piernas."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el peso vuelva despacio hasta quedar erguido, sin apoyar las placas."
   }
  ]
 },
 "ab-wheel-rollout": {
  "name": "Rollout con rueda abdominal",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Arrodíllate sobre una colchoneta y sujeta la rueda bajo los hombros. Aprieta los abdominales y retrae un poco la pelvis."
   },
   {
    "title": "Avance",
    "text": "Haz rodar la rueda hacia delante despacio, hasta donde puedas sin que se hunda la zona lumbar."
   },
   {
    "title": "Regreso",
    "text": "Tira de la rueda hacia las rodillas con los abdominales, no con la cadera. Mantén los brazos estirados."
   }
  ]
 },
 "air-bike": {
  "name": "Air bike",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que la rodilla quede un poco flexionada en la parte baja del pedaleo, y sujeta las asas móviles."
   },
   {
    "title": "Movimiento",
    "text": "Empuja y tira de las asas mientras pedaleas, para que trabajen brazos y piernas a la vez. Cuanto más fuerte vas, mayor es la resistencia."
   },
   {
    "title": "Ritmo",
    "text": "Empieza suave y ve subiendo. En intervalos, da todo en el tiempo de trabajo y luego pedalea despacio hasta recuperar la respiración."
   }
  ]
 },
 "arnold-press": {
  "name": "Press Arnold",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Siéntate o ponte de pie con las mancuernas frente a los hombros, las palmas hacia ti y los codos delante del cuerpo."
   },
   {
    "title": "Giro y press",
    "text": "Empuja hacia arriba girando las palmas hacia fuera, de modo que miren al frente cuando los brazos queden extendidos sobre la cabeza."
   },
   {
    "title": "Bajada",
    "text": "Invierte el movimiento despacio, girando las palmas de vuelta hacia ti mientras las mancuernas regresan frente a los hombros."
   }
  ]
 },
 "assisted-dip-machine": {
  "name": "Máquina de fondos asistidos",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Elige el contrapeso: más peso significa más ayuda. Apoya las rodillas en la almohadilla o ponte de pie en la plataforma y agarra las asas con los brazos estirados."
   },
   {
    "title": "Bajada",
    "text": "Flexiona los codos y baja hasta que los brazos queden casi paralelos al suelo, con el pecho ligeramente adelantado."
   },
   {
    "title": "Press",
    "text": "Empuja hasta estirar los brazos. Reduce el contrapeso con el tiempo a medida que te hagas más fuerte."
   }
  ]
 },
 "assisted-pull-up-machine": {
  "name": "Máquina de dominadas asistidas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Elige el contrapeso: más peso significa más ayuda. Apoya las rodillas en la almohadilla o ponte de pie en la plataforma y agarra las asas."
   },
   {
    "title": "Tirón",
    "text": "Lleva los codos hacia las caderas hasta que la barbilla pase por encima de las asas."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos. Reduce el contrapeso con el tiempo a medida que te hagas más fuerte."
   }
  ]
 },
 "back-extension": {
  "name": "Extensión lumbar",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca la almohadilla justo debajo de los huesos de la cadera, en un banco a 45° u horizontal, y engancha los talones bajo los rodillos."
   },
   {
    "title": "Bajada",
    "text": "Flexiona por las caderas y baja el torso con la espalda recta hasta notar el estiramiento en los isquiotibiales."
   },
   {
    "title": "Subida",
    "text": "Aprieta los glúteos y sube hasta que el cuerpo quede recto, sin arquear de más. Sujeta un disco contra el pecho para más carga."
   }
  ]
 },
 "back-extension-machine": {
  "name": "Extensión lumbar en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que el respaldo quede a la altura de los omóplatos. Abrocha la correa de los muslos y apoya los pies."
   },
   {
    "title": "Extensión",
    "text": "Empuja hacia atrás contra el respaldo hasta que el torso quede un poco por detrás de la vertical. Muévete con fluidez, sin tirones."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el respaldo lleve el torso hacia delante despacio. Mantén los abdominales firmes y no pierdas tensión por delante."
   }
  ]
 },
 "barbell-curl": {
  "name": "Curl con barra",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Ponte erguido y sujeta la barra con agarre supino, con las manos a la anchura de los hombros y los brazos estirados."
   },
   {
    "title": "Curl",
    "text": "Sube la barra hacia los hombros con los codos pegados a los costados y el torso quieto."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra despacio hasta estirar del todo los brazos. No te inclines hacia atrás para empezar la siguiente repetición."
   }
  ]
 },
 "barbell-row": {
  "name": "Remo con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta la barra con agarre prono, justo por fuera de las rodillas. Inclínate hacia delante hasta unos 45° con la espalda recta y las rodillas flexionadas."
   },
   {
    "title": "Tirón",
    "text": "Lleva la barra hacia las costillas inferiores, llevando los codos hacia atrás y juntando los omóplatos."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra con control hasta estirar los brazos. Mantén fijo el ángulo del torso y no des tirones con la cadera."
   }
  ]
 },
 "barbell-shrug": {
  "name": "Encogimientos con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta la barra delante de los muslos con agarre prono, un poco más ancho que los hombros. Ponte erguido con los brazos estirados."
   },
   {
    "title": "Encogimiento",
    "text": "Sube los hombros en vertical hacia las orejas, con la barra pegada al cuerpo. No uses las piernas."
   },
   {
    "title": "Bajada",
    "text": "Aguanta un momento arriba y baja despacio hasta dejar los hombros del todo abajo. Usa correas si se te agota el agarre antes."
   }
  ]
 },
 "bayesian-curl": {
  "name": "Curl bayesiano en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa en D a la polea más baja y agárrala con una mano. Ponte de espaldas a la máquina y da un paso hacia delante hasta que el brazo quede por detrás del cuerpo."
   },
   {
    "title": "Curl",
    "text": "Sube el asa hacia delante y arriba, con el codo ligeramente por detrás del torso. No dejes que el hombro se vaya hacia delante."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar el brazo y notar el estiramiento en el bíceps. Cambia de brazo al terminar la serie."
   }
  ]
 },
 "behind-the-neck-press": {
  "name": "Press tras nuca",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate o ponte de pie con la barra apoyada en la parte alta de la espalda, como en una sentadilla, con las manos un poco más abiertas que en el press militar."
   },
   {
    "title": "Press",
    "text": "Empuja la barra en vertical desde detrás de la cabeza hasta estirar los brazos. Mantén la cabeza neutra y la barbilla ligeramente metida."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra despacio hasta la altura de las orejas. Usa poco peso y evita este ejercicio si sientes pinzamiento en los hombros."
   }
  ]
 },
 "belt-squat": {
  "name": "Sentadilla con cinturón",
  "instructions": [
   {
    "title": "Cinturón",
    "text": "Ponte el cinturón de cadera y engánchalo a la cadena o correa de la máquina. Colócate en la plataforma con los pies a la anchura de los hombros."
   },
   {
    "title": "Descenso",
    "text": "Sujeta las asas con suavidad para mantener el equilibrio, suelta la palanca y baja en sentadilla con el torso erguido."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie hasta ponerte de pie. La carga cuelga de la cadera, así que la columna queda libre de peso."
   }
  ]
 },
 "bench-dip": {
  "name": "Fondos en banco",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el borde de un banco con las manos junto a las caderas y los dedos hacia delante. Desliza la cadera fuera del banco y estira las piernas."
   },
   {
    "title": "Bajada",
    "text": "Flexiona los codos hacia atrás para bajar la cadera hasta que los brazos queden casi paralelos al suelo."
   },
   {
    "title": "Press",
    "text": "Empuja con las palmas hasta estirar los brazos. Mantén la espalda cerca del banco y los hombros bajos."
   }
  ]
 },
 "bench-press": {
  "name": "Press de banca con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en el banco con los ojos bajo la barra. Junta los omóplatos y apoya bien los pies."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala con control hasta la parte baja del pecho, con los codos a unos 45° del torso."
   },
   {
    "title": "Press",
    "text": "Empuja la barra hacia arriba y un poco hacia atrás hasta casi estirar los brazos. Mantén los glúteos en el banco."
   }
  ]
 },
 "bent-over-dumbbell-row": {
  "name": "Remo inclinado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta una mancuerna en cada mano, con las palmas hacia dentro. Inclínate hacia delante hasta unos 45° con las rodillas flexionadas y la espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Lleva las dos mancuernas hacia las caderas, llevando los codos hacia atrás y juntando los omóplatos."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio hasta estirar los brazos. Mantén el torso quieto durante toda la serie."
   }
  ]
 },
 "bicycle-crunch": {
  "name": "Crunch bicicleta",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con las manos suavemente detrás de la cabeza y despega del suelo los hombros y los pies."
   },
   {
    "title": "Giro",
    "text": "Lleva una rodilla hacia el pecho mientras giras el codo contrario hacia ella, y estira la otra pierna."
   },
   {
    "title": "Alternancia",
    "text": "Cambia de lado con un pedaleo lento, girando desde el torso y sin tirar con los brazos. Mantén la zona lumbar pegada al suelo."
   }
  ]
 },
 "bird-dog": {
  "name": "Bird dog",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte a cuatro apoyos, con las manos bajo los hombros y las rodillas bajo la cadera. Mantén la espalda recta."
   },
   {
    "title": "Extensión",
    "text": "Estira un brazo hacia delante y la pierna contraria hacia atrás hasta que queden alineados con el torso. Aguanta un segundo."
   },
   {
    "title": "Cambio",
    "text": "Vuelve despacio y repite con el otro lado. Mantén la cadera nivelada y no arquees la zona lumbar."
   }
  ]
 },
 "bodyweight-squat": {
  "name": "Sentadilla con peso corporal",
  "instructions": [
   {
    "title": "Postura",
    "text": "Pies a la anchura de los hombros, con las puntas ligeramente hacia fuera. Estira los brazos al frente para mantener el equilibrio."
   },
   {
    "title": "Descenso",
    "text": "Lleva la cadera atrás y abajo hasta que los muslos queden al menos paralelos al suelo, con los talones apoyados y el pecho arriba."
   },
   {
    "title": "Subida",
    "text": "Empuja con todo el pie para ponerte de pie y aprieta los glúteos arriba. Mantén un ritmo constante."
   }
  ]
 },
 "box-jump": {
  "name": "Salto al cajón",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate a unos 30 cm de un cajón firme, con los pies a la anchura de las caderas."
   },
   {
    "title": "Salto",
    "text": "Lleva los brazos atrás, baja en un cuarto de sentadilla y salta sobre el cajón. Aterriza con suavidad con los dos pies apoyados y las rodillas flexionadas."
   },
   {
    "title": "Bajada del cajón",
    "text": "Ponte del todo de pie sobre el cajón y baja un pie cada vez. Recupera la posición antes del siguiente salto."
   }
  ]
 },
 "box-squat": {
  "name": "Sentadilla al cajón",
  "instructions": [
   {
    "title": "Altura del cajón",
    "text": "Coloca un cajón detrás de ti a una altura en la que los muslos queden casi paralelos al suelo al sentarte. Separa los pies un poco más de lo normal."
   },
   {
    "title": "Sentarse",
    "text": "Lleva la cadera atrás y baja con control hasta sentarte con suavidad en el cajón. Mantén el core firme y no te relajes."
   },
   {
    "title": "Impulso",
    "text": "Sin balancearte ni rebotar, empuja el suelo con los pies y sube con fuerza."
   }
  ]
 },
 "bulgarian-split-squat": {
  "name": "Sentadilla búlgara",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate a una zancada de distancia delante de un banco y apoya el empeine del pie de atrás en él. Sujeta una mancuerna en cada mano."
   },
   {
    "title": "Bajada",
    "text": "Baja en vertical hasta que el muslo de delante quede casi paralelo al suelo, con el talón de delante apoyado."
   },
   {
    "title": "Impulso",
    "text": "Empuja con el pie de delante para subir. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "burpee": {
  "name": "Burpee",
  "instructions": [
   {
    "title": "Bajada",
    "text": "Desde de pie, baja en sentadilla y apoya las manos en el suelo delante de los pies."
   },
   {
    "title": "Flexión",
    "text": "Lanza los pies hacia atrás hasta quedar en plancha, haz una flexión con el cuerpo en línea recta y vuelve a saltar con los pies hacia las manos."
   },
   {
    "title": "Salto",
    "text": "Ponte de pie y salta con fuerza, aplaudiendo sobre la cabeza. Aterriza con suavidad y pasa directo a la siguiente repetición."
   }
  ]
 },
 "cable-chest-press": {
  "name": "Press de pecho en polea de pie",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon las dos poleas a la altura del pecho, toma un asa en cada mano y da un paso adelante en postura de zancada, de espaldas a la máquina."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia delante y ligeramente juntas hasta casi estirar los brazos. Mantén el torso quieto."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las manos vuelvan despacio a la altura del pecho hasta notar el estiramiento. No dejes que los cables te tiren hacia atrás."
   }
  ]
 },
 "cable-crossover": {
  "name": "Cruces en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon las poleas arriba, toma un asa en cada mano y da un paso adelante en postura de zancada."
   },
   {
    "title": "Cierre",
    "text": "Con los codos ligeramente flexionados, lleva las manos abajo y juntas delante del pecho."
   },
   {
    "title": "Apertura",
    "text": "Deja que los brazos se abran despacio hasta notar el estiramiento en el pecho."
   }
  ]
 },
 "cable-crunch": {
  "name": "Crunch en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea alta y arrodíllate de cara a la máquina. Sujeta los extremos de la cuerda junto a la cabeza."
   },
   {
    "title": "Crunch",
    "text": "Redondea la columna y lleva las costillas hacia las caderas. Mantén la cadera quieta y no te sientes sobre los talones."
   },
   {
    "title": "Vuelta",
    "text": "Desenrolla despacio hasta que la espalda vuelva a quedar recta, manteniendo la tensión en el cable."
   }
  ]
 },
 "cable-curl": {
  "name": "Curl en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una barra recta o EZ a una polea baja. Ponte de cara a la pila y agarra la barra con agarre supino y los brazos estirados."
   },
   {
    "title": "Curl",
    "text": "Sube la barra hacia los hombros con los codos pegados a los costados. No te inclines hacia atrás."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos, manteniendo el cable en tensión."
   }
  ]
 },
 "cable-external-rotation": {
  "name": "Rotación externa en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon una polea a la altura del codo y colócate de lado a ella. Sujeta el asa con la mano más alejada, con el codo flexionado a 90° y pegado al costado."
   },
   {
    "title": "Rotación",
    "text": "Gira el antebrazo hacia fuera, alejándolo del estómago, hasta donde te resulte cómodo. Mantén el codo pegado al costado."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el antebrazo vuelva despacio cruzando el estómago. Usa poco peso y muévete con fluidez, sin tirones."
   }
  ]
 },
 "cable-front-raise": {
  "name": "Elevaciones frontales en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte de espaldas a una polea baja, con el cable pasando entre las piernas. Sujeta el asa o la cuerda delante de los muslos."
   },
   {
    "title": "Elevación",
    "text": "Con los codos ligeramente flexionados, sube los brazos estirados al frente hasta la altura de los hombros. No te inclines hacia atrás."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, en dos o tres segundos, y para justo antes de que las pesas toquen la pila."
   }
  ]
 },
 "cable-glute-kickback": {
  "name": "Patada de glúteo en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ata una tobillera a una pierna y engánchala a una polea baja. Ponte de cara a la máquina, agárrate a la estructura y inclínate un poco hacia delante."
   },
   {
    "title": "Patada",
    "text": "Lleva la pierna hacia atrás y un poco hacia arriba apretando el glúteo, sin arquear la zona lumbar."
   },
   {
    "title": "Vuelta",
    "text": "Trae la pierna hacia delante despacio y con control. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "cable-kickback": {
  "name": "Patada de tríceps en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta con una mano el cable de una polea baja. Inclínate hacia delante con la espalda recta y pega la parte alta del brazo al costado, paralela al suelo."
   },
   {
    "title": "Extensión",
    "text": "Estira el codo hasta que el brazo apunte recto hacia atrás. Mantén quieta la parte alta del brazo."
   },
   {
    "title": "Vuelta",
    "text": "Flexiona el codo despacio hasta que el antebrazo cuelgue en vertical, sin dejar que el cable se afloje. Cambia de brazo al terminar la serie."
   }
  ]
 },
 "cable-lateral-raise": {
  "name": "Elevaciones laterales en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon una polea en la posición más baja y colócate de lado a ella. Sujeta el asa con la mano más alejada, delante del muslo."
   },
   {
    "title": "Elevación",
    "text": "Sube el brazo hacia un lado hasta la altura del hombro, guiando con el codo y manteniéndolo ligeramente flexionado."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, en dos o tres segundos, dejando que la mano pase por delante del cuerpo para mantener la tensión."
   }
  ]
 },
 "cable-pull-through": {
  "name": "Pull-through en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea baja, ponte de espaldas y agárrala entre las piernas. Da unos pasos hacia delante, con los pies más abiertos que las caderas."
   },
   {
    "title": "Bisagra",
    "text": "Lleva la cadera atrás y deja que la cuerda tire de tus manos hacia atrás entre las piernas, con las rodillas ligeramente flexionadas y la espalda recta."
   },
   {
    "title": "Impulso",
    "text": "Empuja la cadera hacia delante para ponerte erguido y aprieta fuerte los glúteos arriba. No tires con los brazos."
   }
  ]
 },
 "cable-rear-delt-fly": {
  "name": "Pájaros en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon las dos poleas a la altura de los hombros. Sujeta el cable izquierdo con la mano derecha y el derecho con la izquierda, y da un paso atrás."
   },
   {
    "title": "Apertura",
    "text": "Con los codos ligeramente flexionados, abre los brazos hacia fuera y atrás en un arco amplio hasta alinearlos con los hombros."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las manos vuelvan despacio hasta cruzarse delante de ti. No encojas los hombros ni te inclines hacia atrás."
   }
  ]
 },
 "cable-upright-row": {
  "name": "Remo al mentón en polea",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Engancha una barra recta o una cuerda a una polea baja. Colócate cerca y sujétala delante de los muslos, con las manos a la anchura de los hombros más o menos."
   },
   {
    "title": "Tirón",
    "text": "Guía con los codos y sube hasta la altura de la parte baja del pecho. Los codos se mantienen por encima de las manos."
   },
   {
    "title": "Bajada",
    "text": "Baja con control y mantén el cable tenso abajo. Sube menos si sientes pinzamiento en los hombros."
   }
  ]
 },
 "cable-woodchop": {
  "name": "Leñador en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa en D a una polea alta y colócate de lado a la máquina. Sujeta el asa con las dos manos, con los brazos estirados hacia la polea."
   },
   {
    "title": "Corte",
    "text": "Tira del asa en diagonal, hacia abajo y a través del cuerpo hasta la cadera contraria, girando el torso y pivotando sobre el pie de atrás."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el asa suba despacio por el mismo recorrido. Cambia de lado al terminar la serie."
   }
  ]
 },
 "calf-raise": {
  "name": "Elevación de talones de pie",
  "instructions": [
   {
    "title": "Posición",
    "text": "Apoya la parte delantera de los pies en el borde, con los talones libres y las piernas estiradas."
   },
   {
    "title": "Subida",
    "text": "Empuja y sube de puntillas todo lo que puedas, y haz una breve pausa."
   },
   {
    "title": "Bajada",
    "text": "Baja los talones despacio por debajo de la plataforma para estirar por completo."
   }
  ]
 },
 "captains-chair-leg-raise": {
  "name": "Elevación de piernas en silla romana",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya los antebrazos en las almohadillas de la silla romana, agarra las asas y pega la espalda al respaldo."
   },
   {
    "title": "Elevación",
    "text": "Sube las piernas estiradas hasta que queden paralelas al suelo, con la espalda pegada al respaldo."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas despacio hasta que cuelguen rectas. No te balancees para la siguiente repetición."
   }
  ]
 },
 "chest-press-machine": {
  "name": "Press de pecho en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas queden a la altura de la mitad del pecho. Siéntate con la espalda recta contra el respaldo y los pies en el suelo."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia delante hasta casi estirar los brazos. Mantén los hombros hacia atrás contra el respaldo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas vuelvan despacio hasta notar el estiramiento en el pecho. No dejes que las placas se apoyen."
   }
  ]
 },
 "chest-supported-dumbbell-row": {
  "name": "Remo con mancuernas con apoyo en el pecho",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon un banco inclinado a 30-45° y acuéstate boca abajo con el pecho en el respaldo y una mancuerna en cada mano."
   },
   {
    "title": "Tirón",
    "text": "Sube las mancuernas junto a las costillas y junta los omóplatos. Mantén el pecho apoyado en el banco."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos y dejar que los hombros se vayan hacia delante."
   }
  ]
 },
 "chest-supported-t-bar-row": {
  "name": "Remo en T con apoyo en el pecho",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate sobre las plataformas para los pies y apoya el pecho en la almohadilla. Agarra las asas con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Lleva las asas hacia el pecho, llevando los codos hacia atrás. Mantén el pecho apoyado."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos y separar los omóplatos."
   }
  ]
 },
 "chin-up": {
  "name": "Dominadas supinas",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Agarra la barra con las palmas hacia ti, con las manos a la anchura de los hombros más o menos, y cuelga con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Lleva los codos hacia abajo delante del cuerpo hasta que la barbilla pase por encima de la barra. Mantén las piernas quietas."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar del todo los brazos. No te balancees para la siguiente repetición."
   }
  ]
 },
 "clean": {
  "name": "Cargada",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Barra sobre la mitad del pie, pies a la anchura de las caderas, agarre justo por fuera de las piernas. Caderas por encima de las rodillas, pecho arriba y espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Sube la barra por encima de las rodillas con un empuje constante y luego extiende caderas, rodillas y tobillos con fuerza, manteniéndola cerca."
   },
   {
    "title": "Recepción",
    "text": "Métete en una sentadilla frontal completa y recibe la barra sobre los hombros con los codos altos. Ponte de pie."
   }
  ]
 },
 "clean-and-jerk": {
  "name": "Cargada y envión",
  "instructions": [
   {
    "title": "Cargada",
    "text": "Sube la barra del suelo y recíbela sobre los hombros en una sentadilla frontal con los codos altos. Ponte de pie y reajusta el agarre."
   },
   {
    "title": "Flexión de piernas",
    "text": "Con la barra sobre los hombros, baja unos centímetros flexionando las rodillas, con el torso erguido, y sube con fuerza."
   },
   {
    "title": "Envión",
    "text": "Métete bajo la barra abriendo las piernas en tijera y recíbela sobre la cabeza con los brazos bloqueados. Junta los pies y luego baja la barra."
   }
  ]
 },
 "close-grip-bench-press": {
  "name": "Press de banca con agarre cerrado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en el banco con los ojos bajo la barra y agárrala a la anchura de los hombros más o menos. Junta los omóplatos y apoya bien los pies."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala con control hasta la parte baja del pecho, con los codos pegados a los costados."
   },
   {
    "title": "Press",
    "text": "Empuja la barra hacia arriba hasta estirar los brazos. Mantén las muñecas alineadas sobre los codos."
   }
  ]
 },
 "close-grip-lat-pulldown": {
  "name": "Jalón al pecho con agarre cerrado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un agarre en V, siéntate con los muslos bajo los rodillos y sujétalo con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Inclínate un poco hacia atrás y lleva el agarre a la parte alta del pecho, llevando los codos hacia abajo y atrás."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el agarre suba despacio hasta estirar los brazos y estirar los dorsales."
   }
  ]
 },
 "concentration-curl": {
  "name": "Curl concentrado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco, inclínate hacia delante y apoya la parte trasera del brazo contra la cara interna del muslo."
   },
   {
    "title": "Curl",
    "text": "Sube la mancuerna hacia el hombro sin mover la parte alta del brazo. Aprieta el bíceps arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar el brazo. Haz todas las repeticiones antes de cambiar de brazo."
   }
  ]
 },
 "copenhagen-plank": {
  "name": "Plancha Copenhague",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate de lado junto a un banco, con el antebrazo bajo el hombro, y apoya en el banco la cara interna de la rodilla o del tobillo de arriba."
   },
   {
    "title": "Elevación",
    "text": "Presiona la pierna de arriba contra el banco y sube la cadera hasta que el cuerpo forme una línea recta. La pierna de abajo cuelga libre."
   },
   {
    "title": "Aguante",
    "text": "Mantén la cadera alta y respira con calma durante todo el tiempo. Luego haz el mismo tiempo del otro lado."
   }
  ]
 },
 "crunch": {
  "name": "Crunch",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados. Pon las yemas de los dedos suavemente detrás de las orejas."
   },
   {
    "title": "Crunch",
    "text": "Despega los hombros del suelo contrayendo los abdominales. Mantén la zona lumbar pegada al suelo y no tires del cuello."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta que los omóplatos toquen el suelo y empieza la siguiente repetición."
   }
  ]
 },
 "curtsy-lunge": {
  "name": "Zancada cruzada",
  "instructions": [
   {
    "title": "De pie",
    "text": "Ponte erguido con los pies a la anchura de las caderas y una mancuerna en cada mano, a los costados."
   },
   {
    "title": "Paso cruzado",
    "text": "Lleva una pierna en diagonal por detrás de la otra, como en una reverencia, y baja hasta que el muslo de delante quede casi paralelo al suelo."
   },
   {
    "title": "Vuelta",
    "text": "Empuja con el talón de delante para volver al inicio, con la rodilla de delante alineada con los pies. Alterna las piernas."
   }
  ]
 },
 "dead-bug": {
  "name": "Dead bug",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con los brazos apuntando al techo y la cadera y las rodillas flexionadas a 90°. Presiona la zona lumbar contra el suelo."
   },
   {
    "title": "Extensión",
    "text": "Baja despacio un brazo por encima de la cabeza y estira la pierna contraria hasta que ambos queden justo sobre el suelo."
   },
   {
    "title": "Cambio",
    "text": "Vuelve al inicio y repite con el otro lado. Mantén la zona lumbar pegada al suelo y suelta el aire al extender."
   }
  ]
 },
 "dead-hang": {
  "name": "Colgarse de la barra",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Agarra una barra de dominadas con agarre prono a la anchura de los hombros y despega los pies del suelo."
   },
   {
    "title": "Suspensión",
    "text": "Cuelga con los brazos estirados y deja que el cuerpo se alargue. Mantén las piernas quietas y respira despacio."
   },
   {
    "title": "Aguante",
    "text": "Sigue apretando la barra y quédate quieto todo el tiempo. Baja con control cuando empiece a fallarte el agarre."
   }
  ]
 },
 "deadlift": {
  "name": "Peso muerto",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pies a la anchura de las caderas bajo la barra, con las espinillas cerca. Agarra la barra justo por fuera de las piernas."
   },
   {
    "title": "Tensión",
    "text": "Cadera abajo, pecho arriba, espalda recta. Toma aire y tensa la barra para quitarle el juego."
   },
   {
    "title": "Levantamiento",
    "text": "Empuja el suelo y ponte erguido, manteniendo la barra cerca. Bájala de la misma forma."
   }
  ]
 },
 "decline-bench-press": {
  "name": "Press de banca declinado con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha los pies bajo los rodillos y échate hacia atrás con los ojos bajo la barra. Pide a alguien que te ayude a sacarla del soporte."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala con control hasta la parte baja del pecho, con los codos a unos 45° del torso."
   },
   {
    "title": "Press",
    "text": "Empuja la barra en vertical hasta casi estirar los brazos. Mantén los omóplatos juntos."
   }
  ]
 },
 "decline-chest-press-machine": {
  "name": "Press de pecho declinado en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas queden a la altura de la parte baja del pecho. Siéntate con la espalda contra el respaldo y agarra las asas."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia delante y abajo hasta casi estirar los brazos. Mantén el pecho arriba y los hombros hacia atrás."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas vuelvan despacio hasta notar el estiramiento en la parte baja del pecho, sin que las placas se apoyen."
   }
  ]
 },
 "decline-dumbbell-press": {
  "name": "Press declinado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco declinado con las mancuernas sobre los muslos, engancha los pies bajo los rodillos y échate hacia atrás con las pesas a la altura del pecho."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas a los lados de la parte baja del pecho, con los codos a unos 45° del torso."
   },
   {
    "title": "Press",
    "text": "Empuja hacia arriba y un poco hacia dentro hasta casi estirar los brazos. Al terminar, lleva las pesas al pecho antes de incorporarte."
   }
  ]
 },
 "decline-push-up": {
  "name": "Flexiones declinadas",
  "instructions": [
   {
    "title": "Plancha",
    "text": "Apoya los pies en un banco o cajón y las manos en el suelo, un poco más abiertas que los hombros. Cuerpo recto de la cabeza a los talones."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho hacia el suelo, con los codos a unos 45° del torso. Mantén el cuello neutro y no subas la cadera."
   },
   {
    "title": "Empuje",
    "text": "Empuja el suelo hasta estirar los brazos. Aprieta abdominales y glúteos para que la cadera no se hunda."
   }
  ]
 },
 "decline-sit-up": {
  "name": "Abdominales en banco declinado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha los pies bajo los rodillos de un banco declinado y échate hacia atrás. Cruza los brazos o sujeta un disco contra el pecho."
   },
   {
    "title": "Subida",
    "text": "Enrolla el torso hacia arriba hasta quedar casi erguido, con el disco pegado al pecho."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta que la zona lumbar toque el banco. No te dejes caer para la siguiente repetición."
   }
  ]
 },
 "deficit-deadlift": {
  "name": "Peso muerto con déficit",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte sobre un disco o plataforma de 2-5 cm con la barra sobre la mitad del pie. Agarra justo por fuera de las piernas."
   },
   {
    "title": "Tensión",
    "text": "Cadera más baja que en un peso muerto normal, pecho arriba, espalda recta. Toma aire y tensa la barra para quitarle el juego."
   },
   {
    "title": "Levantamiento",
    "text": "Empuja el suelo y mantén la barra cerca cuando despegue. Ponte erguido y bájala de la misma forma."
   }
  ]
 },
 "deficit-push-up": {
  "name": "Flexiones con déficit",
  "instructions": [
   {
    "title": "Plancha",
    "text": "Apoya las manos en dos discos, tacos o asas de flexiones, un poco más abiertas que los hombros. Cuerpo recto de la cabeza a los talones."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho por debajo de las manos hasta notar un estiramiento profundo en el pecho, con los codos a unos 45° hacia fuera."
   },
   {
    "title": "Empuje",
    "text": "Empuja hasta estirar los brazos. Baja solo hasta donde tus hombros lo permitan con comodidad."
   }
  ]
 },
 "diamond-push-up": {
  "name": "Flexiones diamante",
  "instructions": [
   {
    "title": "Manos",
    "text": "Coloca las manos bajo el pecho, con los pulgares y los índices tocándose en forma de diamante. Cuerpo en línea recta."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho hacia las manos, con los codos cerca del cuerpo."
   },
   {
    "title": "Empuje",
    "text": "Empuja hasta estirar los brazos. Aprieta los glúteos para que la cadera no se hunda."
   }
  ]
 },
 "dip": {
  "name": "Fondos",
  "instructions": [
   {
    "title": "Apoyo",
    "text": "Sube sobre las barras con los brazos estirados y los hombros bajos, lejos de las orejas."
   },
   {
    "title": "Bajada",
    "text": "Inclínate un poco hacia delante y baja hasta que los brazos queden casi paralelos al suelo."
   },
   {
    "title": "Empuje",
    "text": "Empuja hasta la extensión completa sin balancear las piernas."
   }
  ]
 },
 "dip-machine": {
  "name": "Máquina de fondos sentado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas empiecen a la altura de la parte baja del pecho. Siéntate erguido y agarra las asas."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia abajo hasta estirar los brazos, con los codos cerca del cuerpo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas suban despacio hasta que los codos queden flexionados a unos 90°. Mantén los hombros bajos, lejos de las orejas."
   }
  ]
 },
 "donkey-kick": {
  "name": "Patada de burro",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte a cuatro apoyos con las manos bajo los hombros y las rodillas bajo la cadera. Activa el core."
   },
   {
    "title": "Patada",
    "text": "Con la rodilla flexionada a 90°, empuja un pie hacia el techo hasta que el muslo quede alineado con la espalda."
   },
   {
    "title": "Bajada",
    "text": "Baja la rodilla sin tocar el suelo y no arquees la zona lumbar. Cambia de pierna al terminar la serie."
   }
  ]
 },
 "drag-curl": {
  "name": "Curl arrastrado",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Ponte erguido y sujeta la barra con agarre supino, con las manos a la anchura de los hombros y la barra contra los muslos."
   },
   {
    "title": "Arrastre",
    "text": "Lleva los codos hacia atrás y arrastra la barra hacia arriba pegada al torso hasta la parte baja del pecho. La barra no pierde contacto con el cuerpo."
   },
   {
    "title": "Bajada",
    "text": "Desliza la barra de vuelta por el cuerpo con control hasta estirar los brazos."
   }
  ]
 },
 "dumbbell-bench-press": {
  "name": "Press de banca con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco plano con las mancuernas sobre los muslos, échate hacia atrás y súbelas sobre el pecho."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas a los lados del pecho, con los codos a unos 45° del torso y las muñecas alineadas sobre ellos."
   },
   {
    "title": "Press",
    "text": "Empuja hacia arriba y un poco hacia dentro hasta casi estirar los brazos. No choques las mancuernas arriba."
   }
  ]
 },
 "dumbbell-curl": {
  "name": "Curl de bíceps con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con las mancuernas a los costados y los codos cerca del cuerpo."
   },
   {
    "title": "Curl",
    "text": "Flexiona los codos y sube las pesas hacia los hombros sin balancearte."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar de nuevo los brazos."
   }
  ]
 },
 "dumbbell-floor-press": {
  "name": "Press en suelo con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el suelo con las mancuernas sobre los muslos, déjate caer hacia atrás y empújalas sobre el pecho. Flexiona las rodillas con los pies apoyados."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas hasta que la parte alta de los brazos descanse en el suelo, con los codos a unos 45° del torso. Haz una pausa de un segundo."
   },
   {
    "title": "Press",
    "text": "Empuja las mancuernas de vuelta sobre el pecho sin rebotar con los codos en el suelo."
   }
  ]
 },
 "dumbbell-fly": {
  "name": "Aperturas con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en un banco plano y sube las mancuernas sobre el pecho, con las palmas enfrentadas y los codos ligeramente flexionados."
   },
   {
    "title": "Apertura",
    "text": "Baja las pesas hacia los lados en un arco amplio hasta notar el estiramiento en el pecho. Mantén fija la flexión de los codos."
   },
   {
    "title": "Cierre",
    "text": "Sube las mancuernas por el mismo arco, como si abrazaras un árbol, y para justo antes de que se toquen."
   }
  ]
 },
 "dumbbell-kickback": {
  "name": "Patada de tríceps con mancuerna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya una rodilla y una mano en un banco, con la espalda recta. Sujeta la mancuerna con la parte alta del brazo pegada al costado, paralela al suelo."
   },
   {
    "title": "Extensión",
    "text": "Estira el codo hasta que todo el brazo quede alineado con el torso. Solo se mueve el antebrazo."
   },
   {
    "title": "Vuelta",
    "text": "Flexiona el codo despacio hasta 90° sin dejar caer la parte alta del brazo. Cambia de brazo al terminar la serie."
   }
  ]
 },
 "dumbbell-preacher-curl": {
  "name": "Curl predicador con mancuerna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el banco predicador y apoya la parte trasera de un brazo sobre la almohadilla, con la mancuerna en la mano y la palma hacia arriba."
   },
   {
    "title": "Curl",
    "text": "Sube la mancuerna hasta que el antebrazo quede casi vertical. Mantén quietos la parte alta del brazo y el hombro."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta dejar el brazo casi estirado y repite. Cambia de brazo al terminar la serie."
   }
  ]
 },
 "dumbbell-pullover": {
  "name": "Pullover con mancuerna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en un banco plano y sujeta una mancuerna sobre el pecho con las dos manos bajo el disco de arriba, con los codos ligeramente flexionados."
   },
   {
    "title": "Bajada",
    "text": "Lleva la mancuerna hacia atrás, por detrás de la cabeza, en un arco hasta notar el estiramiento en el pecho y los dorsales."
   },
   {
    "title": "Tirón",
    "text": "Trae la mancuerna de vuelta sobre el pecho por el mismo arco. Mantén las costillas abajo para no arquear la zona lumbar."
   }
  ]
 },
 "dumbbell-romanian-deadlift": {
  "name": "Peso muerto rumano con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con una mancuerna en cada mano delante de los muslos y las rodillas ligeramente flexionadas."
   },
   {
    "title": "Bisagra",
    "text": "Lleva la cadera atrás y desliza las mancuernas cerca de las piernas hasta notar el estiramiento en los isquiotibiales."
   },
   {
    "title": "Vuelta",
    "text": "Empuja la cadera hacia delante para ponerte de pie y aprieta los glúteos. La espalda se mantiene recta todo el tiempo."
   }
  ]
 },
 "dumbbell-shoulder-press": {
  "name": "Press de hombros con mancuernas",
  "instructions": [
   {
    "title": "Tensión",
    "text": "Sujeta las pesas a la altura de los hombros, con las muñecas alineadas sobre los codos. Activa el core y los glúteos."
   },
   {
    "title": "Press",
    "text": "Empuja en vertical hasta bloquear los brazos sobre la cabeza, echando la cabeza ligeramente atrás."
   },
   {
    "title": "Bajada",
    "text": "Vuelve a la altura de los hombros con control, sin arquear la zona lumbar."
   }
  ]
 },
 "dumbbell-shrug": {
  "name": "Encogimientos con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte erguido con una mancuerna en cada mano a los costados, con las palmas hacia dentro y los brazos estirados."
   },
   {
    "title": "Encogimiento",
    "text": "Sube los hombros en vertical hacia las orejas todo lo que puedas. No los gires ni flexiones los codos."
   },
   {
    "title": "Bajada",
    "text": "Haz una breve pausa arriba y baja los hombros despacio hasta el estiramiento completo."
   }
  ]
 },
 "dumbbell-side-bend": {
  "name": "Inclinación lateral con mancuerna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte erguido con una mancuerna en una mano a un costado, los pies a la anchura de las caderas y la otra mano en la cadera."
   },
   {
    "title": "Inclinación",
    "text": "Inclínate hacia el lado de la mancuerna, deslizándola por el muslo. No te inclines hacia delante ni hacia atrás."
   },
   {
    "title": "Vuelta",
    "text": "Vuelve a la posición erguida con los oblicuos del otro lado. Cambia de lado al terminar la serie."
   }
  ]
 },
 "dumbbell-skull-crusher": {
  "name": "Press francés con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en un banco plano y sube dos mancuernas sobre los hombros, con las palmas enfrentadas."
   },
   {
    "title": "Bajada",
    "text": "Flexiona solo los codos para bajar las mancuernas junto a la cabeza. Mantén quietos los brazos, apuntando hacia arriba."
   },
   {
    "title": "Extensión",
    "text": "Estira los brazos para volver a subir las mancuernas sobre los hombros. Aprieta los tríceps arriba."
   }
  ]
 },
 "dumbbell-thruster": {
  "name": "Thruster con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta una mancuerna en cada mano a la altura de los hombros, con las palmas hacia dentro y los pies a la anchura de los hombros."
   },
   {
    "title": "Sentadilla",
    "text": "Baja en sentadilla hasta que los muslos queden al menos paralelos, con el pecho arriba y los codos al frente."
   },
   {
    "title": "Press",
    "text": "Sube de la sentadilla y aprovecha ese impulso para empujar las mancuernas sobre la cabeza en un solo movimiento fluido. Bájalas de nuevo a los hombros."
   }
  ]
 },
 "elliptical": {
  "name": "Elíptica",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sube a los pedales, sujeta las asas móviles y elige una resistencia con la que puedas moverte con fluidez."
   },
   {
    "title": "Movimiento",
    "text": "Empuja y tira de las asas mientras avanzas, con todo el pie apoyado en los pedales y el torso erguido."
   },
   {
    "title": "Ritmo",
    "text": "Mantén un ritmo constante y uniforme. En un calentamiento deberías poder hablar con comodidad."
   }
  ]
 },
 "exercise-bike": {
  "name": "Bicicleta estática",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que la rodilla quede un poco flexionada en la parte baja del pedaleo. Empieza con poca resistencia."
   },
   {
    "title": "Pedaleo",
    "text": "Pedalea en círculos fluidos con el torso quieto y la parte delantera de los pies sobre los pedales."
   },
   {
    "title": "Ritmo",
    "text": "Mantén una cadencia constante y ajusta la resistencia según tu objetivo. En un calentamiento deberías poder hablar."
   }
  ]
 },
 "ez-bar-curl": {
  "name": "Curl con barra EZ",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Sujeta la barra EZ por los agarres interiores en ángulo, con las palmas hacia arriba y un poco hacia dentro y los brazos estirados."
   },
   {
    "title": "Curl",
    "text": "Sube la barra hasta la altura de los hombros con los codos pegados a los costados. Mantén las muñecas neutras."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra en unos dos segundos hasta estirar de nuevo los brazos."
   }
  ]
 },
 "face-pull": {
  "name": "Face pull",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea entre la altura de la parte alta del pecho y la de la cara. Agarra los extremos con los pulgares hacia atrás y da un paso atrás."
   },
   {
    "title": "Tirón",
    "text": "Tira de la cuerda hacia la cara, separando los extremos para que las manos acaben junto a las orejas, con los codos altos."
   },
   {
    "title": "Vuelta",
    "text": "Aguanta un momento y aprieta los deltoides posteriores, y deja que la cuerda vuelva despacio hasta estirar los brazos."
   }
  ]
 },
 "farmers-walk": {
  "name": "Paseo del granjero",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Levanta del suelo una mancuerna pesada en cada mano hasta los costados. Ponte erguido con los hombros atrás y abajo."
   },
   {
    "title": "Marcha",
    "text": "Camina con pasos cortos y rápidos durante el tiempo marcado, con el torso erguido y las pesas quietas."
   },
   {
    "title": "Técnica",
    "text": "Agarra con fuerza, activa los abdominales y no te inclines hacia ningún lado. Al acabar el tiempo, deja las pesas en el suelo con la espalda recta."
   }
  ]
 },
 "fire-hydrant": {
  "name": "Fire hydrant",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte a cuatro apoyos con las manos bajo los hombros y las rodillas bajo la cadera. Activa el core."
   },
   {
    "title": "Elevación",
    "text": "Con la rodilla flexionada, sube una pierna hacia el lado hasta que el muslo quede casi a la altura de la cadera."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio sin desplazar el peso ni girar el torso. Cambia de pierna al terminar la serie."
   }
  ]
 },
 "floor-press": {
  "name": "Press en suelo con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en el suelo dentro de un rack, con la barra sobre los hombros, las rodillas flexionadas y los pies apoyados. Agarre un poco más ancho que los hombros."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala hasta que la parte alta de los brazos toque el suelo, con los codos a unos 45° del torso. Haz una breve pausa."
   },
   {
    "title": "Press",
    "text": "Empuja la barra hasta bloquear los brazos sin rebotar con los codos en el suelo. Mantén los omóplatos juntos hacia atrás."
   }
  ]
 },
 "french-press": {
  "name": "Press francés",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en un banco plano y sujeta una barra EZ o recta sobre los hombros con agarre prono estrecho y los brazos estirados."
   },
   {
    "title": "Bajada",
    "text": "Flexiona solo los codos para bajar la barra hacia la frente. Mantén quietos los brazos y los codos apuntando hacia arriba."
   },
   {
    "title": "Extensión",
    "text": "Estira los brazos para volver a subir la barra sobre los hombros. No dejes que los codos se abran."
   }
  ]
 },
 "front-raise": {
  "name": "Elevaciones frontales con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con las mancuernas delante de los muslos, las palmas hacia el cuerpo y los codos ligeramente flexionados."
   },
   {
    "title": "Elevación",
    "text": "Sube las pesas en vertical al frente hasta la altura de los hombros. Mantén el torso quieto y no te balancees."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, en dos o tres segundos, hasta que las mancuernas vuelvan delante de los muslos."
   }
  ]
 },
 "front-squat": {
  "name": "Sentadilla frontal",
  "instructions": [
   {
    "title": "Posición de la barra",
    "text": "Apoya la barra en los deltoides delanteros, cerca del cuello, con los codos altos y las yemas de los dedos bajo la barra o los brazos cruzados."
   },
   {
    "title": "Descenso",
    "text": "Baja en vertical con el torso erguido y los codos arriba, dejando que las rodillas avancen sobre los pies."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie y sube guiando con los codos para que la barra no ruede hacia delante."
   }
  ]
 },
 "glute-bridge": {
  "name": "Puente de glúteo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados, a la anchura de las caderas. Apoya un peso sobre la cadera si quieres."
   },
   {
    "title": "Elevación",
    "text": "Empuja con los talones y sube la cadera hasta que el cuerpo quede recto de los hombros a las rodillas."
   },
   {
    "title": "Bajada",
    "text": "Aprieta los glúteos un segundo arriba y baja despacio hasta casi tocar el suelo con la cadera."
   }
  ]
 },
 "glute-ham-raise": {
  "name": "Glute-ham raise",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Bloquea los pies entre los rodillos, con las rodillas justo detrás de la almohadilla. Empieza erguido con el cuerpo recto."
   },
   {
    "title": "Bajada",
    "text": "Baja el cuerpo hacia delante con control hasta quedar paralelo al suelo, con la cadera extendida."
   },
   {
    "title": "Subida",
    "text": "Empuja las puntas de los pies contra la plataforma y sube con los isquiotibiales, apretando los glúteos."
   }
  ]
 },
 "glute-kickback-machine": {
  "name": "Patada de glúteo en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya el pecho o los antebrazos en la almohadilla y coloca un pie plano en la plataforma, con la pierna de apoyo ligeramente flexionada."
   },
   {
    "title": "Patada",
    "text": "Empuja la plataforma hacia atrás y arriba apretando el glúteo hasta extender del todo la cadera, sin arquear la espalda."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la plataforma vuelva despacio hasta que la rodilla quede cerca del pecho. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "goblet-squat": {
  "name": "Sentadilla goblet",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Sujeta una mancuerna en vertical contra el pecho con las dos manos, con los codos apuntando hacia abajo."
   },
   {
    "title": "Descenso",
    "text": "Siéntate entre los talones con el pecho arriba hasta que los codos rocen la cara interna de las rodillas."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie hasta ponerte de pie, manteniendo la mancuerna cerca del pecho."
   }
  ]
 },
 "good-morning": {
  "name": "Buenos días con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya la barra en la parte alta de la espalda, como en una sentadilla, con los pies a la anchura de las caderas y las rodillas ligeramente flexionadas."
   },
   {
    "title": "Bisagra",
    "text": "Lleva la cadera atrás y baja el torso con la espalda recta hasta que quede casi paralelo o los isquiotibiales tiren con fuerza."
   },
   {
    "title": "Vuelta",
    "text": "Empuja la cadera hacia delante para volver a ponerte de pie. Empieza con poco peso: la palanca larga carga mucho la zona lumbar."
   }
  ]
 },
 "hack-squat": {
  "name": "Sentadilla hack",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate con la espalda y los hombros pegados a las almohadillas. Pon los pies a la anchura de los hombros en el centro de la plataforma."
   },
   {
    "title": "Descenso",
    "text": "Suelta los seguros y flexiona las rodillas hasta que los muslos queden al menos paralelos, con la espalda siempre apoyada."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie sin bloquear las rodillas y vuelve a poner los seguros después de la última repetición."
   }
  ]
 },
 "hammer-curl": {
  "name": "Curl martillo con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con las mancuernas a los costados, las palmas hacia el cuerpo y los codos cerca del torso."
   },
   {
    "title": "Curl",
    "text": "Sube las mancuernas con los pulgares arriba hasta que los antebrazos queden casi verticales. No balancees el torso."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, manteniendo el agarre neutro, hasta estirar de nuevo los brazos."
   }
  ]
 },
 "hang-power-clean": {
  "name": "Power clean desde colgado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte erguido con la barra en agarre prono justo por fuera de los muslos. Flexiona la cadera con la espalda recta hasta que la barra quede justo sobre las rodillas."
   },
   {
    "title": "Tirón",
    "text": "Salta con fuerza extendiendo caderas, rodillas y tobillos, y luego encoge los hombros y sube la barra pegada al cuerpo."
   },
   {
    "title": "Recepción",
    "text": "Baja bajo la barra, lleva los codos hacia delante y recíbela sobre los hombros en un cuarto de sentadilla. Ponte de pie y vuelve a bajarla a la posición colgada."
   }
  ]
 },
 "hanging-knee-raise": {
  "name": "Elevación de rodillas colgado",
  "instructions": [
   {
    "title": "Suspensión",
    "text": "Cuélgate de una barra de dominadas con agarre prono, los brazos estirados y las piernas juntas."
   },
   {
    "title": "Elevación",
    "text": "Sube las rodillas hacia el pecho, enrollando la pelvis hacia arriba al final. Evita balancearte."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas despacio hasta que cuelguen rectas de nuevo antes de la siguiente repetición."
   }
  ]
 },
 "hanging-leg-raise": {
  "name": "Elevación de piernas colgado",
  "instructions": [
   {
    "title": "Suspensión",
    "text": "Cuélgate de una barra de dominadas con agarre prono, los brazos estirados y los hombros ligeramente activados."
   },
   {
    "title": "Elevación",
    "text": "Sube las piernas estiradas hasta que queden al menos paralelas al suelo, inclinando la pelvis hacia arriba al final."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas despacio sin balancearte. Haz una breve pausa abajo antes de la siguiente repetición."
   }
  ]
 },
 "high-knees": {
  "name": "Rodillas altas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con los pies a la anchura de las caderas y los brazos flexionados a 90°."
   },
   {
    "title": "Carrera",
    "text": "Corre en el lugar, subiendo cada rodilla hasta la altura de la cadera mientras mueves los brazos."
   },
   {
    "title": "Continuar",
    "text": "Mantente sobre la parte delantera de los pies con el torso erguido. Mantén el ritmo alto durante todo el tiempo sin inclinarte hacia atrás."
   }
  ]
 },
 "high-to-low-cable-fly": {
  "name": "Aperturas en polea de arriba abajo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon las dos poleas por encima de la cabeza, toma un asa en cada mano y da un paso adelante en postura de zancada, inclinado un poco hacia delante."
   },
   {
    "title": "Cierre",
    "text": "Con los codos ligeramente flexionados, lleva las manos abajo y juntas hasta que se encuentren delante de la parte baja del abdomen."
   },
   {
    "title": "Vuelta",
    "text": "Deja que los brazos suban y se abran despacio hasta notar el estiramiento en la parte baja del pecho."
   }
  ]
 },
 "hip-abduction-machine": {
  "name": "Máquina de abducción de cadera",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con la espalda contra el respaldo y las almohadillas de los muslos contra la cara exterior de las rodillas."
   },
   {
    "title": "Apertura",
    "text": "Separa las rodillas todo lo que puedas apretando los laterales de los glúteos, y aguanta un momento."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las piernas vuelvan a juntarse despacio sin que la pila de pesas se apoye."
   }
  ]
 },
 "hip-adduction-machine": {
  "name": "Máquina de aducción de cadera",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con la espalda contra el respaldo y las almohadillas de los muslos contra la cara interior de las rodillas. Empieza con un estiramiento que puedas controlar."
   },
   {
    "title": "Cierre",
    "text": "Junta las rodillas hasta que las almohadillas se encuentren, con la espalda apoyada en el respaldo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las piernas se abran despacio hasta el inicio sin que el peso se apoye."
   }
  ]
 },
 "hip-thrust": {
  "name": "Hip thrust con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con la parte alta de la espalda contra un banco y haz rodar una barra acolchada sobre la cadera. Pies apoyados, a la anchura de las caderas."
   },
   {
    "title": "Impulso",
    "text": "Empuja con los talones y sube la cadera hasta que el cuerpo quede recto de los hombros a las rodillas, con las espinillas verticales."
   },
   {
    "title": "Bloqueo",
    "text": "Aprieta fuerte los glúteos arriba con la barbilla metida y baja con control."
   }
  ]
 },
 "hip-thrust-machine": {
  "name": "Hip thrust en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en la máquina con la parte alta de la espalda en el respaldo y el cinturón o la almohadilla sobre la cadera. Pies apoyados, a la anchura de las caderas."
   },
   {
    "title": "Impulso",
    "text": "Empuja con los talones y extiende la cadera hasta que el cuerpo quede recto de los hombros a las rodillas."
   },
   {
    "title": "Bajada",
    "text": "Aprieta los glúteos un segundo arriba y baja despacio sin que el peso se apoye."
   }
  ]
 },
 "hollow-hold": {
  "name": "Hollow hold",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con los brazos sobre la cabeza. Presiona con firmeza la zona lumbar contra el suelo."
   },
   {
    "title": "Elevación",
    "text": "Despega del suelo unos centímetros los hombros, los brazos y las piernas estiradas, de modo que el cuerpo forme una banana poco curvada."
   },
   {
    "title": "Aguante",
    "text": "Respira con calma y aguanta. Si la zona lumbar se despega, flexiona las rodillas o lleva los brazos hacia delante."
   }
  ]
 },
 "incline-bench-press": {
  "name": "Press inclinado con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon el banco a 30-45° y acuéstate con los ojos bajo la barra. Junta los omóplatos hacia atrás y abajo, con los pies bien apoyados."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala con control hasta la parte alta del pecho, justo bajo las clavículas, con los codos a unos 45°."
   },
   {
    "title": "Press",
    "text": "Empuja la barra hacia arriba y un poco hacia atrás hasta situarla sobre los hombros, con los brazos casi estirados."
   }
  ]
 },
 "incline-chest-press-machine": {
  "name": "Press de pecho inclinado en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas empiecen a la altura de la parte alta del pecho. Siéntate con la espalda y la cabeza contra el respaldo."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia arriba y delante hasta casi estirar los brazos. Mantén los hombros abajo y atrás."
   },
   {
    "title": "Vuelta",
    "text": "Baja las asas despacio hasta notar el estiramiento en la parte alta del pecho y empuja de nuevo antes de que las placas se apoyen."
   }
  ]
 },
 "incline-dumbbell-curl": {
  "name": "Curl inclinado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Échate hacia atrás en un banco a unos 45-60°. Deja que los brazos cuelguen rectos hacia abajo con las palmas hacia delante."
   },
   {
    "title": "Curl",
    "text": "Sube las mancuernas sin dejar que los codos se adelanten. Mantén la cabeza y la espalda en el banco."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta que los brazos cuelguen rectos de nuevo y notes el estiramiento en el bíceps."
   }
  ]
 },
 "incline-dumbbell-fly": {
  "name": "Aperturas inclinadas con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon el banco a 30-45°, échate hacia atrás y sube las mancuernas sobre la parte alta del pecho, con las palmas enfrentadas."
   },
   {
    "title": "Apertura",
    "text": "Baja las pesas hacia los lados en un arco amplio, con los codos ligeramente flexionados, hasta notar el estiramiento en la parte alta del pecho."
   },
   {
    "title": "Cierre",
    "text": "Sube las mancuernas sobre la parte alta del pecho por el mismo arco. Mantén los hombros abajo y atrás."
   }
  ]
 },
 "incline-dumbbell-hammer-curl": {
  "name": "Curl martillo inclinado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Échate hacia atrás en un banco a unos 45-60°. Deja que los brazos cuelguen rectos hacia abajo con las palmas hacia el cuerpo."
   },
   {
    "title": "Curl",
    "text": "Sube las mancuernas con los pulgares arriba, sin dejar que los codos se adelanten. Mantén la cabeza y la espalda en el banco."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, manteniendo el agarre neutro, hasta que los brazos cuelguen rectos de nuevo."
   }
  ]
 },
 "incline-dumbbell-press": {
  "name": "Press inclinado con mancuernas",
  "instructions": [
   {
    "title": "Ajuste del banco",
    "text": "Pon el respaldo a 30-45°. Siéntate con las mancuernas apoyadas en los muslos."
   },
   {
    "title": "Posición inicial",
    "text": "Échate hacia atrás y empuja las mancuernas sobre el pecho. Omóplatos atrás y abajo, pies firmes en el suelo."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio hasta la altura del pecho. Los codos apuntan a unos 45° del torso."
   },
   {
    "title": "Press",
    "text": "Empuja las mancuernas hacia arriba con fuerza hasta casi estirar los brazos. Haz una breve pausa arriba."
   }
  ]
 },
 "incline-push-up": {
  "name": "Flexiones inclinadas",
  "instructions": [
   {
    "title": "Plancha",
    "text": "Apoya las manos en un banco, cajón o barra, un poco más abiertas que los hombros. Camina hacia atrás con los pies hasta que el cuerpo quede recto."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho hacia el borde, con los codos a unos 45° del torso. Mantén una línea recta de la cabeza a los talones."
   },
   {
    "title": "Empuje",
    "text": "Empuja hasta estirar los brazos. Usa una superficie más baja con el tiempo para hacerlo más difícil."
   }
  ]
 },
 "inverted-row": {
  "name": "Remo invertido",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon una barra a la altura de la cintura en un rack o una máquina Smith. Acuéstate debajo, agárrala con agarre prono y estira el cuerpo."
   },
   {
    "title": "Tirón",
    "text": "Lleva el pecho a la barra con el cuerpo en una línea recta de la cabeza a los talones. Junta los omóplatos."
   },
   {
    "title": "Bajada",
    "text": "Baja hasta estirar los brazos sin dejar que la cadera se hunda. Flexiona las rodillas para hacerlo más fácil."
   }
  ]
 },
 "jm-press": {
  "name": "JM press",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en un banco plano y sujeta la barra con un agarre algo más estrecho que los hombros, con los brazos estirados sobre los hombros."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra en línea recta hacia la barbilla, con los codos pegados y apuntando hacia los pies. Para justo encima de la barbilla, cuando los antebrazos toquen los bíceps."
   },
   {
    "title": "Press",
    "text": "Empuja la barra de vuelta por el mismo recorrido hasta estirar los brazos sobre los hombros."
   }
  ]
 },
 "jump-rope": {
  "name": "Saltar la cuerda",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta un asa en cada mano con la cuerda detrás de los talones. Codos cerca de los costados y manos a la altura de la cadera."
   },
   {
    "title": "Salto",
    "text": "Gira la cuerda con las muñecas y salta solo lo justo para pasarla, aterrizando con suavidad sobre la parte delantera de los pies."
   },
   {
    "title": "Continuar",
    "text": "Mantén un ritmo constante todo el tiempo, con las rodillas ligeramente flexionadas y los hombros relajados. Si tropiezas, empieza de nuevo enseguida."
   }
  ]
 },
 "jump-squat": {
  "name": "Sentadilla con salto",
  "instructions": [
   {
    "title": "Postura",
    "text": "Ponte con los pies a la anchura de los hombros y las manos en el pecho o detrás de la cabeza."
   },
   {
    "title": "Carga",
    "text": "Baja rápido en una sentadilla de un cuarto a media, llevando los brazos atrás si quieres."
   },
   {
    "title": "Salto",
    "text": "Salta en vertical con fuerza, aterriza con suavidad sobre la parte delantera de los pies y pasa directo a la siguiente repetición."
   }
  ]
 },
 "jumping-jack": {
  "name": "Jumping jack",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con los pies juntos y los brazos a los costados."
   },
   {
    "title": "Salto",
    "text": "Salta abriendo los pies más que los hombros mientras subes los brazos sobre la cabeza, y vuelve de un salto al inicio."
   },
   {
    "title": "Continuar",
    "text": "Mantente ligero sobre la parte delantera de los pies y sigue un ritmo constante todo el tiempo. Respira con regularidad."
   }
  ]
 },
 "katana-extension": {
  "name": "Extensión katana",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa en D a una polea baja y colócate de lado a ella. Agárrala con la mano más alejada de la máquina para que el cable cruce el cuerpo, y llévala detrás de la cabeza con el codo arriba."
   },
   {
    "title": "Extensión",
    "text": "Estira el brazo en diagonal hacia arriba y fuera hasta dejarlo recto. Mantén quieta la parte alta del brazo, junto a la cabeza."
   },
   {
    "title": "Vuelta",
    "text": "Flexiona el codo despacio hasta que el asa vuelva detrás de la cabeza, cerca del hombro contrario. Cambia de lado al terminar la serie."
   }
  ]
 },
 "kelso-shrug": {
  "name": "Encogimientos Kelso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo en un banco inclinado a 30-45° con una mancuerna en cada mano y los brazos colgando rectos."
   },
   {
    "title": "Contracción",
    "text": "Lleva los omóplatos hacia atrás y júntalos sin flexionar los codos. Aguanta la contracción un segundo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que los omóplatos se separen despacio hasta que los hombros se vayan hacia delante."
   }
  ]
 },
 "kettlebell-swing": {
  "name": "Swing con kettlebell",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte con los pies un poco más abiertos que las caderas y la kettlebell algo por delante. Flexiona la cadera, agarra el asa con las dos manos y báscula la pesa hacia ti."
   },
   {
    "title": "Balanceo",
    "text": "Lanza la pesa hacia atrás entre las piernas y luego empuja la cadera hacia delante para balancearla hasta la altura del pecho. Los brazos se mantienen estirados y relajados."
   },
   {
    "title": "Control",
    "text": "Deja que la pesa caiga y flexiona la cadera cuando pase entre las piernas. Mantén la espalda recta y los talones en el suelo."
   }
  ]
 },
 "knee-push-up": {
  "name": "Flexiones con rodillas apoyadas",
  "instructions": [
   {
    "title": "Plancha",
    "text": "Arrodíllate con las manos en el suelo, un poco más abiertas que los hombros. Forma una línea recta de la cabeza a las rodillas."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho hacia el suelo, con los codos a unos 45° del torso. Mantén la cadera alineada, sin echarla hacia atrás."
   },
   {
    "title": "Empuje",
    "text": "Empuja el suelo hasta estirar los brazos. Mantén los abdominales firmes para que la zona lumbar no se hunda."
   }
  ]
 },
 "l-sit": {
  "name": "L-sit",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya las manos en paralelas bajas, barras de fondos o el suelo junto a las caderas. Bloquea los brazos y empuja los hombros hacia abajo."
   },
   {
    "title": "Elevación",
    "text": "Sube las piernas estiradas al frente hasta que queden paralelas al suelo. Estira las puntas de los pies y aprieta los muslos."
   },
   {
    "title": "Aguante",
    "text": "Respira con calma y aguanta con el pecho arriba. Si las piernas bajan, flexiona las rodillas para mantener la posición."
   }
  ]
 },
 "landmine-press": {
  "name": "Press landmine",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Encaja un extremo de la barra en un landmine o en una esquina. Sujeta el otro extremo a la altura del hombro con una mano y los pies escalonados."
   },
   {
    "title": "Press",
    "text": "Empuja la barra hacia arriba y delante hasta estirar el brazo, dejando que el omóplato se deslice hacia delante arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra de vuelta al hombro con control. Mantén la cadera mirando al frente y no te inclines hacia atrás."
   }
  ]
 },
 "larsen-press": {
  "name": "Press Larsen",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en el banco con los ojos bajo la barra. Estira las piernas y mantén los pies justo despegados del suelo."
   },
   {
    "title": "Bajada",
    "text": "Saca la barra del soporte y bájala con control hasta la parte baja del pecho, con los codos a unos 45° del torso."
   },
   {
    "title": "Press",
    "text": "Empuja la barra solo con el tren superior. Activa los abdominales para que la cadera se mantenga nivelada y sin girar."
   }
  ]
 },
 "lat-pulldown": {
  "name": "Jalón al pecho",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta los rodillos de los muslos para que las piernas queden bloqueadas. Agarra la barra con agarre prono, un poco más ancho que los hombros."
   },
   {
    "title": "Tirón",
    "text": "Inclínate un poco hacia atrás y lleva la barra a la parte alta del pecho, llevando los codos hacia las caderas."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la barra suba despacio hasta estirar los brazos y los dorsales. Mantén el torso quieto."
   }
  ]
 },
 "lateral-lunge": {
  "name": "Zancada lateral",
  "instructions": [
   {
    "title": "De pie",
    "text": "Ponte con los pies juntos, con una mancuerna en cada mano o una sola contra el pecho."
   },
   {
    "title": "Paso lateral",
    "text": "Da un paso amplio hacia un lado y lleva la cadera atrás sobre esa pierna. La otra pierna queda estirada, con los dos pies apoyados."
   },
   {
    "title": "Vuelta",
    "text": "Empuja con la pierna flexionada para volver al inicio. Alterna los lados o termina primero uno."
   }
  ]
 },
 "lateral-raise": {
  "name": "Elevaciones laterales con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con las mancuernas a los costados y los codos ligeramente flexionados."
   },
   {
    "title": "Elevación",
    "text": "Sube las pesas hasta la altura de los hombros, guiando con los codos. No te balancees ni encojas los hombros."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, en dos o tres segundos, y mantén la tensión abajo."
   }
  ]
 },
 "leg-extension": {
  "name": "Extensión de piernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Alinea las rodillas con el eje de la máquina y coloca el rodillo justo encima de los tobillos."
   },
   {
    "title": "Extensión",
    "text": "Estira las piernas por completo y aprieta los cuádriceps arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja el peso despacio sin dejarlo apoyar."
   }
  ]
 },
 "leg-press": {
  "name": "Prensa de piernas",
  "instructions": [
   {
    "title": "Pies",
    "text": "Coloca los pies a la anchura de los hombros en el centro de la plataforma, con la zona lumbar contra el respaldo."
   },
   {
    "title": "Bajada",
    "text": "Suelta el seguro y flexiona las rodillas hasta unos 90°."
   },
   {
    "title": "Press",
    "text": "Empuja la plataforma con todo el pie sin bloquear las rodillas."
   }
  ]
 },
 "leg-press-calf-raise": {
  "name": "Elevación de talones en prensa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en la prensa con la parte delantera de los pies en el borde inferior de la plataforma y los talones libres. Piernas estiradas, rodillas sin bloquear."
   },
   {
    "title": "Press",
    "text": "Empuja la plataforma estirando las puntas de los pies todo lo que puedas, sin flexionar las rodillas."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la plataforma vuelva despacio hasta estirar del todo las pantorrillas. Mantén los pies firmes en el borde."
   }
  ]
 },
 "low-to-high-cable-fly": {
  "name": "Aperturas en polea de abajo arriba",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Pon las dos poleas en la posición más baja, toma un asa en cada mano y da un paso adelante en postura de zancada."
   },
   {
    "title": "Elevación",
    "text": "Con los codos ligeramente flexionados, lleva las manos arriba y juntas hasta la altura de la parte alta del pecho, con las palmas hacia arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja los brazos despacio y ábrelos hasta notar el estiramiento en la parte alta del pecho."
   }
  ]
 },
 "lunge": {
  "name": "Zancadas con mancuernas",
  "instructions": [
   {
    "title": "De pie",
    "text": "Ponte erguido con las mancuernas a los costados."
   },
   {
    "title": "Paso",
    "text": "Da un paso largo hacia delante y baja la rodilla de atrás hacia el suelo."
   },
   {
    "title": "Vuelta",
    "text": "Empuja con el pie de delante para volver al inicio y cambia de pierna."
   }
  ]
 },
 "lying-leg-curl": {
  "name": "Curl de piernas acostado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo con las rodillas justo pasado el borde de la almohadilla, alineadas con el eje, y el rodillo justo encima de los talones."
   },
   {
    "title": "Curl",
    "text": "Lleva los talones hacia los glúteos todo lo que puedas, manteniendo la cadera pegada a la almohadilla."
   },
   {
    "title": "Bajada",
    "text": "Baja el peso despacio hasta que las piernas queden casi estiradas, sin que la pila se apoye."
   }
  ]
 },
 "lying-leg-raise": {
  "name": "Elevación de piernas acostado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con las piernas estiradas y las manos bajo la cadera o a los costados."
   },
   {
    "title": "Elevación",
    "text": "Mantén las piernas estiradas y súbelas hasta que apunten al techo. Presiona la zona lumbar contra el suelo."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas despacio y para justo antes de que los talones toquen el suelo."
   }
  ]
 },
 "machine-curl": {
  "name": "Curl de bíceps en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que los codos queden alineados con el eje de la máquina y la parte alta de los brazos descanse plana sobre la almohadilla."
   },
   {
    "title": "Curl",
    "text": "Agarra las asas y súbelas hacia los hombros sin levantar los codos de la almohadilla."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta casi estirar los brazos, manteniendo la tensión en los bíceps."
   }
  ]
 },
 "machine-high-row": {
  "name": "Remo alto en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para alcanzar las asas con los brazos estirados hacia arriba. Bloquea los muslos bajo la almohadilla."
   },
   {
    "title": "Tirón",
    "text": "Tira de las asas hacia abajo y atrás, hacia la parte baja del pecho, hasta que los codos pasen el torso."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas suban despacio hasta estirar los brazos y los dorsales."
   }
  ]
 },
 "machine-lat-pulldown": {
  "name": "Jalón al pecho en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que los rodillos de los muslos te sujeten con firmeza. Agarra las asas con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Tira de las asas hacia abajo hasta la altura de los hombros, llevando los codos hacia las caderas. Mantén el pecho arriba."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas suban despacio hasta estirar los brazos. No dejes que el peso se apoye entre repeticiones."
   }
  ]
 },
 "machine-lateral-raise": {
  "name": "Elevaciones laterales en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que los hombros queden alineados con los ejes de la máquina. Apoya los brazos contra las almohadillas."
   },
   {
    "title": "Elevación",
    "text": "Sube los brazos hacia los lados hasta la altura de los hombros, guiando con los codos. No encojas los hombros."
   },
   {
    "title": "Bajada",
    "text": "Baja las almohadillas despacio, en dos o tres segundos, y para antes de que las placas se apoyen."
   }
  ]
 },
 "machine-row": {
  "name": "Remo sentado en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas queden a la altura del pecho y apoya el pecho contra la almohadilla."
   },
   {
    "title": "Tirón",
    "text": "Tira de las asas hacia el torso, llevando los codos hacia atrás y juntando los omóplatos."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas avancen despacio hasta estirar los brazos. Mantén el pecho apoyado en la almohadilla."
   }
  ]
 },
 "meadows-row": {
  "name": "Remo Meadows",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate de lado a una barra landmine con los pies escalonados y agarra el extremo del manguito con agarre prono. Apoya el otro antebrazo en la rodilla de delante."
   },
   {
    "title": "Tirón",
    "text": "Lleva la barra hacia la cadera, subiendo el codo y un poco hacia fuera."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra hasta estirar el brazo y notar el estiramiento en el dorsal. Termina la serie y cambia de lado."
   }
  ]
 },
 "mountain-climber": {
  "name": "Mountain climber",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Empieza en plancha alta, con las manos bajo los hombros y el cuerpo en línea recta."
   },
   {
    "title": "Impulso",
    "text": "Lleva una rodilla hacia el pecho y cambia de pierna rápido, con un ritmo de carrera."
   },
   {
    "title": "Técnica",
    "text": "Mantén la cadera a la altura de los hombros y las manos firmes. Baja el ritmo antes que subir la cadera."
   }
  ]
 },
 "negative-pull-up": {
  "name": "Dominadas negativas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sube a un cajón o salta para empezar con la barbilla por encima de la barra, con las palmas hacia delante y las manos a la anchura de los hombros."
   },
   {
    "title": "Bajada",
    "text": "Baja lo más despacio que puedas, en unos 3-5 segundos, hasta estirar los brazos."
   },
   {
    "title": "Reinicio",
    "text": "Vuelve a subir al cajón y empieza la siguiente repetición desde arriba. Mantén la tensión abajo en lugar de dejarte caer."
   }
  ]
 },
 "neutral-grip-pull-up": {
  "name": "Dominadas con agarre neutro",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Agarra las asas paralelas con las palmas enfrentadas y cuelga con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Lleva los codos hacia abajo, pegados al cuerpo, hasta que la barbilla pase por encima de las asas."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos. Mantén las piernas quietas y evita balancearte."
   }
  ]
 },
 "nordic-curl": {
  "name": "Curl nórdico",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Arrodíllate sobre una almohadilla con un compañero o un soporte fijo que sujete los talones. Mantén el cuerpo recto de las rodillas a la cabeza."
   },
   {
    "title": "Bajada",
    "text": "Inclínate hacia delante lo más despacio que puedas, frenando con los isquiotibiales y manteniendo la cadera extendida."
   },
   {
    "title": "Vuelta",
    "text": "Amortigua con las manos cuando ya no aguantes más, impúlsate un poco y vuelve a subir."
   }
  ]
 },
 "one-arm-dumbbell-row": {
  "name": "Remo con mancuerna a una mano",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya una rodilla y la mano del mismo lado en un banco plano. Sujeta la mancuerna con la otra mano y la espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Lleva la mancuerna hacia la cadera, con el codo cerca del cuerpo. No gires el torso."
   },
   {
    "title": "Bajada",
    "text": "Baja la mancuerna hasta estirar el brazo y notar el estiramiento en el dorsal. Termina la serie y cambia de lado."
   }
  ]
 },
 "overhead-cable-extension": {
  "name": "Extensión de tríceps sobre la cabeza en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea baja o media. Ponte de espaldas a la pila con las piernas en zancada, inclínate un poco hacia delante y sujeta la cuerda detrás de la cabeza."
   },
   {
    "title": "Extensión",
    "text": "Estira los brazos hacia delante y arriba hasta dejarlos rectos. Mantén los codos cerca de la cabeza."
   },
   {
    "title": "Vuelta",
    "text": "Flexiona los codos despacio hasta que las manos queden detrás de la cabeza y notes el estiramiento en el tríceps."
   }
  ]
 },
 "overhead-dumbbell-extension": {
  "name": "Extensión de tríceps sobre la cabeza con mancuerna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco con respaldo y sujeta una mancuerna en vertical sobre la cabeza, con las dos manos bajo el disco de arriba y los brazos estirados."
   },
   {
    "title": "Bajada",
    "text": "Flexiona los codos para bajar la mancuerna por detrás de la cabeza. Mantén los codos apuntando al frente y cerca de la cabeza."
   },
   {
    "title": "Extensión",
    "text": "Estira los brazos para volver a subir la mancuerna sobre la cabeza. Activa los abdominales para no arquear la zona lumbar."
   }
  ]
 },
 "overhead-press": {
  "name": "Press militar con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Saca la barra del soporte a la altura de las clavículas, con las manos justo por fuera de los hombros y los antebrazos verticales. Aprieta glúteos y abdominales."
   },
   {
    "title": "Press",
    "text": "Empuja en vertical, echando la cabeza atrás para librar la barbilla, y mete la cabeza de nuevo cuando la barra pase la frente."
   },
   {
    "title": "Bajada",
    "text": "Bloquea con la barra sobre la mitad del pie y bájala con control hasta las clavículas sin inclinarte hacia atrás."
   }
  ]
 },
 "pallof-press": {
  "name": "Press Pallof",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa en D a la altura del pecho y colócate de lado a la máquina. Sujeta el asa contra el pecho con las dos manos y los pies a la anchura de los hombros."
   },
   {
    "title": "Press",
    "text": "Empuja el asa recta al frente, a la altura del pecho, y resiste el tirón del cable que te hace girar. Aguanta un segundo."
   },
   {
    "title": "Vuelta",
    "text": "Trae el asa de vuelta al pecho con control, con la cadera y los hombros mirando al frente. Cambia de lado al terminar la serie."
   }
  ]
 },
 "paused-bench-press": {
  "name": "Press de banca con pausa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate en el banco con los ojos bajo la barra. Junta los omóplatos y apoya bien los pies."
   },
   {
    "title": "Pausa",
    "text": "Baja la barra con control hasta la parte baja del pecho y mantenla ahí, inmóvil, uno o dos segundos, sin perder la tensión."
   },
   {
    "title": "Press",
    "text": "Empuja la barra desde parado, sin rebotar ni hundirte antes. Mantén los glúteos en el banco."
   }
  ]
 },
 "paused-deadlift": {
  "name": "Peso muerto con pausa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate como en un peso muerto normal: pies a la anchura de las caderas, barra sobre la mitad del pie, agarre justo por fuera de las piernas y espalda recta."
   },
   {
    "title": "Pausa",
    "text": "Despega la barra del suelo o llévala justo bajo las rodillas y aguanta 1-2 segundos. Mantén la espalda recta y la barra cerca."
   },
   {
    "title": "Final",
    "text": "Sigue subiendo hasta quedar erguido y baja la barra al suelo con control."
   }
  ]
 },
 "paused-squat": {
  "name": "Sentadilla con pausa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Saca la barra del soporte y colócala en la parte alta de la espalda, con los pies a la anchura de los hombros y las puntas ligeramente hacia fuera. Activa el core con fuerza."
   },
   {
    "title": "Pausa",
    "text": "Baja al menos hasta que los muslos queden paralelos y aguanta quieto abajo 2 segundos sin perder la tensión."
   },
   {
    "title": "Impulso",
    "text": "Sube desde abajo sin rebotar, empujando con todo el pie."
   }
  ]
 },
 "pec-deck": {
  "name": "Pec deck",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas queden a la altura del pecho. Siéntate con la espalda contra el respaldo y agarra las asas."
   },
   {
    "title": "Cierre",
    "text": "Con los codos ligeramente flexionados, junta las asas delante del pecho. Aprieta durante un segundo."
   },
   {
    "title": "Apertura",
    "text": "Deja que los brazos se abran despacio hasta notar el estiramiento en el pecho. Mantén los hombros atrás contra el respaldo."
   }
  ]
 },
 "pendlay-row": {
  "name": "Remo Pendlay",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Barra en el suelo sobre la mitad del pie. Inclínate hasta que el torso quede casi paralelo al suelo y agarra la barra con agarre prono, con la espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Tira de la barra con fuerza desde el suelo hasta la parte baja del pecho sin levantar el torso."
   },
   {
    "title": "Reinicio",
    "text": "Baja la barra al suelo y deja que se detenga del todo. Recoloca la tensión antes de cada repetición."
   }
  ]
 },
 "pendulum-squat": {
  "name": "Sentadilla péndulo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sube a la plataforma con la espalda pegada al respaldo y los hombros bajo las almohadillas. Pies a la anchura de las caderas, en el centro de la plataforma."
   },
   {
    "title": "Descenso",
    "text": "Suelta el tope y deja que el respaldo baje describiendo su arco. Baja todo lo que puedas con los talones apoyados."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie para volver a subir, manteniendo las rodillas ligeramente flexionadas arriba."
   }
  ]
 },
 "pike-push-up": {
  "name": "Flexiones pike",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Empieza en posición de flexión, acerca los pies caminando y sube la cadera para que el cuerpo forme una V invertida."
   },
   {
    "title": "Bajada",
    "text": "Flexiona los codos y baja la parte alta de la cabeza hacia el suelo, justo delante de las manos. Los codos apuntan hacia atrás, no hacia fuera."
   },
   {
    "title": "Empuje",
    "text": "Empuja hasta estirar los brazos, manteniendo la cadera alta. Apoya los pies en un cajón para hacerlo más difícil."
   }
  ]
 },
 "pin-press": {
  "name": "Press desde pines",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca los pines de seguridad del rack unos centímetros por encima del pecho y apoya la barra en ellos. Acuéstate en el banco debajo."
   },
   {
    "title": "Tensión",
    "text": "Junta los omóplatos, apoya bien los pies y agarra la barra. Ponte firme antes de que la barra deje los pines."
   },
   {
    "title": "Press",
    "text": "Empuja desde parado hasta bloquear los brazos y baja la barra de vuelta a los pines, dejando que se asiente del todo antes de la siguiente repetición."
   }
  ]
 },
 "plank": {
  "name": "Plancha",
  "instructions": [
   {
    "title": "Antebrazos",
    "text": "Codos bajo los hombros y antebrazos apoyados en el suelo."
   },
   {
    "title": "Tensión",
    "text": "Sube el cuerpo hasta formar una línea recta. Aprieta glúteos y abdominales."
   },
   {
    "title": "Aguante",
    "text": "Sigue respirando con calma y mantén la posición sin dejar que la cadera se hunda."
   }
  ]
 },
 "power-clean": {
  "name": "Power clean",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Barra sobre la mitad del pie, pies a la anchura de las caderas, agarre justo por fuera de las piernas. Caderas por encima de las rodillas, pecho arriba, espalda recta y brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Sube la barra con suavidad por encima de las rodillas y luego extiende caderas, rodillas y tobillos con fuerza y encoge los hombros, manteniendo la barra cerca."
   },
   {
    "title": "Recepción",
    "text": "Baja bajo la barra, lleva los codos hacia delante y recíbela sobre los hombros en un cuarto de sentadilla. Ponte erguido."
   }
  ]
 },
 "preacher-curl": {
  "name": "Curl predicador con barra EZ",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el banco predicador con las axilas pegadas a la parte superior de la almohadilla. Sujeta la barra con agarre supino."
   },
   {
    "title": "Curl",
    "text": "Sube la barra hasta que los antebrazos queden casi verticales. Mantén la parte trasera de los brazos en la almohadilla."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta dejar el brazo casi estirado. No dejes que la barra caiga a la posición inferior."
   }
  ]
 },
 "prone-t-raise": {
  "name": "Elevación en T boca abajo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo con los brazos abiertos a los lados en forma de T, con los pulgares hacia arriba."
   },
   {
    "title": "Elevación",
    "text": "Junta los omóplatos y despega los brazos del suelo. Mantén el cuello alargado y la vista en el suelo. Aguanta 1-2 segundos."
   },
   {
    "title": "Bajada",
    "text": "Baja los brazos despacio y relájate un momento."
   }
  ]
 },
 "prone-y-raise": {
  "name": "Elevación en Y boca abajo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo con los brazos estirados sobre la cabeza en forma de Y, con los pulgares hacia arriba. Apoya la frente en una toalla doblada."
   },
   {
    "title": "Elevación",
    "text": "Lleva los omóplatos hacia atrás y abajo y despega los brazos del suelo todo lo que puedas sin arquear la zona lumbar. Aguanta 1-2 segundos."
   },
   {
    "title": "Bajada",
    "text": "Baja los brazos despacio y relájate un momento antes de la siguiente repetición."
   }
  ]
 },
 "pull-up": {
  "name": "Dominadas",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Agarra la barra un poco más ancho que los hombros y cuelga con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Lleva los codos hacia las caderas hasta que la barbilla pase por encima de la barra o la barra llegue a la parte alta del pecho."
   },
   {
    "title": "Bajada",
    "text": "Vuelve despacio hasta estirar los brazos, sin dejarte caer abajo."
   }
  ]
 },
 "push-press": {
  "name": "Push press",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta la barra sobre las clavículas, con las manos justo por fuera de los hombros y los pies a la anchura de las caderas. Activa el core."
   },
   {
    "title": "Flexión e impulso",
    "text": "Baja unos centímetros flexionando las rodillas con el torso erguido y sube con fuerza empujando con las piernas."
   },
   {
    "title": "Press",
    "text": "Aprovecha ese impulso para empujar la barra hasta bloquear los brazos sobre la cabeza. Bájala a las clavículas amortiguando con las rodillas."
   }
  ]
 },
 "push-up": {
  "name": "Flexiones",
  "instructions": [
   {
    "title": "Plancha",
    "text": "Manos un poco más abiertas que los hombros y el cuerpo en una línea recta de la cabeza a los talones."
   },
   {
    "title": "Bajada",
    "text": "Baja el pecho hacia el suelo, con los codos a unos 45° del torso."
   },
   {
    "title": "Empuje",
    "text": "Empuja el suelo hasta estirar los brazos. No dejes que la cadera se hunda."
   }
  ]
 },
 "rack-pull": {
  "name": "Rack pull",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca la barra sobre los pines de seguridad o unos bloques justo por debajo o por encima de las rodillas. Pies a la anchura de las caderas, agarre justo por fuera de las piernas."
   },
   {
    "title": "Tensión",
    "text": "Flexiona la cadera con la espalda recta y los hombros ligeramente por delante de la barra. Toma aire y quita el juego a la barra."
   },
   {
    "title": "Levantamiento",
    "text": "Empuja la cadera hacia delante y ponte erguido, apretando los glúteos arriba. Baja la barra de vuelta a los pines con control."
   }
  ]
 },
 "reverse-crunch": {
  "name": "Crunch inverso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con los brazos a los costados, la cadera y las rodillas flexionadas a 90° y las espinillas paralelas al suelo."
   },
   {
    "title": "Curl",
    "text": "Despega la cadera del suelo con los abdominales, llevando las rodillas hacia el pecho. No balancees las piernas."
   },
   {
    "title": "Bajada",
    "text": "Baja la cadera despacio hasta el suelo, hasta que las espinillas vuelvan a quedar paralelas."
   }
  ]
 },
 "reverse-curl": {
  "name": "Curl inverso con barra",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Sujeta la barra con agarre prono, con las manos a la anchura de los hombros y los brazos estirados delante de los muslos."
   },
   {
    "title": "Curl",
    "text": "Sube la barra hasta los hombros, con los codos pegados a los costados y las muñecas rectas."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra despacio hasta estirar los brazos, sin balancear el torso."
   }
  ]
 },
 "reverse-fly": {
  "name": "Pájaros con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Flexiona la cadera hasta que el torso quede casi paralelo al suelo, con la espalda recta. Deja que las mancuernas cuelguen bajo el pecho."
   },
   {
    "title": "Elevación",
    "text": "Con los codos ligeramente flexionados, sube las pesas hacia los lados hasta alinear los brazos con los hombros. No te balancees."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio de vuelta bajo el pecho sin redondear la espalda ni incorporarte."
   }
  ]
 },
 "reverse-hack-squat": {
  "name": "Sentadilla hack inversa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate de cara a la máquina con el pecho contra el respaldo y los hombros bajo las almohadillas. Pies a la anchura de las caderas en la plataforma."
   },
   {
    "title": "Descenso",
    "text": "Suelta los seguros y lleva la cadera atrás y abajo, dejando que el torso se incline hacia delante con el respaldo."
   },
   {
    "title": "Impulso",
    "text": "Empuja con los talones y aprieta los glúteos para subir, sin bloquear las rodillas arriba."
   }
  ]
 },
 "reverse-hyperextension": {
  "name": "Hiperextensión inversa",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo en la almohadilla con la cadera en el borde y agarra las asas. Engancha los tobillos en la correa o el rodillo."
   },
   {
    "title": "Elevación",
    "text": "Aprieta los glúteos para subir las piernas hasta alinearlas con el torso. No arquees con fuerza arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas con control hasta que cuelguen rectas. Controla el balanceo en lugar de dejar que mande el impulso."
   }
  ]
 },
 "reverse-lunge": {
  "name": "Zancadas hacia atrás con mancuernas",
  "instructions": [
   {
    "title": "De pie",
    "text": "Ponte erguido con los pies a la anchura de las caderas y una mancuerna en cada mano, a los costados."
   },
   {
    "title": "Paso atrás",
    "text": "Da un paso largo hacia atrás y baja la rodilla de atrás hacia el suelo, con el torso erguido."
   },
   {
    "title": "Vuelta",
    "text": "Empuja con el talón de delante para traer el pie de atrás al inicio. Alterna las piernas o haz un lado cada vez."
   }
  ]
 },
 "reverse-pec-deck": {
  "name": "Pec deck inverso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate de cara a la almohadilla del pecho y ajusta el asiento para que las asas queden a la altura de los hombros. Agárralas con los brazos estirados al frente."
   },
   {
    "title": "Apertura",
    "text": "Con los codos ligeramente flexionados, abre los brazos hacia fuera y atrás hasta alinearlos con el torso. Mantén el pecho en la almohadilla."
   },
   {
    "title": "Vuelta",
    "text": "Trae las asas hacia delante despacio hasta que las manos vuelvan a quedar frente a ti, sin que las placas se apoyen."
   }
  ]
 },
 "reverse-snow-angel": {
  "name": "Ángel de nieve inverso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo con los brazos a los costados y las palmas hacia abajo, y despega un poco del suelo las manos y el pecho."
   },
   {
    "title": "Barrido",
    "text": "Con los brazos estirados y sin tocar el suelo, llévalos hacia los lados y por encima de la cabeza en un arco amplio."
   },
   {
    "title": "Vuelta",
    "text": "Vuelve por el mismo camino hasta las caderas, juntando los omóplatos. Eso es una repetición."
   }
  ]
 },
 "romanian-deadlift": {
  "name": "Peso muerto rumano con barra",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte erguido con la barra a la altura de las caderas y las rodillas ligeramente flexionadas."
   },
   {
    "title": "Bisagra",
    "text": "Lleva la cadera atrás y desliza la barra por los muslos hasta notar el estiramiento en los isquiotibiales."
   },
   {
    "title": "Vuelta",
    "text": "Empuja la cadera hacia delante para ponerte de pie. La espalda se mantiene recta todo el tiempo."
   }
  ]
 },
 "rope-hammer-curl": {
  "name": "Curl martillo con cuerda",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea baja. Sujeta los extremos con las palmas enfrentadas, los brazos estirados y los codos a los costados."
   },
   {
    "title": "Curl",
    "text": "Sube la cuerda hacia los hombros, con los pulgares arriba y la parte alta de los brazos quieta."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar los brazos, manteniendo el cable en tensión."
   }
  ]
 },
 "rope-pushdown": {
  "name": "Extensión de tríceps con cuerda",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una cuerda a una polea alta. Sujeta los extremos con las palmas enfrentadas y pega los codos a los costados."
   },
   {
    "title": "Empuje",
    "text": "Empuja la cuerda hacia abajo hasta estirar los brazos, separando los extremos al final."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la cuerda suba despacio hasta que los antebrazos queden justo por encima de la horizontal. Mantén los codos quietos."
   }
  ]
 },
 "rowing-machine": {
  "name": "Máquina de remo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sujeta los pies con la correa por la parte más ancha del pie. Pon el regulador de resistencia en un nivel moderado, entre 3 y 5."
   },
   {
    "title": "Palada",
    "text": "Empuja primero con las piernas, luego inclínate un poco hacia atrás y tira del asa hacia las costillas inferiores. Vuelve en orden inverso: brazos, cuerpo, piernas."
   },
   {
    "title": "Ritmo",
    "text": "Haz que la vuelta dure el doble que el empuje y mantén un ritmo constante, de unas 20 a 24 paladas por minuto para un trabajo suave."
   }
  ]
 },
 "russian-twist": {
  "name": "Giro ruso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con las rodillas flexionadas y los talones en el suelo, inclínate hacia atrás unos 45° y junta las manos delante del pecho."
   },
   {
    "title": "Giro",
    "text": "Gira el torso hacia un lado hasta que las manos queden junto a la cadera, y luego hacia el otro. Gira desde las costillas, no solo con los brazos."
   },
   {
    "title": "Control",
    "text": "Mantén el pecho arriba y la espalda recta. Despega los pies del suelo para hacerlo más difícil."
   }
  ]
 },
 "safety-bar-squat": {
  "name": "Sentadilla con barra de seguridad",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya el yugo acolchado en la parte alta de la espalda y sujeta las asas delante de ti. Pies a la anchura de los hombros."
   },
   {
    "title": "Descenso",
    "text": "Siéntate entre las caderas con el pecho arriba. Tira hacia abajo de las asas para que la barra no te incline hacia delante."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie hasta ponerte de pie, manteniendo la parte alta de la espalda firme contra las almohadillas."
   }
  ]
 },
 "seal-row": {
  "name": "Remo Seal",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo en un banco elevado lo bastante alto para que la barra cuelgue debajo a la distancia del brazo. Agárrala con agarre prono, a la anchura de los hombros."
   },
   {
    "title": "Tirón",
    "text": "Sube la barra hasta la parte inferior del banco, llevando los codos hacia atrás. Mantén el pecho y la cadera en el banco."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra despacio hasta estirar los brazos y deja que los omóplatos se separen. Sin patadas ni balanceos."
   }
  ]
 },
 "seated-barbell-press": {
  "name": "Press de hombros sentado con barra",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca un banco vertical en un rack con la barra justo por debajo de la altura de los hombros estando sentado. Siéntate con la espalda contra el respaldo."
   },
   {
    "title": "Press",
    "text": "Saca la barra con las manos justo por fuera de los hombros y empuja en vertical, echando la cabeza un poco atrás para dejar pasar la barra."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra con control hasta la parte alta del pecho. Mantén la espalda contra el respaldo sin arquearla."
   }
  ]
 },
 "seated-cable-row": {
  "name": "Remo sentado en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un agarre en V a la polea baja. Siéntate con los pies en la plataforma, las rodillas suaves, y sujeta el agarre con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Ponte erguido y lleva el agarre hacia el abdomen, con los codos cerca del cuerpo y juntando los omóplatos."
   },
   {
    "title": "Vuelta",
    "text": "Deja que los brazos se extiendan despacio hasta estirarlos. Inclínate hacia delante solo un poco y no redondees la espalda."
   }
  ]
 },
 "seated-calf-raise": {
  "name": "Elevación de talones sentado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con la parte delantera de los pies en el borde de la plataforma y la almohadilla de las rodillas ajustada sobre la parte baja de los muslos."
   },
   {
    "title": "Subida",
    "text": "Suelta el seguro y empuja de puntillas todo lo que puedas. Haz una breve pausa arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja los talones despacio por debajo de la plataforma para estirar por completo, sin rebotar."
   }
  ]
 },
 "seated-dumbbell-curl": {
  "name": "Curl sentado con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Siéntate erguido en el borde de un banco con los pies apoyados y las mancuernas a los costados, con los codos cerca del cuerpo."
   },
   {
    "title": "Curl",
    "text": "Flexiona los codos y sube las pesas hacia los hombros sin inclinarte hacia atrás."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar de nuevo los brazos."
   }
  ]
 },
 "seated-dumbbell-hammer-curl": {
  "name": "Curl martillo sentado con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Siéntate erguido en el borde de un banco con los pies apoyados y las mancuernas a los costados, con las palmas hacia el cuerpo y los codos cerca del torso."
   },
   {
    "title": "Curl",
    "text": "Sube las mancuernas con los pulgares arriba hasta que los antebrazos queden casi verticales. No te inclines hacia atrás."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, manteniendo el agarre neutro, hasta estirar de nuevo los brazos."
   }
  ]
 },
 "seated-dumbbell-lateral-raise": {
  "name": "Elevaciones laterales sentado con mancuernas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Siéntate erguido en el borde de un banco con los pies apoyados, las mancuernas a los costados y los codos ligeramente flexionados."
   },
   {
    "title": "Elevación",
    "text": "Sube las pesas hasta la altura de los hombros, guiando con los codos. No te inclines ni encojas los hombros."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio, en dos o tres segundos, y mantén la tensión abajo."
   }
  ]
 },
 "seated-dumbbell-rear-delt-fly": {
  "name": "Pájaros sentado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el borde de un banco con los pies apoyados e inclínate hacia delante hasta tener el pecho cerca de los muslos, con la espalda recta. Deja que las mancuernas cuelguen junto a las pantorrillas."
   },
   {
    "title": "Elevación",
    "text": "Con los codos ligeramente flexionados, sube las pesas hacia los lados hasta alinear los brazos con los hombros. No te balancees."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio sin redondear la espalda ni incorporarte."
   }
  ]
 },
 "seated-dumbbell-shoulder-press": {
  "name": "Press de hombros sentado con mancuernas",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco con el respaldo casi vertical, la espalda apoyada y los pies firmes. Sujeta las pesas a la altura de los hombros, con las muñecas alineadas sobre los codos."
   },
   {
    "title": "Press",
    "text": "Empuja en vertical hasta bloquear los brazos sobre la cabeza. Mantén la cadera y la espalda en el banco."
   },
   {
    "title": "Bajada",
    "text": "Vuelve a la altura de los hombros con control, sin arquear la zona lumbar."
   }
  ]
 },
 "seated-leg-curl": {
  "name": "Curl de piernas sentado",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate con las rodillas alineadas con el eje, el rodillo inferior justo encima de los talones y la almohadilla de los muslos bien fijada."
   },
   {
    "title": "Curl",
    "text": "Lleva los talones hacia abajo y atrás, bajo el asiento, todo lo que puedas, inclinando un poco el torso hacia delante."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el rodillo suba despacio hasta que las piernas queden casi estiradas, manteniendo la tensión arriba."
   }
  ]
 },
 "seated-leg-press": {
  "name": "Prensa de piernas sentado",
  "instructions": [
   {
    "title": "Pies",
    "text": "Siéntate con la espalda contra el respaldo y coloca los pies a la anchura de los hombros en el centro de la plataforma. Sujeta las asas laterales."
   },
   {
    "title": "Press",
    "text": "Empuja con todo el pie hasta casi estirar las piernas, sin bloquear las rodillas."
   },
   {
    "title": "Bajada",
    "text": "Flexiona las rodillas despacio de vuelta hasta unos 90°."
   }
  ]
 },
 "seated-shoulder-press": {
  "name": "Press de hombros en máquina",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que las asas queden a la altura de los hombros o un poco por debajo. Siéntate con la espalda recta contra el respaldo."
   },
   {
    "title": "Press",
    "text": "Empuja las asas hacia arriba hasta casi estirar los brazos. No encojas los hombros ni te despegues del respaldo."
   },
   {
    "title": "Bajada",
    "text": "Baja las asas despacio hasta la altura de los hombros y para justo antes de que las placas se apoyen."
   }
  ]
 },
 "side-plank": {
  "name": "Plancha lateral",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate de lado con el codo bajo el hombro y los pies apilados."
   },
   {
    "title": "Elevación",
    "text": "Sube la cadera hasta que el cuerpo forme una línea recta de la cabeza a los talones. Mantén las caderas apiladas, sin girar hacia delante."
   },
   {
    "title": "Aguante",
    "text": "Respira con calma y aguanta sin dejar caer la cadera. Luego cambia de lado y aguanta el mismo tiempo."
   }
  ]
 },
 "single-arm-cable-row": {
  "name": "Remo en polea a una mano",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa simple a una polea baja o a la altura del pecho. Siéntate o ponte de pie de cara a ella y sujeta el asa con un brazo estirado."
   },
   {
    "title": "Tirón",
    "text": "Lleva el asa hacia el costado, llevando el codo hacia atrás por detrás del torso. Mantén los hombros mirando al frente."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el brazo avance despacio para estirar por completo. Termina la serie y cambia de brazo."
   }
  ]
 },
 "single-arm-dumbbell-press": {
  "name": "Press de hombros con mancuerna a una mano",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte erguido, de pie o sentado, con una mancuerna a la altura del hombro y la muñeca alineada sobre el codo. Activa abdominales y glúteos."
   },
   {
    "title": "Press",
    "text": "Empuja la mancuerna en vertical hasta extender el brazo por completo. No te inclines hacia el otro lado."
   },
   {
    "title": "Bajada",
    "text": "Baja la pesa a la altura del hombro con control. Haz todas las repeticiones de un lado y luego cambia."
   }
  ]
 },
 "single-arm-lat-pulldown": {
  "name": "Jalón al pecho a una mano",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa simple a una polea alta. Siéntate o arrodíllate y sujétala con un brazo estirado sobre la cabeza."
   },
   {
    "title": "Tirón",
    "text": "Lleva el codo hacia el costado hasta que la mano quede junto al hombro. No gires el torso."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el brazo suba despacio y siente el estiramiento a lo largo del costado. Haz todas las repeticiones y cambia de brazo."
   }
  ]
 },
 "single-arm-pushdown": {
  "name": "Extensión de tríceps en polea a una mano",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha un asa en D a una polea alta. Agárrala con una mano y pega ese codo al costado."
   },
   {
    "title": "Empuje",
    "text": "Empuja el asa hacia abajo hasta estirar del todo el brazo. Aprieta el tríceps abajo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que el asa suba despacio hasta que el antebrazo quede justo por encima de la horizontal. Cambia de brazo al terminar la serie."
   }
  ]
 },
 "single-leg-calf-raise": {
  "name": "Elevación de talones a una pierna",
  "instructions": [
   {
    "title": "Posición",
    "text": "Ponte sobre un pie con la parte delantera apoyada en el borde de un escalón, con una mancuerna en la mano del mismo lado si quieres. Agárrate con la mano libre."
   },
   {
    "title": "Subida",
    "text": "Sube de puntillas todo lo que puedas con la pierna estirada y haz una breve pausa."
   },
   {
    "title": "Bajada",
    "text": "Baja el talón despacio por debajo del escalón para estirar por completo. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "single-leg-glute-bridge": {
  "name": "Puente de glúteo a una pierna",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con un pie apoyado cerca de los glúteos y la otra pierna estirada o recogida hacia el pecho."
   },
   {
    "title": "Elevación",
    "text": "Empuja con el talón apoyado en el suelo y sube la cadera hasta que quede nivelada y alineada con la rodilla."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio sin dejar que la cadera se incline. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "single-leg-press": {
  "name": "Prensa de piernas a una pierna",
  "instructions": [
   {
    "title": "Pie",
    "text": "Coloca un pie en el centro de la plataforma, alineado con la cadera. Apoya el otro pie en el suelo o en la estructura."
   },
   {
    "title": "Bajada",
    "text": "Suelta el seguro y flexiona la rodilla despacio hasta unos 90°, manteniendo la cadera en el asiento."
   },
   {
    "title": "Press",
    "text": "Empuja con todo el pie sin bloquear la rodilla. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "single-leg-romanian-deadlift": {
  "name": "Peso muerto rumano a una pierna",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Ponte sobre una pierna con la rodilla suave, sujetando una mancuerna en la mano contraria."
   },
   {
    "title": "Bisagra",
    "text": "Inclínate hacia delante desde la cadera mientras la pierna libre se extiende hacia atrás, hasta que el torso quede casi paralelo al suelo. Mantén la cadera mirando al frente."
   },
   {
    "title": "Vuelta",
    "text": "Empuja la cadera de apoyo hacia delante para ponerte erguido de nuevo. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "sissy-squat": {
  "name": "Sentadilla sissy",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Agárrate a un poste o a un banco de sentadilla sissy para mantener el equilibrio y sube de puntillas, con los pies a la anchura de las caderas."
   },
   {
    "title": "Inclinación atrás",
    "text": "Lleva las rodillas hacia delante y abajo mientras te inclinas hacia atrás, manteniendo una línea recta de las rodillas a los hombros."
   },
   {
    "title": "Vuelta",
    "text": "Aprieta los cuádriceps para volver a subir, manteniendo la cadera extendida todo el tiempo."
   }
  ]
 },
 "sit-up": {
  "name": "Sit-up",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados, sujetos bajo una almohadilla si hace falta. Cruza los brazos sobre el pecho."
   },
   {
    "title": "Subida",
    "text": "Enrolla el torso hacia arriba vértebra a vértebra hasta tener el pecho cerca de los muslos."
   },
   {
    "title": "Bajada",
    "text": "Vuelve a bajar rodando despacio hasta que los hombros toquen el suelo. No rebotes en el suelo para tomar impulso."
   }
  ]
 },
 "smith-bench-press": {
  "name": "Press de banca en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca un banco plano bajo la barra para que quede alineada con la parte baja del pecho. Pon los topes de seguridad justo por debajo de la altura del pecho."
   },
   {
    "title": "Bajada",
    "text": "Agarra un poco más ancho que los hombros, gira la barra para soltarla de los ganchos y bájala con control hasta la parte baja del pecho."
   },
   {
    "title": "Press",
    "text": "Empuja la barra en vertical hasta casi estirar los brazos. Mantén los omóplatos atrás y los glúteos en el banco."
   }
  ]
 },
 "smith-calf-raise": {
  "name": "Elevación de talones en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte sobre un escalón o un disco bajo la barra Smith, con la barra en la parte alta de la espalda y la parte delantera de los pies en el borde."
   },
   {
    "title": "Subida",
    "text": "Suelta la barra de los ganchos y sube de puntillas todo lo que puedas, con las piernas estiradas. Haz una breve pausa arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja los talones despacio por debajo del borde para estirar por completo. Engancha la barra tras la última repetición."
   }
  ]
 },
 "smith-close-grip-bench-press": {
  "name": "Press de banca con agarre cerrado en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca un banco plano bajo la barra para que quede alineada con la parte baja del pecho. Agarra la barra a la anchura de los hombros más o menos."
   },
   {
    "title": "Bajada",
    "text": "Gira la barra para soltarla de los ganchos y bájala hasta la parte baja del pecho, con los codos pegados a los costados."
   },
   {
    "title": "Press",
    "text": "Empuja hasta estirar los brazos, impulsando con los tríceps. Mantén las muñecas alineadas sobre los codos."
   }
  ]
 },
 "smith-incline-bench-press": {
  "name": "Press inclinado en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca un banco inclinado a 30-45° bajo la barra para que quede alineada con la parte alta del pecho. Pon los topes de seguridad justo por debajo de la altura del pecho."
   },
   {
    "title": "Bajada",
    "text": "Gira la barra para soltarla de los ganchos y bájala con control hasta la parte alta del pecho, justo bajo las clavículas."
   },
   {
    "title": "Press",
    "text": "Empuja la barra en vertical hasta casi estirar los brazos. Mantén los omóplatos atrás contra el banco."
   }
  ]
 },
 "smith-lunge": {
  "name": "Zancadas en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca la barra en la parte alta de la espalda, suéltala de los ganchos y adopta una postura de zancada: un pie delante y el talón de atrás elevado."
   },
   {
    "title": "Bajada",
    "text": "Baja la rodilla de atrás en vertical hacia el suelo hasta que el muslo de delante quede casi paralelo."
   },
   {
    "title": "Impulso",
    "text": "Empuja con el pie de delante para subir sin bloquear del todo. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "smith-shoulder-press": {
  "name": "Press de hombros en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca un banco vertical bajo la máquina Smith para que la barra pase justo delante de tu cara. Siéntate con la espalda en el respaldo."
   },
   {
    "title": "Press",
    "text": "Gira la barra para soltarla de los ganchos, con las manos justo por fuera de los hombros, y empuja hasta casi estirar los brazos."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra con control hasta la altura de la barbilla o un poco por debajo. Mantén la espalda contra el respaldo y los abdominales firmes."
   }
  ]
 },
 "smith-squat": {
  "name": "Sentadilla en máquina Smith",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Coloca la barra en la parte alta de la espalda y pon los pies a la anchura de los hombros, un poco por delante de la barra."
   },
   {
    "title": "Descenso",
    "text": "Gira la barra para soltarla de los ganchos y baja hasta que los muslos queden al menos paralelos, con la espalda recta."
   },
   {
    "title": "Impulso",
    "text": "Sube empujando con todo el pie y gira la barra para engancharla de nuevo tras la última repetición."
   }
  ]
 },
 "snatch": {
  "name": "Arrancada",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Usa un agarre ancho para que la barra quede en el pliegue de la cadera estando de pie. Barra sobre la mitad del pie, cadera baja, pecho arriba y espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Sube la barra por encima de las rodillas, luego extiende caderas, rodillas y tobillos con fuerza y lleva la barra arriba pegada al cuerpo."
   },
   {
    "title": "Recepción",
    "text": "Métete bajo la barra y empújala sobre la cabeza, recibiéndola en una sentadilla profunda con los brazos bloqueados. Ponte de pie con la barra sobre la cabeza."
   }
  ]
 },
 "spider-curl": {
  "name": "Curl araña",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate con el pecho sobre un banco inclinado a unos 45°, con el pecho en el borde superior y los brazos colgando rectos hacia abajo."
   },
   {
    "title": "Curl",
    "text": "Sube las mancuernas mientras la parte alta de los brazos se mantiene vertical. Aprieta fuerte arriba."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta estirar de nuevo los brazos. Mantén el pecho en el banco durante toda la serie."
   }
  ]
 },
 "split-squat": {
  "name": "Sentadilla dividida",
  "instructions": [
   {
    "title": "Postura",
    "text": "Da un paso largo en postura de zancada con una mancuerna en cada mano: pie de delante apoyado y talón de atrás elevado."
   },
   {
    "title": "Bajada",
    "text": "Sin mover los pies, baja la rodilla de atrás en vertical hasta casi tocar el suelo."
   },
   {
    "title": "Impulso",
    "text": "Empuja con el pie de delante para subir, con el torso erguido. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "spoto-press": {
  "name": "Press Spoto",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate como en tu press de banca normal: ojos bajo la barra, omóplatos juntos y pies apoyados."
   },
   {
    "title": "Pausa",
    "text": "Baja la barra con control y detén la barra 2-3 cm por encima del pecho. Aguanta ahí uno o dos segundos sin tocar."
   },
   {
    "title": "Press",
    "text": "Empuja desde esa posición sin hundirte antes. Mantén el mismo recorrido de la barra y la misma posición de los codos que en tu press de banca normal."
   }
  ]
 },
 "squat": {
  "name": "Sentadilla trasera",
  "instructions": [
   {
    "title": "Postura",
    "text": "Pies a la anchura de los hombros más o menos, con las puntas ligeramente hacia fuera. Activa el core."
   },
   {
    "title": "Descenso",
    "text": "Siéntate entre las caderas, con las rodillas siguiendo la línea de los pies y el pecho arriba."
   },
   {
    "title": "Impulso",
    "text": "Empuja con todo el pie hasta ponerte de pie una vez que los muslos lleguen al paralelo o más abajo."
   }
  ]
 },
 "stair-climber": {
  "name": "Escaladora",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Sube a los escalones, sujeta las barandillas laterales con suavidad y empieza a una velocidad baja."
   },
   {
    "title": "Subida",
    "text": "Apoya todo el pie en cada escalón y mantente erguido. No te apoyes ni te cuelgues de las barandillas."
   },
   {
    "title": "Ritmo",
    "text": "Sube la velocidad solo hasta donde puedas mantener una buena postura. En un calentamiento deberías poder hablar."
   }
  ]
 },
 "standing-leg-curl": {
  "name": "Curl de piernas de pie",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate de cara a la máquina con la cadera contra la almohadilla y el rodillo justo encima del talón de la pierna que trabaja."
   },
   {
    "title": "Curl",
    "text": "Lleva el talón hacia los glúteos mientras el muslo se mantiene vertical y la cadera pegada a la almohadilla."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio hasta que la pierna quede casi estirada. Haz todas las repeticiones y cambia de pierna."
   }
  ]
 },
 "step-up": {
  "name": "Step-up",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate de cara a un cajón o banco a la altura de la rodilla con una mancuerna en cada mano. Apoya un pie entero encima."
   },
   {
    "title": "Subida",
    "text": "Empuja con el talón sobre el cajón para subir, sin impulsarte con el pie de atrás."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio con la misma pierna. Haz todas las repeticiones y cambia de lado."
   }
  ]
 },
 "stiff-leg-deadlift": {
  "name": "Peso muerto con piernas rígidas",
  "instructions": [
   {
    "title": "Inicio",
    "text": "Colócate con la barra sobre la mitad del pie y las piernas casi estiradas, con las rodillas solo ligeramente flexionadas."
   },
   {
    "title": "Bajada",
    "text": "Flexiona la cadera con la espalda recta y baja la barra hacia el suelo hasta estirar por completo los isquiotibiales."
   },
   {
    "title": "Levantamiento",
    "text": "Mantén las rodillas casi rectas y empuja la cadera hacia delante para ponerte de pie, con la barra cerca de las piernas."
   }
  ]
 },
 "straight-arm-pulldown": {
  "name": "Jalón con brazos rectos",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una barra recta o una cuerda a una polea alta. Da un paso atrás, inclínate un poco y sujétala a la altura de los ojos con los brazos estirados."
   },
   {
    "title": "Tirón",
    "text": "Con los codos casi bloqueados, lleva la barra hacia abajo en un arco hasta los muslos. Aprieta los dorsales."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la barra suba despacio hasta la altura de los ojos sin flexionar los codos ni encoger los hombros."
   }
  ]
 },
 "sumo-deadlift": {
  "name": "Peso muerto sumo",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Adopta una postura ancha con las puntas de los pies hacia fuera y las espinillas cerca de la barra. Agárrala por dentro de las rodillas, con los brazos colgando rectos."
   },
   {
    "title": "Tensión",
    "text": "Empuja las rodillas hacia fuera, sobre los pies, con el pecho arriba y la espalda recta. Toma aire y quita el juego a la barra."
   },
   {
    "title": "Levantamiento",
    "text": "Empuja el suelo hacia los lados con los pies y ponte de pie, llevando la cadera hacia delante. Baja la barra de la misma forma, cerca de las piernas."
   }
  ]
 },
 "sumo-squat": {
  "name": "Sentadilla sumo",
  "instructions": [
   {
    "title": "Postura",
    "text": "Colócate con los pies mucho más abiertos que los hombros y las puntas hacia fuera, a unos 45°. Sujeta una mancuerna entre las piernas."
   },
   {
    "title": "Descenso",
    "text": "Baja en vertical con el torso erguido, empujando las rodillas hacia fuera en línea con los pies."
   },
   {
    "title": "Impulso",
    "text": "Vuelve a subir empujando con los talones y aprieta los glúteos arriba."
   }
  ]
 },
 "superman": {
  "name": "Superman",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo con los brazos estirados al frente y las piernas rectas."
   },
   {
    "title": "Elevación",
    "text": "Aprieta los glúteos y la zona lumbar para despegar del suelo los brazos, el pecho y los muslos. Aguanta 1-2 segundos."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio y relájate un momento. Mira al suelo para mantener el cuello neutro."
   }
  ]
 },
 "t-bar-row": {
  "name": "Remo en T",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate a horcajadas sobre la barra, con un extremo anclado. Pon un agarre en V debajo, junto a los discos, e inclínate hasta unos 45° con la espalda recta."
   },
   {
    "title": "Tirón",
    "text": "Sube el peso hacia el pecho, llevando los codos hacia atrás y juntando los omóplatos."
   },
   {
    "title": "Bajada",
    "text": "Baja el peso despacio hasta estirar los brazos. Mantén el ángulo del torso y no subas el peso a tirones."
   }
  ]
 },
 "tibialis-raise": {
  "name": "Elevación de tibial",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya la espalda en una pared con los talones a unos 30 cm por delante, con las piernas estiradas."
   },
   {
    "title": "Elevación",
    "text": "Sube las puntas de los pies hacia las espinillas todo lo que puedas, manteniendo los talones en el suelo."
   },
   {
    "title": "Bajada",
    "text": "Baja las puntas despacio hasta casi tocar el suelo y pasa directo a la siguiente repetición."
   }
  ]
 },
 "toes-to-bar": {
  "name": "Toes to bar",
  "instructions": [
   {
    "title": "Suspensión",
    "text": "Cuélgate de una barra de dominadas con agarre prono, un poco más ancho que los hombros, y los brazos estirados."
   },
   {
    "title": "Elevación",
    "text": "Empuja la barra hacia abajo con los brazos estirados, activa los abdominales y sube los pies hasta tocar la barra con las puntas, entre las manos."
   },
   {
    "title": "Bajada",
    "text": "Baja las piernas con control y frena el balanceo antes de la siguiente repetición."
   }
  ]
 },
 "torso-rotation-machine": {
  "name": "Máquina de rotación de torso",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en la máquina con la cadera bloqueada y el pecho contra la almohadilla. Pon el ángulo de inicio hacia un lado."
   },
   {
    "title": "Giro",
    "text": "Gira el torso hacia el otro lado con los oblicuos, manteniendo la cadera mirando al frente."
   },
   {
    "title": "Vuelta",
    "text": "Vuelve despacio a la posición inicial. Haz todas las repeticiones y ajusta la máquina para el otro lado."
   }
  ]
 },
 "trap-bar-deadlift": {
  "name": "Peso muerto con barra hexagonal",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Colócate en el centro de la barra hexagonal, con los pies a la anchura de las caderas. Agarra el centro de las asas, con los brazos estirados a los costados."
   },
   {
    "title": "Tensión",
    "text": "Flexiona caderas y rodillas, con el pecho arriba y la espalda recta. Toma aire y activa el core."
   },
   {
    "title": "Levantamiento",
    "text": "Empuja con todo el pie y extiende caderas y rodillas a la vez hasta ponerte erguido. Baja la barra con control."
   }
  ]
 },
 "treadmill": {
  "name": "Cinta de correr",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ponte con los pies en los bordes laterales, engancha la llave de seguridad a tu ropa y empieza a una velocidad baja."
   },
   {
    "title": "Movimiento",
    "text": "Camina o corre erguido por el centro de la cinta con los brazos relajados. Agárrate a las barandillas solo para subir y bajar."
   },
   {
    "title": "Ritmo",
    "text": "Elige una velocidad y una inclinación que puedas mantener. En un calentamiento deberías poder hablar con frases completas."
   }
  ]
 },
 "triceps-extension-machine": {
  "name": "Máquina de extensión de tríceps",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Ajusta el asiento para que los codos queden alineados con el eje de la máquina y apoya la parte alta de los brazos en la almohadilla."
   },
   {
    "title": "Extensión",
    "text": "Empuja las asas hasta estirar los brazos. Mantén los codos en la almohadilla."
   },
   {
    "title": "Vuelta",
    "text": "Deja que las asas vuelvan despacio hasta que los codos queden flexionados a unos 90°, manteniendo la tensión en el tríceps."
   }
  ]
 },
 "triceps-pushdown": {
  "name": "Extensión de tríceps en polea",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una barra recta a una polea alta. Agárrala con agarre prono a la anchura de los hombros más o menos y pega los codos a los costados."
   },
   {
    "title": "Empuje",
    "text": "Empuja la barra hacia abajo hasta estirar del todo los brazos. Aprieta el tríceps abajo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la barra suba despacio hasta que los antebrazos queden justo por encima de la horizontal. Mantén quietos los codos y el torso."
   }
  ]
 },
 "underhand-barbell-row": {
  "name": "Remo con barra y agarre supino",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Agarra la barra con agarre supino a la anchura de los hombros e inclínate hacia delante hasta unos 45° con la espalda recta y las rodillas suaves."
   },
   {
    "title": "Tirón",
    "text": "Lleva la barra hacia el ombligo, con los codos cerca de los costados."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra despacio hasta estirar los brazos. Mantén las muñecas rectas y no lo conviertas en un curl."
   }
  ]
 },
 "underhand-lat-pulldown": {
  "name": "Jalón al pecho con agarre supino",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Agarra la barra con las palmas hacia ti, a la anchura de los hombros más o menos, y siéntate con los muslos bajo los rodillos."
   },
   {
    "title": "Tirón",
    "text": "Lleva la barra a la parte alta del pecho, con los codos cerca y delante del cuerpo."
   },
   {
    "title": "Vuelta",
    "text": "Deja que la barra suba despacio hasta estirar del todo los brazos. No te balancees hacia atrás para mover el peso."
   }
  ]
 },
 "upright-row": {
  "name": "Remo al mentón con barra",
  "instructions": [
   {
    "title": "Agarre",
    "text": "Sujeta la barra con las manos a la anchura de los hombros más o menos, con los brazos colgando estirados."
   },
   {
    "title": "Tirón",
    "text": "Guía con los codos y sube la barra hasta la altura de la parte baja del pecho. Los codos se mantienen por encima de las manos."
   },
   {
    "title": "Bajada",
    "text": "Baja la barra con control. Sube menos si sientes pinzamiento en los hombros."
   }
  ]
 },
 "walking-lunge": {
  "name": "Zancadas caminando con mancuernas",
  "instructions": [
   {
    "title": "De pie",
    "text": "Ponte erguido con una mancuerna en cada mano a los costados y mucho espacio por delante."
   },
   {
    "title": "Paso",
    "text": "Da un paso largo hacia delante y baja la rodilla de atrás hasta justo encima del suelo, con la espinilla de delante casi vertical."
   },
   {
    "title": "Marcha",
    "text": "Empuja con el talón de delante y lleva el pie de atrás directo al siguiente paso. Alterna las piernas."
   }
  ]
 },
 "wall-sit": {
  "name": "Sentadilla en pared",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Apoya la espalda plana contra una pared y camina con los pies hacia delante, a la anchura de las caderas."
   },
   {
    "title": "Aguante",
    "text": "Desliza el cuerpo hacia abajo hasta que los muslos queden paralelos al suelo, con las rodillas sobre los tobillos. Aguanta todo el tiempo."
   },
   {
    "title": "Técnica",
    "text": "Mantén la espalda y la cabeza en la pared y las manos fuera de los muslos. Respira con calma."
   }
  ]
 },
 "wide-grip-cable-row": {
  "name": "Remo en polea con agarre ancho",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Engancha una barra larga a la polea baja. Siéntate con los pies en la plataforma y las rodillas suaves, y agarra la barra ancha con agarre prono."
   },
   {
    "title": "Tirón",
    "text": "Lleva la barra a la parte baja del pecho con los codos apuntando hacia los lados. Aprieta la parte alta de la espalda."
   },
   {
    "title": "Vuelta",
    "text": "Deja que los brazos se extiendan despacio hasta estirarlos, con el torso erguido y quieto."
   }
  ]
 },
 "wrist-curl": {
  "name": "Curl de muñeca",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en un banco y apoya los antebrazos en los muslos, con las palmas hacia arriba y las muñecas justo pasadas las rodillas."
   },
   {
    "title": "Curl",
    "text": "Sujeta las mancuernas y flexiona las muñecas hacia arriba todo lo que puedas. Mantén los antebrazos sobre los muslos."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio y deja que rueden hasta las yemas de los dedos para estirar por completo."
   }
  ]
 },
 "y-raise": {
  "name": "Elevación en Y",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Acuéstate boca abajo en un banco inclinado a 30-45°, con una mancuerna ligera en cada mano, los brazos colgando y los pulgares hacia arriba."
   },
   {
    "title": "Elevación",
    "text": "Sube los brazos hacia delante y fuera formando una Y, hasta alinearlos con el cuerpo. Mantén los hombros abajo, lejos de las orejas."
   },
   {
    "title": "Bajada",
    "text": "Baja las mancuernas despacio. Usa pesas ligeras: la palanca larga lo hace más difícil de lo que parece."
   }
  ]
 },
 "z-press": {
  "name": "Z press",
  "instructions": [
   {
    "title": "Preparación",
    "text": "Siéntate en el suelo dentro de un rack con las piernas estiradas al frente. Ajusta los ganchos para poder sacar la barra a la altura de las clavículas."
   },
   {
    "title": "Tensión",
    "text": "Siéntate erguido sin inclinarte hacia atrás y activa los abdominales con fuerza. Nada apoya tu espalda, así que el tronco debe mantenerse rígido."
   },
   {
    "title": "Press",
    "text": "Empuja la barra en vertical hasta bloquear, echando la cabeza un poco atrás para dejarla pasar, y bájala con control."
   }
  ]
 },
 "zottman-curl": {
  "name": "Curl Zottman",
  "instructions": [
   {
    "title": "Curl",
    "text": "Sujeta las mancuernas a los costados, con las palmas hacia delante. Súbelas hasta los hombros con los codos pegados a los costados."
   },
   {
    "title": "Giro",
    "text": "Arriba, gira las muñecas para que las palmas miren hacia abajo. Mantén los codos quietos."
   },
   {
    "title": "Bajada",
    "text": "Baja despacio con las palmas hacia abajo hasta estirar los brazos y gira de nuevo las palmas hacia delante."
   }
  ]
 }
}$es$::jsonb) as v (key, value)
where e.id = v.key;

update public.equipment e set name = e.name || jsonb_build_object('fr', v.value)
from jsonb_each($fr${
 "ab-wheel": "Roulette abdominale",
 "barbell": "Barre",
 "bench": "Banc",
 "bodyweight": "Poids du corps",
 "box": "Box ou marche",
 "cable": "Poulie",
 "decline-bench": "Banc décliné",
 "dip-bars": "Barres de dips",
 "dumbbell": "Haltères",
 "ez-bar": "Barre EZ",
 "jump-rope": "Corde à sauter",
 "kettlebell": "Kettlebell",
 "landmine": "Landmine",
 "leg-curl-extension": "Leg extension / curl",
 "machine": "Machine",
 "platform": "Plateforme d'haltérophilie",
 "preacher-bench": "Pupitre à biceps",
 "pull-up-bar": "Barre de traction",
 "rack": "Rack à squat",
 "safety-bar": "Safety bar",
 "smith-machine": "Smith machine",
 "trap-bar": "Trap bar"
}$fr$::jsonb) as v (key, value)
where e.id = v.key;

update public.exercises e
set name = e.name || jsonb_build_object('fr', v.value -> 'name'),
  instructions = e.instructions || jsonb_build_object('fr', v.value -> 'instructions')
from jsonb_each($fr${
 "ab-crunch-machine": {
  "name": "Crunch à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les coussins reposent sur ta poitrine ou tes épaules. Attrape les poignées et cale tes pieds."
   },
   {
    "title": "Crunch",
    "text": "Enroule ton buste vers l'avant et le bas en contractant les abdos. Ne tire pas avec les bras et ne pousse pas avec les jambes."
   },
   {
    "title": "Retour",
    "text": "Laisse la charge remonter lentement jusqu'à ce que tu sois de nouveau droit, sans poser les plaques."
   }
  ]
 },
 "ab-wheel-rollout": {
  "name": "Roulette abdominale",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi à genoux sur un tapis et tiens la roulette sous tes épaules. Gaine les abdos et rentre légèrement le bassin."
   },
   {
    "title": "Avancée",
    "text": "Fais rouler la roue vers l'avant lentement, aussi loin que possible sans creuser le bas du dos."
   },
   {
    "title": "Retour",
    "text": "Ramène la roue vers tes genoux avec les abdos, pas avec les hanches. Garde les bras tendus."
   }
  ]
 },
 "air-bike": {
  "name": "Air bike",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle la selle pour que ton genou reste légèrement fléchi en bas du pédalage, et attrape les poignées mobiles."
   },
   {
    "title": "Mouvement",
    "text": "Pousse et tire les poignées en pédalant pour faire travailler bras et jambes ensemble. Plus tu vas vite, plus la résistance augmente."
   },
   {
    "title": "Rythme",
    "text": "Commence doucement et monte en intensité. En fractionné, donne tout pendant l'effort, puis pédale tranquillement jusqu'à ce que ta respiration se calme."
   }
  ]
 },
 "arnold-press": {
  "name": "Développé Arnold",
  "instructions": [
   {
    "title": "Départ",
    "text": "Assis ou debout, tiens les haltères devant les épaules, paumes face à toi et coudes devant le corps."
   },
   {
    "title": "Rotation et poussée",
    "text": "Pousse vers le haut en tournant les paumes vers l'extérieur, pour qu'elles soient face à l'avant quand tes bras sont tendus au-dessus de la tête."
   },
   {
    "title": "Descente",
    "text": "Inverse le mouvement lentement, en ramenant les paumes vers toi pendant que les haltères redescendent devant les épaules."
   }
  ]
 },
 "assisted-dip-machine": {
  "name": "Dips assistés à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Choisis le contrepoids : plus il est lourd, plus tu es aidé. Mets-toi à genoux sur le coussin ou debout sur la plateforme et attrape les poignées de dips, bras tendus."
   },
   {
    "title": "Descente",
    "text": "Plie les coudes et descends jusqu'à ce que tes bras soient à peu près parallèles au sol, poitrine légèrement penchée en avant."
   },
   {
    "title": "Poussée",
    "text": "Remonte jusqu'à avoir les bras tendus. Réduis le contrepoids au fil du temps à mesure que tu progresses."
   }
  ]
 },
 "assisted-pull-up-machine": {
  "name": "Tractions assistées à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Choisis le contrepoids : plus il est lourd, plus tu es aidé. Mets-toi à genoux sur le coussin ou debout sur la plateforme et attrape les poignées."
   },
   {
    "title": "Tirage",
    "text": "Tire les coudes vers les hanches jusqu'à ce que ton menton passe au-dessus des poignées."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus. Réduis le contrepoids au fil du temps à mesure que tu progresses."
   }
  ]
 },
 "back-extension": {
  "name": "Extension lombaire",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le coussin juste sous les os des hanches, sur un banc à 45° ou horizontal, et cale tes talons sous les rouleaux."
   },
   {
    "title": "Descente",
    "text": "Penche le buste depuis les hanches et descends, dos plat, jusqu'à sentir un étirement des ischio-jambiers."
   },
   {
    "title": "Montée",
    "text": "Serre les fessiers et remonte jusqu'à ce que ton corps soit aligné, sans cambrer. Tiens un disque contre ta poitrine pour plus de charge."
   }
  ]
 },
 "back-extension-machine": {
  "name": "Extension lombaire à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que le dossier se place au niveau des omoplates. Attache la sangle sur les cuisses et cale tes pieds."
   },
   {
    "title": "Extension",
    "text": "Pousse en arrière contre le dossier jusqu'à ce que ton buste soit légèrement derrière la verticale. Reste fluide, sans à-coups."
   },
   {
    "title": "Retour",
    "text": "Laisse le dossier ramener ton buste vers l'avant lentement. Garde les abdos gainés et ne relâche pas la tension à l'avant."
   }
  ]
 },
 "barbell-curl": {
  "name": "Curl barre",
  "instructions": [
   {
    "title": "Prise",
    "text": "Tiens-toi droit et attrape la barre en supination, mains écartées de la largeur des épaules, bras tendus."
   },
   {
    "title": "Curl",
    "text": "Monte la barre vers les épaules en gardant les coudes le long du corps et le buste immobile."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre lentement jusqu'à avoir les bras tendus. Ne te penche pas en arrière pour lancer la répétition suivante."
   }
  ]
 },
 "barbell-row": {
  "name": "Rowing barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Attrape la barre en pronation, juste à l'extérieur des genoux. Penche-toi en avant à environ 45°, dos plat et genoux légèrement fléchis."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre vers le bas des côtes en ramenant les coudes en arrière et en serrant les omoplates."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre de façon contrôlée jusqu'à avoir les bras tendus. Garde l'angle du buste fixe et ne donne pas d'élan avec les hanches."
   }
  ]
 },
 "barbell-shrug": {
  "name": "Shrug barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens la barre devant les cuisses en pronation, un peu plus large que les épaules. Tiens-toi droit, bras tendus."
   },
   {
    "title": "Haussement",
    "text": "Monte les épaules droit vers les oreilles en gardant la barre près du corps. N'utilise pas les jambes."
   },
   {
    "title": "Descente",
    "text": "Marque une pause en haut, puis redescends lentement jusqu'à ce que les épaules soient complètement relâchées. Utilise des sangles si ta prise lâche avant."
   }
  ]
 },
 "bayesian-curl": {
  "name": "Curl bayésien à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en D à la poulie basse et attrape-la d'une main. Tourne le dos à la machine et avance jusqu'à ce que ton bras soit tiré derrière le corps."
   },
   {
    "title": "Curl",
    "text": "Monte la poignée vers l'avant et le haut, coude légèrement derrière le buste. Ne laisse pas l'épaule partir vers l'avant."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir le bras tendu et sentir un étirement du biceps. Change de bras après la série."
   }
  ]
 },
 "behind-the-neck-press": {
  "name": "Développé nuque",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assis ou debout, place la barre sur le haut du dos comme pour un squat, mains un peu plus écartées que pour un développé militaire."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre droit vers le haut depuis l'arrière de la tête jusqu'à avoir les bras verrouillés. Garde la tête neutre, menton légèrement rentré."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre lentement jusqu'à hauteur des oreilles. Prends une charge légère et évite cet exercice si tes épaules se pincent."
   }
  ]
 },
 "belt-squat": {
  "name": "Squat à la ceinture",
  "instructions": [
   {
    "title": "Ceinture",
    "text": "Mets la ceinture de hanches et accroche-la à la chaîne ou à la sangle de la machine. Place-toi sur la plateforme, pieds écartés de la largeur des épaules."
   },
   {
    "title": "Descente",
    "text": "Tiens les poignées légèrement pour l'équilibre, libère le levier et descends en squat, buste droit."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds pour remonter. La charge pend à tes hanches, donc ta colonne reste déchargée."
   }
  ]
 },
 "bench-dip": {
  "name": "Dips sur banc",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au bord d'un banc, mains à côté des hanches, doigts vers l'avant. Décolle les fesses du banc et avance les pieds."
   },
   {
    "title": "Descente",
    "text": "Plie les coudes vers l'arrière pour descendre les hanches jusqu'à ce que tes bras soient à peu près parallèles au sol."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans les paumes jusqu'à avoir les bras tendus. Garde le dos près du banc et les épaules basses."
   }
  ]
 },
 "bench-press": {
  "name": "Développé couché barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le banc, les yeux sous la barre. Serre les omoplates et cale tes pieds."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la de façon contrôlée vers le bas de la poitrine, coudes à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre vers le haut et légèrement en arrière jusqu'à avoir les bras presque tendus. Garde les fessiers sur le banc."
   }
  ]
 },
 "bent-over-dumbbell-row": {
  "name": "Rowing haltères buste penché",
  "instructions": [
   {
    "title": "Installation",
    "text": "Prends un haltère dans chaque main, paumes face à face. Penche-toi en avant à environ 45°, genoux légèrement fléchis et dos plat."
   },
   {
    "title": "Tirage",
    "text": "Tire les deux haltères vers les hanches en ramenant les coudes en arrière et en serrant les omoplates."
   },
   {
    "title": "Descente",
    "text": "Redescends les haltères lentement jusqu'à avoir les bras tendus. Garde le buste immobile pendant toute la série."
   }
  ]
 },
 "bicycle-crunch": {
  "name": "Crunch vélo",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, mains légèrement derrière la tête, et décolle les épaules et les pieds du sol."
   },
   {
    "title": "Rotation",
    "text": "Ramène un genou vers la poitrine en tournant le coude opposé vers lui, et tends l'autre jambe."
   },
   {
    "title": "Alternance",
    "text": "Change de côté en pédalant lentement, en tournant depuis le buste plutôt qu'en tirant avec les bras. Garde le bas du dos au sol."
   }
  ]
 },
 "bird-dog": {
  "name": "Bird dog",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi à quatre pattes, mains sous les épaules et genoux sous les hanches. Garde le dos plat."
   },
   {
    "title": "Extension",
    "text": "Tends un bras vers l'avant et la jambe opposée vers l'arrière jusqu'à les aligner avec le buste. Tiens une seconde."
   },
   {
    "title": "Changement",
    "text": "Reviens lentement et recommence de l'autre côté. Garde les hanches à niveau et ne cambre pas le bas du dos."
   }
  ]
 },
 "bodyweight-squat": {
  "name": "Squat au poids du corps",
  "instructions": [
   {
    "title": "Position",
    "text": "Pieds écartés de la largeur des épaules, pointes légèrement vers l'extérieur. Tends les bras devant toi pour l'équilibre."
   },
   {
    "title": "Descente",
    "text": "Recule les fesses et descends jusqu'à ce que tes cuisses soient au moins parallèles au sol, talons à plat et poitrine haute."
   },
   {
    "title": "Montée",
    "text": "Pousse dans toute la plante des pieds pour te relever et serre les fessiers en haut. Garde un rythme régulier."
   }
  ]
 },
 "box-jump": {
  "name": "Saut sur box",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi à environ 30 cm d'un box stable, pieds écartés de la largeur des hanches."
   },
   {
    "title": "Saut",
    "text": "Balance les bras vers l'arrière, descends en quart de squat et saute sur le box. Réceptionne-toi en douceur, les deux pieds à plat et les genoux fléchis."
   },
   {
    "title": "Descente",
    "text": "Redresse-toi complètement sur le box, puis descends un pied après l'autre. Reprends ta position avant le saut suivant."
   }
  ]
 },
 "box-squat": {
  "name": "Squat sur box",
  "instructions": [
   {
    "title": "Hauteur du box",
    "text": "Place un box derrière toi, à une hauteur où tes cuisses sont à peu près parallèles quand tu es assis. Écarte un peu plus les pieds que d'habitude."
   },
   {
    "title": "Assise",
    "text": "Recule les hanches et descends de façon contrôlée jusqu'à t'asseoir légèrement sur le box. Reste gainé, sans te relâcher."
   },
   {
    "title": "Poussée",
    "text": "Sans te balancer ni rebondir, appuie fort dans le sol et relève-toi de façon explosive."
   }
  ]
 },
 "bulgarian-split-squat": {
  "name": "Squat bulgare",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi à environ un pas devant un banc et pose le dessus du pied arrière dessus. Prends un haltère dans chaque main."
   },
   {
    "title": "Descente",
    "text": "Descends droit jusqu'à ce que la cuisse avant soit à peu près parallèle, talon avant à plat au sol."
   },
   {
    "title": "Poussée",
    "text": "Remonte en poussant dans le pied avant. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "burpee": {
  "name": "Burpee",
  "instructions": [
   {
    "title": "Descente",
    "text": "Debout, descends en squat et pose les mains au sol devant tes pieds."
   },
   {
    "title": "Pompe",
    "text": "Envoie les pieds en arrière en planche, fais une pompe en gardant le corps aligné, puis ramène les pieds vers tes mains d'un saut."
   },
   {
    "title": "Saut",
    "text": "Relève-toi et saute de façon explosive en tapant des mains au-dessus de la tête. Réceptionne-toi en douceur et enchaîne directement la répétition suivante."
   }
  ]
 },
 "cable-chest-press": {
  "name": "Développé poitrine à la poulie debout",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les deux poulies à hauteur de poitrine, prends une poignée dans chaque main et avance d'un pas en position fente, dos à la machine."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers l'avant et légèrement l'une vers l'autre jusqu'à avoir les bras presque tendus. Garde le buste immobile."
   },
   {
    "title": "Retour",
    "text": "Ramène les mains lentement à hauteur de poitrine jusqu'à sentir un étirement. Ne te laisse pas tirer en arrière par les câbles."
   }
  ]
 },
 "cable-crossover": {
  "name": "Écartés à la poulie vis-à-vis",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les poulies en haut, prends une poignée dans chaque main et avance d'un pas en position fente."
   },
   {
    "title": "Rapprochement",
    "text": "Coudes légèrement fléchis, ramène les mains vers le bas et l'une vers l'autre devant la poitrine."
   },
   {
    "title": "Ouverture",
    "text": "Ouvre les bras lentement jusqu'à sentir un étirement des pectoraux."
   }
  ]
 },
 "cable-crunch": {
  "name": "Crunch à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à la poulie haute et mets-toi à genoux face à la machine. Tiens les extrémités de la corde de chaque côté de la tête."
   },
   {
    "title": "Crunch",
    "text": "Arrondis le dos et rapproche les côtes des hanches. Garde les hanches immobiles et ne t'assieds pas sur les talons."
   },
   {
    "title": "Retour",
    "text": "Déroule-toi lentement jusqu'à avoir de nouveau le dos droit, en gardant la tension sur le câble."
   }
  ]
 },
 "cable-curl": {
  "name": "Curl à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une barre droite ou une barre EZ à la poulie basse. Fais face au bloc de poids et attrape la barre en supination, bras tendus."
   },
   {
    "title": "Curl",
    "text": "Monte la barre vers les épaules, coudes le long du corps. Ne te penche pas en arrière."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus, en gardant le câble sous tension."
   }
  ]
 },
 "cable-external-rotation": {
  "name": "Rotation externe à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place une poulie à hauteur du coude et tiens-toi de profil. Prends la poignée avec la main éloignée de la machine, coude fléchi à 90° et collé au flanc."
   },
   {
    "title": "Rotation",
    "text": "Tourne l'avant-bras vers l'extérieur, en l'éloignant de ton ventre, aussi loin que c'est confortable. Garde le coude collé au flanc."
   },
   {
    "title": "Retour",
    "text": "Ramène l'avant-bras lentement devant ton ventre. Prends une charge légère et bouge de façon fluide, sans à-coups."
   }
  ]
 },
 "cable-front-raise": {
  "name": "Élévations frontales à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi dos à une poulie basse, le câble passant entre tes jambes. Tiens la poignée ou la corde devant les cuisses."
   },
   {
    "title": "Montée",
    "text": "Coudes légèrement fléchis, lève les bras droit devant toi jusqu'à hauteur d'épaules. Ne te penche pas en arrière."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en deux à trois secondes et arrête-toi juste avant que les poids ne se reposent."
   }
  ]
 },
 "cable-glute-kickback": {
  "name": "Kickback fessier à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Attache une chevillère à une jambe, à la poulie basse. Fais face à la machine, tiens le cadre et penche-toi légèrement en avant."
   },
   {
    "title": "Extension",
    "text": "Envoie la jambe vers l'arrière et légèrement vers le haut en serrant le fessier, sans cambrer le bas du dos."
   },
   {
    "title": "Retour",
    "text": "Ramène la jambe vers l'avant lentement et de façon contrôlée. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "cable-kickback": {
  "name": "Kickback triceps à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Prends le câble de la poulie basse dans une main. Penche-toi en avant, dos plat, et colle le haut du bras au flanc, parallèle au sol."
   },
   {
    "title": "Extension",
    "text": "Tends le coude jusqu'à ce que ton bras pointe droit vers l'arrière. Garde le haut du bras immobile."
   },
   {
    "title": "Retour",
    "text": "Plie le coude lentement jusqu'à ce que l'avant-bras pende à la verticale, sans laisser le câble se détendre. Change de bras après la série."
   }
  ]
 },
 "cable-lateral-raise": {
  "name": "Élévations latérales à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place la poulie en position la plus basse et tiens-toi de profil. Prends la poignée avec la main éloignée de la machine, devant la cuisse."
   },
   {
    "title": "Montée",
    "text": "Lève le bras sur le côté jusqu'à hauteur d'épaule, en guidant le mouvement avec le coude et en le gardant légèrement fléchi."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en deux à trois secondes, en laissant ta main passer devant le corps pour garder la tension."
   }
  ]
 },
 "cable-pull-through": {
  "name": "Pull-through à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à la poulie basse, tourne-lui le dos et attrape-la entre les jambes. Avance de quelques pas, pieds plus écartés que les hanches."
   },
   {
    "title": "Charnière",
    "text": "Recule les hanches et laisse la corde ramener tes mains en arrière entre les jambes, genoux légèrement fléchis et dos plat."
   },
   {
    "title": "Poussée",
    "text": "Pousse les hanches vers l'avant pour te redresser et serre fort les fessiers en haut. Ne tire pas avec les bras."
   }
  ]
 },
 "cable-rear-delt-fly": {
  "name": "Oiseau à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les deux poulies à hauteur d'épaule. Prends le câble de gauche dans la main droite et celui de droite dans la main gauche, puis recule."
   },
   {
    "title": "Écartement",
    "text": "Coudes légèrement fléchis, écarte les bras vers l'extérieur et l'arrière en un large arc jusqu'à les aligner avec les épaules."
   },
   {
    "title": "Retour",
    "text": "Ramène les mains lentement jusqu'à ce qu'elles se croisent devant toi. Ne hausse pas les épaules et ne te penche pas en arrière."
   }
  ]
 },
 "cable-upright-row": {
  "name": "Rowing menton à la poulie",
  "instructions": [
   {
    "title": "Prise",
    "text": "Fixe une barre droite ou une corde à la poulie basse. Tiens-toi près de la machine et attrape-la devant les cuisses, mains écartées d'environ la largeur des épaules."
   },
   {
    "title": "Tirage",
    "text": "Guide le mouvement avec les coudes et tire jusqu'à hauteur du bas de la poitrine. Les coudes restent au-dessus des mains."
   },
   {
    "title": "Descente",
    "text": "Redescends de façon contrôlée et garde le câble tendu en bas. Arrête-toi plus tôt si tes épaules se pincent."
   }
  ]
 },
 "cable-woodchop": {
  "name": "Woodchop à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en D à la poulie haute et tiens-toi de profil par rapport à la machine. Attrape la poignée à deux mains, bras tendus vers la poulie."
   },
   {
    "title": "Coupe",
    "text": "Tire la poignée en diagonale vers le bas et à travers le corps jusqu'à la hanche opposée, en tournant le buste et en pivotant sur le pied arrière."
   },
   {
    "title": "Retour",
    "text": "Laisse la poignée remonter lentement par le même chemin. Change de côté après la série."
   }
  ]
 },
 "calf-raise": {
  "name": "Mollets debout",
  "instructions": [
   {
    "title": "Position",
    "text": "Appuie l'avant des pieds sur le bord, talons dans le vide, jambes tendues."
   },
   {
    "title": "Montée",
    "text": "Monte sur la pointe des pieds aussi haut que possible et marque une brève pause."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement les talons sous la plateforme pour un étirement complet."
   }
  ]
 },
 "captains-chair-leg-raise": {
  "name": "Relevés de jambes à la chaise romaine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pose les avant-bras sur les coussins de la chaise romaine, attrape les poignées et plaque le dos contre le dossier."
   },
   {
    "title": "Montée",
    "text": "Lève les jambes tendues jusqu'à ce qu'elles soient parallèles au sol, en gardant le dos contre le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends les jambes lentement jusqu'à ce qu'elles pendent à la verticale. Ne te balance pas pour enchaîner la répétition suivante."
   }
  ]
 },
 "chest-press-machine": {
  "name": "Développé assis à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées soient au milieu de ta poitrine. Assieds-toi dos bien plaqué contre le dossier et pieds au sol."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers l'avant jusqu'à avoir les bras presque tendus. Garde les épaules plaquées contre le dossier."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées revenir lentement jusqu'à sentir un étirement des pectoraux. Ne pose pas les plaques."
   }
  ]
 },
 "chest-supported-dumbbell-row": {
  "name": "Rowing haltères sur banc incliné",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle un banc incliné à 30–45° et allonge-toi sur le ventre, poitrine sur le coussin, un haltère dans chaque main."
   },
   {
    "title": "Tirage",
    "text": "Tire les haltères vers le haut le long des côtes et serre les omoplates. Garde la poitrine sur le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus et les épaules étirées vers l'avant."
   }
  ]
 },
 "chest-supported-t-bar-row": {
  "name": "Rowing T-bar poitrine appuyée",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur les repose-pieds et allonge-toi, poitrine sur le coussin. Attrape les poignées, bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Tire les poignées vers ta poitrine en ramenant les coudes en arrière. Garde la poitrine sur le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus et les omoplates écartées."
   }
  ]
 },
 "chin-up": {
  "name": "Tractions supination",
  "instructions": [
   {
    "title": "Prise",
    "text": "Attrape la barre paumes vers toi, mains écartées d'environ la largeur des épaules, et suspends-toi bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Tire les coudes vers le bas devant le corps jusqu'à ce que ton menton passe au-dessus de la barre. Garde les jambes immobiles."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras complètement tendus. Ne te balance pas pour enchaîner la répétition suivante."
   }
  ]
 },
 "clean": {
  "name": "Épaulé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Barre au-dessus du milieu du pied, pieds écartés de la largeur des hanches, prise juste à l'extérieur des jambes. Hanches au-dessus des genoux, poitrine haute, dos plat."
   },
   {
    "title": "Tirage",
    "text": "Monte la barre au-delà des genoux en poussant de façon régulière, puis étends hanches, genoux et chevilles de façon explosive en la gardant près du corps."
   },
   {
    "title": "Réception",
    "text": "Descends dans un squat avant complet et reçois la barre sur les épaules, coudes hauts. Relève-toi du squat."
   }
  ]
 },
 "clean-and-jerk": {
  "name": "Épaulé-jeté",
  "instructions": [
   {
    "title": "Épaulé",
    "text": "Tire la barre du sol et reçois-la sur les épaules dans un squat avant, coudes hauts. Relève-toi et ajuste ta prise."
   },
   {
    "title": "Flexion",
    "text": "Barre sur les épaules, fléchis les genoux de quelques centimètres, buste droit, puis pousse de façon explosive."
   },
   {
    "title": "Jeté",
    "text": "Glisse-toi sous la barre en fente et reçois-la au-dessus de la tête, bras verrouillés. Rapproche les pieds, puis redescends la barre."
   }
  ]
 },
 "close-grip-bench-press": {
  "name": "Développé couché prise serrée",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le banc, les yeux sous la barre, et attrape-la à environ la largeur des épaules. Serre les omoplates et cale tes pieds."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la de façon contrôlée vers le bas de la poitrine, coudes collés au corps."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre jusqu'à avoir les bras tendus. Garde les poignets au-dessus des coudes."
   }
  ]
 },
 "close-grip-lat-pulldown": {
  "name": "Tirage vertical prise serrée",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en V, assieds-toi avec les cuisses sous les coussins et attrape la poignée, bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Penche-toi légèrement en arrière et tire la poignée vers le haut de la poitrine en ramenant les coudes vers le bas et l'arrière."
   },
   {
    "title": "Retour",
    "text": "Laisse la poignée remonter lentement jusqu'à avoir les bras tendus et les dorsaux étirés."
   }
  ]
 },
 "concentration-curl": {
  "name": "Curl concentré",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc, penche-toi en avant et cale l'arrière du bras contre l'intérieur de la cuisse."
   },
   {
    "title": "Curl",
    "text": "Monte l'haltère vers l'épaule sans bouger le haut du bras. Serre le biceps en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir le bras tendu. Termine toutes les répétitions avant de changer de bras."
   }
  ]
 },
 "copenhagen-plank": {
  "name": "Planche Copenhague",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le côté près d'un banc, avant-bras sous l'épaule, et pose l'intérieur du genou ou de la cheville du dessus sur le banc."
   },
   {
    "title": "Montée",
    "text": "Appuie la jambe du dessus dans le banc et monte les hanches jusqu'à former une ligne droite. La jambe du dessous reste dans le vide."
   },
   {
    "title": "Maintien",
    "text": "Garde les hanches hautes et respire calmement pendant toute la durée. Fais ensuite le même temps de l'autre côté."
   }
  ]
 },
 "crunch": {
  "name": "Crunch",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, genoux fléchis et pieds à plat. Pose le bout des doigts légèrement derrière les oreilles."
   },
   {
    "title": "Crunch",
    "text": "Décolle les épaules du sol en contractant les abdos. Garde le bas du dos au sol et ne tire pas sur la nuque."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à ce que les omoplates touchent le sol, puis enchaîne la répétition suivante."
   }
  ]
 },
 "curtsy-lunge": {
  "name": "Fente révérence",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, pieds écartés de la largeur des hanches, un haltère dans chaque main le long du corps."
   },
   {
    "title": "Croisement",
    "text": "Passe une jambe en diagonale derrière l'autre, comme pour une révérence, et descends jusqu'à ce que la cuisse avant soit à peu près parallèle."
   },
   {
    "title": "Retour",
    "text": "Pousse dans le talon avant pour revenir au départ, genou avant aligné avec les orteils. Alterne les jambes."
   }
  ]
 },
 "dead-bug": {
  "name": "Dead bug",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, bras pointés vers le plafond, hanches et genoux fléchis à 90°. Plaque le bas du dos au sol."
   },
   {
    "title": "Extension",
    "text": "Descends lentement un bras au-dessus de la tête et tends la jambe opposée jusqu'à ce qu'ils flottent juste au-dessus du sol."
   },
   {
    "title": "Changement",
    "text": "Reviens au départ et recommence de l'autre côté. Garde le bas du dos à plat et expire pendant l'extension."
   }
  ]
 },
 "dead-hang": {
  "name": "Suspension à la barre",
  "instructions": [
   {
    "title": "Prise",
    "text": "Attrape une barre de traction en pronation, à la largeur des épaules, et décolle les pieds du sol."
   },
   {
    "title": "Suspension",
    "text": "Reste suspendu bras tendus et laisse ton corps s'étirer. Garde les jambes immobiles et respire lentement."
   },
   {
    "title": "Maintien",
    "text": "Continue de serrer la barre et reste immobile pendant toute la durée. Redescends de façon contrôlée quand ta prise commence à lâcher."
   }
  ]
 },
 "deadlift": {
  "name": "Soulevé de terre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pieds écartés de la largeur des hanches sous la barre, tibias proches. Prise juste à l'extérieur des jambes."
   },
   {
    "title": "Gainage",
    "text": "Hanches basses, poitrine haute, dos plat. Inspire profondément et tends la barre pour enlever le jeu."
   },
   {
    "title": "Soulevé",
    "text": "Pousse le sol et redresse-toi complètement en gardant la barre près du corps. Redescends-la de la même façon."
   }
  ]
 },
 "decline-bench-press": {
  "name": "Développé décliné barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Cale tes pieds sous les coussins et allonge-toi, les yeux sous la barre. Demande à un pareur de t'aider à décrocher."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la de façon contrôlée vers le bas de la poitrine, coudes à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre droit vers le haut jusqu'à avoir les bras presque tendus. Garde les omoplates serrées."
   }
  ]
 },
 "decline-chest-press-machine": {
  "name": "Développé décliné à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées soient au niveau du bas de ta poitrine. Assieds-toi dos contre le dossier et attrape les poignées."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers l'avant et le bas jusqu'à avoir les bras presque tendus. Garde la poitrine haute et les épaules en arrière."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées revenir lentement jusqu'à sentir un étirement du bas des pectoraux, sans poser les plaques."
   }
  ]
 },
 "decline-dumbbell-press": {
  "name": "Développé décliné haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc décliné, haltères sur les cuisses, cale tes pieds sous les coussins et allonge-toi en amenant les haltères à la poitrine."
   },
   {
    "title": "Descente",
    "text": "Descends les haltères sur les côtés du bas de la poitrine, coudes à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Pousse vers le haut en rapprochant légèrement les haltères jusqu'à avoir les bras presque tendus. À la fin, ramène les poids à la poitrine avant de te redresser."
   }
  ]
 },
 "decline-push-up": {
  "name": "Pompes déclinées",
  "instructions": [
   {
    "title": "Planche",
    "text": "Pose les pieds sur un banc ou un box et les mains au sol, un peu plus écartées que les épaules. Corps droit de la tête aux talons."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine vers le sol, coudes à environ 45° du buste. Garde la nuque neutre et ne relève pas les hanches."
   },
   {
    "title": "Poussée",
    "text": "Repousse le sol jusqu'à avoir les bras tendus. Gaine les abdos et les fessiers pour que les hanches ne s'affaissent pas."
   }
  ]
 },
 "decline-sit-up": {
  "name": "Relevés de buste sur banc décliné",
  "instructions": [
   {
    "title": "Installation",
    "text": "Cale tes pieds sous les coussins d'un banc décliné et allonge-toi. Croise les bras ou tiens un disque contre ta poitrine."
   },
   {
    "title": "Montée",
    "text": "Enroule le buste vers le haut jusqu'à être à peu près droit, en gardant le disque collé à la poitrine."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à ce que le bas du dos touche le banc. Ne te laisse pas tomber pour enchaîner la répétition suivante."
   }
  ]
 },
 "deficit-deadlift": {
  "name": "Soulevé de terre déficit",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur un disque ou une plateforme de 2 à 5 cm, barre au-dessus du milieu du pied. Prise juste à l'extérieur des jambes."
   },
   {
    "title": "Gainage",
    "text": "Hanches plus basses que sur un soulevé de terre classique, poitrine haute, dos plat. Inspire et tends la barre pour enlever le jeu."
   },
   {
    "title": "Soulevé",
    "text": "Pousse le sol et garde la barre près du corps quand elle décolle. Redresse-toi complètement, puis redescends-la de la même façon."
   }
  ]
 },
 "deficit-push-up": {
  "name": "Pompes déficit",
  "instructions": [
   {
    "title": "Planche",
    "text": "Place les mains sur deux disques, blocs ou poignées de pompes, un peu plus écartées que les épaules. Corps droit de la tête aux talons."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine sous le niveau des mains jusqu'à sentir un étirement profond des pectoraux, coudes à environ 45°."
   },
   {
    "title": "Poussée",
    "text": "Remonte jusqu'à avoir les bras tendus. Descends seulement aussi bas que tes épaules le permettent confortablement."
   }
  ]
 },
 "diamond-push-up": {
  "name": "Pompes diamant",
  "instructions": [
   {
    "title": "Mains",
    "text": "Place les mains sous la poitrine, pouces et index qui se touchent en forme de diamant. Corps en ligne droite."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine vers les mains en gardant les coudes près du corps."
   },
   {
    "title": "Poussée",
    "text": "Remonte jusqu'à avoir les bras tendus. Serre les fessiers pour que les hanches ne s'affaissent pas."
   }
  ]
 },
 "dip": {
  "name": "Dips",
  "instructions": [
   {
    "title": "Appui",
    "text": "Hisse-toi sur les barres, bras tendus, épaules basses et loin des oreilles."
   },
   {
    "title": "Descente",
    "text": "Penche-toi légèrement en avant et descends jusqu'à ce que les bras soient à peu près parallèles au sol."
   },
   {
    "title": "Poussée",
    "text": "Remonte jusqu'à l'extension complète sans balancer les jambes."
   }
  ]
 },
 "dip-machine": {
  "name": "Dips à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées partent au niveau du bas de ta poitrine. Assieds-toi droit et attrape les poignées."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers le bas jusqu'à avoir les bras tendus, coudes près du corps."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées remonter lentement jusqu'à ce que les coudes soient fléchis à environ 90°. Garde les épaules basses, loin des oreilles."
   }
  ]
 },
 "donkey-kick": {
  "name": "Donkey kick",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi à quatre pattes, mains sous les épaules et genoux sous les hanches. Gaine le tronc."
   },
   {
    "title": "Extension",
    "text": "Genou fléchi à 90°, pousse un pied vers le plafond jusqu'à ce que la cuisse soit alignée avec le dos."
   },
   {
    "title": "Descente",
    "text": "Redescends le genou sans toucher le sol et ne cambre pas le bas du dos. Change de jambe après la série."
   }
  ]
 },
 "drag-curl": {
  "name": "Drag curl",
  "instructions": [
   {
    "title": "Prise",
    "text": "Tiens-toi droit et attrape la barre en supination, mains écartées de la largeur des épaules, barre contre les cuisses."
   },
   {
    "title": "Remontée",
    "text": "Ramène les coudes en arrière et fais glisser la barre le long du buste jusqu'au bas de la poitrine. Garde la barre en contact avec le corps."
   },
   {
    "title": "Descente",
    "text": "Refais glisser la barre le long du corps de façon contrôlée jusqu'à avoir les bras tendus."
   }
  ]
 },
 "dumbbell-bench-press": {
  "name": "Développé couché haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc plat, haltères sur les cuisses, puis allonge-toi et monte-les au-dessus de la poitrine."
   },
   {
    "title": "Descente",
    "text": "Descends les haltères sur les côtés de la poitrine, coudes à environ 45° du buste et poignets au-dessus des coudes."
   },
   {
    "title": "Poussée",
    "text": "Pousse vers le haut en rapprochant légèrement les haltères jusqu'à avoir les bras presque tendus. Ne les cogne pas l'un contre l'autre en haut."
   }
  ]
 },
 "dumbbell-curl": {
  "name": "Curl haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, haltères le long du corps, coudes près du buste."
   },
   {
    "title": "Curl",
    "text": "Plie les coudes et monte les haltères vers les épaules sans balancer."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir de nouveau les bras tendus."
   }
  ]
 },
 "dumbbell-floor-press": {
  "name": "Développé au sol haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au sol, haltères sur les cuisses, puis bascule en arrière et pousse-les au-dessus de la poitrine. Genoux fléchis, pieds à plat."
   },
   {
    "title": "Descente",
    "text": "Descends les haltères jusqu'à ce que le haut des bras repose au sol, coudes à environ 45° du buste. Marque une pause d'une seconde."
   },
   {
    "title": "Poussée",
    "text": "Repousse les haltères au-dessus de la poitrine sans rebondir avec les coudes sur le sol."
   }
  ]
 },
 "dumbbell-fly": {
  "name": "Écartés haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur un banc plat et pousse les haltères au-dessus de la poitrine, paumes face à face, coudes légèrement fléchis."
   },
   {
    "title": "Ouverture",
    "text": "Descends les poids sur les côtés en un large arc jusqu'à sentir un étirement des pectoraux. Garde la flexion des coudes fixe."
   },
   {
    "title": "Rapprochement",
    "text": "Remonte les haltères par le même arc, comme pour serrer un arbre dans tes bras, et arrête-toi juste avant qu'ils se touchent."
   }
  ]
 },
 "dumbbell-kickback": {
  "name": "Kickback triceps haltère",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pose un genou et une main sur un banc, dos plat. Tiens l'haltère avec le haut du bras collé au flanc, parallèle au sol."
   },
   {
    "title": "Extension",
    "text": "Tends le coude jusqu'à ce que tout le bras soit aligné avec le buste. Seul l'avant-bras bouge."
   },
   {
    "title": "Retour",
    "text": "Replie lentement le coude à 90° sans laisser le haut du bras tomber. Change de bras après la série."
   }
  ]
 },
 "dumbbell-preacher-curl": {
  "name": "Curl pupitre haltère",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au pupitre et pose l'arrière d'un bras à plat sur le coussin, haltère en main, paume vers le haut."
   },
   {
    "title": "Curl",
    "text": "Monte l'haltère jusqu'à ce que l'avant-bras soit presque vertical. Garde le haut du bras et l'épaule immobiles."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir le bras presque tendu, puis recommence. Change de bras après la série."
   }
  ]
 },
 "dumbbell-pullover": {
  "name": "Pull-over haltère",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur un banc plat et tiens un haltère au-dessus de la poitrine, les deux mains en coupe sous le disque du haut, coudes légèrement fléchis."
   },
   {
    "title": "Descente",
    "text": "Redescends l'haltère derrière la tête en arc de cercle jusqu'à sentir un étirement des pectoraux et des dorsaux."
   },
   {
    "title": "Remontée",
    "text": "Ramène l'haltère au-dessus de la poitrine par le même arc. Garde les côtes basses pour ne pas cambrer le bas du dos."
   }
  ]
 },
 "dumbbell-romanian-deadlift": {
  "name": "Soulevé de terre roumain haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, un haltère dans chaque main devant les cuisses, genoux légèrement fléchis."
   },
   {
    "title": "Charnière",
    "text": "Recule les hanches et fais glisser les haltères près des jambes jusqu'à sentir un étirement des ischio-jambiers."
   },
   {
    "title": "Remontée",
    "text": "Pousse les hanches vers l'avant pour te relever et serre les fessiers. Le dos reste plat du début à la fin."
   }
  ]
 },
 "dumbbell-shoulder-press": {
  "name": "Développé épaules haltères",
  "instructions": [
   {
    "title": "Gainage",
    "text": "Tiens les haltères à hauteur d'épaules, poignets au-dessus des coudes. Serre le tronc et les fessiers."
   },
   {
    "title": "Poussée",
    "text": "Pousse droit vers le haut jusqu'à avoir les bras verrouillés au-dessus de la tête, en reculant légèrement la tête."
   },
   {
    "title": "Descente",
    "text": "Ramène les haltères à hauteur d'épaules de façon contrôlée, sans cambrer le bas du dos."
   }
  ]
 },
 "dumbbell-shrug": {
  "name": "Shrug haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi droit, un haltère dans chaque main le long du corps, paumes face à toi, bras tendus."
   },
   {
    "title": "Haussement",
    "text": "Monte les épaules droit vers les oreilles aussi haut que possible. Ne les fais pas tourner et ne plie pas les coudes."
   },
   {
    "title": "Descente",
    "text": "Marque une brève pause en haut, puis redescends lentement les épaules jusqu'à l'étirement complet."
   }
  ]
 },
 "dumbbell-side-bend": {
  "name": "Flexions latérales haltère",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi droit, un haltère dans une main le long du corps, pieds écartés de la largeur des hanches, l'autre main sur la hanche."
   },
   {
    "title": "Flexion",
    "text": "Penche-toi sur le côté vers l'haltère en le faisant glisser le long de la cuisse. Ne te penche ni vers l'avant ni vers l'arrière."
   },
   {
    "title": "Retour",
    "text": "Redresse-toi avec les obliques du côté opposé. Change de côté après la série."
   }
  ]
 },
 "dumbbell-skull-crusher": {
  "name": "Barre au front haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur un banc plat et pousse deux haltères au-dessus des épaules, paumes face à face."
   },
   {
    "title": "Descente",
    "text": "Plie uniquement les coudes pour descendre les haltères de chaque côté de la tête. Garde le haut des bras immobile et dirigé vers le haut."
   },
   {
    "title": "Extension",
    "text": "Tends les bras pour ramener les haltères au-dessus des épaules. Serre les triceps en haut."
   }
  ]
 },
 "dumbbell-thruster": {
  "name": "Thruster haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens un haltère dans chaque main à hauteur d'épaules, paumes face à face, pieds écartés de la largeur des épaules."
   },
   {
    "title": "Squat",
    "text": "Descends en squat jusqu'à ce que tes cuisses soient au moins parallèles, poitrine haute et coudes vers l'avant."
   },
   {
    "title": "Poussée",
    "text": "Remonte du squat et utilise cet élan pour pousser les haltères au-dessus de la tête en un seul mouvement fluide. Ramène-les ensuite aux épaules."
   }
  ]
 },
 "elliptical": {
  "name": "Vélo elliptique",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur les pédales, attrape les poignées mobiles et choisis une résistance contre laquelle tu peux bouger avec fluidité."
   },
   {
    "title": "Mouvement",
    "text": "Pousse et tire les poignées en avançant, pied bien à plat sur les pédales et buste droit."
   },
   {
    "title": "Rythme",
    "text": "Garde un rythme régulier. Pour un échauffement, tu dois encore pouvoir discuter sans difficulté."
   }
  ]
 },
 "exercise-bike": {
  "name": "Vélo d'appartement",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle la selle pour que ton genou reste légèrement fléchi en bas du pédalage. Commence avec une résistance faible."
   },
   {
    "title": "Pédalage",
    "text": "Pédale en cercles fluides, buste immobile et avant des pieds sur les pédales."
   },
   {
    "title": "Rythme",
    "text": "Garde une cadence régulière et règle la résistance selon ton objectif. Pour un échauffement, tu dois encore pouvoir parler."
   }
  ]
 },
 "ez-bar-curl": {
  "name": "Curl barre EZ",
  "instructions": [
   {
    "title": "Prise",
    "text": "Tiens la barre EZ sur les parties inclinées intérieures, paumes vers le haut et légèrement vers l'intérieur, bras tendus."
   },
   {
    "title": "Curl",
    "text": "Monte la barre à hauteur d'épaules, coudes collés au corps. Garde les poignets neutres."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre en environ deux secondes jusqu'à avoir de nouveau les bras tendus."
   }
  ]
 },
 "face-pull": {
  "name": "Face pull",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à une poulie entre le haut de la poitrine et le visage. Attrape les extrémités, pouces vers l'arrière, et recule."
   },
   {
    "title": "Tirage",
    "text": "Tire la corde vers ton visage en écartant les extrémités pour que les mains finissent à côté des oreilles, coudes hauts."
   },
   {
    "title": "Retour",
    "text": "Marque une pause et serre les deltoïdes postérieurs, puis laisse la corde revenir lentement jusqu'à avoir les bras tendus."
   }
  ]
 },
 "farmers-walk": {
  "name": "Marche du fermier",
  "instructions": [
   {
    "title": "Installation",
    "text": "Soulève un gros haltère dans chaque main, comme un soulevé de terre, et place-les le long du corps. Tiens-toi droit, épaules en arrière et basses."
   },
   {
    "title": "Marche",
    "text": "Marche à petits pas rapides pendant la durée de la série, buste droit et poids immobiles."
   },
   {
    "title": "Tenue",
    "text": "Serre fort, gaine les abdos et ne penche d'aucun côté. Quand le temps est écoulé, repose les poids dos plat."
   }
  ]
 },
 "fire-hydrant": {
  "name": "Fire hydrant",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi à quatre pattes, mains sous les épaules et genoux sous les hanches. Gaine le tronc."
   },
   {
    "title": "Montée",
    "text": "Genou fléchi, lève une jambe sur le côté jusqu'à ce que la cuisse soit à peu près au niveau de la hanche."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement sans déplacer ton poids ni tourner le buste. Change de jambe après la série."
   }
  ]
 },
 "floor-press": {
  "name": "Développé au sol barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi au sol dans un rack, barre au-dessus des épaules, genoux fléchis et pieds à plat. Prise un peu plus large que les épaules."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la jusqu'à ce que le haut des bras touche le sol, coudes à environ 45° du buste. Marque une brève pause."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre jusqu'au verrouillage sans rebondir avec les coudes sur le sol. Garde les omoplates serrées en arrière."
   }
  ]
 },
 "french-press": {
  "name": "Barre au front",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur un banc plat et tiens une barre EZ ou droite au-dessus des épaules, en pronation et mains rapprochées, bras tendus."
   },
   {
    "title": "Descente",
    "text": "Plie uniquement les coudes pour descendre la barre vers le front. Garde le haut des bras immobile et les coudes vers le haut."
   },
   {
    "title": "Extension",
    "text": "Tends les bras pour repousser la barre au-dessus des épaules. Ne laisse pas les coudes s'écarter."
   }
  ]
 },
 "front-raise": {
  "name": "Élévations frontales haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, haltères devant les cuisses, paumes face au corps et coudes légèrement fléchis."
   },
   {
    "title": "Montée",
    "text": "Lève les haltères droit devant toi jusqu'à hauteur d'épaules. Garde le buste immobile et ne balance pas."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en deux à trois secondes jusqu'à ce que les haltères soient de nouveau devant les cuisses."
   }
  ]
 },
 "front-squat": {
  "name": "Squat avant",
  "instructions": [
   {
    "title": "Placement",
    "text": "Pose la barre sur les deltoïdes antérieurs, près de la gorge, coudes hauts, doigts sous la barre ou bras croisés."
   },
   {
    "title": "Descente",
    "text": "Descends droit, buste vertical et coudes hauts, en laissant les genoux avancer au-dessus des orteils."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds et guide le mouvement avec les coudes pour que la barre ne roule pas vers l'avant."
   }
  ]
 },
 "glute-bridge": {
  "name": "Pont fessier",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, genoux fléchis et pieds à plat, écartés de la largeur des hanches. Pose une charge sur les hanches si tu veux."
   },
   {
    "title": "Montée",
    "text": "Pousse dans les talons et monte les hanches jusqu'à ce que ton corps soit droit des épaules aux genoux."
   },
   {
    "title": "Descente",
    "text": "Serre les fessiers une seconde en haut, puis redescends lentement jusqu'à presque toucher le sol avec les hanches."
   }
  ]
 },
 "glute-ham-raise": {
  "name": "Glute-ham raise",
  "instructions": [
   {
    "title": "Installation",
    "text": "Bloque tes pieds entre les rouleaux, genoux juste derrière le coussin. Pars debout, corps droit."
   },
   {
    "title": "Descente",
    "text": "Descends vers l'avant de façon contrôlée jusqu'à ce que ton corps soit parallèle au sol, hanches en extension."
   },
   {
    "title": "Remontée",
    "text": "Appuie les orteils sur la plaque et remonte avec les ischio-jambiers, fessiers serrés."
   }
  ]
 },
 "glute-kickback-machine": {
  "name": "Kickback fessier à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pose la poitrine ou les avant-bras sur le coussin et place un pied à plat sur la plaque, jambe d'appui légèrement fléchie."
   },
   {
    "title": "Poussée",
    "text": "Pousse la plaque vers l'arrière et le haut en serrant le fessier jusqu'à l'extension complète de la hanche, sans cambrer."
   },
   {
    "title": "Retour",
    "text": "Laisse la plaque revenir lentement jusqu'à ce que ton genou soit près de la poitrine. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "goblet-squat": {
  "name": "Goblet squat",
  "instructions": [
   {
    "title": "Tenue",
    "text": "Tiens un haltère à la verticale contre la poitrine à deux mains, coudes vers le bas."
   },
   {
    "title": "Descente",
    "text": "Descends entre tes talons, poitrine haute, jusqu'à ce que les coudes effleurent l'intérieur des genoux."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds pour te relever, en gardant l'haltère près de la poitrine."
   }
  ]
 },
 "good-morning": {
  "name": "Good morning",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place la barre sur le haut du dos comme pour un squat, pieds écartés de la largeur des hanches, genoux légèrement fléchis."
   },
   {
    "title": "Charnière",
    "text": "Recule les hanches et incline le buste, dos plat, jusqu'à être presque parallèle au sol ou à sentir fortement les ischio-jambiers."
   },
   {
    "title": "Remontée",
    "text": "Pousse les hanches vers l'avant pour te relever. Commence léger : le long levier charge beaucoup le bas du dos."
   }
  ]
 },
 "hack-squat": {
  "name": "Hack squat",
  "instructions": [
   {
    "title": "Installation",
    "text": "Plaque le dos et les épaules contre les coussins. Place les pieds écartés de la largeur des épaules au milieu de la plateforme."
   },
   {
    "title": "Descente",
    "text": "Libère les sécurités et plie les genoux jusqu'à ce que tes cuisses soient au moins parallèles, dos toujours sur le coussin."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds sans verrouiller les genoux, et remets les sécurités après ta dernière répétition."
   }
  ]
 },
 "hammer-curl": {
  "name": "Curl marteau",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, haltères le long du corps, paumes face au corps et coudes près du buste."
   },
   {
    "title": "Curl",
    "text": "Monte les haltères, pouces vers le haut, jusqu'à ce que les avant-bras soient presque verticaux. Ne balance pas le buste."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en gardant la prise neutre, jusqu'à avoir de nouveau les bras tendus."
   }
  ]
 },
 "hang-power-clean": {
  "name": "Power clean depuis la suspension",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi droit, barre en pronation juste à l'extérieur des cuisses. Penche le buste depuis les hanches, dos plat, jusqu'à ce que la barre soit juste au-dessus des genoux."
   },
   {
    "title": "Tirage",
    "text": "Saute de façon explosive en étendant hanches, genoux et chevilles, puis hausse les épaules et tire la barre vers le haut en la gardant près du corps."
   },
   {
    "title": "Réception",
    "text": "Glisse-toi dessous, ramène vite les coudes vers l'avant et reçois la barre sur les épaules en quart de squat. Relève-toi, puis redescends la barre en suspension."
   }
  ]
 },
 "hanging-knee-raise": {
  "name": "Relevés de genoux suspendu",
  "instructions": [
   {
    "title": "Suspension",
    "text": "Suspends-toi à une barre de traction en pronation, bras tendus et jambes serrées."
   },
   {
    "title": "Montée",
    "text": "Monte les genoux vers la poitrine en enroulant le bassin vers le haut. Évite de te balancer."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement les jambes jusqu'à ce qu'elles pendent à nouveau droit avant la répétition suivante."
   }
  ]
 },
 "hanging-leg-raise": {
  "name": "Relevés de jambes suspendu",
  "instructions": [
   {
    "title": "Suspension",
    "text": "Suspends-toi à une barre de traction en pronation, bras tendus et épaules légèrement engagées."
   },
   {
    "title": "Montée",
    "text": "Lève les jambes tendues jusqu'à ce qu'elles soient au moins parallèles au sol, en basculant le bassin vers le haut."
   },
   {
    "title": "Descente",
    "text": "Redescends les jambes lentement sans te balancer. Marque une brève pause en bas avant la répétition suivante."
   }
  ]
 },
 "high-knees": {
  "name": "Montées de genoux",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, pieds écartés de la largeur des hanches et bras fléchis à 90°."
   },
   {
    "title": "Course",
    "text": "Cours sur place en montant chaque genou à hauteur de hanche et en balançant les bras."
   },
   {
    "title": "Continue",
    "text": "Reste sur l'avant des pieds, buste droit. Garde un rythme élevé pendant toute la durée sans te pencher en arrière."
   }
  ]
 },
 "high-to-low-cable-fly": {
  "name": "Écartés à la poulie haute vers bas",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les deux poulies au-dessus de la tête, prends une poignée dans chaque main et avance d'un pas en position fente, légèrement penché en avant."
   },
   {
    "title": "Rapprochement",
    "text": "Coudes légèrement fléchis, ramène les mains vers le bas et l'une vers l'autre jusqu'à ce qu'elles se rejoignent devant le bas du ventre."
   },
   {
    "title": "Retour",
    "text": "Laisse les bras remonter lentement vers le haut et l'extérieur jusqu'à sentir un étirement du bas des pectoraux."
   }
  ]
 },
 "hip-abduction-machine": {
  "name": "Abducteurs à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi dos contre le dossier, coussins contre l'extérieur des genoux."
   },
   {
    "title": "Écartement",
    "text": "Écarte les genoux aussi loin que possible en serrant le côté des fessiers, et tiens brièvement."
   },
   {
    "title": "Retour",
    "text": "Laisse les jambes se rapprocher lentement sans poser le bloc de poids."
   }
  ]
 },
 "hip-adduction-machine": {
  "name": "Adducteurs à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi dos contre le dossier, coussins contre l'intérieur des genoux. Pars d'un étirement que tu contrôles."
   },
   {
    "title": "Serrage",
    "text": "Rapproche les genoux jusqu'à ce que les coussins se rejoignent, dos contre le dossier."
   },
   {
    "title": "Retour",
    "text": "Laisse les jambes s'ouvrir lentement jusqu'au départ sans poser le poids."
   }
  ]
 },
 "hip-thrust": {
  "name": "Hip thrust barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi avec le haut du dos contre un banc et fais rouler une barre avec mousse sur tes hanches. Pieds à plat, écartés de la largeur des hanches."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans les talons et monte les hanches jusqu'à ce que ton corps soit droit des épaules aux genoux, tibias verticaux."
   },
   {
    "title": "Verrouillage",
    "text": "Serre fort les fessiers en haut, menton rentré, puis redescends de façon contrôlée."
   }
  ]
 },
 "hip-thrust-machine": {
  "name": "Hip thrust à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi dans la machine, haut du dos sur le coussin et ceinture ou coussin sur les hanches. Pieds à plat, écartés de la largeur des hanches."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans les talons et étends les hanches jusqu'à ce que ton corps soit droit des épaules aux genoux."
   },
   {
    "title": "Descente",
    "text": "Serre les fessiers une seconde en haut, puis redescends lentement sans poser la charge."
   }
  ]
 },
 "hollow-hold": {
  "name": "Hollow hold",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, bras au-dessus de la tête. Plaque fermement le bas du dos au sol."
   },
   {
    "title": "Décollage",
    "text": "Décolle les épaules, les bras et les jambes tendues de quelques centimètres du sol, pour que ton corps forme une légère banane."
   },
   {
    "title": "Maintien",
    "text": "Respire calmement et tiens la position. Si le bas du dos se décolle, plie les genoux ou ramène les bras vers l'avant."
   }
  ]
 },
 "incline-bench-press": {
  "name": "Développé incliné barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le banc à 30–45° et allonge-toi, les yeux sous la barre. Serre les omoplates en arrière et vers le bas, pieds bien posés."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la de façon contrôlée vers le haut de la poitrine, juste sous les clavicules, coudes à environ 45°."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre vers le haut et légèrement en arrière jusqu'à ce qu'elle soit au-dessus des épaules et que tes bras soient presque tendus."
   }
  ]
 },
 "incline-chest-press-machine": {
  "name": "Développé incliné à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées partent à hauteur du haut de la poitrine. Assieds-toi, dos et tête contre le dossier."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers le haut et l'avant jusqu'à avoir les bras presque tendus. Garde les épaules basses et en arrière."
   },
   {
    "title": "Retour",
    "text": "Redescends les poignées lentement jusqu'à sentir un étirement du haut des pectoraux, puis repousse avant que les plaques ne se posent."
   }
  ]
 },
 "incline-dumbbell-curl": {
  "name": "Curl incliné haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi en arrière sur un banc réglé à environ 45–60°. Laisse les bras pendre à la verticale, paumes vers l'avant."
   },
   {
    "title": "Curl",
    "text": "Monte les haltères sans laisser les coudes partir vers l'avant. Garde la tête et le dos sur le banc."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à ce que les bras pendent de nouveau à la verticale et que tu sentes un étirement du biceps."
   }
  ]
 },
 "incline-dumbbell-fly": {
  "name": "Écartés inclinés haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le banc à 30–45°, allonge-toi et pousse les haltères au-dessus du haut de la poitrine, paumes face à face."
   },
   {
    "title": "Ouverture",
    "text": "Descends les poids sur les côtés en un large arc, coudes légèrement fléchis, jusqu'à sentir un étirement du haut des pectoraux."
   },
   {
    "title": "Rapprochement",
    "text": "Remonte les haltères au-dessus du haut de la poitrine par le même arc. Garde les épaules basses et en arrière."
   }
  ]
 },
 "incline-dumbbell-hammer-curl": {
  "name": "Curl marteau incliné haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi en arrière sur un banc réglé à environ 45–60°. Laisse les bras pendre à la verticale, paumes face au corps."
   },
   {
    "title": "Curl",
    "text": "Monte les haltères, pouces vers le haut, sans laisser les coudes partir vers l'avant. Garde la tête et le dos sur le banc."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en gardant la prise neutre, jusqu'à ce que les bras pendent de nouveau à la verticale."
   }
  ]
 },
 "incline-dumbbell-press": {
  "name": "Développé incliné haltères",
  "instructions": [
   {
    "title": "Réglage du banc",
    "text": "Règle le dossier à 30–45°. Assieds-toi, haltères posés sur les cuisses."
   },
   {
    "title": "Position de départ",
    "text": "Allonge-toi et pousse les haltères au-dessus de la poitrine. Omoplates en arrière et vers le bas, pieds bien posés au sol."
   },
   {
    "title": "Descente",
    "text": "Descends les haltères lentement à hauteur de poitrine. Tes coudes pointent à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Pousse les haltères avec puissance jusqu'à avoir les bras presque tendus. Marque une brève pause en haut."
   }
  ]
 },
 "incline-push-up": {
  "name": "Pompes inclinées",
  "instructions": [
   {
    "title": "Planche",
    "text": "Place les mains sur un banc, un box ou une barre, un peu plus écartées que les épaules. Recule les pieds jusqu'à ce que ton corps soit droit."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine vers le bord, coudes à environ 45° du buste. Garde une ligne droite de la tête aux talons."
   },
   {
    "title": "Poussée",
    "text": "Repousse jusqu'à avoir les bras tendus. Prends un support plus bas avec le temps pour rendre l'exercice plus dur."
   }
  ]
 },
 "inverted-row": {
  "name": "Rowing inversé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle une barre à environ hauteur de taille dans un rack ou une Smith machine. Allonge-toi dessous, attrape-la en pronation et gaine ton corps droit."
   },
   {
    "title": "Tirage",
    "text": "Tire la poitrine vers la barre, le corps en ligne droite de la tête aux talons. Serre les omoplates."
   },
   {
    "title": "Descente",
    "text": "Redescends jusqu'à avoir les bras tendus sans laisser les hanches s'affaisser. Plie les genoux pour rendre l'exercice plus facile."
   }
  ]
 },
 "jm-press": {
  "name": "JM press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur un banc plat et tiens la barre un peu plus serrée que la largeur des épaules, bras tendus au-dessus des épaules."
   },
   {
    "title": "Descente",
    "text": "Descends la barre en ligne droite vers le menton, coudes rentrés et pointant vers les pieds. Arrête-toi juste au-dessus du menton, quand les avant-bras rejoignent les biceps."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre par le même chemin jusqu'à avoir les bras tendus au-dessus des épaules."
   }
  ]
 },
 "jump-rope": {
  "name": "Corde à sauter",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens une poignée dans chaque main, corde derrière les talons. Coudes près du corps, mains à hauteur de hanches."
   },
   {
    "title": "Saut",
    "text": "Fais tourner la corde avec les poignets et saute juste assez haut pour la passer, en te réceptionnant en douceur sur l'avant des pieds."
   },
   {
    "title": "Continue",
    "text": "Garde un rythme régulier pendant toute la durée, genoux légèrement fléchis et épaules relâchées. Si tu accroches la corde, repars tout de suite."
   }
  ]
 },
 "jump-squat": {
  "name": "Squat sauté",
  "instructions": [
   {
    "title": "Position",
    "text": "Tiens-toi pieds écartés de la largeur des épaules, mains contre la poitrine ou derrière la tête."
   },
   {
    "title": "Impulsion",
    "text": "Descends vite en quart ou demi-squat, en balançant les bras vers l'arrière si tu veux."
   },
   {
    "title": "Saut",
    "text": "Explose droit vers le haut, réceptionne-toi en douceur sur l'avant des pieds et enchaîne directement la répétition suivante."
   }
  ]
 },
 "jumping-jack": {
  "name": "Jumping jack",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, pieds joints et bras le long du corps."
   },
   {
    "title": "Saut",
    "text": "Écarte les pieds plus large que les épaules d'un saut en levant les bras au-dessus de la tête, puis reviens au départ d'un saut."
   },
   {
    "title": "Continue",
    "text": "Reste léger sur l'avant des pieds et garde un rythme régulier pendant toute la durée. Respire de façon régulière."
   }
  ]
 },
 "katana-extension": {
  "name": "Extension katana",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en D à la poulie basse et tiens-toi de profil. Prends-la avec la main éloignée de la machine pour que le câble traverse ton corps, et amène-la derrière la tête, coude en haut."
   },
   {
    "title": "Extension",
    "text": "Tends le bras en diagonale vers le haut et l'extérieur jusqu'à ce qu'il soit droit. Garde le haut du bras immobile contre la tête."
   },
   {
    "title": "Retour",
    "text": "Plie lentement le coude jusqu'à ramener la poignée derrière la tête, près de l'épaule opposée. Change de côté après la série."
   }
  ]
 },
 "kelso-shrug": {
  "name": "Shrug de Kelso",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre sur un banc incliné à 30–45°, un haltère dans chaque main, bras pendants."
   },
   {
    "title": "Serrage",
    "text": "Ramène les omoplates en arrière et l'une vers l'autre sans plier les coudes. Tiens la contraction une seconde."
   },
   {
    "title": "Relâchement",
    "text": "Laisse les omoplates s'écarter lentement jusqu'à ce que les épaules partent vers l'avant."
   }
  ]
 },
 "kettlebell-swing": {
  "name": "Swing kettlebell",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi pieds un peu plus écartés que les hanches, le kettlebell légèrement devant toi. Penche le buste depuis les hanches, attrape la poignée à deux mains et incline-la vers toi."
   },
   {
    "title": "Swing",
    "text": "Lance le kettlebell en arrière entre tes jambes, puis projette les hanches vers l'avant pour le monter à hauteur de poitrine. Les bras restent tendus et relâchés."
   },
   {
    "title": "Contrôle",
    "text": "Laisse le kettlebell retomber et penche le buste depuis les hanches quand il passe entre les jambes. Garde le dos plat et les talons au sol."
   }
  ]
 },
 "knee-push-up": {
  "name": "Pompes sur les genoux",
  "instructions": [
   {
    "title": "Planche",
    "text": "Mets-toi à genoux, mains au sol un peu plus écartées que les épaules. Forme une ligne droite de la tête aux genoux."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine vers le sol, coudes à environ 45° du buste. Garde les hanches alignées, sans les reculer."
   },
   {
    "title": "Poussée",
    "text": "Repousse le sol jusqu'à avoir les bras tendus. Garde les abdos serrés pour que le bas du dos ne s'affaisse pas."
   }
  ]
 },
 "l-sit": {
  "name": "L-sit",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les mains sur des parallettes, des barres de dips ou au sol à côté des hanches. Verrouille les bras et pousse les épaules vers le bas."
   },
   {
    "title": "Montée",
    "text": "Lève les jambes tendues devant toi jusqu'à ce qu'elles soient parallèles au sol. Pointe les orteils et serre les cuisses."
   },
   {
    "title": "Maintien",
    "text": "Respire calmement et tiens la position, poitrine haute. Si tes jambes descendent, plie les genoux pour garder la position."
   }
  ]
 },
 "landmine-press": {
  "name": "Développé landmine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Cale une extrémité d'une barre dans un landmine ou un coin. Tiens l'autre extrémité à hauteur d'épaule d'une main, pieds décalés."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre vers le haut et l'avant jusqu'à avoir le bras tendu, en laissant l'omoplate glisser vers l'avant en haut."
   },
   {
    "title": "Descente",
    "text": "Ramène la barre à l'épaule de façon contrôlée. Garde les hanches face à l'avant et ne te penche pas en arrière."
   }
  ]
 },
 "larsen-press": {
  "name": "Développé Larsen",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le banc, les yeux sous la barre. Tends les jambes et tiens les pieds juste au-dessus du sol."
   },
   {
    "title": "Descente",
    "text": "Décroche la barre et descends-la de façon contrôlée vers le bas de la poitrine, coudes à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre avec le haut du corps seulement. Gaine les abdos pour que les hanches restent à niveau et ne tournent pas."
   }
  ]
 },
 "lat-pulldown": {
  "name": "Tirage vertical",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle les coussins de cuisses pour que tes jambes soient bloquées. Attrape la barre en pronation, un peu plus large que les épaules."
   },
   {
    "title": "Tirage",
    "text": "Penche-toi légèrement en arrière et tire la barre vers le haut de la poitrine en ramenant les coudes vers les hanches."
   },
   {
    "title": "Retour",
    "text": "Laisse la barre remonter lentement jusqu'à avoir les bras tendus et les dorsaux étirés. Garde le buste immobile."
   }
  ]
 },
 "lateral-lunge": {
  "name": "Fente latérale",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi pieds joints, un haltère dans chaque main ou un seul contre la poitrine."
   },
   {
    "title": "Pas",
    "text": "Fais un grand pas sur le côté et recule les hanches au-dessus de cette jambe. L'autre jambe reste tendue, les deux pieds à plat."
   },
   {
    "title": "Retour",
    "text": "Pousse avec la jambe fléchie pour revenir au départ. Alterne les côtés ou termine d'abord un côté."
   }
  ]
 },
 "lateral-raise": {
  "name": "Élévations latérales haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, haltères le long du corps, coudes légèrement fléchis."
   },
   {
    "title": "Montée",
    "text": "Lève les haltères à hauteur d'épaules en guidant le mouvement avec les coudes. Ne balance pas et ne hausse pas les épaules."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en deux à trois secondes et garde la tension en bas."
   }
  ]
 },
 "leg-extension": {
  "name": "Leg extension",
  "instructions": [
   {
    "title": "Installation",
    "text": "Aligne les genoux avec l'axe de la machine et place le coussin juste au-dessus des chevilles."
   },
   {
    "title": "Extension",
    "text": "Tends complètement les jambes et serre les quadriceps en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends la charge lentement sans la poser."
   }
  ]
 },
 "leg-press": {
  "name": "Presse à cuisses",
  "instructions": [
   {
    "title": "Pieds",
    "text": "Place les pieds écartés de la largeur des épaules au milieu de la plateforme, bas du dos contre le dossier."
   },
   {
    "title": "Descente",
    "text": "Libère la sécurité et plie les genoux à environ 90°."
   },
   {
    "title": "Poussée",
    "text": "Repousse la plateforme dans toute la plante des pieds sans verrouiller les genoux."
   }
  ]
 },
 "leg-press-calf-raise": {
  "name": "Mollets à la presse",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi à la presse à cuisses, avant des pieds sur le bord bas de la plateforme, talons dans le vide. Jambes tendues, genoux non verrouillés."
   },
   {
    "title": "Poussée",
    "text": "Repousse la plateforme en pointant les orteils aussi loin que possible, sans plier les genoux."
   },
   {
    "title": "Retour",
    "text": "Laisse la plateforme revenir lentement jusqu'à l'étirement complet des mollets. Garde les pieds bien sur le bord."
   }
  ]
 },
 "low-to-high-cable-fly": {
  "name": "Écartés à la poulie basse vers haut",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les deux poulies en position la plus basse, prends une poignée dans chaque main et avance d'un pas en position fente."
   },
   {
    "title": "Montée",
    "text": "Coudes légèrement fléchis, monte les mains vers le haut et l'une vers l'autre à hauteur du haut de la poitrine, paumes vers le haut."
   },
   {
    "title": "Descente",
    "text": "Redescends les bras lentement vers le bas et l'extérieur jusqu'à sentir un étirement du haut des pectoraux."
   }
  ]
 },
 "lunge": {
  "name": "Fentes haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, haltères le long du corps."
   },
   {
    "title": "Pas",
    "text": "Fais un grand pas en avant et descends le genou arrière vers le sol."
   },
   {
    "title": "Retour",
    "text": "Pousse avec le pied avant pour revenir au départ et change de jambe."
   }
  ]
 },
 "lying-leg-curl": {
  "name": "Leg curl allongé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre, genoux juste au bord du coussin, alignés avec l'axe, et le rouleau juste au-dessus des talons."
   },
   {
    "title": "Curl",
    "text": "Ramène les talons vers les fessiers aussi loin que possible en gardant les hanches plaquées contre le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends la charge lentement jusqu'à avoir les jambes presque tendues, sans poser le bloc de poids."
   }
  ]
 },
 "lying-leg-raise": {
  "name": "Relevés de jambes allongé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, jambes tendues et mains sous les hanches ou le long du corps."
   },
   {
    "title": "Montée",
    "text": "Garde les jambes tendues et lève-les jusqu'à ce qu'elles pointent vers le plafond. Plaque le bas du dos au sol."
   },
   {
    "title": "Descente",
    "text": "Redescends les jambes lentement et arrête-toi juste avant que les talons touchent le sol."
   }
  ]
 },
 "machine-curl": {
  "name": "Curl biceps à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que tes coudes soient alignés avec l'axe de la machine et que le haut des bras repose à plat sur le coussin."
   },
   {
    "title": "Curl",
    "text": "Attrape les poignées et monte-les vers les épaules sans décoller les coudes du coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras presque tendus, en gardant la tension sur les biceps."
   }
  ]
 },
 "machine-high-row": {
  "name": "Rowing haut à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour atteindre les poignées bras tendus vers le haut. Bloque les cuisses sous le coussin."
   },
   {
    "title": "Tirage",
    "text": "Tire les poignées vers le bas et l'arrière, vers le bas de la poitrine, jusqu'à ce que les coudes dépassent le buste."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées remonter lentement jusqu'à avoir les bras tendus et les dorsaux étirés."
   }
  ]
 },
 "machine-lat-pulldown": {
  "name": "Tirage vertical à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les coussins de cuisses te maintiennent fermement. Attrape les poignées, bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Tire les poignées vers le bas à hauteur d'épaules en ramenant les coudes vers les hanches. Garde la poitrine haute."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées remonter lentement jusqu'à avoir les bras tendus. Ne pose pas la charge entre les répétitions."
   }
  ]
 },
 "machine-lateral-raise": {
  "name": "Élévations latérales à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que tes épaules soient alignées avec les axes de la machine. Appuie les bras contre les coussins."
   },
   {
    "title": "Montée",
    "text": "Lève les bras sur les côtés jusqu'à hauteur d'épaules en guidant le mouvement avec les coudes. Ne hausse pas les épaules."
   },
   {
    "title": "Descente",
    "text": "Redescends les coussins lentement en deux à trois secondes et arrête-toi avant que les plaques ne se posent."
   }
  ]
 },
 "machine-row": {
  "name": "Rowing assis à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées soient à hauteur de poitrine et plaque la poitrine contre le coussin."
   },
   {
    "title": "Tirage",
    "text": "Tire les poignées vers le buste en ramenant les coudes en arrière et en serrant les omoplates."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées repartir vers l'avant lentement jusqu'à avoir les bras tendus. Garde la poitrine sur le coussin."
   }
  ]
 },
 "meadows-row": {
  "name": "Meadows row",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi de profil par rapport à une barre landmine, pieds décalés, et attrape le bout du manchon en pronation. Pose l'autre avant-bras sur le genou avant."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre vers la hanche en montant le coude vers le haut et légèrement vers l'extérieur."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre jusqu'à avoir le bras tendu et sentir un étirement du dorsal. Termine la série, puis change de côté."
   }
  ]
 },
 "mountain-climber": {
  "name": "Mountain climber",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi en planche haute, mains sous les épaules et corps en ligne droite."
   },
   {
    "title": "Montée",
    "text": "Ramène un genou vers la poitrine, puis change de jambe rapidement, comme si tu courais."
   },
   {
    "title": "Position",
    "text": "Garde les hanches au niveau des épaules et les mains bien posées. Ralentis plutôt que de laisser les hanches monter."
   }
  ]
 },
 "negative-pull-up": {
  "name": "Tractions négatives",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur un box ou saute pour que le menton démarre au-dessus de la barre, paumes vers l'avant, mains à la largeur des épaules."
   },
   {
    "title": "Descente",
    "text": "Redescends aussi lentement que possible, en visant 3 à 5 secondes, jusqu'à avoir les bras tendus."
   },
   {
    "title": "Reprise",
    "text": "Remonte sur le box et recommence la répétition suivante depuis le haut. Reste gainé en bas au lieu de te laisser tomber."
   }
  ]
 },
 "neutral-grip-pull-up": {
  "name": "Tractions prise neutre",
  "instructions": [
   {
    "title": "Prise",
    "text": "Attrape les poignées parallèles paumes face à face et suspends-toi bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Ramène les coudes vers le bas, près du corps, jusqu'à ce que ton menton passe au-dessus des poignées."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus. Garde les jambes immobiles et évite de te balancer."
   }
  ]
 },
 "nordic-curl": {
  "name": "Nordic curl",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi à genoux sur un coussin, avec un partenaire ou un support fixe qui bloque tes talons. Garde le corps droit des genoux à la tête."
   },
   {
    "title": "Descente",
    "text": "Penche-toi vers l'avant aussi lentement que possible, en freinant avec les ischio-jambiers et en gardant les hanches en extension."
   },
   {
    "title": "Retour",
    "text": "Rattrape-toi avec les mains quand tu ne peux plus tenir, puis pousse légèrement et remonte en curl."
   }
  ]
 },
 "one-arm-dumbbell-row": {
  "name": "Rowing haltère à un bras",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pose un genou et la main du même côté sur un banc plat. Tiens l'haltère de l'autre main, dos plat."
   },
   {
    "title": "Tirage",
    "text": "Tire l'haltère vers la hanche en gardant le coude près du corps. Ne tourne pas le buste."
   },
   {
    "title": "Descente",
    "text": "Redescends l'haltère jusqu'à avoir le bras tendu et sentir un étirement du dorsal. Termine la série, puis change de côté."
   }
  ]
 },
 "overhead-cable-extension": {
  "name": "Extension triceps nuque à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à une poulie basse ou moyenne. Tourne le dos au bloc de poids en position fente, penche-toi légèrement en avant et tiens la corde derrière la tête."
   },
   {
    "title": "Extension",
    "text": "Tends les bras vers l'avant et le haut jusqu'à ce qu'ils soient droits. Garde les coudes près de la tête."
   },
   {
    "title": "Retour",
    "text": "Plie les coudes lentement jusqu'à ce que les mains soient derrière la tête et que tu sentes un étirement des triceps."
   }
  ]
 },
 "overhead-dumbbell-extension": {
  "name": "Extension triceps haltère",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc avec dossier et tiens un haltère à la verticale au-dessus de la tête, les deux mains en coupe sous le disque du haut, bras tendus."
   },
   {
    "title": "Descente",
    "text": "Plie les coudes pour descendre l'haltère derrière la tête. Garde les coudes dirigés vers l'avant et près de la tête."
   },
   {
    "title": "Extension",
    "text": "Tends les bras pour ramener l'haltère au-dessus de la tête. Gaine les abdos pour ne pas cambrer le bas du dos."
   }
  ]
 },
 "overhead-press": {
  "name": "Développé militaire",
  "instructions": [
   {
    "title": "Installation",
    "text": "Décroche la barre à hauteur des clavicules, mains juste à l'extérieur des épaules, avant-bras verticaux. Serre les fessiers et les abdos."
   },
   {
    "title": "Poussée",
    "text": "Pousse droit vers le haut en reculant la tête pour dégager le menton, puis avance la tête dès que la barre passe le front."
   },
   {
    "title": "Descente",
    "text": "Verrouille avec la barre au-dessus du milieu du pied, puis redescends-la de façon contrôlée jusqu'aux clavicules sans te pencher en arrière."
   }
  ]
 },
 "pallof-press": {
  "name": "Pallof press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en D à hauteur de poitrine et tiens-toi de profil par rapport à la machine. Tiens la poignée contre la poitrine à deux mains, pieds écartés de la largeur des épaules."
   },
   {
    "title": "Poussée",
    "text": "Pousse la poignée droit devant ta poitrine et résiste au câble qui te tire sur le côté. Tiens une seconde."
   },
   {
    "title": "Retour",
    "text": "Ramène la poignée contre la poitrine de façon contrôlée, hanches et épaules face à l'avant. Change de côté après la série."
   }
  ]
 },
 "paused-bench-press": {
  "name": "Développé couché pause",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le banc, les yeux sous la barre. Serre les omoplates et cale tes pieds."
   },
   {
    "title": "Pause",
    "text": "Descends la barre de façon contrôlée vers le bas de la poitrine et tiens-la immobile une à deux secondes, en restant gainé."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre depuis l'arrêt complet, sans rebond ni relâchement avant. Garde les fessiers sur le banc."
   }
  ]
 },
 "paused-deadlift": {
  "name": "Soulevé de terre pause",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place-toi comme pour un soulevé de terre classique : pieds écartés de la largeur des hanches, barre au-dessus du milieu du pied, prise juste à l'extérieur des jambes, dos plat."
   },
   {
    "title": "Pause",
    "text": "Décolle la barre du sol ou monte-la juste sous les genoux et tiens 1 à 2 secondes. Garde le dos plat et la barre près du corps."
   },
   {
    "title": "Fin du mouvement",
    "text": "Continue jusqu'à te redresser complètement, puis redescends la barre au sol de façon contrôlée."
   }
  ]
 },
 "paused-squat": {
  "name": "Squat pause",
  "instructions": [
   {
    "title": "Installation",
    "text": "Décroche la barre sur le haut du dos, pieds écartés de la largeur des épaules, pointes légèrement vers l'extérieur. Gaine fort."
   },
   {
    "title": "Pause",
    "text": "Descends au moins jusqu'à la parallèle et reste immobile en bas pendant 2 secondes sans perdre la tension."
   },
   {
    "title": "Poussée",
    "text": "Remonte sans rebondir en poussant dans toute la plante des pieds."
   }
  ]
 },
 "pec-deck": {
  "name": "Pec deck",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées soient à hauteur de poitrine. Assieds-toi dos contre le dossier et attrape les poignées."
   },
   {
    "title": "Rapprochement",
    "text": "Coudes légèrement fléchis, rapproche les poignées devant la poitrine. Serre une seconde."
   },
   {
    "title": "Ouverture",
    "text": "Laisse les bras s'ouvrir lentement jusqu'à sentir un étirement des pectoraux. Garde les épaules en arrière contre le dossier."
   }
  ]
 },
 "pendlay-row": {
  "name": "Pendlay row",
  "instructions": [
   {
    "title": "Installation",
    "text": "Barre au sol au-dessus du milieu du pied. Penche le buste depuis les hanches jusqu'à ce qu'il soit presque parallèle au sol et attrape la barre en pronation, dos plat."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre du sol vers le bas de la poitrine de façon explosive, sans relever le buste."
   },
   {
    "title": "Reprise",
    "text": "Redescends la barre au sol et laisse-la s'arrêter complètement. Replace ton gainage avant chaque répétition."
   }
  ]
 },
 "pendulum-squat": {
  "name": "Squat pendulaire",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur la plateforme, dos plaqué contre le dossier et épaules sous les coussins. Pieds écartés de la largeur des hanches, au milieu de la plateforme."
   },
   {
    "title": "Descente",
    "text": "Libère la butée et laisse le dossier descendre en arc. Descends aussi bas que possible, talons au sol."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds pour remonter, en gardant les genoux légèrement fléchis en haut."
   }
  ]
 },
 "pike-push-up": {
  "name": "Pompes pike",
  "instructions": [
   {
    "title": "Installation",
    "text": "Mets-toi en position de pompe, puis rapproche les pieds et monte les hanches pour que ton corps forme un V inversé."
   },
   {
    "title": "Descente",
    "text": "Plie les coudes et descends le haut de la tête vers le sol, juste devant les mains. Les coudes pointent vers l'arrière, pas vers l'extérieur."
   },
   {
    "title": "Poussée",
    "text": "Remonte jusqu'à avoir les bras tendus, hanches hautes. Pose les pieds sur un box pour rendre l'exercice plus dur."
   }
  ]
 },
 "pin-press": {
  "name": "Pin press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle les sécurités d'un rack à quelques centimètres au-dessus de la poitrine et pose la barre dessus. Allonge-toi sur le banc dessous."
   },
   {
    "title": "Gainage",
    "text": "Serre les omoplates, cale tes pieds et attrape la barre. Sois gainé avant que la barre ne quitte les sécurités."
   },
   {
    "title": "Poussée",
    "text": "Pousse depuis l'arrêt complet jusqu'au verrouillage, puis redescends la barre sur les sécurités et laisse-la se poser complètement avant la répétition suivante."
   }
  ]
 },
 "plank": {
  "name": "Planche",
  "instructions": [
   {
    "title": "Avant-bras",
    "text": "Coudes sous les épaules, avant-bras au sol."
   },
   {
    "title": "Gainage",
    "text": "Monte le corps pour former une ligne droite. Serre les fessiers et les abdos."
   },
   {
    "title": "Maintien",
    "text": "Respire calmement et tiens la position sans laisser les hanches s'affaisser."
   }
  ]
 },
 "power-clean": {
  "name": "Power clean",
  "instructions": [
   {
    "title": "Installation",
    "text": "Barre au-dessus du milieu du pied, pieds écartés de la largeur des hanches, prise juste à l'extérieur des jambes. Hanches au-dessus des genoux, poitrine haute, dos plat, bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Monte la barre de façon fluide au-delà des genoux, puis étends hanches, genoux et chevilles de façon explosive et hausse les épaules, en gardant la barre près du corps."
   },
   {
    "title": "Réception",
    "text": "Glisse-toi dessous, ramène vite les coudes vers l'avant et reçois la barre sur les épaules en quart de squat. Relève-toi complètement."
   }
  ]
 },
 "preacher-curl": {
  "name": "Curl pupitre barre EZ",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au pupitre, aisselles bien calées contre le haut du coussin. Tiens la barre en supination."
   },
   {
    "title": "Curl",
    "text": "Monte la barre jusqu'à ce que les avant-bras soient presque verticaux. Garde l'arrière des bras sur le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir le bras presque tendu. Ne laisse pas la barre tomber en position basse."
   }
  ]
 },
 "prone-t-raise": {
  "name": "Élévations en T allongé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre, bras écartés sur les côtés en T, pouces vers le haut."
   },
   {
    "title": "Montée",
    "text": "Serre les omoplates l'une vers l'autre et décolle les bras du sol. Garde la nuque allongée et le regard vers le sol. Tiens 1 à 2 secondes."
   },
   {
    "title": "Descente",
    "text": "Redescends les bras lentement et relâche brièvement."
   }
  ]
 },
 "prone-y-raise": {
  "name": "Élévations en Y allongé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre, bras tendus au-dessus de la tête en Y, pouces vers le haut. Pose le front sur une serviette pliée."
   },
   {
    "title": "Montée",
    "text": "Ramène les omoplates en arrière et vers le bas et décolle les bras du sol aussi haut que possible sans cambrer le bas du dos. Tiens 1 à 2 secondes."
   },
   {
    "title": "Descente",
    "text": "Redescends les bras lentement et relâche brièvement avant la répétition suivante."
   }
  ]
 },
 "pull-up": {
  "name": "Tractions",
  "instructions": [
   {
    "title": "Prise",
    "text": "Attrape la barre un peu plus large que les épaules et suspends-toi bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Ramène les coudes vers les hanches jusqu'à ce que ton menton passe au-dessus de la barre ou que la barre atteigne le haut de la poitrine."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus sans te laisser tomber en bas."
   }
  ]
 },
 "push-press": {
  "name": "Push press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens la barre sur les clavicules, mains juste à l'extérieur des épaules, pieds écartés de la largeur des hanches. Gaine le tronc."
   },
   {
    "title": "Flexion et poussée",
    "text": "Fléchis les genoux de quelques centimètres, buste droit, puis pousse de façon explosive avec les jambes."
   },
   {
    "title": "Poussée",
    "text": "Utilise cet élan pour pousser la barre jusqu'au verrouillage au-dessus de la tête. Redescends-la sur les clavicules en amortissant avec les genoux."
   }
  ]
 },
 "push-up": {
  "name": "Pompes",
  "instructions": [
   {
    "title": "Planche",
    "text": "Mains un peu plus écartées que les épaules, corps en ligne droite de la tête aux talons."
   },
   {
    "title": "Descente",
    "text": "Descends la poitrine vers le sol, coudes à environ 45° du buste."
   },
   {
    "title": "Poussée",
    "text": "Repousse le sol jusqu'à avoir les bras tendus. Ne laisse pas les hanches s'affaisser."
   }
  ]
 },
 "rack-pull": {
  "name": "Rack pull",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place la barre sur les sécurités ou des blocs juste sous ou juste au-dessus des genoux. Pieds écartés de la largeur des hanches, prise juste à l'extérieur des jambes."
   },
   {
    "title": "Gainage",
    "text": "Penche le buste depuis les hanches, dos plat, épaules légèrement devant la barre. Inspire et tends la barre pour enlever le jeu."
   },
   {
    "title": "Soulevé",
    "text": "Pousse les hanches vers l'avant et redresse-toi en serrant les fessiers en haut. Repose la barre sur les sécurités de façon contrôlée."
   }
  ]
 },
 "reverse-crunch": {
  "name": "Crunch inversé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, bras le long du corps, hanches et genoux fléchis à 90° et tibias parallèles au sol."
   },
   {
    "title": "Enroulement",
    "text": "Avec les abdos, décolle les hanches du sol en ramenant les genoux vers la poitrine. Ne balance pas les jambes."
   },
   {
    "title": "Descente",
    "text": "Redescends les hanches lentement jusqu'au sol, jusqu'à ce que les tibias soient de nouveau parallèles."
   }
  ]
 },
 "reverse-curl": {
  "name": "Curl inversé barre",
  "instructions": [
   {
    "title": "Prise",
    "text": "Tiens la barre en pronation, mains écartées de la largeur des épaules, bras tendus devant les cuisses."
   },
   {
    "title": "Curl",
    "text": "Monte la barre vers les épaules en gardant les coudes collés au corps et les poignets droits."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre lentement jusqu'à avoir les bras tendus sans balancer le buste."
   }
  ]
 },
 "reverse-fly": {
  "name": "Oiseau haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Penche le buste depuis les hanches jusqu'à ce qu'il soit presque parallèle au sol, dos plat. Laisse les haltères pendre sous la poitrine."
   },
   {
    "title": "Montée",
    "text": "Coudes légèrement fléchis, lève les haltères sur les côtés jusqu'à aligner les bras avec les épaules. Ne balance pas."
   },
   {
    "title": "Descente",
    "text": "Redescends les haltères lentement sous la poitrine sans arrondir le dos ni te redresser."
   }
  ]
 },
 "reverse-hack-squat": {
  "name": "Hack squat inversé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fais face à la machine, poitrine contre le dossier et épaules sous les coussins. Pieds écartés de la largeur des hanches sur la plateforme."
   },
   {
    "title": "Descente",
    "text": "Libère les sécurités et recule les hanches vers le bas, en laissant le buste pencher vers l'avant avec le coussin."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans les talons et serre les fessiers pour remonter, sans verrouiller les genoux en haut."
   }
  ]
 },
 "reverse-hyperextension": {
  "name": "Hyperextension inversée",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre sur le coussin, hanches au bord, et attrape les poignées. Accroche les chevilles dans la sangle ou le rouleau."
   },
   {
    "title": "Montée",
    "text": "Serre les fessiers pour lever les jambes jusqu'à les aligner avec le buste. Ne cambre pas fort en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends les jambes de façon contrôlée jusqu'à ce qu'elles pendent à la verticale. Contrôle le balancement au lieu de te laisser porter par l'élan."
   }
  ]
 },
 "reverse-lunge": {
  "name": "Fentes arrière haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, pieds écartés de la largeur des hanches, un haltère dans chaque main le long du corps."
   },
   {
    "title": "Pas en arrière",
    "text": "Fais un grand pas en arrière et descends le genou arrière vers le sol, buste droit."
   },
   {
    "title": "Retour",
    "text": "Pousse dans le talon avant pour ramener le pied arrière au départ. Alterne les jambes ou fais un côté à la fois."
   }
  ]
 },
 "reverse-pec-deck": {
  "name": "Pec deck inversé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi face au coussin de poitrine et règle le siège pour que les poignées soient à hauteur d'épaules. Attrape-les, bras tendus devant toi."
   },
   {
    "title": "Écartement",
    "text": "Coudes légèrement fléchis, écarte les bras vers l'extérieur et l'arrière jusqu'à les aligner avec le buste. Garde la poitrine sur le coussin."
   },
   {
    "title": "Retour",
    "text": "Ramène les poignées vers l'avant lentement jusqu'à avoir de nouveau les mains devant toi, sans poser les plaques."
   }
  ]
 },
 "reverse-snow-angel": {
  "name": "Snow angel inversé",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre, bras le long du corps, paumes vers le bas, et décolle légèrement les mains et la poitrine du sol."
   },
   {
    "title": "Balayage",
    "text": "Bras tendus et décollés du sol, balaie-les sur les côtés puis au-dessus de la tête en un large arc."
   },
   {
    "title": "Retour",
    "text": "Ramène-les par le même chemin jusqu'aux hanches en serrant les omoplates. Ça fait une répétition."
   }
  ]
 },
 "romanian-deadlift": {
  "name": "Soulevé de terre roumain",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, barre à hauteur des hanches, genoux légèrement fléchis."
   },
   {
    "title": "Charnière",
    "text": "Recule les hanches et fais glisser la barre le long des cuisses jusqu'à sentir un étirement des ischio-jambiers."
   },
   {
    "title": "Remontée",
    "text": "Pousse les hanches vers l'avant pour te relever. Le dos reste plat du début à la fin."
   }
  ]
 },
 "rope-hammer-curl": {
  "name": "Curl marteau à la corde",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à la poulie basse. Tiens les extrémités paumes face à face, bras tendus, coudes le long du corps."
   },
   {
    "title": "Curl",
    "text": "Monte la corde vers les épaules, pouces vers le haut et haut des bras immobile."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir les bras tendus, en gardant le câble sous tension."
   }
  ]
 },
 "rope-pushdown": {
  "name": "Extension triceps à la corde",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une corde à la poulie haute. Tiens les extrémités paumes face à face et colle les coudes au corps."
   },
   {
    "title": "Poussée",
    "text": "Pousse la corde vers le bas jusqu'à avoir les bras tendus, en écartant les extrémités en bas."
   },
   {
    "title": "Retour",
    "text": "Laisse la corde remonter lentement jusqu'à ce que les avant-bras soient juste au-dessus de l'horizontale. Garde les coudes immobiles."
   }
  ]
 },
 "rowing-machine": {
  "name": "Rameur",
  "instructions": [
   {
    "title": "Installation",
    "text": "Attache tes pieds avec la sangle sur la partie la plus large du pied. Règle le volet à un niveau modéré, autour de 3 à 5."
   },
   {
    "title": "Coup de rame",
    "text": "Pousse d'abord avec les jambes, puis penche-toi légèrement en arrière et tire la poignée vers le bas des côtes. Reviens dans l'ordre inverse : bras, buste, jambes."
   },
   {
    "title": "Rythme",
    "text": "Fais durer le retour environ deux fois plus longtemps que la poussée et garde une cadence régulière, autour de 20 à 24 coups par minute pour un effort facile."
   }
  ]
 },
 "russian-twist": {
  "name": "Russian twist",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi genoux fléchis et talons au sol, penche-toi en arrière à environ 45° et joins les mains devant la poitrine."
   },
   {
    "title": "Rotation",
    "text": "Tourne le buste d'un côté jusqu'à ce que les mains soient à côté de la hanche, puis de l'autre. Tourne depuis les côtes, pas seulement avec les bras."
   },
   {
    "title": "Contrôle",
    "text": "Garde la poitrine haute et le dos droit. Décolle les pieds du sol pour rendre l'exercice plus dur."
   }
  ]
 },
 "safety-bar-squat": {
  "name": "Squat à la safety bar",
  "instructions": [
   {
    "title": "Installation",
    "text": "Pose le support rembourré sur le haut du dos et tiens les poignées devant toi. Pieds écartés de la largeur des épaules."
   },
   {
    "title": "Descente",
    "text": "Descends entre les hanches, poitrine haute. Tire les poignées vers le bas pour que la barre ne te fasse pas basculer vers l'avant."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds pour remonter, en gardant le haut du dos bien plaqué contre les coussins."
   }
  ]
 },
 "seal-row": {
  "name": "Seal row",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre sur un banc assez haut pour que la barre pende sous toi à bout de bras. Attrape-la en pronation, à la largeur des épaules."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre jusqu'au dessous du banc en ramenant les coudes en arrière. Garde la poitrine et les hanches sur le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre lentement jusqu'à avoir les bras tendus et laisse les omoplates s'écarter. Sans coups de pied ni balancement."
   }
  ]
 },
 "seated-barbell-press": {
  "name": "Développé épaules assis barre",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place un banc à dossier droit dans un rack, la barre juste sous la hauteur des épaules quand tu es assis. Assieds-toi dos contre le dossier."
   },
   {
    "title": "Poussée",
    "text": "Décroche avec les mains juste à l'extérieur des épaules et pousse droit vers le haut, en reculant légèrement la tête pour laisser passer la barre."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre de façon contrôlée vers le haut de la poitrine. Garde le dos contre le dossier sans te cambrer."
   }
  ]
 },
 "seated-cable-row": {
  "name": "Rowing assis à la poulie",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en V à la poulie basse. Assieds-toi, pieds sur la plateforme, genoux souples, et tiens la poignée bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Redresse-toi et tire la poignée vers le ventre, coudes près du corps, en serrant les omoplates."
   },
   {
    "title": "Retour",
    "text": "Laisse les bras se tendre lentement jusqu'à ce qu'ils soient droits. Penche-toi à peine vers l'avant et n'arrondis pas le dos."
   }
  ]
 },
 "seated-calf-raise": {
  "name": "Mollets assis",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi, avant des pieds sur le bord de la plateforme et coussin de genoux calé sur le bas des cuisses."
   },
   {
    "title": "Montée",
    "text": "Libère la sécurité et monte sur la pointe des pieds aussi haut que possible. Marque une brève pause en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement les talons sous la plateforme pour un étirement complet, sans rebondir."
   }
  ]
 },
 "seated-dumbbell-curl": {
  "name": "Curl assis haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Assieds-toi droit au bord d'un banc, pieds à plat et haltères le long du corps, coudes près du buste."
   },
   {
    "title": "Curl",
    "text": "Plie les coudes et monte les haltères vers les épaules sans te pencher en arrière."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir de nouveau les bras tendus."
   }
  ]
 },
 "seated-dumbbell-hammer-curl": {
  "name": "Curl marteau assis haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Assieds-toi droit au bord d'un banc, pieds à plat et haltères le long du corps, paumes face au corps et coudes près du buste."
   },
   {
    "title": "Curl",
    "text": "Monte les haltères, pouces vers le haut, jusqu'à ce que les avant-bras soient presque verticaux. Ne te penche pas en arrière."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en gardant la prise neutre, jusqu'à avoir de nouveau les bras tendus."
   }
  ]
 },
 "seated-dumbbell-lateral-raise": {
  "name": "Élévations latérales assis haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Assieds-toi droit au bord d'un banc, pieds à plat, haltères le long du corps et coudes légèrement fléchis."
   },
   {
    "title": "Montée",
    "text": "Lève les haltères à hauteur d'épaules en guidant le mouvement avec les coudes. Ne te penche pas et ne hausse pas les épaules."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement en deux à trois secondes et garde la tension en bas."
   }
  ]
 },
 "seated-dumbbell-rear-delt-fly": {
  "name": "Oiseau assis haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au bord d'un banc, pieds à plat, et penche-toi en avant jusqu'à ce que la poitrine soit près des cuisses, dos plat. Laisse les haltères pendre à côté des mollets."
   },
   {
    "title": "Montée",
    "text": "Coudes légèrement fléchis, lève les haltères sur les côtés jusqu'à aligner les bras avec les épaules. Ne balance pas."
   },
   {
    "title": "Descente",
    "text": "Redescends les haltères lentement sans arrondir le dos ni te redresser."
   }
  ]
 },
 "seated-dumbbell-shoulder-press": {
  "name": "Développé épaules assis haltères",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc au dossier presque droit, dos contre le dossier et pieds à plat. Tiens les haltères à hauteur d'épaules, poignets au-dessus des coudes."
   },
   {
    "title": "Poussée",
    "text": "Pousse droit vers le haut jusqu'à avoir les bras verrouillés au-dessus de la tête. Garde les hanches et le dos sur le banc."
   },
   {
    "title": "Descente",
    "text": "Ramène les haltères à hauteur d'épaules de façon contrôlée, sans cambrer le bas du dos."
   }
  ]
 },
 "seated-leg-curl": {
  "name": "Leg curl assis",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi, genoux alignés avec l'axe, rouleau inférieur juste au-dessus des talons et coussin de cuisses bien verrouillé."
   },
   {
    "title": "Curl",
    "text": "Ramène les talons vers le bas et l'arrière sous le siège aussi loin que possible, en penchant légèrement le buste vers l'avant."
   },
   {
    "title": "Retour",
    "text": "Laisse le rouleau remonter lentement jusqu'à avoir les jambes presque tendues, en gardant la tension en haut."
   }
  ]
 },
 "seated-leg-press": {
  "name": "Presse à cuisses assis",
  "instructions": [
   {
    "title": "Pieds",
    "text": "Assieds-toi dos contre le dossier et place les pieds écartés de la largeur des épaules au milieu de la plateforme. Tiens les poignées latérales."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds jusqu'à avoir les jambes presque tendues, sans verrouiller les genoux."
   },
   {
    "title": "Descente",
    "text": "Replie les genoux lentement jusqu'à environ 90°."
   }
  ]
 },
 "seated-shoulder-press": {
  "name": "Développé épaules à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que les poignées soient à hauteur d'épaules ou un peu en dessous. Assieds-toi dos bien plaqué contre le dossier."
   },
   {
    "title": "Poussée",
    "text": "Pousse les poignées vers le haut jusqu'à avoir les bras presque tendus. Ne hausse pas les épaules et ne décolle pas le dos du dossier."
   },
   {
    "title": "Descente",
    "text": "Redescends les poignées lentement à hauteur d'épaules et arrête-toi juste avant que les plaques ne se posent."
   }
  ]
 },
 "side-plank": {
  "name": "Planche latérale",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le côté, coude sous l'épaule et pieds l'un sur l'autre."
   },
   {
    "title": "Montée",
    "text": "Monte les hanches jusqu'à ce que ton corps forme une ligne droite de la tête aux talons. Garde les hanches empilées, sans les faire rouler vers l'avant."
   },
   {
    "title": "Maintien",
    "text": "Respire calmement et tiens sans laisser les hanches tomber. Change ensuite de côté et tiens le même temps."
   }
  ]
 },
 "single-arm-cable-row": {
  "name": "Rowing à la poulie à un bras",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée simple à une poulie basse ou à hauteur de poitrine. Assis ou debout face à elle, tiens la poignée d'un bras tendu."
   },
   {
    "title": "Tirage",
    "text": "Tire la poignée vers ton flanc en ramenant le coude en arrière au-delà du buste. Garde les épaules face à l'avant."
   },
   {
    "title": "Retour",
    "text": "Laisse ton bras repartir lentement vers l'avant pour un étirement complet. Termine la série, puis change de bras."
   }
  ]
 },
 "single-arm-dumbbell-press": {
  "name": "Développé épaules haltère à un bras",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assis ou debout bien droit, tiens un haltère à hauteur d'épaule, poignet au-dessus du coude. Gaine les abdos et les fessiers."
   },
   {
    "title": "Poussée",
    "text": "Pousse l'haltère droit vers le haut jusqu'à l'extension complète du bras. Ne te penche pas de l'autre côté."
   },
   {
    "title": "Descente",
    "text": "Ramène le poids à hauteur d'épaule de façon contrôlée. Termine toutes les répétitions d'un côté, puis change."
   }
  ]
 },
 "single-arm-lat-pulldown": {
  "name": "Tirage vertical à un bras",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée simple à une poulie haute. Assieds-toi ou mets-toi à genoux et tiens-la d'un bras tendu au-dessus de la tête."
   },
   {
    "title": "Tirage",
    "text": "Ramène le coude vers le flanc jusqu'à ce que la main soit à côté de l'épaule. Ne tourne pas le buste."
   },
   {
    "title": "Retour",
    "text": "Laisse ton bras remonter lentement et sens l'étirement sur le côté. Termine toutes les répétitions, puis change de bras."
   }
  ]
 },
 "single-arm-pushdown": {
  "name": "Extension triceps à la poulie à un bras",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une poignée en D à une poulie haute. Attrape-la d'une main et colle ce coude au flanc."
   },
   {
    "title": "Poussée",
    "text": "Pousse la poignée vers le bas jusqu'à avoir le bras complètement tendu. Serre le triceps en bas."
   },
   {
    "title": "Retour",
    "text": "Laisse la poignée remonter lentement jusqu'à ce que l'avant-bras soit juste au-dessus de l'horizontale. Change de bras après la série."
   }
  ]
 },
 "single-leg-calf-raise": {
  "name": "Mollets à une jambe",
  "instructions": [
   {
    "title": "Position",
    "text": "Tiens-toi sur un pied, avant du pied sur le bord d'une marche, avec si tu veux un haltère dans la main du même côté. Tiens-toi de l'autre main."
   },
   {
    "title": "Montée",
    "text": "Monte sur la pointe du pied aussi haut que possible, jambe tendue, et marque une brève pause."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement le talon sous la marche pour un étirement complet. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "single-leg-glute-bridge": {
  "name": "Pont fessier à une jambe",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, un pied à plat près des fessiers et l'autre jambe tendue ou ramenée vers la poitrine."
   },
   {
    "title": "Montée",
    "text": "Pousse dans le talon au sol et monte les hanches jusqu'à ce qu'elles soient à niveau et alignées avec le genou."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement sans laisser les hanches basculer. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "single-leg-press": {
  "name": "Presse à cuisses à une jambe",
  "instructions": [
   {
    "title": "Pied",
    "text": "Place un pied au milieu de la plateforme, dans l'axe de la hanche. Pose l'autre pied au sol ou sur le cadre."
   },
   {
    "title": "Descente",
    "text": "Libère la sécurité et plie le genou lentement jusqu'à environ 90°, hanches sur le siège."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante du pied sans verrouiller le genou. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "single-leg-romanian-deadlift": {
  "name": "Soulevé de terre roumain à une jambe",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi sur une jambe, genou souple, un haltère dans la main opposée."
   },
   {
    "title": "Charnière",
    "text": "Penche-toi vers l'avant depuis la hanche pendant que l'autre jambe part en arrière, jusqu'à ce que le buste soit presque parallèle au sol. Garde les hanches face à l'avant."
   },
   {
    "title": "Remontée",
    "text": "Pousse la hanche d'appui vers l'avant pour te redresser. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "sissy-squat": {
  "name": "Sissy squat",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens un poteau ou un banc de sissy squat pour l'équilibre et monte sur l'avant des pieds, écartés de la largeur des hanches."
   },
   {
    "title": "Inclinaison",
    "text": "Pousse les genoux vers l'avant et le bas en te penchant en arrière, en gardant une ligne droite des genoux aux épaules."
   },
   {
    "title": "Retour",
    "text": "Serre les quadriceps pour te relever, en gardant les hanches en extension tout du long."
   }
  ]
 },
 "sit-up": {
  "name": "Relevés de buste",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le dos, genoux fléchis et pieds à plat, calés sous un coussin si besoin. Croise les bras sur la poitrine."
   },
   {
    "title": "Montée",
    "text": "Enroule le buste vertèbre après vertèbre jusqu'à rapprocher la poitrine des cuisses."
   },
   {
    "title": "Descente",
    "text": "Redescends en déroulant lentement jusqu'à ce que les épaules touchent le sol. Ne rebondis pas sur le sol pour prendre de l'élan."
   }
  ]
 },
 "smith-bench-press": {
  "name": "Développé couché à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place un banc plat sous la barre pour qu'elle soit alignée avec le bas de ta poitrine. Règle les butées de sécurité juste sous la hauteur de poitrine."
   },
   {
    "title": "Descente",
    "text": "Prends la barre un peu plus large que les épaules, tourne-la pour la libérer des crochets et descends-la de façon contrôlée vers le bas de la poitrine."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre droit vers le haut jusqu'à avoir les bras presque tendus. Garde les omoplates en arrière et les fessiers sur le banc."
   }
  ]
 },
 "smith-calf-raise": {
  "name": "Mollets à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur une marche ou un disque sous la barre de la Smith, la barre sur le haut du dos et l'avant des pieds sur le bord."
   },
   {
    "title": "Montée",
    "text": "Décroche la barre et monte sur la pointe des pieds aussi haut que possible, jambes tendues. Marque une brève pause en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement les talons sous le bord pour un étirement complet. Raccroche la barre après ta dernière répétition."
   }
  ]
 },
 "smith-close-grip-bench-press": {
  "name": "Développé couché prise serrée à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place un banc plat sous la barre pour qu'elle soit alignée avec le bas de ta poitrine. Prends la barre à environ la largeur des épaules."
   },
   {
    "title": "Descente",
    "text": "Tourne la barre pour la libérer des crochets et descends-la vers le bas de la poitrine, coudes collés au corps."
   },
   {
    "title": "Poussée",
    "text": "Repousse jusqu'à avoir les bras tendus, en poussant avec les triceps. Garde les poignets au-dessus des coudes."
   }
  ]
 },
 "smith-incline-bench-press": {
  "name": "Développé incliné à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place un banc incliné à 30–45° sous la barre pour qu'elle soit alignée avec le haut de ta poitrine. Règle les butées de sécurité juste sous la hauteur de poitrine."
   },
   {
    "title": "Descente",
    "text": "Tourne la barre pour la libérer des crochets et descends-la de façon contrôlée vers le haut de la poitrine, juste sous les clavicules."
   },
   {
    "title": "Poussée",
    "text": "Repousse la barre droit vers le haut jusqu'à avoir les bras presque tendus. Garde les omoplates en arrière contre le banc."
   }
  ]
 },
 "smith-lunge": {
  "name": "Fentes à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place la barre sur le haut du dos, décroche-la et passe en position fente : un pied devant, talon arrière levé."
   },
   {
    "title": "Descente",
    "text": "Descends le genou arrière droit vers le sol jusqu'à ce que la cuisse avant soit à peu près parallèle."
   },
   {
    "title": "Poussée",
    "text": "Remonte en poussant dans le pied avant sans verrouiller complètement. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "smith-shoulder-press": {
  "name": "Développé épaules à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place un banc à dossier droit sous la Smith machine pour que la barre passe juste devant ton visage. Assieds-toi dos contre le dossier."
   },
   {
    "title": "Poussée",
    "text": "Tourne la barre pour la libérer des crochets, mains juste à l'extérieur des épaules, et pousse jusqu'à avoir les bras presque tendus."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre de façon contrôlée à hauteur du menton ou juste en dessous. Garde le dos contre le dossier et les abdos serrés."
   }
  ]
 },
 "smith-squat": {
  "name": "Squat à la Smith",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place la barre sur le haut du dos et les pieds écartés de la largeur des épaules, légèrement devant la barre."
   },
   {
    "title": "Descente",
    "text": "Tourne la barre pour la libérer des crochets et descends jusqu'à ce que les cuisses soient au moins parallèles, dos plat."
   },
   {
    "title": "Poussée",
    "text": "Remonte en poussant dans toute la plante des pieds et retourne la barre sur les crochets après ta dernière répétition."
   }
  ]
 },
 "snatch": {
  "name": "Arraché",
  "instructions": [
   {
    "title": "Installation",
    "text": "Prends une prise large pour que la barre soit dans le pli des hanches quand tu es debout. Barre au-dessus du milieu du pied, hanches basses, poitrine haute, dos plat."
   },
   {
    "title": "Tirage",
    "text": "Monte la barre au-delà des genoux, puis étends hanches, genoux et chevilles de façon explosive et tire la barre vers le haut en la gardant près du corps."
   },
   {
    "title": "Réception",
    "text": "Glisse-toi dessous et projette la barre au-dessus de la tête, en la recevant en squat profond, bras verrouillés. Relève-toi avec la barre au-dessus de la tête."
   }
  ]
 },
 "spider-curl": {
  "name": "Spider curl",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre sur un banc incliné à environ 45°, poitrine au bord supérieur, bras pendants à la verticale."
   },
   {
    "title": "Curl",
    "text": "Monte les haltères pendant que le haut des bras reste vertical. Serre fort en haut."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir de nouveau les bras tendus. Garde la poitrine sur le coussin pendant toute la série."
   }
  ]
 },
 "split-squat": {
  "name": "Split squat",
  "instructions": [
   {
    "title": "Position",
    "text": "Place-toi en grande fente, un haltère dans chaque main : pied avant à plat, talon arrière levé."
   },
   {
    "title": "Descente",
    "text": "Sans bouger les pieds, descends le genou arrière droit vers le bas jusqu'à presque toucher le sol."
   },
   {
    "title": "Poussée",
    "text": "Remonte en poussant dans le pied avant, buste droit. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "spoto-press": {
  "name": "Spoto press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place-toi comme pour ton développé couché habituel : yeux sous la barre, omoplates serrées, pieds bien posés."
   },
   {
    "title": "Pause",
    "text": "Descends la barre de façon contrôlée et arrête-la à 2–3 cm de la poitrine. Tiens-la là une à deux secondes sans toucher."
   },
   {
    "title": "Poussée",
    "text": "Repousse depuis cette position sans descendre avant. Garde la même trajectoire de barre et la même position des coudes que sur ton développé couché habituel."
   }
  ]
 },
 "squat": {
  "name": "Squat barre",
  "instructions": [
   {
    "title": "Position",
    "text": "Pieds écartés d'environ la largeur des épaules, pointes légèrement vers l'extérieur. Gaine le tronc."
   },
   {
    "title": "Descente",
    "text": "Descends entre les hanches, genoux dans l'axe des orteils, poitrine haute."
   },
   {
    "title": "Poussée",
    "text": "Pousse dans toute la plante des pieds pour te relever une fois les cuisses à la parallèle ou plus bas."
   }
  ]
 },
 "stair-climber": {
  "name": "Simulateur d'escalier",
  "instructions": [
   {
    "title": "Installation",
    "text": "Monte sur les marches, tiens les rampes latérales sans t'y appuyer et commence à vitesse lente."
   },
   {
    "title": "Montée",
    "text": "Pose le pied entier sur chaque marche et tiens-toi droit. Ne t'appuie pas sur les rampes et ne t'y suspends pas."
   },
   {
    "title": "Rythme",
    "text": "Augmente la vitesse seulement tant que tu gardes une bonne posture. Pour un échauffement, tu dois encore pouvoir parler."
   }
  ]
 },
 "standing-leg-curl": {
  "name": "Leg curl debout",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi face à la machine, hanches contre le coussin et rouleau juste au-dessus du talon de la jambe qui travaille."
   },
   {
    "title": "Curl",
    "text": "Ramène le talon vers les fessiers pendant que la cuisse reste verticale et que les hanches restent sur le coussin."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement jusqu'à avoir la jambe presque tendue. Termine toutes les répétitions, puis change de jambe."
   }
  ]
 },
 "step-up": {
  "name": "Step-up",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi face à un box ou un banc à hauteur de genou, un haltère dans chaque main. Pose un pied entier dessus."
   },
   {
    "title": "Montée",
    "text": "Pousse dans le talon posé sur le box pour te hisser dessus, sans t'aider du pied arrière."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement avec la même jambe. Termine toutes les répétitions, puis change de côté."
   }
  ]
 },
 "stiff-leg-deadlift": {
  "name": "Soulevé de terre jambes tendues",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi avec la barre au-dessus du milieu du pied et les jambes presque tendues, genoux à peine fléchis."
   },
   {
    "title": "Descente",
    "text": "Penche le buste depuis les hanches, dos plat, et descends la barre vers le sol jusqu'à étirer complètement les ischio-jambiers."
   },
   {
    "title": "Remontée",
    "text": "Garde les genoux presque tendus et pousse les hanches vers l'avant pour te relever, barre près des jambes."
   }
  ]
 },
 "straight-arm-pulldown": {
  "name": "Pull-over à la poulie bras tendus",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une barre droite ou une corde à une poulie haute. Recule, penche-toi légèrement et tiens-la à hauteur des yeux, bras tendus."
   },
   {
    "title": "Tirage",
    "text": "Garde les coudes presque verrouillés et ramène la barre vers les cuisses en arc de cercle. Serre les dorsaux."
   },
   {
    "title": "Retour",
    "text": "Laisse la barre remonter lentement à hauteur des yeux sans plier les coudes ni hausser les épaules."
   }
  ]
 },
 "sumo-deadlift": {
  "name": "Soulevé de terre sumo",
  "instructions": [
   {
    "title": "Installation",
    "text": "Prends un écart large, pointes de pieds vers l'extérieur et tibias près de la barre. Attrape-la à l'intérieur des genoux, bras pendant à la verticale."
   },
   {
    "title": "Gainage",
    "text": "Pousse les genoux vers l'extérieur dans l'axe des orteils, poitrine haute, dos plat. Inspire profondément et tends la barre pour enlever le jeu."
   },
   {
    "title": "Soulevé",
    "text": "Écarte le sol avec les pieds et redresse-toi en poussant les hanches vers l'avant. Redescends la barre de la même façon, près des jambes."
   }
  ]
 },
 "sumo-squat": {
  "name": "Squat sumo",
  "instructions": [
   {
    "title": "Position",
    "text": "Tiens-toi pieds bien plus écartés que les épaules, pointes tournées vers l'extérieur d'environ 45°. Tiens un haltère entre les jambes."
   },
   {
    "title": "Descente",
    "text": "Descends droit, buste vertical, en poussant les genoux vers l'extérieur dans l'axe des orteils."
   },
   {
    "title": "Poussée",
    "text": "Remonte en poussant dans les talons et serre les fessiers en haut."
   }
  ]
 },
 "superman": {
  "name": "Superman",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre, bras tendus devant toi et jambes tendues."
   },
   {
    "title": "Montée",
    "text": "Serre les fessiers et le bas du dos pour décoller les bras, la poitrine et les cuisses du sol. Tiens 1 à 2 secondes."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement et relâche brièvement. Regarde le sol pour garder la nuque neutre."
   }
  ]
 },
 "t-bar-row": {
  "name": "Rowing T-bar",
  "instructions": [
   {
    "title": "Installation",
    "text": "Enjambe la barre, dont une extrémité est calée. Place une poignée en V dessous, contre les disques, et penche-toi à environ 45°, dos plat."
   },
   {
    "title": "Tirage",
    "text": "Tire la charge vers la poitrine en ramenant les coudes en arrière et en serrant les omoplates."
   },
   {
    "title": "Descente",
    "text": "Redescends la charge lentement jusqu'à avoir les bras tendus. Garde l'angle du buste et ne tire pas la charge d'un coup."
   }
  ]
 },
 "tibialis-raise": {
  "name": "Relevés de pointes de pieds",
  "instructions": [
   {
    "title": "Installation",
    "text": "Appuie le dos contre un mur, talons à environ 30 cm devant toi, jambes tendues."
   },
   {
    "title": "Montée",
    "text": "Ramène les orteils vers les tibias aussi haut que possible, talons au sol."
   },
   {
    "title": "Descente",
    "text": "Redescends les orteils lentement jusqu'à presque toucher le sol, puis enchaîne directement la répétition suivante."
   }
  ]
 },
 "toes-to-bar": {
  "name": "Toes-to-bar",
  "instructions": [
   {
    "title": "Suspension",
    "text": "Suspends-toi à une barre de traction en pronation, un peu plus large que les épaules, bras tendus."
   },
   {
    "title": "Montée",
    "text": "Pousse la barre vers le bas bras tendus, gaine les abdos et monte les pieds jusqu'à toucher la barre avec les orteils, entre les mains."
   },
   {
    "title": "Descente",
    "text": "Redescends les jambes de façon contrôlée et arrête le balancement avant la répétition suivante."
   }
  ]
 },
 "torso-rotation-machine": {
  "name": "Rotation du buste à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi dans la machine, hanches bloquées et poitrine contre le coussin. Règle l'angle de départ d'un côté."
   },
   {
    "title": "Rotation",
    "text": "Tourne le buste de l'autre côté avec les obliques, hanches face à l'avant."
   },
   {
    "title": "Retour",
    "text": "Reviens lentement à la position de départ. Termine toutes les répétitions, puis règle la machine pour l'autre côté."
   }
  ]
 },
 "trap-bar-deadlift": {
  "name": "Soulevé de terre trap bar",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi au centre de la trap bar, pieds écartés de la largeur des hanches. Attrape le milieu des poignées, bras tendus le long du corps."
   },
   {
    "title": "Gainage",
    "text": "Plie les hanches et les genoux, poitrine haute, dos plat. Inspire profondément et gaine le tronc."
   },
   {
    "title": "Soulevé",
    "text": "Pousse dans toute la plante des pieds et étends hanches et genoux ensemble jusqu'à te redresser. Redescends la barre de façon contrôlée."
   }
  ]
 },
 "treadmill": {
  "name": "Tapis de course",
  "instructions": [
   {
    "title": "Installation",
    "text": "Place les pieds sur les bords latéraux, accroche la clé de sécurité à tes vêtements et démarre à vitesse lente."
   },
   {
    "title": "Mouvement",
    "text": "Marche ou cours bien droit au milieu du tapis, bras relâchés. Ne tiens les rampes que pour monter et descendre."
   },
   {
    "title": "Rythme",
    "text": "Choisis une vitesse et une inclinaison que tu peux tenir. Pour un échauffement, tu dois encore pouvoir parler en phrases complètes."
   }
  ]
 },
 "triceps-extension-machine": {
  "name": "Extension triceps à la machine",
  "instructions": [
   {
    "title": "Installation",
    "text": "Règle le siège pour que tes coudes soient alignés avec l'axe de la machine et pose le haut des bras sur le coussin."
   },
   {
    "title": "Extension",
    "text": "Pousse les poignées jusqu'à avoir les bras tendus. Garde les coudes sur le coussin."
   },
   {
    "title": "Retour",
    "text": "Laisse les poignées revenir lentement jusqu'à ce que les coudes soient fléchis à environ 90°, en gardant la tension sur les triceps."
   }
  ]
 },
 "triceps-pushdown": {
  "name": "Extension triceps à la poulie haute",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une barre droite à une poulie haute. Attrape-la en pronation, mains écartées d'environ la largeur des épaules, et colle les coudes au corps."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre vers le bas jusqu'à avoir les bras complètement tendus. Serre les triceps en bas."
   },
   {
    "title": "Retour",
    "text": "Laisse la barre remonter lentement jusqu'à ce que les avant-bras soient juste au-dessus de l'horizontale. Garde les coudes et le buste immobiles."
   }
  ]
 },
 "underhand-barbell-row": {
  "name": "Rowing barre supination",
  "instructions": [
   {
    "title": "Installation",
    "text": "Prends la barre en supination, à la largeur des épaules, et penche-toi en avant à environ 45°, dos plat et genoux légèrement fléchis."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre vers le nombril en gardant les coudes près du corps."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre lentement jusqu'à avoir les bras tendus. Garde les poignets droits et n'en fais pas un curl."
   }
  ]
 },
 "underhand-lat-pulldown": {
  "name": "Tirage vertical supination",
  "instructions": [
   {
    "title": "Prise",
    "text": "Prends la barre paumes vers toi, à environ la largeur des épaules, et assieds-toi avec les cuisses sous les coussins."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre vers le haut de la poitrine, coudes proches et devant le corps."
   },
   {
    "title": "Retour",
    "text": "Laisse la barre remonter lentement jusqu'à avoir les bras complètement tendus. Ne te balance pas en arrière pour déplacer la charge."
   }
  ]
 },
 "upright-row": {
  "name": "Rowing menton barre",
  "instructions": [
   {
    "title": "Prise",
    "text": "Tiens la barre mains écartées d'environ la largeur des épaules, bras pendant."
   },
   {
    "title": "Tirage",
    "text": "Guide le mouvement avec les coudes et monte la barre à hauteur du bas de la poitrine. Les coudes restent au-dessus des mains."
   },
   {
    "title": "Descente",
    "text": "Redescends la barre de façon contrôlée. Arrête-toi plus tôt si tes épaules se pincent."
   }
  ]
 },
 "walking-lunge": {
  "name": "Fentes marchées haltères",
  "instructions": [
   {
    "title": "Départ",
    "text": "Tiens-toi droit, un haltère dans chaque main le long du corps, avec beaucoup d'espace devant toi."
   },
   {
    "title": "Pas",
    "text": "Fais un grand pas en avant et descends le genou arrière juste au-dessus du sol, tibia avant à peu près vertical."
   },
   {
    "title": "Marche",
    "text": "Pousse dans le talon avant et amène le pied arrière directement dans le pas suivant. Alterne les jambes."
   }
  ]
 },
 "wall-sit": {
  "name": "Chaise contre le mur",
  "instructions": [
   {
    "title": "Installation",
    "text": "Tiens-toi dos bien plaqué contre un mur et avance les pieds, écartés de la largeur des hanches."
   },
   {
    "title": "Maintien",
    "text": "Glisse vers le bas jusqu'à ce que les cuisses soient parallèles au sol, genoux au-dessus des chevilles. Tiens pendant toute la durée."
   },
   {
    "title": "Position",
    "text": "Garde le dos et la tête contre le mur et les mains loin des cuisses. Respire calmement."
   }
  ]
 },
 "wide-grip-cable-row": {
  "name": "Rowing à la poulie prise large",
  "instructions": [
   {
    "title": "Installation",
    "text": "Fixe une barre longue à la poulie basse. Assieds-toi, pieds sur la plateforme, genoux souples, et attrape la barre en pronation, mains écartées."
   },
   {
    "title": "Tirage",
    "text": "Tire la barre vers le bas de la poitrine, coudes écartés sur les côtés. Serre le haut du dos."
   },
   {
    "title": "Retour",
    "text": "Laisse les bras se tendre lentement jusqu'à ce qu'ils soient droits, buste droit et immobile."
   }
  ]
 },
 "wrist-curl": {
  "name": "Curl poignets",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi sur un banc et pose les avant-bras sur les cuisses, paumes vers le haut, poignets juste au-delà des genoux."
   },
   {
    "title": "Curl",
    "text": "Tiens les haltères et monte les poignets aussi haut que possible. Garde les avant-bras sur les cuisses."
   },
   {
    "title": "Descente",
    "text": "Redescends les haltères lentement et laisse-les rouler jusqu'au bout des doigts pour un étirement complet."
   }
  ]
 },
 "y-raise": {
  "name": "Élévations en Y",
  "instructions": [
   {
    "title": "Installation",
    "text": "Allonge-toi sur le ventre sur un banc incliné à 30–45°, un haltère léger dans chaque main, bras pendants et pouces vers le haut."
   },
   {
    "title": "Montée",
    "text": "Lève les bras vers l'avant et l'extérieur en Y jusqu'à les aligner avec le corps. Garde les épaules basses, loin des oreilles."
   },
   {
    "title": "Descente",
    "text": "Redescends les haltères lentement. Prends des charges légères : le long levier rend l'exercice plus dur qu'il n'y paraît."
   }
  ]
 },
 "z-press": {
  "name": "Z press",
  "instructions": [
   {
    "title": "Installation",
    "text": "Assieds-toi au sol dans un rack, jambes tendues devant toi. Règle les crochets pour décrocher la barre à hauteur des clavicules."
   },
   {
    "title": "Gainage",
    "text": "Tiens-toi droit sans te pencher en arrière et gaine fort les abdos. Rien ne soutient ton dos, donc ton tronc doit rester rigide."
   },
   {
    "title": "Poussée",
    "text": "Pousse la barre droit vers le haut jusqu'au verrouillage, en reculant légèrement la tête pour la laisser passer, puis redescends-la de façon contrôlée."
   }
  ]
 },
 "zottman-curl": {
  "name": "Curl Zottman",
  "instructions": [
   {
    "title": "Montée",
    "text": "Tiens les haltères le long du corps, paumes vers l'avant. Monte-les jusqu'aux épaules, coudes le long du corps."
   },
   {
    "title": "Rotation",
    "text": "En haut, tourne les poignets pour que les paumes soient vers le bas. Garde les coudes immobiles."
   },
   {
    "title": "Descente",
    "text": "Redescends lentement paumes vers le bas jusqu'à avoir les bras tendus, puis tourne de nouveau les paumes vers l'avant."
   }
  ]
 }
}$fr$::jsonb) as v (key, value)
where e.id = v.key;
