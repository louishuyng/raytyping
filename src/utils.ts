import test from "./test";

export function calculateWPM(startTime: Date, text: string) {
  // Calculate the time taken in seconds
  const endTime = new Date();
  const timeInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

  // Count the number of words in the typed text
  const wordCount = text.trim().split(/\s+/).length;

  // Calculate the WPM
  const wpm = Math.round(wordCount / (timeInSeconds / 60));

  return wpm;
}

export function calculateAccuracy(content: string, failedCount: number) {
  return Math.round(((content.length - failedCount) / content.length) * 100);
}

// Compare typedText with content if have similar word in order from left to right
// then bold that text
// For example
// typedText: 'Hello'
// content: 'Hello World'
// Then result => ['**Hello** World', 5]
// 5 is matchedCount
export function generateMatchingWords(
  typedText: string,
  content: string,
  callbackFailed: () => void,
): [string, number] {
  // If have no typing yet then return original content
  if (typedText == "") {
    return [content, 0];
  }

  let matchUntil: number | undefined = undefined;

  typedText.split("").forEach((word: string, index) => {
    if (word !== content[index]) {
      callbackFailed();
      return;
    }

    matchUntil = index;
  });

  // If not match anything then return original content
  if (matchUntil === undefined) {
    return [content, 0];
  }

  const finalText = content.split("").reduce((result, currentWord, currentIndex) => {
    if (currentWord !== " " && currentIndex === matchUntil) {
      result += `${currentWord}**`;
      return result;
    }

    if (currentWord === " " && currentIndex === matchUntil) {
      result += `**${currentWord}`;
      return result;
    }

    result += currentWord;

    return result;
  }, "**");

  return [finalText, matchUntil + 1];
}

export function generateSuccessMessage() {
  return `You are super, to reload press **Enter**`;
}

export function generateNewTest(lastTestIds: number[]): [string, number] {
  // Get length of the test
  const length = test.length;

  // Random a number from 0 to length - 1
  let randomIndex = null;
  while (!randomIndex || lastTestIds.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * length);
  }

  return [test[randomIndex], randomIndex];
}
