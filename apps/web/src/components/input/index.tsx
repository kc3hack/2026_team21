import { css } from "hono/css";
import type { JSX } from "hono/jsx/jsx-runtime";

export const ShortCodeInput = () => {
  const styles = css`
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  `;

  return <input type="text" name="shortCode" placeholder="ルームコードを入力" className={styles} />;
};

type ShortCodeFormProps = {
  onSubmit: (shortCode: string) => Promise<void> | void;
};

export const ShortCodeForm = (props: ShortCodeFormProps) => {
  const styles = css`
    display: flex;
    gap: 0.5rem;
  `;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!(e.currentTarget instanceof HTMLFormElement)) return;

    const formData = new FormData(e.currentTarget);
    const shortCode = formData.get("shortCode") as string;
    await props.onSubmit(shortCode);
  };

  return (
    <form action="" className={styles} onSubmit={handleSubmit}>
      <ShortCodeInput />
      <button type="submit">入室</button>
    </form>
  );
};
