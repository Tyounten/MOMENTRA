import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Try different email",
        success: false,
      });
    };
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword
    });
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
}
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    };

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    )
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts
    }
    return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
      message: `Welcome back ${user.username}`,
      success: true,
      user
    });

  } catch (error) {
    console.log(error);
  }
};
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: 'Logged out successfully.',
      success: true
    });
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId).populate({ path: 'posts', createdAt: -1 }).populate('bookmarks');
    return res.status(200).json({
      user,
      success: true
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    let profilePictureUrl;

    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        profilePictureUrl = cloudResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary error:", err);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found.", success: false });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePictureUrl) user.profilePicture = profilePictureUrl;

    await user.save();

    return res.status(200).json({ message: "Profile updated.", success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
    if (!suggestedUsers) {
      return res.status(400).json({
        message: 'Currently do not have any users',
      })
    };
    return res.status(200).json({
      success: true,
      users: suggestedUsers
    })
  } catch (error) {
    console.log(error);
  }
};
export const followOrUnfollow = async (req, res) => {
  try {
    const me = req.id;                 // current user id
    const targetId = req.params.id;    // user to follow/unfollow

    // prevent self follow
    if (me === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot follow/unfollow yourself' });
    }

    // fetch minimal fields
    const [meDoc, targetDoc] = await Promise.all([
      User.findById(me).select('_id following'),
      User.findById(targetId).select('_id followers')
    ]);
    if (!meDoc || !targetDoc) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = meDoc.following.some(id => id.toString() === targetId);

    if (isFollowing) {
      // unfollow
      await Promise.all([
        User.updateOne({ _id: me }, { $pull: { following: targetId } }),
        User.updateOne({ _id: targetId }, { $pull: { followers: me } })
      ]);

      const [meAfter, targetAfter] = await Promise.all([
        User.findById(me).select('following'),
        User.findById(targetId).select('followers')
      ]);

      return res.status(200).json({
        success: true,
        type: 'unfollowed',
        followingCount: meAfter.following.length,
        followersCount: targetAfter.followers.length
      });
    } else {
      // follow
      await Promise.all([
        User.updateOne({ _id: me }, { $addToSet: { following: targetId } }),
        User.updateOne({ _id: targetId }, { $addToSet: { followers: me } })
      ]);

      const [meAfter, targetAfter] = await Promise.all([
        User.findById(me).select('following'),
        User.findById(targetId).select('followers')
      ]);

      return res.status(200).json({
        success: true,
        type: 'followed',
        followingCount: meAfter.following.length,
        followersCount: targetAfter.followers.length
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};