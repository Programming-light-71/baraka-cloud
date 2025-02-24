import { X } from "lucide-react";
import { FC } from "react";
import { Button } from "~/components/ui/button";
import { useDisappearUpgradeBanner } from "~/local_store+state/Drive/useDisappearUpgradeBanner";

const UpgradeBanner: FC = () => {
  const { setIsAppearUpgradeBanner } = useDisappearUpgradeBanner();

  return (
    <div className="w-full p-5 relative overflow-hidden my-5 shadow-md h-[203px]  bg-gradient-to-tr from-[#668afb]/20 to-[#b7bdffa8]/20 rounded-[20px] flex justify-between gap-3">
      <div className="md:space-y-2">
        <h1 className=" text-3xl font-normal font-['Praise'] leading-loose">
          Welcome Back Jannie{" "}
        </h1>
        <div className="md:w-[393px]">
          <span className=" text-sm font-semibold font-['Mulish'] leading-snug tracking-wide">
            Get additional 500 GB space for your documents and files. Unlock now
            for more space.
          </span>
        </div>
        <Button className="w-[119px] text-white  h-10 bg-[#6672fb] rounded-lg">
          Upgrade
        </Button>
      </div>

      <div className=" mt-auto">
        <img
          src="/images/upgradeBannerIMG.svg"
          className="w-full h-full object-cover  hidden md:block"
          alt=""
        />

        <Button
          onClick={() => setIsAppearUpgradeBanner()}
          type="button"
          variant="ghost"
          className="z-10 text-[#e8523f] font-bold p-2  rounded-xl  absolute right-2 top-2   font-['Mulish']  "
        >
          <X size={29} />
        </Button>
      </div>
    </div>
  );
};

export default UpgradeBanner;
