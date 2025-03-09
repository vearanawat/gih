declare module "gemini-mail-responder" {
    const handleEmail: (
      apiKey: string,
      fromEmail: string,
      authToken: string,
      message: string,
      recipientEmail: string
    ) => void;
  
    export default { handleEmail };
  }
  