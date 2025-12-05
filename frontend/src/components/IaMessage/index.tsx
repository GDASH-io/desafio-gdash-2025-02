import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Textarea } from "../ui/textarea"
import botAvatar from "/bot-message-square.svg";

type IaMessageProps = {
  message: string
}

export function IaMessage({ message }: IaMessageProps) {
  return (
    <section className="relative mt-2 mb-2">
      <Avatar className="bg-accent rouded-full p-2 w-12 h-12 m-2 absolute -top-6 -left-8">
        <AvatarImage src={botAvatar} className="text-white" />
        <AvatarFallback>RB</AvatarFallback>
      </Avatar>
      <Textarea value={message} disabled className="pl-8 disabled:opacity-100 resize-none" />
    </section>
  )
}