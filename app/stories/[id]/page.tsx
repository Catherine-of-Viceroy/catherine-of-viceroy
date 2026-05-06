import Header from "@/components/ui/Header";
import SplitLayout from "@/components/layout/SplitLayout";
import contentData from "@/data/stories.json";
import Pagination from "@/components/ui/Pagination";
import ImageCarousel from "@/components/ui/ImageCarousel";
interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const story = contentData.filter((story) => story.pageId === parseInt(id));

  const renderContent = () => {
    if (story.length === 0) {
      return <div>Story not found</div>;
    }
    return story.map((story) => (
      <div key={story.id} className="w-full py-10">
      {story.layout == "full" && (
        <div>
          {story.title && <h2>{story.title}</h2>} 
          {story.content.map((content, index) => (
            <p key={index}>{content}</p>
          ))}
        </div>
      )}
      {story.layout == "half" && story.imagePosition == "left" && (
        <SplitLayout
          key={story.id}
          right={
            <div>
              {story.title && <h2>{story.title}</h2>}
              {story.content.map((content, index) => (
                <p key={index}>{content}</p>
              ))}
            </div>
          }
          left={
            story.isImageCarousel ? (
              <div className="flex justify-start">
                <ImageCarousel images={story.images} />
              </div>
            ) : (
              <div className="flex justify-start gap-4">
                {story.images
                  .filter((image) => image.url)
                  .map((image, index) => {
                    const img = image as { url: string; borderRadius?: string; width?: string | number; height?: string | number };
                    const width = img.width ?? 400;
                    const height = img.height ?? 600;
                    return (
                      <img
                        key={index}
                        src={image.url}
                        alt={story.title}
                        width={width}
                        height={height}
                        className="object-cover"
                        style={{ borderRadius: img.borderRadius ?? "0" }}
                      />
                    );
                  })}
              </div>
            )
          }
          leftSize="w-1/3"
          rightSize="w-2/3"
          imagePosition="left"
        />
      )}
      {story.layout == "half" && story.imagePosition == "right" && (
        <SplitLayout
          key={story.id}
          left={
            <div>
              {story.title && <h2>{story.title}</h2>}
              {story.content.map((content, index) => (
                <p key={index}>{content}</p>
              ))}
            </div>
          }
          right={
            story.isImageCarousel ? (
              <div className="flex justify-end">
                <ImageCarousel images={story.images} />
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                {story.images
                  .filter((image) => image.url)
                  .map((image, index) => {
                    const img = image as { url: string; borderRadius?: string; width?: string | number; height?: string | number };
                    const width = img.width ?? 400;
                    const height = img.height ?? 600;
                    return (
                      <img
                        key={index}
                        src={image.url}
                        alt={story.title}
                        width={width}
                        height={height}
                        className="object-cover"
                        style={{ borderRadius: img.borderRadius ?? "0" }}
                      />
                    );
                  })}
              </div>
            )
          }
          leftSize="w-2/3"
          rightSize="w-1/3"
          imagePosition="right"
        />
      )}
      </div>
    )
  )};

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black px-4 md:px-[60px] w-full max-w-[1440px] mx-auto">
      <Header />
      {renderContent()}
      <Pagination currentPage={parseInt(id)} totalPages={10} />
    </div>
  );
}
