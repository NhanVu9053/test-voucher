export async function isDateRangeValid(startDate: Date, endDate: Date) {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    if (endDateTime > startDateTime) {
      return true;
    }
    return false;
}