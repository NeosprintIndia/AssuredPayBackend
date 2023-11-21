
function generateCustomUUID(): string {
  const prefix = 'AP';
  const currentYear = new Date().getFullYear().toString().slice(-2); 
  const randomDigits = Math.floor(10000 + Math.random() * 90000); 
  const customUUID = `${currentYear}${prefix}${randomDigits}`;
  return customUUID;
}
export { generateCustomUUID };