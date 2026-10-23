import { RichText } from '~/components/rich-text';
import type { ArticleBlockType, ArticleCellType } from '~/lib/article';
import type { Locale } from '~/lib/i18n';

import styles from './article-content.module.css';

type ArticleContentProps = {
  blocks: ArticleBlockType[];
  locale: Locale;
};

type ArticleCellProps = {
  cell: ArticleCellType;
  locale: Locale;
};

function ArticleCell({ cell, locale }: ArticleCellProps) {
  if (!cell) {
    return null;
  }

  if (Array.isArray(cell)) {
    return (
      <ul>
        {cell.map((item, index) => (
          <li key={index}>
            <RichText text={item[locale]} />
          </li>
        ))}
      </ul>
    );
  }

  return <RichText text={cell[locale]} />;
}

export function ArticleContent({ blocks, locale }: ArticleContentProps) {
  return (
    <div className={styles.article}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={index}>{block.text[locale]}</h2>;

          case 'paragraph':
            return (
              <p key={index}>
                <RichText text={block.text[locale]} />
              </p>
            );

          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';

            return (
              <List key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText text={item[locale]} />
                  </li>
                ))}
              </List>
            );
          }

          case 'table':
            return (
              <div key={index} className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      {block.head.map((cell, cellIndex) => (
                        <th key={cellIndex} scope="col">
                          {cell[locale]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} data-label={block.head[cellIndex][locale]}>
                            <ArticleCell cell={cell} locale={locale} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
