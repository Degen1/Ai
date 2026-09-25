import type { SymbolViewProps } from 'expo-symbols';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: { id: string; uri: string }[];
};

export type SavedConversation = {
  id: string;
  title: string;
  preview: string;
  mode: 'chat' | 'work';
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export const suggestions: {
  title: string;
  subtitle: string;
  prompt: string;
  icon: SymbolViewProps['name'];
}[] = [
  {
    title: 'መደብ ኣዳሉ',
    subtitle: 'ዝተሓላለኸ ሓሳብ ናብ ንጹር መደብ ቀይር',
    prompt: 'ንጹርን ተግባራውን መደብ ንኽሰርሕ ሓግዘኒ።',
    icon: { ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' },
  },
  {
    title: 'ጽሓፍ ወይ ኣርም',
    subtitle: 'ጽሑፍ ኣዳሉ፣ ደጊምካ ጽሓፍ ወይ ኣሻሽሎ',
    prompt: 'ሓጺርን ምቕሉልን ናይ ፕሮጀክት ሓበሬታ ክጽሕፍ ሓግዘኒ።',
    icon: { ios: 'pencil.line', android: 'edit', web: 'edit' },
  },
  {
    title: 'ሓሳብ ኣማዕብል',
    subtitle: 'ናይ ፍርያት ወይ ፈጠራ ሓሳብ መርምር',
    prompt: 'ናይ መተግበሪ ሓሳበይ ናብ ቀሊል መደብ ክቕይሮ ሓግዘኒ።',
    icon: { ios: 'doc.text', android: 'description', web: 'description' },
  },
];

export const workSuggestions = [
  {
    title: 'ናይ ፕሮጀክት ሓበሬታ ጽሓፍ',
    subtitle: 'እቲ ዝተሰርሐ ብንጹር ኣካፍል',
    prompt: 'ንጉጅለይ ሓጺር ናይ ፕሮጀክት ሓበሬታ ክጽሕፍ ሓግዘኒ።',
    icon: { ios: 'briefcase', android: 'work', web: 'work' },
  },
  {
    title: 'ዝቕጽል ስጉምትታት መድብ',
    subtitle: 'ንዕማማት ናብ ናይ ተግባር መደብ ቀይር',
    prompt: 'ዕላማታት ፕሮጀክተይ ናብ ንጹራት ዝቕጽሉ ስጉምትታት ቀይረለይ።',
    icon: { ios: 'list.bullet.clipboard', android: 'format_list_bulleted', web: 'format_list_bulleted' },
  },
  {
    title: 'ማስታወሻታተይ ኣጠቓልል',
    subtitle: 'ውሳነታትን ዝቕጽሉ ዕማማትን ኣውጽእ',
    prompt: 'ማስታወሻታተይ ናብ ውሳነታትን ዝስርሑ ዕማማትን ክጠቓለሉ ሓግዘኒ።',
    icon: { ios: 'note.text', android: 'note_alt', web: 'note_alt' },
  },
] satisfies typeof suggestions;
