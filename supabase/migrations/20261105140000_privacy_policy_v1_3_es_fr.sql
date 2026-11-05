-- The legal texts of version 1.3 (docs/legal, privacy only, es, fr), in effect from 2026-11-05; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
insert into public.legal_documents (kind, locale, version, content_md, effective_at) values
  ('privacy', 'es', '1.3', $md$# Política de Privacidad

Versión: 1.3

Última actualización: 5 de noviembre de 2026

Esta es una traducción. La versión alemana es jurídicamente vinculante.

Aquí puedes saber qué datos personales tratamos cuando usas la app Loqqa, por qué lo hacemos y qué derechos tienes. Esto se basa en el Reglamento General de Protección de Datos (RGPD), la Ley Federal alemana de Protección de Datos (BDSG) y la Ley alemana de Protección de Datos en las Telecomunicaciones y los Servicios Digitales (TDDDG).

## En resumen

- Loqqa guarda primero tus planes y entrenamientos en tu dispositivo y los sincroniza con tu cuenta en cuanto estás en línea. Nuestra base de datos se encuentra en Fráncfort del Meno.
- Otros usuarios no pueden ver tu perfil, tus entrenamientos ni tus fotos.
- Tratamos tu peso, tu estatura y tus fotos del control corporal como datos de salud. Solo los tratamos con tu consentimiento explícito.
- Para la creación de planes, la importación de planes, la entrada por voz, el control corporal, el coach y la traducción de mensajes de soporte, usamos un modelo de IA de OpenAI. Para ello, transferimos a OpenAI los datos necesarios, que los trata en EE. UU.
- Para mejorar la app, usamos PostHog para medir cómo se usa. A PostHog no se envían datos de salud ni fotos. La app no contiene publicidad.
- Puedes eliminar tu cuenta en la app en cualquier momento. Con ello, también eliminamos tus fotos y todos los datos de tu cuenta.

## 1. ¿Quién es el responsable?

El responsable del tratamiento de tus datos es:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Alemania
- Correo electrónico: support@useloqqa.com

En adelante, nos referimos a nosotros mismos como “nosotros”.

## 2. Delegado de protección de datos

No hemos designado un delegado de protección de datos porque no estamos obligados a hacerlo. Puedes contactarnos directamente en support@useloqqa.com para cualquier pregunta sobre protección de datos.

## 3. Cómo funciona Loqqa

Loqqa es una app de entrenamiento. Puedes pedir que te creen un plan de entrenamiento o importar uno existente, registrar tus entrenamientos y tu peso corporal, hacerle preguntas al coach sobre tu entrenamiento y, a partir de los 18 años, hacer controles corporales con fotos.

La app funciona “offline first”: tus datos se guardan en una base de datos en tu dispositivo para que puedas entrenar incluso sin internet. Cuando has iniciado sesión y estás en línea, la app sincroniza estos datos con tu cuenta en nuestros servidores. Así, tu plan y tu historial tienen copia de seguridad y están disponibles en todos tus dispositivos. Para los servidores usamos proveedores de servicios (sección 7).

Todos los datos de nuestra base de datos están asignados a tu cuenta. Unas reglas de acceso técnicas garantizan que solo tú puedas leer y modificar tus propios datos. Loqqa no tiene ninguna función que permita a otros usuarios ver tu perfil, tus entrenamientos o tus fotos.

## 4. Qué datos tratamos y por qué

### 4.1 Configuración inicial sin cuenta

Completas la configuración inicial sin una cuenta. Durante la configuración inicial, la app carga desde nuestros servidores el catálogo de ejercicios (nombres, instrucciones, imágenes y videos de los ejercicios) y estos textos legales. Comprueba si el catálogo de ejercicios ha cambiado al iniciarse y, después, cada hora. En el proceso solo se generan los datos de conexión técnicamente necesarios (sección 4.13).

La app guarda inicialmente tus respuestas durante la configuración inicial (por ejemplo, nombre, sexo, fecha de nacimiento, peso, estatura, objetivo y el plan creado o importado) solo en tu dispositivo. Esta información solo se nos envía cuando creas una cuenta (secciones 4.3 y 4.4). Excepciones: si pides que te creen un plan, la app transfiere antes tus respuestas sobre objetivo, enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia para que se pueda crear el plan; transfiere las fotos y los archivos a partir de los cuales importas un plan para que se pueda reconocer el plan (ambos en la sección 4.7).

Base jurídica: art. 6, apartado 1, letra b), del RGPD (prestación de la app que quieres usar).

### 4.2 Tu cuenta

Al final de la configuración inicial, creas una cuenta iniciando sesión con tu cuenta de Google o, en dispositivos Apple, con tu cuenta de Apple. No hay contraseña de Loqqa. En ese proceso, tratamos:

- la información que Google o Apple nos transfiere cuando inicias sesión, incluida tu dirección de correo electrónico (véase más abajo)
- tu nombre, para que la app pueda volver a rellenarlo después de iniciar sesión en un dispositivo nuevo
- datos técnicos de la cuenta, como el momento del registro y del último inicio de sesión, así como tokens de inicio de sesión

Para mantener tu sesión iniciada, la app guarda tu sesión en tu dispositivo.

**Iniciar sesión con Google:** cuando inicias sesión con Google, el inicio de sesión de Google se abre en tu dispositivo. Google nos confirma entonces tu inicio de sesión y nos transfiere tu dirección de correo electrónico, tu nombre, la dirección de tu foto de perfil de Google y un identificador de tu cuenta de Google. Guardamos esta información en tu cuenta. En el proceso, Google se entera de que inicias sesión en Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda, es responsable independiente del inicio de sesión mediante tu cuenta de Google; se aplica la [Política de Privacidad de Google](https://policies.google.com/privacy?hl=es).

**Iniciar sesión con Apple** (solo en dispositivos Apple): cuando inicias sesión con Apple, el inicio de sesión de Apple se abre en tu dispositivo. Apple nos confirma entonces tu inicio de sesión y nos transfiere un identificador de tu cuenta de Apple y tu dirección de correo electrónico. En su lugar, puedes elegir una dirección generada por Apple que te reenvía los correos electrónicos (“Ocultar mi correo electrónico”). En el primer inicio de sesión, Apple también transfiere tu nombre si lo compartes. Guardamos esta información en tu cuenta. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlanda, es responsable independiente del inicio de sesión mediante tu cuenta de Apple; se aplica la [Política de Privacidad de Apple](https://www.apple.com/es/legal/privacy/).

Las cuentas solo se crean al final de la configuración inicial. Si el inicio de sesión mediante “Iniciar sesión” en la pantalla de bienvenida creara una cuenta nueva, la app la elimina de inmediato y te avisa de que todavía no existe ninguna cuenta.

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.3 Perfil y planificación del entrenamiento

Cuando creas una cuenta, guardamos tus datos de la configuración inicial como tu perfil. Más adelante puedes modificar algunos de ellos en los ajustes y en tu perfil.

- nombre, sexo biológico (también es posible “Prefiero no decirlo”) y fecha de nacimiento
- peso corporal, estatura y tus unidades preferidas (métricas o imperiales)
- experiencia de entrenamiento, objetivo de entrenamiento, grupos musculares de enfoque, equipamiento disponible, entrenamientos por semana y duración deseada del entrenamiento
- el idioma de tu app, para que nuestro soporte pueda responderte en tu idioma
- opcional: una foto de perfil (la app la guarda como imagen cuadrada de 512 × 512 píxeles) y un breve texto “Sobre ti” de hasta 150 caracteres

Para qué: necesitamos tu fecha de nacimiento para comprobar la edad mínima (sección 16) y los límites de edad del coach y del control corporal. Si pides que te creen un plan de entrenamiento, un modelo de IA de OpenAI lo crea a partir de tu objetivo de entrenamiento, enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia (sección 4.7). El coach también usa tu objetivo, experiencia, equipamiento, enfoque y unidades para sus respuestas (sección 4.8). La app usa el sexo, la edad, el peso y la estatura para tu nivel y tus sugerencias, así como para el control corporal (sección 4.6). Tu foto de perfil y “Sobre ti” solo se te muestran a ti en tu perfil.

Base jurídica: art. 6, apartado 1, letra b), del RGPD; para el peso corporal y la estatura, tu consentimiento (sección 4.4).

### 4.4 Datos de salud y tu consentimiento

Algunos datos pueden permitir extraer conclusiones sobre tu salud. Por ello los tratamos como datos relativos a la salud (“datos de salud”) en el sentido del art. 9 del RGPD:

- **Medidas corporales:** tu peso corporal, tus registros de peso y tu estatura (secciones 4.3 y 4.5).
- **Control corporal:** tus fotos del control corporal y los valores derivados de ellas, por ejemplo un porcentaje estimado de grasa corporal (sección 4.6).

Solo tratamos estos datos con tu consentimiento explícito (art. 9, apartado 2, letra a), en relación con el art. 6, apartado 1, letra a), del RGPD):

- **Medidas corporales:** al crear tu cuenta, consientes explícitamente, mediante el aviso situado justo encima del botón, que tratemos tus datos corporales para adaptar tu entrenamiento. Antes de eso, el peso y la estatura permanecen en tu dispositivo.
- **Control corporal:** antes de que la app envíe tus fotos para su evaluación, te informa de que, para ello, se transferirán fotos y datos corporales a OpenAI en EE. UU. Al tocar “Listo”, das tu consentimiento a esto.
- **Coach:** para sus respuestas, el coach también usa tus registros de peso y las puntuaciones globales de tus controles corporales, y para ello nuestro servidor transfiere tus datos de entrenamiento y corporales a OpenAI en EE. UU. (sección 4.8). Al crear tu cuenta y aceptar esta Política de Privacidad, das tu consentimiento a esto. Guardamos el momento de tu consentimiento. Solo transferimos estos datos cuando le haces una pregunta al coach.

El uso del control corporal y del coach es voluntario. Puedes retirar tus consentimientos en cualquier momento con efecto para el futuro (sección 12).

### 4.5 Datos de entrenamiento y peso corporal

Cuando usas Loqqa, guardamos:

- **Planes:** nombre, entrenamientos por semana, bloques con una semana de descarga, entrenamientos en su orden (incluidos entrenamientos sin plan), ejercicios, series con valores objetivo (repeticiones o segundos), repeticiones en reserva (RIR) y tiempos de descanso
- **Entrenamientos completados:** inicio y fin, a qué plan y a qué semana del plan cuentan, ejercicios, peso y repeticiones o segundos por serie, el momento de cada serie completada y récords personales
- **Ejercicios personalizados** que creas tú o que se crean durante la importación de un plan
- **Peso corporal:** los registros de peso que anotas, un valor por día

Para qué: para que puedas registrar tus entrenamientos y tu peso y ver tu historial, tus récords, tu nivel y tu actividad. La app calcula en tu dispositivo las sugerencias para tus series y tu nivel. Si se lo preguntas al coach, este responde tu pregunta a partir de estos datos (sección 4.8).

Base jurídica: art. 6, apartado 1, letra b), del RGPD; para los registros de peso, tu consentimiento (sección 4.4).

### 4.6 Control corporal

El control corporal es opcional y solo está disponible a partir de los 18 años. Para ello, tomas tres fotos con la cámara: de frente, de lado y de espaldas. La app recomienda llevar ropa interior o ropa deportiva ajustada. Tu rostro puede verse en las fotos.

La app reduce las fotos a un ancho máximo de 1080 píxeles y las guarda en tu dispositivo. Cuando inicias la evaluación, sube las fotos a un área de almacenamiento no pública de tu cuenta. Allí permanecen para que también puedas verlas en tus otros dispositivos. Para la evaluación necesitas una conexión a internet.

**Evaluación por un modelo de IA de OpenAI:** un modelo de IA de OpenAI determina los valores de tu control. Para ello, nuestro servidor transfiere a OpenAI:

- las tres fotos de este control y, si las hay, las fotos de tu control anterior, para que el modelo pueda comparar directamente los cambios
- sexo, edad (calculada a partir de tu fecha de nacimiento), estatura, peso y experiencia de entrenamiento de tu perfil
- los valores de tu control anterior, para que los valores sigan siendo comparables de un control a otro

No transferimos tu nombre, tu dirección de correo electrónico ni el ID de tu cuenta. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

El modelo comprueba primero si las fotos se pueden evaluar, por ejemplo si tienen suficiente luz y si tu cuerpo se ve al menos de la cabeza a las rodillas. Si una foto no se puede evaluar, la app te pide que la repitas. En caso contrario, el modelo proporciona valores para seis grupos musculares (hombros, pecho, brazos, espalda, abdomen, piernas), un porcentaje estimado de grasa corporal y valores de proporciones y definición. A partir de ellos, nuestro servidor calcula la puntuación global. Guardamos estos valores junto con tu control.

