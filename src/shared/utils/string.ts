const randomString = (len: number) => {
  let text = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';

  // Generate the first character from the letters
  text += letters.charAt(Math.floor(Math.random() * letters.length));
  const possible = letters + digits;

  // Generate the remaining characters from the full set
  for (let i = 1; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export { randomString };

// Generate a UUID v4
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate a public ID for entities
export function generatePublicId(prefix: string = 'entity'): string {
  return `${prefix}_${randomString(8)}`;
}
