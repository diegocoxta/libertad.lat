import { Fragment } from 'react';

type RichTextProps = {
  text: string;
};

// Text is plain except for **bold** and _italic_ spans and [label](url) links.
export function RichText({ text }: RichTextProps) {
  return (
    <>
      {text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|_[^_]+_)/).map((part, index) => {
        const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);

        if (link) {
          return (
            <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">
              {link[1]}
            </a>
          );
        }

        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
