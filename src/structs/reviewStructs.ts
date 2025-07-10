import { integer, min, nonempty, object, partial, string } from 'superstruct';

export const UpdateReviewBodyStruct = partial(
  object({
    rating: min(integer(), 0),
    content: nonempty(string()),
  }),
);

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  orderItemId: string;
}

export default Review;