import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps) {
  const { toastOptions, ...restProps } = props

  return (
    <Sonner
      className="toaster group"
      closeButton
      duration={2200}
      expand={false}
      position="top-right"
      richColors={false}
      visibleToasts={2}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast border-border/70 bg-background/95 text-foreground shadow-md backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          ...toastOptions?.classNames,
        },
      }}
      {...restProps}
    />
  )
}
