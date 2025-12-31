import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null, // profile being viewed
  },
  reducers: {
    setProfileUser: (state, action) => {
      state.user = action.payload;
    },
    toggleFollowOptimistic: (state, action) => {
      if (!state.user) return;
      const meId = action.payload;
      const isFollowing = state.user.followers.includes(meId);

      if (isFollowing) {
        state.user.followers = state.user.followers.filter(id => id !== meId);
      } else {
        state.user.followers.push(meId);
      }
    },
  },
});

export const { setProfileUser, toggleFollowOptimistic } = profileSlice.actions;
export default profileSlice.reducer;