Antes de que nuestro servidor evalúe un control, comprueba con RevenueCat si tu cuenta tiene Loqqa Pro (sección 4.12). Registramos cada evaluación con su momento y su resultado. Así limitamos el número de evaluaciones por día y garantizamos que los valores guardados proceden de una evaluación. Eliminamos el registro junto con tu cuenta.

Los valores son estimaciones aproximadas y no una medición médica ni un diagnóstico.

**Quién tiene acceso:** técnicamente, solo el operador de Loqqa, Jan Timo Hünnebeck, puede acceder al área de almacenamiento. Solo mira las fotos del control corporal si lo pides en soporte, si es necesario para corregir un error del que nos informas o si estamos obligados a ello por ley.

Puedes eliminar controles individuales en la app. La app elimina entonces las fotos en tu dispositivo y en nuestro almacenamiento. Si tu dispositivo está sin conexión en ese momento, las fotos pueden permanecer en nuestro almacenamiento hasta que elimines tu cuenta; en ese caso, escríbenos y las eliminaremos.

Base jurídica: tu consentimiento explícito (sección 4.4), también para la transferencia a OpenAI en EE. UU. (art. 49, apartado 1, letra a), del RGPD, además de las garantías de la sección 8).

### 4.7 Importación de planes, creación de planes y ejercicios por voz

Puedes importar un plan de entrenamiento existente: como una foto tomada con la cámara (por ejemplo, de papel, una pizarra o una pantalla), como hasta diez imágenes de tu biblioteca de fotos o como un archivo (PDF, Excel, CSV, texto o imagen). Asegúrate de que en las imágenes y los archivos no se vean datos de otras personas.

**Reconocimiento por un modelo de IA de OpenAI:** la app reduce las fotos a un máximo de 2000 píxeles en el lado más largo, las guarda como JPEG y las transfiere, o transfiere tu archivo, a nuestro servidor. El servidor las pasa, junto con nuestro catálogo de ejercicios, a un modelo de IA de OpenAI, que lee entrenamientos, ejercicios, series, repeticiones y tiempos de descanso. En el proceso no transferimos ningún otro dato: la solicitud no contiene ni tu cuenta ni tu nombre. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos.

Nuestro servidor no guarda tus fotos ni tus archivos; solo devuelve a la app el plan reconocido. Solo se guarda el plan que confirmas al final (sección 4.5). En el proceso, la app crea en tu cuenta, como ejercicios personalizados, los ejercicios de tu plan que nuestro catálogo no conoce.

**Creación de planes por un modelo de IA de OpenAI:** si pides que te creen un plan, la app transfiere a nuestro servidor tus respuestas sobre objetivo de entrenamiento, grupos musculares de enfoque, equipamiento, entrenamientos por semana, duración del entrenamiento y experiencia de entrenamiento, así como el idioma de tu app. El servidor las pasa, junto con los ejercicios de nuestro catálogo que coinciden con tu equipamiento, a un modelo de IA de OpenAI, que con ellos elabora tu plan. En el proceso no transferimos tu nombre, tu fecha de nacimiento, sexo, peso ni estatura, y la solicitud no contiene tu cuenta. Para el tratamiento en OpenAI se aplica lo mismo que para la importación. Nuestro servidor no guarda tus respuestas en el proceso; solo devuelve el plan a la app, donde puedes modificarlo.

**Ejercicios por voz:** al importar un plan, al editar un entrenamiento y al preparar un entrenamiento libre, puedes decir los ejercicios con sus series y repeticiones en lugar de buscarlos uno por uno. El reconocimiento de voz de tu sistema operativo convierte lo que dices en texto: el de Apple en el iPhone, el de Google en los dispositivos Android. Según el dispositivo, esto ocurre en el propio dispositivo o en los servidores de Apple o de Google; se aplican sus políticas de privacidad. No recibimos la grabación en sí. La app transfiere a nuestro servidor el texto, que aún puedes modificar antes de añadir los ejercicios, junto con el idioma de tu app. El servidor lo pasa, junto con nuestro catálogo de ejercicios, a un modelo de IA de OpenAI, que reconoce los ejercicios con sus series y repeticiones. La solicitud no contiene ni tu cuenta ni tu nombre. Para el tratamiento en OpenAI se aplica lo mismo que para la importación. Nuestro servidor no guarda el texto.

**Límites de solicitudes:** para evitar que la importación, la creación de planes y los ejercicios por voz se usen indebidamente, limitamos con qué frecuencia se pueden usar por red y en total por día. Para ello, nuestro servidor guarda de cada solicitud el momento, a cuál de estas funciones se refería y un hash de tu dirección IP, que genera con una clave secreta; no guardamos la dirección IP en sí. Eliminamos las entradas con más de dos días de antigüedad con cada nueva solicitud.

Base jurídica: art. 6, apartado 1, letra b), del RGPD para la importación, la creación de planes y los ejercicios por voz que inicias, también para la transferencia a OpenAI en EE. UU. Para los límites de solicitudes, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es evitar usos indebidos y gastos innecesarios.

### 4.8 Kai · coach de IA

Con Loqqa Pro, puedes hacerle preguntas a Kai, el coach de IA de la app, sobre tu propio entrenamiento, por ejemplo “¿Cómo ha evolucionado mi peso?”. El coach responde en pocas frases, normalmente con un gráfico a partir de tus datos. También responde preguntas generales de entrenamiento, como con qué frecuencia debes entrenar piernas o qué ejercicio puedes hacer si algo te duele. Si se lo pides, puede preparar un entrenamiento, mostrar uno de tus entrenamientos guardados o sugerir reemplazar ejercicios de tu plan; tu plan solo cambia cuando lo confirmas en la app. No hace diagnósticos. Kai es una IA, no una persona. El coach es opcional y solo está disponible a partir de los 16 años. Para usarlo necesitas una conexión a internet.

**Respuestas de un modelo de IA de OpenAI:** la app transfiere a nuestro servidor tu pregunta, junto con el idioma de tu app y la zona horaria de tu dispositivo. El servidor pasa la pregunta a un modelo de IA de OpenAI. Si el modelo necesita datos, los solicita a nuestro servidor: el servidor calcula los valores a partir de tus datos guardados y transfiere los resultados a OpenAI. Con ellos, el modelo redacta la respuesta. Con cada pregunta, nuestro servidor transfiere a OpenAI:

- tu pregunta y hasta las seis últimas preguntas de este chat con sus respuestas y los datos consultados para ellas
- la fecha de hoy, tus unidades y el idioma de tu app
- objetivo de entrenamiento, experiencia de entrenamiento, equipamiento y grupos musculares de enfoque de tu perfil, así como el nombre y los entrenamientos por semana de tu plan activo
- los entrenamientos de tu plan activo con sus ejercicios y en qué punto están esta semana (hecho, siguiente o pendiente), y los nombres de tus otros entrenamientos guardados
- el número de tus entrenamientos con la fecha del primero y del último, el número de tus registros de peso con la fecha del primero y el número de tus controles corporales
- los ejercicios que has hecho, incluidos los ejercicios personalizados: nombre, cómo los registras, en cuántos entrenamientos los hiciste y cuándo los hiciste por última vez

Según la pregunta, nuestro servidor también transfiere lo que calcula a partir de tus datos para ella:

- entrenamientos con fecha, nombre, duración, ejercicios y series (peso, repeticiones, segundos y RIR)
- valores por entrenamiento, por ejemplo la repetición máxima estimada (1RM), el peso más alto, repeticiones, tiempo de aguante, volumen y récords
- tus registros de peso y una tendencia de peso suavizada
- las puntuaciones globales de tus controles corporales, sin fotos y sin valores individuales como el porcentaje de grasa corporal
- entrenamientos, series, volumen y tiempo de entrenamiento por semana o mes, pausas de entrenamiento y los días de la semana de tus entrenamientos
- series por grupo muscular y por ejercicio
- los ejercicios, series y objetivos de un entrenamiento guardado, cuando el coach te lo muestra o te sugiere un cambio en él
- ejercicios del catálogo de la app, cuando el coach prepara un entrenamiento o sugiere un reemplazo, con los que más has hecho primero

No transferimos tu nombre, tu dirección de correo electrónico, el ID de tu cuenta, tu fecha de nacimiento ni tu edad, tu sexo, tu estatura, tu foto de perfil, tu texto “Sobre ti”, las fotos de tu control corporal ni tus mensajes de soporte. No escribas datos de otras personas en tus preguntas. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

Las respuestas las redacta un modelo de IA. Pueden ser incorrectas. Son información y recomendaciones para tu entrenamiento, no consejo médico ni un diagnóstico.

Antes de que nuestro servidor responda una pregunta, comprueba tu edad mediante la fecha de nacimiento de tu perfil, tu consentimiento (sección 4.4) y, con RevenueCat, si tu cuenta tiene Loqqa Pro (sección 4.12).

**Preguntas por voz:** también puedes decir tu pregunta en voz alta. La app graba entonces con el micrófono hasta que terminas la grabación, durante un máximo de dos minutos, y transfiere la grabación, junto con el idioma de tu app, a nuestro servidor. El servidor la pasa a un modelo de reconocimiento de voz de OpenAI, que la convierte en texto. Para que términos como “press de banca” se reconozcan correctamente, envía junto con ella una breve nota sobre el tema (preguntas a un coach de entrenamiento y términos típicos). La app muestra el texto en el campo de entrada, donde puedes modificarlo; solo se convierte en tu pregunta cuando lo envías. No guardamos tu grabación: nuestro servidor solo la reenvía, y la app la elimina de tu dispositivo en cuanto el texto está disponible o descartas la grabación. No grabes a otras personas. Para el tratamiento en OpenAI se aplica lo mismo que para las respuestas (EE. UU., sin uso para entrenamiento, conservación de hasta 30 días para detectar usos indebidos). También para esto, nuestro servidor comprueba tu edad y si tu cuenta tiene Loqqa Pro. Para evitar que la conversión se use indebidamente, puedes usarla como máximo 100 veces en 24 horas. Para ello, nuestro servidor guarda de cada conversión el momento y un hash del ID de tu cuenta, que genera con una clave secreta; eliminamos las entradas con más de dos días de antigüedad con cada nueva conversión.

**Qué guardamos:** guardamos en nuestra base de datos tus chats con las preguntas, las respuestas y los gráficos bajo las respuestas. La app los sincroniza con tus dispositivos para que puedas ver allí tus chats (sección 5). De cada pregunta guardamos además un registro que la app no muestra: momento, estado (por ejemplo, si se dio una respuesta), el modelo usado, el número de tokens (unidades de texto por las que factura OpenAI) y la duración, además de las consultas del modelo con los datos consultados. Necesitamos estas consultas para que el coach pueda responder preguntas de seguimiento sobre una respuesta.

**Límites de preguntas:** para evitar que el coach se use indebidamente y para evitar gastos innecesarios, puedes hacer como máximo 20 preguntas en 24 horas y 150 preguntas en 30 días. Para ello, nuestro servidor cuenta los registros.

Puedes eliminar chats en la app, también varios a la vez. Eliminamos entonces sus preguntas, respuestas y gráficos y los datos consultados en sus registros. El momento, el estado, el modelo, los tokens y la duración se conservan para que los límites sigan aplicándose y para que podamos llevar el control de los gastos del coach. Por lo demás, conservamos tus chats hasta que los elimines o elimines tu cuenta. Cuando eliminas tu cuenta, eliminamos todos los chats y registros (sección 10).

Base jurídica: tu consentimiento explícito (sección 4.4), también para la transferencia a OpenAI en EE. UU. (art. 49, apartado 1, letra a), del RGPD, además de las garantías de la sección 8). Para convertir una pregunta hablada en texto, art. 6, apartado 1, letra b), del RGPD, ya que la inicias tú, también para la transferencia a OpenAI en EE. UU. Para los límites de preguntas y conversiones y los datos de momento, estado, modelo, tokens y duración, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es evitar usos indebidos y gastos innecesarios.

### 4.9 Soporte

Puedes escribirnos directamente en la app mediante “Informar de un error” y “Pedir una función”, o puedes escribir a support@useloqqa.com. En la app, tratamos:

- el tipo de tu solicitud (error o idea), para las ideas la importancia de 1 a 5, tus mensajes y el asunto (la primera línea de tu primer mensaje)
- hasta cinco capturas de pantalla por mensaje que seleccionas de tu biblioteca de fotos; la app las reduce (lado más largo de 1600 píxeles como máximo) y las guarda como JPEG
- el historial de tu solicitud, por ejemplo cambios de estado, nuestras respuestas y si reabriste una solicitud
- el dispositivo desde el que envías una solicitud: plataforma (iOS o Android), versión del sistema operativo, modelo del dispositivo y versión de la app, para que podamos rastrear errores
- el idioma de tu app, para que podamos traducir nuestras respuestas a tu idioma
- el idioma detectado de cada mensaje y sus traducciones (véase más abajo)

