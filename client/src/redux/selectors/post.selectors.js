import { createSelector } from 'reselect';

const selectPostState = (state) => state.post;

export const selectPosts = createSelector(
  [selectPostState],
  (postState) => postState.posts
);
