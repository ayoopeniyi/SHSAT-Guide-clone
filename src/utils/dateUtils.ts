export const formatDate = (dateString: string | Date): string => {
  let dateObj: Date;

  if (typeof dateString === "string") {
    // Handle 'YYYY-MM-DD HH:mm:ss[.SSSSSS]' (with or without microseconds)
    const match = dateString.match(
      /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/,
    );
    if (match) {
      // Remove microseconds, add T and Z for UTC
      dateObj = new Date(`${match[1]}T${match[2]}Z`);
    } else {
      // Try to parse as ISO or fallback
      dateObj = new Date(dateString);
    }
  } else {
    dateObj = new Date(dateString);
  }

  return dateObj.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