**Traducción por un modelo de IA de OpenAI:** para que te entendamos y puedas leer nuestras respuestas en tu idioma, un modelo de IA de OpenAI traduce los mensajes de soporte. Para ello, nuestro servidor transfiere a OpenAI cada mensaje que contiene texto, junto con el idioma al que se debe traducir: tus mensajes, para detectar su idioma y traducirlos al idioma de nuestro soporte, y nuestras respuestas, para traducirlas al idioma de tu app. Si cambias el idioma de tu app, traducimos nuestras respuestas anteriores al nuevo idioma. No transferimos tu nombre, tu dirección de correo electrónico, el ID de tu cuenta ni tus capturas de pantalla. Guardamos las traducciones junto con los mensajes; en la app puedes mostrar el original en cualquier momento. OpenAI trata los datos en EE. UU. (sección 8). Hemos configurado OpenAI para que no guarde la solicitud para consultarla más tarde. OpenAI no usa los datos de su API para entrenar sus modelos y los conserva hasta 30 días para detectar usos indebidos; después, se eliminan.

**Mensajes por voz:** también puedes decir tu mensaje en voz alta. Funciona como las preguntas al coach (sección 4.8): la app graba hasta que terminas la grabación, durante un máximo de dos minutos. Nuestro servidor pasa la grabación, con una breve nota sobre el tema, a un modelo de reconocimiento de voz de OpenAI. La app muestra el texto en el campo de entrada, donde puedes modificarlo; solo se convierte en tu mensaje cuando lo envías. No guardamos tu grabación. También aquí, nuestro servidor comprueba tu edad y si tu cuenta tiene Loqqa Pro, y se aplica el mismo límite.

**Quién ve tu solicitud:** gestionamos las solicitudes en un área de soporte interna en el navegador a la que solo puede acceder Jan Timo Hünnebeck, con un inicio de sesión independiente. Para tu solicitud, el área de soporte también muestra tu dirección de correo electrónico, si inicias sesión con Apple o con Google, el ID de tu cuenta, cuándo creaste tu cuenta y cuándo estuviste activo por última vez, el idioma de tu app y tus solicitudes anteriores.

La app guarda primero las capturas de pantalla en tu dispositivo y luego las sube en segundo plano. No puedes eliminar mensajes ni solicitudes tú mismo, para que el historial siga siendo trazable. Se eliminan junto con tu cuenta; si lo solicitas, también eliminamos antes las solicitudes cerradas. Conservamos los correos electrónicos durante el tiempo que los necesitemos para tu solicitud.

No nos envíes datos de salud ni datos de otras personas en mensajes y capturas de pantalla si no son necesarios para tu solicitud. También transferimos mensajes a OpenAI para su traducción.

Base jurídica: art. 6, apartado 1, letra b), del RGPD, en la medida en que tu solicitud se refiera al uso de la app, por ejemplo en caso de errores. Para las ideas y otros comentarios, art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es responder a tu solicitud y mejorar Loqqa. Esto también se aplica a la traducción y a la transferencia a OpenAI en EE. UU. (sección 8).

### 4.10 Textos legales y aceptaciones

La app carga la versión actualmente vigente de los Términos de Uso y de esta Política de Privacidad en tu idioma. Cuando aceptas una versión, al registrarte o más tarde una versión modificada, guardamos qué versión aceptaste, el momento (fijado por el servidor), la versión de la app y la plataforma (iOS o Android). Esto nos permite demostrar qué versión se aplica a ti y volver a pedirte tu aceptación en caso de cambios sustanciales.

Base jurídica: art. 6, apartado 1, letra c), en relación con el art. 7, apartado 1, del RGPD (prueba del consentimiento) y art. 6, apartado 1, letra f), del RGPD (nuestro interés legítimo en poder demostrar qué términos se aplican).

### 4.11 Loqqa Pro: suscripciones y compras

Compras Loqqa Pro a través de la App Store de Apple o de Google Play. Apple o Google, respectivamente, gestionan la compra y el pago. Son responsables de ello por sí mismos y tratan tus datos de pago de acuerdo con sus propias políticas de privacidad: [Apple](https://www.apple.com/es/legal/privacy/) y [Google](https://policies.google.com/privacy?hl=es). No recibimos datos de pago, como números de tarjeta de crédito.

Para poder desbloquear Loqqa Pro, nos enteramos a través de RevenueCat (sección 4.12) de qué suscripción compraste, si hay un periodo de prueba en curso, cuándo la compraste y si la suscripción está activa. La app guarda este estado en tu dispositivo y lo consulta de nuevo al iniciarse y cada vez que inicias sesión. No guardamos datos de compra en nuestra propia base de datos.

Gestionas y cancelas tu suscripción en los ajustes de tu cuenta de la tienda. La app enlaza allí desde “Gestionar suscripción”.

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.12 Gestión de suscripciones con RevenueCat

Gestionamos las compras y las suscripciones a través de RevenueCat. Por encargo nuestro, RevenueCat verifica los comprobantes de compra de la tienda e informa a la app de si Loqqa Pro está activo. Antes de que nuestro servidor evalúe un control corporal o responda a una pregunta dirigida al coach, consulta a RevenueCat si tu cuenta tiene Loqqa Pro.

Para que RevenueCat pueda asignar tus compras a tu cuenta, transferimos el ID de tu cuenta, un identificador aleatorio sin nombre ni dirección de correo electrónico. Si compras antes de crear tu cuenta, RevenueCat asigna primero un identificador aleatorio propio y luego asigna la compra a tu cuenta. RevenueCat también trata información de compra y suscripción de la tienda (por ejemplo, producto, precio, moneda, fechas de compra, renovación y vencimiento, periodo de prueba e identificadores de transacción), así como información técnica como plataforma, tipo de dispositivo, versión de la app y dirección IP.

RevenueCat también envía a PostHog (sección 4.14) eventos sobre tu suscripción, por ejemplo una prueba iniciada o convertida, renovaciones y cancelaciones, cada uno con los ingresos. Para ello, la app le da a RevenueCat tu identificador de PostHog: un identificador aleatorio antes de que crees tu cuenta, el ID de tu cuenta después.

- Proveedor: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, EE. UU., como nuestro encargado del tratamiento
- Lugar de almacenamiento: EE. UU. (Amazon Web Services); para la garantía, véase la sección 8
- Plazo de conservación: mientras exista nuestro contrato con RevenueCat; hacemos que se eliminen los datos relativos a tu cuenta cuando eliminas tu cuenta, salvo que obligaciones legales lo impidan

Base jurídica: art. 6, apartado 1, letra b), del RGPD.

### 4.13 Datos de conexión técnicamente necesarios

Siempre que la app está conectada a nuestros servidores (por ejemplo, al iniciar sesión, sincronizar, subir archivos o cargar el catálogo de ejercicios y los textos legales), se tratan datos técnicamente necesarios: tu dirección IP, fecha y hora, la interfaz a la que se accede e información técnica como códigos de estado y, cuando se transmite, información sobre la app y el sistema operativo. Nuestros proveedores de alojamiento registran estos datos para garantizar el funcionamiento y la seguridad. En Supabase, los registros se eliminan al cabo de un día; en PowerSync, en cuanto dejan de ser necesarios para el funcionamiento y la seguridad.

Base jurídica: art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es un funcionamiento estable y seguro.

### 4.14 Analítica de producto e informes de errores con PostHog

Para entender cómo se usa Loqqa y para encontrar errores, usamos PostHog. Para ello, la app envía:

- **Eventos de uso:** qué pantallas abres y determinados pasos, por ejemplo el inicio de la configuración inicial, planes creados o importados, vistas de la pantalla de Loqqa Pro, compras, registro e inicio de sesión, el inicio, el fin o la cancelación de un entrenamiento, que le hiciste una pregunta al coach y si respondió (nunca el texto), la evaluación de un control corporal (nunca los valores), el guardado de un registro de peso (nunca el peso), ejercicios añadidos por voz, solicitudes de una valoración en la tienda, cada uno con el momento y métricas como el número de ejercicios o series, la duración o el código de error
- **Eventos de suscripción:** pruebas iniciadas o convertidas, renovaciones y cancelaciones con los ingresos, enviados por RevenueCat (sección 4.12)
- **Eventos de la app:** apertura y cierre de la app, versión de la app, tipo de dispositivo, sistema operativo e idioma
- **Informes de errores:** mensajes de fallos y errores con detalles técnicos
- **Información de perfil:** tras el registro, objetivo, experiencia, entrenamientos por semana, división, equipamiento, idioma, unidades, un grupo de edad (por ejemplo “25–34”) y si tienes Loqqa Pro
- **un identificador seudónimo:** antes del registro, un identificador aleatorio que la app guarda en tu dispositivo; después, el ID de tu cuenta, para que se unan los eventos anteriores y posteriores al registro

Tu nombre, tu dirección de correo electrónico, peso, estatura, tu fecha de nacimiento, las fotos y los valores del control corporal y los textos libres no se envían a PostHog. PostHog no guarda tu dirección IP, y no usamos grabaciones de sesión. Cuando cierras sesión, la app restablece el identificador.

- Proveedor: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, EE. UU., como nuestro encargado del tratamiento
- Lugar de almacenamiento: PostHog Cloud EU (Fráncfort del Meno); PostHog está certificado conforme al Marco de Privacidad de Datos UE-EE. UU. (EU-US Data Privacy Framework; sección 8)
- Plazo de conservación: los eventos se eliminan al cabo de un año

Base jurídica: art. 6, apartado 1, letra f), del RGPD; nuestro interés legítimo es mejorar Loqqa y corregir errores. Puedes oponerte a ello en cualquier momento (sección 11), por ejemplo por correo electrónico a support@useloqqa.com; eliminaremos entonces los datos de analítica relativos a tu cuenta.

## 5. Almacenamiento en tu dispositivo

Para que Loqqa también funcione sin conexión, la app guarda datos en tu dispositivo:

- una base de datos local con tu perfil, tus planes y entrenamientos, tus registros de peso, los valores de tu control corporal, tus chats con el coach, tus solicitudes de soporte y tus aceptaciones
- fotos del control corporal que tomaste en este dispositivo y copias de tus capturas de pantalla de soporte
- tu sesión iniciada, tus respuestas de la configuración inicial, el estado de tu suscripción, ajustes como el idioma de la app y listas de archivos que aún deben subirse
- el catálogo de ejercicios
- el identificador y los eventos aún no enviados para PostHog (sección 4.14)

Salvo los datos para PostHog, este almacenamiento es estrictamente necesario para los servicios que quieres usar (§ 25, apartado 2, n.º 2, TDDDG).

Cuando cierras sesión, la app elimina de este dispositivo la base de datos local, así como tus fotos del control corporal y las copias de capturas de pantalla, y restablece la configuración inicial, el estado de la suscripción y los entrenamientos en curso. Los cambios aún no sincronizados se pierden en el proceso; la app te avisa antes. Los ajustes como el idioma de la app se conservan. Cuando eliminas la app, tu sistema operativo normalmente elimina todos los datos de la app.

Según los ajustes de tu dispositivo, los archivos de la app, incluidas las fotos del control corporal, pueden incluirse en las copias de seguridad de tu dispositivo (por ejemplo, con iCloud o Google). Apple o Google, respectivamente, son responsables de estas copias de seguridad.

## 6. Permisos en tu dispositivo

Loqqa solo pide un permiso cuando usas una función que lo necesita:

- **Cámara:** para fotografiar tu plan de entrenamiento, para las fotos del control corporal y para tu foto de perfil
- **Fotos:** para seleccionar imágenes para la importación de planes, para capturas de pantalla de soporte y para tu foto de perfil. Para ello, la app usa el selector de imágenes de tu sistema operativo y solo recibe las imágenes que seleccionas.
- **Archivos:** para seleccionar un archivo de plan mediante el selector de archivos de tu sistema operativo
- **Micrófono:** para decir ejercicios (sección 4.7), preguntas al coach (sección 4.8) y mensajes a soporte (sección 4.9). La app solo graba mientras usas la entrada por voz.
- **Reconocimiento de voz (iPhone):** para que el reconocimiento de voz de Apple pueda convertir en texto los ejercicios dichos en voz alta (sección 4.7)

Loqqa no pide acceso a la ubicación, a los contactos ni a apps de salud como la app Salud de Apple o Health Connect, y no envía notificaciones push. Puedes revocar los permisos en cualquier momento en los ajustes de tu dispositivo.

## 7. Destinatarios y encargados del tratamiento

Solo comunicamos tus datos si es necesario para los fines indicados, has dado tu consentimiento o estamos obligados a ello por ley. Nuestros proveedores de servicios tratan los datos por cuenta nuestra y conforme a nuestras instrucciones (art. 28 del RGPD):

