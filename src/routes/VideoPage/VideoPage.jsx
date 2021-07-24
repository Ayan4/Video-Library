import ResponsivePlayer from "../../components/ResponsivePlayer";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlaylist } from "../../context/playlistContext";
import { useVideo } from "../../context/videosContext";
import { useMutation } from "react-query";
import { useAuth } from "../../context/authContext";
import { liked, watchLater, history } from "../../Api/videosApi";
import { HiChevronDown } from "react-icons/hi";
import ComentSection from "../../components/CommentSection";
import toast from "react-hot-toast";
import {
  AiOutlineLike,
  AiOutlineClockCircle,
  AiOutlineShareAlt
} from "react-icons/ai";
import { RiPlayListAddFill } from "react-icons/ri";
import Modal from "../../components/Modal";

const VideoPage = () => {
  const { videoID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, playlistDispatch } = usePlaylist();
  const { videoState, allVideosLoading } = useVideo();
  const [likeActive, setLikeActive] = useState(false);
  const [watchLaterActive, setWatchLaterActive] = useState(false);
  const [video, setVideo] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const { mutate: historyMutate } = useMutation(history, {
    onSuccess: data => {
      playlistDispatch({
        type: "FETCH_HISTORY_VIDEOS",
        payload: data?.history.videos
      });
    }
  });

  useEffect(() => {
    if (user) {
      historyMutate(videoID);
    }
  }, [user, historyMutate, videoID]);

  useEffect(() => {
    const foundVideo = videoState?.videos?.find(item => item._id === videoID);
    setVideo(foundVideo);

    state.liked?.find(item => item._id === video?._id) && setLikeActive(true);
    state.watchLater?.find(item => item._id === video?._id) &&
      setWatchLaterActive(true);
  }, [
    state.liked,
    video?._id,
    state.watchLater,
    videoID,
    videoState,
    historyMutate,
    user
  ]);

  const { isLoading: likeLoading, mutate: likeMutate } = useMutation(liked, {
    onSuccess: data => {
      playlistDispatch({
        type: "ADD_TO_LIKED_VIDEOS",
        payload: data.likedPlaylist.videos
      });
      if (likeActive) {
        toast.success("Removed from liked videos");
      } else {
        toast.success("Added to liked videos");
      }
    }
  });

  const {
    isLoading: watchLaterLoading,
    mutate: watchLaterMutate
  } = useMutation(watchLater, {
    onSuccess: data => {
      playlistDispatch({
        type: "ADD_TO_WATCH_LATER_VIDEOS",
        payload: data.watchLaterPlaylist.videos
      });

      if (watchLaterActive) {
        toast.success("Removed from watch later");
      } else {
        toast.success("Added to watch later");
      }
    }
  });

  // if (error) return <h1>Error occured in fetching video</h1>;

  if (allVideosLoading) return <h1>Content is loading</h1>;

  return (
    <div className="h-screen">
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        videoID={videoID}
      />

      {/* Video */}
      <ResponsivePlayer videoId={video?.videoId} />

      {/* Video info */}
      <div className="px-5 py-5 border-b border-white-1">
        <div className="flex items-center justify-between">
          <p className="font-poppins font-normal text-base pr-1 text-black-1">
            {video?.title}
          </p>
          <HiChevronDown className="w-8 h-6 text-black-2" />
        </div>
        <div className="flex items-center mt-3">
          <p className="font-poppins font-normal text-xs text-gray-1 mr-4">
            {video?.viewCount} views
          </p>
          <p className="font-poppins font-normal text-xs text-gray-1">
            {video?.uploadDate}
          </p>
        </div>

        <div className="flex items-center justify-start mt-5 w-full">
          <button
            onClick={() => {
              if (user) {
                likeMutate(video?._id);
                setLikeActive(!likeActive);
              } else {
                navigate("/login");
              }
            }}
            className={`flex items-center tracking-tight font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl ${
              likeActive ? "text-primary-red" : "text-black-2"
            } text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2 ${likeLoading &&
              "animate-pulse"}`}
            disabled={likeLoading && true}
          >
            <AiOutlineLike className="mr-1 w-4 xs:w-5 h-4 xs:h-5" />
            {video?.likeCount}
          </button>
          <button
            onClick={() => {
              if (user) {
                watchLaterMutate(video?._id);
                setWatchLaterActive(!watchLaterActive);
              } else {
                navigate("/login");
              }
            }}
            className={`flex items-center tracking-tight font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl ${
              watchLaterActive ? "text-primary-red" : "text-black-2"
            }
            text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2 ${watchLaterLoading &&
              "animate-pulse"}`}
          >
            <AiOutlineClockCircle className="mr-1 w-4 xs:w-5 h-4 xs:h-5" />
            Watch Later
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center tracking-tight font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl text-black-2 text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2"
          >
            <RiPlayListAddFill className="mr-1 w-3.5 xs:w-4 h-3.5 xs:h-4" />
            Save
          </button>
          <button className="flex items-center ml-auto bg-white-1 px-2.5 py-1.5 rounded-2xl active:bg-white-2">
            <AiOutlineShareAlt className="w-4 xs:w-5 h-4 xs:h-5 text-black-2" />
          </button>
        </div>
      </div>

      {/* channel info */}
      <div className="flex justify-start items-center px-5 py-2 border-b border-white-1">
        <img
          className="rounded-full w-10 h-10"
          src={video?.channelDisplayPic}
          alt=""
        />
        <div className="flex flex-col font-poppins ml-2.5">
          <p className="text-base text-black-1">{video?.channelName}</p>
          <p className="text-xs text-gray-1">
            {video?.subscribers} Subscribers
          </p>
        </div>
      </div>

      <ComentSection video={video} />
    </div>
  );
};

export default VideoPage;
