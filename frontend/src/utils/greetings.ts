export const customGreeting = (name?: string) => {
  const date = new Date();
  const timeOfDay = date.getHours();

  if (timeOfDay >= 5 && timeOfDay < 12) {
    return name ? `Good Morning, ${name}! ☀️` : 'Good Morning! ☀️';
  } else if (timeOfDay >= 12 && timeOfDay < 18) {
    return name ? `Good Afternoon, ${name}! 👋` : 'Good Afternoon! 👋';
  } else {
    return name ? `Good Evening, ${name}! 🌙` : 'Good Evening! 🌙';
  }
};