- **Supabase, Inc.** (base de datos, inicio de sesión, almacenamiento de archivos y funciones de servidor): servidores en Fráncfort del Meno (Amazon Web Services)
- **PowerSync** de Journey Mobile, Inc. (sincronización entre la app y la base de datos; para ello, el servicio conserva una copia de tus datos sincronizados): servidores en la UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlanda (creación de planes con IA, reconocimiento de planes importados y de ejercicios dichos en voz alta, evaluación de las fotos del control corporal, las respuestas del coach, conversión de preguntas habladas en texto y traducción de mensajes de soporte, secciones 4.6 a 4.9): tratamiento en EE. UU. por OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestión de suscripciones, sección 4.12)
- **PostHog, Inc.** (analítica de producto e informes de errores, sección 4.14)

Apple y Google reciben datos como responsables independientes por las descargas de la app y las compras (sección 4.11), así como por el inicio de sesión mediante su cuenta (sección 4.2) y por el reconocimiento de voz de su sistema operativo (sección 4.7).

Loqqa la dirige una sola persona: solo Jan Timo Hünnebeck tiene acceso a tus datos, en la medida en que los necesite para el funcionamiento y el soporte.

Solo facilitamos datos a autoridades y tribunales si estamos obligados a ello por ley.

## 8. Transferencias a terceros países

Guardamos tu cuenta, tus entrenamientos y tus fotos en centros de datos de la UE (Supabase en Fráncfort del Meno, PowerSync en la UE). Algunos de nuestros proveedores de servicios tienen su sede en EE. UU. Por ello, los datos también pueden transferirse a EE. UU., por ejemplo durante el mantenimiento o el soporte por parte del proveedor de servicios. Para la creación de planes, la importación de planes, los ejercicios y preguntas por voz, la evaluación del control corporal, las respuestas del coach y la traducción de mensajes de soporte, transferimos datos a OpenAI en EE. UU. con cada solicitud (secciones 4.6 a 4.9), y RevenueCat trata los datos de suscripción en EE. UU. (sección 4.12).

Basamos estas transferencias en las siguientes garantías:

- **PostHog:** decisión de adecuación de la Comisión Europea para el Marco de Privacidad de Datos UE-EE. UU., conforme al cual PostHog está certificado (art. 45 del RGPD)
- **Supabase, PowerSync, OpenAI y RevenueCat:** cláusulas contractuales tipo de la Comisión Europea (art. 46, apartado 2, letra c), del RGPD), que forman parte de nuestros contratos de encargo del tratamiento
- **Control corporal y coach:** además, tu consentimiento explícito (art. 49, apartado 1, letra a), del RGPD). En EE. UU., las autoridades pueden acceder a los datos en determinadas circunstancias sin que tengas frente a ello los mismos recursos jurídicos que en la UE.

Puedes solicitarnos una copia de las cláusulas contractuales tipo.

## 9. Cuánto tiempo conservamos tus datos

- **Cuenta, perfil, planes, entrenamientos, registros de peso, controles corporales, chats con el coach, solicitudes de soporte y aceptaciones:** mientras exista tu cuenta. Antes puedes eliminar tú mismo contenidos individuales, por ejemplo planes, registros de peso, controles corporales o chats con el coach. Cuando eliminas tu cuenta, los eliminamos por completo (sección 10). No eliminamos automáticamente las cuentas que ya no se usan; puedes solicitar la eliminación en cualquier momento en la app o por correo electrónico.
- **Respuestas de la configuración inicial sin cuenta:** solo en tu dispositivo, hasta que crees una cuenta o elimines la app.
- **Datos en tu dispositivo:** hasta que cierres sesión o elimines la app (sección 5).
- **Registros del servidor:** un día en Supabase; en PowerSync, mientras sean necesarios para el funcionamiento y la seguridad (sección 4.13).
- **Límites de importación, creación de planes y entrada por voz:** dos días (secciones 4.7 y 4.8).
- **Grabaciones de preguntas habladas:** no las guardamos; la app las elimina tras la conversión (sección 4.8).
- **Registros del coach:** mientras exista tu cuenta; eliminamos los datos consultados que contienen junto con el chat correspondiente (sección 4.8).
- **En OpenAI:** hasta 30 días (secciones 4.6 a 4.9).
- **Datos de analítica en PostHog:** un año (sección 4.14).
- **Datos de suscripción en RevenueCat:** véase la sección 4.12.
- **Copias de seguridad:** actualmente no creamos copias de seguridad de nuestra base de datos ni de nuestro almacenamiento. Si esto cambia, añadiremos aquí cuánto tiempo se conservan las copias de seguridad.

## 10. Eliminación de tu cuenta

Puedes eliminar tu cuenta en la app en cualquier momento: en los ajustes, en “Eliminar cuenta”. Entonces ocurre lo siguiente:

1. Si iniciaste sesión con Apple, lo confirmas una vez más con Apple en un dispositivo Apple. Con ello ponemos fin a la conexión entre tu cuenta de Apple y Loqqa: nuestro servidor intercambia la confirmación con Apple por tus claves de inicio de sesión y hace que se revoquen de inmediato. En el proceso no se guarda nada.
2. La app elimina de nuestro almacenamiento tu foto de perfil, las fotos de tu control corporal y tus capturas de pantalla de soporte.
3. A continuación se elimina tu cuenta. Esto elimina automáticamente todos los datos asociados en nuestra base de datos: perfil, planes, entrenamientos, registros de peso, controles corporales, chats con el coach con sus registros, solicitudes de soporte con todos los mensajes y tus aceptaciones guardadas. En el proceso también se elimina la copia en PowerSync.
4. Por último, la app cierra tu sesión en este dispositivo y elimina los datos guardados en él.

**Esto no pone fin a una suscripción activa.** Cancélala en la App Store o en Google Play.

En otros dispositivos en los que hubieras iniciado sesión, los datos guardados localmente pueden permanecer hasta que cierres sesión allí o elimines la app. Los datos de analítica en PostHog y los datos de suscripción en RevenueCat no se eliminan automáticamente con tu cuenta; escríbenos si quieres que los hagamos eliminar de inmediato; de lo contrario, se aplican los plazos de la sección 9.

Si la eliminación no funciona, por ejemplo sin conexión a internet, la app muestra un aviso y puedes intentarlo de nuevo. También puedes solicitar la eliminación por correo electrónico a support@useloqqa.com.

## 11. Tus derechos

Tienes los siguientes derechos frente a nosotros:

- **Acceso** a los datos que tratamos sobre ti (art. 15 del RGPD)
- **Rectificación** de datos inexactos (art. 16 del RGPD); puedes modificar gran parte de la información directamente en la app, y todo lo demás lo modificamos cuando nos escribes
- **Supresión** de tus datos (art. 17 del RGPD); puedes eliminar tu cuenta directamente en la app (sección 10)
- **Limitación** del tratamiento (art. 18 del RGPD)
- **Portabilidad de los datos** (art. 20 del RGPD): si lo solicitas por correo electrónico, te enviaremos los datos que nos proporcionaste como archivo JSON en el plazo de un mes.
- **Retirada** de los consentimientos otorgados (sección 12)

**Derecho de oposición (art. 21 del RGPD):** si tratamos datos sobre la base del art. 6, apartado 1, letra f), del RGPD (intereses legítimos), por ejemplo para la analítica de producto con PostHog, puedes oponerte en cualquier momento a este tratamiento por motivos relacionados con tu situación particular. Dejaremos entonces de tratar los datos, salvo que podamos acreditar motivos legítimos imperiosos que prevalezcan sobre tus intereses, o que el tratamiento sirva para la formulación, el ejercicio o la defensa de reclamaciones.

Para todas las solicitudes basta con un correo electrónico a support@useloqqa.com. Para que podamos identificar tu cuenta, indícanos la dirección de correo electrónico que muestra la app en sus ajustes.

## 12. Retirada del consentimiento

Puedes retirar un consentimiento en cualquier momento con efecto para el futuro (art. 7, apartado 3, del RGPD). El tratamiento realizado antes de la retirada sigue siendo lícito.

- **Medidas corporales:** por correo electrónico a support@useloqqa.com. Eliminaremos entonces tu peso, tu estatura y tus registros de peso. Sin esta información, la app solo puede adaptar tu entrenamiento de forma limitada; como alternativa, también puedes eliminar tu cuenta (sección 10).
- **Control corporal:** elimina tus controles en la app y no hagas otros nuevos, o escríbenos; eliminaremos entonces todas las fotos y valores del control corporal.
- **Coach:** por correo electrónico a support@useloqqa.com. Registraremos entonces tu retirada. Para el coach, solo transferimos datos a OpenAI cuando le haces una pregunta, así que no hagas más preguntas tras la retirada: una nueva pregunta cuenta como un nuevo consentimiento. Puedes eliminar tus chats anteriores en la app, o escribirnos; los eliminaremos entonces.

## 13. Reclamación ante una autoridad de control

Puedes presentar una reclamación ante una autoridad de control de protección de datos (art. 77 del RGPD), en particular en el Estado miembro de la UE en el que vives o trabajas o en el que tuvo lugar la presunta infracción. La autoridad competente para nosotros es el Bayerisches Landesamt für Datenschutzaufsicht (Autoridad de Protección de Datos de Baviera), Promenade 18, 91522 Ansbach, Alemania, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. ¿Tienes que facilitarnos datos?

Para una cuenta necesitamos tu cuenta de Google o tu cuenta de Apple. Sin una cuenta, no puedes usar Loqqa después de la configuración inicial. La app necesita la información de la configuración inicial para comprobar tu edad y para crear y adaptar tu plan. En particular, tu sexo (puedes elegir “Prefiero no decirlo”), el control corporal, el coach, los registros de peso, una foto de perfil y el texto “Sobre ti” son voluntarios.

## 15. Sin decisiones automatizadas

La app crea planes, sugerencias, niveles, valores del control corporal y las respuestas del coach de forma automática; los planes que pides que te creen, los valores del control corporal y las respuestas del coach proceden de un modelo de IA de OpenAI (secciones 4.6 a 4.8). Son información, recomendaciones y estimaciones para tu entrenamiento. Las respuestas del coach pueden ser incorrectas y no son consejo médico. No tomamos decisiones que produzcan efectos jurídicos en ti o te afecten significativamente de modo similar (art. 22 del RGPD).

## 16. Niños y adolescentes

Loqqa está dirigida a personas que han alcanzado la edad a la que, en su país, pueden dar por sí mismas su consentimiento para el tratamiento de sus datos: en Alemania, a partir de los 16 años; en otros países, a partir de una edad de entre 13 y 16 años, según la legislación local. Durante la configuración inicial, la app te pide tu fecha de nacimiento y solo te deja continuar a partir de esta edad; es determinante el país configurado en tu dispositivo. El coach solo está disponible a partir de los 16 años, incluso en países con una edad mínima inferior. El control corporal solo está disponible a partir de los 18 años. Nuestro servidor comprueba ambos mediante la fecha de nacimiento de tu perfil.

Si nos enteramos de que una cuenta pertenece a una persona menor de la edad mínima, la eliminaremos.

## 17. Seguridad

Protegemos tus datos con medidas técnicas y organizativas, entre ellas:

- transmisión cifrada entre la app y los servidores (HTTPS/TLS)
- reglas de acceso en la base de datos mediante las cuales cada cuenta solo puede leer y modificar sus propios datos
- áreas de almacenamiento no públicas para fotos de perfil, fotos del control corporal y capturas de pantalla, en las que cada cuenta solo puede acceder a su propia carpeta
- enlaces de duración limitada para mostrar fotos: una hora para las fotos del control corporal y las capturas de pantalla, 24 horas para las fotos de perfil
- inicio de sesión mediante Google o Apple, de modo que no guardamos contraseñas

Ningún sistema es completamente seguro. Como la app guarda datos en tu dispositivo, protege tu dispositivo con un bloqueo de pantalla.

## 18. Cambios en esta Política de Privacidad

