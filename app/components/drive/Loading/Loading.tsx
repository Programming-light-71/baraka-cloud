import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center">
      <Loader className="animate-spin" size={40} />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
