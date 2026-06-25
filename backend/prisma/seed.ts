import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "terapeuta@exemplo.com";
  const therapist = await prisma.therapist.upsert({
    where: { email },
    update: {},
    create: {
      name: "Dra. Marina Oliveira",
      email,
      passwordHash: await bcrypt.hash("123456", 12),
      phone: "(11) 99999-1111",
      professionalId: "CREFITO 00000-TO",
    },
  });

  await prisma.patient.deleteMany({ where: { therapistId: therapist.id } });

  const ana = await prisma.patient.create({
    data: {
      therapistId: therapist.id,
      name: "Ana Clara Santos",
      birthDate: new Date("2017-04-12T12:00:00Z"),
      guardian: "Juliana Santos",
      phone: "(11) 98888-1234",
      email: "juliana@example.com",
      address: "Rua das Flores, 120 - São Paulo/SP",
      mainCondition: "Transtorno do desenvolvimento da coordenação",
      initialComplaint: "Dificuldades em atividades escolares e de autocuidado.",
      clinicalHistory: "Gestação sem intercorrências. Acompanhamento multiprofissional desde 2024.",
      generalNotes: "Boa adesão familiar ao tratamento.",
      medicalRecord: {
        create: {
          initialAssessment: "Apresenta dificuldade em coordenação motora fina e planejamento motor.",
          therapeuticGoals: "Ampliar autonomia no vestir e melhorar preensão funcional.",
          therapeuticPlan: "Atividades graduadas de motricidade fina, integração bilateral e treino de AVDs.",
          suggestedFrequency: "1 sessão semanal",
          clinicalNotes: "Utilizar interesses da paciente como facilitadores.",
        },
      },
    },
  });

  const lucas = await prisma.patient.create({
    data: {
      therapistId: therapist.id,
      name: "Lucas Ferreira",
      birthDate: new Date("2014-09-03T12:00:00Z"),
      guardian: "Camila Ferreira",
      phone: "(11) 97777-4321",
      mainCondition: "TEA - suporte nível 1",
      initialComplaint: "Dificuldades de organização da rotina e participação social.",
      medicalRecord: { create: { suggestedFrequency: "2 sessões semanais" } },
    },
  });

  await prisma.sessionEvolution.create({
    data: {
      therapistId: therapist.id,
      patientId: ana.id,
      sessionDate: new Date(),
      time: "09:00",
      careType: "CLINICAL",
      sessionGoal: "Estimular coordenação bilateral e destreza manual.",
      activitiesPerformed: "Recorte, encaixes graduados e treino de abotoar.",
      patientPerformance: "Participou com boa iniciativa e necessitou de pistas verbais.",
      observedDifficulties: "Manutenção da pinça trípode em tarefas prolongadas.",
      perceivedProgress: "Maior tolerância às tarefas e melhor precisão no recorte.",
      nextSteps: "Progredir complexidade dos fechos e introduzir cadarço.",
    },
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  await prisma.appointment.createMany({
    data: [
      {
        therapistId: therapist.id,
        patientId: ana.id,
        date: today,
        startTime: "09:00",
        endTime: "09:50",
        careType: "CLINICAL",
        status: "SCHEDULED",
      },
      {
        therapistId: therapist.id,
        patientId: lucas.id,
        date: tomorrow,
        startTime: "14:00",
        endTime: "14:50",
        careType: "ONLINE",
        status: "SCHEDULED",
      },
    ],
  });

  await prisma.patientDocument.create({
    data: {
      therapistId: therapist.id,
      patientId: ana.id,
      name: "Encaminhamento médico",
      type: "Encaminhamento",
      description: "Documento recebido na avaliação inicial.",
      url: "/documentos/encaminhamento-ana.pdf",
    },
  });

  const diaryExamples = [
    { mood: "HAPPY", emotionalScale: 8, stressLevel: 3, sleepQuality: 8, description: "Dia tranquilo, com boa disposição para as atividades.", activities: "Brincadeiras no parque e atividade de recorte.", patientOrCaregiverNotes: "Dormiu bem e acordou animada.", tags: ["bem-estar", "participação"] },
    { mood: "NEUTRAL", emotionalScale: 6, stressLevel: 5, sleepQuality: 7, description: "Manteve rotina habitual, com alguma resistência nas transições.", activities: "Atividades escolares e organização do material.", patientOrCaregiverNotes: "Precisou de mais lembretes durante a manhã.", tags: ["rotina"] },
    { mood: "ANXIOUS", emotionalScale: 4, stressLevel: 8, sleepQuality: 5, description: "Apresentou ansiedade antes de uma atividade nova.", activities: "Tarefa escolar nova e treino de autocuidado.", patientOrCaregiverNotes: "Perguntou várias vezes como seria o dia.", tags: ["ansiedade", "transição"] },
    { mood: "TIRED", emotionalScale: 5, stressLevel: 7, sleepQuality: 4, description: "Demonstrou cansaço e menor tolerância a tarefas prolongadas.", activities: "Rotina escolar e atividade de coordenação motora.", patientOrCaregiverNotes: "Foi dormir mais tarde na noite anterior.", tags: ["sono", "cansaço"] },
    { mood: "SAD", emotionalScale: 3, stressLevel: 9, sleepQuality: 5, description: "Ficou frustrada após uma dificuldade em atividade escolar.", activities: "Escrita, recorte e organização da mochila.", patientOrCaregiverNotes: "Disse que não conseguiria terminar a tarefa.", tags: ["frustração", "escola"] },
    { mood: "NEUTRAL", emotionalScale: 6, stressLevel: 4, sleepQuality: 7, description: "Recuperou o ritmo e participou das atividades familiares.", activities: "Passeio em família e organização do quarto.", patientOrCaregiverNotes: "Aceitou ajuda e terminou a organização.", tags: ["autonomia", "família"] },
    { mood: "HAPPY", emotionalScale: 8, stressLevel: 2, sleepQuality: 9, description: "Mostrou-se alegre, comunicativa e envolvida nas brincadeiras.", activities: "Culinária em família e brincadeira livre.", patientOrCaregiverNotes: "Comentou que gostou muito de ajudar na cozinha.", tags: ["família", "bem-estar"] },
  ] as const;

  await Promise.all(diaryExamples.map((entry, index) => {
    const createdAt = new Date();
    createdAt.setUTCDate(createdAt.getUTCDate() - (6 - index));
    createdAt.setUTCHours(15, 0, 0, 0);
    return prisma.patientDiaryEntry.create({
      data: {
        therapistId: therapist.id,
        patientId: ana.id,
        ...entry,
        tags: [...entry.tags],
        createdAt,
      },
    });
  }));

  console.log("Seed concluído. Login: terapeuta@exemplo.com / 123456");
}

main().finally(() => prisma.$disconnect());
