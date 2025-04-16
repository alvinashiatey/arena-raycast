import { Detail, ActionPanel, Action, Icon } from "@raycast/api";
import { downloadFile } from "../utils/download";
import type { Block } from "../api/types";
import { useMemo } from "react";

interface ImageBlockViewProps {
  block: Block;
}

export function ImageBlockView({ block }: ImageBlockViewProps) {
  const url = useMemo(() => {
    return block.source?.url || `https://www.are.na/blocks/${block.id}`;
  }, [block.source, block.id]);

  const imageUrl = useMemo(() => {
    return block.image?.original?.url || block.image?.display?.url || "";
  }, [block.image]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  // Create image markdown for Detail view
  const imageMarkdown = useMemo(() => {
    if (!imageUrl) return "Image not available";
    return `![${block.title || "Image"}](${imageUrl})`;
  }, [imageUrl, block.title]);

  return (
    <Detail
      markdown={imageMarkdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Title" text={block.title || "Untitled"} />
          <Detail.Metadata.Label title="User" text={block.user?.full_name || "Unknown"} />
          <Detail.Metadata.Label title="Created At" text={formatDate(block.created_at)} />
          <Detail.Metadata.Label title="Updated At" text={formatDate(block.updated_at)} />
          {block.description && <Detail.Metadata.Label title="Description" text={block.description} />}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={imageUrl || url} title="Open Image in Browser" />
          <Action.CopyToClipboard content={imageUrl || ""} title="Copy Image URL" />
          <Action
            title="Download Image"
            icon={Icon.SaveDocument}
            onAction={() => block.source?.url && downloadFile(block.source.url)}
          />
          <Action.CopyToClipboard content={url} title="Copy Block URL" />
        </ActionPanel>
      }
    />
  );
}
