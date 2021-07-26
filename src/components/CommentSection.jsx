import { useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { postComment, deleteComment } from "../Api/videosApi";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useVideo } from "../context/videosContext";
import toast from "react-hot-toast";
import DeleteHandler from "./Utils/DeleteHandler";

function CommentSection({ video, setPageLoading, setOpenLoginModal }) {
  const { user } = useAuth();
  const { videoDispatch } = useVideo();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const commentEndRef = useRef(null);

  const scrollToBottom = () => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { mutate: postCommentMutate } = useMutation(postComment, {
    onSuccess: data => {
      videoDispatch({ type: "FETCH_VIDEOS", payload: data.allVideos });
      toast.success("Comment Added");
      scrollToBottom();
      setPageLoading(false);
    }
  });

  const { mutate: deleteCommentMutate } = useMutation(deleteComment, {
    onSuccess: data => {
      videoDispatch({ type: "FETCH_VIDEOS", payload: data.allVideos });
      toast.success("Comment Deleted");
      setPageLoading(false);
    }
  });

  const handleDelete = commentId => {
    if (user) {
      const commentData = {
        videoId: video._id,
        commentId: commentId
      };
      setPageLoading(true);
      deleteCommentMutate(commentData);
    } else {
      navigate("/login");
    }
  };

  const submitForm = (data, e) => {
    e.preventDefault();
    if (user) {
      reset("", {
        keepValues: false
      });
      const commentData = {
        name: user.name,
        comment: data.comment,
        videoId: video._id
      };
      setPageLoading(true);
      postCommentMutate(commentData);
    } else {
      setOpenLoginModal(true);
    }
  };

  return (
    <div>
      <div className="px-5 font-poppins border-b border-white-1">
        <div className="flex items-center my-4">
          <p className="border-l-4 border-primary font-medium text-black-1 mr-2 pl-2.5">
            Comments
          </p>
          <p className="text-xs mt-0.5 text-black-2">
            {video?.comments?.length}
          </p>
        </div>

        <div className="flex py-2">
          <img
            className="rounded-full w-8 h-8 mr-1"
            src="https://media.istockphoto.com/vectors/missing-image-of-a-person-placeholder-vector-id1288129985?k=6&m=1288129985&s=612x612&w=0&h=V3wDE1mcLUtlaLUi4yeEp9civuxgB4RA60JehnQdaOY="
            alt=""
          />

          <form
            className="flex justify-between items-center w-full"
            onSubmit={handleSubmit(submitForm)}
            action=""
          >
            <input
              className="h-full w-full px-2 outline-none placeholder-white-2 text-black-1"
              type="text"
              placeholder="Add a public comment"
              {...register("comment", { required: true })}
            />
            <button>
              <AiOutlineSend className="w-6 h-6 text-primary-red" />
            </button>
          </form>
        </div>
      </div>

      <div className="font-poppins mb-20">
        {video?.comments?.map(item => {
          return (
            <div
              key={item._id}
              className="flex items-start px-5 py-4 border-b border-white-1 w-full"
            >
              <img
                className="rounded-full w-8 h-8 mt-0.5"
                src="https://media.istockphoto.com/vectors/missing-image-of-a-person-placeholder-vector-id1288129985?k=6&m=1288129985&s=612x612&w=0&h=V3wDE1mcLUtlaLUi4yeEp9civuxgB4RA60JehnQdaOY="
                alt=""
              />

              <div className="flex flex-col ml-3">
                <p className="text-xs text-black-2 mb-0.5">{item.name}</p>
                <p className="text-sm text-black-1 tracking-tight">
                  {item.comment}
                </p>
              </div>

              {/* Could use userID here instead of name */}
              {item.name === user?.name && (
                <DeleteHandler handleDelete={() => handleDelete(item._id)} />
              )}
            </div>
          );
        })}
      </div>
      <div ref={commentEndRef}></div>
    </div>
  );
}

export default CommentSection;
