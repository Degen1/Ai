import { File, Paths } from 'expo-file-system';
import { createQuestionCredits } from '@/data/question-credits-core';

let store: ReturnType<typeof createQuestionCredits> | null = null;
export function questionCredits() {
  if (!store) store = createQuestionCredits({
    read() {
      const file = new File(Paths.document, 'sara-question-credits-v1.json');
      return file.exists ? file.textSync() : null;
    },
    write(value) {
      const temporary = new File(Paths.document, 'sara-question-credits-v1.tmp');
      temporary.create({ overwrite: true });
      temporary.write(value);
      temporary.moveSync(new File(Paths.document, 'sara-question-credits-v1.json'), { overwrite: true });
    },
  });
  return store;
}
