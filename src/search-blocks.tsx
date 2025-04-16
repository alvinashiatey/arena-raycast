import { useRef } from "react";
import { Grid, LaunchProps } from "@raycast/api";
import { useArena } from "./hooks/useArena";
import type { SearchBlocksResponse, Block } from "./api/types";
import { usePromise } from "@raycast/utils";
import { BlockActions } from "./components/BlockActions";
import { getIconSource } from "./utils/icons";

interface SearchArguments {
  query: string;
}

export default function Command(props: LaunchProps<{ arguments: SearchArguments }>) {
  const abortable = useRef<AbortController | null>(null);
  const arena = useArena();
  const { query } = props.arguments;
  const { data, isLoading } = usePromise(
    async (q: string): Promise<SearchBlocksResponse> => {
      const response = await arena.search(q).blocks({ per: 100 });
      return response;
    },
    [query],
    {
      abortable,
    },
  );
  const hasNoResults = data?.blocks.length === 0;

  // Helper function to determine the appropriate icon source based on block type
  const getIconSource = (block: Block): string => {
    if (block.image?.thumb?.url) {
      return block.image.thumb.url;
    }

    // Default to extension-icon.svg for other types
    return "extension-icon.png";
  };

  return (
    <Grid columns={4} isLoading={isLoading}>
      <Grid.Section title="Search Results">
        {hasNoResults ? (
          <Grid.EmptyView icon={{ source: "extension-icon.svg" }} title="No results found" />
        ) : (
          data?.blocks.map((block) => (
            <Grid.Item
              key={block.id || crypto.randomUUID()}
              content={getIconSource(block)}
              title={block.title ?? ""}
              subtitle={block.class}
              actions={<BlockActions block={block} />}
            />
          ))
        )}
      </Grid.Section>
    </Grid>
  );
}
