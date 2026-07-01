import React, { useState, useEffect } from 'react';

// --- MATRIZ DE DATOS CLÍNICOS (REGLA 5x5x5 ESTRICTA) ---
// 5 Casos, 5 Fases por Caso, 5 Opciones por Fase.
const GAME_DATA = [
  {
    caseId: 0,
    title: "CASO 1: Palpitaciones a las 28 Semanas",
    context: "Gestante de 28 semanas acude a urgencias por disnea leve y palpitaciones en reposo. Antecedentes sin relevancia. Refiere sentirse 'agitada'.",
    phases: [
      {
        phaseId: 0,
        question: "Triage y Constantes: FC 105 lpm, FR 20 rpm, PA 100/60 mmHg, SatO2 98%. ¿Cuál es tu conducta inicial?",
        options: [
          { text: "Iniciar betabloqueadores (Metoprolol) de inmediato y monitorización continua.", isCorrect: false, effectHP: -20, feedback: "ERROR CRÍTICO. La taquicardia leve (hasta 110 lpm) y la taquipnea son adaptaciones normales. Iniciar antiarrítmicos causa hipoperfusión placentaria." },
          { text: "Solicitar EKG, Biometría Hemática y tranquilizar a la paciente.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El volumen plasmático aumenta significativamente, generando una taquicardia compensatoria fisiológica. Se deben descartar patologías base." },
          { text: "Programar Cardioversión eléctrica sincrónica por posible arritmia letal.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Indicar cardioversión para una taquicardia sinusal leve fisiológica es una negligencia absoluta." },
          { text: "Administrar Adenosina 6mg IV en bolo rápido.", isCorrect: false, effectHP: -40, feedback: "ERROR CRÍTICO. La adenosina se reserva para Taquicardias Supraventriculares paroxísticas, no para respuestas sinusales compensatorias." },
          { text: "Iniciar Amiodarona en infusión continua.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. La amiodarona genera toxicidad tiroidea severa en el feto. Totalmente injustificado." }
        ]
      },
      {
        phaseId: 1,
        question: "Interpretación Paraclínica: EKG muestra desviación del eje a la izquierda y cambios inespecíficos del ST. La BH reporta Hb de 10.8 g/dL.",
        options: [
          { text: "Asumir anemia dilucional fisiológica e hipertrofia excéntrica cardíaca transitoria.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La elevación del diafragma desvía el eje. El aumento desproporcionado de plasma vs eritrocitos causa anemia dilucional (límite 10.5 g/dL)." },
          { text: "Diagnosticar isquemia miocárdica y anemia severa. Transfundir 1 paquete globular.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Transfundir a una paciente con Hb > 10.5 g/dL en el 2do trimestre somete a riesgos inmunológicos innecesarios." },
          { text: "Iniciar protocolo de SICA (Aspirina, Clopidogrel, Heparina).", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Someter a la paciente a doble antiagregación y anticoagulación por un EKG fisiológico causará hemorragia masiva." },
          { text: "Diagnosticar pericarditis aguda y prescribir AINEs a altas dosis.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Los AINEs en el tercer trimestre (y a las 28 sem) pueden causar cierre prematuro del ductus arterioso fetal." },
          { text: "Sospechar Trombosis Venosa Profunda e iniciar heparina de bajo peso molecular.", isCorrect: false, effectHP: -20, feedback: "ERROR. No hay asimetría de extremidades ni clínica de TVP/TEP. Sobreintervención iatrogénica." }
        ]
      },
      {
        phaseId: 2,
        question: "Gases Arteriales (ABG): Llega reporte de gasometría: PaCO2 30 mmHg, HCO3 19 mEq/L, pH 7.44.",
        options: [
          { text: "Alcalosis respiratoria patológica. Requiere sedación e intubación profiláctica.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Estás por intubar a una gestante sana. Has confundido adaptación fisiológica con patología aguda." },
          { text: "Alcalosis respiratoria compensada fisiológica, mediada por progesterona.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La progesterona estimula el centro respiratorio, generando hiperventilación fisiológica (PaCO2 normal en embarazo: 28-32 mmHg)." },
          { text: "Acidosis metabólica oculta, administrar Bicarbonato de Sodio IV.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. El pH es normal/alcalótico. Dar bicarbonato exacerbará la alcalosis causando tetania y convulsiones." },
          { text: "Crisis asmática silenciosa, iniciar salbutamol y corticoides IV.", isCorrect: false, effectHP: -20, feedback: "ERROR. Ausencia clínica de broncoespasmo. La hiperventilación es de origen central, no periférico." },
          { text: "Tromboembolismo pulmonar masivo, iniciar trombolisis (Alteplasa).", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Indicar trombolisis por una gasometría normal de gestante provocará una hemorragia letal para madre y feto." }
        ]
      },
      {
        phaseId: 3,
        question: "Intervención Terapéutica: Con base en los hallazgos (taquicardia leve, anemia dilucional), ¿qué indicación procedes a dar?",
        options: [
          { text: "Restricción hídrica severa y diuréticos de asa (Furosemida) para la disnea.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Los diuréticos de asa disminuyen el volumen intravascular, colapsando la perfusión uteroplacentaria." },
          { text: "Prescribir sulfato ferroso profiláctico e indicar decúbito lateral izquierdo.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El hierro cubre el aumento de masa eritrocitaria. El decúbito lateral evita compresión aortocava, mejorando el gasto cardíaco." },
          { text: "Prescribir infusión de Hierro Sacarosa intravenoso en dosis única.", isCorrect: false, effectHP: -15, feedback: "ERROR. El hierro IV tiene riesgo de anafilaxia y se reserva para anemias severas, intolerancia oral o proximidad al parto, no profilaxis." },
          { text: "Indicar reposo absoluto en cama por el resto del embarazo.", isCorrect: false, effectHP: -20, feedback: "ERROR. El reposo absoluto incrementa severamente el riesgo de tromboembolismo venoso sin ofrecer ningún beneficio." },
          { text: "Iniciar digoxina oral para optimizar la contractilidad miocárdica.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Ausencia total de falla cardíaca. Riesgo severo de intoxicación digitálica." }
        ]
      },
      {
        phaseId: 4,
        question: "Feedback y Asesoría: La paciente pregunta preocupada por qué su corazón 'trabaja tanto y tan rápido'.",
        options: [
          { text: "Indicar que tiene un alto riesgo de falla cardíaca y debe cuidarse al máximo.", isCorrect: false, effectHP: -15, feedback: "INCORRECTO. Generaste ansiedad injustificada (efecto nocebo). El embarazo es un estado fisiológico, no una enfermedad." },
          { text: "Explicarle que probablemente tenga un soplo cardíaco congénito peligroso no diagnosticado.", isCorrect: false, effectHP: -20, feedback: "ERROR. Diagnóstico alarmista y falso que destruye la confianza paciente-médico." },
          { text: "Explicar que su gasto cardíaco y volumen sanguíneo aumentaron 30-50% para nutrir al bebé.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La educación médica asertiva y fundamentada disminuye la ansiedad y mejora el apego al control prenatal." },
          { text: "Decirle que el feto le está 'robando' la sangre y necesita comer el doble de porciones.", isCorrect: false, effectHP: -10, feedback: "ERROR. Información no médica que promueve la sobreganancia de peso y obesidad gestacional." },
          { text: "Ignorar su preocupación, recetarle un placebo y darle el alta rápidamente.", isCorrect: false, effectHP: -15, feedback: "ERROR. Falla ética en la comunicación médica. Puede derivar en abandono del cuidado prenatal." }
        ]
      }
    ]
  },
  {
    caseId: 1,
    title: "CASO 2: El Enigma Pélvico",
    context: "Primigesta de 36 semanas acude a control prenatal. Hay dudas sobre la estática fetal al observar y palpar el abdomen.",
    phases: [
      {
        phaseId: 0,
        question: "1ra y 2da Maniobra de Leopold: Palpas un polo redondeado, duro y peloteable en el fondo uterino. El dorso es liso a la derecha.",
        options: [
          { text: "Situación transversa, presentación cefálica, dorso superior.", isCorrect: false, effectHP: -20, feedback: "ERROR. Si estuviera en situación transversa, el fondo uterino estaría vacío." },
          { text: "Situación longitudinal, presentación podálica, posición derecha.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El polo cefálico (redondeado, duro, peloteable) en el fondo indica presentación podálica. El dorso a la derecha da la posición." },
          { text: "Situación longitudinal, presentación cefálica, dorso izquierdo.", isCorrect: false, effectHP: -15, feedback: "ERROR. Has confundido el polo pélvico (blando/irregular) con el polo cefálico (duro/peloteable)." },
          { text: "Situación oblicua, presentación inestable, dorso posterior.", isCorrect: false, effectHP: -15, feedback: "ERROR. La palpación clara de polos en los extremos longitudinales y un dorso lateral descarta la situación oblicua." },
          { text: "Diagnosticar embarazo gemelar, palpas dos polos cefálicos.", isCorrect: false, effectHP: -20, feedback: "ERROR. Alucinación palpatoria. Es un embarazo único." }
        ]
      },
      {
        phaseId: 1,
        question: "3ra y 4ta Maniobra de Leopold: Al palpar por encima de la sínfisis del pubis, encuentras una masa blanda, irregular, que se desplaza fácilmente.",
        options: [
          { text: "El polo pélvico está profundamente encajado, el parto es inminente.", isCorrect: false, effectHP: -20, feedback: "ERROR. Si se desplaza fácilmente (peloteo), significa que está ALTA Y MÓVIL, no encajada." },
          { text: "El polo cefálico está profundamente encajado en el 3er plano de Hodge.", isCorrect: false, effectHP: -20, feedback: "ERROR. La masa blanda e irregular es la pelvis (nalgas), no la cabeza fetal." },
          { text: "Confirmación de polo pélvico, presentación alta y móvil (fuera de la pelvis).", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La 3ra maniobra confirma la movilidad del polo inferior, asegurando que no ha penetrado la excavación pélvica." },
          { text: "Desprendimiento prematuro de placenta normoinserta, útero leñoso.", isCorrect: false, effectHP: -30, feedback: "ERROR. El útero está relajado permitiendo la palpación de las partes fetales." },
          { text: "Procúbito de cordón umbilical evidente a la palpación abdominal.", isCorrect: false, effectHP: -30, feedback: "ERROR. El cordón umbilical jamás se palpa mediante las maniobras de Leopold a través del abdomen." }
        ]
      },
      {
        phaseId: 2,
        question: "Planificación de Manejo: Decides considerar una Versión Cefálica Externa (VCE) por la presentación podálica.",
        options: [
          { text: "Proceder directamente a la VCE clínica en el consultorio sin más estudios.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Realizar VCE sin ecografía previa puede causar ruptura uterina si hay anomalías ocultas o placenta previa." },
          { text: "Solicitar Resonancia Magnética Pélvica de urgencia para pelvimetría.", isCorrect: false, effectHP: -15, feedback: "ERROR. Estudio excesivamente costoso, lento e innecesario para este fin." },
          { text: "Realizar Amniocentesis para confirmar madurez pulmonar fetal.", isCorrect: false, effectHP: -20, feedback: "ERROR. Invasivo y riesgoso. A las 36 semanas y para planear VCE, no es un paso rutinario ni justificado." },
          { text: "Solicitar ecografía para descartar placenta previa, oligohidramnios o anomalías uterinas.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La ecografía es un estándar de oro e indispensable antes de intentar una VCE para descartar contraindicaciones absolutas." },
          { text: "Indicar radiografía simple de abdomen (placa simple) para ver posición ósea.", isCorrect: false, effectHP: -10, feedback: "ERROR. Técnica obsoleta que expone al feto a radiación ionizante sin necesidad habiendo ultrasonido." }
        ]
      },
      {
        phaseId: 3,
        question: "Intervención - VCE: La eco es favorable. ¿Cómo procedes a realizar la Versión Cefálica Externa?",
        options: [
          { text: "Programar cesárea electiva de inmediato a las 36 semanas, sin intentar VCE.", isCorrect: false, effectHP: -20, feedback: "ERROR. Programar cesárea a las 36 sem causa prematuridad iatrogénica y obvia el beneficio potencial de la VCE." },
          { text: "Agendar VCE a las 37 semanas con tocolisis previa en entorno quirúrgico.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La tocolisis (ej. Terbutalina) relaja el útero aumentando la tasa de éxito. Debe haber disponibilidad de quirófano por riesgo de bradicardia fetal." },
          { text: "Realizar VCE bajo anestesia general e intubación endotraqueal.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Someter a la paciente a riesgos de anestesia general para un procedimiento ambulatorio es negligencia." },
          { text: "Indicar exclusivamente ejercicios de rotación (postura rodilla-pecho) en casa.", isCorrect: false, effectHP: -10, feedback: "ERROR. Aunque se sugieren, su evidencia clínica es muy baja. Omitir la VCE médica quita una oportunidad real de corrección." },
          { text: "Inyectar oxitocina intraumbilical guiada por eco para forzar el giro fetal.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Práctica ficticia, absurda y altamente letal para el feto." }
        ]
      },
      {
        phaseId: 4,
        question: "Resolución: La VCE médica es exitosa, el feto queda en presentación cefálica. ¿Cuál es el paso final?",
        options: [
          { text: "Inducción inmediata con altas dosis de oxitocina para 'fijar' la cabeza.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Inducir hiperdinamia uterina inmediata somete al feto a un estrés hipóxico masivo post-manipulación." },
          { text: "Fajar fuertemente el abdomen materno para inmovilizar completamente al feto.", isCorrect: false, effectHP: -15, feedback: "ERROR. Práctica empírica obsoleta. Restringe flujo y no evita eficazmente la reversión." },
          { text: "Monitoreo fetal continuo (NST) por 30-60 min y alta con signos de alarma obstétrica.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Tras la VCE, el protocolo dicta asegurar el bienestar fetal mediante NST. Si es reactivo, va a casa a esperar parto espontáneo." },
          { text: "Amniotomía artificial (rotura de membranas) inmediata en el consultorio.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Altísimo riesgo de prolapso de cordón si la presentación aún no está bien apoyada, además de riesgo infeccioso grave." },
          { text: "Programar cesárea para el día siguiente de todos modos 'por si acaso'.", isCorrect: false, effectHP: -20, feedback: "ERROR. Invalida totalmente el propósito y éxito de la VCE, sometiendo a cirugía innecesaria." }
        ]
      }
    ]
  },
  {
    caseId: 2,
    title: "CASO 3: Sangrado Gota a Gota",
    context: "Gestante de 12 semanas en primer control prenatal. NUNCA se ha realizado citología cervicovaginal. A la especuloscopia se observa ectropión moderado.",
    phases: [
      {
        phaseId: 0,
        question: "Indicación de Tamizaje: ¿Está indicada la citología (Papanicolaou) en este momento?",
        options: [
          { text: "Sí, el embarazo es una oportunidad ideal para el tamizaje si la paciente está rezagada.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El embarazo NO contraindica el screening. A menudo es el único contacto de la paciente con el sistema de salud." },
          { text: "No, la citología está absolutamente contraindicada durante todo el embarazo.", isCorrect: false, effectHP: -20, feedback: "ERROR. Omitir tamizaje en pacientes rezagadas eleva el riesgo de cáncer invasor no diagnosticado hasta el postparto." },
          { text: "Solo si presenta flujo vaginal francamente maloliente o sangrado activo.", isCorrect: false, effectHP: -15, feedback: "ERROR. El tamizaje se hace precisamente en pacientes asintomáticas para detectar lesiones premalignas tempranas." },
          { text: "Reemplazar la citología por ecografía transvaginal para buscar cáncer de cérvix.", isCorrect: false, effectHP: -20, feedback: "ERROR. La ecografía NO detecta alteraciones celulares (displasias microscópicas / NIC)." },
          { text: "Tomar la muestra, pero excluyendo el cérvix, raspando solo pared vaginal.", isCorrect: false, effectHP: -15, feedback: "ERROR. Una muestra sin células endocervicales/zona de transformación es catalogada como insatisfactoria." }
        ]
      },
      {
        phaseId: 1,
        question: "Técnica de Toma: Preparas el material para la muestra endocervical y exocervical.",
        options: [
          { text: "Usar hisopo de algodón seco, frotando solo el fondo de saco vaginal.", isCorrect: false, effectHP: -15, feedback: "ERROR. El algodón seco atrapa y destruye células. Omitir el cérvix anula el tamizaje." },
          { text: "Emplear únicamente un bajalenguas de madera para raspar firmemente el exocérvix.", isCorrect: false, effectHP: -15, feedback: "ERROR. Instrumento inadecuado que no garantiza celularidad suficiente ni alcanza el canal endocervical." },
          { text: "Usar espátula de Ayre (exocérvix) y Cytobrush endocervical rotando con suavidad.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Según las guías ASCCP, el uso cuidadoso del cepillo endocervical es seguro en embarazo y no aumenta riesgo de aborto." },
          { text: "Introducir Cytobrush hasta el fondo uterino rotando vigorosamente 10 veces.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Maniobra extremadamente traumática, riesgo de penetración a cavidad y ruptura de membranas." },
          { text: "Instilar Lugol (Test de Schiller) e irradiar cérvix sin tomar muestra celular.", isCorrect: false, effectHP: -30, feedback: "ERROR. El Test de Schiller es para guiar biopsias colposcópicas, no reemplaza la citología inicial de tamizaje." }
        ]
      },
      {
        phaseId: 2,
        question: "Manejo del Sangrado: Tras la toma, la paciente presenta un leve manchado (spotting) achocolatado.",
        options: [
          { text: "Diagnosticar Amenaza de Aborto, prescribir progesterona y reposo absoluto.", isCorrect: false, effectHP: -20, feedback: "ERROR. Sobrediagnóstico que genera ansiedad injustificada y cascada de medicalización innecesaria." },
          { text: "Aplicar taponamiento vaginal profundo con gasas y prescribir ácido tranexámico.", isCorrect: false, effectHP: -25, feedback: "ERROR CRÍTICO. Introducir cuerpos extraños aumenta riesgo de sepsis. Sangrado es mínimo y autolimitado." },
          { text: "Cauterizar el ectropión sangrante con nitrato de plata de inmediato.", isCorrect: false, effectHP: -30, feedback: "ERROR FATAL. Cauterizar a ciegas el cérvix de una gestante sin biopsia es negligencia médica." },
          { text: "Explicar que es por friabilidad cervical fisiológica mediada por congestión estrogénica.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El ectropión y la vascularización extrema del embarazo hacen que el cérvix sangre fácilmente al roce. Se resolverá solo." },
          { text: "Indicar que el sangrado es patognomónico de cáncer cervicouterino muy avanzado.", isCorrect: false, effectHP: -20, feedback: "ERROR. Aseveración temeraria y destructiva sin confirmación histopatológica." }
        ]
      },
      {
        phaseId: 3,
        question: "Reporte Citológico: Días después, el patólogo reporta ASC-US (Células escamosas atípicas de significado indeterminado).",
        options: [
          { text: "Programar conización cervical (LEEP) en quirófano de urgencia vital.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Operar un ASCUS en embarazo causará sangrado masivo incontrolable y pérdida fetal." },
          { text: "Iniciar quimioterapia tópica intra-vaginal con 5-Fluorouracilo.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Teratogénico sistémico, letal para el desarrollo embrionario/fetal." },
          { text: "Realizar legrado uterino instrumental para descartar cáncer endometrial.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Vaciar el útero provocará un aborto iatrogénico inmediato de un feto vivo." },
          { text: "Administrar vacuna VPH dosis única como tratamiento curativo inmediato.", isCorrect: false, effectHP: -10, feedback: "ERROR. La vacuna es preventiva, no curativa, y no está recomendada para iniciarse durante la gestación." },
          { text: "Diferir colposcopia. Advertir sobre cambios reactivos gravídicos (Arias-Stella).", isCorrect: true, effectHP: 0, feedback: "CORRECTO. En embarazo, ASCUS no se colposcopia de rutina. Las células se ven atípicas por hiperplasia estrogénica intensa (sobrediagnóstico)." }
        ]
      },
      {
        phaseId: 4,
        question: "Seguimiento Postparto: ¿Cuándo es el momento adecuado para reevaluar esta citología alterada?",
        options: [
          { text: "Mínimo a las 6 semanas postparto (fin del puerperio).", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Se requiere que termine el puerperio para que involucionen los cambios inflamatorios, atipias gravídicas y microtraumatismos del parto." },
          { text: "En el momento del alta hospitalaria, 48 horas tras el parto.", isCorrect: false, effectHP: -15, feedback: "ERROR. Muestra inútil por presencia de loquios, inflamación aguda y detritos necróticos masivos." },
          { text: "Al año exacto del postparto, para asegurar cese total de hormonas.", isCorrect: false, effectHP: -15, feedback: "ERROR. Un año es demasiado tiempo de espera ante un ASCUS; podría progresar a HSIL y perder la ventana." },
          { text: "En plena fase activa del trabajo de parto, aprovechando dilatación.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Muestra inválida diluida en líquido amniótico y sangre, además de molestar el progreso del parto." },
          { text: "Diferir la reevaluación indefinidamente si la madre decide lactar.", isCorrect: false, effectHP: -20, feedback: "ERROR. La lactancia materna prolongada NO es contraindicación para la toma de citología cervicovaginal." }
        ]
      }
    ]
  },
  {
    caseId: 3,
    title: "CASO 4: El Límite Renal",
    context: "Multípara de 32 semanas acude por edema bimaleolar leve y polaquiuria. Tira reactiva en orina: Proteínas (1+). PA: 135/85 mmHg.",
    phases: [
      {
        phaseId: 0,
        question: "Valoración Renal (TFG): Analizas el reporte de creatinina sérica: 0.6 mg/dL.",
        options: [
          { text: "Valores normales, refleja aumento fisiológico del 50% en la TFG gestacional.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El embarazo hiperfiltra (aumenta TFG). Cr normal de gestante: 0.4-0.7. Un valor de 0.9 mg/dL ya alerta fallo renal temprano." },
          { text: "Creatinina muy baja, indica desnutrición severa materna.", isCorrect: false, effectHP: -20, feedback: "ERROR. Desconocer la adaptación fisiológica de hiperfiltración lleva a malos diagnósticos sistémicos." },
          { text: "Sospechar Necrosis Tubular Aguda grave e iniciar Cistatina C urgente.", isCorrect: false, effectHP: -15, feedback: "ERROR. NTA elevaría la creatinina a >1.5, no la bajaría. El valor refleja salud renal, no falla." },
          { text: "Restricción proteica estricta (dieta vegana) urgente para proteger el riñón.", isCorrect: false, effectHP: -20, feedback: "ERROR. Someter a desnutrición proteica causará Retraso del Crecimiento Intrauterino (RCIU)." },
          { text: "Programar diálisis peritoneal de rescate profiláctica.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Realizar diálisis a un riñón 100% sano y en hiperfiltración fisiológica es iatrogenia severa." }
        ]
      },
      {
        phaseId: 1,
        question: "Cuantificación de Proteinuria: Ante la (1+) en tira reactiva, ¿cómo diferencias proteinuria gestacional fisiológica de la patológica?",
        options: [
          { text: "Programar biopsia renal percutánea guiada por TAC de urgencia.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Altísimo riesgo de sangrado retroperitoneal por una simple tira reactiva (que tiene falsos positivos)." },
          { text: "Iniciar pulsos de Metilprednisolona por glomerulonefritis rápidamente progresiva.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Inmunosupresión e hiperglicemia innecesaria en ausencia de síndrome nefrótico confirmado." },
          { text: "Repetir la tira reactiva cada hora en sala de espera hasta que sea negativa.", isCorrect: false, effectHP: -10, feedback: "ERROR. La tira reactiva es solo cualitativa. Retrasa diagnóstico real y agota recursos." },
          { text: "Solicitar Relación Proteína/Creatinina en orina al azar (Índice Pr/Cr).", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Las guías recomiendan cuantificar. En gestación es normal excretar hasta 300 mg/24h por el aumento de filtrado." },
          { text: "Asumir Pielonefritis aguda e iniciar dosis plenas de Aminoglucósidos (Gentamicina).", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Fármaco altamente nefrotóxico y ototóxico fetal, sin evidencia clínica ni de laboratorio de infección urinaria." }
        ]
      },
      {
        phaseId: 2,
        question: "Diagnóstico Diferencial: El Índice Pr/Cr resulta en 0.25 mg/mg (Normal). La paciente persiste ansiosa por sus 'pies hinchados'.",
        options: [
          { text: "Diagnosticar Preeclampsia Severa atípica e iniciar Sulfato de Magnesio.", isCorrect: false, effectHP: -30, feedback: "ERROR FATAL. Sin PA ≥140/90, sin proteinuria confirmada y sin daño órgano blanco, no es preeclampsia. Toxicidad por magnesio innecesaria." },
          { text: "Diagnosticar Insuficiencia Cardíaca Congestiva, solicitar BNP urgente.", isCorrect: false, effectHP: -20, feedback: "ERROR. Un edema bimaleolar aislado, sin disnea paroxística o ingurgitación yugular, no justifica fallo cardíaco." },
          { text: "Sospechar Trombosis de Vena Cava e iniciar anticoagulación (Warfarina).", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. La Warfarina es teratogénica y causa síndrome warfarínico fetal o hemorragias catastróficas." },
          { text: "Explicar que es edema fisiológico por compresión venosa del útero y baja presión oncótica.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El útero comprime ilíacas/cava inferior, y la hemodilución baja la albúmina sérica. El 80% de gestantes sanas lo presenta." },
          { text: "Enviar a cirugía vascular para evaluación de bypass linfovenoso de miembros pélvicos.", isCorrect: false, effectHP: -20, feedback: "ERROR. Solución quirúrgica permanente e irracional para un fenómeno hemodinámico gestacional transitorio." }
        ]
      },
      {
        phaseId: 3,
        question: "Manejo de Síntomas: ¿Qué indicas para aliviar de forma segura el edema bimaleolar?",
        options: [
          { text: "Prescribir Furosemida 40 mg IV STAT para forzar diuresis masiva.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Los diuréticos reducen el volumen plasmático, causando hipoperfusión placentaria e hipoxia fetal inmediata." },
          { text: "Realizar punciones evacuadoras (drenaje percutáneo) directamente en los tobillos.", isCorrect: false, effectHP: -40, feedback: "ERROR CRÍTICO. Práctica absurda que provocará celulitis necrotizante o artritis séptica yatrogénica." },
          { text: "Restricción absoluta de Sodio y Potasio (0 mEq/día) en la dieta.", isCorrect: false, effectHP: -20, feedback: "ERROR. Alterará gravemente la bomba Na+/K+ ATPasa materna y fetal, induciendo arritmias mortales." },
          { text: "Aplicar vendajes inelásticos tipo yeso desde pies a ingles por 48 horas.", isCorrect: false, effectHP: -15, feedback: "ERROR. Compresión extrema causa isquemia tisular arterial y flegmasia cerúlea dolens." },
          { text: "Uso de medias de compresión elástica y elevación postural de piernas al reposar.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Medida mecánica segura, no farmacológica, que facilita el retorno venoso superando la presión hidrostática." }
        ]
      },
      {
        phaseId: 4,
        question: "Signos de Alarma: Descartada la preeclampsia por ahora, ¿sobre qué signos VASCULOENDOTELIALES reales debes educarla?",
        options: [
          { text: "Que el edema en la cara al despertar es signo absoluto de cesárea de emergencia.", isCorrect: false, effectHP: -15, feedback: "ERROR. Aunque el edema facial se asocia, por sí solo (sin hipertensión/proteinuria) no es criterio de finalización inmediata." },
          { text: "Que sentir al bebé moverse más de lo normal significa que está convulsionando in-utero.", isCorrect: false, effectHP: -20, feedback: "ERROR. Mentira que genera pánico. Los múltiples movimientos son signos de salud y vitalidad neurológica fetal." },
          { text: "Que las estrías violáceas en el abdomen anuncian ruptura del músculo uterino.", isCorrect: false, effectHP: -15, feedback: "ERROR. Las estrías son rupturas de colágeno dérmico por sobredistensión mecánica, totalmente superficiales y estéticas." },
          { text: "Educar sobre signos de vasoespasmo: fosfenos, acúfenos, epigastralgia en 'barra' y cefalea intensa.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Estos son los predictores clínicos reales de daño endotelial inminente y eclampsia según ACOG/OPS." },
          { text: "Informar que superar los 80 kg de peso total es el criterio definitivo para eclampsia grave.", isCorrect: false, effectHP: -15, feedback: "ERROR. La ganancia de peso excesiva es factor de riesgo metabólico, no un criterio diagnóstico de trastorno hipertensivo agudo." }
        ]
      }
    ]
  },
  {
    caseId: 4,
    title: "CASO 5: La Sombra Epitelial",
    context: "Gestante de 16 semanas. Se tomó citología de rutina en la sem 12. Llega reporte confirmando HSIL (Lesión Intraepitelial de Alto Grado / NIC II-III).",
    phases: [
      {
        phaseId: 0,
        question: "Triage y Derivación: ¿Cuál es tu conducta clínica inicial ante un HSIL diagnosticado en el 2do trimestre?",
        options: [
          { text: "Diferir toda evaluación pélvica hasta 6 meses después de finalizada la lactancia.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. El HSIL (NIC III) tiene hasta un 7% de riesgo de ocultar cáncer invasor subyacente. Ignorarlo es negligencia oncológica." },
          { text: "Programar Interrupción Voluntaria del Embarazo (IVE) por riesgo de metástasis inmediata.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Malpraxis absoluta. Las displasias cervicales (HSIL) no justifican abortar feto sano ni ameritan tratamientos radicales." },
          { text: "Iniciar terapia antibiótica de amplio espectro endovenosa (Meropenem) para erradicar atipias.", isCorrect: false, effectHP: -15, feedback: "ERROR. Las lesiones HSIL son impulsadas por oncoproteínas virales (VPH), los antibióticos bactericidas son inútiles." },
          { text: "Derivación preferente a Unidad de Colposcopia Especializada.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Guías internacionales exigen colposcopia para todo HSIL gestacional con un único fin: descartar invasión macroscópica." },
          { text: "Realizar histerectomía abdominal de urgencia con feto in situ.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Homicidio fetal y mutilación uterina para un diagnóstico que habitualmente es solo premaligno." }
        ]
      },
      {
        phaseId: 1,
        question: "Procedimiento Colposcópico: Estás en colposcopia. ¿Qué técnica aplicas y cuál omites estrictamente?",
        options: [
          { text: "Realizar Legrado Endocervical (ECC) de rutina para no dejar zonas sin evaluar.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. El legrado endocervical (ECC) está PROHIBIDO en embarazo. Rompe barrera mucosa, induce RPM, parto inmaduro y sepsis." },
          { text: "Aplicar Solución de Monsel generosamente en canal endocervical como profilaxis.", isCorrect: false, effectHP: -25, feedback: "ERROR. El Monsel necrotiza tejidos y altera citologías futuras; introducirlo al canal de gestante es peligroso e injustificado." },
          { text: "Aplicar Ácido Acético al 5% en exocérvix. Omitir rotundamente el Legrado Endocervical.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El ácido acético es seguro (coagula proteínas reversiblemente) y detecta acetoblancura. Preservar el moco cervical íntegro es prioridad." },
          { text: "Pintar el cérvix con resina de Podofilina pura al 25% para quemar la lesión in-situ.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Podofilina altamante teratogénica (neuro/cardiotóxica fetal) y absorbida por la hipervascularidad gestacional." },
          { text: "Exploración digital profunda intencionada dentro del OCI para buscar tumoraciones ocultas.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Dilatar el cérvix digitalmente o traumatizar el orificio cervical interno causará incompetencia cervical y aborto." }
        ]
      },
      {
        phaseId: 2,
        question: "Decisión de Biopsia: Bajo el colposcopio observas un área acetoblanca muy densa, mosaico grueso y bordes elevados.",
        options: [
          { text: "Tomar biopsias en sacabocados (pinza Tischler) en todos los cuadrantes del reloj (12, 3, 6, 9).", isCorrect: false, effectHP: -20, feedback: "ERROR. Biopsias múltiples empíricas en embarazo sangrarán profusamente. Se minimiza el traumatismo." },
          { text: "Biopsia transvaginal en aguja gruesa profunda cruzando cérvix hasta útero.", isCorrect: false, effectHP: -30, feedback: "ERROR FATAL. No es un tumor pélvico sólido para core-biopsy. Generarás una perforación uterina obstétrica masiva." },
          { text: "Biopsiar dirigidamente SOLO el área de mayor sospecha (vasos atípicos).", isCorrect: true, effectHP: 0, feedback: "CORRECTO. La regla de oro: En gestación SOLO biopsiar la zona más atípica si los patrones sugieren invasión incipiente." },
          { text: "Extirpar una cuña cuneiforme de 3x3 cm con bisturí frío en el consultorio de colposcopia.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. Un cono frío amputará el soporte del embarazo y el sangrado arterial en cérvix grávido es casi incontrolable." },
          { text: "Está prohibido biopsiar embarazadas por ley. Diferir aunque parezca cáncer invasor.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Si los hallazgos son mayores (vasos atípicos, exofíticos), DEBES biopsiar para no dejar avanzar un cáncer real." }
        ]
      },
      {
        phaseId: 3,
        question: "Manejo Terapéutico: La biopsia confirma NIC III focal. NO hay evidencia de infiltración estromal (no invasor).",
        options: [
          { text: "Conización con asa diatérmica (LEEP) mañana por la mañana para limpiar bordes.", isCorrect: false, effectHP: -40, feedback: "ERROR FATAL. LEEP en embarazo por NIC III causará aborto tardío. Solo se corta cérvix gravídico ante cáncer invasor confirmado." },
          { text: "Quimioterapia con Cisplatino sistémico a dosis máxima tolerada.", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Un NIC III (lesión intraepitelial premaligna) jamás se maneja con quimioterapia tóxica sistémica." },
          { text: "Observación estrecha sin excisión. La progresión a cáncer franco en embarazo es muy baja.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. El tratamiento definitivo se difiere al postparto. El NIC III avanza lentamente y no cruzará la membrana basal en estos meses." },
          { text: "Braquiterapia pélvica radicular guiada (Radiación interna).", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Radiación a feto en desarrollo provoca microcefalia, muerte intrauterina y quemaduras graves." },
          { text: "Inyecciones submucosas cervicales de Interferón Alfa.", isCorrect: false, effectHP: -20, feedback: "ERROR. Tratamiento of-label para VPH, sin soporte de guías clínicas para gestantes, con potentes efectos inflamatorios sistémicos." }
        ]
      },
      {
        phaseId: 4,
        question: "Resolución Obstétrica: La paciente alcanza la semana 39 de gestación sin problemas. Pregunta sobre su vía de parto.",
        options: [
          { text: "Programar cesárea iterativa clásica (corporal) para evitar arrastre de células premalignas al bebé.", isCorrect: false, effectHP: -20, feedback: "ERROR. Mito desactualizado. La displasia cervical no es contraindicación de parto vaginal ni se 'siembra' en el feto al nacer." },
          { text: "Inducir parto pretérmino con misoprostol semanas antes para poder iniciar tratamiento oncológico rápido.", isCorrect: false, effectHP: -30, feedback: "ERROR CRÍTICO. Iatrogenia prematura no justificada. El NIC III puede esperar a un feto 100% maduro a término." },
          { text: "Histerectomía subtotal ampliada al momento de extraer al neonato (Operación cesárea-histerectomía).", isCorrect: false, effectHP: -50, feedback: "ERROR FATAL. Mutilación radical quirúrgica injustificable para tratar una lesión premaligna (NIC III) 100% curable por LEEP postparto." },
          { text: "Parto domiciliario no institucional para evitar 'fricción iatrogénica' del cérvix con instrumental médico.", isCorrect: false, effectHP: -40, feedback: "ERROR CRÍTICO. El cérvix con NIC III es friable; si sangra severamente durante dilatación, requiere acceso rápido a centro obstétrico quirúrgico." },
          { text: "Vía de parto por indicación obstétrica (vaginal permitida). Reevaluar patología a las 6-12 semanas postparto.", isCorrect: true, effectHP: 0, feedback: "CORRECTO. Permites parto vaginal libremente. El desprendimiento del estroma y mucosa postparto puede, de hecho, hacer regresar muchas displasias." }
        ]
      }
    ]
  }
];

// --- APP PRINCIPAL ---
export default function App() {
  const [gameState, setGameState] = useState('TITLE_SCREEN'); // TITLE_SCREEN, CASE_INTRO, PLAYING, PHASE_FEEDBACK, GAME_OVER, VICTORY
  const [currentCaseId, setCurrentCaseId] = useState(0);
  const [currentPhaseId, setCurrentPhaseId] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [healthPoints, setHealthPoints] = useState(100);
  
  const [feedbackData, setFeedbackData] = useState({ isCorrect: true, text: "", hpDelta: 0 });

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
      
      .font-pixel {
        font-family: 'VT323', monospace;
      }
      
      .crt-overlay {
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size: 100% 4px, 3px 100%;
        pointer-events: none;
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 50;
      }

      .crt-flicker {
        animation: flicker 0.15s infinite;
      }

      @keyframes flicker {
        0% { opacity: 0.95; }
        100% { opacity: 1; }
      }

      ::-webkit-scrollbar { width: 10px; }
      ::-webkit-scrollbar-track { background: #008F11; }
      ::-webkit-scrollbar-thumb { background: #00FF41; border: 2px solid #0D1117; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const startGame = () => {
    setGameState('CASE_INTRO');
    setCurrentCaseId(0);
    setCurrentPhaseId(0);
    setPlayerScore(0);
    setHealthPoints(100);
  };

  const handleOptionSelect = (option) => {
    const newHP = Math.max(0, healthPoints + option.effectHP);
    setHealthPoints(newHP);
    if (option.isCorrect) setPlayerScore(prev => prev + 10);
    
    setFeedbackData({
      isCorrect: option.isCorrect,
      text: option.feedback,
      hpDelta: option.effectHP
    });
    
    setGameState('PHASE_FEEDBACK');
  };

  const advanceGame = () => {
    if (healthPoints <= 0) {
      setGameState('GAME_OVER');
      return;
    }

    const currentCase = GAME_DATA[currentCaseId];
    if (currentPhaseId < currentCase.phases.length - 1) {
      setCurrentPhaseId(prev => prev + 1);
      setGameState('PLAYING');
    } else {
      if (currentCaseId < GAME_DATA.length - 1) {
        setCurrentCaseId(prev => prev + 1);
        setCurrentPhaseId(0);
        setGameState('CASE_INTRO');
      } else {
        setGameState('VICTORY');
      }
    }
  };

  const renderHeader = () => (
    <div className="border-b-4 border-[#00FF41] pb-4 mb-4 flex flex-col md:flex-row justify-between items-center text-xl md:text-2xl gap-4 shrink-0">
      <div className="text-[#29ADFF]">SCORE: {playerScore.toString().padStart(4, '0')}</div>
      <div className="flex items-center gap-2">
        <span className="text-[#FFF1E8]">VITALS [</span>
        <div className="w-32 md:w-48 h-6 bg-[#008F11] border-2 border-[#00FF41] flex items-center p-1">
          <div 
            className={`h-full transition-all duration-500 ${healthPoints > 50 ? 'bg-[#00FF41]' : healthPoints > 20 ? 'bg-[#FFCC00]' : 'bg-[#FF003C]'}`}
            style={{ width: `${healthPoints}%` }}
          ></div>
        </div>
        <span className="text-[#FFF1E8]">] {healthPoints}%</span>
      </div>
    </div>
  );

  // 1. Pantalla de Título
  if (gameState === 'TITLE_SCREEN') {
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#00FF41] font-pixel flex flex-col items-center justify-center p-4 relative overflow-hidden crt-flicker">
        <div className="crt-overlay"></div>
        <div className="border-4 border-[#00FF41] p-6 md:p-10 flex flex-col items-center shadow-[0_0_20px_#00FF41] max-w-2xl text-center bg-[#001100] z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#00FF41] to-[#008F11]" style={{ textShadow: "0 0 10px #00FF41" }}>
            NINTENDOCTOR 64
          </h1>
          <p className="text-[#FFF1E8] text-xl md:text-2xl mb-8">
            SIMULADOR CLÍNICO OBSTÉTRICO AVANZADO
          </p>
          
          <div className="text-[#29ADFF] mb-10 text-lg md:text-xl space-y-2">
            <p>» 5 Casos Clínicos Complejos</p>
            <p>» 5 Fases Evolutivas por Caso</p>
            <p>» 5 Opciones Diagnósticas</p>
            <p>» Basado en Guías AEPCC, ASCCP y OPS</p>
          </div>

          <button 
            onClick={startGame}
            className="animate-pulse bg-[#008F11] text-[#FFF1E8] border-2 border-[#00FF41] px-8 py-4 text-2xl hover:bg-[#00FF41] hover:text-[#0D1117] transition-colors"
          >
            PULSA START PARA INICIAR TURNO
          </button>
        </div>
      </div>
    );
  }

  // 2. Game Over / Victory
  if (gameState === 'GAME_OVER' || gameState === 'VICTORY') {
    const isVictory = gameState === 'VICTORY';
    return (
      <div className="min-h-screen bg-[#0D1117] font-pixel flex flex-col items-center justify-center p-4 relative">
        <div className="crt-overlay"></div>
        <div className={`border-4 ${isVictory ? 'border-[#00FF41]' : 'border-[#FF003C]'} p-6 md:p-10 max-w-2xl text-center z-10 bg-[#001100]`}>
          <h1 className={`text-5xl md:text-6xl mb-6 ${isVictory ? 'text-[#00FF41]' : 'text-[#FF003C]'}`}>
            {isVictory ? "¡TURNO COMPLETADO!" : "NEGLIGENCIA CRÍTICA"}
          </h1>
          <p className="text-[#FFF1E8] text-xl md:text-2xl mb-4">
            {isVictory 
              ? "Excelente manejo clínico. Has demostrado conocimientos de especialista resolviendo un total de 25 desafíos de vida o muerte." 
              : "Los signos vitales de la paciente colapsaron debido a intervenciones iatrogénicas o malos diagnósticos."}
          </p>
          
          <div className="my-8 text-[#29ADFF] text-3xl">
            PUNTUACIÓN FINAL: {playerScore}
          </div>

          <button 
            onClick={startGame}
            className={`border-2 px-8 py-4 text-xl md:text-2xl transition-colors ${
              isVictory 
              ? 'border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-[#0D1117]' 
              : 'border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-[#0D1117]'
            }`}
          >
            {isVictory ? "JUGAR DE NUEVO" : "REINICIAR GUARDIA"}
          </button>
        </div>
      </div>
    );
  }

  // 3. Intro del Caso
  if (gameState === 'CASE_INTRO') {
    const currentCase = GAME_DATA[currentCaseId];
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#00FF41] font-pixel p-4 md:p-10 relative flex flex-col h-screen">
        <div className="crt-overlay"></div>
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col justify-center z-10 relative">
          {renderHeader()}
          
          <div className="border-2 border-[#29ADFF] p-6 bg-[#001100] mb-8">
            <h2 className="text-3xl text-[#29ADFF] mb-6 tracking-wide">HISTORIA CLÍNICA - {currentCase.title}</h2>
            <p className="text-[#FFF1E8] text-2xl md:text-3xl leading-relaxed">
              {currentCase.context}
            </p>
          </div>

          <button 
            onClick={() => setGameState('PLAYING')}
            className="self-center bg-[#008F11] border-2 border-[#00FF41] text-[#FFF1E8] px-8 py-4 text-2xl hover:bg-[#00FF41] hover:text-[#0D1117] transition-colors"
          >
            EVALUAR PACIENTE
          </button>
        </div>
      </div>
    );
  }

  // 4. Playing (Selección múltiple de 5)
  if (gameState === 'PLAYING') {
    const currentPhase = GAME_DATA[currentCaseId].phases[currentPhaseId];
    const letters = ['A', 'B', 'C', 'D', 'E'];
    
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#00FF41] font-pixel p-4 relative flex flex-col max-h-screen overflow-hidden">
        <div className="crt-overlay"></div>
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col z-10 relative overflow-hidden">
          {renderHeader()}
          
          <div className="mb-4 shrink-0">
            <span className="bg-[#00FF41] text-[#0D1117] px-2 py-1 text-xl">FASE {currentPhaseId + 1}/5</span>
          </div>
          
          <div className="border-l-4 border-[#00FF41] pl-4 mb-4 shrink-0 bg-[#001100]/50 p-2">
            <p className="text-[#FFF1E8] text-xl md:text-2xl leading-relaxed">
              {currentPhase.question}
            </p>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-8 flex-grow">
            {currentPhase.options.map((option, idx) => (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(option)}
                className="text-left border-2 border-[#008F11] bg-[#001100] p-4 hover:border-[#29ADFF] hover:bg-[#0D1117] transition-colors group relative shrink-0"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[#29ADFF] text-xl md:text-2xl group-hover:text-[#00FF41] font-bold">
                    [{letters[idx]}]
                  </span>
                  <span className="text-[#FFF1E8] text-lg md:text-xl leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Feedback Médico
  if (gameState === 'PHASE_FEEDBACK') {
    return (
      <div className="min-h-screen bg-[#0D1117] font-pixel p-4 md:p-10 relative flex flex-col h-screen">
        <div className="crt-overlay"></div>
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col z-10 relative">
          {renderHeader()}
          
          <div className={`border-4 ${feedbackData.isCorrect ? 'border-[#00FF41] bg-[#001100]' : 'border-[#FF003C] bg-[#220000]'} p-6 md:p-10 my-auto flex flex-col overflow-y-auto`}>
            <h2 className={`text-4xl md:text-5xl mb-6 ${feedbackData.isCorrect ? 'text-[#00FF41]' : 'text-[#FF003C] animate-pulse'}`}>
              {feedbackData.isCorrect ? "» DECISIÓN ACERTADA" : "» ALERTA MÉDICA FATAL"}
            </h2>
            
            <p className="text-[#FFF1E8] text-xl md:text-3xl leading-relaxed mb-8">
              {feedbackData.text}
            </p>

            {!feedbackData.isCorrect && (
              <div className="text-[#FF003C] text-2xl md:text-3xl mb-8 flex items-center gap-4 bg-[#0D1117] p-4 border border-[#FF003C] w-max">
                <span>IMPACTO VITAL:</span> 
                <span className="font-bold">{feedbackData.hpDelta} HP</span>
              </div>
            )}

            <button 
              onClick={advanceGame}
              className={`w-full border-2 p-4 md:p-6 text-2xl md:text-3xl transition-colors mt-auto shrink-0 ${
                feedbackData.isCorrect 
                ? 'border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-[#0D1117]' 
                : 'border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-[#0D1117]'
              }`}
            >
              {healthPoints <= 0 ? "CERTIFICAR DEFUNCIÓN" : "CONTINUAR TURNO"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}