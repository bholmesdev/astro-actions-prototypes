import { useFormStatus, useFormState } from "react-dom";
import { action } from "../../integration/action";

export function Like({ postId, initial }: { postId: string; initial: number }) {
  const [state, actionName] = useFormState(
    () => {
      return action("/blog/like", { postId });
    },
    {
      likes: initial,
    }
  );
  return (
    <form action={actionName}>
      <Button likes={state.likes} />
    </form>
  );
}

function Button({ likes }: { likes: number }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      {likes} ❤️
    </button>
  );
}