Adaptamos esta Política de Privacidad cuando cambian la app o la situación jurídica. Puedes encontrar la versión actualmente vigente en la app, en los ajustes, y en [useloqqa.com](https://useloqqa.com). Te informaremos de los cambios sustanciales en la app y, cuando sea necesario, te pediremos tu consentimiento.
$md$, '2026-11-05'),
  ('privacy', 'fr', '1.3', $md$# Politique de confidentialité

Version : 1.3

Dernière mise à jour : 5 novembre 2026

Ceci est une traduction. La version allemande fait foi.

Tu trouveras ici quelles données à caractère personnel nous traitons lorsque tu utilises l'application Loqqa, pourquoi nous le faisons et quels droits tu as. Cette politique repose sur le Règlement général sur la protection des données (RGPD), la loi fédérale allemande sur la protection des données (BDSG) et la loi allemande sur la protection des données dans les télécommunications et les services numériques (TDDDG).

## En bref

- Loqqa enregistre d'abord tes programmes et tes séances sur ton appareil et les synchronise avec ton compte dès que tu es en ligne. Notre base de données se trouve à Francfort-sur-le-Main.
- Les autres utilisateurs ne peuvent voir ni ton profil, ni tes séances, ni tes photos.
- Nous traitons ton poids, ta taille et tes photos du bilan corporel comme des données de santé. Nous ne les traitons qu'avec ton consentement explicite.
- Pour la création de programme, l'importation de programme, la saisie vocale, le bilan corporel, le coach et la traduction des messages à l'assistance, nous utilisons un modèle d'IA d'OpenAI. Pour cela, nous transmettons les données nécessaires à OpenAI, qui les traite aux États-Unis.
- Pour améliorer l'application, nous utilisons PostHog afin de mesurer comment elle est utilisée. Les données de santé et les photos ne sont pas envoyées à PostHog. L'application ne contient aucune publicité.
- Tu peux supprimer ton compte dans l'application à tout moment. Cela supprime aussi tes photos et toutes les données de ton compte.

## 1. Qui est responsable ?

Le responsable du traitement de tes données est :

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 München, Allemagne
- E-mail : support@useloqqa.com

Ci-après dénommé « nous ».

## 2. Délégué à la protection des données

Nous n'avons pas désigné de délégué à la protection des données, car nous n'y sommes pas tenus. Pour toute question relative à la protection des données, tu peux nous contacter directement à l'adresse support@useloqqa.com.

## 3. Comment fonctionne Loqqa

Loqqa est une application d'entraînement. Tu peux faire créer un programme d'entraînement ou en importer un existant, enregistrer tes séances et ton poids corporel, poser des questions au coach sur ton entraînement et, à partir de 18 ans, faire des bilans corporels avec des photos.

L'application fonctionne en mode « offline first » (d'abord hors ligne) : tes données sont conservées dans une base de données sur ton appareil afin que tu puisses t'entraîner même sans internet. Lorsque tu es connecté et en ligne, l'application synchronise ces données avec ton compte sur nos serveurs. Ainsi, ton programme et ton historique sont sauvegardés et disponibles sur tous tes appareils. Pour les serveurs, nous faisons appel à des prestataires (section 7).

Toutes les données de notre base de données sont rattachées à ton compte. Des règles d'accès techniques garantissent que toi seul peux lire et modifier tes propres données. Loqqa ne comporte aucune fonctionnalité permettant à d'autres utilisateurs de voir ton profil, tes séances ou tes photos.

## 4. Quelles données nous traitons et pourquoi

### 4.1 Configuration sans compte

Tu effectues la configuration sans compte. Pendant la configuration, l'application charge depuis nos serveurs le catalogue d'exercices (noms, instructions, images et vidéos des exercices) et ces textes juridiques. Elle vérifie au démarrage si le catalogue d'exercices a changé, puis toutes les heures. Seules les données de connexion techniquement nécessaires sont générées à cette occasion (section 4.13).

L'application enregistre d'abord tes réponses données pendant la configuration (par exemple prénom, sexe, date de naissance, poids, taille, objectif et programme créé ou importé) uniquement sur ton appareil. Ces informations ne nous sont envoyées que lorsque tu crées un compte (sections 4.3 et 4.4). Exceptions : si tu fais créer un programme, l'application transmet au préalable tes réponses sur l'objectif, la priorité, l'équipement, le nombre de séances par semaine, la durée des séances et l'expérience afin que le programme puisse être créé ; elle transmet les photos et les fichiers à partir desquels tu importes un programme afin que le programme puisse être reconnu (les deux : section 4.7).

Base juridique : art. 6, paragraphe 1, point b), du RGPD (fourniture de l'application que tu souhaites utiliser).

### 4.2 Ton compte

À la fin de la configuration, tu crées un compte en te connectant avec ton compte Google ou, sur les appareils Apple, ton compte Apple. Il n'y a pas de mot de passe Loqqa. Dans ce cadre, nous traitons :

- les informations que Google ou Apple nous transmet lors de ta connexion, y compris ton adresse e-mail (voir ci-dessous)
- ton prénom, afin que l'application puisse le préremplir après ta connexion sur un nouvel appareil
- des données techniques du compte telles que la date et l'heure de l'inscription et de la dernière connexion, ainsi que des jetons de connexion

Pour te garder connecté, l'application enregistre ta session de connexion sur ton appareil.

**Connexion avec Google :** lorsque tu te connectes avec Google, la connexion Google s'ouvre sur ton appareil. Google nous confirme ensuite ta connexion et nous transmet ton adresse e-mail, ton nom, l'adresse de ta photo de profil Google et un identifiant de ton compte Google. Nous enregistrons ces informations avec ton compte. Google apprend ainsi que tu te connectes à Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande, est responsable du traitement, à titre indépendant, pour la connexion via ton compte Google ; la [Politique de confidentialité de Google](https://policies.google.com/privacy?hl=fr) s'applique.

**Connexion avec Apple** (uniquement sur les appareils Apple) : lorsque tu te connectes avec Apple, la connexion Apple s'ouvre sur ton appareil. Apple nous confirme ensuite ta connexion et nous transmet un identifiant de ton compte Apple et ton adresse e-mail. Tu peux à la place choisir une adresse générée par Apple qui te transfère les e-mails (« Masquer mon adresse e-mail »). Lors de la première connexion, Apple transmet aussi ton nom si tu le partages. Nous enregistrons ces informations avec ton compte. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Irlande, est responsable du traitement, à titre indépendant, pour la connexion via ton compte Apple ; l'[Engagement de confidentialité d'Apple](https://www.apple.com/legal/privacy/fr-ww/) s'applique.

Les comptes ne sont créés qu'à la fin de la configuration. Si la connexion via « Se connecter » sur l'écran d'accueil devait créer un nouveau compte, l'application le supprime immédiatement et t'indique qu'il n'existe pas encore de compte.

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.3 Profil et planification de l'entraînement

Lorsque tu crées un compte, nous enregistrons comme profil les informations que tu as données pendant la configuration. Tu peux en modifier une partie plus tard dans les réglages et dans ton profil.

- prénom, sexe biologique (« Ne pas préciser » est aussi possible) et date de naissance
- poids corporel, taille et tes unités préférées (métriques ou impériales)
- expérience d'entraînement, objectif d'entraînement, groupes musculaires prioritaires, équipement disponible, nombre de séances par semaine et durée de séance souhaitée
- la langue de ton application, afin que notre assistance puisse te répondre dans ta langue
- facultatif : une photo de profil (l'application l'enregistre sous forme d'image carrée de 512 × 512 pixels) et un court texte « À propos de toi » de 150 caractères maximum

Pourquoi : nous avons besoin de ta date de naissance pour vérifier l'âge minimum (section 16) et les limites d'âge pour le coach et le bilan corporel. Si tu fais créer un programme d'entraînement, un modèle d'IA d'OpenAI le crée à partir de ton objectif d'entraînement, de ta priorité, de ton équipement, du nombre de séances par semaine, de la durée des séances et de ton expérience (section 4.7). Le coach utilise aussi ton objectif, ton expérience, ton équipement, ta priorité et tes unités pour ses réponses (section 4.8). L'application utilise le sexe, l'âge, le poids et la taille pour ton niveau et tes suggestions ainsi que pour le bilan corporel (section 4.6). Ta photo de profil et « À propos de toi » ne sont affichés que pour toi dans ton profil.

Base juridique : art. 6, paragraphe 1, point b), du RGPD ; pour le poids corporel et la taille, ton consentement (section 4.4).

### 4.4 Données de santé et ton consentement

Certaines informations peuvent permettre de tirer des conclusions sur ta santé. Nous les traitons donc comme des données concernant la santé (« données de santé ») au sens de l'art. 9 du RGPD :

- **Données corporelles :** ton poids corporel, tes entrées de poids et ta taille (sections 4.3 et 4.5).
- **Bilan corporel :** tes photos du bilan corporel et les valeurs qui en sont déduites, par exemple un pourcentage de masse grasse estimé (section 4.6).

Nous ne traitons ces données qu'avec ton consentement explicite (art. 9, paragraphe 2, point a), en combinaison avec l'art. 6, paragraphe 1, point a), du RGPD) :

- **Données corporelles :** lors de la création de ton compte, tu consens explicitement, par la mention placée directement au-dessus du bouton, à ce que nous traitions tes données corporelles pour adapter ton entraînement. Avant cela, le poids et la taille restent sur ton appareil.
- **Bilan corporel :** avant que l'application envoie tes photos pour évaluation, elle t'informe que les photos et les données corporelles seront transmises à cet effet à OpenAI aux États-Unis. En touchant « Terminé », tu y consens.
- **Coach :** pour ses réponses, le coach utilise aussi tes entrées de poids et les scores corporels de tes bilans, et notre serveur transmet à cette fin tes données d'entraînement et tes données corporelles à OpenAI aux États-Unis (section 4.8). En créant ton compte et en acceptant cette Politique de confidentialité, tu y consens. Nous enregistrons la date et l'heure de ton consentement. Nous ne transmettons ces données que lorsque tu poses une question au coach.

Le bilan corporel et le coach sont facultatifs. Tu peux retirer chacun de tes consentements à tout moment avec effet pour l'avenir (section 12).

### 4.5 Données d'entraînement et poids corporel

Lorsque tu utilises Loqqa, nous enregistrons :

- **Programmes :** nom, nombre de séances par semaine, blocs avec une semaine de décharge, séances dans leur ordre (y compris les séances sans programme), exercices, séries avec valeurs cibles (répétitions ou secondes), répétitions en réserve (RIR) et temps de repos
- **Séances effectuées :** début et fin, à quel programme et à quelle semaine du programme elles comptent, exercices, charge et répétitions ou secondes par série, date et heure de chaque série effectuée et records personnels
- **Exercices personnalisés** que tu crées ou qui sont créés lors de l'importation d'un programme
- **Poids corporel :** les entrées de poids que tu enregistres, une valeur par jour

Pourquoi : pour que tu puisses enregistrer tes séances et ton poids et consulter ton historique, tes records, ton niveau et ton activité. L'application calcule sur ton appareil les suggestions pour tes séries et ton niveau. Si tu interroges le coach, il répond à ta question à partir de ces données (section 4.8).

Base juridique : art. 6, paragraphe 1, point b), du RGPD ; pour les entrées de poids, ton consentement (section 4.4).

### 4.6 Bilan corporel

Le bilan corporel est facultatif et n'est disponible qu'à partir de 18 ans. Pour cela, tu prends trois photos avec l'appareil photo : de face, de profil et de dos. L'application recommande de porter pour cela des sous-vêtements ou une tenue de sport près du corps. Ton visage peut être visible sur les photos.

L'application réduit les photos à une largeur maximale de 1080 pixels et les enregistre sur ton appareil. Lorsque tu lances l'évaluation, elle téléverse les photos dans un espace de stockage non public de ton compte. Elles y restent afin que tu puisses aussi les voir sur tes autres appareils. Tu as besoin d'une connexion internet pour l'évaluation.

**Évaluation par un modèle d'IA d'OpenAI :** un modèle d'IA d'OpenAI détermine les valeurs de ton bilan. Pour cela, notre serveur transmet à OpenAI :

- les trois photos de ce bilan et, si elles existent, les photos de ton bilan précédent, afin que le modèle puisse comparer directement les évolutions
- le sexe, l'âge (calculé à partir de ta date de naissance), la taille, le poids et l'expérience d'entraînement figurant dans ton profil
- les valeurs de ton bilan précédent, afin que les valeurs restent comparables d'un bilan à l'autre

Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

Le modèle vérifie d'abord si les photos peuvent être évaluées, par exemple si elles sont suffisamment lumineuses et si ton corps est visible au moins de la tête aux genoux. Si une photo ne peut pas être évaluée, l'application te demande de la reprendre. Sinon, le modèle fournit des valeurs pour six groupes musculaires (épaules, pectoraux, bras, dos, abdominaux, jambes), un pourcentage de masse grasse estimé et des valeurs pour les proportions et la définition. À partir de ces valeurs, notre serveur calcule le score corporel. Nous enregistrons ces valeurs avec ton bilan.

Avant que notre serveur n'évalue un bilan, il vérifie auprès de RevenueCat si ton compte dispose de Loqqa Pro (section 4.12). Nous consignons chaque évaluation avec sa date, son heure et son résultat. Cela nous permet de limiter le nombre d'évaluations par jour et de garantir que les valeurs enregistrées proviennent d'une évaluation. Nous supprimons ce journal avec ton compte.

Les valeurs sont des estimations approximatives et ne constituent ni une mesure médicale ni un diagnostic.

**Qui a accès :** techniquement, seul l'exploitant de Loqqa, Jan Timo Hünnebeck, peut accéder à l'espace de stockage. Il ne consulte les photos du bilan corporel que si tu le demandes à l'assistance, si cela est nécessaire pour corriger un bug que tu signales, ou si la loi nous y oblige.

Tu peux supprimer des bilans individuels dans l'application. L'application supprime alors les photos sur ton appareil et dans notre stockage. Si ton appareil est hors ligne à ce moment-là, des photos peuvent rester dans notre stockage jusqu'à la suppression de ton compte ; dans ce cas, écris-nous et nous les supprimerons.

