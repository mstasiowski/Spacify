export function getDefaultReservationTimes(): {
  date: Date;
  start: Date;
  end: Date;
} {
  const now = new Date();
  let date = new Date(now);
  let startHour = now.getHours() + 1;

  // Jeśli już po 17:00, ustaw na jutro 8:00-9:00
  if (now.getHours() >= 17) {
    date.setDate(date.getDate() + 1);
    startHour = 8;
  }
  // Jeśli przed 8:00, ustaw na dziś 8:00-9:00
  if (now.getHours() < 8) {
    startHour = 8;
  }
  // Jeśli startHour > 17, ustaw na jutro 8:00-9:00
  if (startHour > 17) {
    date.setDate(date.getDate() + 1);
    startHour = 8;
  }

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
    startHour = 8; // Resetuj godzinę na 8:00 jeśli trafimy na weekend
  }

  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    startHour,
    0,
    0,
    0
  );
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    startHour + 1,
    0,
    0,
    0
  );

  // Format daty do yyyy-MM-dd jeśli używasz input type="date"
  // const dateString = date.toISOString().split('T')[0];

  return { date, start, end };
}
