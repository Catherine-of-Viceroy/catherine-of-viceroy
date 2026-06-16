interface CardImage {
  url: string;
  description?: string;
  borderRadius?: string;
}

interface CardProps {
  image: CardImage;
}

export default function Card({ image }: CardProps) {
  if (!image.url) return null;

  return (
    <div className="flex flex-col w-full sm:w-[400px]">
      <img
        src={image.url}
        alt={image.description ?? ""}
        width={400}
        height={600}
        className="object-cover w-full sm:w-[400px]"
        style={{ borderRadius: image.borderRadius ?? "1rem", height: 600 }}
      />
      {image.description && (
        <p className="mt-2">{image.description}</p>
      )}
    </div>
  );
}
