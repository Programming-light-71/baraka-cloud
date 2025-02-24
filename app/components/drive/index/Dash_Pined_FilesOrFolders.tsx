import Dash_FoldersOrFileSection from "../Dash_FoldersOrFileSection";
import { Folder } from "../file&Folder/Folder";

const Dash_Pined_Folders = () => {
  return (
    <div className="w-full my-5">
      <Dash_FoldersOrFileSection secName="Starred" secBtnNavigate="./starred">
        <div className="flex gap-5 flex-wrap" key={Math.random()}>
          <Folder
            folder={{ name: "Family_Doc", files: 1, createdAt: new Date() }}
          />
          <Folder
            folder={{
              name: "Office Videos",
              files: 3,
              createdAt: new Date(),
            }}
          />
          <Folder
            folder={{ name: "My Docs", files: 2, createdAt: new Date() }}
          />
          <Folder
            folder={{
              name: "My Sons Pic Collection",
              files: 5,
              createdAt: new Date(),
            }}
          />
        </div>
      </Dash_FoldersOrFileSection>
    </div>
  );
};

export default Dash_Pined_Folders;
