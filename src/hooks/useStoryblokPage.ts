import { useEffect, useState } from "react";
import { fetchStoryblokPage, StoryblokPageFetchResult } from "../utils/storyblok";
import { useStoryblokState } from "@storyblok/react";

interface StoryblokPageState extends StoryblokPageFetchResult {
  isLoading: boolean;
}

const INITIAL_STATE: StoryblokPageState = {
  story: null,
  content: null,
  source: "fallback",
  isLoading: true,
};

export function useStoryblokPage(slug: string) {
  const [state, setState] = useState<StoryblokPageState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setState((current) => ({ ...current, isLoading: true }));
      const result = await fetchStoryblokPage(slug);

      if (!active) return;

      setState({
        ...result,
        isLoading: false,
      });
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [slug]);

  // Hook into the visual editor bridge if a story exists
  // useStoryblokState returns the updated story when it receives events from the visual editor
  const liveStory = useStoryblokState(state.story as any) as any;

  return {
    ...state,
    story: liveStory || state.story,
    content: liveStory?.content || state.content,
  };
}
