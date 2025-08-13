import Link from "next/link";
import styles from "./tile.module.css";
import Image from "next/image";

type TileProps = {
  title: string;
  link: string;
  signed_url?: string | null;
};

export default function Tile({ title, link, signed_url }: TileProps) {
  return (
    <Link className={styles.tile} href={link}>
      {signed_url ? (
        <Image src={signed_url} alt={title} className={styles.thumbnail} />
      ) : (
        <div
          className={`${styles.placeholder} `}
          style={{ paddingTop: "1rem" }}
        >
          <span className="highlight-error">No Thumbnail</span>
        </div>
      )}
      <div className={`${styles.title} locallink`}>{title}</div>
    </Link>
  );
}
