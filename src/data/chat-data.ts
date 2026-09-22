import type { SymbolViewProps } from 'expo-symbols';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type SavedConversation = {
  id: string;
  title: string;
  preview: string;
  section: 'Today' | 'Previous 7 days';
  messages: ChatMessage[];
};

export const suggestions: {
  title: string;
  subtitle: string;
  prompt: string;
  icon: SymbolViewProps['name'];
}[] = [
  {
    title: 'Plan something',
    subtitle: 'Turn a busy idea into a calm plan',
    prompt: 'Help me make a focused and realistic plan.',
    icon: { ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' },
  },
  {
    title: 'Write or edit',
    subtitle: 'Draft, rewrite, or sharpen your words',
    prompt: 'Help me write a warm, concise project update.',
    icon: { ios: 'pencil.line', android: 'edit', web: 'edit' },
  },
  {
    title: 'Brainstorm an idea',
    subtitle: 'Explore a product or creative direction',
    prompt: 'Help me turn a rough app idea into a simple plan.',
    icon: { ios: 'doc.text', android: 'description', web: 'description' },
  },
];

export const workSuggestions = [
  {
    title: 'Draft a project update',
    subtitle: 'Share progress without the clutter',
    prompt: 'Help me draft a concise project update for my team.',
    icon: { ios: 'briefcase', android: 'work', web: 'work' },
  },
  {
    title: 'Plan next steps',
    subtitle: 'Turn loose tasks into an action plan',
    prompt: 'Turn my project goals into clear next steps.',
    icon: { ios: 'list.bullet.clipboard', android: 'format_list_bulleted', web: 'format_list_bulleted' },
  },
  {
    title: 'Summarize my notes',
    subtitle: 'Pull out decisions and follow-ups',
    prompt: 'Help me summarize notes into decisions and action items.',
    icon: { ios: 'note.text', android: 'note_alt', web: 'note_alt' },
  },
] satisfies typeof suggestions;

export const savedConversations: SavedConversation[] = [
  {
    id: 'weekly-plan',
    title: 'A calmer weekly plan',
    preview: 'A realistic plan with three priorities per day',
    section: 'Today',
    messages: [
      { id: 'weekly-1', role: 'user', content: 'Help me plan a focused and realistic week.' },
      {
        id: 'weekly-2',
        role: 'assistant',
        content:
          'Let’s keep it simple: choose one meaningful outcome for the week, then give each day no more than three priorities. Leave Friday afternoon open for anything that slips. If you share your task list, I can turn it into a day-by-day plan.',
      },
    ],
  },
  {
    id: 'project-update',
    title: 'Project update draft',
    preview: 'A concise update for the team',
    section: 'Today',
    messages: [
      { id: 'update-1', role: 'user', content: 'Help me write a warm, concise project update.' },
      {
        id: 'update-2',
        role: 'assistant',
        content:
          'Here’s a flexible structure: “Quick update — we finished the core flow this week and are now polishing the final details. The main risk is timing around review, but we’re still on track. I’ll share the next build on Thursday. Thanks for all the thoughtful feedback.”',
      },
    ],
  },
  {
    id: 'app-idea',
    title: 'Simple app concept',
    preview: 'Turning a rough idea into an MVP',
    section: 'Previous 7 days',
    messages: [
      { id: 'idea-1', role: 'user', content: 'Help me turn a rough app idea into a simple plan.' },
      {
        id: 'idea-2',
        role: 'assistant',
        content:
          'Start with one user and one repeated problem. Define the smallest action that solves it, then make that your entire first version. A strong MVP needs a clear promise, one core workflow, and a way to learn what users do next.',
      },
    ],
  },
];

export function getConversation(id?: string) {
  return savedConversations.find((conversation) => conversation.id === id);
}
