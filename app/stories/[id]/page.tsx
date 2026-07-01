import Header from "@/components/ui/Header";
import SplitLayout from "@/components/layout/SplitLayout";
import { getStories } from "@/lib/data-utils";
import Pagination from "@/components/ui/Pagination";
import ImageCarousel from "@/components/ui/ImageCarousel";
import Card from "@/components/ui/Card";
interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  // Get unique pageIds from stories data
  const contentData = getStories();
  const uniquePageIds = [...new Set(contentData.map((story: any) => story.pageId))];
  return uniquePageIds.map((pageId: any) => ({
    id: pageId.toString(),
  }));
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const contentData = getStories();
  const story = contentData.filter((story: any) => story.pageId === parseInt(id));

  const renderContent = () => {
    if (story.length === 0) {
      return <div>Story not found</div>;
    }
    return story.map((story) => {
      const hasNoPadding = story.images?.some((img: { padding?: string }) => img.padding === "none");
      return (
      <div key={story.id} className={`w-full ${hasNoPadding ? "" : "py-10"}`}>
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
                <ImageCarousel images={story.images} width={story.isTwoImageWidth ? 700 : 400} height={story.isTwoImageWidth ? 467 : 600} lastItemHandle={story?.lastItemHandle} />
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
          leftSize={story.leftSize ?? "lg:w-1/3"}
          rightSize={story.rightSize ?? "lg:w-2/3"}
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
                <ImageCarousel images={story.images} autoSlide={story?.autoSlide ?? false} width={story.isTwoImageWidth ? 700 : 400} height={story.isTwoImageWidth ? 467 : 600} lastItemHandle={story?.lastItemHandle} />
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
          leftSize={story.leftSize ?? "lg:w-2/3"}
          rightSize={story.rightSize ?? "lg:w-1/3"}
          imagePosition="right"
        />
      )}
      {story.layout == 'full' && story.imagePosition == 'center' && (
        story.isImageCarousel ? (
            <div className="flex justify-center">
              <ImageCarousel images={story.images} autoSlide={story?.autoSlide ?? false} width={story.isTwoImageWidth ? 700 : 400} height={story.isTwoImageWidth ? 467 : 600} lastItemHandle={story?.lastItemHandle} />
            </div>
          ) : (
            <div className="flex justify-center gap-4">
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
      )}
      {story.layout == "column-cards" && (
        <div className="flex flex-row flex-wrap gap-8 justify-center">
          {story.images.map((image, index) => (
            <Card key={index} image={image} />
          ))}
        </div>
      )}
      </div>
    );
  })};

  return (
    <div className="flex flex-col flex-1 items-center font-sans dark:bg-black px-4 md:px-[60px] w-full max-w-[1440px] mx-auto">
      <Header />
      {renderContent()}
      <Pagination currentPage={parseInt(id)} totalPages={11} />
    </div>
  );
}
