import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import MemoizedReactMarkdown from '@/components/markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { HTMLProps } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Link = ({ className, children, ...props }: HTMLProps<HTMLAnchorElement>) => (
  <a
    className={cn('text-primary underline underline-offset-4 hover:text-primary/80', className)}
    target='_blank'
    rel='noopener noreferrer'
    {...props}
  >
    {children}
  </a>
);

const Paragraph = ({ className, children, ...props }: HTMLProps<HTMLParagraphElement>) => (
  <p className={cn('mb-2 last:mb-0', className)} {...props}>
    {children}
  </p>
);

const CodeBlock = ({
  inline = false,
  children,
  ...props
}: HTMLProps<HTMLElement> & { inline?: boolean; className?: string }) => {
  if (inline) {
    return (
      <code className='rounded bg-zinc-700 px-1.5 py-0.5 font-mono text-sm text-zinc-200' {...props}>
        {children}
      </code>
    );
  }

  return (
    <pre className='my-2 overflow-x-auto rounded-lg bg-zinc-800 p-4'>
      <code className='block font-mono text-sm text-zinc-200' {...props}>
        {String(children).replace(/\n$/, '')}
      </code>
    </pre>
  );
};

const LoadingDots = () => (
  <div className='flex space-x-1.5'>
    <motion.span
      className='h-2 w-2 rounded-full bg-primary/40'
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.span
      className='h-2 w-2 rounded-full bg-primary/40'
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.span
      className='h-2 w-2 rounded-full bg-primary/40'
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  const isEmpty = !content.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-2', {
        'justify-end': !isAssistant,
      })}
    >
      {isAssistant && (
        <div className='mt-1 flex h-10 w-10 shrink-0'>
          <Bot className='h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2 text-primary' />
        </div>
      )}
      <Card
        className={cn(
          'max-w-[80%] break-words rounded-2xl px-4 py-3 shadow-sm transition-colors',
          {
            'bg-primary text-primary-foreground': !isAssistant,
            'bg-muted/50 hover:bg-muted/80': isAssistant,
          },
          isEmpty && isAssistant && 'flex min-h-12 items-center justify-center',
        )}
      >
        {isAssistant ? (
          isEmpty ? (
            <LoadingDots />
          ) : (
            <MemoizedReactMarkdown
              className='prose prose-sm max-w-none dark:prose-invert'
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                code: CodeBlock,
                a: Link,
                p: Paragraph,
              }}
            >
              {content}
            </MemoizedReactMarkdown>
          )
        ) : (
          <p className='whitespace-pre-wrap text-sm leading-relaxed'>{content}</p>
        )}
      </Card>
      {!isAssistant && (
        <div className='mt-1 flex h-10 w-10 shrink-0'>
          <User className='h-full w-full rounded-full bg-gradient-to-br from-primary to-primary/80 p-2 text-primary-foreground' />
        </div>
      )}
    </motion.div>
  );
}