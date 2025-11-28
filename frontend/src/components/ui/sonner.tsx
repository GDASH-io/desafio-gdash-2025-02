import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "!bg-green-50 !border-green-500 text-foreground [&>svg]:text-green-600",
          error:
            "!bg-red-50 !border-red-500 text-foreground [&>svg]:text-red-600",
          info: "!bg-blue-50 !border-blue-500 text-foreground [&>svg]:text-blue-600",
          warning:
            "!bg-amber-50 !border-amber-500 text-foreground [&>svg]:text-amber-600",
          closeButton:
            "group-[.toast]:text-foreground/50 hover:group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
