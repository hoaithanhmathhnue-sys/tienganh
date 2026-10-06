import { describe, expect, it } from 'vitest';
import { LEARNING_SUBJECTS, SELF_STUDY_PHRASES } from '@/lib/learning-content';

describe('self-study categories', () => {
  it('has the ten learning categories shown in the self-study screen', () => {
    expect(LEARNING_SUBJECTS.map((subject) => subject.id)).toEqual([
      'greetings',
      'classroom',
      'games',
      'math',
      'vietnamese',
      'art',
      'music',
      'pe',
      'history-geography',
      'science',
    ]);
  });

  it('provides practice phrases for every category', () => {
    expect(LEARNING_SUBJECTS.every((subject) => SELF_STUDY_PHRASES.some((phrase) => phrase.subjectId === subject.id))).toBe(true);
  });
});
