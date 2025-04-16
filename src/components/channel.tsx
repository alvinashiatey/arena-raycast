import { Grid, Image } from "@raycast/api";
import type { Block } from "../api/types";
import { useRef } from "react";
import { useArena } from "../hooks/useArena";
import { usePromise } from "@raycast/utils";
import { BlockActions } from "./BlockActions";
import type { MinimalChannel } from "../api/types";

interface ChannelRes {
  title: string;
  slug: string;
  user: string;
  contents: Block[] | null;
  connections: number;
  open?: boolean;
}

export function ChannelView({ channel }: { channel: MinimalChannel }) {
  const abortable = useRef<AbortController | null>(null);
  const arena = useArena();
  const { data, isLoading } = usePromise(
    async (): Promise<ChannelRes> => {
      const chan = arena.channel(channel.slug, {
        sort: "position",
        direction: "desc",
        per: 100,
      });
      const contents = await chan.contents();
      return {
        title: channel.title,
        slug: channel.slug,
        user: typeof channel.user === "string" ? channel.user : channel.user.full_name,
        contents: contents,
        connections: (await chan.connections()).length,
        open: channel.open,
      };
    },
    [],
    {
      abortable,
    },
  );

  const textIcon = (text: string): Image.ImageLike => {
    const textLimit = 20;
    const truncatedText = text.length > textLimit ? text.slice(0, textLimit) + "..." : text;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect x="0" y="0" width="200" height="200" fill="#b3b3b3" rx="10"></rect>
      <text x="100"
            y="100"
            text-anchor="middle"
            alignment-baseline="baseline"
            textLength="20" lengthAdjust="spacingAndGlyphs"
            font-size="16" 
            fill="#000">
        ${truncatedText}
      </text>
    </svg>
  `.replaceAll("\n", "");

    // Return the image using a properly encoded data URL
    return {
      source: `data:image/svg+xml,${svg}`,
    };
  };

  const getIconSource = (block: Block): Image.ImageLike => {
    if (block.image?.thumb?.url) {
      return { source: block.image.thumb.url };
    }
    if (block.class === "Text") {
      return textIcon(block.content || block.title || "Text");
    }
    return { source: "extension-icon.svg" };
  };

  return (
    <Grid columns={4} isLoading={isLoading}>
      {data?.contents?.length === 0 ? (
        <Grid.EmptyView
          icon={{ source: "extension-icon.svg" }}
          title="No blocks found"
          actions={<BlockActions channel={channel} />}
        />
      ) : (
        <Grid.Section title={data?.title} subtitle={data?.user}>
          {data?.contents?.map((block, index) => (
            <Grid.Item
              key={index}
              content={getIconSource(block)}
              title={block.title ?? ""}
              subtitle={`${block.user.full_name}—${block.class}`}
              actions={<BlockActions block={block} channel={channel} />}
            />
          ))}
        </Grid.Section>
      )}
      {}
    </Grid>
  );
}
