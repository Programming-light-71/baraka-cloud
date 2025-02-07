import Dash_FoldersOrFileSection from "../Dash_FoldersOrFileSection";
import { Folder } from "../file&Folder/Folder";

const Dash_Recent_Folders = () => {
  return (
    <div className="w-full my-5">
      <Dash_FoldersOrFileSection
        secName="Folders"
        secBtnNavigate="/drive?index"
      >
        <Folder
          folder={{ name: "Folder Name", files: 0, createdAt: new Date() }}
        />
      </Dash_FoldersOrFileSection>
    </div>
  );
};

export default Dash_Recent_Folders;
