import { useEffect, useState } from "react";
import * as api from "@raycast/api";

export default function Main() {
  const test = "testing word for many cases";

  const [startTime, setStartTime] = useState<Date | null>(null);

  // Speed has been counted by word per minutes (wpm)
  const [speed, setSpeed] = useState<number>(0);

  const [isCorrect, setIsCorrect] = useState<boolean>(true);

  const [typedText, setTypedText] = useState<string>("");

  const [content, setContent] = useState<string>(test);

  // Compare typedText with content if have similar word in order from left to right
  // then bold that text
  // For example
  // typedText: 'Hello'
  // content: 'Hello World'
  // Then result => ['**Hello** World', 5]
  // 5 is matchedCount
  function generateMatchingWords(typedText: string, content: string): [string, number] {
    // If have no typing yet then return original content
    if (typedText == "") {
      return [content, 0];
    }

    let matchUntil: number | undefined = undefined;

    typedText.split("").forEach((word: string, index) => {
      if (word !== content[index]) {
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

  function generateSuccessMessage() {
    return `Your are finished typing with speed **${speed}**`;
  }

  function countWordsPerMinute(startTime: Date, typedText: string) {
    const elapsedTime = (new Date().getTime() - startTime.getTime()) / 1000 / 60;
    const enteredText = typedText.trim();

    const wordCount = enteredText.split(/\s+/).length;

    const wpm = Math.round(wordCount / elapsedTime);

    return wpm;
  }

  useEffect(() => {
    let beginning: Date | null = null;

    if (typedText.length === 0) {
      return;
    }

    if (!startTime) {
      beginning = new Date();
      setStartTime(beginning);
    } else {
      beginning = startTime;
    }

    const [matchingWords, matchedCount] = generateMatchingWords(typedText, test);

    if (matchedCount === test.length) {
      setContent(generateSuccessMessage());
      return;
    }

    setIsCorrect(matchedCount === typedText.length);

    setContent(matchingWords);

    setSpeed(countWordsPerMinute(beginning, typedText));
  }, [typedText]);

  return (
    <api.List isShowingDetail={true} searchBarPlaceholder="Type here" onSearchTextChange={setTypedText}>
      <api.List.Item
        icon={{
          source: isCorrect ? api.Icon.Check : api.Icon.Xmark,
          tintColor: isCorrect ? api.Color.Green : api.Color.Red,
        }}
        title={`${speed} wpm`}
        detail={<api.List.Item.Detail markdown={content} />}
      />
    </api.List>
  );
}