Base juridique : ton consentement explicite (section 4.4), y compris pour le transfert vers OpenAI aux États-Unis (art. 49, paragraphe 1, point a), du RGPD, en plus des garanties de la section 8).

### 4.7 Importation de programme, création de programme et exercices par la voix

Tu peux importer un programme d'entraînement existant : sous forme de photo prise avec l'appareil photo (par exemple d'un papier, d'un tableau blanc ou d'un écran), sous forme d'un maximum de dix images de ta photothèque ou sous forme de fichier (PDF, Excel, CSV, texte ou image). Veille à ce qu'aucune donnée d'autres personnes ne soit visible dans les images et les fichiers.

**Reconnaissance par un modèle d'IA d'OpenAI :** l'application réduit les photos à 2000 pixels maximum sur le côté le plus long, les enregistre au format JPEG et les transmet, ou transmet ton fichier, à notre serveur. Le serveur les transmet, avec notre catalogue d'exercices, à un modèle d'IA d'OpenAI, qui en extrait les séances, les exercices, les séries, les répétitions et les temps de repos. Nous ne transmettons aucune autre donnée à cette occasion : la requête ne contient ni ton compte ni ton nom. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus.

Notre serveur n'enregistre ni tes photos ni tes fichiers ; il ne renvoie que le programme reconnu à l'application. Seul le programme que tu confirmes à la fin est enregistré (section 4.5). Ce faisant, l'application crée, comme exercices personnalisés dans ton compte, les exercices de ton programme que notre catalogue ne connaît pas.

**Création de programme par un modèle d'IA d'OpenAI :** si tu fais créer un programme, l'application transmet à notre serveur tes réponses sur l'objectif d'entraînement, les groupes musculaires prioritaires, l'équipement, le nombre de séances par semaine, la durée des séances et l'expérience d'entraînement, ainsi que la langue de ton application. Le serveur les transmet, avec les exercices de notre catalogue qui correspondent à ton équipement, à un modèle d'IA d'OpenAI, qui compose ton programme à partir de ces éléments. Nous ne transmettons à cette occasion ni ton nom, ni ta date de naissance, ni ton sexe, ni ton poids, ni ta taille, et la requête ne contient pas ton compte. Le traitement chez OpenAI est soumis aux mêmes règles que pour l'importation. Notre serveur n'enregistre pas tes réponses ; il ne renvoie que le programme à l'application, où tu peux le modifier.

**Exercices par la voix :** lors de l'importation d'un programme, de la modification d'une séance et de la composition d'une séance libre, tu peux dicter des exercices avec leurs séries et leurs répétitions au lieu de les chercher un par un. La reconnaissance vocale de ton système d'exploitation transforme ce que tu dis en texte : celle d'Apple sur l'iPhone, celle de Google sur les appareils Android. Selon l'appareil, cela se fait sur l'appareil lui-même ou sur les serveurs d'Apple ou de Google ; leurs politiques de confidentialité s'appliquent à ce traitement. Nous ne recevons pas l'enregistrement lui-même. L'application transmet à notre serveur le texte, que tu peux encore modifier avant d'ajouter les exercices, avec la langue de ton application. Le serveur le transmet, avec notre catalogue d'exercices, à un modèle d'IA d'OpenAI, qui reconnaît les exercices avec leurs séries et leurs répétitions. La requête ne contient ni ton compte ni ton nom. Le traitement chez OpenAI est soumis aux mêmes règles que pour l'importation. Notre serveur n'enregistre pas le texte.

**Limites de requêtes :** pour éviter que l'importation, la création de programme et les exercices par la voix ne soient utilisés de façon abusive, nous limitons la fréquence à laquelle ils peuvent être utilisés par réseau et au total par jour. Pour cela, notre serveur enregistre pour chaque requête la date et l'heure, la fonctionnalité concernée, et un hachage de ton adresse IP qu'il génère avec une clé secrète ; nous n'enregistrons pas l'adresse IP elle-même. Nous supprimons les entrées de plus de deux jours à chaque nouvelle requête.

Base juridique : art. 6, paragraphe 1, point b), du RGPD pour l'importation, la création de programme et les exercices par la voix que tu lances, y compris pour le transfert vers OpenAI aux États-Unis. Pour les limites de requêtes, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'empêcher les abus et les coûts inutiles.

### 4.8 Kai · coach IA

Avec Loqqa Pro, tu peux poser à Kai, le coach IA de l'application, des questions sur ton propre entraînement, par exemple « Comment mon poids a-t-il évolué ? ». Le coach répond en quelques phrases, le plus souvent avec un graphique issu de tes données. Il répond aussi à des questions générales d'entraînement, par exemple à quelle fréquence entraîner les jambes ou quel exercice faire si quelque chose fait mal. Si tu le demandes, il peut aussi composer une séance, te montrer l'une de tes séances enregistrées ou proposer de remplacer des exercices dans ton programme ; ton programme ne change qu'une fois que tu le confirmes dans l'application. Il ne pose aucun diagnostic. Kai est une IA, pas une personne. Le coach est facultatif et n'est disponible qu'à partir de 16 ans. Tu as besoin d'une connexion internet pour l'utiliser.

**Réponses par un modèle d'IA d'OpenAI :** l'application transmet à notre serveur ta question, avec la langue de ton application et le fuseau horaire de ton appareil. Le serveur transmet la question à un modèle d'IA d'OpenAI. Si le modèle a besoin de données, il les demande à notre serveur : le serveur calcule les valeurs à partir de tes données enregistrées et transmet les résultats à OpenAI. Le modèle rédige la réponse à partir de ces résultats. À chaque question, notre serveur transmet à OpenAI :

- ta question et les six dernières questions au plus de cette discussion, avec leurs réponses et les données consultées pour celles-ci
- la date du jour, tes unités et la langue de ton application
- l'objectif d'entraînement, l'expérience d'entraînement, l'équipement et les groupes musculaires prioritaires de ton profil, ainsi que le nom et le nombre de séances par semaine de ton programme actif
- les séances de ton programme actif avec leurs exercices et où elles en sont cette semaine (faite, prochaine ou à faire), et les noms de tes autres séances enregistrées
- le nombre de tes séances avec la date de la première et de la dernière, le nombre de tes entrées de poids avec la date de la première, et le nombre de tes bilans corporels
- les exercices que tu as effectués, y compris les exercices personnalisés : nom, façon dont tu les enregistres, dans combien de séances tu les as faits et quand tu les as faits pour la dernière fois

Selon la question, notre serveur transmet aussi ce qu'il calcule à partir de tes données pour y répondre :

- des séances avec date, nom, durée, exercices et séries (charge, répétitions, secondes et RIR)
- des valeurs par séance, par exemple le maximum estimé sur une répétition (1RM), la charge la plus lourde, les répétitions, le temps de maintien, le volume et les records
- tes entrées de poids et une tendance de poids lissée
- les scores corporels de tes bilans, sans photos et sans valeurs individuelles telles que le pourcentage de masse grasse
- des séances, séries, volumes et temps d'entraînement par semaine ou par mois, des pauses d'entraînement et les jours de la semaine de tes séances
- des séries par groupe musculaire et par exercice
- les exercices, séries et objectifs d'une séance enregistrée, lorsque le coach te la montre ou propose une modification
- des exercices du catalogue de l'application, lorsque le coach compose une séance ou propose un remplacement, en commençant par ceux que tu as faits le plus souvent

Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte, ni ta date de naissance, ni ton âge, ni ton sexe, ni ta taille, ni ta photo de profil, ni ton texte « À propos de toi », ni tes photos du bilan corporel, ni tes messages à l'assistance. N'écris pas de données d'autres personnes dans tes questions. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

Les réponses sont rédigées par un modèle d'IA. Elles peuvent être erronées. Ce sont des informations et des recommandations pour ton entraînement, pas un avis médical ni un diagnostic.

Avant que notre serveur ne réponde à une question, il vérifie ton âge à partir de la date de naissance de ton profil, ton consentement (section 4.4) et, auprès de RevenueCat, si ton compte dispose de Loqqa Pro (section 4.12).

**Questions par la voix :** tu peux aussi dicter ta question. L'application enregistre alors via le microphone jusqu'à ce que tu termines l'enregistrement, pendant deux minutes au maximum, et transmet l'enregistrement, avec la langue de ton application, à notre serveur. Le serveur le transmet à un modèle de reconnaissance vocale d'OpenAI, qui le transforme en texte. Pour que des termes comme « développé couché » soient correctement reconnus, il y joint une courte note sur le sujet (questions à un coach d'entraînement et termes typiques). L'application affiche le texte dans le champ de saisie, où tu peux le modifier ; il ne devient ta question que lorsque tu l'envoies. Nous ne conservons pas ton enregistrement : notre serveur ne fait que le transmettre, et l'application le supprime sur ton appareil dès que le texte est disponible ou que tu supprimes l'enregistrement. N'enregistre pas d'autres personnes. Le traitement chez OpenAI est soumis aux mêmes règles que pour les réponses (États-Unis, pas d'utilisation pour l'entraînement, conservation jusqu'à 30 jours pour détecter les abus). Là aussi, notre serveur vérifie ton âge et si ton compte dispose de Loqqa Pro. Pour éviter que la conversion ne soit utilisée de façon abusive, tu peux l'utiliser au maximum 100 fois en 24 heures. Pour cela, notre serveur enregistre pour chaque conversion la date, l'heure et un hachage de l'identifiant de ton compte, qu'il génère avec une clé secrète ; nous supprimons les entrées de plus de deux jours à chaque nouvelle conversion.

**Ce que nous enregistrons :** nous enregistrons dans notre base de données tes discussions avec les questions, les réponses et les graphiques sous les réponses. L'application les synchronise sur tes appareils afin que tu puisses y voir tes discussions (section 5). Pour chaque question, nous enregistrons en outre un journal que l'application n'affiche pas : la date et l'heure, le statut (par exemple si une réponse a été donnée), le modèle utilisé, le nombre de jetons (unités de texte sur lesquelles OpenAI facture) et la durée, ainsi que les consultations du modèle avec les données consultées. Nous avons besoin de ces consultations pour que le coach puisse répondre aux questions de suivi sur une réponse.

**Limites de questions :** pour éviter que le coach ne soit utilisé de façon abusive et pour éviter des coûts inutiles, tu peux poser au maximum 20 questions en 24 heures et 150 questions en 30 jours. Pour cela, notre serveur compte les journaux.

Tu peux supprimer des discussions dans l'application, y compris plusieurs à la fois. Nous supprimons alors leurs questions, réponses et graphiques ainsi que les données consultées dans leurs journaux. La date et l'heure, le statut, le modèle, les jetons et la durée sont conservés afin que les limites continuent de s'appliquer et que nous puissions suivre les coûts du coach. Pour le reste, nous conservons tes discussions jusqu'à ce que tu les supprimes ou que tu supprimes ton compte. Lorsque tu supprimes ton compte, nous supprimons toutes les discussions et tous les journaux (section 10).

Base juridique : ton consentement explicite (section 4.4), y compris pour le transfert vers OpenAI aux États-Unis (art. 49, paragraphe 1, point a), du RGPD, en plus des garanties de la section 8). Pour la transformation d'une question dictée en texte, art. 6, paragraphe 1, point b), du RGPD, puisque tu la lances, y compris pour le transfert vers OpenAI aux États-Unis. Pour les limites de questions et de conversions et les informations sur la date et l'heure, le statut, le modèle, les jetons et la durée, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'empêcher les abus et les coûts inutiles.

### 4.9 Assistance

Tu peux nous écrire directement dans l'application via « Signaler un bug » et « Proposer une fonctionnalité », ou écrire à support@useloqqa.com. Dans l'application, nous traitons :

- le type de ta demande (bug ou idée), pour les idées l'importance de 1 à 5, tes messages et l'objet (la première ligne de ton premier message)
- jusqu'à cinq captures d'écran par message que tu sélectionnes dans ta photothèque ; l'application les réduit (côté le plus long : 1600 pixels au maximum) et les enregistre au format JPEG
- l'historique de ta demande, par exemple les changements de statut, nos réponses et si tu as rouvert une demande
- l'appareil depuis lequel tu envoies une demande : plateforme (iOS ou Android), version du système d'exploitation, modèle de l'appareil et version de l'application, afin que nous puissions retrouver l'origine des erreurs
- la langue de ton application, afin que nous puissions traduire nos réponses dans ta langue
- la langue détectée de chaque message et ses traductions (voir ci-dessous)

