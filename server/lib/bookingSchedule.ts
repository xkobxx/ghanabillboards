export interface BookingScheduleInput {
  startDate: string;
  endDate: string;
  startAt?: string;
  endAt?: string;
}

export interface BookingInterval {
  startAt: Date;
  endAt: Date;
}

/**
 * Converts both legacy date-only bookings and time-slot bookings to the same
 * half-open UTC interval: [startAt, endAt).
 */
export function toBookingInterval(input: BookingScheduleInput): BookingInterval {
  const startAt = input.startAt
    ? new Date(input.startAt)
    : new Date(`${input.startDate}T00:00:00.000Z`);
  const endAt = input.endAt
    ? new Date(input.endAt)
    : new Date(`${input.endDate}T00:00:00.000Z`);

  return { startAt, endAt };
}

export function isValidInterval({ startAt, endAt }: BookingInterval): boolean {
  return (
    Number.isFinite(startAt.getTime())
    && Number.isFinite(endAt.getTime())
    && startAt.getTime() < endAt.getTime()
  );
}

export function intervalsOverlap(
  first: BookingInterval,
  second: BookingInterval,
): boolean {
  return first.startAt < second.endAt && first.endAt > second.startAt;
}
