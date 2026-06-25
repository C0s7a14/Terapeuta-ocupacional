export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));

export const dateInput = (value?: string) => value ? value.slice(0, 10) : "";

export const careLabels = {
  CLINICAL: "Clínico",
  HOME: "Domiciliar",
  SCHOOL: "Escolar",
  ONLINE: "Online",
} as const;

export const appointmentLabels = {
  SCHEDULED: "Agendado",
  COMPLETED: "Realizado",
  CANCELED: "Cancelado",
  NO_SHOW: "Falta",
} as const;