**Traduction par un modèle d'IA d'OpenAI :** pour que nous te comprenions et que tu puisses lire nos réponses dans ta langue, un modèle d'IA d'OpenAI traduit les messages à l'assistance. Pour cela, notre serveur transmet à OpenAI chaque message contenant du texte, avec la langue vers laquelle le traduire : tes messages, pour en détecter la langue et les traduire dans la langue de notre assistance, et nos réponses, pour les traduire dans la langue de ton application. Si tu changes la langue de ton application, nous traduisons nos réponses antérieures dans la nouvelle langue. Nous ne transmettons ni ton nom, ni ton adresse e-mail, ni l'identifiant de ton compte, ni tes captures d'écran. Nous enregistrons les traductions avec les messages ; dans l'application, tu peux afficher l'original à tout moment. OpenAI traite les données aux États-Unis (section 8). Nous avons configuré OpenAI pour qu'il ne conserve pas la requête en vue d'une consultation ultérieure. OpenAI n'utilise pas les données de son API pour entraîner ses modèles et les conserve jusqu'à 30 jours pour détecter les abus ; elles sont ensuite supprimées.

**Messages par la voix :** tu peux aussi dicter ton message. Cela fonctionne comme pour les questions au coach (section 4.8) : l'application enregistre jusqu'à ce que tu termines l'enregistrement, pendant deux minutes au maximum. Notre serveur transmet l'enregistrement, avec une courte note sur le sujet, à un modèle de reconnaissance vocale d'OpenAI. L'application affiche le texte dans le champ de saisie, où tu peux le modifier ; il ne devient ton message que lorsque tu l'envoies. Nous ne conservons pas ton enregistrement. Là aussi, notre serveur vérifie ton âge et si ton compte dispose de Loqqa Pro, et la même limite s'applique.

**Qui voit ta demande :** nous traitons les demandes dans un espace d'assistance interne, dans le navigateur, auquel seul Jan Timo Hünnebeck a accès, avec ses propres identifiants. Pour ta demande, l'espace d'assistance affiche aussi ton adresse e-mail, si tu te connectes avec Apple ou Google, l'identifiant de ton compte, la date de création de ton compte et de ta dernière activité, la langue de ton application et tes demandes antérieures.

L'application enregistre d'abord les captures d'écran sur ton appareil, puis les téléverse en arrière-plan. Tu ne peux pas supprimer toi-même les messages et les demandes, afin que l'historique reste traçable. Ils sont supprimés avec ton compte ; sur demande, nous supprimons aussi plus tôt les demandes closes. Nous conservons les e-mails aussi longtemps que nous en avons besoin pour ta demande.

N'envoie pas de données de santé ni de données d'autres personnes dans les messages et les captures d'écran si elles ne sont pas nécessaires à ta demande. Nous transmettons aussi les messages à OpenAI pour la traduction.

Base juridique : art. 6, paragraphe 1, point b), du RGPD, dans la mesure où ta demande concerne l'utilisation de l'application, par exemple en cas de bugs. Pour les idées et les autres retours, art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est de répondre à ta demande et d'améliorer Loqqa. Cela vaut aussi pour la traduction et le transfert vers OpenAI aux États-Unis (section 8).

### 4.10 Textes juridiques et acceptations

L'application charge la version actuellement en vigueur des Conditions d'utilisation et de cette Politique de confidentialité dans ta langue. Lorsque tu acceptes une version, lors de l'inscription ou plus tard une version modifiée, nous enregistrons la version que tu as acceptée, la date et l'heure (fixées par le serveur), la version de l'application et la plateforme (iOS ou Android). Cela nous permet de prouver quelle version s'applique à toi et de te demander à nouveau ton accord en cas de modifications substantielles.

Base juridique : art. 6, paragraphe 1, point c), en combinaison avec l'art. 7, paragraphe 1, du RGPD (preuve du consentement) et art. 6, paragraphe 1, point f), du RGPD (notre intérêt légitime à pouvoir prouver quelles conditions s'appliquent).

### 4.11 Loqqa Pro : abonnements et achats

Tu achètes Loqqa Pro via l'App Store d'Apple ou via Google Play. Apple ou Google, selon le cas, traite l'achat et le paiement. Ils en sont eux-mêmes responsables et traitent tes données de paiement conformément à leurs propres politiques de confidentialité : [Apple](https://www.apple.com/legal/privacy/fr-ww/) et [Google](https://policies.google.com/privacy?hl=fr). Nous ne recevons aucune donnée de paiement telle que des numéros de carte bancaire.

Pour que nous puissions débloquer Loqqa Pro, nous apprenons via RevenueCat (section 4.12) quel abonnement tu as acheté, si une période d'essai est en cours, quand tu l'as acheté et si l'abonnement est actif. L'application enregistre ce statut sur ton appareil et l'interroge à nouveau au démarrage et à chaque connexion. Nous n'enregistrons pas de données d'achat dans notre propre base de données.

Tu gères et résilies ton abonnement dans les réglages de ton compte de boutique. L'application y renvoie sous « Gérer l'abonnement ».

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.12 Gestion des abonnements avec RevenueCat

Nous gérons les achats et les abonnements via RevenueCat. Pour notre compte, RevenueCat vérifie les justificatifs d'achat de la boutique et indique à l'application si Loqqa Pro est actif. Avant que notre serveur n'évalue un bilan corporel ou ne réponde à une question au coach, il demande à RevenueCat si ton compte dispose de Loqqa Pro.

Pour que RevenueCat puisse rattacher tes achats à ton compte, nous lui transmettons l'identifiant de ton compte, un identifiant aléatoire sans nom ni adresse e-mail. Si tu achètes avant de créer ton compte, RevenueCat attribue d'abord son propre identifiant aléatoire, puis rattache l'achat à ton compte. RevenueCat traite aussi des informations d'achat et d'abonnement provenant de la boutique (par exemple produit, prix, devise, dates d'achat, de renouvellement et d'expiration, période d'essai et identifiants de transaction) ainsi que des informations techniques telles que la plateforme, le type d'appareil, la version de l'application et l'adresse IP.

RevenueCat envoie en outre à PostHog (section 4.14) des événements relatifs à ton abonnement, par exemple un essai commencé ou converti, les renouvellements et les résiliations, chacun avec le chiffre d'affaires correspondant. Pour cela, l'application communique à RevenueCat ton identifiant PostHog : un identifiant aléatoire avant la création de ton compte, l'identifiant de ton compte ensuite.

- Prestataire : RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, États-Unis, en tant que sous-traitant
- Lieu de stockage : États-Unis (Amazon Web Services) ; pour la garantie, voir la section 8
- Durée de conservation : aussi longtemps que notre contrat avec RevenueCat existe ; nous faisons supprimer les données relatives à ton compte lorsque tu supprimes ton compte, sauf obligations légales contraires

Base juridique : art. 6, paragraphe 1, point b), du RGPD.

### 4.13 Données de connexion techniquement nécessaires

Chaque fois que l'application est connectée à nos serveurs (par exemple lors de la connexion, de la synchronisation, d'un téléversement ou du chargement du catalogue d'exercices et des textes juridiques), des données techniquement nécessaires sont traitées : ton adresse IP, la date et l'heure, l'interface consultée et des informations techniques telles que les codes d'état et, lorsqu'elles sont transmises, des informations sur l'application et le système d'exploitation. Nos hébergeurs consignent ces données pour assurer le fonctionnement et la sécurité. Chez Supabase, les journaux sont supprimés après un jour ; chez PowerSync, dès qu'ils ne sont plus nécessaires au fonctionnement et à la sécurité.

Base juridique : art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est un fonctionnement stable et sûr.

### 4.14 Analyse du produit et rapports d'erreurs avec PostHog

Pour comprendre comment Loqqa est utilisée et pour trouver des bugs, nous utilisons PostHog. Pour cela, l'application envoie :

- **Événements d'utilisation :** les écrans que tu ouvres et certaines étapes, par exemple le début de la configuration, les programmes créés ou importés, les consultations de l'écran Loqqa Pro, les achats, l'inscription et la connexion, le début, la fin ou l'annulation d'une séance, le fait que tu aies posé une question au coach et s'il a répondu (jamais le texte), l'évaluation d'un bilan corporel (jamais les valeurs), l'enregistrement d'une entrée de poids (jamais le poids), les exercices ajoutés par la voix, les demandes d'évaluation sur la boutique, chacun avec la date, l'heure et des indicateurs tels que le nombre d'exercices ou de séries, la durée ou le code d'erreur
- **Événements d'abonnement :** essais commencés ou convertis, renouvellements et résiliations avec le chiffre d'affaires correspondant, envoyés par RevenueCat (section 4.12)
- **Événements de l'application :** ouverture et fermeture de l'application, version de l'application, type d'appareil, système d'exploitation et langue
- **Rapports d'erreurs :** messages de plantage et d'erreur avec des détails techniques
- **Informations de profil :** après l'inscription, objectif, expérience, nombre de séances par semaine, répartition de l'entraînement (split), équipement, langue, unités, une tranche d'âge (par exemple « 25–34 ») et si tu disposes de Loqqa Pro
- **un identifiant pseudonyme :** avant l'inscription, un identifiant aléatoire que l'application enregistre sur ton appareil, ensuite l'identifiant de ton compte, afin que les événements avant et après l'inscription soient réunis

Ton nom, ton adresse e-mail, ton poids, ta taille, ta date de naissance, les photos et les valeurs du bilan corporel et le texte libre ne sont pas envoyés à PostHog. PostHog n'enregistre pas ton adresse IP, et nous n'utilisons pas d'enregistrements de session. Lorsque tu te déconnectes, l'application réinitialise l'identifiant.

- Prestataire : PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, États-Unis, en tant que sous-traitant
- Lieu de stockage : PostHog Cloud EU (Francfort-sur-le-Main) ; PostHog est certifié au titre du cadre de protection des données UE-États-Unis (EU-US Data Privacy Framework, section 8)
- Durée de conservation : les événements sont supprimés après un an

Base juridique : art. 6, paragraphe 1, point f), du RGPD ; notre intérêt légitime est d'améliorer Loqqa et de corriger des bugs. Tu peux t'y opposer à tout moment (section 11), par exemple par e-mail à support@useloqqa.com ; nous supprimerons alors les données d'analyse relatives à ton compte.

## 5. Stockage sur ton appareil

Pour que Loqqa fonctionne aussi hors ligne, l'application enregistre des données sur ton appareil :

- une base de données locale avec ton profil, tes programmes et tes séances, tes entrées de poids, les valeurs de tes bilans corporels, tes discussions avec le coach, tes demandes à l'assistance et tes acceptations
- les photos du bilan corporel que tu as prises sur cet appareil, et des copies de tes captures d'écran envoyées à l'assistance
- ta session de connexion, tes réponses de la configuration, ton statut d'abonnement, des réglages tels que la langue de l'application, et des listes de fichiers qui doivent encore être téléversés
- le catalogue d'exercices
- l'identifiant et les événements pas encore envoyés pour PostHog (section 4.14)

À l'exception des données destinées à PostHog, ce stockage est strictement nécessaire aux services que tu souhaites utiliser (§ 25, alinéa 2, n° 2, TDDDG).

Lorsque tu te déconnectes, l'application supprime la base de données locale ainsi que tes photos du bilan corporel et les copies de captures d'écran sur cet appareil, et réinitialise la configuration, le statut d'abonnement et les séances en cours. Les modifications non encore synchronisées sont perdues à cette occasion ; l'application t'en avertit au préalable. Les réglages tels que la langue de l'application sont conservés. Lorsque tu supprimes l'application, ton système d'exploitation supprime en général toutes les données de l'application.

Selon les réglages de ton appareil, les fichiers de l'application, y compris les photos du bilan corporel, peuvent être inclus dans les sauvegardes de ton appareil (par exemple avec iCloud ou Google). Apple ou Google, selon le cas, est responsable de ces sauvegardes.

## 6. Autorisations sur ton appareil

Loqqa ne demande une autorisation que lorsque tu utilises une fonctionnalité qui en a besoin :

- **Appareil photo :** pour photographier ton programme d'entraînement, pour les photos du bilan corporel et pour ta photo de profil
- **Photos :** pour sélectionner des images pour l'importation de programme, pour les captures d'écran destinées à l'assistance et pour ta photo de profil. Pour cela, l'application utilise le sélecteur d'images de ton système d'exploitation et ne reçoit que les images que tu sélectionnes.
- **Fichiers :** pour sélectionner un fichier de programme via le sélecteur de fichiers de ton système d'exploitation
- **Microphone :** pour dicter des exercices (section 4.7), des questions au coach (section 4.8) et des messages à l'assistance (section 4.9). L'application n'enregistre que pendant que tu utilises la saisie vocale.
- **Reconnaissance vocale (iPhone) :** pour que la reconnaissance vocale d'Apple puisse transformer les exercices dictés en texte (section 4.7)

Loqqa ne demande pas l'accès à la localisation, aux contacts ou aux applications de santé telles que l'app Santé d'Apple ou Santé Connect, et n'envoie pas de notifications push. Tu peux révoquer les autorisations à tout moment dans les réglages de ton appareil.

## 7. Destinataires et sous-traitants

