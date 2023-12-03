import { useEffect, useState } from "react";
import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { faker } from "@faker-js/faker";

export default function Main() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [test, setTest] = useState("");

  // Speed has been counted by word per minutes (wpm)
  const [speed, setSpeed] = useState<number>(0);

  const [isCorrect, setIsCorrect] = useState<boolean>(true);

  const [typedText, setTypedText] = useState<string>("");

  const [content, setContent] = useState<string>(test);

  const [isFinish, setIsFinish] = useState<boolean>(false);

  function reloadGame() {
    setTypedText("");
    setSpeed(0);

    const test = faker.word.words(3);
    setTest(test);
    setContent(test);
    setStartTime(null);

    setIsFinish(false);
  }

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
    return `You are super, to reload press **Enter**`;
  }

  function calculateWPM(startTime: Date, text: string) {
    // Calculate the time taken in seconds
    const endTime = new Date();
    const timeInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    // Count the number of words in the typed text
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate the WPM
    const wpm = Math.round(wordCount / (timeInSeconds / 60));

    return wpm;
  }

  useEffect(() => {
    reloadGame();
  }, []);

  useEffect(() => {
    // If game is finished the we dont want to process anything
    if (isFinish || typedText.length === 0) {
      return;
    }

    let beginning: Date | null = null;

    if (!startTime) {
      beginning = new Date();
      setStartTime(beginning);
    } else {
      beginning = startTime;
    }

    const [matchingWords, matchedCount] = generateMatchingWords(typedText, test);

    if (matchedCount === test.length) {
      setIsFinish(true);
      setContent(generateSuccessMessage());
      return;
    }

    setIsCorrect(matchedCount === typedText.length);
    setContent(matchingWords);

    setSpeed(calculateWPM(beginning, typedText));
  }, [typedText]);

  return (
    <List
      searchText={isFinish ? "Reload to continue" : typedText}
      isShowingDetail={true}
      searchBarPlaceholder="Type here"
      onSearchTextChange={(value) => (isFinish ? () => null : setTypedText(value))}
    >
      <List.Item
        icon={{
          source: Icon.Stopwatch,
          tintColor: isCorrect ? Color.Green : Color.Red,
        }}
        title={`${speed} wpm`}
        actions={
          <ActionPanel>
            <Action title="Reload new game" onAction={() => reloadGame()} shortcut={{ modifiers: ["cmd"], key: "n" }} />
          </ActionPanel>
        }
        detail={
          <List.Item.Detail
            markdown={content}
            metadata={
              isFinish ? (
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Speed" text={{ color: Color.Green, value: `${speed} wpm` }} />
                </List.Item.Detail.Metadata>
              ) : null
            }
          />
        }
      />
    </List>
  );
}
