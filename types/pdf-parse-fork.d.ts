declare module 'pdf-parse-fork' {
  function pdf(buffer: Buffer): Promise<{ text: string }>;
  export default pdf;
}