Nous ne transmettons tes données que si cela est nécessaire aux finalités indiquées, si tu y as consenti ou si la loi nous y oblige. Nos prestataires traitent des données pour notre compte et selon nos instructions (art. 28 du RGPD) :

- **Supabase, Inc.** (base de données, connexion, stockage de fichiers et fonctions serveur) : serveurs à Francfort-sur-le-Main (Amazon Web Services)
- **PowerSync** de Journey Mobile, Inc. (synchronisation entre l'application et la base de données ; pour cela, le service conserve une copie de tes données synchronisées) : serveurs dans l'UE
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Irlande (création de programmes par IA, reconnaissance des programmes importés et des exercices dictés, évaluation des photos du bilan corporel, réponses du coach, transformation des questions dictées en texte et traduction des messages à l'assistance, sections 4.6 à 4.9) : traitement aux États-Unis par OpenAI OpCo, LLC
- **RevenueCat, Inc.** (gestion des abonnements, section 4.12)
- **PostHog, Inc.** (analyse du produit et rapports d'erreurs, section 4.14)

Apple et Google reçoivent des données en tant que responsables du traitement indépendants pour les téléchargements d'applications et les achats (section 4.11), ainsi que pour la connexion via leur compte (section 4.2) et pour la reconnaissance vocale de leur système d'exploitation (section 4.7).

Loqqa est exploitée par une seule personne : seul Jan Timo Hünnebeck a accès à tes données, dans la mesure où il en a besoin pour l'exploitation et l'assistance.

Nous ne communiquons des données à des autorités et à des tribunaux que si la loi nous y oblige.

## 8. Transferts vers des pays tiers

Nous stockons ton compte, tes séances et tes photos dans des centres de données de l'UE (Supabase à Francfort-sur-le-Main, PowerSync dans l'UE). Certains de nos prestataires ont leur siège aux États-Unis. Des données peuvent donc aussi être transférées vers les États-Unis, par exemple lors de la maintenance ou de l'assistance assurées par le prestataire. Pour la création de programme, l'importation de programme, les exercices et les questions dictés, l'évaluation du bilan corporel, les réponses du coach et la traduction des messages à l'assistance, nous transmettons à chaque requête des données à OpenAI aux États-Unis (sections 4.6 à 4.9), et RevenueCat traite les données d'abonnement aux États-Unis (section 4.12).

Nous fondons ces transferts sur les garanties suivantes :

- **PostHog :** décision d'adéquation de la Commission européenne pour le cadre de protection des données UE-États-Unis, au titre duquel PostHog est certifié (art. 45 du RGPD)
- **Supabase, PowerSync, OpenAI et RevenueCat :** clauses contractuelles types de la Commission européenne (art. 46, paragraphe 2, point c), du RGPD), qui font partie de nos contrats de sous-traitance
- **Bilan corporel et coach :** en outre ton consentement explicite (art. 49, paragraphe 1, point a), du RGPD). Aux États-Unis, des autorités peuvent, dans certaines circonstances, accéder à des données sans que tu disposes à cet égard des mêmes voies de recours que dans l'UE.

Tu peux nous demander une copie des clauses contractuelles types.

## 9. Durée de conservation de tes données

- **Compte, profil, programmes, séances, entrées de poids, bilans corporels, discussions avec le coach, demandes à l'assistance et acceptations :** aussi longtemps que ton compte existe. Tu peux supprimer toi-même au préalable des contenus individuels, par exemple des programmes, des entrées de poids, des bilans corporels ou des discussions avec le coach. Lorsque tu supprimes ton compte, nous les supprimons complètement (section 10). Nous ne supprimons pas automatiquement les comptes qui ne sont plus utilisés ; tu peux demander la suppression à tout moment dans l'application ou par e-mail.
- **Réponses de la configuration sans compte :** uniquement sur ton appareil, jusqu'à ce que tu crées un compte ou que tu supprimes l'application.
- **Données sur ton appareil :** jusqu'à ce que tu te déconnectes ou que tu supprimes l'application (section 5).
- **Journaux serveur :** un jour chez Supabase ; chez PowerSync, aussi longtemps qu'ils sont nécessaires au fonctionnement et à la sécurité (section 4.13).
- **Limites pour l'importation, la création de programme et la saisie vocale :** deux jours (sections 4.7 et 4.8).
- **Enregistrements de questions dictées :** nous ne les conservons pas ; l'application les supprime après la conversion (section 4.8).
- **Journaux du coach :** aussi longtemps que ton compte existe ; nous supprimons les données consultées qu'ils contiennent avec la discussion concernée (section 4.8).
- **Chez OpenAI :** jusqu'à 30 jours (sections 4.6 à 4.9).
- **Données d'analyse chez PostHog :** un an (section 4.14).
- **Données d'abonnement chez RevenueCat :** voir la section 4.12.
- **Sauvegardes :** nous ne créons actuellement aucune sauvegarde de notre base de données et de notre stockage. Si cela change, nous ajouterons ici combien de temps les sauvegardes sont conservées.

## 10. Supprimer ton compte

Tu peux supprimer ton compte dans l'application à tout moment : dans les réglages sous « Supprimer le compte ». Voici alors ce qui se passe :

1. Si tu t'es connecté avec Apple, tu le confirmes une fois de plus auprès d'Apple sur un appareil Apple. Cela met fin à la liaison entre ton compte Apple et Loqqa : notre serveur échange la confirmation avec Apple contre tes clés de connexion et les fait révoquer immédiatement. Rien n'est enregistré à cette occasion.
2. L'application supprime de notre stockage ta photo de profil, tes photos du bilan corporel et tes captures d'écran envoyées à l'assistance.
3. Ton compte est ensuite supprimé. Cela supprime automatiquement toutes les données associées dans notre base de données : profil, programmes, séances, entrées de poids, bilans corporels, discussions avec le coach et leurs journaux, demandes à l'assistance avec tous les messages et tes acceptations enregistrées. La copie chez PowerSync est également supprimée à cette occasion.
4. Enfin, l'application te déconnecte sur cet appareil et supprime les données qui y sont enregistrées.

**Cela ne met pas fin à un abonnement actif.** Résilie-le dans l'App Store ou sur Google Play.

Sur les autres appareils sur lesquels tu étais connecté, des données enregistrées localement peuvent subsister jusqu'à ce que tu t'y déconnectes ou que tu supprimes l'application. Les données d'analyse chez PostHog et les données d'abonnement chez RevenueCat ne sont pas supprimées automatiquement en même temps ; écris-nous si tu veux que nous les fassions supprimer immédiatement, sinon les durées de la section 9 s'appliquent.

Si la suppression ne fonctionne pas, par exemple sans connexion internet, l'application affiche un avis et tu peux réessayer. Tu peux aussi demander la suppression par e-mail à support@useloqqa.com.

## 11. Tes droits

Tu disposes à notre égard des droits suivants :

- **Droit d'accès** aux données que nous traitons à ton sujet (art. 15 du RGPD)
- **Droit de rectification** des données inexactes (art. 16 du RGPD) ; tu peux modifier directement dans l'application de nombreuses informations, nous modifions tout le reste lorsque tu nous écris
- **Droit à l'effacement** de tes données (art. 17 du RGPD) ; tu peux supprimer ton compte directement dans l'application (section 10)
- **Droit à la limitation** du traitement (art. 18 du RGPD)
- **Droit à la portabilité des données** (art. 20 du RGPD) : sur ta demande par e-mail, nous t'envoyons dans un délai d'un mois les données que tu nous as fournies sous forme de fichier JSON.
- **Droit de retirer** les consentements donnés (section 12)

**Droit d'opposition (art. 21 du RGPD) :** si nous traitons des données sur la base de l'art. 6, paragraphe 1, point f), du RGPD (intérêts légitimes), par exemple pour l'analyse du produit avec PostHog, tu peux t'opposer à tout moment à ce traitement pour des raisons tenant à ta situation particulière. Nous ne traiterons alors plus les données, sauf si nous pouvons démontrer des motifs légitimes et impérieux qui prévalent sur tes intérêts, ou si le traitement sert à la constatation, à l'exercice ou à la défense de droits en justice.

Pour toutes les demandes, un e-mail à support@useloqqa.com suffit. Pour que nous puissions identifier ton compte, indique-nous l'adresse e-mail que l'application affiche dans ses réglages.

## 12. Retirer tes consentements

Tu peux retirer un consentement à tout moment avec effet pour l'avenir (art. 7, paragraphe 3, du RGPD). Le traitement effectué avant le retrait demeure licite.

- **Données corporelles :** par e-mail à support@useloqqa.com. Nous supprimerons alors ton poids, ta taille et tes entrées de poids. Sans ces informations, l'application ne peut adapter ton entraînement que de façon limitée ; tu peux aussi, à la place, supprimer ton compte (section 10).
- **Bilan corporel :** supprime tes bilans dans l'application et n'en fais plus de nouveaux, ou écris-nous ; nous supprimerons alors toutes les photos et valeurs du bilan corporel.
- **Coach :** par e-mail à support@useloqqa.com. Nous enregistrerons alors ton retrait. Pour le coach, nous ne transmettons des données à OpenAI que lorsque tu lui poses une question ; ne pose donc plus de questions après le retrait : une nouvelle question vaut nouveau consentement. Tu peux supprimer tes discussions antérieures dans l'application, ou nous écrire ; nous les supprimerons alors.

## 13. Réclamation auprès d'une autorité de contrôle

Tu peux introduire une réclamation auprès d'une autorité de contrôle de la protection des données (art. 77 du RGPD), en particulier dans l'État membre de l'UE dans lequel tu vis ou travailles ou dans lequel la violation présumée a eu lieu. L'autorité compétente pour nous est le Bayerisches Landesamt für Datenschutzaufsicht (autorité bavaroise de contrôle de la protection des données), Promenade 18, 91522 Ansbach, Allemagne, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Es-tu obligé de nous fournir des données ?

Pour un compte, nous avons besoin de ton compte Google ou de ton compte Apple. Sans compte, tu ne peux pas utiliser Loqqa après la configuration. L'application a besoin des informations de la configuration pour vérifier ton âge ainsi que pour créer et adapter ton programme. Ton sexe (tu peux choisir « Ne pas préciser »), le bilan corporel, le coach, les entrées de poids, une photo de profil et le texte « À propos de toi » sont notamment facultatifs.

## 15. Pas de décisions automatisées

L'application crée automatiquement des programmes, des suggestions, des niveaux, des valeurs de bilan corporel et les réponses du coach ; les programmes que tu fais créer, les valeurs du bilan corporel et les réponses du coach proviennent d'un modèle d'IA d'OpenAI (sections 4.6 à 4.8). Ce sont des informations, des recommandations et des estimations pour ton entraînement. Les réponses du coach peuvent être erronées et ne constituent pas un avis médical. Nous ne prenons aucune décision qui produise des effets juridiques te concernant ou t'affecte de manière significative de façon similaire (art. 22 du RGPD).

## 16. Enfants et adolescents

Loqqa s'adresse aux personnes qui ont atteint l'âge auquel elles peuvent consentir elles-mêmes au traitement de leurs données dans leur pays : en Allemagne à partir de 16 ans, dans les autres pays, entre 13 et 16 ans selon le droit local. Lors de la configuration, l'application te demande ta date de naissance et ne te laisse continuer qu'à partir de cet âge ; le pays défini sur ton appareil est déterminant. Le coach n'est disponible qu'à partir de 16 ans, même dans les pays où l'âge minimum est inférieur. Le bilan corporel n'est disponible qu'à partir de 18 ans. Notre serveur vérifie les deux à partir de la date de naissance de ton profil.

Si nous apprenons qu'un compte appartient à une personne n'ayant pas atteint l'âge minimum, nous le supprimerons.

## 17. Sécurité

Nous protégeons tes données par des mesures techniques et organisationnelles, notamment :

- une transmission chiffrée entre l'application et les serveurs (HTTPS/TLS)
- des règles d'accès dans la base de données par lesquelles chaque compte ne peut lire et modifier que ses propres données
- des espaces de stockage non publics pour les photos de profil, les photos du bilan corporel et les captures d'écran, dans lesquels chaque compte ne peut accéder qu'à son propre dossier
- des liens à durée limitée pour l'affichage des photos : une heure pour les photos du bilan corporel et les captures d'écran, 24 heures pour les photos de profil
- la connexion via Google ou Apple, de sorte que nous n'enregistrons aucun mot de passe

Aucun système n'est totalement sûr. Comme l'application enregistre des données sur ton appareil, protège ton appareil par un verrouillage d'écran.

## 18. Modifications de cette Politique de confidentialité

Nous adaptons cette Politique de confidentialité lorsque l'application ou la situation juridique change. Tu trouves la version actuellement en vigueur dans l'application, dans les réglages, et sur [useloqqa.com](https://useloqqa.com). Nous t'informerons des modifications substantielles dans l'application et, si nécessaire, nous te demanderons ton consentement.
$md$, '2026-11-05');
