function generateOrderID(): string {
    const prefix = 'ORD';
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Adding month component
    const day = new Date().getDate().toString().padStart(2, '0'); // Adding day component
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderID = `${prefix}${currentYear}${month}${day}${randomDigits}`;
    return orderID;
  }
  
  export { generateOrderID };
  