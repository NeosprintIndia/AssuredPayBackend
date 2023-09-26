
import { v4 as uuidv4 } from 'uuid';

function generateUUID(): string {
  const generatedUUID = uuidv4().replace(/-/g, '').substring(0, 12);
  return generatedUUID;
}

export { generateUUID };