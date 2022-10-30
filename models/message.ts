export interface Message {
  id: string;
  userId: string;
  username: string;
  content: Array<string> | string;
  color: string;
  formattedDate?: string;
  firstCharacter?: string;
  createdAt: string;
}
