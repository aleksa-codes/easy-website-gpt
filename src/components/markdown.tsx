import { memo, type FC } from "react"
import ReactMarkdown, { type Options } from "react-markdown"

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

export default MemoizedReactMarkdown
