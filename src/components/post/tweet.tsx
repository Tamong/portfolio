import { getTweet } from "react-tweet/api";
import { Suspense } from "react";
import {
  TweetSkeleton,
  EmbeddedTweet,
  TweetNotFound,
  type TweetProps,
} from "react-tweet";
import "./tweet.css";

interface TweetError {
  message: string;
  status?: number;
  code?: string;
}

const TweetContent = async ({ id, components, onError }: TweetProps) => {
  let error: TweetError | undefined;

  const tweet = id
    ? await getTweet(id).catch((err: TweetError) => {
        if (onError) {
          error = onError(err) as TweetError;
        } else {
          console.error(err);
          error = {
            message: err.message,
            status: err.status,
            code: err.code,
          };
        }
      })
    : undefined;

  if (!tweet) {
    const NotFound = components?.TweetNotFound ?? TweetNotFound;
    return <NotFound error={error} />;
  }

  return <EmbeddedTweet tweet={tweet} components={components} />;
};

// Properly type the ReactTweet component
export const ReactTweet: React.FC<TweetProps> = (props: TweetProps) => (
  <TweetContent {...props} />
);

// Properly type the TweetComponent props
interface TweetComponentProps {
  id: string;
}

export async function TweetComponent({ id }: TweetComponentProps) {
  return (
    <div className="tweet my-6">
      <div className="flex justify-center">
        <Suspense fallback={<TweetSkeleton />}>
          <ReactTweet id={id} />
        </Suspense>
      </div>
    </div>
  );
}
