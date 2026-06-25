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

  console.log("Seed concluído. Login: terapeuta@exemplo.com / 123456");
}

main().finally(() => prisma.$disconnect());
