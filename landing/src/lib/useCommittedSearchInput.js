import { useRef, useState } from "react";

import { useBrowserLayoutEffect } from "./useBrowserLayoutEffect.js";

export function useCommittedSearchInput(committedValue, onCommit) {
  const [draftValue, setDraftValue] = useState(committedValue);
  const [isComposing, setIsComposing] = useState(false);
  const composingRef = useRef(false);
  const lastCommittedValueRef = useRef(committedValue);

  useBrowserLayoutEffect(() => {
    composingRef.current = false;
    lastCommittedValueRef.current = committedValue;
    setDraftValue(committedValue);
    setIsComposing(false);
  }, [committedValue]);

  function commit(nextValue) {
    if (nextValue === lastCommittedValueRef.current) return;
    lastCommittedValueRef.current = nextValue;
    onCommit(nextValue);
  }

  return {
    draftValue,
    isComposing,
    inputProps: {
      value: draftValue,
      onChange: (event) => {
        const nextValue = event.currentTarget.value;
        const nativeEvent = event.nativeEvent;
        setDraftValue(nextValue);
        if (
          !composingRef.current
          && !nativeEvent.isComposing
          && nativeEvent.keyCode !== 229
        ) {
          commit(nextValue);
        }
      },
      onCompositionStart: () => {
        composingRef.current = true;
        setIsComposing(true);
      },
      onCompositionEnd: (event) => {
        const nextValue = event.currentTarget.value;
        composingRef.current = false;
        setIsComposing(false);
        setDraftValue(nextValue);
        commit(nextValue);
      },
    },
  };
}
