import { Clapperboard, CloudDrizzle, Files, Images } from "lucide-react";
import Dash_FoldersOrFileSection from "../Dash_FoldersOrFileSection";
import { Folder } from "../file&Folder/Folder";

const Dash_Recent_Folders = () => {
  return (
    <div className="w-full my-5">
      <Dash_FoldersOrFileSection secName="Folders" secBtnNavigate="./my-drive">
        <div className="flex gap-5 flex-wrap" key={Math.random()}>
          <Folder
            folder={{ name: "Images", files: 5, createdAt: new Date() }}
            color="bg-[#00B652] hover:bg-[#00B652]/90"
            navigate="./images"
            icon={<Images />}
          />
          <Folder
            folder={{ name: "Videos", files: 10, createdAt: new Date() }}
            color="bg-[#6672FB] hover:bg-[#6672FB]/90"
            navigate="./videos"
            icon={<Clapperboard />}
          />
          <Folder
            folder={{ name: "Document", files: 2, createdAt: new Date() }}
            navigate="./documents"
            icon={<Files />}
          />
          <Folder
            folder={{ name: "My Drive", files: 2, createdAt: new Date() }}
            navigate="./my-drive"
            cusFName="My Drive"
            icon={<CloudDrizzle />}
          />
        </div>
      </Dash_FoldersOrFileSection>
    </div>
  );
};

export default Dash_Recent_Folders;
