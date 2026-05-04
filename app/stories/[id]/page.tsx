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
      <div key={story.id}>
      {story.layout == "full" && (
        <div>
          <h2>{story.title}</h2>
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
              <h2>{story.title}</h2>
              {story.content.map((content, index) => (
                <p key={index}>{content}</p>
              ))}
            </div>
          }
          left={
            <div className="flex justify-start">
              <ImageCarousel images={story.images} />
            </div>
          }
        />
      )}
      {story.layout == "half" && story.imagePosition == "right" && (
        <SplitLayout
          key={story.id}
          left={
            <div>
              <h2>{story.title}</h2>
              {story.content.map((content, index) => (
                <p key={index}>{content}</p>
              ))}
            </div>
          }
          right={
            <div className="flex justify-end">
              <ImageCarousel images={story.images} />
            </div>
          }
        />
      )}
      </div>
    )
  )};

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black px-[60px] w-full max-w-[1440px] mx-auto">
      <Header />
      {renderContent()}
      <Pagination currentPage={parseInt(id)} totalPages={10} />
    </div>
  );
}
